// MAGALOKO Telegram-Bot — HFK Verkaufs-Lernsystem
// Pure Node 24 (node:https Long-Polling), keine npm-Dependencies.
// Liest dieselbe data/state.json die das Cockpit schreibt.
// Start: node telegram-bot.mjs
// Config: config/telegram.json  { "token": "123:ABC", "allowedUserIds": [optional] }

import https from "node:https";
import { readFile, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const configPath = join(root, "config", "telegram.json");
const statePath = join(root, "data", "state.json");
const scoresPath = join(root, "data", "bot-scores.jsonl");

let TOKEN = "";
let ALLOWED = null; // null = alle erlaubt; sonst Array von numeric user IDs

let ALLOW_ALL = false;

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
  ALLOWED = hasList ? cfg.allowedUserIds : null;
  if (ALLOW_ALL && !hasList) {
    console.warn("[telegram-bot] ⚠️ WARNUNG: allowAllUsers=true — JEDER kann den Bot nutzen!");
  }
}

// === MAGALOKO-Datenzugriff (frisch pro Anfrage) ===
async function loadData() {
  try {
    const raw = await readFile(statePath, "utf8");
    const state = JSON.parse(raw);
    // HFK-Workspace bevorzugen, sonst Top-Level
    const ws = state.workspaces?.hfk?.data || state;
    return {
      drills: ws.akademieDrills || [],
      marken: ws.akademieMarken || [],
      einwaende: ws.salesObjections || [],
      personas: ws.salesPersonas || [],
      roleplays: ws.akademieRoleplays || []
    };
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
  try {
    const raw = await readFile(scoresPath, "utf8");
    return raw.split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch {
    return [];
  }
}

function tgUserName(from) {
  if (!from) return "Unbekannt";
  return [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || ("User" + from.id);
}

// === Telegram-API ===
function tgApi(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(params || {});
    const req = https.request({
      hostname: "api.telegram.org",
      path: `/bot${TOKEN}/${method}`,
      method: "POST",
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
    req.write(body);
    req.end();
  });
}

const send = (chatId, text, extra = {}) =>
  tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });

// === Hilfsfunktionen ===
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function isAllowed(userId) {
  if (ALLOW_ALL) return true;
  if (!ALLOWED) return false; // fail-closed
  const ok = ALLOWED.includes(userId);
  if (!ok) console.warn(`[telegram-bot] Zugriff verweigert für User-ID ${userId} (nicht in allowedUserIds)`);
  return ok;
}

// === Command-Handler ===
async function cmdStart(chatId) {
  await send(chatId,
    "<b>🎓 HFK Verkaufs-Akademie Bot</b>\n\n" +
    "Trainiere Produktwissen & Verkauf — direkt im Chat.\n\n" +
    "<b>Befehle:</b>\n" +
    "/drill — Zufalls-Quiz (mit Antwort-Buttons)\n" +
    "/marke <i>LIEWOOD</i> — Marken-Steckbrief\n" +
    "/einwand <i>preis</i> — Einwand-Antwort suchen\n" +
    "/persona <i>anna</i> — Kunden-Typ\n" +
    "/rollenspiel — Zufalls-Trainingsszenario\n" +
    "/score — dein Lern-Fortschritt & Serie\n" +
    "/start — diese Hilfe\n\n" +
    "<i>Daten kommen live aus MAGALOKO.</i>");
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
  // Score protokollieren (append-only)
  await appendScore({
    ts: new Date().toISOString(),
    uid: cbq.from?.id,
    name: tgUserName(cbq.from),
    type: "drill",
    drillId,
    marke: drill.marke || "",
    correct: !!correct
  });
  await tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: correct ? "✓ Richtig!" : "✗ Leider falsch" });
  const fb = opt?.feedback || (correct ? "Richtig!" : "Leider falsch.");
  const muster = drill.musterantwort ? `\n\n<b>Musterantwort:</b>\n${esc(drill.musterantwort)}` : "";
  await send(cbq.message.chat.id,
    `${correct ? "✅" : "❌"} <b>${esc(drill.frage || "")}</b>\n\n${esc(fb)}${muster}`);
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
  await send(chatId, txt.slice(0, 4000));
}

async function cmdEinwand(chatId, arg) {
  const d = await loadData();
  if (!arg) return send(chatId, "Stichwort? Z.B. <code>/einwand preis</code> oder <code>/einwand amazon</code>");
  const q = norm(arg);
  const hits = d.einwaende.filter((e) =>
    norm(e.einwand).includes(q) || norm(e.kategorie).includes(q) || norm(e.antwort).includes(q)
  ).slice(0, 3);
  if (!hits.length) return send(chatId, `Kein Einwand zu „${esc(arg)}" gefunden.`);
  for (const e of hits) {
    let txt = `<b>💬 „${esc(e.einwand)}"</b>\n`;
    txt += `<i>${esc(e.kategorie || "")}</i>\n\n`;
    if (e.antwort) txt += `<b>Antwort:</b> ${esc(e.antwort)}\n`;
    if (e.beweis) txt += `\n<b>Beweis:</b> ${esc(e.beweis)}`;
    await send(chatId, txt.slice(0, 4000));
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
  await send(chatId, txt.slice(0, 4000));
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
    `<i>Sichtbar auch im MAGALOKO-Dashboard → Akademie → Mitarbeiter.</i>`);
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
  await send(chatId, txt.slice(0, 4000));
}

// === Update-Verarbeitung ===
async function handleUpdate(u) {
  // Callback (Button-Tap)
  if (u.callback_query) {
    const cbq = u.callback_query;
    if (!isAllowed(cbq.from?.id)) return tgApi("answerCallbackQuery", { callback_query_id: cbq.id, text: "Kein Zugriff" });
    if ((cbq.data || "").startsWith("drill|")) return handleDrillAnswer(cbq);
    return tgApi("answerCallbackQuery", { callback_query_id: cbq.id });
  }
  // Nachricht
  const msg = u.message;
  if (!msg || !msg.text) return;
  const chatId = msg.chat.id;
  if (!isAllowed(msg.from?.id)) return send(chatId, "⛔ Kein Zugriff. Bitte bei Mago melden.");
  const text = msg.text.trim();
  const [cmdRaw, ...rest] = text.split(/\s+/);
  const cmd = cmdRaw.toLowerCase().replace(/@.*$/, ""); // /drill@BotName → /drill
  const arg = rest.join(" ").trim();
  try {
    if (cmd === "/start" || cmd === "/help") return cmdStart(chatId);
    if (cmd === "/drill") return cmdDrill(chatId, arg);
    if (cmd === "/marke") return cmdMarke(chatId, arg);
    if (cmd === "/einwand") return cmdEinwand(chatId, arg);
    if (cmd === "/persona") return cmdPersona(chatId, arg);
    if (cmd === "/rollenspiel" || cmd === "/rollenspiele") return cmdRollenspiel(chatId);
    if (cmd === "/score" || cmd === "/punkte") return cmdScore(chatId, msg.from?.id, tgUserName(msg.from));
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
  await tgApi("setMyCommands", { commands: [
    { command: "drill", description: "Zufalls-Quiz mit Antwort-Buttons" },
    { command: "marke", description: "Marken-Steckbrief (z.B. /marke LIEWOOD)" },
    { command: "einwand", description: "Einwand-Antwort suchen (z.B. /einwand preis)" },
    { command: "persona", description: "Kunden-Typ (z.B. /persona anna)" },
    { command: "rollenspiel", description: "Zufalls-Trainingsszenario" },
    { command: "score", description: "Dein Lern-Fortschritt & Serie" },
    { command: "start", description: "Hilfe & Befehlsübersicht" }
  ]});
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
