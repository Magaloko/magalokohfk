// MAGALOKO — gemeinsame Helfer für die Vercel-Serverless-API (Supabase-backed).
// Portiert aus server.mjs; Datei-IO ersetzt durch Supabase Postgres.
import { createClient } from "@supabase/supabase-js";
import { createHash, createHmac, timingSafeEqual, randomBytes } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const SESSION_SECRET = process.env.SESSION_SECRET || "";
export const SESSION_DAYS = 30;
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

// Session aus Cookie laden (DB), Ablauf prüfen, last_seen aktualisieren.
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
