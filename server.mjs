import { createServer } from "node:http";
import { readFile, writeFile, mkdir, rename, appendFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { extname, dirname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { gzip, brotliCompress, constants as zlibConstants } from "node:zlib";
import { promisify } from "node:util";

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

// Komprimierbare MIME-Types (Text-basiert — binäre Files nicht komprimieren)
const COMPRESSIBLE = new Set([
  "text/html", "text/css", "text/javascript", "application/javascript",
  "application/json", "image/svg+xml", "text/plain", "application/manifest+json"
]);

// In-Memory-Cache für komprimierte statische Files (invalidiert bei Server-Restart)
const compressCache = new Map(); // key: `${path}:${encoding}` → Buffer

async function compressResponse(data, acceptEncoding, contentType) {
  const mime = contentType?.split(";")[0].trim();
  if (!COMPRESSIBLE.has(mime)) return { data, encoding: null };
  const supportsBr = /\bbr\b/.test(acceptEncoding || "");
  const supportsGzip = /\bgzip\b/.test(acceptEncoding || "");
  if (!supportsBr && !supportsGzip) return { data, encoding: null };
  const encoding = supportsBr ? "br" : "gzip";
  return { data: encoding === "br"
    ? await brotliAsync(data, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 4 } })
    : await gzipAsync(data, { level: 6 }),
    encoding };
}

const port = Number(process.env.PORT || 4177);
const bindHost = process.env.HOST || "127.0.0.1"; // Cloudflare Tunnel braucht nur 127.0.0.1
const root = dirname(fileURLToPath(import.meta.url));
const dataDir = join(root, "data");
const configDir = join(root, "config");
const attachmentsDir = join(dataDir, "attachments");
const backupsDir = join(dataDir, "backups");
const statePath = join(dataDir, "state.json");
const stateTmp = join(dataDir, "state.json.tmp");
const auditPath = join(dataDir, "audit.jsonl");
const sessionsPath = join(dataDir, "sessions.json");
const authConfigPath = join(configDir, "auth.json");
const MAX_BODY = 5 * 1024 * 1024;
const MAX_ATTACHMENT = 20 * 1024 * 1024; // 20 MB pro File
const SESSION_DAYS = 30;

// ============================================================
// Auth-Konfiguration
// ============================================================

let authConfig = null;
let sessions = {}; // { token: { email, createdAt, lastSeen, ua } }
const sseClients = new Map(); // clientId → response

function broadcastSse(event, data, excludeClientId = null) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [id, res] of sseClients.entries()) {
    if (id === excludeClientId) continue;
    try { res.write(payload); } catch { sseClients.delete(id); }
  }
}

// Audit-Finding R5: CSRF-Schutz — Origin gegen Host-Header prüfen
function requireSameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true; // kein Origin-Header = kein Browser-Cross-Origin-Request
  const host = request.headers.host || `localhost:${port}`;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Audit-Finding R8: Stephan-Zugang über kurzlebige OTPs — permanenter Token nie an Clients
const _stephanOtps = new Map(); // otp → { createdAt }
const STEPHAN_OTP_TTL_MS = 60 * 60 * 1000; // 1 Stunde

// Audit-Finding R9: Session-Email aus Cookie lesen (für Autorisierungsprüfungen)
function getSessionEmail(request) {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.magaloko_session;
  if (!token) return null;
  return sessions[hashToken(token)]?.email || null;
}

// Admin-Bestimmung: autoritativ aus der Telegram-Session (tgRole), unabhängig von E-Mail.
// Legacy-E-Mail-Admin bleibt als Fallback bis der E-Mail-Auth-Flow entfernt ist.
function isSessionAdmin(request) {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.magaloko_session;
  const sess = token ? sessions[hashToken(token)] : null;
  if (!sess) return false;
  if (sess.tgRole === "admin") return true;
  const adminEmail = (authConfig.allowedEmails || [])[0] || null;
  return !!(adminEmail && sess.email === adminEmail);
}

// PII-Sperre: Telegram-Mitarbeiter dürfen KEINE Kunden-/Bestelldaten abrufen,
// selbst wenn sie das Produkt-Modul haben (Produkt = Artikel/Lieferanten, NICHT Kunden-PII).
// Gibt true zurück (und schreibt 403) wenn der Request blockiert werden soll.
function denyEmployeePii(request, response) {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.magaloko_session;
  const sess = token ? sessions[hashToken(token)] : null;
  if (sess && sess.tgRole === "mitarbeiter") {
    response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
    response.end(JSON.stringify({ error: "Kundendaten für deine Rolle nicht freigegeben" }));
    return true;
  }
  return false;
}

function generateStephanOtp() {
  const now = Date.now();
  // Abgelaufene OTPs aufräumen
  for (const [otp, { createdAt }] of _stephanOtps.entries()) {
    if (now - createdAt > STEPHAN_OTP_TTL_MS) _stephanOtps.delete(otp);
  }
  const otp = randomBytes(24).toString("base64url");
  _stephanOtps.set(otp, { createdAt: now });
  return otp;
}

const STEPHAN_OTP_MAX_USES = 60; // Audit-Finding R9: max. Abrufe pro OTP (1 Page-Session ≈ 60 API-Calls)

function isValidStephanOtp(otp) {
  if (!otp) return false;
  const entry = _stephanOtps.get(otp);
  if (!entry) return false;
  if (Date.now() - entry.createdAt > STEPHAN_OTP_TTL_MS) {
    _stephanOtps.delete(otp);
    return false;
  }
  // Audit-Finding R9: Nutzungszähler — verhindert unbegrenzte Wiederverwendung geleakter Links
  entry.uses = (entry.uses || 0) + 1;
  if (entry.uses > STEPHAN_OTP_MAX_USES) {
    _stephanOtps.delete(otp);
    return false;
  }
  return true;
}

// Audit-Finding R7: Rate-Limit für rechenintensive JTL-Endpoints (DoS-Schutz)
const _jtlHeavyLastCall = new Map(); // key → timestamp
const JTL_HEAVY_COOLDOWN_MS = 15_000; // 15 Sekunden zwischen gleichartigen schweren Requests
function jtlHeavyAllowed(key) {
  const now = Date.now();
  const last = _jtlHeavyLastCall.get(key) || 0;
  if (now - last < JTL_HEAVY_COOLDOWN_MS) return false;
  _jtlHeavyLastCall.set(key, now);
  if (_jtlHeavyLastCall.size > 500) {
    for (const [k, ts] of _jtlHeavyLastCall.entries()) {
      if (now - ts > JTL_HEAVY_COOLDOWN_MS * 4) _jtlHeavyLastCall.delete(k);
    }
  }
  return true;
}

// Audit-Finding R5: Serialisiert State-Mutationen → kein Read-Modify-Write Race bei /api/capture
let _stateMutex = Promise.resolve();
function withStateLock(fn) {
  const next = _stateMutex.then(() => fn());
  _stateMutex = next.catch(() => {});
  return next;
}

// Audit-Finding R5: Bereinigt gefährliche Schlüssel + begrenzt Array-Tiefe
function sanitizeStateJson(obj, depth = 0) {
  const FORBIDDEN = new Set(["__proto__", "prototype", "constructor"]);
  if (depth > 30) return null;
  if (Array.isArray(obj)) return obj.slice(0, 100000).map((v) => sanitizeStateJson(v, depth + 1));
  if (obj !== null && typeof obj === "object") {
    const out = Object.create(null);
    for (const [k, v] of Object.entries(obj)) {
      if (FORBIDDEN.has(k)) continue;
      out[k] = sanitizeStateJson(v, depth + 1);
    }
    return out;
  }
  return obj;
}

async function loadAuthConfig() {
  try {
    const raw = await readFile(authConfigPath, "utf8");
    authConfig = JSON.parse(raw);
    // Auto-Migration: fehlende Felder ergänzen
    let dirty = false;
    if (authConfig.slackWebhook === undefined) { authConfig.slackWebhook = null; dirty = true; }
    if (dirty) {
      await writeFile(authConfigPath, JSON.stringify(authConfig, null, 2));
      console.log("Auth-Config ergänzt (Slack-Webhook).");
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      authConfig = {
        requireAuth: false,
        allowedEmails: [],
        sessionSecret: randomBytes(32).toString("hex"),
        smtp: null,
        publicUrl: null,
        slackWebhook: null
      };
      await mkdir(configDir, { recursive: true });
      await writeFile(authConfigPath, JSON.stringify(authConfig, null, 2));
      console.log(`Auth-Config erstellt: ${authConfigPath}`);
      console.log("→ requireAuth ist false (Auth deaktiviert). Aktiviere ihn vor öffentlichem Zugang!");
    } else {
      throw error;
    }
  }
}

async function loadSessions() {
  try {
    const raw = await readFile(sessionsPath, "utf8");
    sessions = JSON.parse(raw);
    // Abgelaufene Sessions aufräumen
    const now = Date.now();
    const cutoff = now - SESSION_DAYS * 24 * 60 * 60 * 1000;
    let cleaned = 0;
    for (const [token, sess] of Object.entries(sessions)) {
      if (sess.lastSeen < cutoff) { delete sessions[token]; cleaned++; }
    }
    if (cleaned > 0) await saveSessions();
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Sessions-Load-Fehler:", error.message);
    sessions = {};
  }
}

async function saveSessions() {
  await mkdir(dataDir, { recursive: true });
  await writeFile(sessionsPath, JSON.stringify(sessions, null, 2));
}

async function audit(event, details) {
  try {
    await mkdir(dataDir, { recursive: true });
    await appendFile(auditPath, JSON.stringify({ ts: new Date().toISOString(), event, ...details }) + "\n");
  } catch (error) {
    console.error("Audit-Log-Fehler:", error.message);
  }
}

function hashToken(token) {
  return createHash("sha256").update(token + authConfig.sessionSecret).digest("hex");
}

function parseCookies(header) {
  if (!header) return {};
  const out = {};
  header.split(";").forEach((part) => {
    const eq = part.indexOf("=");
    if (eq < 0) return;
    out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  });
  return out;
}

// === Rollenbasierter State-Filter ===
// Mitarbeiter sehen NUR Akademie-Daten (+ Produkt-Daten falls Modul freigeschaltet).
// Alle anderen Geschäfts-/Finanz-/Kundendaten werden server-seitig entfernt.
const TG_AKADEMIE_KEYS = [
  "consultingServices", "salesPersonas", "salesObjections", "trainingScenarios",
  "staffTraining", "akademieDrills", "akademieMarken", "akademieRoleplays", "brands"
];
const TG_PRODUKT_KEYS = [
  "vipArticles", "jtlManufacturers", "jtlSuppliers", "sortimentRules", "sortimentStats"
];

function filterStateForTgRole(full, modules) {
  const allowed = new Set(TG_AKADEMIE_KEYS);
  if (Array.isArray(modules) && modules.includes("produkt")) {
    TG_PRODUKT_KEYS.forEach((k) => allowed.add(k));
  }
  // Quelle: HFK-Workspace bevorzugen, sonst Top-Level
  const srcWs = full.workspaces?.hfk?.data || full;
  const filteredData = {};
  for (const k of allowed) {
    if (k in srcWs) filteredData[k] = srcWs[k];
  }
  // Workspace-Hülle erhalten (App bootet sauber), aber nur erlaubte Daten
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
  // Akademie-Daten auch auf Top-Level spiegeln (App liest teils Top-Level)
  Object.assign(out, filteredData);
  return out;
}

function getSessionFromRequest(request) {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.magaloko_session;
  if (!token) return null;
  const hashed = hashToken(token);
  const sess = sessions[hashed];
  if (!sess) return null;
  const now = Date.now();
  const expiry = sess.lastSeen + SESSION_DAYS * 24 * 60 * 60 * 1000;
  if (now > expiry) {
    delete sessions[hashed];
    saveSessions().catch(() => {});
    return null;
  }
  sess.lastSeen = now;
  return sess;
}

function setSessionCookie(response, token, request) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  // Secure-Flag nur wenn die Anfrage über HTTPS kommt (sonst akzeptiert kein Browser das Cookie)
  const isHttps = request?.headers["x-forwarded-proto"] === "https" || request?.connection?.encrypted;
  const secureFlag = isHttps ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `magaloko_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secureFlag}`
  );
}

function clearSessionCookie(response) {
  response.setHeader("Set-Cookie", "magaloko_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
}

function clientIp(request) {
  // x-forwarded-for nur vertrauen wenn explizit ein Reverse-Proxy konfiguriert ist
  // (Audit-Finding #11: sonst kann ein Client die IP spoofen und Rate-Limits umgehen).
  if (authConfig.trustProxy === true) {
    const fwd = request.headers["x-forwarded-for"]?.split(",")[0].trim();
    if (fwd) return fwd;
  }
  return request.socket?.remoteAddress || "unknown";
}

const hfkExportRoot = resolve(root, "..");
const hfkSources = {
  products: join(hfkExportRoot, "planning_sample_10_product_groups.csv"),
  manufacturers: join(hfkExportRoot, "dbo_tHersteller.csv"),
  suppliers: join(hfkExportRoot, "dbo_tlieferant.csv"),
  invoices: join(hfkExportRoot, "Rechnung_tRechnung.csv"),
  articles: join(hfkExportRoot, "dbo_tArtikel.csv"),
  articleNames: join(hfkExportRoot, "dbo_tArtikelBeschreibung.csv"),
  addresses: join(hfkExportRoot, "dbo_tAdresse.csv"),
  orders: join(hfkExportRoot, "Verkauf_tAuftrag.csv"),
  orderTotals: join(hfkExportRoot, "Verkauf_tAuftragEckdaten.csv"),
  orderPositions: join(hfkExportRoot, "Verkauf_tAuftragPosition.csv")
};

// === JTL Lean Indexes (Phase 2: Produkt + Kunden-Lookup) ===
// Lazy-loaded, gecached bis Server-Restart. Latin1 weil JTL-Export-Encoding.
let articleIndexCache = null;
let articleIndexLoading = null;
let addressIndexCache = null;
let addressIndexLoading = null;

async function loadArticleIndex() {
  if (articleIndexCache) return articleIndexCache;
  if (articleIndexLoading) return articleIndexLoading;
  articleIndexLoading = (async () => {
    const t0 = Date.now();
    const text = await readFile(hfkSources.articles, "latin1");
    const idx = [];
    let buffer = "";
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (!line && !buffer) continue;
      const candidate = buffer ? buffer + "\n" + line : line;
      const fields = candidate.split("|");
      // tArtikel hat ~100 Spalten. Wenn deutlich weniger → Multiline-Fragment puffern.
      if (fields.length < 40) { buffer = candidate; continue; }
      const k = parseInt(fields[0], 10);
      if (!Number.isFinite(k)) { buffer = ""; continue; }
      idx.push({
        k,                                              // kArtikel
        a: fields[1] || "",                             // cArtNr (oft Produktname)
        vk: parseFloat(fields[2]) || 0,                 // fVKNetto
        uvp: parseFloat(fields[3]) || 0,                // fUVP
        akt: fields[6] === "Y" || fields[6] === "1",    // cAktiv
        bestand: parseFloat(fields[7]) || 0,            // nLagerbestand
        ek: parseFloat(fields[20]) || 0,                // fEKNetto
        such: fields[28] || "",                         // cSuchbegriffe (oft mit Marken-Hint!)
        herst: parseInt(fields[60], 10) || 0,           // kHersteller (Spalte 60, nicht 61!)
        han: fields[37] || ""                           // cHAN
      });
      buffer = "";
    }
    // Anreicherung mit Produktnamen aus tArtikelBeschreibung
    let nameMs = 0;
    let namedCount = 0;
    try {
      const tn = Date.now();
      namedCount = await enrichArticlesWithNames({ rows: idx });
      nameMs = Date.now() - tn;
    } catch (e) { /* silent — fallback: cArtNr als Name */ }
    // Hersteller-Map laden + per Article anreichern
    try {
      const mmap = await loadManufacturerMap();
      for (const a of idx) {
        if (a.herst) a.herstName = mmap.get(a.herst) || "";
      }
    } catch {}
    articleIndexCache = { rows: idx, loadedAt: Date.now(), loadMs: Date.now() - t0, nameMs, namedCount };
    articleIndexLoading = null;
    return articleIndexCache;
  })();
  return articleIndexLoading;
}

async function loadAddressIndex() {
  if (addressIndexCache) return addressIndexCache;
  if (addressIndexLoading) return addressIndexLoading;
  addressIndexLoading = (async () => {
    const t0 = Date.now();
    const text = await readFile(hfkSources.addresses, "latin1");
    const idx = [];
    let buffer = "";
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (!line && !buffer) continue;
      const candidate = buffer ? buffer + "\n" + line : line;
      const fields = candidate.split("|");
      // tAdresse hat 25 Spalten
      if (fields.length < 20) { buffer = candidate; continue; }
      const k = parseInt(fields[0], 10);
      if (!Number.isFinite(k)) { buffer = ""; continue; }
      idx.push({
        k,                                          // kAdresse
        kInet: parseInt(fields[1], 10) || 0,
        kKunde: parseInt(fields[2], 10) || 0,
        firma: fields[3] || "",
        anr: fields[4] || "",
        vn: fields[6] || "",                        // cVorname
        nn: fields[7] || "",                        // cName
        str: fields[8] || "",
        plz: fields[9] || "",
        ort: fields[10] || "",
        land: fields[11] || "",
        tel: fields[12] || "",
        mob: fields[16] || "",
        mail: fields[17] || "",
        iso: fields[20] || ""
      });
      buffer = "";
    }
    addressIndexCache = { rows: idx, loadedAt: Date.now(), loadMs: Date.now() - t0 };
    addressIndexLoading = null;
    return addressIndexCache;
  })();
  return addressIndexLoading;
}

async function enrichArticlesWithNames(idx) {
  // Streamt tArtikelBeschreibung.csv (167MB) und picked nur erste 5 Felder pro valide Zeile.
  // Pattern: ^(\d+)\|(\d+)\|(\d+)\|(\d+)\|([^|]*)\| → kArtikel|kSprache|kPlattform|kShop|cName|...
  const map = new Map();
  for (const r of idx.rows) map.set(r.k, r);
  let added = 0;
  const stream = createReadStream(hfkSources.articleNames, { encoding: "latin1", highWaterMark: 1 << 20 });
  let leftover = "";
  const rx = /^(\d+)\|(\d+)\|(\d+)\|(\d+)\|([^|]*)\|/;
  await new Promise((resolve, reject) => {
    stream.on("data", (chunk) => {
      const data = leftover + chunk;
      const lines = data.split(/\r?\n/);
      leftover = lines.pop() || "";
      for (const line of lines) {
        const m = rx.exec(line);
        if (!m) continue;
        const kArtikel = parseInt(m[1], 10);
        const kSprache = parseInt(m[2], 10);
        if (kSprache !== 1) continue; // Nur Deutsch
        const target = map.get(kArtikel);
        if (target && !target.name) { target.name = m[5]; added++; }
      }
    });
    stream.on("end", () => {
      if (leftover) {
        const m = rx.exec(leftover);
        if (m) {
          const kArtikel = parseInt(m[1], 10);
          const target = map.get(kArtikel);
          if (target && !target.name) target.name = m[5];
        }
      }
      resolve();
    });
    stream.on("error", reject);
  });
  return added;
}

// === Order-Index: kKunde → Bestellungen mit Totals ===
let orderIndexCache = null;
let orderIndexLoading = null;

async function streamFirstFields(path, expectedMinFields, rx, handler) {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(path, { encoding: "latin1", highWaterMark: 1 << 20 });
    let leftover = "";
    let count = 0;
    stream.on("data", (chunk) => {
      const data = leftover + chunk;
      const lines = data.split(/\r?\n/);
      leftover = lines.pop() || "";
      for (const line of lines) {
        const m = rx.exec(line);
        if (!m) continue;
        handler(m);
        count++;
      }
    });
    stream.on("end", () => {
      if (leftover) {
        const m = rx.exec(leftover);
        if (m) { handler(m); count++; }
      }
      resolve(count);
    });
    stream.on("error", reject);
  });
}

async function loadOrderIndex() {
  if (orderIndexCache) return orderIndexCache;
  if (orderIndexLoading) return orderIndexLoading;
  orderIndexLoading = (async () => {
    const t0 = Date.now();
    // Step 1: Stream Auftrag — Pattern: ^kAuftrag|kBenutzer|kKunde|cAuftragsNr|nType|dErstellt|
    const byOrder = new Map();
    const byKunde = new Map();
    const auftragRx = /^(\d+)\|(\d*)\|(\d*)\|([^|]*)\|(\d+)\|([^|]+)\|/;
    const auftragCount = await streamFirstFields(hfkSources.orders, 6, auftragRx, (m) => {
      const kAuftrag = parseInt(m[1], 10);
      const kKunde = m[3] ? parseInt(m[3], 10) : 0;
      const rec = {
        k: kAuftrag,
        kKunde,
        nr: m[4],
        date: m[6].slice(0, 10),
        brutto: 0,
        zStatus: 0,
        retour: 0
      };
      byOrder.set(kAuftrag, rec);
      if (kKunde) {
        if (!byKunde.has(kKunde)) byKunde.set(kKunde, []);
        byKunde.get(kKunde).push(rec);
      }
    });
    const auftragMs = Date.now() - t0;
    // Step 2: Stream Eckdaten - join via kAuftrag
    const t1 = Date.now();
    // Pattern: ^kAuftrag|dLetzterVersand|dGedruckt|dGemailt|dVersandMail|dZahlungsMail|fWertNetto|fWertBrutto|
    // dates can be empty → use ([^|]*) for them
    const eckRx = /^(\d+)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([\d.]+)\|([\d.]+)\|/;
    let merged = 0;
    await streamFirstFields(hfkSources.orderTotals, 8, eckRx, (m) => {
      const kAuftrag = parseInt(m[1], 10);
      const rec = byOrder.get(kAuftrag);
      if (rec) {
        rec.brutto = parseFloat(m[8]) || 0;
        merged++;
      }
    });
    const eckMs = Date.now() - t1;
    // Step 3: sort orders by date desc per customer + compute aggregates
    const customerStats = new Map();
    for (const [kKunde, list] of byKunde) {
      list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      let totalRevenue = 0;
      let firstDate = "9999-99-99";
      let lastDate = "0000-00-00";
      for (const o of list) {
        totalRevenue += o.brutto || 0;
        if (o.date) {
          if (o.date < firstDate) firstDate = o.date;
          if (o.date > lastDate) lastDate = o.date;
        }
      }
      customerStats.set(kKunde, {
        orderCount: list.length,
        totalRevenue,
        firstDate: firstDate === "9999-99-99" ? "" : firstDate,
        lastDate: lastDate === "0000-00-00" ? "" : lastDate,
        aov: list.length ? totalRevenue / list.length : 0
      });
    }
    // VIP-Klassifizierung: Top 5% nach Umsatz ODER >5k Lifetime ODER >10 Bestellungen
    const allRevenues = [...customerStats.values()].map((s) => s.totalRevenue).sort((a, b) => b - a);
    const top5pctThreshold = allRevenues[Math.floor(allRevenues.length * 0.05)] || 0;
    let vipCount = 0;
    for (const [, s] of customerStats) {
      s.isVip = s.totalRevenue >= 5000 || s.totalRevenue >= top5pctThreshold || s.orderCount >= 10;
      if (s.isVip) vipCount++;
    }
    orderIndexCache = {
      byOrder,
      byKunde,
      customerStats,
      orderCount: byOrder.size,
      customerCount: byKunde.size,
      vipCount,
      top5pctThreshold,
      eckdatenMerged: merged,
      loadedAt: Date.now(),
      auftragMs,
      eckMs,
      totalMs: Date.now() - t0
    };
    orderIndexLoading = null;
    return orderIndexCache;
  })();
  return orderIndexLoading;
}

// === Hersteller-Lookup (klein) ===
let manufacturerMap = null;

async function loadManufacturerMap() {
  if (manufacturerMap) return manufacturerMap;
  try {
    const text = await readFile(hfkSources.manufacturers, "latin1");
    const m = new Map();
    const rx = /^(\d+)\|([^|]*)\|/;
    for (const line of text.split(/\r?\n/)) {
      const x = rx.exec(line);
      if (!x) continue;
      const k = parseInt(x[1], 10);
      if (!Number.isFinite(k)) continue;
      m.set(k, x[2]);
    }
    manufacturerMap = m;
    return m;
  } catch {
    manufacturerMap = new Map();
    return manufacturerMap;
  }
}

// === ABC-Klassifizierung (Verkauf_tAuftragPosition.csv 407MB) ===
let abcIndexCache = null;
let abcIndexLoading = null;

async function loadAbcIndex() {
  if (abcIndexCache) return abcIndexCache;
  if (abcIndexLoading) return abcIndexLoading;
  abcIndexLoading = (async () => {
    const t0 = Date.now();
    const agg = new Map(); // kArtikel → { qty, revenue, count }
    // Position-Pattern: kPos|kArtikel|kAuftrag|cArtNr|nReserviert|cName|cHinweis|fAnzahl|fEkNetto|fVkNetto|
    // kArtikel kann LEER sein (Gutscheine, Versand) → wir filtern.
    const posRx = /^(\d+)\|(\d+)\|(\d+)\|[^|]*\|\d*\|[^|]*\|[^|]*\|([\d.-]+)\|[\d.-]*\|([\d.-]+)\|/;
    let parsed = 0;
    await streamFirstFields(hfkSources.orderPositions, 10, posRx, (m) => {
      const kArtikel = parseInt(m[2], 10);
      if (!Number.isFinite(kArtikel) || kArtikel <= 0) return;
      const qty = parseFloat(m[4]) || 0;
      const vkNetto = parseFloat(m[5]) || 0;
      const lineRev = qty * vkNetto;
      const a = agg.get(kArtikel);
      if (a) { a.qty += qty; a.revenue += lineRev; a.count += 1; }
      else { agg.set(kArtikel, { qty, revenue: lineRev, count: 1 }); }
      parsed++;
    });
    const streamMs = Date.now() - t0;
    // Sortiere absteigend nach revenue → ABC
    const t1 = Date.now();
    const sorted = [...agg.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
    const totalRevenue = sorted.reduce((s, [, v]) => s + v.revenue, 0);
    let cumA = 0;
    let aBoundary = -1, bBoundary = -1;
    for (let i = 0; i < sorted.length; i++) {
      cumA += sorted[i][1].revenue;
      const pct = cumA / totalRevenue;
      if (aBoundary === -1 && pct >= 0.8) aBoundary = i;     // Klassische ABC: A = 80% des Umsatzes
      if (bBoundary === -1 && pct >= 0.95) { bBoundary = i; break; }
    }
    if (aBoundary === -1) aBoundary = sorted.length;
    if (bBoundary === -1) bBoundary = sorted.length;
    const classMap = new Map();
    for (let i = 0; i < sorted.length; i++) {
      const cls = i <= aBoundary ? "A" : i <= bBoundary ? "B" : "C";
      const [kArtikel, stats] = sorted[i];
      classMap.set(kArtikel, {
        cls,
        rank: i + 1,
        qty: stats.qty,
        revenue: Math.round(stats.revenue * 100) / 100,
        orderLines: stats.count
      });
    }
    const sortMs = Date.now() - t1;
    abcIndexCache = {
      classMap,
      totalArticlesSold: sorted.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      positionsParsed: parsed,
      aCount: aBoundary + 1,
      bCount: bBoundary - aBoundary,
      cCount: sorted.length - bBoundary - 1,
      loadedAt: Date.now(),
      streamMs,
      sortMs,
      totalMs: Date.now() - t0
    };
    abcIndexLoading = null;
    return abcIndexCache;
  })();
  return abcIndexLoading;
}

function getOrdersForKunde(kKunde, limit = 20) {
  if (!orderIndexCache) return null;
  const list = orderIndexCache.byKunde.get(kKunde) || [];
  return {
    rows: list.slice(0, limit),
    total: list.length,
    totalRevenue: list.reduce((s, r) => s + (r.brutto || 0), 0)
  };
}

function normalizeForSearch(s) {
  return String(s || "").toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function searchArticles(q, limit = 30, manufacturerId = 0) {
  if (!articleIndexCache) return { rows: [], total: 0, hint: "Index nicht geladen" };
  const needle = normalizeForSearch(q);
  const tokens = needle ? needle.split(/\s+/).filter(Boolean) : [];
  const matches = [];
  for (const row of articleIndexCache.rows) {
    if (manufacturerId && row.herst !== manufacturerId) continue;
    if (tokens.length) {
      const hay = normalizeForSearch((row.name || "") + " " + row.a + " " + row.han + " " + (row.herstName || "") + " " + (row.such || ""));
      if (!tokens.every(t => hay.includes(t))) continue;
    }
    matches.push(row);
    if (matches.length >= limit * 6) break;
  }
  // Sort: Name-Treffer bevorzugen, dann ABC (A > B > C), dann Bestand
  const abcRank = { A: 0, B: 1, C: 2 };
  const abcMap = abcIndexCache?.classMap;
  matches.sort((a, b) => {
    if (needle) {
      const ai = normalizeForSearch(a.name || a.a).indexOf(needle);
      const bi = normalizeForSearch(b.name || b.a).indexOf(needle);
      if (ai === -1 && bi !== -1) return 1;
      if (ai !== -1 && bi === -1) return -1;
      if (ai !== bi) return ai - bi;
    }
    if (abcMap) {
      const ra = abcRank[abcMap.get(a.k)?.cls] ?? 9;
      const rb = abcRank[abcMap.get(b.k)?.cls] ?? 9;
      if (ra !== rb) return ra - rb;
    }
    return (b.bestand || 0) - (a.bestand || 0);
  });
  // Enrich mit ABC-Daten
  const enriched = matches.slice(0, limit).map((r) => {
    if (!abcMap) return r;
    const abc = abcMap.get(r.k);
    return abc ? { ...r, abc: abc.cls, soldQty: abc.qty, soldRevenue: abc.revenue } : r;
  });
  return { rows: enriched, total: matches.length, abcReady: !!abcMap };
}

// === RAG-Retrieval über Artikel-Index (BM25) ===
// Lehrbuch "RAG-Systeme: von Theorie zur Praxis", Kap. 5: BM25 mit IDF-Gewichtung,
// TF-Sättigung (k1) und Längen-Normalisierung (b). Feld-Gewichtung (Name/Marke > Suchbegriffe)
// via Token-Vervielfachung (BM25F-Approximation). Invertierter Index → nur relevante Docs scoren.
const RAG_STOPWORDS = new Set([
  "was","wie","der","die","das","ist","sind","haben","wir","habt","ihr","ein","eine","einen",
  "von","vom","fuer","den","dem","des","und","oder","mit","im","in","am","an","auf","gibt","es",
  "kostet","kosten","preis","lager","bestand","welche","welcher","welches","mir","mal","bitte",
  "zeig","zeige","suche","brauche","ich","kann","man","noch","zur","zum","viel","wieviel","euro"
]);
const BM25_K1 = 1.5, BM25_B = 0.75;
// Feld-Gewichte (wie oft ein Token aus dem Feld in den "Dokument-Bag" gezählt wird)
const RAG_FIELD_WEIGHTS = { name: 3, marke: 3, artnr: 2, such: 1 };

function ragTokenize(s) {
  return normalizeForSearch(s || "").split(/\s+/).filter(t => t.length >= 2 && !RAG_STOPWORDS.has(t));
}

// Baut invertierten BM25-Index einmalig, gecached an articleIndexCache.
function buildRagBm25() {
  if (!articleIndexCache) return null;
  if (articleIndexCache._bm25) return articleIndexCache._bm25;
  const t0 = Date.now();
  const rows = articleIndexCache.rows;
  const postings = new Map();   // token -> Array<[docIdx, tf]>
  const df = new Map();         // token -> doc count
  const docLen = new Float64Array(rows.length);
  let totalLen = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const bag = new Map(); // token -> gewichtete tf
    const addField = (text, w) => {
      for (const tok of ragTokenize(text)) bag.set(tok, (bag.get(tok) || 0) + w);
    };
    addField(r.name || r.a, RAG_FIELD_WEIGHTS.name);
    addField(r.herstName, RAG_FIELD_WEIGHTS.marke);
    addField(r.a + " " + (r.han || ""), RAG_FIELD_WEIGHTS.artnr);
    addField(r.such, RAG_FIELD_WEIGHTS.such);
    let len = 0;
    for (const [tok, tf] of bag) {
      len += tf;
      if (!postings.has(tok)) postings.set(tok, []);
      postings.get(tok).push([i, tf]);
      df.set(tok, (df.get(tok) || 0) + 1);
    }
    docLen[i] = len;
    totalLen += len;
  }
  const avgdl = rows.length ? totalLen / rows.length : 0;
  const bm25 = { postings, df, docLen, avgdl, N: rows.length };
  articleIndexCache._bm25 = bm25;
  console.log(`[rag/bm25] Index gebaut: ${rows.length} Docs, ${postings.size} Terme, ${Date.now() - t0}ms`);
  return bm25;
}

function ragSearchArticles(q, k = 5) {
  if (!articleIndexCache) return [];
  const bm = buildRagBm25();
  if (!bm) return [];
  const qTokens = [...new Set(ragTokenize(q))];
  if (!qTokens.length) return [];
  const scores = new Map(); // docIdx -> score
  for (const term of qTokens) {
    const plist = bm.postings.get(term);
    if (!plist) continue;
    // IDF (BM25, mit +0.5-Glättung) — seltene Begriffe (Marken) wiegen stärker
    const idf = Math.log(1 + (bm.N - plist.length + 0.5) / (plist.length + 0.5));
    for (const [i, tf] of plist) {
      const norm = tf * (BM25_K1 + 1) / (tf + BM25_K1 * (1 - BM25_B + BM25_B * bm.docLen[i] / (bm.avgdl || 1)));
      scores.set(i, (scores.get(i) || 0) + idf * norm);
    }
  }
  if (!scores.size) return [];
  const ranked = [...scores.entries()]
    .map(([i, s]) => {
      const r = articleIndexCache.rows[i];
      // leichter Bonus für aktive Artikel mit Bestand (Verkäuflichkeit)
      const boost = (r.akt ? 0.15 : 0) + (r.bestand > 0 ? 0.1 : 0);
      return { r, s: s * (1 + boost) };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, k);
  return ranked.map(({ r }) => ({
    name: r.name || r.a || "",
    marke: r.herstName || "",
    artNr: r.a || "",
    han: r.han || "",
    preis: r.vk || 0,
    uvp: r.uvp || 0,
    bestand: r.bestand || 0,
    aktiv: !!r.akt
  }));
}

// === Manuell gepflegtes Produktwissen (Alter/Material/Pflege/USPs) ===
// Liegt im hfk-Workspace (state.workspaces.hfk.data.produktWissen). Kurzer TTL-Cache.
let _pwCache = null, _pwTs = 0;
const PW_TTL = 10000;
async function loadProduktWissen() {
  const now = Date.now();
  if (_pwCache && now - _pwTs < PW_TTL) return _pwCache;
  try {
    const state = JSON.parse(await readFile(statePath, "utf8"));
    const ws = state.workspaces?.hfk?.data || state;
    _pwCache = Array.isArray(ws.produktWissen) ? ws.produktWissen : [];
  } catch { _pwCache = []; }
  _pwTs = now;
  return _pwCache;
}

// Kleines Korpus → leichtgewichtiges feldgewichtetes Token-Scoring (kein BM25-Index nötig).
async function ragSearchKnowledge(q, k = 3) {
  const entries = await loadProduktWissen();
  if (!entries.length) return [];
  const qTokens = [...new Set(ragTokenize(q))];
  if (!qTokens.length) return [];
  const scored = [];
  for (const e of entries) {
    const titel = new Set(ragTokenize(e.titel || ""));
    const marke = new Set(ragTokenize(e.marke || ""));
    const tags = new Set(ragTokenize(Array.isArray(e.tags) ? e.tags.join(" ") : (e.tags || "")));
    const text = new Set(ragTokenize(e.text || ""));
    let score = 0;
    for (const t of qTokens) {
      if (titel.has(t)) score += 4;
      else if (marke.has(t)) score += 3;
      else if (tags.has(t)) score += 2;
      else if (text.has(t)) score += 1;
    }
    if (score > 0) scored.push({ e, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(({ e }) => ({
    titel: e.titel || "",
    marke: e.marke || "",
    text: e.text || "",
    tags: Array.isArray(e.tags) ? e.tags.join(", ") : (e.tags || "")
  }));
}

function searchAddresses(q, limit = 30) {
  if (!addressIndexCache) return { rows: [], total: 0, hint: "Index nicht geladen" };
  const needle = normalizeForSearch(q);
  if (!needle) return { rows: [], total: 0, hint: "Bitte Suchbegriff" };
  const tokens = needle.split(/\s+/).filter(Boolean);
  const matches = [];
  for (const row of addressIndexCache.rows) {
    const hay = normalizeForSearch([row.vn, row.nn, row.firma, row.plz, row.ort, row.mail, row.tel, row.mob].join(" "));
    if (tokens.every(t => hay.includes(t))) {
      matches.push(row);
      if (matches.length >= limit * 4) break;
    }
  }
  // Sortierung: wenn Order-Index da, dann nach Lifetime-Revenue desc; sonst nach Name
  const stats = orderIndexCache?.customerStats;
  if (stats) {
    matches.sort((a, b) => {
      const sa = stats.get(a.kKunde) || { totalRevenue: 0 };
      const sb = stats.get(b.kKunde) || { totalRevenue: 0 };
      return sb.totalRevenue - sa.totalRevenue;
    });
  } else {
    matches.sort((a, b) => (a.nn || "").localeCompare(b.nn || ""));
  }
  // Enrich mit Aggregaten wenn vorhanden
  const enriched = matches.slice(0, limit).map((row) => {
    if (!stats) return row;
    const s = stats.get(row.kKunde);
    if (!s) return row;
    return {
      ...row,
      vip: s.isVip,
      orderCount: s.orderCount,
      revenue: Math.round(s.totalRevenue * 100) / 100,
      aov: Math.round(s.aov * 100) / 100,
      lastDate: s.lastDate
    };
  });
  return { rows: enriched, total: matches.length, hasStats: !!stats };
}

// Cache für teure JTL-Aggregationen (in-memory, lebt bis Server-Restart)
const jtlAggregateCache = new Map();

// JTL exportiert pipe-delimited ohne Header. Spalten kommen aus schema.sql.
const jtlSchemas = {
  manufacturers: [
    "kHersteller", "cName", "cHomepage", "nSort",
    "cMetaTitle", "cMetaKeywords", "cMetaDescription", "cBeschreibung",
    "bRowversion", "kContact"
  ],
  suppliers: [
    "kLieferant", "cLiefNr", "cFirma", "cKontakt", "cStrasse",
    "cPLZ", "cOrt", "cLand", "cTelZentralle", "cTelDurchwahl",
    "cFax", "cEMail", "cWWW", "cAnmerkung", "dErstellt",
    "cAktiv", "cUstid", "cISO", "kSprache", "cStatus",
    "cLieferantID", "nKreditorennr", "cWaehrungISO", "nVSTFrei",
    "cExterneDatenUrl", "nDropshipping", "nLieferzeit", "nZahlungsziel",
    "fSkonto", "fMindestbestellwert", "fMindermengenzuschlag",
    "fFrachtkosten", "fVersandfreiAb", "cHinweisLieferbedingung",
    "cFirmenZusatz", "cAdresszusatz", "cBundesland", "nSkontoTage",
    "nStaffelPreisProBestellung", "nKeineEinkaufsliste",
    "cAnrede", "cVorname", "cNachname", "nDropshippingBeiNachnahme",
    "nStandardFirma", "nStandardLager", "fMwStFreiposition",
    "nDropshippingFreipositionen", "nJtlFulfillment", "bRowversion", "nType"
  ]
};

function parseJtlPipe(text, columns) {
  const stripped = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const lines = stripped.split(/\r?\n/);
  const expected = columns.length;
  const out = [];
  let buffer = "";
  for (const line of lines) {
    if (!line && !buffer) continue;
    const candidate = buffer ? buffer + "\n" + line : line;
    const fields = candidate.split("|");
    // Tolerant: erste Spalte muss numerisch oder die Standard-PK sein, sonst Zeile ist Fragment
    if (fields.length === expected) {
      const obj = {};
      columns.forEach((c, i) => { obj[c] = fields[i]; });
      out.push(obj);
      buffer = "";
    } else if (fields.length > expected) {
      // Mehr Pipes als erwartet — wahrscheinlich literal | im Text, joinen ab letzter Spalte
      const head = fields.slice(0, expected - 1);
      const tail = fields.slice(expected - 1).join("|");
      const obj = {};
      columns.forEach((c, i) => { obj[c] = i < expected - 1 ? head[i] : tail; });
      out.push(obj);
      buffer = "";
    } else {
      // Zu wenige Pipes — vermutlich Fortsetzung eines Multiline-Feldes
      buffer = candidate;
    }
  }
  return out;
}

function parseCsv(text, delimiter = ";") {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  let i = 0;
  const stripped = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  while (i < stripped.length) {
    const ch = stripped[i];
    if (inQuotes) {
      if (ch === '"') {
        if (stripped[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i += 1; continue;
      }
      field += ch; i += 1; continue;
    }
    if (ch === '"') { inQuotes = true; i += 1; continue; }
    if (ch === delimiter) { row.push(field); field = ""; i += 1; continue; }
    if (ch === "\r") { i += 1; continue; }
    if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; i += 1; continue; }
    field += ch; i += 1;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).filter((r) => r.length && r.some((c) => c !== "")).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h.trim()] = (r[idx] ?? "").trim(); });
    return obj;
  });
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};
const allowedExtensions = new Set(Object.keys(mimeTypes));

async function readBody(request, maxBytes = MAX_BODY) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

async function readJsonBody(request, maxBytes = MAX_BODY) {
  const raw = await readBody(request, maxBytes);
  return JSON.parse(raw);
}

async function handleAuth(request, response, url) {
  if (url.pathname === "/auth/status" && request.method === "GET") {
    const sess = getSessionFromRequest(request);
    response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
    response.end(JSON.stringify({
      requireAuth: authConfig.requireAuth,
      authenticated: !!sess,
      role: sess?.tgRole || null
    }));
    return true;
  }

  if (url.pathname === "/auth/logout" && request.method === "POST") {
    if (!requireSameOrigin(request)) {
      response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "CSRF: Origin nicht erlaubt" }));
      return true;
    }
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies.magaloko_session;
    if (token) {
      const hashed = hashToken(token);
      const sess = sessions[hashed];
      if (sess) {
        audit("auth.logout", { ip: clientIp(request), email: sess.email });
        delete sessions[hashed];
        await saveSessions();
      }
    }
    clearSessionCookie(response);
    response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
    response.end(JSON.stringify({ ok: true }));
    return true;
  }

  return false;
}

// Öffentliche Shell-Assets: enthalten KEINE Geschäftsdaten (nur Client-Code/Styling).
// Nötig damit Login-Seite + Telegram-Bootstrap laden können, bevor eine Session existiert.
const PUBLIC_ASSETS = new Set(["/styles.css", "/app.js", "/sw.js", "/manifest.json", "/icon.svg"]);

function requireAuthFor(request, url) {
  if (!authConfig.requireAuth) return false;
  const method = (request?.method || "GET").toUpperCase();
  // Login-Seite und Auth-Endpoints sind immer erreichbar
  if (url.pathname.startsWith("/auth/")) return false;
  if (url.pathname === "/login.html") return false;
  // Telegram-Login muss OHNE Session erreichbar sein (sonst Henne-Ei: kein Login möglich)
  if (url.pathname === "/api/tg-auth" && method === "POST") return false;
  // RAG-Retrieval für den Bot: eigener interner Token-Check im Handler (kein Session-Cookie)
  if (url.pathname === "/api/rag/search" && method === "GET") return false;
  // Statische Shell-Assets ohne Daten-Bezug freigeben (Login-Seite + PWA brauchen sie)
  if (method === "GET" && PUBLIC_ASSETS.has(url.pathname)) return false;
  // Stephan-View braucht Token im URL (?token=...)
  if (url.pathname === "/stephan.html" || url.pathname === "/stephan") {
    // Audit-Finding R8: kurzlebiges OTP statt permanentem stephanToken
    return !isValidStephanOtp(url.searchParams.get("token"));
  }
  // Stephan-OTP darf /api/state NUR lesen (GET), niemals schreiben (Audit-Finding #2)
  if (method === "GET" && url.pathname === "/api/state" &&
      isValidStephanOtp(url.searchParams.get("token"))) {
    return false;
  }
  return true;
}

// Reusable Mail-Versand via konfigurierter SMTP
// Wochenstart (Montag) aus Date als YYYY-MM-DD
function isoWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function isoWeekLabel(weekStart) {
  const d = new Date(weekStart);
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  const weekNr = 1 + Math.ceil((firstThursday - target) / 604800000);
  return `KW ${weekNr} / ${d.getFullYear()}`;
}

// Streaming-Aggregator für Rechnung_tRechnung.csv (140 MB, nicht in RAM laden)
async function aggregateInvoicesByWeek({ since } = {}) {
  const cacheKey = "invoices-by-week:" + (since || "all");
  if (jtlAggregateCache.has(cacheKey)) {
    const cached = jtlAggregateCache.get(cacheKey);
    if (Date.now() - cached.ts < 6 * 60 * 60 * 1000) return cached.data; // 6h cache
  }

  const sinceDate = since ? new Date(since) : null;
  const buckets = new Map(); // weekStart -> { invoices, customers:Set, currencies:Set }

  return new Promise((resolve, reject) => {
    const stream = createReadStream(hfkSources.invoices, { encoding: "utf8" });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });
    let lineNum = 0;
    let parsed = 0;
    rl.on("line", (line) => {
      lineNum++;
      // Spalten: 0=kRechnung, 2=kKunde, 4=dErstellt
      const cols = line.split("|");
      if (cols.length < 6) return;
      const kKunde = cols[2];
      const dErstellt = cols[4];
      if (!dErstellt || dErstellt.length < 10) return;
      const date = new Date(dErstellt);
      if (isNaN(date.getTime())) return;
      if (sinceDate && date < sinceDate) return;
      const weekStart = isoWeekStart(date);
      if (!buckets.has(weekStart)) buckets.set(weekStart, { invoices: 0, customers: new Set() });
      const b = buckets.get(weekStart);
      b.invoices += 1;
      if (kKunde && kKunde !== "0") b.customers.add(kKunde);
      parsed++;
    });
    rl.on("close", () => {
      const result = Array.from(buckets.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([weekStart, b]) => ({
          weekStart,
          weekLabel: isoWeekLabel(weekStart),
          invoices: b.invoices,
          uniqueCustomers: b.customers.size
        }));
      const summary = {
        totalLines: lineNum,
        parsedRows: parsed,
        weeksCovered: result.length,
        weeks: result
      };
      jtlAggregateCache.set(cacheKey, { ts: Date.now(), data: summary });
      resolve(summary);
    });
    rl.on("error", reject);
  });
}

// ICS-Generator: alle Termine, Versprechen-Deadlines und kritischen Aufgaben
function icsEscape(text) {
  return String(text || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function icsFormatDate(dateStr) {
  // YYYY-MM-DD -> YYYYMMDD (all-day event)
  return String(dateStr || "").replace(/-/g, "");
}

function icsFormatStamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEvent({ uid, summary, description, dateStart, dateEnd, allDay = true }) {
  const lines = [];
  lines.push("BEGIN:VEVENT");
  lines.push(`UID:${uid}@magaloko`);
  lines.push(`DTSTAMP:${icsFormatStamp()}`);
  if (allDay) {
    lines.push(`DTSTART;VALUE=DATE:${icsFormatDate(dateStart)}`);
    if (dateEnd) lines.push(`DTEND;VALUE=DATE:${icsFormatDate(dateEnd)}`);
  }
  lines.push(`SUMMARY:${icsEscape(summary)}`);
  if (description) lines.push(`DESCRIPTION:${icsEscape(description)}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

function buildIcs(state) {
  const events = [];
  (state.meetings || []).forEach((m) => {
    if (!m.date) return;
    events.push(icsEvent({
      uid: "meeting-" + m.id,
      summary: `📅 Gespräch: ${m.type}`,
      description: (m.goal || "") + (m.agenda ? "\n\nAgenda:\n" + m.agenda : ""),
      dateStart: m.date
    }));
  });
  (state.promises || []).forEach((p) => {
    if (!p.dueDate) return;
    if (p.status === "eingelöst" || p.status === "verworfen" || p.status === "verschoben") return;
    events.push(icsEvent({
      uid: "promise-" + p.id,
      summary: `🤝 Versprechen: ${p.what.slice(0, 60)}`,
      description: `Kontext: ${p.context || "—"}\nStatus: ${p.status}`,
      dateStart: p.dueDate
    }));
  });
  (state.tasks || []).forEach((t) => {
    if (!t.dueDate) return;
    if (t.status === "Erledigt") return;
    if (t.priority !== "hoch") return;
    events.push(icsEvent({
      uid: "task-" + t.id,
      summary: `📋 ${t.title}`,
      description: `Bereich: ${t.area}\nStatus: ${t.status}\nNotiz: ${t.notes || "—"}`,
      dateStart: t.dueDate
    }));
  });
  (state.reactivationCampaigns || []).forEach((c) => {
    if (!c.startDate || c.status === "abgebrochen" || c.status === "ausgewertet") return;
    events.push(icsEvent({
      uid: "campaign-" + c.id,
      summary: `📨 Kampagne: ${c.name}`,
      description: `Segment: ${c.size} Empfänger · Angebot: ${c.offer || "—"}`,
      dateStart: c.startDate
    }));
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MAGALOKO//Mago Cockpit//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:MAGALOKO",
    "X-WR-TIMEZONE:Europe/Berlin",
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");
}

async function sendMailGeneric({ to, subject, text, html }) {
  if (!authConfig.smtp?.host || !authConfig.smtp?.user || !authConfig.smtp?.pass) {
    throw new Error("SMTP nicht konfiguriert (config/auth.json → smtp)");
  }
  const nodemailer = await import("nodemailer").catch(() => null);
  if (!nodemailer) throw new Error("nodemailer fehlt — npm install nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: authConfig.smtp.host,
    port: authConfig.smtp.port || 587,
    secure: authConfig.smtp.secure || false,
    auth: { user: authConfig.smtp.user, pass: authConfig.smtp.pass }
  });
  return transporter.sendMail({
    from: authConfig.smtp.from || authConfig.smtp.user,
    to, subject, text, html
  });
}

async function handleApi(request, response, url) {
  if (url.pathname === "/api/mail/send" && request.method === "POST") {
    if (!requireSameOrigin(request)) {
      response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "CSRF: Origin nicht erlaubt" }));
      return true;
    }
    try {
      const body = await readBody(request);
      const { to, subject, text, html, source } = JSON.parse(body);
      if (!to || !subject || (!text && !html)) {
        response.writeHead(400, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "to, subject und text/html sind Pflicht" }));
        return true;
      }
      // Audit-Finding R6: Mail-Relay verhindern — nur konfigurierte Empfänger erlaubt
      const allowedRecipients = authConfig.allowedEmails || [];
      if (allowedRecipients.length > 0 && !allowedRecipients.includes(to)) {
        response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Empfänger nicht in allowedEmails" }));
        return true;
      }
      await sendMailGeneric({ to, subject, text, html });
      await audit("mail.sent", { to, subject, source: source || "manual" });
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ ok: true }));
    } catch (error) {
      // Audit-Finding R9: keine internen Fehlerdetails an Client
      console.error("[mail/send]", error.message);
      response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "Mail konnte nicht gesendet werden" }));
    }
    return true;
  }

  if (url.pathname === "/api/mail/status" && request.method === "GET") {
    // Audit-Finding R8: SMTP-Adresse nicht an Client senden (Infrastruktur-Information)
    response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
    response.end(JSON.stringify({
      configured: !!(authConfig.smtp?.host && authConfig.smtp?.user && authConfig.smtp?.pass)
    }));
    return true;
  }

  if (url.pathname === "/api/slack/send" && request.method === "POST") {
    if (!requireSameOrigin(request)) {
      response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "CSRF: Origin nicht erlaubt" }));
      return true;
    }
    try {
      const body = await readBody(request);
      const { text, source } = JSON.parse(body);
      if (!authConfig.slackWebhook) {
        response.writeHead(400, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Slack-Webhook nicht konfiguriert (config/auth.json → slackWebhook)" }));
        return true;
      }
      const resp = await fetch(authConfig.slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!resp.ok) throw new Error("Slack-Webhook: " + resp.status);
      await audit("slack.sent", { source: source || "manual" });
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ ok: true }));
    } catch (error) {
      console.error("[slack/send]", error.message);
      response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "Slack-Nachricht konnte nicht gesendet werden" }));
    }
    return true;
  }

  if (url.pathname === "/api/audit/log" && request.method === "GET") {
    try {
      // Audit-Finding R7: negativen limit-Wert verhindern (slice(-1) liefert fast alles)
      const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit")) || 500, 5000));
      const text = await readFile(auditPath, "utf8").catch(() => "");
      const lines = text.split("\n").filter(Boolean).slice(-limit).reverse();
      const events = lines.map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
      // Audit-Finding R7: IP-Adressen aus Client-Response redakten (PII)
      const redacted = events.map(({ ip: _ip, ...rest }) => rest);
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ total: lines.length, events: redacted }));
    } catch {
      response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "Audit-Log konnte nicht gelesen werden" }));
    }
    return true;
  }

  if (url.pathname === "/api/capture" && request.method === "POST") {
    if (!requireSameOrigin(request)) {
      response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "CSRF: Origin nicht erlaubt" }));
      return true;
    }
    try {
      const body = await readJsonBody(request, MAX_BODY);
      const { source, subject, text, sender, sentAt } = body;
      if (!text) {
        response.writeHead(400, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "text ist Pflicht" }));
        return true;
      }
      // Audit-Finding R5: withStateLock serialisiert Read-Modify-Write → kein Concurrent-Capture Race
      const entry = await withStateLock(async () => {
        const stateRaw = await readFile(statePath, "utf8").catch(() => "{}");
        const state = JSON.parse(stateRaw);
        if (!Array.isArray(state.captureInbox)) state.captureInbox = [];
        const e = {
          id: "cap-" + Date.now() + "-" + Math.round(Math.random() * 1000),
          source: source || "manual",
          subject: subject || "",
          text: String(text).slice(0, 10000),
          sender: sender || "",
          sentAt: sentAt || new Date().toISOString(),
          receivedAt: new Date().toISOString(),
          processed: false,
          parsedKind: null,
          parsedRefId: null
        };
        state.captureInbox.unshift(e);
        state.captureInbox = state.captureInbox.slice(0, 500);
        state.updatedAt = Date.now();
        await mkdir(dataDir, { recursive: true });
        // Audit-Finding R4: pro Request eindeutiger Tmp-Name → keine Tmp-Race-Condition
        const captureTmp = `${statePath}.${process.pid}.${Date.now()}.tmp`;
        await writeFile(captureTmp, JSON.stringify(state), "utf8");
        await rename(captureTmp, statePath);
        broadcastSse("state-updated", { updatedAt: state.updatedAt, source: "capture" });
        return e;
      });
      await audit("capture.received", { source, subject, sender });
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ ok: true, entryId: entry.id }));
    } catch (error) {
      console.error("[capture]", error.message);
      response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "Capture konnte nicht gespeichert werden" }));
    }
    return true;
  }

  if (url.pathname === "/api/backups/list" && request.method === "GET") {
    try {
      const { readdir, stat } = await import("node:fs/promises");
      await mkdir(backupsDir, { recursive: true });
      const files = await readdir(backupsDir);
      const list = await Promise.all(files.filter((f) => f.endsWith(".json")).map(async (f) => {
        const s = await stat(join(backupsDir, f));
        return { name: f, size: s.size, mtime: s.mtime.toISOString() };
      }));
      list.sort((a, b) => b.name.localeCompare(a.name));
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ retentionDays: BACKUP_RETENTION_DAYS, count: list.length, backups: list }));
    } catch (error) {
      response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: error.message }));
    }
    return true;
  }

  if (url.pathname.startsWith("/api/backups/file/") && request.method === "GET") {
    const fileName = url.pathname.slice("/api/backups/file/".length).replace(/[^a-z0-9._-]/gi, "");
    try {
      const data = await readFile(join(backupsDir, fileName));
      response.writeHead(200, {
        "Content-Type": mimeTypes[".json"],
        "Content-Disposition": `attachment; filename="${fileName}"`
      });
      response.end(data);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Backup nicht gefunden");
    }
    return true;
  }

  if (url.pathname === "/api/backups/now" && request.method === "POST") {
    if (!requireSameOrigin(request)) {
      response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "CSRF: Origin nicht erlaubt" }));
      return true;
    }
    await performDailyBackup();
    response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
    response.end(JSON.stringify({ ok: true }));
    return true;
  }

  // Attachments: list, upload (base64 JSON), download, delete
  // Pfad: /api/attachments/<entityType>/<entityId>
  if (url.pathname.startsWith("/api/attachments/")) {
    const parts = url.pathname.split("/").filter(Boolean); // ["api","attachments","<type>","<id>", "<fileId>"?]
    if (parts.length < 4) {
      response.writeHead(400, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "type+id nötig" }));
      return true;
    }
    const entityType = parts[2].replace(/[^a-z0-9_-]/gi, "");
    const entityId = parts[3].replace(/[^a-z0-9_-]/gi, "");
    const fileId = parts[4]?.replace(/[^a-z0-9_.-]/gi, "");
    const folder = join(attachmentsDir, entityType, entityId);

    // Audit-Finding R6: aktive Extensions blockieren — kein same-origin Script-Execution via Upload
    const BLOCKED_EXTS = new Set([".html", ".htm", ".svg", ".js", ".mjs", ".ts", ".jsx", ".tsx",
      ".php", ".py", ".rb", ".sh", ".bash", ".ps1", ".bat", ".cmd", ".vbs", ".xml", ".xhtml"]);

    if (request.method === "GET" && !fileId) {
      // Audit-Finding R6: kein mkdir auf GET → verhindert Directory-Anlage-DoS
      try {
        const { readdir, stat } = await import("node:fs/promises");
        let files = [];
        try {
          files = await readdir(folder);
        } catch { /* Ordner existiert nicht = leere Liste */ }
        const list = await Promise.all(files.map(async (name) => {
          const s = await stat(join(folder, name));
          return { name, size: s.size, mtime: s.mtime.toISOString() };
        }));
        response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ entityType, entityId, files: list }));
      } catch (error) {
        response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Fehler beim Lesen der Anhänge" }));
      }
      return true;
    }

    if (request.method === "GET" && fileId) {
      // Audit-Finding R6: immer als Download ausliefern (nie inline), nosniff, sicheres MIME
      try {
        const data = await readFile(join(folder, fileId));
        const ext = extname(fileId).toLowerCase();
        // Aktive Typen auf octet-stream downgraden
        const safeTypes = new Set([".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif",
          ".mp4", ".webm", ".mp3", ".ogg", ".zip", ".csv", ".txt"]);
        const ct = safeTypes.has(ext) ? (mimeTypes[ext] || "application/octet-stream") : "application/octet-stream";
        response.writeHead(200, {
          "Content-Type": ct,
          "Content-Disposition": `attachment; filename="${fileId}"`,
          "X-Content-Type-Options": "nosniff"
        });
        response.end(data);
      } catch {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
      }
      return true;
    }

    if (request.method === "POST") {
      if (!requireSameOrigin(request)) {
        response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "CSRF: Origin nicht erlaubt" }));
        return true;
      }
      // Upload via JSON: { filename, dataBase64 }
      try {
        const body = await readJsonBody(request, MAX_ATTACHMENT * 1.4);
        const { filename, dataBase64 } = body;
        if (!filename || !dataBase64) throw new Error("filename + dataBase64 sind Pflicht");
        const safeName = filename.replace(/[^a-z0-9._-]/gi, "_").slice(0, 200);
        // Audit-Finding R6: aktive Extensions beim Upload blockieren
        const uploadExt = extname(safeName).toLowerCase();
        if (BLOCKED_EXTS.has(uploadExt)) throw new Error(`Dateityp ${uploadExt} nicht erlaubt`);
        const fileName = `${Date.now()}-${safeName}`;
        const buffer = Buffer.from(dataBase64, "base64");
        if (buffer.length > MAX_ATTACHMENT) throw new Error("Datei zu groß (max 20 MB)");
        await mkdir(folder, { recursive: true });
        await writeFile(join(folder, fileName), buffer);
        await audit("attachment.upload", { entityType, entityId, fileName, size: buffer.length });
        response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ ok: true, fileName, size: buffer.length }));
      } catch (error) {
        console.error("[attachments/upload]", error.message);
        response.writeHead(400, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Anhang konnte nicht hochgeladen werden" }));
      }
      return true;
    }

    if (request.method === "DELETE" && fileId) {
      if (!requireSameOrigin(request)) {
        response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "CSRF: Origin nicht erlaubt" }));
        return true;
      }
      try {
        const { unlink } = await import("node:fs/promises");
        await unlink(join(folder, fileId));
        await audit("attachment.delete", { entityType, entityId, fileId });
        response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ ok: true }));
      } catch {
        response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Anhang konnte nicht gelöscht werden" }));
      }
      return true;
    }

    return false;
  }

  if (url.pathname === "/api/jtl/kpis/weekly" && request.method === "GET") {
    try {
      const since = url.searchParams.get("since"); // optional ISO-Date
      const data = await aggregateInvoicesByWeek({ since });
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify(data));
    } catch (error) {
      response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: error.message }));
    }
    return true;
  }

  if (url.pathname === "/api/calendar.ics" && request.method === "GET") {
    try {
      const raw = await readFile(statePath, "utf8");
      const state = JSON.parse(raw);
      const ics = buildIcs(state);
      response.writeHead(200, {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": "attachment; filename=magaloko.ics",
        "Cache-Control": "no-cache"
      });
      response.end(ics);
    } catch (error) {
      // Audit-Finding R7: keine internen Fehlermeldungen an Client
      console.error("[calendar]", error.message);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Kalender konnte nicht erzeugt werden");
    }
    return true;
  }

  if (url.pathname === "/api/stephan-link" && request.method === "GET") {
    // Nur Admin darf Stephan-Links erzeugen — autoritativ über Telegram-Rolle (tgRole),
    // E-Mail-Admin nur noch als Legacy-Fallback (siehe isSessionAdmin).
    if (authConfig.requireAuth && !isSessionAdmin(request)) {
      response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "Nur der Admin-Account darf Stephan-Links erzeugen" }));
      return true;
    }
    // Audit-Finding R8: kurzlebiges OTP (1 h, max 60 Abrufe) — permanenter Token verlässt Server nie
    const base = authConfig.publicUrl || `http://127.0.0.1:${port}`;
    const otp = generateStephanOtp();
    response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
    response.end(JSON.stringify({
      url: `${base}/stephan.html?token=${encodeURIComponent(otp)}`,
      expiresIn: "1h"
    }));
    return true;
  }

  if (url.pathname === "/api/integrations/status" && request.method === "GET") {
    response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
    response.end(JSON.stringify({
      mail: !!(authConfig.smtp?.host && authConfig.smtp?.user && authConfig.smtp?.pass),
      slack: !!authConfig.slackWebhook,
      calendar: true
    }));
    return true;
  }

  if (url.pathname === "/api/state" && request.method === "GET") {
    try {
      const data = await readFile(statePath, "utf8");
      // === HARTE ROLLEN-SPERRE: Telegram-Mitarbeiter sehen NUR Akademie(+Produkt)-Daten ===
      // Verhindert dass ein Mitarbeiter per DevTools /api/state direkt abruft und alles liest.
      const sess = getSessionFromRequest(request);
      if (sess && sess.tgRole === "mitarbeiter") {
        try {
          const full = JSON.parse(data);
          const filtered = filterStateForTgRole(full, sess.tgModules || ["akademie"]);
          response.writeHead(200, { "Content-Type": mimeTypes[".json"], "X-MAGALOKO-Role": "mitarbeiter" });
          response.end(JSON.stringify(filtered));
          return true;
        } catch (e) {
          console.error("[state-filter]", e.message);
          // Im Zweifel fail-closed: leeren State statt vollen liefern
          response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
          response.end("{}");
          return true;
        }
      }
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
        response.end("{}");
      } else {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("read failed");
      }
    }
    return true;
  }

  if (url.pathname === "/api/jtl/manufacturers" && request.method === "GET") {
    try {
      const text = await readFile(hfkSources.manufacturers, "utf8");
      const rows = parseJtlPipe(text, jtlSchemas.manufacturers);
      // Audit-Finding R7: source-Pfad nicht an Client senden
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ count: rows.length, rows }));
    } catch (error) {
      console.error("[jtl/manufacturers]", error.message);
      response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.code === "ENOENT" ? "Hersteller-Daten nicht gefunden" : "Fehler beim Lesen der Hersteller-Daten");
    }
    return true;
  }

  if (url.pathname === "/api/jtl/suppliers" && request.method === "GET") {
    try {
      const text = await readFile(hfkSources.suppliers, "utf8");
      const rows = parseJtlPipe(text, jtlSchemas.suppliers);
      // Audit-Finding R7: source-Pfad nicht an Client senden
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ count: rows.length, rows }));
    } catch (error) {
      console.error("[jtl/suppliers]", error.message);
      response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.code === "ENOENT" ? "Lieferanten-Daten nicht gefunden" : "Fehler beim Lesen der Lieferanten-Daten");
    }
    return true;
  }

  // === RAG-Retrieval für den Telegram-Bot (interner Token, kein Browser-Zugriff) ===
  if (url.pathname === "/api/rag/search" && request.method === "GET") {
    try {
      const tgCfg = JSON.parse(await readFile(join(root, "config", "telegram.json"), "utf8").catch(() => "{}"));
      const expected = tgCfg.internalApiToken;
      const got = request.headers["x-internal-token"];
      if (!expected || got !== expected) {
        response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "forbidden" }));
        return true;
      }
      await loadArticleIndex();
      const q = url.searchParams.get("q") || "";
      const k = Math.min(10, Math.max(1, parseInt(url.searchParams.get("k") || "5", 10)));
      const docs = ragSearchArticles(q, k);
      const knowledge = await ragSearchKnowledge(q, 3); // kuratiertes Produktwissen
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ ok: true, query: q, docs, knowledge }));
    } catch (err) {
      console.error("[rag/search]", err.message);
      response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "interner Fehler" }));
    }
    return true;
  }

  if (url.pathname === "/api/jtl/articles/search" && request.method === "GET") {
    try {
      const idx = await loadArticleIndex();
      // ABC-Index im Hintergrund anstoßen (nicht blockierend)
      if (!abcIndexCache && !abcIndexLoading) loadAbcIndex().catch(() => {});
      const q = url.searchParams.get("q") || "";
      const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "30", 10));
      const manufacturerId = parseInt(url.searchParams.get("manufacturer") || "0", 10);
      const result = searchArticles(q, limit, manufacturerId);
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ ...result, indexSize: idx.rows.length, loadedAt: idx.loadedAt, loadMs: idx.loadMs }));
    } catch (error) {
      // Audit-Finding R7: keine internen Fehlermeldungen an Client
      console.error("[jtl/articles/search]", error.message);
      response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.code === "ENOENT" ? "Artikel-Index nicht gefunden" : "Fehler bei der Artikelsuche");
    }
    return true;
  }

  // Top-Artikel nach ABC-Klasse (für Übersicht)
  if (url.pathname === "/api/jtl/articles/top" && request.method === "GET") {
    try {
      await loadArticleIndex();
      const abc = await loadAbcIndex();
      const cls = url.searchParams.get("cls") || "A";
      const limit = Math.min(200, parseInt(url.searchParams.get("limit") || "50", 10));
      const manufacturerId = parseInt(url.searchParams.get("manufacturer") || "0", 10);
      const rows = [];
      // classMap ist sortiert by Rank
      for (const [kArtikel, abcInfo] of abc.classMap) {
        if (abcInfo.cls !== cls) continue;
        const a = articleIndexCache.rows.find((x) => x.k === kArtikel);
        if (!a) continue;
        if (manufacturerId && a.herst !== manufacturerId) continue;
        rows.push({
          ...a,
          abc: abcInfo.cls,
          rank: abcInfo.rank,
          soldQty: abcInfo.qty,
          soldRevenue: abcInfo.revenue,
          orderLines: abcInfo.orderLines
        });
        if (rows.length >= limit) break;
      }
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ rows, total: abc.aCount + (cls === "B" ? abc.bCount : 0) + (cls === "C" ? abc.cCount : 0), cls }));
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.message);
    }
    return true;
  }

  // Bestand-Check: kritische A/B-Artikel mit niedrigem Bestand
  if (url.pathname === "/api/jtl/articles/stock-check" && request.method === "GET") {
    try {
      await loadArticleIndex();
      const abc = await loadAbcIndex();
      const manufacturerId = parseInt(url.searchParams.get("manufacturer") || "0", 10);
      const includeCls = (url.searchParams.get("cls") || "AB").toUpperCase();
      const limit = Math.min(200, parseInt(url.searchParams.get("limit") || "60", 10));
      const matches = [];
      for (const a of articleIndexCache.rows) {
        if (manufacturerId && a.herst !== manufacturerId) continue;
        if (!a.akt) continue;
        const abcInfo = abc.classMap.get(a.k);
        if (!abcInfo) continue;
        if (!includeCls.includes(abcInfo.cls)) continue;
        matches.push({
          ...a,
          abc: abcInfo.cls,
          soldQty: abcInfo.qty,
          soldRevenue: abcInfo.revenue,
          stockStatus: a.bestand <= 0 ? "OOS" : a.bestand < 5 ? "Niedrig" : a.bestand < 15 ? "Mittel" : "OK"
        });
      }
      // Sortiere: zuerst OOS unter A-Klasse, dann nach abc-rank
      const stockRank = { OOS: 0, Niedrig: 1, Mittel: 2, OK: 3 };
      const abcRank = { A: 0, B: 1, C: 2 };
      matches.sort((x, y) => {
        const sx = stockRank[x.stockStatus], sy = stockRank[y.stockStatus];
        if (sx !== sy) return sx - sy;
        const ax = abcRank[x.abc], ay = abcRank[y.abc];
        if (ax !== ay) return ax - ay;
        return (y.soldRevenue || 0) - (x.soldRevenue || 0);
      });
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({
        rows: matches.slice(0, limit),
        total: matches.length,
        oosCount: matches.filter((r) => r.stockStatus === "OOS").length,
        niedrigCount: matches.filter((r) => r.stockStatus === "Niedrig").length
      }));
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.message);
    }
    return true;
  }

  // Kunden-Detail mit Lieblings-Marken
  const customerDetailMatch = url.pathname.match(/^\/api\/jtl\/customers\/(\d+)\/detail$/);
  if (customerDetailMatch && request.method === "GET") {
    // Audit-Finding R7/R8: DoS-Schutz — voller File-Stream pro Request, daher Rate-Limit pro IP
    const rlKey = `customer-detail:${customerDetailMatch[1]}:${clientIp(request)}`;
    if (!jtlHeavyAllowed(rlKey)) {
      response.writeHead(429, { "Content-Type": mimeTypes[".json"], "Retry-After": "15" });
      response.end(JSON.stringify({ error: "Bitte 15 Sekunden warten bevor erneut laden" }));
      return true;
    }
    try {
      await loadAddressIndex();
      await loadArticleIndex();
      const orderIdx = await loadOrderIndex();
      await loadAbcIndex();
      const kKunde = parseInt(customerDetailMatch[1], 10);
      // Profil aus Adress-Index (jüngste Adresse)
      const adressen = (addressIndexCache?.rows || []).filter((a) => a.kKunde === kKunde);
      const profile = adressen[0] || null;
      // Bestellungen
      const orders = orderIdx.byKunde.get(kKunde) || [];
      const stats = orderIdx.customerStats.get(kKunde) || {};
      // Lieblings-Marken: aus Order-Positions joinen (langsam für viele Orders, OK für 1 Kunde)
      const kAuftraege = new Set(orders.map((o) => o.k));
      const brandStats = new Map();
      // Brute-force über Positions
      const posRx = /^(\d+)\|(\d+)\|(\d+)\|[^|]*\|\d*\|[^|]*\|[^|]*\|([\d.-]+)\|[\d.-]*\|([\d.-]+)\|/;
      await new Promise((resolve) => {
        const stream = createReadStream(hfkSources.orderPositions, { encoding: "latin1", highWaterMark: 1 << 20 });
        let leftover = "";
        stream.on("data", (chunk) => {
          const data = leftover + chunk;
          const lines = data.split(/\r?\n/);
          leftover = lines.pop() || "";
          for (const line of lines) {
            const m = posRx.exec(line);
            if (!m) continue;
            const kAuftrag = parseInt(m[3], 10);
            if (!kAuftraege.has(kAuftrag)) continue;
            const kArtikel = parseInt(m[2], 10);
            if (!Number.isFinite(kArtikel) || kArtikel <= 0) continue;
            const a = articleIndexCache.rows.find((x) => x.k === kArtikel);
            if (!a || !a.herst) continue;
            const qty = parseFloat(m[4]) || 0;
            const vk = parseFloat(m[5]) || 0;
            const rev = qty * vk;
            const cur = brandStats.get(a.herst) || { qty: 0, revenue: 0, count: 0 };
            cur.qty += qty; cur.revenue += rev; cur.count += 1;
            brandStats.set(a.herst, cur);
          }
        });
        stream.on("end", resolve);
        stream.on("error", resolve);
      });
      const mmap = await loadManufacturerMap();
      const brands = [...brandStats.entries()]
        .map(([k, s]) => ({ k, name: mmap.get(k) || `#${k}`, qty: s.qty, revenue: Math.round(s.revenue * 100) / 100, lines: s.count }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({
        kKunde,
        profile,
        addresses: adressen,
        orders: orders.slice(0, 50),
        stats,
        favoriteBrands: brands,
        isVip: stats.isVip || false
      }));
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.message);
    }
    return true;
  }

  // Marktanalyse-Validierung gegen echte Sales
  if (url.pathname === "/api/jtl/marktanalyse/validation" && request.method === "GET") {
    try {
      await loadArticleIndex();
      const abc = await loadAbcIndex();
      const mmap = await loadManufacturerMap();
      // Hersteller-Namen aus MA-2026 Sec02 (case-insensitive Match)
      const candidates = [
        { name: "Wobbel", priority: "A", quelle: "MA-2026 Sec02.1.1" },
        { name: "Jellycat", priority: "A", quelle: "MA-2026 Sec02.1.2" },
        { name: "Grimm's", priority: "A", quelle: "MA-2026 Sec02.1.3" },
        { name: "GRIMMS", priority: "A", quelle: "MA-2026 Sec02.1.3" },
        { name: "Tonies", priority: "A", quelle: "MA-2026 Sec02.1.4" },
        { name: "LIEWOOD", priority: "A", quelle: "MA-2026 Sec02.1.5" },
        { name: "Easywalker", priority: "B", quelle: "MA-2026 Sec02.2.1" },
        { name: "Angelcab", priority: "B", quelle: "MA-2026 Sec02.2.2" },
        { name: "Reima", priority: "B", quelle: "MA-2026 Sec02.2.3" },
        { name: "Finkid", priority: "B", quelle: "MA-2026 Sec02.2.4" },
        { name: "Mini Rodini", priority: "B", quelle: "MA-2026 Sec02.2.5" },
        { name: "MORI", priority: "C", quelle: "MA-2026 Sec02.3.1" },
        { name: "GATHRE", priority: "C", quelle: "MA-2026 Sec02.3.2" },
        { name: "BOOB", priority: "C", quelle: "MA-2026 Sec02.3.3" },
        { name: "Nuna", priority: "C", quelle: "MA-2026 Sec02.3.4" },
        { name: "GANNI", priority: "C", quelle: "MA-2026 Sec02.3.5" },
        { name: "Stapelstein", priority: "Bestehend", quelle: "MA-2026 Sec04.2.5" },
        { name: "KONGES SLOEJD", priority: "Kerntraeger", quelle: "MA-2026 Sec04.1.2" },
        { name: "STOKKE", priority: "Kerntraeger", quelle: "MA-2026 Sec04.1.3" },
        { name: "JOOLZ", priority: "Kerntraeger", quelle: "MA-2026 Sec04.1.4" },
        { name: "CYBEX", priority: "Kerntraeger", quelle: "MA-2026 Sec04.1.5" }
      ];
      // Build manufacturer name index for case-insensitive search
      const allHerst = [...mmap.entries()].map(([k, n]) => ({ k, name: (n || "").trim(), lc: (n || "").trim().toLowerCase() }));
      const normalize = (s) => (s || "").toLowerCase()
        .replace(/['ʼ´`]/g, "")
        .replace(/[øö]/g, "oe").replace(/[äà]/g, "ae").replace(/[ü]/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
      const results = [];
      for (const c of candidates) {
        const needle = normalize(c.name);
        // Erst exakter Match, dann startsWith
        let match = allHerst.find((h) => normalize(h.name) === needle);
        if (!match) match = allHerst.find((h) => normalize(h.name).startsWith(needle) && needle.length >= 4);
        if (!match) match = allHerst.find((h) => needle.startsWith(normalize(h.name)) && (h.name || "").length >= 4);
        if (!match) {
          results.push({
            kandidat: c.name, priority: c.priority, quelle: c.quelle,
            status: "FEHLT",
            details: "Hersteller nicht im JTL-Hersteller-Index gefunden",
            articleCount: 0, soldRevenue: 0, aCount: 0, bCount: 0, cCount: 0
          });
          continue;
        }
        // Alle Artikel dieser Marke + ABC-Verteilung
        const articles = articleIndexCache.rows.filter((a) => a.herst === match.k);
        let aCount = 0, bCount = 0, cCount = 0, totalRev = 0, totalQty = 0;
        for (const a of articles) {
          const info = abc.classMap.get(a.k);
          if (info) {
            if (info.cls === "A") aCount++;
            else if (info.cls === "B") bCount++;
            else if (info.cls === "C") cCount++;
            totalRev += info.revenue;
            totalQty += info.qty;
          }
        }
        // Status-Logic
        let status = "PRUEFEN";
        if (articles.length === 0) status = "FEHLT";
        else if (aCount >= 3) status = "A_PERFORMER";
        else if (aCount >= 1) status = "STARK";
        else if (articles.length < 5) status = "AUSBAUFAEHIG";
        else status = "C_TAIL";
        results.push({
          kandidat: c.name, herstellerName: match.name, priority: c.priority, quelle: c.quelle, status,
          articleCount: articles.length, soldRevenue: Math.round(totalRev * 100) / 100, soldQty: totalQty,
          aCount, bCount, cCount
        });
      }
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ rows: results }));
    } catch (error) {
      console.error("[marktanalyse/validation]", error.message);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Fehler bei der Marktanalyse-Validierung");
    }
    return true;
  }

  if (url.pathname === "/api/jtl/articles/abc-summary" && request.method === "GET") {
    try {
      const abc = await loadAbcIndex();
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({
        totalArticlesSold: abc.totalArticlesSold,
        totalRevenue: abc.totalRevenue,
        aCount: abc.aCount,
        bCount: abc.bCount,
        cCount: abc.cCount,
        positionsParsed: abc.positionsParsed,
        loadMs: abc.totalMs
      }));
    } catch (error) {
      console.error("[jtl/abc-summary]", error.message);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Fehler beim Laden der ABC-Auswertung");
    }
    return true;
  }

  // Bot-Score-Aggregat (liest data/bot-scores.jsonl, vom Telegram-Bot geschrieben)
  if (url.pathname === "/api/bot/scores" && request.method === "GET") {
    const BOT_SCORES_MAX_BYTES = 2 * 1024 * 1024; // 2 MB — Audit-Finding R9: DoS-Schutz
    try {
      let lines = [];
      try {
        const raw = await readFile(join(dataDir, "bot-scores.jsonl"), "utf8");
        // Nur die letzten 2 MB auswerten — verhindert Memory-DoS bei wachsender Datei
        const slice = raw.length > BOT_SCORES_MAX_BYTES ? raw.slice(-BOT_SCORES_MAX_BYTES) : raw;
        lines = slice.split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      } catch { /* Datei existiert noch nicht */ }
      const byUser = new Map();
      for (const s of lines) {
        const key = s.name || ("User" + s.uid);
        if (!byUser.has(key)) byUser.set(key, { name: key, uid: s.uid, total: 0, correct: 0, lastTs: "", byMarke: {} });
        const u = byUser.get(key);
        u.total++;
        if (s.correct) u.correct++;
        if (s.ts > u.lastTs) u.lastTs = s.ts;
        const m = s.marke || "allgemein";
        u.byMarke[m] = u.byMarke[m] || { total: 0, correct: 0 };
        u.byMarke[m].total++; if (s.correct) u.byMarke[m].correct++;
      }
      const users = [...byUser.values()].map((u) => ({
        ...u,
        pct: u.total ? Math.round((u.correct / u.total) * 100) : 0
      })).sort((a, b) => b.total - a.total);
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ users, totalDrills: lines.length, totalUsers: users.length }));
    } catch (error) {
      console.error("[bot/scores]", error.message);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Fehler beim Laden der Bot-Scores");
    }
    return true;
  }

  if (url.pathname === "/api/jtl/manufacturers/list" && request.method === "GET") {
    try {
      const m = await loadManufacturerMap();
      const arr = [...m.entries()].map(([k, name]) => ({ k, name })).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ rows: arr, total: arr.length }));
    } catch (error) {
      console.error("[jtl/manufacturers/map]", error.message);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Fehler beim Laden der Hersteller-Zuordnung");
    }
    return true;
  }

  // /api/jtl/customers/12345/orders
  const ordersMatch = url.pathname.match(/^\/api\/jtl\/customers\/(\d+)\/orders$/);
  if (ordersMatch && request.method === "GET") {
    if (denyEmployeePii(request, response)) return true;
    try {
      const idx = await loadOrderIndex();
      const kKunde = parseInt(ordersMatch[1], 10);
      const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "20", 10));
      const result = getOrdersForKunde(kKunde, limit);
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({
        ...result,
        kKunde,
        indexInfo: { orderCount: idx.orderCount, customerCount: idx.customerCount, totalMs: idx.totalMs }
      }));
    } catch (error) {
      console.error("[jtl/orders]", error.message);
      response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.code === "ENOENT" ? "Bestell-Index nicht gefunden" : "Fehler beim Laden der Bestellungen");
    }
    return true;
  }

  if (url.pathname === "/api/jtl/customers/search" && request.method === "GET") {
    if (denyEmployeePii(request, response)) return true;
    try {
      const idx = await loadAddressIndex();
      // Order-Index im Hintergrund anstossen (nicht blockierend) — VIP-Info kommt beim zweiten Search
      if (!orderIndexCache && !orderIndexLoading) loadOrderIndex().catch(() => {});
      const q = url.searchParams.get("q") || "";
      const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "30", 10));
      const result = searchAddresses(q, limit);
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({
        ...result,
        indexSize: idx.rows.length,
        loadedAt: idx.loadedAt,
        loadMs: idx.loadMs,
        vipStatsReady: !!orderIndexCache
      }));
    } catch (error) {
      console.error("[jtl/customers/search]", error.message);
      response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.code === "ENOENT" ? "Kunden-Index nicht gefunden" : "Fehler bei der Kundensuche");
    }
    return true;
  }

  if (url.pathname === "/api/hfk/products" && request.method === "GET") {
    try {
      const text = await readFile(hfkSources.products, "utf8");
      const rows = parseCsv(text, ";");
      // Audit-Finding R6: internen Dateipfad nicht exponieren
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ count: rows.length, rows }));
    } catch (error) {
      // Audit-Finding R6: nur generische Meldung an Client, Details serverseitig loggen
      console.error("[hfk/products]", error.message);
      response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.code === "ENOENT" ? "Produktdaten nicht gefunden" : "Fehler beim Lesen der Produktdaten");
    }
    return true;
  }

  if (url.pathname === "/api/state/stream" && request.method === "GET") {
    // Audit-Finding R9: max. SSE-Verbindungen pro IP begrenzen (DoS-Schutz)
    const sseIp = clientIp(request);
    const SSE_MAX_PER_IP = 5;
    const SSE_GLOBAL_MAX = 50;
    const existingForIp = [...sseClients.values()].filter((c) => c._magalokoIp === sseIp).length;
    if (existingForIp >= SSE_MAX_PER_IP || sseClients.size >= SSE_GLOBAL_MAX) {
      response.writeHead(429, { "Content-Type": mimeTypes[".json"], "Retry-After": "30" });
      response.end(JSON.stringify({ error: "Zu viele SSE-Verbindungen" }));
      return true;
    }
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    });
    const clientId = Math.random().toString(36).slice(2, 10);
    response._magalokoIp = sseIp;
    sseClients.set(clientId, response);
    response.write(`: connected ${clientId}\n\n`);
    // Heartbeat alle 25s
    const heartbeat = setInterval(() => {
      try { response.write(`: ping\n\n`); } catch {
        // Audit-Finding R4: bei Schreib-Fehler Client aus Map entfernen (Memory-Leak)
        clearInterval(heartbeat);
        sseClients.delete(clientId);
      }
    }, 25000);
    request.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(clientId);
    });
    return true;
  }

  if (url.pathname === "/api/tg-auth" && request.method === "POST") {
    try {
      // Read body MIT hartem Größenlimit (64 KB) — /api/tg-auth ist bewusst public,
      // darum DoS-Schutz gegen riesige Bodies.
      const body = await new Promise((resolve, reject) => {
        let data = "";
        let size = 0;
        const MAX = 64 * 1024;
        request.on("data", (c) => {
          size += c.length;
          if (size > MAX) { reject(new Error("body too large")); request.destroy(); return; }
          data += c;
        });
        request.on("end", () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
        request.on("error", reject);
      }).catch((e) => { throw e; });
      const { initData } = body;
      if (!initData || typeof initData !== "string") {
        response.writeHead(400, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "initData fehlt" }));
        return true;
      }
      // Read telegram config
      const tgCfg = JSON.parse(await readFile(join(root, "config", "telegram.json"), "utf8").catch(() => "{}"));
      const token = tgCfg.token;
      if (!token) {
        response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Bot nicht konfiguriert" }));
        return true;
      }
      // Validate HMAC (konstantzeitnah via timingSafeEqual)
      const params = new URLSearchParams(initData);
      const hash = params.get("hash") || "";
      params.delete("hash");
      const dataCheckString = [...params.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("\n");
      const secretKey = createHmac("sha256", "WebAppData").update(token).digest();
      const expectedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
      // Hex-Format + Länge prüfen, dann timingSafeEqual
      const hashOk = /^[0-9a-f]{64}$/i.test(hash) &&
        timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(hash, "hex"));
      if (!hashOk) {
        response.writeHead(401, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Ungültige Telegram-Signatur" }));
        return true;
      }
      // auth_date: endlich, positiv, max 24h alt, max 120s in der Zukunft (Clock-Skew/Replay-Schutz)
      const authDate = Number(params.get("auth_date"));
      const nowSec = Date.now() / 1000;
      if (!Number.isFinite(authDate) || authDate <= 0 ||
          nowSec - authDate > 86400 || authDate - nowSec > 120) {
        response.writeHead(401, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Telegram-Session abgelaufen/ungültig" }));
        return true;
      }
      // Parse user + ID auf Number normalisieren
      let tgUser;
      try { tgUser = JSON.parse(params.get("user") || "{}"); } catch { tgUser = {}; }
      const userId = Number(tgUser.id);
      if (!Number.isInteger(userId)) {
        response.writeHead(400, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Ungültige User-ID" }));
        return true;
      }
      // Allowlist/Admin-Liste konsequent auf Number normalisieren
      const toIds = (arr) => (Array.isArray(arr) ? arr.map(Number).filter(Number.isInteger) : []);
      const allowedIds = toIds(tgCfg.allowedUserIds);
      const allowAll = tgCfg.allowAllUsers === true;
      // FAIL-CLOSED: ohne allowAll UND ohne gültige Allowlist → niemand rein (Config-Fehler)
      if (!allowAll && allowedIds.length === 0) {
        console.error("[tg-auth] fail-closed: keine allowedUserIds und allowAllUsers!=true");
        response.writeHead(503, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Zugang nicht konfiguriert" }));
        return true;
      }
      if (!allowAll && !allowedIds.includes(userId)) {
        response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Kein Zugriff" }));
        return true;
      }
      // === Rolle + Module server-seitig bestimmen (autoritativ, gleiche Logik wie Bot) ===
      const ALL_MODULES = ["akademie", "produkt", "ai"];
      const adminList = toIds(tgCfg.adminUserIds).length ? toIds(tgCfg.adminUserIds) : allowedIds;
      const isTgAdmin = adminList.includes(userId);
      const userEntry = (tgCfg.users && (tgCfg.users[String(userId)] || tgCfg.users[userId])) || {};
      const role = isTgAdmin ? "admin" : "mitarbeiter";
      const modules = isTgAdmin
        ? ALL_MODULES.slice()
        : ["akademie", ...(Array.isArray(userEntry.modules) ? userEntry.modules : [])];
      // Create session
      const sessionToken = randomBytes(32).toString("base64url");
      const sessionHashed = hashToken(sessionToken);
      const email = `tg:${userId}@telegram`;
      // Rolle in Session ablegen — verhindert spätere Client-Manipulation
      sessions[sessionHashed] = { email, createdAt: Date.now(), lastSeen: Date.now(), ua: request.headers["user-agent"] || "", tgRole: role, tgModules: modules, tgUserId: userId };
      await saveSessions();
      setSessionCookie(response, sessionToken, request);
      response.writeHead(200, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ ok: true, email, role, modules, userId }));
      return true;
    } catch (err) {
      if (err && err.message === "body too large") {
        response.writeHead(413, { "Content-Type": mimeTypes[".json"] });
        response.end(JSON.stringify({ error: "Payload zu groß" }));
        return true;
      }
      console.error("[tg-auth]", err.message);
      response.writeHead(500, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "Interner Fehler" }));
      return true;
    }
  }

  if (url.pathname === "/api/state" && request.method === "PUT") {
    if (!requireSameOrigin(request)) {
      response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "CSRF: Origin nicht erlaubt" }));
      return true;
    }
    // HARTE ROLLEN-SPERRE: Mitarbeiter dürfen NIE den globalen State schreiben.
    // Sie bekommen ohnehin nur gefilterte Daten — ein PUT würde sonst Admin-Daten löschen.
    const putSess = getSessionFromRequest(request);
    if (putSess && putSess.tgRole === "mitarbeiter") {
      console.warn(`[state-write-block] Mitarbeiter-PUT abgewiesen: tgUserId=${putSess.tgUserId}`);
      response.writeHead(403, { "Content-Type": mimeTypes[".json"] });
      response.end(JSON.stringify({ error: "Schreibzugriff für deine Rolle nicht erlaubt" }));
      return true;
    }
    try {
      const body = await readBody(request);
      const parsed = JSON.parse(body);
      const baseHeader = request.headers["x-base-updated-at"];
      const base = Number(baseHeader || 0);
      // X-Client-Id sanitisieren: nur [A-Za-z0-9_-], max 64 Zeichen — sonst ignorieren.
      // Verhindert Pfad-/Dateinamen-Manipulation im Tmp-Namen.
      const rawClientId = request.headers["x-client-id"];
      const clientId = (typeof rawClientId === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(rawClientId))
        ? rawClientId : null;
      // Audit-Finding R8: gesamten Read-Check-Write in withStateLock → kein paralleler PUT-Race
      const result = await withStateLock(async () => {
        // Optimistic-Concurrency (Audit-Finding #4)
        // Audit-Finding R5: Header-Pflicht wenn State existiert → 428 Precondition Required
        let diskUpdatedAt = 0;
        try {
          const cur = JSON.parse(await readFile(statePath, "utf8"));
          diskUpdatedAt = Number(cur.updatedAt || 0);
        } catch { /* keine Datei = kein Konflikt */ }
        if (!baseHeader && diskUpdatedAt > 0) return { status: 428, body: JSON.stringify({ error: "X-Base-Updated-At erforderlich", serverUpdatedAt: diskUpdatedAt }) };
        if (base > 0 && diskUpdatedAt > base) return { status: 409, body: JSON.stringify({ error: "conflict", serverUpdatedAt: diskUpdatedAt, base }) };
        await mkdir(dataDir, { recursive: true });
        // Audit-Finding R5: Gefährliche Schlüssel bereinigen (__proto__ etc.) vor dem Schreiben
        const sanitized = sanitizeStateJson(parsed);
        // Audit-Finding R4: pro Request eindeutiger Tmp-Name
        const putTmp = `${statePath}.${clientId || process.pid}.${Date.now()}.tmp`;
        await writeFile(putTmp, JSON.stringify(sanitized), "utf8");
        await rename(putTmp, statePath);
        broadcastSse("state-updated", { updatedAt: sanitized.updatedAt || Date.now(), clientId });
        return { status: 204 };
      });
      if (result.status === 204) {
        response.writeHead(204);
        response.end();
      } else {
        response.writeHead(result.status, { "Content-Type": mimeTypes[".json"] });
        response.end(result.body);
      }
    } catch (error) {
      response.writeHead(error.message === "body too large" ? 413 : 400, {
        "Content-Type": "text/plain; charset=utf-8"
      });
      response.end(error.message === "body too large" ? "too large" : "invalid json");
    }
    return true;
  }

  return false;
}

const BACKUP_RETENTION_DAYS = 30;

async function performDailyBackup() {
  try {
    const stateRaw = await readFile(statePath, "utf8").catch(() => null);
    if (!stateRaw) return;
    const today = new Date().toISOString().slice(0, 10);
    await mkdir(backupsDir, { recursive: true });
    const backupPath = join(backupsDir, `${today}.json`);
    await writeFile(backupPath, stateRaw, "utf8");
    // Aufräumen alter Backups
    const { readdir, stat, unlink } = await import("node:fs/promises");
    const files = await readdir(backupsDir);
    const cutoff = Date.now() - BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let removed = 0;
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const filePath = join(backupsDir, f);
      const s = await stat(filePath);
      if (s.mtimeMs < cutoff) {
        await unlink(filePath);
        removed++;
      }
    }
    await audit("backup.daily", { file: backupPath, removedOld: removed });
  } catch (error) {
    console.error("Auto-Backup-Fehler:", error.message);
  }
}

function scheduleDailyBackup() {
  // Direkt einmal beim Start (überschreibt heutiges falls schon da)
  performDailyBackup();
  // Dann alle 6 Stunden checken — schreibt nur 1× pro Tag (Dateiname ist tagesbasiert)
  setInterval(performDailyBackup, 6 * 60 * 60 * 1000);
}

async function start() {
  await loadAuthConfig();
  await loadSessions();
  scheduleDailyBackup();

  createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${bindHost}:${port}`}`);

    if (url.pathname.startsWith("/auth/")) {
      const handled = await handleAuth(request, response, url);
      if (!handled) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
      }
      return;
    }

    // Auth-Check vor allen anderen Routen
    if (requireAuthFor(request, url)) {
      const sess = getSessionFromRequest(request);
      if (!sess) {
        if (url.pathname.startsWith("/api/")) {
          response.writeHead(401, { "Content-Type": mimeTypes[".json"] });
          response.end(JSON.stringify({ error: "nicht authentifiziert" }));
        } else {
          response.writeHead(302, { Location: "/login.html" });
          response.end();
        }
        return;
      }
    }

    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(request, response, url);
      if (!handled) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
      }
      return;
    }

    const relativePath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const safePath = normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(root, safePath);
    const extension = extname(filePath);

    // === Sicherheits-Härtung (Audit-Finding #1) ===
    // 1. Containment: Datei MUSS innerhalb des Projekt-Roots liegen (Path-Traversal-Schutz)
    const resolvedRoot = resolve(root);
    const resolvedFile = resolve(filePath);
    if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(resolvedRoot + sep)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }
    // 2. Deny-Liste: sensible Verzeichnisse + Server-Code niemals ausliefern
    const rel = safePath.replace(/\\/g, "/").toLowerCase();
    const DENY_PREFIXES = ["config/", "data/", ".git/", ".claude/", "node_modules/"];
    // Audit-Finding R4: package.json / .env / lock-files dürfen nicht ausgeliefert werden
    const DENY_FILES = ["server.mjs", "telegram-bot.mjs", ".gitignore", "audit_brief.md", "kimi_swarm_hfk_verkaufslernsystem.md",
      "package.json", "package-lock.json", ".env", ".env.local", ".env.production"];
    if (
      DENY_PREFIXES.some((p) => rel.startsWith(p)) ||
      DENY_FILES.includes(rel) ||
      extension === ".mjs" ||              // Server-Code (server.mjs/telegram-bot.mjs) nie öffentlich
      extension === ".jsonl"               // Log-/Score-Dateien
    ) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    // 3. .md/.txt nur aus expliziten Content-Ordnern (Lese-Views), sonst blocken
    if ((extension === ".md" || extension === ".txt") &&
        !rel.startsWith("lernsystem-2026/") && !rel.startsWith("marktanalyse-2026/")) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    if (!allowedExtensions.has(extension)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    try {
      const rawData = await readFile(filePath);
      const contentType = safePath === "manifest.json" ? "application/manifest+json; charset=utf-8" : mimeTypes[extension];
      const headers = { "Content-Type": contentType };
      if (extension === ".html") {
        headers["X-Content-Type-Options"] = "nosniff";
        headers["Referrer-Policy"] = "same-origin";
        // Audit-Finding R4: CSP + Framing-Schutz
        // frame-ancestors erlaubt Telegram Web/Desktop für Mini App
        headers["Content-Security-Policy"] = [
          "default-src 'self'",
          "script-src 'self' https://telegram.org",
          "style-src 'self' 'unsafe-inline'",   // nötig für inline style="" in Templates
          "img-src 'self' data: blob:",
          "connect-src 'self' https://api.openai.com https://api.deepseek.com",
          "font-src 'self'",
          "frame-ancestors 'self' https://web.telegram.org https://desktop.telegram.org https://k.zjcdn.com",
          "base-uri 'self'",
          "form-action 'self'"
        ].join("; ");
        // X-Frame-Options: SAMEORIGIN statt DENY (Telegram Web braucht iframe-Zugriff)
        headers["X-Frame-Options"] = "SAMEORIGIN";
        // ngrok-Interstitial-Warning unterdrücken (für Telegram WebView)
        headers["ngrok-skip-browser-warning"] = "true";
      }
      // Service Worker darf nie gecached werden
      if (safePath === "sw.js") {
        headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        headers["Service-Worker-Allowed"] = "/";
      }
      // Manifest und Icons dürfen kurz gecached werden
      if (safePath === "manifest.json" || extension === ".svg") {
        headers["Cache-Control"] = "public, max-age=3600";
      }
      // Gzip/Brotli-Kompression für Text-Assets (app.js 741KB → ~150KB)
      const acceptEncoding = request.headers["accept-encoding"] || "";
      const cacheKey = `${filePath}:${acceptEncoding.includes("br") ? "br" : acceptEncoding.includes("gzip") ? "gz" : ""}`;
      let data = rawData;
      if (safePath !== "sw.js") { // SW nie komprimieren (muss exakt sein)
        let cached = compressCache.get(cacheKey);
        if (!cached) {
          const result = await compressResponse(rawData, acceptEncoding, contentType);
          if (result.encoding) {
            cached = result;
            compressCache.set(cacheKey, cached);
          }
        }
        if (cached?.encoding) {
          data = cached.data;
          headers["Content-Encoding"] = cached.encoding;
          headers["Vary"] = "Accept-Encoding";
        }
      }
      headers["Content-Length"] = data.length;
      response.writeHead(200, headers);
      response.end(data);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  }).listen(port, bindHost, () => {
    console.log(`MAGALOKO running on http://${bindHost}:${port}`);
    console.log(`Auth: ${authConfig.requireAuth ? "AKTIV" : "deaktiviert"} · zugelassene Mails: ${authConfig.allowedEmails.length || 0}`);
    if (authConfig.requireAuth && !authConfig.allowedEmails.length) {
      console.warn("⚠ requireAuth=true aber keine allowedEmails — niemand kann sich einloggen!");
    }
    // Opt-in JTL-Index-Warmup (Audit-Finding #6): WARM_INDEXES=1 lädt die großen
    // Indizes im Hintergrund nach dem Start, gestaffelt — damit der erste Lookup
    // nicht 3-4s warten muss. Default aus (schneller Start, RAM nur bei Bedarf).
    if (process.env.WARM_INDEXES === "1") {
      console.log("[warmup] JTL-Indizes werden im Hintergrund geladen …");
      setTimeout(async () => {
        try { await loadArticleIndex(); console.log("[warmup] Artikel-Index bereit"); } catch (e) { console.warn("[warmup] Artikel:", e.message); }
        try { await loadAddressIndex(); console.log("[warmup] Adress-Index bereit"); } catch (e) { console.warn("[warmup] Adressen:", e.message); }
        try { await loadOrderIndex(); console.log("[warmup] Order-Index bereit"); } catch (e) { console.warn("[warmup] Orders:", e.message); }
        try { await loadAbcIndex(); console.log("[warmup] ABC-Index bereit"); } catch (e) { console.warn("[warmup] ABC:", e.message); }
        try { await loadManufacturerMap(); } catch {}
        console.log("[warmup] Alle JTL-Indizes geladen.");
      }, 2000);
    }
  });
}

start().catch((err) => {
  console.error("Server-Start fehlgeschlagen:", err);
  process.exit(1);
});
