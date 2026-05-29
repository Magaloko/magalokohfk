// MAGALOKO Telegram-Bot — HFK Verkaufs-Lernsystem
// Pure Node 24 (node:https Long-Polling), keine npm-Dependencies.
// Liest dieselbe data/state.json die das Cockpit schreibt.
// Start: node telegram-bot.mjs
// Config: config/telegram.json  { "token": "123:ABC", "allowedUserIds": [optional] }

import https from "node:https";
import { readFile, appendFile, writeFile, stat, open } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const WEBAPP_URL = "https://relapse-cactus-almanac.ngrok-free.dev/?ngrok-skip-browser-warning=1";
const SERVER_URL = "http://127.0.0.1:4177"; // lokaler MAGALOKO-Server (für RAG-Retrieval)
const configPath = join(root, "config", "telegram.json");
const statePath = join(root, "data", "state.json");
const scoresPath = join(root, "data", "bot-scores.jsonl");
const learningsPath = join(root, "data", "bot-learnings.json");

let TOKEN = "";
let ALLOWED = null; // null = alle erlaubt; sonst Array von numeric user IDs

let ALLOW_ALL = false;
let ADMINS = new Set();  // numeric user IDs
let USERS = {};          // { [userId]: { name, role, modules: [] } }
let CONFIG_RAW = {};     // full config object for re-saving
let INTERNAL_TOKEN = ""; // Shared-Token für Server-RAG-Endpoint

async function loadConfig() {
  const raw = await readFile(configPath, "utf8");
  const cfg = JSON.parse(raw);
  if (!cfg.token) throw new Error("config/telegram.json: 'token' fehlt");
  TOKEN = cfg.token;
  const hasList = Array.isArray(cfg.allowedUserIds) && cfg.allowedUserIds.length > 0;
  ALLOW_ALL = cfg.allowAllUsers === true;
  // Fail-closed (Audit-Finding #3): ohne Allowlist startet der Bot NICHT,
  // außer explizit allowAllUsers:true (mit Warnung).
  if (!hasList && !ALLOW_ALL) {
    throw new Error(
      "SICHERHEIT: config/telegram.json hat keine 'allowedUserIds'.\n" +
      "Der Bot ist sonst für JEDEN nutzbar der ihn findet (Telegram ist NICHT Tailnet-privat).\n" +
      "→ Trage die Telegram-User-IDs deines Teams ein, z.B. \"allowedUserIds\": [123456789].\n" +
      "→ Oder setze bewusst \"allowAllUsers\": true (NICHT empfohlen).\n" +
      "Deine eigene ID bekommst du via @userinfobot."
    );
  }
  // IDs konsequent auf gültige Integer normalisieren (verhindert String/Number-Mismatch)
  const toIds = (arr) => Array.isArray(arr)
    ? [...new Set(arr.map(Number).filter(Number.isInteger))]
    : [];
  ALLOWED = hasList ? toIds(cfg.allowedUserIds) : null;
  CONFIG_RAW = cfg;
  // Admin-IDs (fail-closed: mindestens eine nötig)
  const adminList = toIds(cfg.adminUserIds).length ? toIds(cfg.adminUserIds) : (hasList ? toIds(cfg.allowedUserIds) : []);
  ADMINS = new Set(adminList);
  // Users-Map laden, Keys auf Number normalisieren; ungültige IDs überspringen + warnen
  USERS = {};
  if (cfg.users && typeof cfg.users === "object") {
    for (const [id, info] of Object.entries(cfg.users)) {
      const nid = Number(id);
      if (Number.isInteger(nid)) USERS[nid] = info;
      else console.warn(`[telegram-bot] ungültige User-ID in config ignoriert: ${id}`);
    }
  }
  INTERNAL_TOKEN = cfg.internalApiToken || "";
  if (ALLOW_ALL && !hasList) {
    console.warn("[telegram-bot] ⚠️ WARNUNG: allowAllUsers=true — JEDER kann den Bot nutzen!");
  }
}

async function saveConfig() {
  // CONFIG_RAW aktualisieren aus aktuellen In-Memory-Strukturen
  CONFIG_RAW.allowedUserIds = ALLOWED || [];
  CONFIG_RAW.adminUserIds = [...ADMINS];
  CONFIG_RAW.users = {};
  for (const [id, info] of Object.entries(USERS)) {
    CONFIG_RAW.users[id] = info;
  }
  await writeFile(configPath, JSON.stringify(CONFIG_RAW, null, 2), "utf8");
}

// === MAGALOKO-Datenzugriff (mit Kurzzeit-Cache) ===
// state.json ist ~680KB — Cache verhindert wiederholtes Lesen+Parsen bei jedem Befehl.
// TTL 10s: Daten sind im Bot ohnehin nicht zeitkritisch (Drills/Marken ändern sich selten).
let _dataCache = null;
let _dataTs = 0;
const DATA_TTL = 10000;

async function loadData() {
  const now = Date.now();
  if (_dataCache && now - _dataTs < DATA_TTL) return _dataCache;
  try {
    const raw = await readFile(statePath, "utf8");
    const state = JSON.parse(raw);
    // HFK-Workspace bevorzugen, sonst Top-Level
    const ws = state.workspaces?.hfk?.data || state;
    _dataCache = {
      drills: ws.akademieDrills || [],
      marken: ws.akademieMarken || [],
      einwaende: ws.salesObjections || [],
      personas: ws.salesPersonas || [],
      roleplays: ws.akademieRoleplays || []
    };
    _dataTs = now;
    return _dataCache;
  } catch (e) {
    return { drills: [], marken: [], einwaende: [], personas: [], roleplays: [], _error: e.message };
  }
}

// === Score-Tracking (append-only, kein Konflikt mit Cockpit-State) ===
async function appendScore(rec) {
  try {
    await appendFile(scoresPath, JSON.stringify(rec) + "\n", "utf8");
  } catch (e) {
    console.error("[appendScore]", e.message);
  }
}

async function loadScores() {
  // Nur die letzten ~512 KB der JSONL lesen — verhindert Speicher-/Performance-DoS
  // bei stetig wachsender Score-Datei. Erste (evtl. abgeschnittene) Zeile verwerfen.
  const MAX_TAIL = 512 * 1024;
  try {
    const st = await stat(scoresPath);
    if (st.size <= MAX_TAIL) {
      const raw = await readFile(scoresPath, "utf8");
      return raw.split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    }
    const fh = await open(scoresPath, "r");
    try {
      const buf = Buffer.alloc(MAX_TAIL);
      await fh.read(buf, 0, MAX_TAIL, st.size - MAX_TAIL);
      const text = buf.toString("utf8");
      const lines = text.split(/\r?\n/).filter(Boolean);
      lines.shift(); // erste Zeile ist evtl. mitten abgeschnitten → verwerfen
      return lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    } finally {
      await fh.close();
    }
  } catch {
    return [];
  }
}

async function loadLearnings() {
  try {
    const raw = await readFile(learningsPath, "utf8");
    return JSON.parse(raw);
  } catch { return []; }
}

async function saveLearning(entry) {
  const all = await loadLearnings();
  all.push(entry);
  await writeFile(learningsPath, JSON.stringify(all, null, 2), "utf8");
}

function findRelevantLearnings(question, learnings) {
  const q = question.toLowerCase();
  return learnings.filter(l =>
    (l.keywords || []).some(kw => q.includes(kw.toLowerCase())) ||
    q.includes((l.topic || "").toLowerCase())
  );
}

function tgUserName(from) {
  if (!from) return "Unbekannt";
  return [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || ("User" + from.id);
}

// === Telegram-API ===
// Keep-Alive-Agents: vermeiden TLS-Handshake (~200ms) pro Request.
// Getrennte Agents: Long-Poll (getUpdates, 50s) blockiert NICHT die Sende-Sockets.
const apiAgent = new https.Agent({ keepAlive: true, maxSockets: 16, keepAliveMsecs: 30000 });
const pollAgent = new https.Agent({ keepAlive: true, maxSockets: 2, keepAliveMsecs: 60000 });

function tgApi(method, params) {
  const agent = method === "getUpdates" ? pollAgent : apiAgent;
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(params || {});
    const req = https.request({
      hostname: "api.telegram.org",
      path: `/bot${TOKEN}/${method}`,
      method: "POST",
      agent,
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ ok: false, raw: data }); }
      });
    });
    req.on("error", reject);
    // Sende-Requests bekommen ein 15s-Timeout (Long-Poll ausgenommen)
    if (method !== "getUpdates") {
      req.setTimeout(15000, () => req.destroy(new Error(`tgApi ${method} timeout`)));
    }
    req.write(body);
    req.end();
  });
}

const send = (chatId, text, extra = {}) =>
  tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });

const BACK_KB = { reply_markup: { inline_keyboard: [[{ text: "⬅️ Menü", callback_data: "menu|main" }]] } };

// === Hilfsfunktionen ===
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// === Quiz-System — interaktives Multi-Choice-Training ===
const userSessions = {};    // { userId: { questions, idx, score, type } }
const dailyChallenge = {};  // { userId: { date, done, score } }

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const QUIZ_LETTERS = ["A", "B", "C", "D"];

// Drill → Quiz-Frage
function makeDrillQ(drills, chooser = pick) {
  const pool = drills.filter(d =>
    (d.optionen || []).length >= 2 &&
    d.optionen.some(o => o.ist_richtig === true || (o.punkte || 0) > 0)
  );
  if (!pool.length) return null;
  const drill = chooser(pool);
  const opts = shuffleArr(drill.optionen.map(o => ({
    text: (o.text || "").slice(0, 110),
    correct: o.ist_richtig === true || (o.punkte || 0) > 0,
    feedback: o.feedback || ""
  })));
  if (!opts.some(o => o.correct)) return null;
  return {
    type: "drill", label: "⚡ Drill", itemId: drill.id || drill.frage || "",
    frage: `⚡ <b>Drill — ${esc(drill.marke || "allgemein")}</b>\n\n${esc(drill.frage || "")}`,
    opts,
    muster: drill.musterantwort ? `\n📝 <b>Musterantwort:</b> ${esc(drill.musterantwort)}` : ""
  };
}

// Einwand → "Welche Antwort ist die beste?"
function makeEinwandQ(einwaende, chooser = pick) {
  const pool = einwaende.filter(e => e.antwort && e.antwort.trim().length >= 8);
  if (pool.length < 4) return null;
  const target = chooser(pool);
  const wrong3 = shuffleArr(pool.filter(e => e !== target)).slice(0, 3);
  const opts = shuffleArr([
    { text: target.antwort.slice(0, 110), correct: true, feedback: `✓ Beste Strategie bei „${esc(target.kategorie || "diesem Einwand")}"` },
    ...wrong3.map(e => ({ text: e.antwort.slice(0, 110), correct: false, feedback: "✗ Das passt zu einem anderen Einwand-Typ." }))
  ]);
  return {
    type: "einwand_mc", label: "💬 Einwand", itemId: target.id || target.einwand || "",
    frage: `💬 <b>Einwand-Training</b>\n\nKunde sagt:\n<i>„${esc(target.einwand)}"</i>\n\n<b>Welche Antwort ist am besten?</b>`,
    opts,
    muster: target.beweis ? `\n💡 ${esc(target.beweis.slice(0, 150))}` : ""
  };
}

// Marken-Quiz → Herkunftsland erraten
function makeMarkenQ(marken, chooser = pick) {
  const pool = marken.filter(m => m.herkunft?.land);
  if (pool.length < 4) return null;
  const target = chooser(pool);
  const allLaender = [...new Set(pool.map(m => m.herkunft.land))];
  const wrongLaender = shuffleArr(allLaender.filter(l => l !== target.herkunft.land)).slice(0, 3);
  if (wrongLaender.length < 3) return null;
  const opts = shuffleArr([
    {
      text: target.herkunft.land,
      correct: true,
      feedback: `✓ ${esc(target.name)} kommt aus ${esc(target.herkunft.land)}${target.herkunft.gruendung ? ` (gegr. ${esc(String(target.herkunft.gruendung))})` : ""}`
    },
    ...wrongLaender.map(l => ({ text: l, correct: false, feedback: `✗ ${esc(target.name)} kommt aus ${esc(target.herkunft.land)}.` }))
  ]);
  return {
    type: "marken_quiz", label: "🏷 Marke", itemId: target.id || target.name || "",
    frage: `🏷 <b>Marken-Quiz</b>\n\nAus welchem Land kommt <b>${esc(target.name)}</b>?\n<i>${esc((target.philosophie || "").slice(0, 60))}</i>`,
    opts,
    muster: target.philosophie ? `\n<i>„${esc(target.philosophie.slice(0, 120))}"</i>` : ""
  };
}

// Gemischten Quiz aus allen verfügbaren Daten generieren
async function generateQuiz(n = 5) {
  const d = await loadData();
  const generators = [];
  if (d.drills.length >= 2) generators.push(() => makeDrillQ(d.drills));
  if (d.einwaende.length >= 4) generators.push(() => makeEinwandQ(d.einwaende));
  if (d.marken.length >= 4) generators.push(() => makeMarkenQ(d.marken));
  if (!generators.length) return [];
  const questions = [];
  let attempts = 0;
  while (questions.length < n && attempts < n * 8) {
    attempts++;
    const q = pick(generators)();
    if (q) questions.push(q);
  }
  return questions.slice(0, n);
}

// === Adaptives Lernen (nach Hooshyar et al. 2021 — adaptives Lernspiel) ===
// Score-Typ → Lern-Thema normalisieren (drill/einwand/marken).
function scoreTopic(rec) {
  const t = String(rec.type || "");
  if (t === "drill" || t === "quiz_drill") return "drill";
  if (t === "einwand_mc" || t === "quiz_einwand_mc") return "einwand";
  if (t === "marken_quiz" || t === "quiz_marken_quiz") return "marken";
  return null;
}
const TOPIC_LABEL = { drill: "⚡ Drills", einwand: "💬 Einwände", marken: "🏷 Marken" };

// Skill-Profil aus Score-Historie. Studie: kurz- UND langfristiges Können einbeziehen.
async function computeSkillProfile(userId) {
  const uid = Number(userId);
  const scores = (await loadScores()).filter((r) => Number(r.uid) === uid);
  const buckets = { drill: [], einwand: [], marken: [] };
  for (const r of scores) {
    const tp = scoreTopic(r);
    if (tp) buckets[tp].push(r.correct === true);
  }
  const profile = {};
  for (const [tp, arr] of Object.entries(buckets)) {
    if (!arr.length) { profile[tp] = { total: 0, correct: 0, skill: 0.5, seen: false }; continue; }
    const total = arr.length, correct = arr.filter(Boolean).length;
    const longTerm = correct / total;
    const recent = arr.slice(-10);
    const shortTerm = recent.filter(Boolean).length / recent.length;
    profile[tp] = { total, correct, skill: 0.6 * longTerm + 0.4 * shortTerm, seen: true };
  }
  return profile;
}

// === Item-genaues Spaced Repetition (Leitner) ===
// Score-Records → pro Item (Drill-ID/Einwand-ID/Marken-Name) die Antwort-Historie.
// drill nutzt das bestehende rec.drillId; quiz-Records das neue rec.itemId.
async function buildItemHistory(userId) {
  const uid = Number(userId);
  const scores = (await loadScores()).filter((r) => Number(r.uid) === uid);
  const hist = { drill: new Map(), einwand: new Map(), marken: new Map() };
  for (const r of scores) {
    const tp = scoreTopic(r);
    if (!tp) continue;
    const id = r.itemId || r.drillId; // drill: drillId; quiz_*: itemId
    if (!id) continue;
    const ts = Date.parse(r.ts) || 0;
    if (!hist[tp].has(id)) hist[tp].set(id, []);
    hist[tp].get(id).push({ correct: r.correct === true, ts });
  }
  for (const m of Object.values(hist)) for (const arr of m.values()) arr.sort((a, b) => a.ts - b.ts);
  return hist;
}

// SR-Gewicht eines Items: nie gesehen = normal, zuletzt falsch = hoch (bald wiederholen),
// gemeistert = niedrig mit wachsendem Intervall (1→2→4→8 Tage), bei Fälligkeit wieder hoch.
function srWeight(historyArr, nowMs) {
  if (!historyArr || !historyArr.length) return 1.0;
  const last = historyArr[historyArr.length - 1];
  if (!last.correct) return 2.5;
  let consec = 0;
  for (let i = historyArr.length - 1; i >= 0 && historyArr[i].correct; i--) consec++;
  const intervalDays = Math.pow(2, consec); // 1,2,4,8 …
  const daysSince = (nowMs - last.ts) / 86400000;
  return daysSince >= intervalDays ? 1.2 : 0.25;
}

// Gewichteter Zufalls-Picker über einen Pool anhand SR-Historie.
function makeSrChooser(histMap, getId, nowMs) {
  return (pool) => {
    if (!pool.length) return pool[0];
    const weights = pool.map((it) => srWeight(histMap.get(getId(it)), nowMs));
    const sum = weights.reduce((s, w) => s + w, 0);
    if (sum <= 0) return pool[Math.floor(Math.random() * pool.length)];
    let r = Math.random() * sum;
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  };
}

// Adaptive Frage-Generierung: schwache Themen häufiger (Gewicht = 1 − skill),
// starke Themen behalten Mindestgewicht. Innerhalb des Themas: Spaced Repetition pro Item.
async function generateAdaptiveQuiz(profile, n = 5, itemHist = null) {
  const d = await loadData();
  const nowMs = Date.now();
  const drillChooser = itemHist ? makeSrChooser(itemHist.drill, (x) => x.id || x.frage || "", nowMs) : pick;
  const einwandChooser = itemHist ? makeSrChooser(itemHist.einwand, (x) => x.id || x.einwand || "", nowMs) : pick;
  const markenChooser = itemHist ? makeSrChooser(itemHist.marken, (x) => x.id || x.name || "", nowMs) : pick;
  const avail = [];
  if (d.drills.length >= 2) avail.push({ topic: "drill", gen: () => makeDrillQ(d.drills, drillChooser) });
  if (d.einwaende.length >= 4) avail.push({ topic: "einwand", gen: () => makeEinwandQ(d.einwaende, einwandChooser) });
  if (d.marken.length >= 4) avail.push({ topic: "marken", gen: () => makeMarkenQ(d.marken, markenChooser) });
  if (!avail.length) return [];
  const weightOf = (topic) => Math.max(0.15, 1 - (profile[topic]?.skill ?? 0.5));
  const questions = [];
  let attempts = 0;
  while (questions.length < n && attempts < n * 10) {
    attempts++;
    const weights = avail.map((a) => weightOf(a.topic));
    const sum = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * sum, chosen = avail[avail.length - 1];
    for (let i = 0; i < avail.length; i++) { r -= weights[i]; if (r <= 0) { chosen = avail[i]; break; } }
    const q = chosen.gen();
    if (q) questions.push(q);
  }
  return questions.slice(0, n);
}

// Kurzer Hinweis: schwächstes Thema mit Daten — macht die Adaptivität sichtbar.
function adaptiveFocusNote(profile) {
  const seen = Object.entries(profile).filter(([, v]) => v.seen);
  if (!seen.length) return "🎯 <i>Adaptiv: nach ein paar Runden fokussiert das Quiz automatisch deine schwächsten Themen.</i>";
  const weakest = seen.sort((a, b) => a[1].skill - b[1].skill)[0];
  return `🎯 <i>Adaptiv — Fokus auf dein schwächstes Thema: ${TOPIC_LABEL[weakest[0]]} (${Math.round(weakest[1].skill * 100)} %). Fragen, die du zuletzt falsch hattest, kommen gezielt wieder.</i>`;
}

// Gestufter Hinweis (verrät die Lösung NICHT) — Scaffolding nach Studien-Prinzip.
function quizHint(q) {
  const t = q.type;
  if (t === "einwand_mc") return "💡 <b>Tipp:</b> Welche Antwort geht auf die <i>eigentliche Sorge</i> des Kunden ein — ohne dich zu rechtfertigen oder den Preis zu verteidigen?";
  if (t === "marken_quiz") return "💡 <b>Tipp:</b> Denk an die Design-Tradition & Herkunft der Marke — wo ist dieser Stil typisch?";
  return "💡 <b>Tipp:</b> Überleg die Kernbotschaft / das stärkste Verkaufsargument — die Antwort mit dem größten Kundennutzen.";
}

// Score formatieren (Teilpunkte mit Komma): 3 → "3", 3.5 → "3,5"
function fmtScore(s) { return Number.isInteger(s) ? String(s) : s.toFixed(1).replace(".", ","); }

// === Pre/Post-Check (nach Hooshyar et al. 2021 — Pre→Training→Post-Design) ===
// Speichert Fragen des Pre-Checks damit Post-Check DIESELBEN Fragen nutzt → Vergleichbarkeit.
// Kein Hint im Check-Modus — das ist Assessment, kein Training.
const checkStore = {};
// { [userId]: { preTs, questions: [...], preScore, preTopics, postTs?, postScore?, postTopics? } }

const CHECK_MIN_DAYS = 7; // Mindestabstand Pre → Post (Studie: ~2 Wochen)
const CHECK_N = 9;        // 3 je Thema → sauber vergleichbar

// Feste Verteilung: 3×Drill + 3×Einwand + 3×Marke → vergleichbar Pre vs. Post
async function generateCheckQuestions() {
  const d = await loadData();
  const qs = [];
  // Je Thema max 6 Versuche um 3 zu bekommen
  for (let i = 0; i < 6 && qs.filter(q => q.type === "drill").length < 3; i++) {
    const q = makeDrillQ(d.drills); if (q) qs.push(q);
  }
  for (let i = 0; i < 6 && qs.filter(q => q.type === "einwand_mc").length < 3; i++) {
    const q = makeEinwandQ(d.einwaende); if (q) qs.push(q);
  }
  for (let i = 0; i < 6 && qs.filter(q => q.type === "marken_quiz").length < 3; i++) {
    const q = makeMarkenQ(d.marken); if (q) qs.push(q);
  }
  return shuffleArr(qs).slice(0, CHECK_N);
}

function checkTopicScores(questions, results) {
  // results: [{correct: bool}] parallel zu questions
  const topics = { drill: { c: 0, t: 0 }, einwand_mc: { c: 0, t: 0 }, marken_quiz: { c: 0, t: 0 } };
  questions.forEach((q, i) => {
    const tp = q.type;
    if (!topics[tp]) return;
    topics[tp].t++;
    if (results[i]?.correct) topics[tp].c++;
  });
  return topics;
}

function checkTopicLine(label, icon, pre, post) {
  const pct = (v) => v.t ? Math.round(v.c / v.t * 100) : null;
  const prePct = pct(pre), postPct = pct(post);
  if (prePct === null) return null;
  if (postPct === null) return `${icon} ${label}: <b>${prePct}%</b> (${pre.c}/${pre.t}) — kein Post-Check`;
  const diff = postPct - prePct;
  const arrow = diff > 0 ? `📈 +${diff}%` : diff < 0 ? `📉 ${diff}%` : `➡️ ±0%`;
  return `${icon} ${label}: ${prePct}% → <b>${postPct}%</b> (${arrow})`;
}

async function cmdCheck(chatId, userId, from) {
  const stored = checkStore[userId];
  const now = Date.now();
  // Post-Check: Pre existiert + Mindestabstand erreicht + kein Post vorhanden
  if (stored?.preTs && !stored.postTs) {
    const daysSince = (now - stored.preTs) / 86400000;
    if (daysSince < CHECK_MIN_DAYS) {
      const available = new Date(stored.preTs + CHECK_MIN_DAYS * 86400000).toLocaleDateString("de-AT");
      return send(chatId,
        `🧪 <b>Lern-Check</b>\n\nDein <b>Pre-Check</b> war am ${new Date(stored.preTs).toLocaleDateString("de-AT")}.\n\n` +
        `Der Post-Check ist ab <b>${available}</b> verfügbar — dann siehst du deinen Lernzuwachs!\n\n` +
        `<i>Übe bis dahin täglich mit /quiz und /tagesaufgabe.</i>`, BACK_KB);
    }
    // Post-Check starten mit denselben Fragen
    await send(chatId,
      `🧪 <b>Post-Check</b> (${new Date(stored.preTs).toLocaleDateString("de-AT")} → heute)\n\n` +
      `Dieselben ${stored.questions.length} Fragen wie beim Pre-Check — zeig deinen Fortschritt!\n` +
      `<i>Kein Hint, kein zweiter Versuch — ehrliche Messung.</i>`);
    userSessions[userId] = { questions: stored.questions, idx: 0, score: 0, type: "post-check", startTs: now, results: [] };
    const { text, keyboard } = renderQuizMsg(stored.questions[0], 0, stored.questions.length);
    return tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: keyboard });
  }
  // Post-Check bereits erledigt
  if (stored?.postTs) {
    return send(chatId,
      `✅ <b>Lern-Check abgeschlossen!</b>\n\nPre: ${new Date(stored.preTs).toLocaleDateString("de-AT")} → Post: ${new Date(stored.postTs).toLocaleDateString("de-AT")}\n\n` +
      `Nutze <b>/fortschritt</b> für die vollständige Auswertung.`, BACK_KB);
  }
  // Pre-Check starten
  const questions = await generateCheckQuestions();
  if (questions.length < 3) return send(chatId, "❌ Zu wenige Daten für einen Check. Drills, Einwände und Marken müssen verfügbar sein.", BACK_KB);
  checkStore[userId] = { preTs: now, questions, preScore: null, preTopics: null };
  await send(chatId,
    `🧪 <b>Wissens-Check — Eingangstest</b>\n\n` +
    `${questions.length} Fragen aus Drills, Einwänden und Marken.\n` +
    `<b>Kein Hint, kein zweiter Versuch</b> — ehrliche Bestandsaufnahme.\n\n` +
    `Nach ${CHECK_MIN_DAYS}+ Tagen Training machst du denselben Check nochmal\n` +
    `und siehst deinen <b>messbaren Lernzuwachs</b>. Los:`);
  userSessions[userId] = { questions, idx: 0, score: 0, type: "pre-check", startTs: now, results: [] };
  const { text, keyboard } = renderQuizMsg(questions[0], 0, questions.length);
  return tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: keyboard });
}

async function cmdFortschritt(chatId, userId, userName) {
  const profile = await computeSkillProfile(userId);
  const stored = checkStore[userId];
  const lines = [`<b>📈 Lern-Fortschritt — ${esc(userName)}</b>\n`];
  // Skill-Profil
  lines.push("<b>Aktuelles Skill-Profil:</b>");
  for (const [tp, v] of Object.entries(profile)) {
    const bar = "█".repeat(Math.round(v.skill * 10)) + "░".repeat(10 - Math.round(v.skill * 10));
    const seen = v.seen ? `${Math.round(v.skill * 100)}% (${v.correct}/${v.total})` : "noch kein Training";
    lines.push(`${TOPIC_LABEL[tp]}: <code>${bar}</code> ${seen}`);
  }
  // Check-Vergleich
  if (stored?.postTs) {
    lines.push("\n<b>Pre→Post-Check Vergleich:</b>");
    const pm = checkTopicLine("Drills", "⚡", stored.preTopics?.drill || { c: 0, t: 0 }, stored.postTopics?.drill || { c: 0, t: 0 });
    const pe = checkTopicLine("Einwände", "💬", stored.preTopics?.einwand_mc || { c: 0, t: 0 }, stored.postTopics?.einwand_mc || { c: 0, t: 0 });
    const pm2 = checkTopicLine("Marken", "🏷", stored.preTopics?.marken_quiz || { c: 0, t: 0 }, stored.postTopics?.marken_quiz || { c: 0, t: 0 });
    [pm, pe, pm2].filter(Boolean).forEach(l => lines.push(l));
    const prePct = stored.preScore != null ? Math.round(stored.preScore / stored.questions.length * 100) : "?";
    const postPct = stored.postScore != null ? Math.round(stored.postScore / stored.questions.length * 100) : "?";
    lines.push(`\nGesamt: ${prePct}% → <b>${postPct}%</b>`);
  } else if (stored?.preTs && !stored.postTs) {
    const available = new Date(stored.preTs + CHECK_MIN_DAYS * 86400000).toLocaleDateString("de-AT");
    lines.push(`\n<i>Post-Check verfügbar ab ${available} — dann siehst du deinen Zuwachs!</i>`);
  } else {
    lines.push("\n<i>Noch kein Check gemacht. Starte mit /check für deinen Eingangstest.</i>");
  }
  return send(chatId, lines.join("\n"), BACK_KB);
}

// Quiz-Frage als Telegram-Nachricht (A/B/C/D Buttons)
function renderQuizMsg(q, qi, total, streak = 0) {
  const fill = "▓".repeat(qi);
  const empty = "░".repeat(total - qi);
  const streakTag = streak >= 2 ? `  🔥${streak}` : "";
  const optLines = q.opts.map((o, i) => `${QUIZ_LETTERS[i]}) ${o.text}`).join("\n");
  const text = `${fill}${empty} <b>${qi + 1}/${total}</b> · ${q.label || ""}${streakTag}\n\n${q.frage}\n\n${optLines}`;
  const keyboard = {
    inline_keyboard: [
      q.opts.map((_, i) => ({ text: QUIZ_LETTERS[i], callback_data: `quiz_ans|${qi}|${i}` }))
    ]
  };
  return { text: text.slice(0, 4000), keyboard };
}

async function cmdQuiz(chatId, userId, nArg) {
  const n = Math.min(Math.max(parseInt(nArg || "5", 10) || 5, 3), 10);
  const profile = await computeSkillProfile(userId);
  const itemHist = await buildItemHistory(userId);
  const questions = await generateAdaptiveQuiz(profile, n, itemHist);
  if (!questions.length) return send(chatId, "❌ Keine Quiz-Fragen verfügbar. Drills, Einwände und Marken müssen geladen sein.", BACK_KB);
  userSessions[userId] = { questions, idx: 0, score: 0, streak: 0, best: 0, type: "quiz", startTs: Date.now() };
  await send(chatId, adaptiveFocusNote(profile));
  const { text, keyboard } = renderQuizMsg(questions[0], 0, n);
  return tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: keyboard });
}

async function cmdTagesaufgabe(chatId, userId) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = dailyChallenge[userId];
  if (existing?.date === today && existing.done) {
    const s = existing.score;
    const e = s === 3 ? "🏆 Perfekt!" : s >= 2 ? "🎯 Stark!" : "📚 Weiter üben!";
    return send(chatId,
      `☀️ <b>Tages-Aufgabe — ${today}</b>\n\nHeute bereits erledigt!\n\n` +
      `Score: <b>${s}/3</b> ${e}\n\n<i>Neue Fragen gibt's morgen früh.</i>`,
      { ...BACK_KB, parse_mode: "HTML" });
  }
  const profile = await computeSkillProfile(userId);
  const itemHist = await buildItemHistory(userId);
  const questions = await generateAdaptiveQuiz(profile, 3, itemHist);
  if (!questions.length) return send(chatId, "❌ Keine Fragen verfügbar.", BACK_KB);
  userSessions[userId] = { questions, idx: 0, score: 0, streak: 0, best: 0, type: "tagesaufgabe", startTs: Date.now() };
  dailyChallenge[userId] = { date: today, done: false, score: 0 };
  await send(chatId,
    `☀️ <b>Tages-Aufgabe — ${today}</b>\n\n` +
    `3 gemischte Fragen aus Drills, Einwänden und Marken-Wissen.\n` +
    `<i>Jeden Tag neue Herausforderungen — bleib scharf!</i>`);
  const { text, keyboard } = renderQuizMsg(questions[0], 0, 3);
  return tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: keyboard });
}

async function handleQuizAnswer(cbq) {
  const parts = (cbq.data || "").split("|");
  const qi = parseInt(parts[1], 10);
  const oi = parseInt(parts[2], 10);
  const userId = cbq.from?.id;
  const cid = cbq.message?.chat?.id;
  const session = userSessions[userId];
  if (!session || isNaN(qi) || isNaN(oi)) {
    return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "⚠️ Session abgelaufen — /quiz für ein neues Quiz" });
  }
  if (qi !== session.idx) {
    return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Bereits beantwortet." });
  }
  const q = session.questions[qi];
  const opt = q?.opts?.[oi];
  if (!opt) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id });
  const correct = opt.correct === true;
  const attempt = session.attempt || 0; // 0 = erster Versuch
  const total = session.questions.length;
  const isCheck = session.type === "pre-check" || session.type === "post-check";

  // --- Erster Versuch FALSCH → Hinweis + zweite Chance (NUR im Training, NICHT im Check) ---
  if (!correct && attempt === 0 && !isCheck) {
    session.attempt = 1;
    tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Fast! Hinweis beachten 💡" }).catch(() => {});
    await send(cid, `❌ <b>Nicht ganz.</b>\n\n${quizHint(q)}\n\n<i>Versuch's nochmal — du schaffst das:</i>`);
    const { text: rText, keyboard: rKb } = renderQuizMsg(q, qi, total, session.streak || 0);
    return tgApi("sendMessage", { chat_id: cid, text: rText, parse_mode: "HTML", reply_markup: rKb });
  }

  // --- Auflösung: erster Versuch richtig ODER zweiter Versuch (egal ob richtig/falsch) ---
  const firstTry = attempt === 0;
  const points = correct ? (firstTry ? 1 : 0.5) : 0; // Teilpunkt für 2. Versuch (Motivation)
  session.score = (session.score || 0) + points;
  session.idx++;
  session.attempt = 0; // für nächste Frage zurücksetzen
  // Streak (nur Training, nicht Check): nur makelloser Erstversuch zählt = "im Flow".
  // Jeder Fehlversuch (auch im 2. Anlauf gerettet) setzt die Serie zurück.
  if (!isCheck) {
    if (correct && firstTry) {
      session.streak = (session.streak || 0) + 1;
      session.best = Math.max(session.best || 0, session.streak);
    } else {
      session.streak = 0;
    }
  }
  const streak = session.streak || 0;
  const streakTag = (!isCheck && correct && firstTry && streak >= 2) ? ` 🔥${streak}` : "";
  tgApi("answerCallbackQuery", {
    callback_query_id: cbq.id,
    text: correct ? (firstTry ? "✓ Richtig!" + streakTag : "✓ Im 2. Versuch!") : "✗ Leider falsch"
  }).catch(() => {});
  // Skill-Signal (Prio 1): Mastery = erster Versuch richtig → ehrliches adaptives Profil
  // Im Check-Modus: jede Antwort direkt loggen (kein Teilpunkt, kein 2. Versuch)
  appendScore({
    ts: new Date().toISOString(), uid: userId, name: tgUserName(cbq.from),
    type: isCheck ? session.type : "quiz_" + (q.type || "mixed"),
    itemId: q.itemId || "",
    correct: isCheck ? correct : (correct && firstTry)
  });
  // Ergebnis der aktuellen Frage für Check-Vergleich merken
  if (isCheck && Array.isArray(session.results)) session.results.push({ correct });
  const correctOpt = q.opts.find(o => o.correct);
  const reveal = (!correct && correctOpt) ? `\n\n✅ <b>Richtig wäre:</b> ${esc(correctOpt.text)}` : "";
  const head = isCheck
    ? (correct ? "✅ Richtig!" : "❌ Leider falsch.")
    : correct ? (firstTry ? "✅ Richtig!" : "✅ Richtig — im 2. Versuch (½ Punkt)") : "❌ Leider falsch.";
  // Momentum-Meldung bei Serien-Meilensteinen (nur Training)
  let momentum = "";
  if (!isCheck && correct && firstTry) {
    if (streak === 3) momentum = "\n\n🔥 <b>3 in Folge — du bist im Flow!</b>";
    else if (streak === 5) momentum = "\n\n🔥🔥 <b>5er-Serie! Richtig stark!</b>";
    else if (streak >= 7) momentum = `\n\n🔥🔥🔥 <b>${streak} in Folge — unaufhaltsam!</b>`;
    else if (streak >= 2) momentum = `\n\n🔥 <b>${streak} in Folge</b>`;
  }
  const feedbackText = `${head}\n\n${esc(opt.feedback || (correct ? "Gut gemacht!" : "Nicht ganz."))}${reveal}${q.muster || ""}${momentum}`;
  if (session.idx >= total) {
    const score = session.score;
    const bestStreak = session.best || 0; // vor delete sichern
    const pct = Math.round((score / total) * 100);
    const perfect = score === total;
    const emoji = perfect ? "🎉" : pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : pct >= 40 ? "💪" : "📚";
    const msg = perfect ? "🎉 Perfekt — alles richtig!" : pct >= 80 ? "Ausgezeichnet — du bist voll im Flow!" : pct >= 60 ? "Gut! Wiederhol die Fehler-Themen." : "Weiter dran — du wirst besser!";
    if (session.type === "tagesaufgabe" && dailyChallenge[userId]) {
      dailyChallenge[userId].done = true;
      dailyChallenge[userId].score = score;
      await appendScore({ ts: new Date().toISOString(), uid: userId, name: tgUserName(cbq.from), type: "tagesaufgabe", score, total });
    }
    // === Pre/Post-Check Abschluss → checkStore aktualisieren ===
    if (isCheck && checkStore[userId]) {
      const topics = checkTopicScores(session.questions, session.results || []);
      const ts = Date.now();
      if (session.type === "pre-check") {
        checkStore[userId].preScore = score;
        checkStore[userId].preTopics = topics;
        checkStore[userId].questions = session.questions; // für Post-Check-Replay
        appendScore({ ts: new Date().toISOString(), uid: userId, name: tgUserName(cbq.from), type: "pre-check", score, total, topics });
      } else {
        checkStore[userId].postScore = score;
        checkStore[userId].postTopics = topics;
        checkStore[userId].postTs = ts;
        appendScore({ ts: new Date().toISOString(), uid: userId, name: tgUserName(cbq.from), type: "post-check", score, total, topics });
      }
    }
    delete userSessions[userId];
    if (isCheck) {
      const stored = checkStore[userId];
      let checkResult = `${feedbackText}\n\n━━━━━━━━━━━━━━\n${emoji} <b>${session.type === "pre-check" ? "Eingangstest" : "Abschlusstest"} abgeschlossen!</b>\n\nRichtig: <b>${score}/${total}</b> (${pct}%)\n\n`;
      if (session.type === "pre-check") {
        checkResult += `<i>Dein Ausgangslevel ist gespeichert. Übe täglich mit /quiz und /tagesaufgabe.\nNach ${CHECK_MIN_DAYS}+ Tagen zeigt dir /check deinen Lernzuwachs!</i>`;
      } else if (stored?.preScore != null) {
        const gain = score - stored.preScore;
        const gainPct = pct - Math.round(stored.preScore / total * 100);
        const gainEmoji = gainPct > 10 ? "🚀" : gainPct > 0 ? "📈" : gainPct === 0 ? "➡️" : "📉";
        checkResult += `${gainEmoji} <b>Lernzuwachs: ${gainPct > 0 ? "+" : ""}${gainPct}%</b> (${stored.preScore}/${total} → ${score}/${total})\n\nDetails mit /fortschritt`;
      }
      return tgApi("sendMessage", {
        chat_id: cid, text: checkResult.slice(0, 4000), parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "📈 Mein Fortschritt", callback_data: "menu|fortschritt" }, { text: "⬅️ Menü", callback_data: "menu|main" }]] }
      });
    }
    const bestLine = bestStreak >= 2 ? `\n🔥 Beste Serie: <b>${bestStreak}</b> in Folge` : "";
    const resultText =
      `${feedbackText}\n\n━━━━━━━━━━━━━━\n` +
      `${emoji} <b>Quiz abgeschlossen!</b>\n\n` +
      `Richtig: <b>${fmtScore(score)}/${total}</b> (${pct}%)${bestLine}\n${msg}`;
    return tgApi("sendMessage", {
      chat_id: cid, text: resultText.slice(0, 4000), parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [{ text: "🔄 Neues Quiz", callback_data: "menu|quiz" }, { text: "☀️ Tages-Aufgabe", callback_data: "menu|tagesaufgabe" }],
        [{ text: "⬅️ Menü", callback_data: "menu|main" }]
      ]}
    });
  }
  const nextQ = session.questions[session.idx];
  const { text: nextText, keyboard: nextKb } = renderQuizMsg(nextQ, session.idx, total, session.streak || 0);
  await send(cid, feedbackText.slice(0, 1000));
  return tgApi("sendMessage", { chat_id: cid, text: nextText, parse_mode: "HTML", reply_markup: nextKb });
}

function isAllowed(userId) {
  const uid = Number(userId);
  if (!Number.isInteger(uid)) return false; // fehlende/ungültige ID → fail-closed
  if (ALLOW_ALL) return true;
  if (!ALLOWED && !(uid in USERS)) return false; // fail-closed
  // check USERS map first (users added via /adduser), then allowedUserIds list
  if (uid in USERS) return true;
  if (!ALLOWED) return false;
  const ok = ALLOWED.includes(uid);
  if (!ok) console.warn(`[telegram-bot] Zugriff verweigert für User-ID ${uid} (nicht in allowedUserIds)`);
  return ok;
}

function isAdmin(userId) {
  const uid = Number(userId);
  return Number.isInteger(uid) && ADMINS.has(uid);
}

// SICHERHEIT: Bot ausschließlich im 1:1-Privatchat. Verhindert dass in Gruppen
// (in die der Bot eingeladen wurde) nicht-zugelassene Mitglieder Bot-Antworten
// mitlesen oder anonyme Gruppen-Admins (from.id fehlt) reinrutschen.
function isPrivateChat(chat) {
  return chat?.type === "private";
}

// Gibt aktive Module für einen User zurück.
// Admin → alle Module. Mitarbeiter → akademie + freigeschaltete Extras.
// Grantierbare Module für Mitarbeiter: produkt, ai
// cockpit (Dashboard/Heute/Bestand/Stephan) ist nur für Admins.
const ALL_MODULES = ["akademie", "produkt", "ai"];
function getUserModules(userId) {
  if (isAdmin(userId)) return ALL_MODULES;
  const u = USERS[userId];
  return ["akademie", ...(u?.modules || [])];
}

function hasModule(userId, mod) {
  return isAdmin(userId) || getUserModules(userId).includes(mod);
}

// === Command-Handler ===
async function cmdStart(chatId, userId) {
  const admin = isAdmin(userId);
  const lines = [
    "🎓 <b>HFK Verkaufs-Akademie</b>",
    "",
    "Trainiere Produktwissen & Verkauf — direkt im Chat.",
    "",
    "<b>🎯 Training:</b>",
    "/drill — Zufalls-Quiz mit Antwort-Buttons",
    "/quiz — Gemischtes Quiz (3–10 Fragen, z.B. <code>/quiz 7</code>)",
    "/tagesaufgabe — Tägliche 3-Fragen-Challenge ☀️",
    "/marke <i>LIEWOOD</i> — Marken-Steckbrief",
    "/einwand <i>preis</i> — Einwand-Antwort suchen",
    "/persona <i>anna</i> — Kunden-Typ",
    "/rollenspiel — Zufalls-Trainingsszenario",
    "/score — dein Lern-Fortschritt & Serie",
    "/lern — dem Bot etwas beibringen"
  ];
  lines.push("/check — Wissens-Check (Eingangstest → Training → Lernzuwachs)");
  lines.push("/fortschritt — Dein Skill-Profil & Lernzuwachs");
  if (hasModule(userId, "produkt")) lines.push("/produkt <i>frage</i> — Produkt-Infos (Preis, Bestand, Marke) 🔍");
  if (hasModule(userId, "ai")) lines.push("/frag <i>…</i> — KI-Assistent");
  if (admin) {
    lines.push(
      "",
      "<b>⚙️ Admin:</b>",
      "/admin — Panel (User & Rollen verwalten)",
      "/users — alle Nutzer auflisten",
      "/adduser <i>ID Name</i> — User hinzufügen",
      "/setrole <i>ID admin|mitarbeiter</i> — Rolle ändern",
      "/grant <i>ID produkt|ai</i> · /revoke <i>ID …</i>"
    );
  }
  lines.push("", "<i>Daten kommen live aus MAGALOKO.</i>");
  await send(chatId, lines.join("\n"));
  return sendMenu(chatId, userId);
}

// Modul-Sperre: einheitliche Ablehnung
function denyModule(chatId, modLabel) {
  return send(chatId, `🔒 <b>${modLabel}</b> ist für deine Rolle nicht freigeschaltet.\n\nNutze deine Trainings-Befehle: /drill /quiz /marke /einwand\n<i>Brauchst du mehr? Frag Mago.</i>`);
}

// Rollen-bewusster App-Einstieg: Admin → volles Cockpit, Produkt-User → nur Produkt-Lookup,
// reiner Mitarbeiter → nur Akademie-Ansicht. KEIN voller Cockpit-Link für Nicht-Admins.
async function cmdApp(chatId, userId) {
  let url, label;
  if (isAdmin(userId)) {
    url = WEBAPP_URL; label = "📱 MAGALOKO Cockpit öffnen";
  } else if (hasModule(userId, "produkt")) {
    url = WEBAPP_URL + "#produkt-lookup"; label = "🔍 Produkt-Lookup öffnen";
  } else {
    url = WEBAPP_URL + "#akademie"; label = "🎓 Akademie öffnen";
  }
  return tgApi("sendMessage", {
    chat_id: chatId,
    text: "🚀 Öffnen:",
    reply_markup: { inline_keyboard: [[{ text: label, web_app: { url } }]] }
  });
}

// Setzt den persistenten Chat-Menü-Button rollengerecht (fire-and-forget).
// Admin → Cockpit, Produkt-User → Produkt-Lookup, reiner Mitarbeiter → Akademie.
function setUserMenuButton(chatId, userId) {
  let btn;
  if (isAdmin(userId)) btn = { type: "web_app", text: "🚀 Cockpit", web_app: { url: WEBAPP_URL } };
  else if (hasModule(userId, "produkt")) btn = { type: "web_app", text: "🔍 Produkt", web_app: { url: WEBAPP_URL + "#produkt-lookup" } };
  else btn = { type: "web_app", text: "🎓 Akademie", web_app: { url: WEBAPP_URL + "#akademie" } };
  tgApi("setChatMenuButton", { chat_id: chatId, menu_button: btn }).catch(() => {});
}

async function sendMenu(chatId, userId) {
  setUserMenuButton(chatId, userId); // Button rollengerecht synchronisieren
  const rows = [
    [
      { text: "⚡ Drill", callback_data: "menu|drill" },
      { text: "🏷️ Marke", callback_data: "menu|marken" },
      { text: "💬 Einwand", callback_data: "menu|einwand" }
    ],
    [
      { text: "🎭 Rollenspiel", callback_data: "menu|rollenspiel" },
      { text: "👤 Persona", callback_data: "menu|persona" },
      { text: "📊 Score", callback_data: "menu|score" }
    ],
    [
      { text: "🎯 Quiz", callback_data: "menu|quiz" },
      { text: "☀️ Tages-Aufgabe", callback_data: "menu|tagesaufgabe" },
      { text: "📚 Lehren", callback_data: "menu|lern" }
    ]
  ];
  // Produkt-Lookup: freischaltbar für Mitarbeiter (via /grant <id> produkt)
  if (hasModule(userId, "produkt") && !isAdmin(userId)) {
    rows.push([
      { text: "🔍 Produkt-Lookup", web_app: { url: WEBAPP_URL + "#produkt-lookup" } }
    ]);
  }
  // Admin: volle Cockpit-Zeilen
  if (isAdmin(userId)) {
    rows.push([
      { text: "📱 Dashboard", web_app: { url: WEBAPP_URL + "#dashboard" } },
      { text: "☀️ Heute", web_app: { url: WEBAPP_URL + "#today" } }
    ]);
    rows.push([
      { text: "🔍 Produkt", web_app: { url: WEBAPP_URL + "#produkt-lookup" } },
      { text: "📦 Bestand", web_app: { url: WEBAPP_URL + "#lieferant-check" } },
      { text: "👔 Stephan", web_app: { url: WEBAPP_URL + "#stephan-decisions" } }
    ]);
    rows.push([{ text: "⚙️ Admin", callback_data: "admin|panel" }]);
  }
  return tgApi("sendMessage", {
    chat_id: chatId,
    text: "<b>🎯 MAGALOKO</b> — Was möchtest du tun?",
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: rows }
  });
}

async function cmdMarkenMenu(chatId) {
  const d = await loadData();
  if (!d.marken.length) return send(chatId, "Keine Marken geladen.", BACK_KB);
  const btns = d.marken.map(m => ({ text: m.name, callback_data: `brand|${(m.id || m.name).slice(0, 60)}` }));
  const rows = [];
  for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2));
  rows.push([{ text: "⬅️ Menü", callback_data: "menu|main" }]);
  return tgApi("sendMessage", {
    chat_id: chatId,
    text: "🏷️ <b>Welche Marke?</b>",
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: rows }
  });
}

async function cmdEinwandMenu(chatId) {
  const d = await loadData();
  const kategorien = [...new Set(d.einwaende.map(e => e.kategorie).filter(Boolean))].slice(0, 10);
  if (!kategorien.length) {
    // Fallback: common categories
    const fallback = ["Preis", "Lieferung", "Amazon", "Qualität", "Notwendigkeit", "Marke"];
    const btns = fallback.map(k => ({ text: k, callback_data: `einwand|${k.toLowerCase()}` }));
    const rows = [];
    for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2));
    rows.push([{ text: "⬅️ Menü", callback_data: "menu|main" }]);
    return tgApi("sendMessage", {
      chat_id: chatId,
      text: "💬 <b>Welche Einwand-Kategorie?</b>",
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: rows }
    });
  }
  const btns = kategorien.map(k => ({ text: k, callback_data: `einwand|${k.slice(0, 60)}` }));
  const rows = [];
  for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2));
  rows.push([{ text: "⬅️ Menü", callback_data: "menu|main" }]);
  return tgApi("sendMessage", {
    chat_id: chatId,
    text: "💬 <b>Welche Einwand-Kategorie?</b>",
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: rows }
  });
}

async function cmdPersonaMenu(chatId) {
  const d = await loadData();
  if (!d.personas.length) return send(chatId, "Keine Personas geladen.", BACK_KB);
  const btns = d.personas.map(p => ({ text: p.name, callback_data: `persona|${(p.id || p.name).slice(0, 60)}` }));
  const rows = [];
  for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2));
  rows.push([{ text: "⬅️ Menü", callback_data: "menu|main" }]);
  return tgApi("sendMessage", {
    chat_id: chatId,
    text: "👤 <b>Welche Persona?</b>",
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: rows }
  });
}

async function cmdDrill(chatId, markeArg) {
  const d = await loadData();
  let pool = d.drills;
  if (markeArg) pool = pool.filter((x) => norm(x.marke).includes(norm(markeArg)));
  if (!pool.length) return send(chatId, "Keine Drills gefunden" + (markeArg ? ` für „${esc(markeArg)}"` : "") + ".");
  const drill = pick(pool);
  const opts = drill.optionen || [];
  // Inline-Keyboard: callback_data = "drill|<id>|<optIdx>"
  const keyboard = opts.map((o, i) => [{
    text: `${String.fromCharCode(65 + i)}) ${(o.text || "").slice(0, 60)}`,
    callback_data: `drill|${drill.id}|${i}`
  }]);
  await send(chatId,
    `<b>⚡ Drill — ${esc(drill.marke || "allgemein")}</b>\n\n${esc(drill.frage || "")}`,
    { reply_markup: { inline_keyboard: keyboard } });
}

async function handleDrillAnswer(cbq) {
  const [, drillId, optIdxStr] = (cbq.data || "").split("|");
  const optIdx = parseInt(optIdxStr, 10);
  const d = await loadData();
  const drill = d.drills.find((x) => x.id === drillId);
  if (!drill) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Drill nicht mehr verfügbar" });
  const opt = (drill.optionen || [])[optIdx];
  const correct = opt && (opt.ist_richtig === true || opt.punkte > 0);
  // Feedback-Toast + Score-Logging fire-and-forget — blockiert die Antwort-Nachricht nicht
  tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: correct ? "✓ Richtig!" : "✗ Leider falsch" }).catch(() => {});
  appendScore({
    ts: new Date().toISOString(),
    uid: cbq.from?.id,
    name: tgUserName(cbq.from),
    type: "drill",
    drillId,
    marke: drill.marke || "",
    correct: !!correct
  });
  const fb = opt?.feedback || (correct ? "Richtig!" : "Leider falsch.");
  const muster = drill.musterantwort ? `\n\n<b>Musterantwort:</b>\n${esc(drill.musterantwort)}` : "";
  await send(cbq.message.chat.id,
    `${correct ? "✅" : "❌"} <b>${esc(drill.frage || "")}</b>\n\n${esc(fb)}${muster}`,
    { reply_markup: { inline_keyboard: [
      [{ text: "⚡ Nächster Drill", callback_data: "menu|drill" }],
      [{ text: "⬅️ Menü", callback_data: "menu|main" }]
    ] } });
}

async function cmdMarke(chatId, arg) {
  const d = await loadData();
  if (!arg) {
    const names = d.marken.map((m) => m.name).filter(Boolean).join(", ");
    return send(chatId, "Welche Marke? Z.B. <code>/marke LIEWOOD</code>\n\n<b>Verfügbar:</b> " + esc(names));
  }
  const m = d.marken.find((x) => norm(x.name).includes(norm(arg)));
  if (!m) return send(chatId, `Marke „${esc(arg)}" nicht gefunden.`);
  const herk = m.herkunft || {};
  const heroes = (m.hero_produkte || m.top_produkte || []).slice(0, 3).map((h) => typeof h === "string" ? h : (h.name || h.produkt || "")).filter(Boolean);
  const args = (m.verkaufsargumente || m.usps || []).slice(0, 5).map((a) => typeof a === "string" ? a : (a.argument || a.text || "")).filter(Boolean);
  const kat = (m.kategorien || []).slice(0, 6).map((k) => typeof k === "string" ? k : (k.name || "")).filter(Boolean);
  let txt = `<b>📕 ${esc(m.name)}</b>\n`;
  txt += `<i>${esc([herk.land, herk.stadt, herk.gruendung].filter(Boolean).join(" · "))}</i>\n\n`;
  if (m.philosophie) txt += `„${esc(m.philosophie)}"\n\n`;
  if (kat.length) txt += `<b>Kategorien:</b> ${esc(kat.join(", "))}\n\n`;
  if (heroes.length) txt += `<b>Hero-Produkte:</b>\n${heroes.map((h) => "• " + esc(h)).join("\n")}\n\n`;
  if (args.length) txt += `<b>Verkaufsargumente:</b>\n${args.map((a) => "✓ " + esc(a)).join("\n")}`;
  await send(chatId, txt.slice(0, 4000), BACK_KB);
}

async function cmdEinwand(chatId, arg) {
  const d = await loadData();
  if (!arg) return send(chatId, "Stichwort? Z.B. <code>/einwand preis</code> oder <code>/einwand amazon</code>");
  const q = norm(arg);
  const hits = d.einwaende.filter((e) =>
    norm(e.einwand).includes(q) || norm(e.kategorie).includes(q) || norm(e.antwort).includes(q)
  ).slice(0, 3);
  if (!hits.length) return send(chatId, `Kein Einwand zu „${esc(arg)}" gefunden.`, BACK_KB);
  for (let i = 0; i < hits.length; i++) {
    const e = hits[i];
    let txt = `<b>💬 „${esc(e.einwand)}"</b>\n`;
    txt += `<i>${esc(e.kategorie || "")}</i>\n\n`;
    if (e.antwort) txt += `<b>Antwort:</b> ${esc(e.antwort)}\n`;
    if (e.beweis) txt += `\n<b>Beweis:</b> ${esc(e.beweis)}`;
    const extra = i === hits.length - 1 ? BACK_KB : {};
    await send(chatId, txt.slice(0, 4000), extra);
  }
}

async function cmdPersona(chatId, arg) {
  const d = await loadData();
  if (!arg) {
    const names = d.personas.map((p) => p.name).filter(Boolean).join(", ");
    return send(chatId, "Welche Persona? Z.B. <code>/persona anna</code>\n\n<b>Verfügbar:</b> " + esc(names));
  }
  const p = d.personas.find((x) => norm(x.name).includes(norm(arg)) || norm(x.id).includes(norm(arg)));
  if (!p) return send(chatId, `Persona „${esc(arg)}" nicht gefunden.`);
  let txt = `<b>👤 ${esc(p.name)}</b>`;
  if (p.alter || p.kontext || p.wohnort) txt += ` <i>(${esc([p.alter, p.kontext || p.wohnort].filter(Boolean).join(", "))})</i>`;
  txt += "\n\n";
  if (p.zitat) txt += `„${esc(p.zitat)}"\n\n`;
  if (p.schmerzpunkte) txt += `<b>Schmerz:</b> ${esc(typeof p.schmerzpunkte === "string" ? p.schmerzpunkte : JSON.stringify(p.schmerzpunkte))}\n`;
  if (p.werte) txt += `<b>Werte:</b> ${esc(typeof p.werte === "string" ? p.werte : JSON.stringify(p.werte))}\n`;
  if (p.einwaendeTypisch) txt += `<b>Typ. Einwand:</b> ${esc(p.einwaendeTypisch)}\n`;
  if (p.budget) txt += `<b>Budget:</b> ${esc(typeof p.budget === "string" ? p.budget : JSON.stringify(p.budget))}`;
  await send(chatId, txt.slice(0, 4000), BACK_KB);
}

async function cmdScore(chatId, userId, userName) {
  const all = await loadScores();
  const mine = all.filter((s) => s.uid === userId && s.type === "drill");
  if (!mine.length) return send(chatId, "Noch keine Drills absolviert. /drill starten!");
  const total = mine.length;
  const correct = mine.filter((s) => s.correct).length;
  const pct = Math.round((correct / total) * 100);
  // Pro Marke
  const byMarke = {};
  mine.forEach((s) => {
    const m = s.marke || "allgemein";
    byMarke[m] = byMarke[m] || { total: 0, correct: 0 };
    byMarke[m].total++; if (s.correct) byMarke[m].correct++;
  });
  // Streak: aufeinanderfolgende richtige am Ende
  let streak = 0;
  for (let i = mine.length - 1; i >= 0; i--) { if (mine[i].correct) streak++; else break; }
  const markeLines = Object.entries(byMarke)
    .sort((a, b) => b[1].total - a[1].total).slice(0, 8)
    .map(([m, s]) => `  ${esc(m)}: ${s.correct}/${s.total} (${Math.round(s.correct / s.total * 100)}%)`).join("\n");
  await send(chatId,
    `<b>📊 Dein Score, ${esc(userName)}</b>\n\n` +
    `Drills gesamt: <b>${total}</b>\n` +
    `Richtig: <b>${correct}</b> (${pct}%)\n` +
    `Aktuelle Serie: <b>${streak}</b> ${streak >= 3 ? "🔥" : ""}\n\n` +
    `<b>Nach Marke:</b>\n${markeLines}\n\n` +
    `<i>Sichtbar auch im MAGALOKO-Dashboard → Akademie → Mitarbeiter.</i>`,
    BACK_KB);
}

async function cmdRollenspiel(chatId) {
  const d = await loadData();
  if (!d.roleplays.length) return send(chatId, "Keine Rollenspiele verfügbar.");
  const rp = pick(d.roleplays);
  let txt = `<b>🎭 ${esc(rp.titel || "Rollenspiel")}</b>\n\n`;
  txt += `<b>Persona:</b> ${esc(rp.persona || "")}\n`;
  txt += `<b>Setting:</b> ${esc(rp.setting || "")}\n`;
  txt += `<b>Technik:</b> ${esc(rp.verkaufstechnik || "")} · <b>Ziel-AOV:</b> €${rp.ziel_aov || "—"}\n\n`;
  if ((rp.ablauf || []).length) {
    txt += `<b>Ablauf:</b>\n${rp.ablauf.map((s) => `${s.schritt || "•"}. <b>${esc(s.name || "")}</b> — ${esc((s.beschreibung || "").slice(0, 120))}`).join("\n")}\n\n`;
  }
  if ((rp.einwaende || []).length) {
    txt += `<b>Einwände zum Meistern:</b>\n${rp.einwaende.map((e) => `• „${esc(e.einwand)}" → <i>${esc(e.erwartete_technik || "")}</i>`).join("\n")}`;
  }
  txt += `\n\n<i>Spiel das mit einem Kollegen durch — einer Kunde, einer Verkäufer. Volle Bewertung im MAGALOKO-Dashboard.</i>`;
  await send(chatId, txt.slice(0, 4000), { reply_markup: { inline_keyboard: [
    [{ text: "🎭 Nächstes Rollenspiel", callback_data: "menu|rollenspiel" }],
    [{ text: "⬅️ Menü", callback_data: "menu|main" }]
  ] } });
}

async function cmdLern(chatId, content, from) {
  if (!content.trim()) {
    return send(chatId,
      "📚 <b>Bot-Lernen</b>\n\n" +
      "Syntax: <code>/lern STICHWORT: Korrektur oder neue Info</code>\n\n" +
      "Beispiele:\n" +
      "• <code>/lern finkid: Kommt aus Deutschland (Berlin), nicht Finnland</code>\n" +
      "• <code>/lern liewood: Gegründet 2013 in Dänemark, Holzspielzeug fokus</code>\n\n" +
      "<i>Der Bot merkt sich das dauerhaft und nutzt es bei Antworten.</i>",
      BACK_KB);
  }
  // Extract keyword from "KEYWORD: content" pattern
  const colonIdx = content.indexOf(":");
  let keywords = [];
  let correctionText = content;
  if (colonIdx > 0) {
    keywords = [content.slice(0, colonIdx).trim().toLowerCase()];
    correctionText = content.slice(colonIdx + 1).trim();
  }
  const entry = {
    id: `lrn-${Date.now()}`,
    keywords,
    topic: keywords[0] || "allgemein",
    correction: correctionText,
    addedAt: new Date().toISOString().slice(0, 10),
    addedBy: tgUserName(from)
  };
  await saveLearning(entry);
  console.log(`[bot] Lern-Eintrag gespeichert: ${entry.topic}`);
  return send(chatId,
    `✅ <b>Gelernt!</b>\n\n` +
    `<b>Stichwort:</b> ${esc(keywords[0] || "allgemein")}\n` +
    `<b>Info:</b> ${esc(correctionText.slice(0, 200))}\n\n` +
    `<i>Ab jetzt in allen relevanten Antworten aktiv.</i>`,
    BACK_KB);
}

// === KI-Assistent ===

// Vollständigen HFK-Workspace-State laden
async function loadFullState() {
  try {
    const raw = await readFile(statePath, "utf8");
    const s = JSON.parse(raw);
    return s.workspaces?.hfk?.data || s;
  } catch { return null; }
}

// Kontext aus State je nach Frageinhalt zusammenbauen
function buildContext(question, ws) {
  const q = question.toLowerCase();
  const parts = [];
  const today = new Date().toLocaleDateString("de-AT", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  parts.push(`Datum: ${today}`);

  // Offene Tasks
  if (q.match(/aufgabe|task|todo|offen|erledigt|liste|was.*machen|nächste/)) {
    const tasks = (ws.tasks || []).filter(t => t.status !== "done" && t.status !== "erledigt").slice(0, 12);
    if (tasks.length) parts.push(`Offene Aufgaben (${tasks.length}):\n${tasks.map(t => `• ${t.title || t.text || t.name} [${t.status || "offen"}]${t.priority === "hoch" ? " ⚡" : ""}`).join("\n")}`);
  }

  // Entscheidungen / Stephan
  if (q.match(/entscheidung|decision|stephan|kooperation|pitch|angebot|vertrag/)) {
    const decs = (ws.stephanDecisions || []).slice(0, 8);
    if (decs.length) parts.push(`Decision-Pipeline (${decs.length}):\n${decs.map(d => `• ${d.titel || d.title || d.frage}: ${d.status || "offen"}`).join("\n")}`);
  }

  // Produkte / ABC / Lager
  if (q.match(/artikel|produkt|abc|bestseller|top.artikel|lager|bestand|oos|out.of.stock|verkauf/)) {
    const abc = ws.jtlData?.abcClassification;
    if (abc) {
      const topA = Object.keys(abc).filter(k => abc[k] === "A").slice(0, 15);
      const topB = Object.keys(abc).filter(k => abc[k] === "B").slice(0, 8);
      if (topA.length) parts.push(`ABC-A-Artikel (Top-${topA.length}): ${topA.join(", ")}`);
      if (topB.length) parts.push(`ABC-B-Artikel (${topB.length} Auszug): ${topB.join(", ")}`);
    }
    const vip = (ws.vipArticles || []).slice(0, 10);
    if (vip.length) parts.push(`VIP-Artikel:\n${vip.map(v => `• ${v.name || v.sku || v.id}: ${v.reason || ""}`).join("\n")}`);
  }

  // Marken / Brands
  if (q.match(/marke|brand|lieferant|hersteller|liewood|stokke|cybex|bugaboo/)) {
    const marken = (ws.akademieMarken || []).slice(0, 6);
    if (marken.length) parts.push(`Marken-Bibel (${marken.length}):\n${marken.map(m => `• ${m.name}${m.herkunft?.land ? ` (${m.herkunft.land})` : ""}: ${(m.philosophie || "").slice(0, 120)}`).join("\n")}`);
  }

  // KPIs / Umsatz
  if (q.match(/kpi|umsatz|kennzahl|performance|zahlen|woche|monat|quartal|ergebnis/)) {
    const kpis = ws.weeklyKpis || ws.jtlKpis;
    if (kpis) {
      const recent = Array.isArray(kpis) ? kpis.slice(-4) : kpis;
      parts.push(`KPI-Daten:\n${JSON.stringify(recent, null, 1).slice(0, 600)}`);
    }
    const levers = (ws.levers || []).slice(0, 6);
    if (levers.length) parts.push(`Hebel:\n${levers.map(l => `• ${l.title || l.name || l.lever}: ${l.status || l.value || ""}`).join("\n")}`);
  }

  // Anomalien / Probleme
  if (q.match(/anomalie|problem|kritisch|alert|warnung|fehler|auffällig/)) {
    const anom = (ws.anomalies || []).slice(-8);
    if (anom.length) parts.push(`Anomalien (${anom.length}):\n${anom.map(a => `• ${a.text || a.title || a.description || JSON.stringify(a).slice(0, 80)}`).join("\n")}`);
  }

  // Risiken
  if (q.match(/risiko|risk|gefahr|bedrohung|schwäche/)) {
    const risks = (ws.risks || []).slice(0, 8);
    if (risks.length) parts.push(`Risk-Radar (${risks.length}):\n${risks.map(r => `• [${r.status || "aktiv"}] ${r.titel || r.title || r.text}`).join("\n")}`);
  }

  // Kalender / Termine
  if (q.match(/termin|kalender|meeting|gespräch|heute|morgen|woche|schedule/)) {
    const now = Date.now();
    const evts = (ws.calendarEvents || [])
      .filter(e => new Date(e.date || e.start || e.startDate).getTime() >= now - 86400000)
      .slice(0, 8);
    if (evts.length) parts.push(`Kommende Termine:\n${evts.map(e => `• ${e.date || e.start}: ${e.title || e.name || e.text}`).join("\n")}`);
    const stephan = (ws.stephanSchedule || []).slice(0, 5);
    if (stephan.length) parts.push(`Stephans Schedule:\n${stephan.map(s => `• ${s.date || s.time}: ${s.title || s.text}`).join("\n")}`);
  }

  // Captures / Notizen
  if (q.match(/notiz|capture|inbox|gemerkt|notiert|idee|rückmeldung/)) {
    const caps = (ws.captureInbox || []).slice(-8);
    if (caps.length) parts.push(`Capture-Inbox (letzte ${caps.length}):\n${caps.map(c => `• ${c.text || c.content || c.title || JSON.stringify(c).slice(0, 80)}`).join("\n")}`);
  }

  // Kunden / VIP
  if (q.match(/kunde|kunden|vip|stammkunde|crm|retoure/)) {
    const segs = (ws.customerSegments || []).slice(0, 5);
    if (segs.length) parts.push(`Kundensegmente:\n${segs.map(s => `• ${s.name || s.title}: ${s.description || s.size || ""}`).join("\n")}`);
  }

  // Wettbewerb
  if (q.match(/wettbewerb|konkurrenz|babymarkt|babyone|amazon|mitbewerber/)) {
    const comp = (ws.competitors || []).slice(0, 6);
    if (comp.length) parts.push(`Wettbewerbs-Radar:\n${comp.map(c => `• ${c.name}: ${c.strategy || c.strength || c.notes || ""}`).join("\n")}`);
  }

  // Strategie / Roadmap
  if (q.match(/strategie|roadmap|plan|projekt|vision|ziel|onesource|vektra|sebo|digitalisierung/)) {
    const hyps = (ws.hypotheses || []).slice(0, 5);
    if (hyps.length) parts.push(`Hypothesen:\n${hyps.map(h => `• ${h.title || h.text}: ${h.status || ""}`).join("\n")}`);
  }

  // Fallback: letzte Captures immer dabei (kurz)
  if (parts.length <= 1) {
    const caps = (ws.captureInbox || []).slice(-5);
    if (caps.length) parts.push(`Letzte Captures:\n${caps.map(c => `• ${c.text || c.content || JSON.stringify(c).slice(0, 60)}`).join("\n")}`);
  }

  return parts.join("\n\n");
}

// DeepSeek-API-Aufruf (pure node:https, kein npm)
async function callAI(messages) {
  const cfg = JSON.parse(await readFile(configPath, "utf8"));
  const apiKey = cfg.aiApiKey || cfg.deepseekApiKey;
  if (!apiKey) throw new Error("NO_KEY");
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "deepseek-chat",
      messages,
      max_tokens: 1200,
      temperature: 0.65
    });
    const req = https.request({
      hostname: "api.deepseek.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(body)
      }
    }, (res) => {
      let data = "";
      res.on("data", c => (data += c));
      res.on("end", () => {
        try {
          const j = JSON.parse(data);
          const text = j.choices?.[0]?.message?.content;
          if (text) resolve(text);
          else reject(new Error(j.error?.message || "Leere Antwort"));
        } catch { reject(new Error("Parse-Fehler")); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Haupt-Handler: Frage stellen
async function cmdFrag(chatId, question, from) {
  if (!question.trim()) {
    return send(chatId,
      "🤖 <b>Frag mich etwas über HFK!</b>\n\n" +
      "<b>Beispiele:</b>\n" +
      "• Was sind unsere offenen Tasks?\n" +
      "• Welche ABC-A Artikel haben wir?\n" +
      "• Welche Entscheidungen stehen an?\n" +
      "• Gibt es kritische Anomalien?\n" +
      "• Was weiß ich über Liewood?\n" +
      "• Wie sieht die Roadmap aus?\n\n" +
      "<i>Oder schreib einfach deine Frage direkt ohne /frag.</i>"
    );
  }
  await tgApi("sendChatAction", { chat_id: chatId, action: "typing" });
  try {
    const ws = await loadFullState();
    if (!ws) throw new Error("State nicht verfügbar");
    const context = buildContext(question, ws);
    const learnings = await loadLearnings();
    const relevant = findRelevantLearnings(question, learnings);
    const learningsContext = relevant.length
      ? `\n\n⚠️ KORREKTUREN (haben Vorrang vor anderen Daten):\n${relevant.map(l => `• ${l.topic}: ${l.correction}`).join("\n")}`
      : "";
    const messages = [
      {
        role: "system",
        content:
          "Du bist Mago, der persönliche KI-Assistent für HFK (Herr und Frau Klein), " +
          "einem Babyfachhandel in Wien/Österreich. Du hast Zugriff auf Live-Daten aus MAGALOKO. " +
          "Antworte auf Deutsch, präzise und direkt. " +
          "Nutze Telegram HTML-Formatting (<b>fett</b>, <i>kursiv</i>, <code>code</code>). Kein Markdown. " +
          "WICHTIG: Wenn im Kontext '⚠️ KORREKTUREN' steht, nutze diese Korrekturen mit höchster Priorität. " +
          "Bei Markeninformationen (Herkunft, Gründer, Produkte): Halte dich exakt an die MAGALOKO-Daten. " +
          "Wenn keine Daten vorhanden sind, sag es ehrlich. Halte Antworten kompakt (max. 400 Wörter)."
      },
      {
        role: "user",
        content: context
          ? `MAGALOKO-Kontext:\n${context}${learningsContext}\n\n---\nFrage von ${esc(tgUserName(from))}: ${question}`
          : `${learningsContext ? learningsContext + "\n\n---\n" : ""}Frage von ${esc(tgUserName(from))}: ${question}`
      }
    ];
    const answer = await callAI(messages);
    // Telegram-Nachrichten max. 4096 Zeichen
    const chunks = [];
    for (let i = 0; i < answer.length; i += 4000) chunks.push(answer.slice(i, i + 4000));
    for (const chunk of chunks) await send(chatId, chunk);
  } catch (e) {
    if (e.message === "NO_KEY") {
      return send(chatId,
        "⚙️ <b>Kein KI-API-Key konfiguriert.</b>\n\n" +
        "Füge in <code>config/telegram.json</code> ein:\n" +
        "<code>\"aiApiKey\": \"sk-...dein-deepseek-key...\"</code>\n\n" +
        "DeepSeek-Keys: <i>platform.deepseek.com</i>"
      );
    }
    console.error("[cmdFrag]", e.message);
    return send(chatId, "⚠️ KI-Anfrage fehlgeschlagen. Versuch es nochmal.");
  }
}

// === Produkt-Wissen (RAG über JTL-Artikel) ===
// Retrieval läuft im Server (Artikel-Index), Antwort via DeepSeek — geerdet, mit Quellen.
async function cmdProdukt(chatId, userId, query) {
  if (!query || !query.trim()) {
    return send(chatId,
      "🔍 <b>Produkt-Frage stellen</b>\n\n" +
      "Beispiele:\n" +
      "• <code>/produkt was kostet der Tripp Trapp</code>\n" +
      "• <code>/produkt Liewood Schlafsack auf Lager?</code>\n" +
      "• <code>/produkt welche Artikel von Stokke</code>\n\n" +
      "<i>Antworten basieren auf den JTL-Artikeldaten (Preis, Bestand, Marke).</i>");
  }
  await tgApi("sendChatAction", { chat_id: chatId, action: "typing" });
  try {
    if (!INTERNAL_TOKEN) throw new Error("Kein interner Token konfiguriert");
    const url = SERVER_URL + "/api/rag/search?k=6&q=" + encodeURIComponent(query.slice(0, 200));
    const res = await fetch(url, { headers: { "x-internal-token": INTERNAL_TOKEN } });
    if (!res.ok) throw new Error("Retrieval HTTP " + res.status);
    const data = await res.json();
    const docs = data.docs || [];
    const knowledge = data.knowledge || [];
    if (!docs.length && !knowledge.length) {
      return send(chatId, "❓ Dazu finde ich keine passenden Artikel oder Infos.\n\n<i>Tipp: nenne Marke oder Produktnamen genauer.</i>");
    }
    // Kuratiertes Produktwissen ZUERST (Alter/Material/Pflege/USPs) — hat Vorrang
    const wissenCtx = knowledge.length
      ? "GEPFLEGTES PRODUKTWISSEN (verlässlich, bevorzugt nutzen):\n" +
        knowledge.map((w, i) => `(W${i + 1}) ${w.titel}${w.marke ? " — " + w.marke : ""}: ${w.text}`).join("\n") + "\n\n"
      : "";
    const artCtx = docs.length
      ? "JTL-ARTIKELDATEN (Preis/Bestand/Marke):\n" + docs.map((d, i) =>
          `[${i + 1}] ${d.name}${d.marke ? " — Marke: " + d.marke : ""} · Art.-Nr: ${d.artNr}` +
          ` · Preis: ${d.preis ? d.preis.toFixed(2) + " € netto" : "—"} · Bestand: ${d.bestand} · ${d.aktiv ? "aktiv" : "inaktiv"}`
        ).join("\n")
      : "";
    const messages = [
      { role: "system", content:
        "Du bist der Produkt-Assistent für HFK (Babyfachhandel Wien). Beantworte die Frage des Mitarbeiters " +
        "AUSSCHLIESSLICH anhand der gelieferten Daten. Das 'GEPFLEGTE PRODUKTWISSEN' ist verlässlich und hat Vorrang " +
        "bei Fragen zu Alter, Material, Pflege, Eigenschaften. Die 'JTL-ARTIKELDATEN' nutzt du für Preis, Bestand, Marke. " +
        "Erfinde NICHTS dazu. Wenn die Daten die Frage nicht beantworten, sag ehrlich dass dazu nichts hinterlegt ist. " +
        "Kurz, Deutsch, Telegram-HTML (<b>,<i>,<code>), kein Markdown. Preise sind Netto." },
      { role: "user", content: `${wissenCtx}${artCtx}\n\n---\nFrage: ${query}` }
    ];
    const answer = await callAI(messages);
    const srcLines = [];
    knowledge.forEach(w => srcLines.push(`• 📝 ${esc(w.titel)}${w.marke ? " (" + esc(w.marke) + ")" : ""}`));
    docs.slice(0, 5).forEach(d => srcLines.push(`• 🏷️ ${esc(d.name)}${d.marke ? " (" + esc(d.marke) + ")" : ""} — <code>${esc(d.artNr)}</code>`));
    await send(chatId, answer.slice(0, 3500));
    if (srcLines.length) await send(chatId, `📚 <b>Quellen:</b>\n${srcLines.join("\n")}`);
  } catch (e) {
    if (e.message === "NO_KEY") return send(chatId, "⚙️ Kein KI-Key konfiguriert (config/telegram.json → aiApiKey).");
    console.error("[cmdProdukt]", e.message);
    return send(chatId, "⚠️ Produkt-Anfrage fehlgeschlagen. Läuft der MAGALOKO-Server?");
  }
}

// === Admin-Panel (interaktiv) ===

// Hilfsfunktion: Send oder Edit je nach ob msgId vorhanden.
// WICHTIG: tgApi wirft bei Telegram-API-Fehlern NICHT, sondern liefert {ok:false}.
// Darum res.ok prüfen und bei Misserfolg (z.B. Nachricht nicht editierbar) neu senden,
// sonst passiert sichtbar gar nichts (Bug: Admin-Button reagierte nicht).
async function tgMsgOrEdit(chatId, msgId, text, extra = {}) {
  const params = { chat_id: chatId, text, parse_mode: "HTML", ...extra };
  if (msgId) {
    const res = await tgApi("editMessageText", { ...params, message_id: msgId }).catch(() => ({ ok: false }));
    if (res && res.ok) return res;
    return tgApi("sendMessage", params); // Edit fehlgeschlagen → neue Nachricht
  }
  return tgApi("sendMessage", params);
}

async function sendAdminPanel(chatId, msgId = null) {
  const cnt = Object.keys(USERS).length;
  const text = `<b>⚙️ Admin-Panel</b>\n\n` +
    `👥 <b>${cnt} Nutzer</b> freigeschaltet\n\n` +
    `Wähle eine Aktion oder nutze Befehle:\n` +
    `<code>/adduser ID Name</code>  <code>/setrole ID admin</code>`;
  return tgMsgOrEdit(chatId, msgId, text, {
    reply_markup: { inline_keyboard: [
      [
        { text: "👥 User-Liste", callback_data: "admin|users" },
        { text: "➕ User hinzufügen", callback_data: "admin|addhelp" }
      ],
      [{ text: "⬅️ Menü", callback_data: "menu|main" }]
    ]}
  });
}

async function sendUserList(chatId, msgId = null) {
  const entries = Object.entries(USERS);
  if (!entries.length) {
    return tgMsgOrEdit(chatId, msgId,
      "📭 <b>Keine Nutzer registriert.</b>\n\nFüge den ersten Nutzer mit <code>/adduser ID Name</code> hinzu.",
      { reply_markup: { inline_keyboard: [
        [{ text: "➕ Hinzufügen (Anleitung)", callback_data: "admin|addhelp" }],
        [{ text: "⬅️ Admin-Panel", callback_data: "admin|panel" }]
      ]}}
    );
  }
  const lines = entries.map(([id, u]) => {
    const roleIcon = isAdmin(Number(id)) ? "🔑" : "👤";
    const mods = u.modules?.length ? u.modules.join("+") : "—";
    return `${roleIcon} <b>${esc(u.name || "?")}</b>  <code>${id}</code>\n   Module: ${mods || "akademie (Standard)"}`;
  });
  const kb = entries.map(([id, u]) => [
    { text: `⚙️ ${esc(u.name || id)} verwalten`, callback_data: `admin|manage|${id}` }
  ]);
  kb.push([
    { text: "➕ Hinzufügen", callback_data: "admin|addhelp" },
    { text: "⬅️ Admin-Panel", callback_data: "admin|panel" }
  ]);
  return tgMsgOrEdit(chatId, msgId,
    `<b>👥 Freigeschaltete Nutzer (${lines.length})</b>\n\n${lines.join("\n\n")}`,
    { reply_markup: { inline_keyboard: kb } }
  );
}

async function sendManageUser(chatId, targetId, msgId = null) {
  const id = Number(targetId);
  const u = USERS[id];
  if (!u) return tgMsgOrEdit(chatId, msgId,
    `❌ User <code>${id}</code> nicht gefunden.`,
    { reply_markup: { inline_keyboard: [[{ text: "⬅️ User-Liste", callback_data: "admin|users" }]] }}
  );
  const adminFlag = isAdmin(id);
  const roleText = adminFlag ? "🔑 Admin (voller Zugriff)" : "👤 Mitarbeiter";
  const ownMods = u.modules || [];
  const modList = ownMods.length ? ownMods.join(", ") : "—";
  const text = `<b>⚙️ ${esc(u.name)}</b>\nID: <code>${id}</code>\nRolle: ${roleText}\nZusatz-Module: ${modList}\nAkademie: ✅ immer`;
  const kb = [];
  // Modul-Toggle: produkt + ai
  const modRow = [];
  for (const mod of ["produkt", "ai"]) {
    const has = ownMods.includes(mod);
    modRow.push(has
      ? { text: `✅ ${mod} — entziehen`, callback_data: `admin|revoke|${id}|${mod}` }
      : { text: `➕ ${mod} freischalten`, callback_data: `admin|grant|${id}|${mod}` }
    );
  }
  kb.push(modRow);
  // Admin-Rolle
  if (!adminFlag) {
    kb.push([{ text: "🔑 Zu Admin machen", callback_data: `admin|promote|${id}` }]);
    kb.push([{ text: "🗑 User entfernen", callback_data: `admin|remove|${id}` }]);
  } else {
    const admArr = [...ADMINS];
    if (admArr.length > 1 || admArr[0] !== id) {  // Nie letzten Admin entfernen
      kb.push([{ text: "🔓 Admin-Rechte entziehen", callback_data: `admin|demote|${id}` }]);
    }
  }
  kb.push([{ text: "⬅️ User-Liste", callback_data: "admin|users" }]);
  return tgMsgOrEdit(chatId, msgId, text, { reply_markup: { inline_keyboard: kb } });
}

// Admin-Panel: alle admin|* Callbacks zentral verarbeiten
async function handleAdminCallback(cbq) {
  const data = cbq.data;
  const chatId = cbq.message?.chat?.id;
  const msgId = cbq.message?.message_id;
  const callerId = cbq.from?.id;
  if (!isAdmin(callerId)) return; // Spinner schon im Haupt-Handler gestoppt; Admin-Buttons sieht ohnehin nur Admin
  // answerCallbackQuery wurde bereits im Haupt-Handler (fire-and-forget) ausgelöst
  if (data === "admin|panel") return sendAdminPanel(chatId, msgId);
  if (data === "admin|users") return sendUserList(chatId, msgId);
  if (data === "admin|addhelp") {
    return tgMsgOrEdit(chatId, msgId,
      `➕ <b>User hinzufügen</b>\n\nSende:\n<code>/adduser [Telegram-ID] [Name]</code>\n\nBeispiel:\n<code>/adduser 8715824144 Labs</code>\n\n💡 <i>User bekommt seine ID wenn er <b>/myid</b> an den Bot schreibt.</i>`,
      { reply_markup: { inline_keyboard: [[{ text: "⬅️ User-Liste", callback_data: "admin|users" }]] }}
    );
  }
  if (data.startsWith("admin|manage|")) {
    return sendManageUser(chatId, data.slice("admin|manage|".length), msgId);
  }
  if (data.startsWith("admin|grant|")) {
    const parts = data.split("|");  // admin|grant|ID|mod
    const id = Number(parts[2]);
    const mod = parts[3];
    const VALID_MODULES = ["produkt", "ai"]; // grantbare Module — verhindert Config-Verschmutzung
    if (USERS[id] && VALID_MODULES.includes(mod)) {
      const mods = USERS[id].modules || [];
      if (!mods.includes(mod)) { mods.push(mod); USERS[id].modules = mods; await saveConfig(); }
      console.log(`[admin] Grant ${mod} → ${USERS[id].name} (${id})`);
      setUserMenuButton(id, id); // Menübutton des Users rollengerecht aktualisieren
    }
    return sendManageUser(chatId, id, msgId);
  }
  if (data.startsWith("admin|revoke|")) {
    const parts = data.split("|");
    const id = Number(parts[2]);
    const mod = parts[3];
    if (USERS[id]) {
      USERS[id].modules = (USERS[id].modules || []).filter(m => m !== mod);
      await saveConfig();
      console.log(`[admin] Revoke ${mod} ← ${USERS[id].name} (${id})`);
      setUserMenuButton(id, id); // Menübutton des Users rollengerecht aktualisieren
    }
    return sendManageUser(chatId, id, msgId);
  }
  if (data.startsWith("admin|promote|")) {
    const id = Number(data.slice("admin|promote|".length));
    if (USERS[id]) { ADMINS.add(id); USERS[id].role = "admin"; await saveConfig(); setUserMenuButton(id, id); }
    console.log(`[admin] Promoted: ${USERS[id]?.name} (${id})`);
    return sendManageUser(chatId, id, msgId);
  }
  if (data.startsWith("admin|demote|")) {
    const id = Number(data.slice("admin|demote|".length));
    const admArr = [...ADMINS];
    if (admArr.length > 1 && USERS[id]) {
      ADMINS.delete(id);
      USERS[id].role = "mitarbeiter";
      await saveConfig();
      setUserMenuButton(id, id); // Cockpit-Button sofort auf Akademie zurücksetzen
      console.log(`[admin] Demoted: ${USERS[id]?.name} (${id})`);
    }
    return sendManageUser(chatId, id, msgId);
  }
  if (data.startsWith("admin|remove|")) {
    const id = Number(data.slice("admin|remove|".length));
    if (!isAdmin(id) && USERS[id]) {
      const name = USERS[id].name;
      if (ALLOWED) ALLOWED = ALLOWED.filter(x => x !== id);
      delete USERS[id];
      await saveConfig();
      // Entfernter User: Menübutton auf reine Befehlsliste (kein Web-App-Zugriff mehr)
      tgApi("setChatMenuButton", { chat_id: id, menu_button: { type: "commands" } }).catch(() => {});
      console.log(`[admin] Removed user: ${name} (${id})`);
    }
    return sendUserList(chatId, msgId);
  }
}

// Wrapper für Text-Befehle
async function cmdAdminPanel(chatId) { return sendAdminPanel(chatId); }
async function cmdUsers(chatId) { return sendUserList(chatId); }

async function cmdAddUser(chatId, arg) {
  const [idStr, ...nameParts] = arg.trim().split(/\s+/);
  const id = Number(idStr);
  if (!id || isNaN(id)) return send(chatId, "❌ Syntax: <code>/adduser 123456789 Lorna</code>", { parse_mode: "HTML" });
  const name = nameParts.join(" ") || `User${id}`;
  if (!ALLOWED) ALLOWED = [];
  if (!ALLOWED.includes(id)) ALLOWED.push(id);
  USERS[id] = USERS[id] || { name, role: "mitarbeiter", modules: [] };
  USERS[id].name = name;
  await saveConfig();
  console.log(`[admin] User hinzugefügt: ${name} (${id})`);
  return send(chatId,
    `✅ <b>${esc(name)}</b> (<code>${id}</code>) freigeschaltet.\n\n` +
    `Rolle: 👤 Mitarbeiter (nur Akademie)\n\n` +
    `Modul hinzufügen: <code>/grant ${id} produkt</code> oder <code>/grant ${id} ai</code>`,
    { parse_mode: "HTML" });
}

async function cmdRemoveUser(chatId, arg) {
  const id = Number(arg.trim());
  if (!id || isNaN(id)) return send(chatId, "❌ Syntax: <code>/removeuser 123456789</code>", { parse_mode: "HTML" });
  if (isAdmin(id)) return send(chatId, "❌ Admin-User kann nicht entfernt werden.");
  const name = USERS[id]?.name || String(id);
  if (ALLOWED) ALLOWED = ALLOWED.filter(x => x !== id);
  delete USERS[id];
  await saveConfig();
  // Entfernter User: Menübutton auf reine Befehlsliste zurücksetzen (kein Web-App-Zugriff)
  tgApi("setChatMenuButton", { chat_id: id, menu_button: { type: "commands" } }).catch(() => {});
  console.log(`[admin] User entfernt: ${name} (${id})`);
  return send(chatId, `✅ <b>${esc(name)}</b> (<code>${id}</code>) entfernt.`, { parse_mode: "HTML" });
}

async function cmdGrantModule(chatId, arg) {
  const parts = arg.trim().split(/\s+/);
  const id = Number(parts[0]);
  const mod = (parts[1] || "").toLowerCase();
  const validMods = ["produkt", "ai"];
  if (!id || isNaN(id)) return send(chatId, "❌ Syntax: <code>/grant 123456789 produkt</code>\nModule: produkt, ai", { parse_mode: "HTML" });
  if (!validMods.includes(mod)) return send(chatId, `❌ Unbekanntes Modul: <code>${esc(mod)}</code>\nVerfügbar: ${validMods.join(", ")}`, { parse_mode: "HTML" });
  if (!USERS[id]) return send(chatId, `❌ User <code>${id}</code> nicht gefunden. Zuerst /adduser.`, { parse_mode: "HTML" });
  const mods = USERS[id].modules || [];
  if (!mods.includes(mod)) {
    mods.push(mod);
    USERS[id].modules = mods;
    await saveConfig();
    setUserMenuButton(id, id); // Menübutton rollengerecht aktualisieren
  }
  return send(chatId,
    `✅ <b>${esc(USERS[id].name)}</b> hat jetzt Modul <code>${esc(mod)}</code>.\n\nAlle Module: ${mods.join(", ") || "—"}`,
    { parse_mode: "HTML" });
}

async function cmdRevokeModule(chatId, arg) {
  const parts = arg.trim().split(/\s+/);
  const id = Number(parts[0]);
  const mod = (parts[1] || "").toLowerCase();
  if (!id || isNaN(id) || !mod) return send(chatId, "❌ Syntax: <code>/revoke 123456789 produkt</code>", { parse_mode: "HTML" });
  if (!USERS[id]) return send(chatId, `❌ User <code>${id}</code> nicht gefunden.`, { parse_mode: "HTML" });
  USERS[id].modules = (USERS[id].modules || []).filter(m => m !== mod);
  await saveConfig();
  setUserMenuButton(id, id); // Menübutton rollengerecht aktualisieren
  return send(chatId, `✅ Modul <code>${esc(mod)}</code> von <b>${esc(USERS[id].name)}</b> entfernt.`, { parse_mode: "HTML" });
}

async function cmdSetRole(chatId, arg) {
  const parts = arg.trim().split(/\s+/);
  const id = Number(parts[0]);
  const role = (parts[1] || "").toLowerCase();
  if (!id || isNaN(id)) return send(chatId,
    "❌ Syntax: <code>/setrole 123456789 admin</code>\nRollen: <code>admin</code> oder <code>mitarbeiter</code>",
    { parse_mode: "HTML" }
  );
  if (!["admin", "mitarbeiter"].includes(role)) return send(chatId,
    "❌ Unbekannte Rolle.\nVerfügbar: <code>admin</code> oder <code>mitarbeiter</code>",
    { parse_mode: "HTML" }
  );
  if (!USERS[id]) return send(chatId,
    `❌ User <code>${id}</code> nicht gefunden. Zuerst <code>/adduser ${id} Name</code>.`,
    { parse_mode: "HTML" }
  );
  const name = USERS[id].name;
  if (role === "admin") {
    ADMINS.add(id);
    USERS[id].role = "admin";
    await saveConfig();
    setUserMenuButton(id, id); // Cockpit-Button freischalten
    console.log(`[admin] Promoted to admin: ${name} (${id})`);
    return send(chatId, `✅ <b>${esc(name)}</b> ist jetzt 🔑 <b>Admin</b> — hat vollen Zugriff.`, { parse_mode: "HTML" });
  } else {
    const admArr = [...ADMINS];
    if (admArr.length <= 1 && ADMINS.has(id)) {
      return send(chatId, "❌ Nicht möglich — du wärst der einzige Admin. Füge erst einen anderen Admin hinzu.");
    }
    ADMINS.delete(id);
    USERS[id].role = "mitarbeiter";
    await saveConfig();
    setUserMenuButton(id, id); // Cockpit-Button sofort auf Akademie zurücksetzen
    console.log(`[admin] Demoted to mitarbeiter: ${name} (${id})`);
    return send(chatId, `✅ <b>${esc(name)}</b> ist jetzt 👤 <b>Mitarbeiter</b> — Akademie-Zugriff.`, { parse_mode: "HTML" });
  }
}

// === Update-Verarbeitung ===
async function handleUpdate(u) {
  // Callback (Button-Tap)
  if (u.callback_query) {
    const cbq = u.callback_query;
    // SICHERHEIT: nur Privatchat (Gruppen-Buttons werden ignoriert)
    if (!isPrivateChat(cbq.message?.chat)) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Nur im Privatchat" });
    if (!isAllowed(cbq.from?.id)) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Kein Zugriff" });
    const data = cbq.data || "";
    const cid = cbq.message?.chat?.id;
    // SICHERHEIT (Defense-in-Depth): alle Nicht-Admin-Callbacks gehören zum Akademie-Modul.
    // admin|* prüft isAdmin separat in handleAdminCallback. menu|main ist neutral (zeigt rollengerechtes Menü).
    const uid = cbq.from?.id;
    if (!data.startsWith("admin|") && data !== "menu|main" && !hasModule(uid, "akademie")) {
      return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "🔒 Nicht freigeschaltet", show_alert: true });
    }
    // drill|/quiz_ans| antworten SELBST mit Feedback-Toast ("✓ Richtig!") — nicht vorab beantworten.
    // Alle anderen: Spinner sofort fire-and-forget stoppen (blockiert die Aktion NICHT).
    const selfAnswers = data.startsWith("drill|") || data.startsWith("quiz_ans|");
    if (!selfAnswers) tgApi("answerCallbackQuery", { callback_query_id: cbq.id }).catch(() => {});
    if (data.startsWith("drill|")) return handleDrillAnswer(cbq);
    if (data === "menu|main") return sendMenu(cid, cbq.from?.id);
    if (data === "menu|drill") return cmdDrill(cid, "");
    if (data === "menu|marken") return cmdMarkenMenu(cid);
    if (data === "menu|einwand") return cmdEinwandMenu(cid);
    if (data === "menu|persona") return cmdPersonaMenu(cid);
    if (data === "menu|rollenspiel") return cmdRollenspiel(cid);
    if (data === "menu|score") return cmdScore(cid, cbq.from?.id, tgUserName(cbq.from));
    if (data === "menu|lern") return cmdLern(cid, "", null);
    if (data.startsWith("brand|")) return cmdMarke(cid, data.slice(6));
    if (data.startsWith("einwand|")) return cmdEinwand(cid, data.slice(8));
    if (data.startsWith("persona|")) return cmdPersona(cid, data.slice(8));
    if (data.startsWith("admin|")) return handleAdminCallback(cbq);
    if (data.startsWith("quiz_ans|")) return handleQuizAnswer(cbq);
    if (data === "menu|quiz") return cmdQuiz(cid, cbq.from?.id, 5);
    if (data === "menu|tagesaufgabe") return cmdTagesaufgabe(cid, cbq.from?.id);
    if (data === "menu|fortschritt") return cmdFortschritt(cid, cbq.from?.id, tgUserName(cbq.from));
    return;
  }
  // Nachricht
  const msg = u.message;
  if (!msg || !msg.text) return;
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  // SICHERHEIT: nur 1:1-Privatchat. In Gruppen/Kanälen bleibt der Bot komplett stumm.
  if (!isPrivateChat(msg.chat)) {
    console.log(`[telegram-bot] Nicht-Privatchat ignoriert: type=${msg.chat?.type} chat=${chatId}`);
    return;
  }
  // /myid funktioniert immer (auch vor Freischaltung)
  if (msg.text.trim().toLowerCase().startsWith("/myid")) {
    console.log(`[telegram-bot] /myid von ${tgUserName(msg.from)} → ID: ${userId}`);
    return send(chatId,
      `🪪 <b>Deine Telegram-User-ID:</b> <code>${userId}</code>\n\n` +
      `Schick diese Zahl an Mago, damit er dich freischaltet.`);
  }
  if (!isAllowed(userId)) {
    console.log(`[telegram-bot] Zugriff verweigert: ${tgUserName(msg.from)} (ID: ${userId})`);
    return send(chatId, `⛔ Kein Zugriff.\n\nDeine ID: <code>${userId}</code>\nBitte bei Mago melden.`);
  }
  const text = msg.text.trim();
  // Freier Text (kein /) → KI, nur wenn ai-Modul freigeschaltet
  if (!text.startsWith("/")) {
    if (!hasModule(userId, "ai")) {
      return send(chatId, "🔒 Freitext-KI nicht freigeschaltet.\n\n<i>Frag Mago nach dem /ai Modul.</i>");
    }
    console.log(`[bot] Freitext → KI: "${text.slice(0, 60)}"`);
    return cmdFrag(chatId, text, msg.from);
  }
  const [cmdRaw, ...rest] = text.split(/\s+/);
  const cmd = cmdRaw.toLowerCase().replace(/@.*$/, ""); // /drill@BotName → /drill
  const arg = rest.join(" ").trim();
  try {
    // Admin-only commands (vor normalem Routing)
    if (isAdmin(userId)) {
      if (cmd === "/users") return cmdUsers(chatId);
      if (cmd === "/adduser") return cmdAddUser(chatId, arg);
      if (cmd === "/removeuser") return cmdRemoveUser(chatId, arg);
      if (cmd === "/grant") return cmdGrantModule(chatId, arg);
      if (cmd === "/revoke") return cmdRevokeModule(chatId, arg);
      if (cmd === "/setrole") return cmdSetRole(chatId, arg);
      if (cmd === "/admin") return cmdAdminPanel(chatId);
    }
    if (cmd === "/start" || cmd === "/help") return cmdStart(chatId, userId);
    // App-Einstieg: rollen-bewusst (Admin→Cockpit, Produkt-User→Lookup, sonst→Akademie)
    if (cmd === "/app" || cmd === "/cockpit") return cmdApp(chatId, userId);
    // === KI-Modul (nur mit 'ai'-Freigabe) ===
    if (cmd === "/frag" || cmd === "/ask" || cmd === "/ai") {
      if (!hasModule(userId, "ai")) return denyModule(chatId, "KI-Assistent");
      return cmdFrag(chatId, arg, msg.from);
    }
    // === Produkt-Wissen (nur mit 'produkt'-Freigabe) ===
    if (cmd === "/produkt" || cmd === "/p") {
      if (!hasModule(userId, "produkt")) return denyModule(chatId, "Produkt-Wissen");
      return cmdProdukt(chatId, userId, arg);
    }
    // === Akademie-Modul (Standard für alle, aber explizit modul-gated) ===
    const akademieCmds = ["/drill", "/marke", "/einwand", "/persona", "/rollenspiel", "/rollenspiele",
                          "/score", "/punkte", "/lern", "/learn", "/korrektur", "/quiz", "/tagesaufgabe", "/ta"];
    if (akademieCmds.includes(cmd) && !hasModule(userId, "akademie")) return denyModule(chatId, "Akademie");
    if (cmd === "/drill") return cmdDrill(chatId, arg);
    if (cmd === "/marke") return cmdMarke(chatId, arg);
    if (cmd === "/einwand") return cmdEinwand(chatId, arg);
    if (cmd === "/persona") return cmdPersona(chatId, arg);
    if (cmd === "/rollenspiel" || cmd === "/rollenspiele") return cmdRollenspiel(chatId);
    if (cmd === "/score" || cmd === "/punkte") return cmdScore(chatId, msg.from?.id, tgUserName(msg.from));
    if (cmd === "/lern" || cmd === "/learn" || cmd === "/korrektur") return cmdLern(chatId, arg, msg.from);
    if (cmd === "/quiz") return cmdQuiz(chatId, userId, arg);
    if (cmd === "/tagesaufgabe" || cmd === "/ta") return cmdTagesaufgabe(chatId, userId);
    if (cmd === "/check") return cmdCheck(chatId, userId, msg.from);
    if (cmd === "/fortschritt" || cmd === "/fp") return cmdFortschritt(chatId, userId, tgUserName(msg.from));
    return send(chatId, "Unbekannter Befehl. /start für die Hilfe.");
  } catch (e) {
    return send(chatId, "Fehler: " + esc(e.message));
  }
}

// === Long-Polling-Loop ===
async function pollLoop() {
  let offset = 0;
  // Webhook löschen falls gesetzt (sonst kollidiert mit getUpdates)
  await tgApi("deleteWebhook", { drop_pending_updates: false });
  const me = await tgApi("getMe");
  if (me.ok) console.log(`[telegram-bot] gestartet als @${me.result.username}`);
  else { console.error("[telegram-bot] getMe fehlgeschlagen:", me); process.exit(1); }
  // Befehls-Menü setzen
  const staffCommands = [
    { command: "frag", description: "KI-Assistent: Frage über HFK stellen (z.B. /frag offene Tasks)" },
    { command: "app", description: "MAGALOKO Cockpit öffnen (Mini App)" },
    { command: "drill", description: "Zufalls-Quiz mit Antwort-Buttons" },
    { command: "marke", description: "Marken-Steckbrief (z.B. /marke LIEWOOD)" },
    { command: "einwand", description: "Einwand-Antwort suchen (z.B. /einwand preis)" },
    { command: "persona", description: "Kunden-Typ (z.B. /persona anna)" },
    { command: "rollenspiel", description: "Zufalls-Trainingsszenario" },
    { command: "score", description: "Dein Lern-Fortschritt & Serie" },
    { command: "lern", description: "Bot eine Korrektur/Info beibringen" },
    { command: "quiz", description: "Gemischtes Quiz starten (3–10 Fragen, z.B. /quiz 7)" },
    { command: "tagesaufgabe", description: "Tägl. 3-Fragen-Challenge (☀️ neu jeden Tag)" },
    { command: "check", description: "Wissens-Check: Eingangstest → Training → Lernzuwachs messen" },
    { command: "fortschritt", description: "Dein Skill-Profil & Lernzuwachs (Pre→Post)" },
    { command: "produkt", description: "Produkt-Infos: Preis/Bestand/Marke (z.B. /produkt Tripp Trapp)" },
    { command: "start", description: "Hilfe & Befehlsübersicht" }
  ];
  await tgApi("setMyCommands", { commands: staffCommands });
  // Erweiterte Befehlsliste für jeden bekannten Admin (chat-scope)
  for (const adminId of ADMINS) {
    await tgApi("setMyCommands", {
      commands: [
        ...staffCommands,
        { command: "admin", description: "⚙️ Admin-Panel (interaktiv)" },
        { command: "users", description: "👥 Alle User + Verwaltungs-Buttons" },
        { command: "adduser", description: "➕ User hinzufügen: /adduser ID Name" },
        { command: "removeuser", description: "🗑 User entfernen: /removeuser ID" },
        { command: "setrole", description: "🔑 Rolle ändern: /setrole ID admin|mitarbeiter" },
        { command: "grant", description: "📦 Modul freischalten: /grant ID produkt|ai" },
        { command: "revoke", description: "🔒 Modul entziehen: /revoke ID produkt|ai" }
      ],
      scope: { type: "chat", chat_id: adminId }
    });
  }
  // SICHERHEIT: Default-Menübutton = NUR Befehlsliste (kein Cockpit-Web-App-Leak für
  // unbekannte/Mitarbeiter-User). Rollengerechte Web-App-Buttons werden pro Chat gesetzt.
  await tgApi("setChatMenuButton", { menu_button: { type: "commands" } });
  // Admins bekommen den vollen Cockpit-Button (chat-scoped)
  for (const adminId of ADMINS) {
    await tgApi("setChatMenuButton", {
      chat_id: adminId,
      menu_button: { type: "web_app", text: "🚀 Cockpit", web_app: { url: WEBAPP_URL } }
    });
  }
  console.log("[telegram-bot] Menübuttons rollengerecht gesetzt (Default=commands, Admin=Cockpit)");
  while (true) {
    try {
      const res = await tgApi("getUpdates", { offset, timeout: 50, allowed_updates: ["message", "callback_query"] });
      if (res.ok && res.result.length) {
        for (const u of res.result) {
          offset = u.update_id + 1;
          handleUpdate(u).catch((e) => console.error("[handleUpdate]", e.message));
        }
      }
    } catch (e) {
      console.error("[poll]", e.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

await loadConfig();
await pollLoop();
