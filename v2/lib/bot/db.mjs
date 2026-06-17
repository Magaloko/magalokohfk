// MAGALOKO — gemeinsame Helfer für die Vercel-Serverless-API (Supabase-backed).
// Portiert aus server.mjs; Datei-IO ersetzt durch Supabase Postgres.
import { createClient } from "@supabase/supabase-js";
import { createHash, createHmac, timingSafeEqual, randomBytes } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const SESSION_SECRET = process.env.SESSION_SECRET || "";
// Härtung: kurze Lebensdauer — die Telegram-Mini-App authentifiziert bei jedem Öffnen neu,
// daher schmerzlos. Begrenzt das Zeitfenster eines evtl. kopierten Cookies.
export const SESSION_DAYS = 1;
export const STATE_ID = "hfk";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[db] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen — API nicht funktionsfähig.");
}

// Service-Role-Client: umgeht RLS. NUR serverseitig (niemals an den Client ausliefern).
export const db = createClient(SUPABASE_URL || "http://localhost", SUPABASE_SERVICE_ROLE_KEY || "x", {
  auth: { persistSession: false, autoRefreshToken: false }
});

// === Telegram-Config aus Env (statt config/telegram.json) ===
const toIds = (v) => String(v || "").split(",").map((s) => Number(s.trim())).filter(Number.isInteger);
export function tgConfig() {
  let users = {};
  try { users = JSON.parse(process.env.TG_USERS_JSON || "{}"); } catch { users = {}; }
  return {
    token: process.env.TELEGRAM_TOKEN || "",
    allowedUserIds: toIds(process.env.ALLOWED_USER_IDS),
    adminUserIds: toIds(process.env.ADMIN_USER_IDS),
    allowAllUsers: process.env.TG_ALLOW_ALL === "true",
    users
  };
}

export const requireAuth = process.env.REQUIRE_AUTH !== "false"; // default true
export const publicUrl = process.env.PUBLIC_URL || "";
export const slackWebhook = process.env.SLACK_WEBHOOK || "";

// === Crypto / Session-Helfer (portiert) ===
export function hashToken(token) {
  return createHash("sha256").update(token + SESSION_SECRET).digest("hex");
}
export { createHmac, timingSafeEqual, randomBytes };

export function parseCookies(header) {
  if (!header) return {};
  const out = {};
  header.split(";").forEach((part) => {
    const eq = part.indexOf("=");
    if (eq < 0) return;
    out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  });
  return out;
}

const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

// Verifiziert Telegram-initData (HMAC + auth_date-Frische) und prüft, ob sie zum erwarteten
// User gehört. Damit lässt sich eine Session an die echte, frische Telegram-Signatur binden.
export function verifyTgInitData(initData, expectedUserId) {
  if (!initData || typeof initData !== "string") return false;
  const token = tgConfig().token;
  if (!token) return false;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash") || "";
    params.delete("hash");
    const dcs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("\n");
    const secret = createHmac("sha256", "WebAppData").update(token).digest();
    const expected = createHmac("sha256", secret).update(dcs).digest("hex");
    if (!/^[0-9a-f]{64}$/i.test(hash) || !timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hash, "hex"))) return false;
    const authDate = Number(params.get("auth_date"));
    const nowSec = Date.now() / 1000;
    if (!Number.isFinite(authDate) || authDate <= 0 || nowSec - authDate > 86400 || authDate - nowSec > 120) return false;
    let u; try { u = JSON.parse(params.get("user") || "{}"); } catch { return false; }
    return Number(u.id) === Number(expectedUserId);
  } catch { return false; }
}

// Session aus Cookie laden (DB), Ablauf prüfen, last_seen aktualisieren.
// HÄRTUNG: Telegram-Sessions sind zusätzlich an die initData (tgUserId + HMAC + Frische)
// gebunden — ein kopiertes Cookie ohne gültige, frische initData desselben Users nützt nichts.
export async function getSession(req) {
  const token = parseCookies(req.headers.cookie).magaloko_session;
  if (!token) return null;
  const hashed = hashToken(token);
  const { data, error } = await db.from("sessions").select("*").eq("token_hash", hashed).maybeSingle();
  if (error || !data) return null;
  const now = Date.now();
  if (Number(data.last_seen) + SESSION_MS < now) {
    db.from("sessions").delete().eq("token_hash", hashed).then(() => {}, () => {});
    return null;
  }
  // Bindung an Telegram-initData NUR für Telegram-Sessions (email 'tg:...').
  // Web-Sessions (email 'web:...') sind passwortbasiert und NICHT initData-gebunden.
  if (data.tg_user_id != null && String(data.email || "").startsWith("tg:")) {
    const init = req.headers["x-tg-init"];
    if (!verifyTgInitData(init, data.tg_user_id)) return null;
  }
  db.from("sessions").update({ last_seen: now }).eq("token_hash", hashed).then(() => {}, () => {});
  return {
    tgRole: data.tg_role,
    tgModules: Array.isArray(data.tg_modules) ? data.tg_modules : [],
    tgUserId: data.tg_user_id,
    email: data.email
  };
}

export function isSessionAdmin(sess) {
  return !!(sess && sess.tgRole === "admin");
}

// === Web-Login (ohne Telegram) ===
import { createHash as _ch } from "node:crypto";
export function verifyAdminPassword(input) {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw || !input) return false;
  const a = _ch("sha256").update(String(input)).digest();
  const b = _ch("sha256").update(pw).digest();
  return timingSafeEqual(a, b);
}
export function webCodeHash(code) { return _ch("sha256").update(String(code) + SESSION_SECRET).digest("hex"); }
export function genWebCode() { return randomBytes(6).toString("base64url"); } // ~8 Zeichen, ~48 bit

// Erstellt eine WEB-Session (email 'web:...' → NICHT initData-gebunden), setzt das Cookie.
export async function createWebSession(res, { tgUserId, role, modules, email }) {
  const token = randomBytes(32).toString("base64url");
  const hashed = hashToken(token);
  const now = Date.now();
  await db.from("sessions").insert({
    token_hash: hashed, tg_user_id: tgUserId ?? null, tg_role: role,
    tg_modules: modules || [], email, created_at: now, last_seen: now, ua: "web"
  });
  setSessionCookie(res, token);
}

// Brute-Force-Schutz: max. 10 Versuche pro IP / 15 min
export async function webLoginThrottled(ip) {
  try {
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await db.from("web_login_attempts").select("id", { count: "exact", head: true }).gte("ts", since).eq("ip", ip || "");
    return (count || 0) >= 10;
  } catch { return false; }
}
export async function recordWebLoginAttempt(ip) {
  try { await db.from("web_login_attempts").insert({ ip: String(ip || "").slice(0, 64) }); } catch { /* best effort */ }
}

export function setSessionCookie(res, token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  res.setHeader("Set-Cookie",
    `magaloko_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}; Secure`);
}
export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "magaloko_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Secure");
}

export function requireSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers.host || "";
  try { return new URL(origin).host === host; } catch { return false; }
}

// === State-Sanitizer (portiert, Audit R5) ===
export function sanitizeStateJson(obj, depth = 0) {
  const FORBIDDEN = new Set(["__proto__", "prototype", "constructor"]);
  if (depth > 30) return null;
  if (Array.isArray(obj)) return obj.slice(0, 100000).map((v) => sanitizeStateJson(v, depth + 1));
  if (obj !== null && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (FORBIDDEN.has(k)) continue;
      out[k] = sanitizeStateJson(v, depth + 1);
    }
    return out;
  }
  return obj;
}

// === Akademie-Bereiche (Variante B: feingranulare Freigabe pro Person) ===
// Admin sieht alles. Mitarbeiter sehen NUR die freigegebenen Bereiche (leer = alle Akademie-Bereiche).
// staffTraining/brands sind bewusst NICHT enthalten → nie an Mitarbeiter (Kollegen-Daten/Business).
export const AKADEMIE_AREAS = ["angebote", "personas", "einwaende", "szenarien", "drills", "rollenspiele", "marken"];
const AREA_STATE_KEYS = {
  angebote: ["consultingServices"],
  personas: ["salesPersonas"],
  einwaende: ["salesObjections"],
  szenarien: ["trainingScenarios"],
  drills: ["akademieDrills"],
  rollenspiele: ["akademieRoleplays"],
  marken: ["akademieMarken"]
};
export function normAreas(areas) {
  const a = (Array.isArray(areas) ? areas : []).filter((x) => AKADEMIE_AREAS.includes(x));
  return a.length ? a : AKADEMIE_AREAS.slice(); // leer = alle Bereiche
}

export function filterStateForTgRole(full, areas) {
  const allowed = new Set();
  for (const area of normAreas(areas)) (AREA_STATE_KEYS[area] || []).forEach((k) => allowed.add(k));
  const srcWs = full.workspaces?.hfk?.data || full;
  const filteredData = {};
  for (const k of allowed) if (k in srcWs) filteredData[k] = srcWs[k];
  const out = {};
  if (full.workspaces) {
    out.workspaces = {};
    for (const [wsId, ws] of Object.entries(full.workspaces)) {
      const meta = { ...ws };
      delete meta.data;
      out.workspaces[wsId] = { ...meta, data: wsId === "hfk" ? filteredData : {} };
    }
  }
  if (full.activeWorkspace) out.activeWorkspace = full.activeWorkspace;
  Object.assign(out, filteredData);
  return out;
}

// === Body-Reader (Vercel kann req.body vorparsen; sonst Stream lesen) ===
export async function readRawBody(req, maxBytes = 8 * 1024 * 1024) {
  if (typeof req.body === "string") return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);
  return await new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > maxBytes) { reject(new Error("body too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export async function audit(event, detail) {
  try { await db.from("audit_log").insert({ event, detail: detail || {} }); } catch { /* best effort */ }
}

// === Daten-Integrität (ZENA-Muster: Snapshots + Anti-Wipe) ===

// Geschützte Sammlungen: dürfen nicht versehentlich von >=3 auf 0 fallen (Daten-Verlust-Schutz).
export const PROTECTED_COLLECTIONS = [
  "akademieDrills", "akademieMarken", "salesObjections", "salesPersonas",
  "akademieRoleplays", "trainingScenarios", "consultingServices",
  "tasks", "knowledgeCards", "glossary"
];

function collectionLen(obj, key) {
  const v = obj && obj[key];
  return Array.isArray(v) ? v.length : 0;
}

// Prüft top-level UND workspaces.hfk.data. Gibt den Namen der Sammlung zurück, die geleert
// würde (aktuell >=3, eingehend 0) — sonst null.
export function antiWipeViolation(current, incoming) {
  if (!current || !incoming) return null;
  const curWs = current.workspaces?.hfk?.data || {};
  const inWs = incoming.workspaces?.hfk?.data || {};
  for (const key of PROTECTED_COLLECTIONS) {
    if (collectionLen(current, key) >= 3 && collectionLen(incoming, key) === 0) return key;
    if (collectionLen(curWs, key) >= 3 && collectionLen(inWs, key) === 0) return `workspaces.hfk.data.${key}`;
  }
  return null;
}

// Sichert den AKTUELLEN app_state-Stand nach state_history (vor einem Write). Best-effort.
export async function snapshotState(currentData, updatedAt, clientId, actor) {
  try {
    if (!currentData || typeof currentData !== "object") return;
    await db.from("state_history").insert({
      updated_at: Number(updatedAt) || 0,
      client_id: (clientId || "").slice(0, 64) || null,
      data: currentData,
      actor: actor || null
    });
  } catch (e) { console.error("[snapshotState]", e.message); }
}

// === Job-/Cron-Registry (ZENA-Muster) ===
// Führt fn() aus, sofern der Job in scheduled_jobs aktiviert ist, und schreibt Heartbeat/Status.
export async function runJob(name, fn) {
  const startIso = new Date().toISOString();
  const t0 = Date.now();
  let row = null;
  try { row = (await db.from("scheduled_jobs").select("enabled").eq("name", name).maybeSingle()).data; } catch { /* ignore */ }
  if (row && row.enabled === false) {
    await db.from("scheduled_jobs").update({ last_run_at: startIso, last_status: "skipped" }).eq("name", name).then(() => {}, () => {});
    return { skipped: true };
  }
  try {
    const result = await fn();
    await db.from("scheduled_jobs").upsert({
      name, last_run_at: startIso, last_status: "ok", last_duration_ms: Date.now() - t0,
      last_error: null, runs: (await jobRuns(name)) + 1, meta: result && typeof result === "object" ? result : {}
    }).then(() => {}, () => {});
    return { ok: true, result };
  } catch (e) {
    await db.from("scheduled_jobs").upsert({
      name, last_run_at: startIso, last_status: "error", last_duration_ms: Date.now() - t0,
      last_error: String(e.message || e).slice(0, 500)
    }).then(() => {}, () => {});
    throw e;
  }
}
async function jobRuns(name) {
  try { return Number((await db.from("scheduled_jobs").select("runs").eq("name", name).maybeSingle()).data?.runs || 0); }
  catch { return 0; }
}
