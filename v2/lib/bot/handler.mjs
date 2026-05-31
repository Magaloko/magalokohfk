// MAGALOKO Telegram-Bot — Vercel Serverless Webhook (Phase 2).
// Portiert aus telegram-bot.mjs: Long-Poll → Webhook, Datei-IO → Supabase.
// Quiz/Check/Daily-State (früher RAM) liegt jetzt in der Tabelle bot_sessions.
import { db, tgConfig, webCodeHash, genWebCode } from "./db.mjs";
import { buildCopilotKB, copilotSystemPrompt } from "../copilot-kb.mjs";

// === Env / Config ===
const cfg = tgConfig();
const TOKEN = cfg.token;
const ALLOW_ALL = cfg.allowAllUsers === true;
// Env-Basis (fix) + Laufzeit-Merge aus bot_users (per-Chat verwaltet).
const ENV_ALLOWED = cfg.allowedUserIds;
const ENV_ADMINS = cfg.adminUserIds.length ? cfg.adminUserIds : cfg.allowedUserIds;
const ENV_USERS = {};
for (const [id, info] of Object.entries(cfg.users || {})) { const n = Number(id); if (Number.isInteger(n)) ENV_USERS[n] = info; }
let ALLOWED = [...ENV_ALLOWED];
let ADMINS = new Set(ENV_ADMINS);
let USERS = { ...ENV_USERS };
// Pro Webhook-Invocation: bot_users laden und mit der Env-Basis mergen.
async function loadAccess() {
  try {
    const { data } = await db.from("bot_users").select("uid,name,role,modules");
    const allow = new Set(ENV_ALLOWED), admins = new Set(ENV_ADMINS), users = { ...ENV_USERS };
    for (const r of (data || [])) {
      const uid = Number(r.uid); if (!Number.isInteger(uid)) continue;
      allow.add(uid);
      if (r.role === "admin") admins.add(uid);
      users[uid] = { name: r.name, role: r.role, modules: Array.isArray(r.modules) ? r.modules : [] };
    }
    ALLOWED = [...allow]; ADMINS = admins; USERS = users;
  } catch (e) { console.error("[loadAccess]", e.message); }
}
// bot_users-Helfer
async function dbUpsertUser(uid, fields) { await db.from("bot_users").upsert({ uid: Number(uid), ...fields }); }
async function dbRemoveUser(uid) { await db.from("bot_users").delete().eq("uid", Number(uid)); }
const WEBAPP_URL = process.env.WEBAPP_URL || "https://magalokohfk-xdnk.vercel.app";
const AI_KEY = process.env.BOT_AI_KEY || "";
const WEBHOOK_SECRET = process.env.TG_WEBHOOK_SECRET || "";

// === Telegram-API (fetch) ===
async function tgApi(method, params) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params || {})
    });
    return await r.json();
  } catch (e) { return { ok: false, error: e.message }; }
}
const send = (chatId, text, extra = {}) =>
  tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });
const BACK_KB = { reply_markup: { inline_keyboard: [[{ text: "⬅️ Menü", callback_data: "menu|main" }]] } };

// === Utils ===
function esc(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffleArr(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const QUIZ_LETTERS = ["A", "B", "C", "D"];
function tgUserName(from) { if (!from) return "Unbekannt"; return [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || ("User" + from.id); }
function fmtScore(s) { return Number.isInteger(s) ? String(s) : s.toFixed(1).replace(".", ","); }

// === Access ===
function isAllowed(uid) { uid = Number(uid); if (!Number.isInteger(uid)) return false; if (ALLOW_ALL) return true; if (uid in USERS) return true; if (!ALLOWED) return false; return ALLOWED.includes(uid); }
function isAdmin(uid) { uid = Number(uid); return Number.isInteger(uid) && ADMINS.has(uid); }
const ALL_MODULES = ["akademie", "produkt", "ai"];
// Policy: NUR Admin sieht alles. Alle anderen ausschließlich Akademie.
function getUserModules(uid) { return isAdmin(uid) ? ALL_MODULES : ["akademie"]; }
function hasModule(uid, mod) { return isAdmin(uid) || mod === "akademie"; }

// Variante B: feingranulare Akademie-Bereiche pro Person (bot_users.modules; leer = alle).
const AKADEMIE_AREAS = ["angebote", "personas", "einwaende", "szenarien", "drills", "rollenspiele", "marken"];
const AREA_LABEL = { angebote: "Angebote", personas: "Personas", einwaende: "Einwände", szenarien: "Szenarien", drills: "Drills", rollenspiele: "Rollenspiele", marken: "Marken" };
function getUserAreas(uid) {
  if (isAdmin(uid)) return AKADEMIE_AREAS.slice();
  const m = USERS[Number(uid)]?.modules;
  const a = Array.isArray(m) ? m.filter((x) => AKADEMIE_AREAS.includes(x)) : [];
  return a.length ? a : AKADEMIE_AREAS.slice(); // leer = alle Bereiche
}
function hasArea(uid, area) { return getUserAreas(uid).includes(area); }
// Quiz-Typen, die der User üben darf (drills→drill, einwaende→einwand, marken→marken)
function allowedQuizTypes(uid) {
  const a = getUserAreas(uid); const t = [];
  if (a.includes("drills")) t.push("drill");
  if (a.includes("einwaende")) t.push("einwand");
  if (a.includes("marken")) t.push("marken");
  return t;
}
function isPrivateChat(chat) { return chat?.type === "private"; }

// === Daten aus Supabase (app_state) ===
let _dc = null, _dt = 0;
async function loadData() {
  const now = Date.now();
  if (_dc && now - _dt < 8000) return _dc;
  const { data } = await db.from("app_state").select("data").eq("id", "hfk").maybeSingle();
  const st = data?.data || {};
  const ws = st.workspaces?.hfk?.data || st;
  _dc = { drills: ws.akademieDrills || [], marken: ws.akademieMarken || [], einwaende: ws.salesObjections || [], personas: ws.salesPersonas || [], roleplays: ws.akademieRoleplays || [] };
  _dt = now; return _dc;
}
async function loadFullState() {
  const { data } = await db.from("app_state").select("data").eq("id", "hfk").maybeSingle();
  const st = data?.data || {}; return st.workspaces?.hfk?.data || st;
}

// === Scores / Learnings / Sessions (Supabase) ===
async function appendScore(rec) {
  try {
    await db.from("bot_scores").insert({
      // ANONYMISIERT (DSGVO): keine Telegram-Klarnamen speichern — nur die pseudonyme uid.
      uid: rec.uid ? Number(rec.uid) : null, name: null, type: rec.type || null,
      item_id: rec.itemId || rec.drillId || null, correct: typeof rec.correct === "boolean" ? rec.correct : null,
      score: rec.score ?? null, total: rec.total ?? null, marke: rec.marke || null,
      topics: rec.topics || null, ts: rec.ts || new Date().toISOString()
    });
  } catch (e) { console.error("[appendScore]", e.message); }
}
async function loadScores() {
  const { data } = await db.from("bot_scores").select("uid,name,type,item_id,correct,score,total,marke,ts")
    .order("ts", { ascending: false }).limit(4000);
  return (data || []).reverse().map((r) => ({
    uid: Number(r.uid), name: r.name, type: r.type, itemId: r.item_id, drillId: r.item_id,
    correct: r.correct === true, score: r.score, total: r.total, marke: r.marke, ts: r.ts
  }));
}
async function loadLearnings() {
  const { data } = await db.from("bot_learnings").select("*").limit(500);
  return (data || []).map((r) => ({ id: r.id, keywords: r.keywords || [], topic: r.topic, correction: r.correction, addedAt: r.added_at, addedBy: r.added_by }));
}
async function saveLearning(e) {
  await db.from("bot_learnings").insert({ id: e.id, keywords: e.keywords, topic: e.topic, correction: e.correction, added_at: e.addedAt, added_by: e.addedBy });
}
function findRelevantLearnings(question, learnings) {
  const q = question.toLowerCase();
  return learnings.filter((l) => (l.keywords || []).some((kw) => q.includes(kw.toLowerCase())) || q.includes((l.topic || "").toLowerCase()));
}
async function getSess(uid) { const { data } = await db.from("bot_sessions").select("state").eq("uid", Number(uid)).maybeSingle(); return data?.state || {}; }
async function patchSess(uid, patch) { const cur = await getSess(uid); await db.from("bot_sessions").upsert({ uid: Number(uid), state: { ...cur, ...patch }, updated_at: new Date().toISOString() }); }

// === Quiz-Fragen-Generatoren (pur) ===
function makeDrillQ(drills, chooser = pick) {
  const pool = drills.filter((d) => (d.optionen || []).length >= 2 && d.optionen.some((o) => o.ist_richtig === true || (o.punkte || 0) > 0));
  if (!pool.length) return null;
  const drill = chooser(pool);
  const opts = shuffleArr(drill.optionen.map((o) => ({ text: (o.text || "").slice(0, 110), correct: o.ist_richtig === true || (o.punkte || 0) > 0, feedback: o.feedback || "" })));
  if (!opts.some((o) => o.correct)) return null;
  return { type: "drill", label: "⚡ Drill", itemId: drill.id || drill.frage || "", frage: `⚡ <b>Drill — ${esc(drill.marke || "allgemein")}</b>\n\n${esc(drill.frage || "")}`, opts, muster: drill.musterantwort ? `\n📝 <b>Musterantwort:</b> ${esc(drill.musterantwort)}` : "" };
}
function makeEinwandQ(einwaende, chooser = pick) {
  const pool = einwaende.filter((e) => e.antwort && e.antwort.trim().length >= 8);
  if (pool.length < 4) return null;
  const target = chooser(pool);
  const wrong3 = shuffleArr(pool.filter((e) => e !== target)).slice(0, 3);
  const opts = shuffleArr([{ text: target.antwort.slice(0, 110), correct: true, feedback: `✓ Beste Strategie bei „${target.kategorie || "diesem Einwand"}"` }, ...wrong3.map((e) => ({ text: e.antwort.slice(0, 110), correct: false, feedback: "✗ Das passt zu einem anderen Einwand-Typ." }))]);
  return { type: "einwand_mc", label: "💬 Einwand", itemId: target.id || target.einwand || "", frage: `💬 <b>Einwand-Training</b>\n\nKunde sagt:\n<i>„${esc(target.einwand)}"</i>\n\n<b>Welche Antwort ist am besten?</b>`, opts, muster: target.beweis ? `\n💡 ${esc(target.beweis.slice(0, 150))}` : "" };
}
function makeMarkenQ(marken, chooser = pick) {
  const named = marken.filter((m) => m.name);
  if (named.length < 4) return null;
  const target = chooser(named);
  // Falsch-Antwort-Pool: Markennamen, eindeutig (Set) und ohne den korrekten Namen — sonst doppelte/kollidierende Optionen.
  const otherNames = [...new Set(named.filter((m) => m !== target).map((m) => m.name).filter((n) => n && n !== target.name))];
  const heroName = (h) => (typeof h === "string" ? h : (h && h.name) || "");
  const id = target.id || target.name || "";
  // Frage-Varianten je nach Datenlage (Herkunft / USP / Hero-Produkt) — mehr Lernwert.
  const variants = [];
  if (target.herkunft?.land) variants.push(() => {
    const laender = [...new Set(named.map((m) => m.herkunft?.land).filter((l) => l && l !== target.herkunft.land))];
    if (laender.length < 3) return null;
    const opts = shuffleArr([{ text: target.herkunft.land, correct: true, feedback: `✓ ${target.name} kommt aus ${target.herkunft.land}${target.herkunft.gruendung ? ` (gegr. ${String(target.herkunft.gruendung)})` : ""}` }, ...shuffleArr(laender).slice(0, 3).map((l) => ({ text: l, correct: false, feedback: `✗ ${target.name} kommt aus ${target.herkunft.land}.` }))]);
    return { type: "marken_quiz", label: "🏷 Marke", itemId: id, frage: `🏷 <b>Marken-Quiz</b>\n\nAus welchem Land kommt <b>${esc(target.name)}</b>?`, opts, muster: target.philosophie ? `\n<i>„${esc(target.philosophie.slice(0, 120))}"</i>` : "" };
  });
  const usp = (target.usps || []).map((u) => (typeof u === "string" ? u : (u?.argument || u?.text || ""))).find((u) => u && u.trim().length >= 8);
  if (usp && otherNames.length >= 3) variants.push(() => {
    const opts = shuffleArr([{ text: target.name, correct: true, feedback: `✓ Das ist ein USP von ${target.name}.` }, ...shuffleArr(otherNames).slice(0, 3).map((n) => ({ text: n, correct: false, feedback: `✗ Das ist ein USP von ${target.name}.` }))]);
    return { type: "marken_quiz", label: "🏷 Marke", itemId: id, frage: `🏷 <b>Marken-Quiz</b>\n\nWelche Marke wirbt mit:\n<i>„${esc(usp.slice(0, 140))}"</i>`, opts, muster: "" };
  });
  const hero = (target.hero_produkte || []).map(heroName).find((h) => h && h.trim().length >= 2);
  if (hero && otherNames.length >= 3) variants.push(() => {
    const opts = shuffleArr([{ text: target.name, correct: true, feedback: `✓ „${hero}" gehört zu ${target.name}.` }, ...shuffleArr(otherNames).slice(0, 3).map((n) => ({ text: n, correct: false, feedback: `✗ „${hero}" gehört zu ${target.name}.` }))]);
    return { type: "marken_quiz", label: "🏷 Marke", itemId: id, frage: `🏷 <b>Marken-Quiz</b>\n\nZu welcher Marke gehört <b>${esc(hero)}</b>?`, opts, muster: "" };
  });
  if (!variants.length) return null;
  for (const v of shuffleArr(variants)) { const q = v(); if (q) return q; }
  return null;
}

// === Adaptiv + Spaced Repetition (pur) ===
function scoreTopic(rec) { const t = String(rec.type || ""); if (t === "drill" || t === "quiz_drill") return "drill"; if (t === "einwand_mc" || t === "quiz_einwand_mc") return "einwand"; if (t === "marken_quiz" || t === "quiz_marken_quiz") return "marken"; return null; }
const TOPIC_LABEL = { drill: "⚡ Drills", einwand: "💬 Einwände", marken: "🏷 Marken" };
async function computeSkillProfile(userId) {
  const uid = Number(userId);
  const scores = (await loadScores()).filter((r) => Number(r.uid) === uid);
  const buckets = { drill: [], einwand: [], marken: [] };
  for (const r of scores) { const tp = scoreTopic(r); if (tp) buckets[tp].push(r.correct === true); }
  const profile = {};
  for (const [tp, arr] of Object.entries(buckets)) {
    if (!arr.length) { profile[tp] = { total: 0, correct: 0, skill: 0.5, seen: false }; continue; }
    const total = arr.length, correct = arr.filter(Boolean).length;
    const recent = arr.slice(-10);
    profile[tp] = { total, correct, skill: 0.6 * (correct / total) + 0.4 * (recent.filter(Boolean).length / recent.length), seen: true };
  }
  return profile;
}
async function buildItemHistory(userId) {
  const uid = Number(userId);
  const scores = (await loadScores()).filter((r) => Number(r.uid) === uid);
  const hist = { drill: new Map(), einwand: new Map(), marken: new Map() };
  for (const r of scores) { const tp = scoreTopic(r); if (!tp) continue; const id = r.itemId || r.drillId; if (!id) continue; const ts = Date.parse(r.ts) || 0; if (!hist[tp].has(id)) hist[tp].set(id, []); hist[tp].get(id).push({ correct: r.correct === true, ts }); }
  for (const m of Object.values(hist)) for (const arr of m.values()) arr.sort((a, b) => a.ts - b.ts);
  return hist;
}
function srWeight(historyArr, nowMs) {
  if (!historyArr || !historyArr.length) return 1.0;
  const last = historyArr[historyArr.length - 1];
  if (!last.correct) return 2.5;
  let consec = 0; for (let i = historyArr.length - 1; i >= 0 && historyArr[i].correct; i--) consec++;
  const intervalDays = Math.pow(2, consec);
  return (nowMs - last.ts) / 86400000 >= intervalDays ? 1.2 : 0.25;
}
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
async function generateAdaptiveQuiz(profile, n = 5, itemHist = null, allowedTypes = null) {
  const d = await loadData();
  const nowMs = Date.now();
  const ok = (t) => !allowedTypes || allowedTypes.includes(t);
  const dC = itemHist ? makeSrChooser(itemHist.drill, (x) => x.id || x.frage || "", nowMs) : pick;
  const eC = itemHist ? makeSrChooser(itemHist.einwand, (x) => x.id || x.einwand || "", nowMs) : pick;
  const mC = itemHist ? makeSrChooser(itemHist.marken, (x) => x.id || x.name || "", nowMs) : pick;
  const avail = [];
  if (ok("drill") && d.drills.length >= 2) avail.push({ topic: "drill", gen: () => makeDrillQ(d.drills, dC) });
  if (ok("einwand") && d.einwaende.length >= 4) avail.push({ topic: "einwand", gen: () => makeEinwandQ(d.einwaende, eC) });
  if (ok("marken") && d.marken.length >= 4) avail.push({ topic: "marken", gen: () => makeMarkenQ(d.marken, mC) });
  if (!avail.length) return [];
  const weightOf = (t) => Math.max(0.15, 1 - (profile[t]?.skill ?? 0.5));
  const questions = []; let attempts = 0;
  while (questions.length < n && attempts < n * 10) {
    attempts++;
    const weights = avail.map((a) => weightOf(a.topic));
    const sum = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * sum, chosen = avail[avail.length - 1];
    for (let i = 0; i < avail.length; i++) { r -= weights[i]; if (r <= 0) { chosen = avail[i]; break; } }
    const q = chosen.gen(); if (q) questions.push(q);
  }
  return questions.slice(0, n);
}
function adaptiveFocusNote(profile) {
  const seen = Object.entries(profile).filter(([, v]) => v.seen);
  if (!seen.length) return "🎯 <i>Adaptiv: nach ein paar Runden fokussiert das Quiz automatisch deine schwächsten Themen.</i>";
  const weakest = seen.sort((a, b) => a[1].skill - b[1].skill)[0];
  return `🎯 <i>Adaptiv — Fokus auf dein schwächstes Thema: ${TOPIC_LABEL[weakest[0]]} (${Math.round(weakest[1].skill * 100)} %). Fragen, die du zuletzt falsch hattest, kommen gezielt wieder.</i>`;
}
function quizHint(q) {
  if (q.type === "einwand_mc") return "💡 <b>Tipp:</b> Welche Antwort geht auf die <i>eigentliche Sorge</i> des Kunden ein — ohne dich zu rechtfertigen?";
  if (q.type === "marken_quiz") return "💡 <b>Tipp:</b> Denk an die Design-Tradition & Herkunft der Marke.";
  return "💡 <b>Tipp:</b> Überleg das stärkste Verkaufsargument — die Antwort mit dem größten Kundennutzen.";
}

// === Pre/Post-Check ===
const CHECK_MIN_DAYS = 7, CHECK_N = 9;
async function generateCheckQuestions() {
  const d = await loadData(); const qs = [];
  for (let i = 0; i < 6 && qs.filter((q) => q.type === "drill").length < 3; i++) { const q = makeDrillQ(d.drills); if (q) qs.push(q); }
  for (let i = 0; i < 6 && qs.filter((q) => q.type === "einwand_mc").length < 3; i++) { const q = makeEinwandQ(d.einwaende); if (q) qs.push(q); }
  for (let i = 0; i < 6 && qs.filter((q) => q.type === "marken_quiz").length < 3; i++) { const q = makeMarkenQ(d.marken); if (q) qs.push(q); }
  return shuffleArr(qs).slice(0, CHECK_N);
}
function checkTopicScores(questions, results) {
  const topics = { drill: { c: 0, t: 0 }, einwand_mc: { c: 0, t: 0 }, marken_quiz: { c: 0, t: 0 } };
  questions.forEach((q, i) => { if (!topics[q.type]) return; topics[q.type].t++; if (results[i]?.correct) topics[q.type].c++; });
  return topics;
}
function checkTopicLine(label, icon, pre, post) {
  const pct = (v) => v.t ? Math.round(v.c / v.t * 100) : null;
  const prePct = pct(pre), postPct = pct(post);
  if (prePct === null) return null;
  if (postPct === null) return `${icon} ${label}: <b>${prePct}%</b> (${pre.c}/${pre.t}) — kein Post-Check`;
  const diff = postPct - prePct;
  return `${icon} ${label}: ${prePct}% → <b>${postPct}%</b> (${diff > 0 ? `📈 +${diff}%` : diff < 0 ? `📉 ${diff}%` : "➡️ ±0%"})`;
}
function renderQuizMsg(q, qi, total, streak = 0) {
  const fill = "▓".repeat(qi), empty = "░".repeat(total - qi);
  const streakTag = streak >= 2 ? `  🔥${streak}` : "";
  const optLines = q.opts.map((o, i) => `${QUIZ_LETTERS[i]}) ${esc(o.text)}`).join("\n");
  const text = `${fill}${empty} <b>${qi + 1}/${total}</b> · ${q.label || ""}${streakTag}\n\n${q.frage}\n\n${optLines}`;
  return { text: text.slice(0, 4000), keyboard: { inline_keyboard: [q.opts.map((_, i) => ({ text: QUIZ_LETTERS[i], callback_data: `quiz_ans|${qi}|${i}` }))] } };
}

// === Commands: Menu / Start ===
function setUserMenuButton(chatId, userId) {
  let btn;
  if (isAdmin(userId)) btn = { type: "web_app", text: "🚀 Cockpit", web_app: { url: WEBAPP_URL + "/heute" } };
  else btn = { type: "web_app", text: "🎓 Akademie", web_app: { url: WEBAPP_URL + "/akademie" } };
  tgApi("setChatMenuButton", { chat_id: chatId, menu_button: btn }).catch(() => {});
}
async function sendMenu(chatId, userId) {
  setUserMenuButton(chatId, userId);
  const areas = getUserAreas(userId);
  const btns = [];
  if (areas.includes("drills")) btns.push({ text: "⚡ Drill", callback_data: "menu|drill" });
  if (areas.includes("marken")) btns.push({ text: "🏷️ Marke", callback_data: "menu|marken" });
  if (areas.includes("einwaende")) btns.push({ text: "💬 Einwand", callback_data: "menu|einwand" });
  if (areas.includes("rollenspiele")) btns.push({ text: "🎭 Rollenspiel", callback_data: "menu|rollenspiel" });
  if (areas.includes("personas")) btns.push({ text: "👤 Persona", callback_data: "menu|persona" });
  if (allowedQuizTypes(userId).length) { btns.push({ text: "🎯 Quiz", callback_data: "menu|quiz" }); btns.push({ text: "☀️ Tagesaufgabe", callback_data: "menu|tagesaufgabe" }); }
  btns.push({ text: "📊 Score", callback_data: "menu|score" });
  if (isAdmin(userId)) btns.push({ text: "📚 Lehren", callback_data: "menu|lern" });
  btns.push({ text: "🧠 Copilot", callback_data: "menu|copilot" });
  const rows = []; for (let i = 0; i < btns.length; i += 3) rows.push(btns.slice(i, i + 3));
  if (isAdmin(userId)) { rows.push([{ text: "📱 Cockpit", web_app: { url: WEBAPP_URL + "/heute" } }, { text: "👔 Stephan", web_app: { url: WEBAPP_URL + "/cockpit/stephan" } }]); rows.push([{ text: "⚙️ Admin", callback_data: "admin|panel" }]); }
  return tgApi("sendMessage", { chat_id: chatId, text: "<b>🎯 VEKTRA</b> — Was möchtest du tun?", parse_mode: "HTML", reply_markup: { inline_keyboard: rows } });
}
async function cmdStart(chatId, userId) {
  const lines = ["🎓 <b>HFK Verkaufs-Akademie</b>", "", "Trainiere Produktwissen & Verkauf — direkt im Chat.", "", "<b>🎯 Training:</b>", "/drill — Zufalls-Quiz", "/quiz — Gemischtes Quiz (z.B. <code>/quiz 7</code>)", "/tagesaufgabe — Tägliche Challenge ☀️", "/marke <i>LIEWOOD</i> · /einwand <i>preis</i> · /persona <i>anna</i>", "/rollenspiel · /score · /lern", "/check — Wissens-Check · /fortschritt — Skill-Profil", "", "<b>🧠 Microsoft Copilot:</b>", "/copilot — Hilfe & Schritt-für-Schritt zu Outlook, Excel, Word, Teams"];
  if (hasModule(userId, "ai")) lines.push("/frag <i>…</i> — KI-Assistent");
  if (isAdmin(userId)) lines.push("", "<b>⚙️ Admin:</b>", "/admin — Panel (User + Bereiche)", "/adduser <i>ID Name</i> · /setrole <i>ID admin|mitarbeiter</i> · /removeuser <i>ID</i>", "/grant <i>ID bereich</i> · /revoke <i>ID bereich</i> — Akademie-Bereiche je Person", "/webcode <i>ID</i> — Web-Login-Code für Browser-Zugang");
  await send(chatId, lines.join("\n"));
  return sendMenu(chatId, userId);
}
function denyModule(chatId, modLabel) { return send(chatId, `🔒 <b>${modLabel}</b> ist für deine Rolle nicht freigeschaltet.\n\nNutze: /drill /quiz /marke /einwand`); }

async function cmdMarkenMenu(chatId) {
  const d = await loadData(); if (!d.marken.length) return send(chatId, "Keine Marken geladen.", BACK_KB);
  const btns = d.marken.map((m) => ({ text: m.name, callback_data: `brand|${String(m.id || m.name || "").slice(0, 60)}` }));
  const rows = []; for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2)); rows.push([{ text: "⬅️ Menü", callback_data: "menu|main" }]);
  return tgApi("sendMessage", { chat_id: chatId, text: "🏷️ <b>Welche Marke?</b>", parse_mode: "HTML", reply_markup: { inline_keyboard: rows } });
}
async function cmdEinwandMenu(chatId) {
  const d = await loadData();
  let kategorien = [...new Set(d.einwaende.map((e) => e.kategorie).filter(Boolean))].slice(0, 10);
  if (!kategorien.length) kategorien = ["Preis", "Lieferung", "Amazon", "Qualität", "Notwendigkeit", "Marke"];
  const btns = kategorien.map((k) => ({ text: k, callback_data: `einwand|${k.slice(0, 60)}` }));
  const rows = []; for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2)); rows.push([{ text: "⬅️ Menü", callback_data: "menu|main" }]);
  return tgApi("sendMessage", { chat_id: chatId, text: "💬 <b>Welche Einwand-Kategorie?</b>", parse_mode: "HTML", reply_markup: { inline_keyboard: rows } });
}
async function cmdPersonaMenu(chatId) {
  const d = await loadData(); if (!d.personas.length) return send(chatId, "Keine Personas geladen.", BACK_KB);
  const btns = d.personas.map((p) => ({ text: p.name, callback_data: `persona|${String(p.id || p.name || "").slice(0, 60)}` }));
  const rows = []; for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2)); rows.push([{ text: "⬅️ Menü", callback_data: "menu|main" }]);
  return tgApi("sendMessage", { chat_id: chatId, text: "👤 <b>Welche Persona?</b>", parse_mode: "HTML", reply_markup: { inline_keyboard: rows } });
}

async function cmdDrill(chatId, markeArg) {
  const d = await loadData(); let pool = d.drills;
  if (markeArg) pool = pool.filter((x) => norm(x.marke).includes(norm(markeArg)));
  if (!pool.length) return send(chatId, "Keine Drills gefunden" + (markeArg ? ` für „${esc(markeArg)}"` : "") + ".");
  const drill = pick(pool);
  const keyboard = (drill.optionen || []).map((o, i) => [{ text: `${String.fromCharCode(65 + i)}) ${(o.text || "").slice(0, 60)}`, callback_data: `drill|${drill.id}|${i}` }]);
  await send(chatId, `<b>⚡ Drill — ${esc(drill.marke || "allgemein")}</b>\n\n${esc(drill.frage || "")}`, { reply_markup: { inline_keyboard: keyboard } });
}
async function handleDrillAnswer(cbq) {
  const [, drillId, optIdxStr] = (cbq.data || "").split("|");
  const d = await loadData(); const drill = d.drills.find((x) => x.id === drillId);
  if (!drill) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Drill nicht mehr verfügbar" });
  const opt = (drill.optionen || [])[parseInt(optIdxStr, 10)];
  const correct = opt && (opt.ist_richtig === true || opt.punkte > 0);
  tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: correct ? "✓ Richtig!" : "✗ Leider falsch" }).catch(() => {});
  await appendScore({ ts: new Date().toISOString(), uid: cbq.from?.id, name: tgUserName(cbq.from), type: "drill", drillId, marke: drill.marke || "", correct: !!correct });
  const fb = opt?.feedback || (correct ? "Richtig!" : "Leider falsch.");
  const muster = drill.musterantwort ? `\n\n<b>Musterantwort:</b>\n${esc(drill.musterantwort)}` : "";
  await send(cbq.message.chat.id, `${correct ? "✅" : "❌"} <b>${esc(drill.frage || "")}</b>\n\n${esc(fb)}${muster}`, { reply_markup: { inline_keyboard: [[{ text: "⚡ Nächster Drill", callback_data: "menu|drill" }], [{ text: "⬅️ Menü", callback_data: "menu|main" }]] } });
}

async function cmdMarke(chatId, arg) {
  const d = await loadData();
  if (!arg) return send(chatId, "Welche Marke? Z.B. <code>/marke LIEWOOD</code>\n\n<b>Verfügbar:</b> " + esc(d.marken.map((m) => m.name).filter(Boolean).join(", ")));
  const m = d.marken.find((x) => norm(x.name).includes(norm(arg)));
  if (!m) return send(chatId, `Marke „${esc(arg)}" nicht gefunden.`);
  const herk = m.herkunft || {};
  const heroes = (m.hero_produkte || m.top_produkte || []).slice(0, 3).map((h) => typeof h === "string" ? h : (h.name || h.produkt || "")).filter(Boolean);
  const args = (m.verkaufsargumente || m.usps || []).slice(0, 5).map((a) => typeof a === "string" ? a : (a.argument || a.text || "")).filter(Boolean);
  const kat = (m.kategorien || []).slice(0, 6).map((k) => typeof k === "string" ? k : (k.name || "")).filter(Boolean);
  let txt = `<b>📕 ${esc(m.name)}</b>\n<i>${esc([herk.land, herk.stadt, herk.gruendung].filter(Boolean).join(" · "))}</i>\n\n`;
  if (m.philosophie) txt += `„${esc(m.philosophie)}"\n\n`;
  if (kat.length) txt += `<b>Kategorien:</b> ${esc(kat.join(", "))}\n\n`;
  if (heroes.length) txt += `<b>Hero-Produkte:</b>\n${heroes.map((h) => "• " + esc(h)).join("\n")}\n\n`;
  if (args.length) txt += `<b>Verkaufsargumente:</b>\n${args.map((a) => "✓ " + esc(a)).join("\n")}`;
  await send(chatId, txt.slice(0, 4000), BACK_KB);
}
async function cmdEinwand(chatId, arg) {
  const d = await loadData();
  if (!arg) return send(chatId, "Stichwort? Z.B. <code>/einwand preis</code>");
  const q = norm(arg);
  const hits = d.einwaende.filter((e) => norm(e.einwand).includes(q) || norm(e.kategorie).includes(q) || norm(e.antwort).includes(q)).slice(0, 3);
  if (!hits.length) return send(chatId, `Kein Einwand zu „${esc(arg)}" gefunden.`, BACK_KB);
  for (let i = 0; i < hits.length; i++) {
    const e = hits[i];
    let txt = `<b>💬 „${esc(e.einwand)}"</b>\n<i>${esc(e.kategorie || "")}</i>\n\n`;
    if (e.antwort) txt += `<b>Antwort:</b> ${esc(e.antwort)}\n`;
    if (e.beweis) txt += `\n<b>Beweis:</b> ${esc(e.beweis)}`;
    await send(chatId, txt.slice(0, 4000), i === hits.length - 1 ? BACK_KB : {});
  }
}
async function cmdPersona(chatId, arg) {
  const d = await loadData();
  if (!arg) return send(chatId, "Welche Persona? Z.B. <code>/persona anna</code>\n\n<b>Verfügbar:</b> " + esc(d.personas.map((p) => p.name).filter(Boolean).join(", ")));
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
  const mine = (await loadScores()).filter((s) => s.uid === Number(userId) && (s.type === "drill" || (typeof s.type === "string" && s.type.startsWith("quiz"))));
  if (!mine.length) return send(chatId, "Noch keine Übungen absolviert. /drill oder /quiz starten!");
  const total = mine.length, correct = mine.filter((s) => s.correct).length, pct = Math.round((correct / total) * 100);
  const byMarke = {};
  mine.forEach((s) => { const m = s.marke || "allgemein"; byMarke[m] = byMarke[m] || { total: 0, correct: 0 }; byMarke[m].total++; if (s.correct) byMarke[m].correct++; });
  let streak = 0; for (let i = mine.length - 1; i >= 0; i--) { if (mine[i].correct) streak++; else break; }
  const markeLines = Object.entries(byMarke).sort((a, b) => b[1].total - a[1].total).slice(0, 8).map(([m, s]) => `  ${esc(m)}: ${s.correct}/${s.total} (${Math.round(s.correct / s.total * 100)}%)`).join("\n");
  await send(chatId, `<b>📊 Dein Score, ${esc(userName)}</b>\n\nAntworten gesamt: <b>${total}</b>\nRichtig: <b>${correct}</b> (${pct}%)\nAktuelle Serie: <b>${streak}</b> ${streak >= 3 ? "🔥" : ""}\n\n<b>Nach Marke:</b>\n${markeLines}`, BACK_KB);
}
async function cmdRollenspiel(chatId) {
  const d = await loadData(); if (!d.roleplays.length) return send(chatId, "Keine Rollenspiele verfügbar.");
  const rp = pick(d.roleplays);
  let txt = `<b>🎭 ${esc(rp.titel || "Rollenspiel")}</b>\n\n<b>Persona:</b> ${esc(rp.persona || "")}\n<b>Setting:</b> ${esc(rp.setting || "")}\n<b>Technik:</b> ${esc(rp.verkaufstechnik || "")} · <b>Ziel-AOV:</b> €${esc(String(rp.ziel_aov || "—"))}\n\n`;
  if ((rp.ablauf || []).length) txt += `<b>Ablauf:</b>\n${rp.ablauf.map((s) => `${s.schritt || "•"}. <b>${esc(s.name || "")}</b> — ${esc((s.beschreibung || "").slice(0, 120))}`).join("\n")}\n\n`;
  if ((rp.einwaende || []).length) txt += `<b>Einwände:</b>\n${rp.einwaende.map((e) => `• „${esc(e.einwand)}" → <i>${esc(e.erwartete_technik || "")}</i>`).join("\n")}`;
  await send(chatId, txt.slice(0, 4000), { reply_markup: { inline_keyboard: [[{ text: "🎭 Nächstes", callback_data: "menu|rollenspiel" }], [{ text: "⬅️ Menü", callback_data: "menu|main" }]] } });
}
async function cmdLern(chatId, content, from) {
  if (!content.trim()) return send(chatId, "📚 <b>Bot-Lernen</b>\n\nSyntax: <code>/lern STICHWORT: Korrektur</code>\n\nBeispiel:\n<code>/lern finkid: Kommt aus Deutschland, nicht Finnland</code>", BACK_KB);
  const colonIdx = content.indexOf(":");
  let keywords = [], correctionText = content;
  if (colonIdx > 0) { keywords = [content.slice(0, colonIdx).trim().toLowerCase()]; correctionText = content.slice(colonIdx + 1).trim(); }
  await saveLearning({ id: `lrn-${Date.now()}`, keywords, topic: keywords[0] || "allgemein", correction: correctionText, addedAt: new Date().toISOString().slice(0, 10), addedBy: tgUserName(from) });
  return send(chatId, `✅ <b>Gelernt!</b>\n\n<b>Stichwort:</b> ${esc(keywords[0] || "allgemein")}\n<b>Info:</b> ${esc(correctionText.slice(0, 200))}`, BACK_KB);
}

// === KI ===
async function callAI(messages) {
  if (!AI_KEY) throw new Error("NO_KEY");
  const r = await fetch("https://api.deepseek.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_KEY}` }, body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: 1200, temperature: 0.65 }) });
  const j = await r.json(); const t = j.choices?.[0]?.message?.content;
  if (!t) throw new Error(j.error?.message || "Leere Antwort"); return t;
}
function buildContext(question, ws) {
  const q = question.toLowerCase(); const parts = [];
  parts.push("Datum: " + new Date().toLocaleDateString("de-AT", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
  if (q.match(/aufgabe|task|todo|offen|nächste/)) { const t = (ws.tasks || []).filter((x) => x.status !== "done" && x.status !== "erledigt").slice(0, 12); if (t.length) parts.push(`Offene Aufgaben:\n${t.map((x) => `• ${x.title || x.text || x.name} [${x.status || "offen"}]`).join("\n")}`); }
  if (q.match(/entscheidung|stephan|pitch|angebot/)) { const ds = (ws.stephanDecisions || []).slice(0, 8); if (ds.length) parts.push(`Entscheidungen:\n${ds.map((x) => `• ${x.titel || x.title}`).join("\n")}`); }
  if (q.match(/marke|liewood|stokke|joolz|produkt/)) { const ms = (ws.akademieMarken || []).slice(0, 12); if (ms.length) parts.push(`Marken: ${ms.map((m) => m.name).filter(Boolean).join(", ")}`); }
  if (q.match(/kpi|umsatz|woche|zahlen/)) { const k = (ws.weeklyKpis || []).slice(-4); if (k.length) parts.push(`KPIs:\n${k.map((x) => JSON.stringify(x).slice(0, 200)).join("\n")}`); }
  return parts.join("\n\n");
}
async function cmdFrag(chatId, question, from) {
  if (!question.trim()) return send(chatId, "🤖 <b>Frag mich etwas über HFK!</b>\n\nz.B. „Was sind offene Tasks?“ oder „Was weiß ich über Liewood?“\n\n<i>Oder schreib die Frage direkt ohne /frag.</i>");
  // Einfacher Anti-Spam-Throttle (min. 5 s zwischen KI-Fragen je Nutzer).
  const fragUid = from?.id;
  if (fragUid) {
    const s = await getSess(fragUid); const now = Date.now();
    if (now - (Number(s.lastFrag) || 0) < 5000) return send(chatId, "⏳ Bitte ein paar Sekunden zwischen den KI-Fragen warten.");
    await patchSess(fragUid, { lastFrag: now });
  }
  await tgApi("sendChatAction", { chat_id: chatId, action: "typing" });
  try {
    const ws = await loadFullState(); if (!ws) throw new Error("State nicht verfügbar");
    const context = buildContext(question, ws);
    const relevant = findRelevantLearnings(question, await loadLearnings());
    const learningsContext = relevant.length ? `\n\n⚠️ KORREKTUREN (haben Vorrang):\n${relevant.map((l) => `• ${l.topic}: ${l.correction}`).join("\n")}` : "";
    const messages = [
      { role: "system", content: "Du bist Mago, KI-Assistent für HFK (Babyfachhandel Wien/Österreich). Antworte auf Deutsch, präzise, Telegram-HTML (<b>,<i>,<code>), kein Markdown. Nutze ⚠️ KORREKTUREN mit höchster Priorität. Erfinde nichts. Max 400 Wörter." },
      { role: "user", content: context ? `VEKTRA-Kontext:\n${context}${learningsContext}\n\n---\nFrage von ${esc(tgUserName(from))}: ${question}` : `${learningsContext}\n\nFrage: ${question}` }
    ];
    const answer = await callAI(messages);
    for (let i = 0; i < answer.length; i += 4000) await send(chatId, answer.slice(i, i + 4000));
  } catch (e) {
    if (e.message === "NO_KEY") return send(chatId, "⚙️ Kein KI-Key konfiguriert (Vercel-Env <code>BOT_AI_KEY</code>).");
    console.error("[cmdFrag]", e.message);
    return send(chatId, "⚠️ KI-Anfrage fehlgeschlagen. Versuch es nochmal.");
  }
}

// === Cockpilot: Microsoft-365-Copilot-Hilfe (Chat-Modus) ===
// Nutzt die gemeinsame, ausführliche Wissensbasis (lib/copilot-kb.mjs) — identisch zur Web-App.
async function cmdCopilotStart(chatId, uid) {
  if (!AI_KEY) return send(chatId, "⚙️ Kein KI-Key konfiguriert (<code>BOT_AI_KEY</code>).");
  await patchSess(uid, { copilot: { messages: [] } });
  return send(chatId,
    "🧠 <b>Cockpilot — Microsoft-Copilot-Hilfe</b>\n\nStell mir jede Frage zu Microsoft 365 Copilot (Outlook, Excel, Word, Teams) — ich gebe dir eine Schritt-für-Schritt-Anleitung.\n\n<i>z.B. „Wie fasse ich meinen Posteingang in Outlook zusammen?“</i>\n\nBeenden: /stop",
    { reply_markup: { inline_keyboard: [[{ text: "✖️ Beenden", callback_data: "copilot|exit" }]] } });
}
async function cmdCopilotMessage(chatId, uid, text, sess) {
  if (!AI_KEY) return send(chatId, "⚙️ Kein KI-Key konfiguriert (<code>BOT_AI_KEY</code>).");
  const hist = Array.isArray(sess.copilot?.messages) ? sess.copilot.messages : [];
  const q = text.slice(0, 2000);
  await tgApi("sendChatAction", { chat_id: chatId, action: "typing" });
  const today = new Date().toISOString().slice(0, 10);
  let answer;
  try {
    answer = await callAI([{ role: "system", content: copilotSystemPrompt(buildCopilotKB(), today, "telegram") }, ...hist.slice(-8), { role: "user", content: q }]);
  } catch (e) {
    if (e.message === "NO_KEY") return send(chatId, "⚙️ Kein KI-Key konfiguriert (<code>BOT_AI_KEY</code>).");
    console.error("[copilot]", e.message);
    return send(chatId, "⚠️ KI-Anfrage fehlgeschlagen. Versuch es nochmal.");
  }
  const newHist = [...hist, { role: "user", content: q }, { role: "assistant", content: answer }].slice(-12);
  await patchSess(uid, { copilot: { messages: newHist } });
  const kb = { reply_markup: { inline_keyboard: [[{ text: "✖️ Beenden", callback_data: "copilot|exit" }]] } };
  for (let i = 0; i < answer.length; i += 4000) await send(chatId, answer.slice(i, i + 4000), i + 4000 >= answer.length ? kb : {});
}

// === Quiz-Flow (Session in Supabase) ===
async function cmdQuiz(chatId, userId, nArg) {
  const types = allowedQuizTypes(userId);
  if (!types.length) return send(chatId, "🔒 Für deine Freigabe ist kein Quiz verfügbar.", BACK_KB);
  const n = Math.min(Math.max(parseInt(nArg || "5", 10) || 5, 3), 10);
  const profile = await computeSkillProfile(userId);
  const questions = await generateAdaptiveQuiz(profile, n, await buildItemHistory(userId), types);
  if (!questions.length) return send(chatId, "❌ Keine Quiz-Fragen verfügbar.", BACK_KB);
  await patchSess(userId, { quiz: { questions, idx: 0, score: 0, streak: 0, best: 0, type: "quiz", attempt: 0 } });
  await send(chatId, adaptiveFocusNote(profile));
  const { text, keyboard } = renderQuizMsg(questions[0], 0, n, 0);
  return tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: keyboard });
}
async function cmdTagesaufgabe(chatId, userId) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = (await getSess(userId)).daily;
  if (existing?.date === today && existing.done) {
    const s = existing.score, e = s === 3 ? "🏆 Perfekt!" : s >= 2 ? "🎯 Stark!" : "📚 Weiter üben!";
    return send(chatId, `☀️ <b>Tages-Aufgabe — ${today}</b>\n\nHeute bereits erledigt!\n\nScore: <b>${s}/3</b> ${e}`, BACK_KB);
  }
  const types = allowedQuizTypes(userId);
  if (!types.length) return send(chatId, "🔒 Für deine Freigabe ist keine Tages-Aufgabe verfügbar.", BACK_KB);
  const profile = await computeSkillProfile(userId);
  const questions = await generateAdaptiveQuiz(profile, 3, await buildItemHistory(userId), types);
  if (!questions.length) return send(chatId, "❌ Keine Fragen verfügbar.", BACK_KB);
  await patchSess(userId, { quiz: { questions, idx: 0, score: 0, streak: 0, best: 0, type: "tagesaufgabe", attempt: 0 }, daily: { date: today, done: false, score: 0 } });
  await send(chatId, `☀️ <b>Tages-Aufgabe — ${today}</b>\n\n3 gemischte Fragen. Bleib scharf!`);
  const { text, keyboard } = renderQuizMsg(questions[0], 0, 3, 0);
  return tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: keyboard });
}
async function cmdCheck(chatId, userId, from) {
  const types = allowedQuizTypes(userId);
  if (!["drill", "einwand", "marken"].every((t) => types.includes(t))) return send(chatId, "🔒 Der Wissens-Check braucht Zugriff auf Drills, Einwände und Marken.", BACK_KB);
  const sess = await getSess(userId); const stored = sess.check; const now = Date.now();
  if (stored?.preTs && !stored.postTs) {
    const daysSince = (now - stored.preTs) / 86400000;
    if (daysSince < CHECK_MIN_DAYS) {
      const avail = new Date(stored.preTs + CHECK_MIN_DAYS * 86400000).toLocaleDateString("de-AT");
      return send(chatId, `🧪 <b>Lern-Check</b>\n\nDein Pre-Check war am ${new Date(stored.preTs).toLocaleDateString("de-AT")}.\nPost-Check ab <b>${avail}</b> verfügbar.\n\n<i>Übe bis dahin mit /quiz.</i>`, BACK_KB);
    }
    await send(chatId, `🧪 <b>Post-Check</b>\n\nDieselben ${stored.questions.length} Fragen wie beim Pre-Check.\n<i>Kein Hint — ehrliche Messung.</i>`);
    await patchSess(userId, { quiz: { questions: stored.questions, idx: 0, score: 0, type: "post-check", attempt: 0, results: [] } });
    const { text, keyboard } = renderQuizMsg(stored.questions[0], 0, stored.questions.length, 0);
    return tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: keyboard });
  }
  if (stored?.postTs) return send(chatId, `✅ <b>Lern-Check abgeschlossen!</b>\n\nNutze /fortschritt für die Auswertung.`, BACK_KB);
  const questions = await generateCheckQuestions();
  if (questions.length < 3) return send(chatId, "❌ Zu wenige Daten für einen Check.", BACK_KB);
  await patchSess(userId, { check: { preTs: now, questions, preScore: null, preTopics: null }, quiz: { questions, idx: 0, score: 0, type: "pre-check", attempt: 0, results: [] } });
  await send(chatId, `🧪 <b>Wissens-Check — Eingangstest</b>\n\n${questions.length} Fragen. Kein Hint — ehrliche Bestandsaufnahme.\nNach ${CHECK_MIN_DAYS}+ Tagen Training zeigt /check deinen Lernzuwachs.`);
  const { text, keyboard } = renderQuizMsg(questions[0], 0, questions.length, 0);
  return tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: keyboard });
}
async function cmdFortschritt(chatId, userId, userName) {
  const profile = await computeSkillProfile(userId);
  const stored = (await getSess(userId)).check;
  const lines = [`<b>📈 Lern-Fortschritt — ${esc(userName)}</b>\n`, "<b>Aktuelles Skill-Profil:</b>"];
  for (const [tp, v] of Object.entries(profile)) {
    const bar = "█".repeat(Math.round(v.skill * 10)) + "░".repeat(10 - Math.round(v.skill * 10));
    lines.push(`${TOPIC_LABEL[tp]}: <code>${bar}</code> ${v.seen ? `${Math.round(v.skill * 100)}% (${v.correct}/${v.total})` : "noch kein Training"}`);
  }
  if (stored?.postTs) {
    lines.push("\n<b>Pre→Post-Check:</b>");
    [checkTopicLine("Drills", "⚡", stored.preTopics?.drill || { c: 0, t: 0 }, stored.postTopics?.drill || { c: 0, t: 0 }),
     checkTopicLine("Einwände", "💬", stored.preTopics?.einwand_mc || { c: 0, t: 0 }, stored.postTopics?.einwand_mc || { c: 0, t: 0 }),
     checkTopicLine("Marken", "🏷", stored.preTopics?.marken_quiz || { c: 0, t: 0 }, stored.postTopics?.marken_quiz || { c: 0, t: 0 })].filter(Boolean).forEach((l) => lines.push(l));
  } else if (stored?.preTs) {
    lines.push(`\n<i>Post-Check verfügbar ab ${new Date(stored.preTs + CHECK_MIN_DAYS * 86400000).toLocaleDateString("de-AT")}.</i>`);
  } else lines.push("\n<i>Noch kein Check. Starte mit /check.</i>");
  return send(chatId, lines.join("\n"), BACK_KB);
}
async function handleQuizAnswer(cbq) {
  const parts = (cbq.data || "").split("|");
  const qi = parseInt(parts[1], 10), oi = parseInt(parts[2], 10);
  const userId = cbq.from?.id, cid = cbq.message?.chat?.id;
  const all = await getSess(userId); const session = all.quiz;
  if (!session || isNaN(qi) || isNaN(oi)) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "⚠️ Session abgelaufen — /quiz für neues Quiz" });
  if (qi !== session.idx) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Bereits beantwortet." });
  const q = session.questions[qi]; const opt = q?.opts?.[oi];
  if (!opt) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id });
  const correct = opt.correct === true;
  const attempt = session.attempt || 0, total = session.questions.length;
  const isCheck = session.type === "pre-check" || session.type === "post-check";
  if (!correct && attempt === 0 && !isCheck) {
    session.attempt = 1; await patchSess(userId, { quiz: session });
    tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Fast! Hinweis beachten 💡" }).catch(() => {});
    await send(cid, `❌ <b>Nicht ganz.</b>\n\n${quizHint(q)}\n\n<i>Versuch's nochmal:</i>`);
    const { text: rText, keyboard: rKb } = renderQuizMsg(q, qi, total, session.streak || 0);
    return tgApi("sendMessage", { chat_id: cid, text: rText, parse_mode: "HTML", reply_markup: rKb });
  }
  const firstTry = attempt === 0;
  session.score = (session.score || 0) + (correct ? (firstTry ? 1 : 0.5) : 0);
  session.idx++; session.attempt = 0;
  if (!isCheck) { if (correct && firstTry) { session.streak = (session.streak || 0) + 1; session.best = Math.max(session.best || 0, session.streak); } else session.streak = 0; }
  const streak = session.streak || 0;
  const streakTag = (!isCheck && correct && firstTry && streak >= 2) ? ` 🔥${streak}` : "";
  tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: correct ? (firstTry ? "✓ Richtig!" + streakTag : "✓ Im 2. Versuch!") : "✗ Leider falsch" }).catch(() => {});
  await appendScore({ ts: new Date().toISOString(), uid: userId, name: tgUserName(cbq.from), type: isCheck ? session.type : "quiz_" + (q.type || "mixed"), itemId: q.itemId || "", correct: isCheck ? correct : (correct && firstTry) });
  if (isCheck && Array.isArray(session.results)) session.results.push({ correct });
  const correctOpt = q.opts.find((o) => o.correct);
  const reveal = (!correct && correctOpt) ? `\n\n✅ <b>Richtig wäre:</b> ${esc(correctOpt.text)}` : "";
  const head = isCheck ? (correct ? "✅ Richtig!" : "❌ Leider falsch.") : correct ? (firstTry ? "✅ Richtig!" : "✅ Richtig — im 2. Versuch (½ Punkt)") : "❌ Leider falsch.";
  let momentum = "";
  if (!isCheck && correct && firstTry) { if (streak === 3) momentum = "\n\n🔥 <b>3 in Folge — du bist im Flow!</b>"; else if (streak === 5) momentum = "\n\n🔥🔥 <b>5er-Serie! Richtig stark!</b>"; else if (streak >= 7) momentum = `\n\n🔥🔥🔥 <b>${streak} in Folge — unaufhaltsam!</b>`; else if (streak >= 2) momentum = `\n\n🔥 <b>${streak} in Folge</b>`; }
  const feedbackText = `${head}\n\n${esc(opt.feedback || (correct ? "Gut gemacht!" : "Nicht ganz."))}${reveal}${q.muster || ""}${momentum}`;
  if (session.idx >= total) {
    const score = session.score, bestStreak = session.best || 0;
    const pct = Math.round((score / total) * 100), perfect = score === total;
    const emoji = perfect ? "🎉" : pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : pct >= 40 ? "💪" : "📚";
    const msg = perfect ? "🎉 Perfekt — alles richtig!" : pct >= 80 ? "Ausgezeichnet — voll im Flow!" : pct >= 60 ? "Gut! Wiederhol die Fehler-Themen." : "Weiter dran — du wirst besser!";
    const patch = { quiz: null };
    if (session.type === "tagesaufgabe") { const today = new Date().toISOString().slice(0, 10); patch.daily = { date: today, done: true, score }; await appendScore({ ts: new Date().toISOString(), uid: userId, name: tgUserName(cbq.from), type: "tagesaufgabe", score, total }); }
    if (isCheck) {
      const topics = checkTopicScores(session.questions, session.results || []);
      const chk = { ...(all.check || {}) };
      if (session.type === "pre-check") { chk.preScore = score; chk.preTopics = topics; chk.questions = session.questions; await appendScore({ ts: new Date().toISOString(), uid: userId, name: tgUserName(cbq.from), type: "pre-check", score, total, topics }); }
      else { chk.postScore = score; chk.postTopics = topics; chk.postTs = Date.now(); await appendScore({ ts: new Date().toISOString(), uid: userId, name: tgUserName(cbq.from), type: "post-check", score, total, topics }); }
      patch.check = chk;
    }
    await patchSess(userId, patch);
    if (isCheck) {
      let r = `${feedbackText}\n\n━━━━━━━━━━━━━━\n${emoji} <b>${session.type === "pre-check" ? "Eingangstest" : "Abschlusstest"} abgeschlossen!</b>\n\nRichtig: <b>${score}/${total}</b> (${pct}%)\n\n`;
      if (session.type === "pre-check") r += `<i>Ausgangslevel gespeichert. Übe mit /quiz. Nach ${CHECK_MIN_DAYS}+ Tagen zeigt /check deinen Zuwachs!</i>`;
      else if (all.check?.preScore != null) { const gp = pct - Math.round(all.check.preScore / total * 100); r += `${gp > 10 ? "🚀" : gp > 0 ? "📈" : gp === 0 ? "➡️" : "📉"} <b>Lernzuwachs: ${gp > 0 ? "+" : ""}${gp}%</b>\n\nDetails: /fortschritt`; }
      return tgApi("sendMessage", { chat_id: cid, text: r.slice(0, 4000), parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📈 Fortschritt", callback_data: "menu|fortschritt" }, { text: "⬅️ Menü", callback_data: "menu|main" }]] } });
    }
    const bestLine = bestStreak >= 2 ? `\n🔥 Beste Serie: <b>${bestStreak}</b> in Folge` : "";
    return tgApi("sendMessage", { chat_id: cid, text: `${feedbackText}\n\n━━━━━━━━━━━━━━\n${emoji} <b>Quiz abgeschlossen!</b>\n\nRichtig: <b>${fmtScore(score)}/${total}</b> (${pct}%)${bestLine}\n${msg}`.slice(0, 4000), parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔄 Neues Quiz", callback_data: "menu|quiz" }, { text: "☀️ Tages-Aufgabe", callback_data: "menu|tagesaufgabe" }], [{ text: "⬅️ Menü", callback_data: "menu|main" }]] } });
  }
  await patchSess(userId, { quiz: session });
  const nextQ = session.questions[session.idx];
  const { text: nextText, keyboard: nextKb } = renderQuizMsg(nextQ, session.idx, total, session.streak || 0);
  await send(cid, feedbackText.slice(0, 1000));
  return tgApi("sendMessage", { chat_id: cid, text: nextText, parse_mode: "HTML", reply_markup: nextKb });
}

// === Admin: User-Verwaltung per Chat (bot_users) ===
// Policy: Rollen sind nur admin (sieht alles) oder mitarbeiter (nur Akademie).
async function tgMsgOrEdit(chatId, msgId, text, extra = {}) {
  const params = { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra };
  if (msgId) { const r = await tgApi("editMessageText", { ...params, message_id: msgId }).catch(() => ({ ok: false })); if (r && r.ok) return r; }
  return tgApi("sendMessage", params);
}
async function sendAdminPanel(chatId, msgId = null) {
  const cnt = Object.keys(USERS).length;
  return tgMsgOrEdit(chatId, msgId, `<b>⚙️ Admin-Panel</b>\n\n👥 <b>${cnt} Nutzer</b> bekannt\n\nBefehle:\n<code>/adduser ID Name</code> · <code>/setrole ID admin|mitarbeiter</code> · <code>/removeuser ID</code>`, {
    reply_markup: { inline_keyboard: [[{ text: "👥 User-Liste", callback_data: "admin|users" }, { text: "➕ Hinzufügen", callback_data: "admin|addhelp" }], [{ text: "⬅️ Menü", callback_data: "menu|main" }]] }
  });
}
async function sendUserList(chatId, msgId = null) {
  const entries = Object.entries(USERS);
  if (!entries.length) return tgMsgOrEdit(chatId, msgId, "📭 <b>Keine Nutzer.</b>\n\n<code>/adduser ID Name</code>", { reply_markup: { inline_keyboard: [[{ text: "⬅️ Admin-Panel", callback_data: "admin|panel" }]] } });
  const kb = entries.slice(0, 30).map(([id, u]) => [{ text: `${isAdmin(id) ? "🔑" : "👤"} ${u.name || id}`, callback_data: `admin|manage|${id}` }]);
  kb.push([{ text: "⬅️ Admin-Panel", callback_data: "admin|panel" }]);
  return tgMsgOrEdit(chatId, msgId, `<b>👥 Nutzer (${entries.length})</b>`, { reply_markup: { inline_keyboard: kb } });
}
async function sendManageUser(chatId, targetId, msgId = null) {
  const id = Number(targetId); const u = USERS[id];
  if (!u) return tgMsgOrEdit(chatId, msgId, `❌ User <code>${id}</code> nicht gefunden.`, { reply_markup: { inline_keyboard: [[{ text: "⬅️ User-Liste", callback_data: "admin|users" }]] } });
  const adminFlag = isAdmin(id);
  const envFixed = ENV_ADMINS.includes(id) || ENV_ALLOWED.includes(id);
  const kb = [];
  // Variante B: pro Bereich an/aus (nur für Nicht-Admins; Admin sieht ohnehin alles)
  let areaInfo = "";
  if (!adminFlag) {
    const eff = getUserAreas(id); // effektiv sichtbare Bereiche (leer=alle)
    for (let i = 0; i < AKADEMIE_AREAS.length; i += 2) {
      kb.push(AKADEMIE_AREAS.slice(i, i + 2).map((a) => ({ text: `${eff.includes(a) ? "✅" : "➕"} ${AREA_LABEL[a]}`, callback_data: `admin|area|${id}|${a}` })));
    }
    const rawMods = Array.isArray(u.modules) ? u.modules.filter((a) => AKADEMIE_AREAS.includes(a)) : [];
    areaInfo = `\nBereiche: ${rawMods.length ? rawMods.map((a) => AREA_LABEL[a]).join(", ") : "alle (Standard)"}`;
  }
  if (!adminFlag) kb.push([{ text: "🔑 Zu Admin machen", callback_data: `admin|promote|${id}` }]);
  else if (ADMINS.size > 1) kb.push([{ text: "🔓 Admin-Rechte entziehen", callback_data: `admin|demote|${id}` }]);
  if (!envFixed) kb.push([{ text: "🗑 User entfernen", callback_data: `admin|remove|${id}` }]);
  kb.push([{ text: "⬅️ User-Liste", callback_data: "admin|users" }]);
  return tgMsgOrEdit(chatId, msgId, `<b>⚙️ ${esc(u.name || id)}</b>\nID: <code>${id}</code>\nRolle: ${adminFlag ? "🔑 Admin (sieht alles)" : "👤 Mitarbeiter"}${areaInfo}${envFixed ? "\n<i>(via Vercel-Env fixiert)</i>" : ""}`, { reply_markup: { inline_keyboard: kb } });
}
async function handleAdminCallback(cbq) {
  const data = cbq.data, chatId = cbq.message?.chat?.id, msgId = cbq.message?.message_id;
  if (!isAdmin(cbq.from?.id)) return;
  if (data === "admin|panel") return sendAdminPanel(chatId, msgId);
  if (data === "admin|users") return sendUserList(chatId, msgId);
  if (data === "admin|addhelp") return tgMsgOrEdit(chatId, msgId, "➕ <b>User hinzufügen</b>\n\n<code>/adduser [Telegram-ID] [Name]</code>\nBeispiel: <code>/adduser 8715824144 Lorna</code>\n\n💡 ID bekommt der User via <b>/myid</b>.", { reply_markup: { inline_keyboard: [[{ text: "⬅️ User-Liste", callback_data: "admin|users" }]] } });
  if (data.startsWith("admin|manage|")) return sendManageUser(chatId, data.slice("admin|manage|".length), msgId);
  if (data.startsWith("admin|promote|")) { const id = Number(data.slice("admin|promote|".length)); const ex = USERS[id] || {}; await dbUpsertUser(id, { name: ex.name || ("User" + id), role: "admin", modules: ex.modules || [] }); await loadAccess(); setUserMenuButton(id, id); return sendManageUser(chatId, id, msgId); }
  if (data.startsWith("admin|demote|")) { const id = Number(data.slice("admin|demote|".length)); if (ADMINS.size > 1 && !ENV_ADMINS.includes(id)) { const ex = USERS[id] || {}; await dbUpsertUser(id, { name: ex.name || ("User" + id), role: "mitarbeiter", modules: ex.modules || [] }); await loadAccess(); setUserMenuButton(id, id); } return sendManageUser(chatId, id, msgId); }
  if (data.startsWith("admin|remove|")) { const id = Number(data.slice("admin|remove|".length)); if (!ENV_ADMINS.includes(id) && !ENV_ALLOWED.includes(id)) { await dbRemoveUser(id); await loadAccess(); tgApi("setChatMenuButton", { chat_id: id, menu_button: { type: "commands" } }).catch(() => {}); } return sendUserList(chatId, msgId); }
  if (data.startsWith("admin|area|")) {
    const [, , idStr, key] = data.split("|"); const id = Number(idStr);
    if (USERS[id] && AKADEMIE_AREAS.includes(key)) {
      const eff = getUserAreas(id); // effektiv (leer=alle) → materialisieren, dann togglen
      let next = eff.includes(key) ? eff.filter((a) => a !== key) : [...new Set([...eff, key])];
      if (!next.length) next = eff; // mind. 1 Bereich — sonst /removeuser nutzen
      const ex = USERS[id];
      await dbUpsertUser(id, { name: ex.name || ("User" + id), role: ex.role || "mitarbeiter", modules: next });
      await loadAccess(); setUserMenuButton(id, id);
    }
    return sendManageUser(chatId, id, msgId);
  }
}
async function cmdAddUser(chatId, arg) {
  const [idStr, ...nameParts] = arg.trim().split(/\s+/); const id = Number(idStr);
  if (!id || isNaN(id)) return send(chatId, "❌ Syntax: <code>/adduser 123456789 Lorna</code>");
  const name = nameParts.join(" ") || ("User" + id);
  await dbUpsertUser(id, { name, role: "mitarbeiter", modules: [] }); await loadAccess(); setUserMenuButton(id, id);
  return send(chatId, `✅ <b>${esc(name)}</b> (<code>${id}</code>) freigeschaltet.\nRolle: 👤 Mitarbeiter (nur Akademie)\n\nZu Admin: <code>/setrole ${id} admin</code>`);
}
async function cmdRemoveUser(chatId, arg) {
  const id = Number(arg.trim());
  if (!id || isNaN(id)) return send(chatId, "❌ Syntax: <code>/removeuser 123456789</code>");
  if (ENV_ADMINS.includes(id) || ENV_ALLOWED.includes(id)) return send(chatId, "❌ Über Vercel-Env fixiert — dort entfernen.");
  const name = USERS[id]?.name || String(id);
  await dbRemoveUser(id); await loadAccess();
  tgApi("setChatMenuButton", { chat_id: id, menu_button: { type: "commands" } }).catch(() => {});
  return send(chatId, `✅ <b>${esc(name)}</b> (<code>${id}</code>) entfernt.`);
}
async function cmdSetRole(chatId, arg) {
  const [idStr, roleRaw] = arg.trim().split(/\s+/); const id = Number(idStr); const role = (roleRaw || "").toLowerCase();
  if (!id || isNaN(id) || !["admin", "mitarbeiter"].includes(role)) return send(chatId, "❌ Syntax: <code>/setrole 123456789 admin</code> oder <code>mitarbeiter</code>");
  if (role === "mitarbeiter") {
    if (ENV_ADMINS.includes(id)) return send(chatId, "❌ Über Vercel-Env als Admin fixiert — dort ändern.");
    if (ADMINS.has(id) && ADMINS.size <= 1) return send(chatId, "❌ Das ist der einzige Admin — erst einen anderen Admin setzen.");
  }
  const ex = USERS[id] || {};
  await dbUpsertUser(id, { name: ex.name || ("User" + id), role, modules: ex.modules || [] }); await loadAccess(); setUserMenuButton(id, id);
  return send(chatId, role === "admin" ? `✅ <b>${esc(USERS[id]?.name || id)}</b> ist jetzt 🔑 <b>Admin</b> — sieht alles.` : `✅ <b>${esc(USERS[id]?.name || id)}</b> ist jetzt 👤 <b>Mitarbeiter</b> — nur Akademie.`);
}
async function cmdSetArea(chatId, arg, grant) {
  const [idStr, areaRaw] = arg.trim().split(/\s+/); const id = Number(idStr); const area = (areaRaw || "").toLowerCase();
  if (!id || isNaN(id) || !AKADEMIE_AREAS.includes(area)) return send(chatId, `❌ Syntax: <code>/${grant ? "grant" : "revoke"} 123456789 bereich</code>\nBereiche: ${AKADEMIE_AREAS.join(", ")}`);
  if (!USERS[id]) return send(chatId, `❌ User <code>${id}</code> nicht gefunden. Zuerst <code>/adduser ${id} Name</code>.`);
  if (isAdmin(id)) return send(chatId, "ℹ️ Admin sieht ohnehin alle Bereiche.");
  const eff = getUserAreas(id);
  let next = grant ? [...new Set([...eff, area])] : eff.filter((a) => a !== area);
  if (!next.length) return send(chatId, "❌ Mindestens 1 Bereich nötig — sonst <code>/removeuser</code>.");
  const ex = USERS[id];
  await dbUpsertUser(id, { name: ex.name || ("User" + id), role: ex.role || "mitarbeiter", modules: next });
  await loadAccess(); setUserMenuButton(id, id);
  return send(chatId, `✅ <b>${esc(USERS[id]?.name || id)}</b> — Bereiche: ${getUserAreas(id).map((a) => AREA_LABEL[a]).join(", ")}`);
}
async function cmdWebCode(chatId, arg) {
  const id = Number(arg.trim());
  if (!id || isNaN(id)) return send(chatId, "❌ Syntax: <code>/webcode 123456789</code>");
  if (!USERS[id]) return send(chatId, `❌ User <code>${id}</code> nicht gefunden. Zuerst <code>/adduser ${id} Name</code>.`);
  const code = genWebCode();
  await db.from("bot_users").update({ web_code_hash: webCodeHash(code) }).eq("uid", id);
  await loadAccess();
  return send(chatId, `🔑 <b>Web-Zugangscode für ${esc(USERS[id]?.name || id)}</b>\n\n<code>${esc(code)}</code>\n\nDamit kann sich die Person <b>im Browser</b> auf der Login-Seite anmelden (Feld „Passwort/Zugangscode"). Nur jetzt sichtbar — bei Bedarf neu erzeugen.`);
}

// === Update-Dispatch ===
async function handleUpdate(u) {
  await loadAccess(); // Env + bot_users für diese Invocation mergen
  if (u.callback_query) {
    const cbq = u.callback_query;
    if (!isPrivateChat(cbq.message?.chat)) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Nur im Privatchat" });
    if (!isAllowed(cbq.from?.id)) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Kein Zugriff" });
    const data = cbq.data || "", cid = cbq.message?.chat?.id, uid = cbq.from?.id;
    if (!data.startsWith("admin|") && data !== "menu|main" && !hasModule(uid, "akademie")) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "🔒 Nicht freigeschaltet", show_alert: true });
    // Variante B: Callback nach Akademie-Bereich gaten
    const CB_AREA = { "menu|drill": "drills", "menu|marken": "marken", "menu|einwand": "einwaende", "menu|rollenspiel": "rollenspiele", "menu|persona": "personas" };
    const cbArea = CB_AREA[data] || (data.startsWith("brand|") ? "marken" : data.startsWith("einwand|") ? "einwaende" : data.startsWith("persona|") ? "personas" : null);
    if (cbArea && !hasArea(uid, cbArea)) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "🔒 Nicht freigeschaltet", show_alert: true });
    if ((data === "menu|quiz" || data === "menu|tagesaufgabe") && !allowedQuizTypes(uid).length) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "🔒 Nicht freigeschaltet", show_alert: true });
    const selfAnswers = data.startsWith("drill|") || data.startsWith("quiz_ans|");
    if (!selfAnswers) tgApi("answerCallbackQuery", { callback_query_id: cbq.id }).catch(() => {});
    if (data.startsWith("drill|")) return handleDrillAnswer(cbq);
    if (data === "menu|main") return sendMenu(cid, uid);
    if (data === "menu|drill") return cmdDrill(cid, "");
    if (data === "menu|marken") return cmdMarkenMenu(cid);
    if (data === "menu|einwand") return cmdEinwandMenu(cid);
    if (data === "menu|persona") return cmdPersonaMenu(cid);
    if (data === "menu|rollenspiel") return cmdRollenspiel(cid);
    if (data === "menu|score") return cmdScore(cid, uid, tgUserName(cbq.from));
    if (data === "menu|lern") return isAdmin(uid) ? cmdLern(cid, "", null) : send(cid, "🔒 Lehren ist nur für Admins.");
    if (data.startsWith("brand|")) return cmdMarke(cid, data.slice(6));
    if (data.startsWith("einwand|")) return cmdEinwand(cid, data.slice(8));
    if (data.startsWith("persona|")) return cmdPersona(cid, data.slice(8));
    if (data.startsWith("admin|")) return handleAdminCallback(cbq);
    if (data.startsWith("quiz_ans|")) return handleQuizAnswer(cbq);
    if (data === "menu|quiz") return cmdQuiz(cid, uid, 5);
    if (data === "menu|tagesaufgabe") return cmdTagesaufgabe(cid, uid);
    if (data === "menu|fortschritt") return cmdFortschritt(cid, uid, tgUserName(cbq.from));
    if (data === "menu|copilot") return cmdCopilotStart(cid, uid);
    if (data === "copilot|exit") { await patchSess(uid, { copilot: null }); return send(cid, "✅ Cockpilot beendet. Mit /copilot wieder starten."); }
    return;
  }
  const msg = u.message;
  if (!msg || !msg.text) return;
  const chatId = msg.chat.id, userId = msg.from?.id;
  if (!isPrivateChat(msg.chat)) return;
  if (msg.text.trim().toLowerCase().startsWith("/myid")) return send(chatId, `🪪 <b>Deine Telegram-User-ID:</b> <code>${userId}</code>\n\nSchick diese Zahl an Mago zur Freischaltung.`);
  if (!isAllowed(userId)) return send(chatId, `⛔ Kein Zugriff.\n\nDeine ID: <code>${userId}</code>\nBitte bei Mago melden.`);
  const text = msg.text.trim();
  if (!text.startsWith("/")) {
    const sess = await getSess(userId);
    if (sess && sess.copilot) return cmdCopilotMessage(chatId, userId, text, sess);
    if (!hasModule(userId, "ai")) return send(chatId, "🔒 Freitext-KI nicht freigeschaltet.\n\n🧠 Tipp: /copilot für Microsoft-Copilot-Hilfe.");
    return cmdFrag(chatId, text, msg.from);
  }
  const [cmdRaw, ...rest] = text.split(/\s+/);
  const cmd = cmdRaw.toLowerCase().replace(/@.*$/, ""); const arg = rest.join(" ").trim();
  try {
    if (isAdmin(userId)) {
      if (cmd === "/users") return sendUserList(chatId);
      if (cmd === "/admin") return sendAdminPanel(chatId);
      if (cmd === "/adduser") return cmdAddUser(chatId, arg);
      if (cmd === "/removeuser") return cmdRemoveUser(chatId, arg);
      if (cmd === "/setrole") return cmdSetRole(chatId, arg);
      if (cmd === "/grant") return cmdSetArea(chatId, arg, true);
      if (cmd === "/revoke") return cmdSetArea(chatId, arg, false);
      if (cmd === "/webcode") return cmdWebCode(chatId, arg);
    }
    if (cmd === "/start" || cmd === "/help") return cmdStart(chatId, userId);
    if (cmd === "/copilot" || cmd === "/cp") return cmdCopilotStart(chatId, userId);
    if (cmd === "/stop" || cmd === "/ende") { await patchSess(userId, { copilot: null }); return send(chatId, "✅ Cockpilot beendet. Mit /copilot jederzeit wieder starten."); }
    if (cmd === "/frag" || cmd === "/ask" || cmd === "/ai") { if (!hasModule(userId, "ai")) return denyModule(chatId, "KI-Assistent"); return cmdFrag(chatId, arg, msg.from); }
    if (cmd === "/produkt" || cmd === "/p") return send(chatId, "🔍 Produkt-Lookup ist im Cloud-Deployment deaktiviert (JTL-Daten liegen lokal). Nutze /marke für Marken-Infos.");
    const akademieCmds = ["/drill", "/marke", "/einwand", "/persona", "/rollenspiel", "/rollenspiele", "/score", "/punkte", "/lern", "/learn", "/korrektur", "/quiz", "/tagesaufgabe", "/ta"];
    if (akademieCmds.includes(cmd) && !hasModule(userId, "akademie")) return denyModule(chatId, "Akademie");
    // Variante B: Befehl nach Akademie-Bereich gaten
    const CMD_AREA = { "/drill": "drills", "/marke": "marken", "/einwand": "einwaende", "/persona": "personas", "/rollenspiel": "rollenspiele", "/rollenspiele": "rollenspiele" };
    if (CMD_AREA[cmd] && !hasArea(userId, CMD_AREA[cmd])) return send(chatId, `🔒 <b>${AREA_LABEL[CMD_AREA[cmd]]}</b> ist für dich nicht freigeschaltet.\n\nFrag Mago, wenn du Zugriff brauchst.`);
    if (cmd === "/drill") return cmdDrill(chatId, arg);
    if (cmd === "/marke") return cmdMarke(chatId, arg);
    if (cmd === "/einwand") return cmdEinwand(chatId, arg);
    if (cmd === "/persona") return cmdPersona(chatId, arg);
    if (cmd === "/rollenspiel" || cmd === "/rollenspiele") return cmdRollenspiel(chatId);
    if (cmd === "/score" || cmd === "/punkte") return cmdScore(chatId, userId, tgUserName(msg.from));
    if (cmd === "/lern" || cmd === "/learn" || cmd === "/korrektur") { if (!isAdmin(userId)) return send(chatId, "🔒 Korrekturen können nur Admins eintragen."); return cmdLern(chatId, arg, msg.from); }
    if (cmd === "/quiz") return cmdQuiz(chatId, userId, arg);
    if (cmd === "/tagesaufgabe" || cmd === "/ta") return cmdTagesaufgabe(chatId, userId);
    if (cmd === "/check") return cmdCheck(chatId, userId, msg.from);
    if (cmd === "/fortschritt" || cmd === "/fp") return cmdFortschritt(chatId, userId, tgUserName(msg.from));
    return send(chatId, "Unbekannter Befehl. /start für die Hilfe.");
  } catch (e) { console.error("[cmd]", cmd, e.message); return send(chatId, "⚠️ Ein Fehler ist aufgetreten. Bitte versuch es erneut."); }
}

// === Export für die Next.js-Route (v2/app/api/tg-webhook/route.js) ===
export { handleUpdate };
