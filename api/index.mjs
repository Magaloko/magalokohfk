// MAGALOKO — Vercel Serverless API (Cockpit/Akademie).
// Ein Catch-all-Handler für /api/* und /auth/* (siehe vercel.json Rewrites).
// Portiert aus server.mjs; Datei-IO → Supabase (lib/db.mjs).
import {
  db, tgConfig, requireAuth, publicUrl, slackWebhook, STATE_ID,
  hashToken, createHmac, timingSafeEqual, randomBytes, parseCookies,
  getSession, isSessionAdmin, setSessionCookie, clearSessionCookie,
  requireSameOrigin, sanitizeStateJson, filterStateForTgRole, readRawBody, audit
} from "../lib/db.mjs";

const JSON_H = { "Content-Type": "application/json; charset=utf-8" };
function send(res, status, obj, extra) {
  res.writeHead(status, { ...JSON_H, ...(extra || {}) });
  res.end(typeof obj === "string" ? obj : JSON.stringify(obj));
}

export default async function handler(req, res) {
  let url;
  try { url = new URL(req.url, "https://x"); } catch { return send(res, 400, { error: "bad url" }); }
  const path = url.pathname;
  const method = (req.method || "GET").toUpperCase();

  try {
    // ---- POST /api/tg-auth (öffentlich) ----
    if (path === "/api/tg-auth" && method === "POST") return await tgAuth(req, res);

    // ---- GET /auth/status (öffentlich) ----
    if (path === "/auth/status" && method === "GET") {
      const sess = await getSession(req);
      return send(res, 200, { requireAuth, authenticated: !!sess, role: sess?.tgRole || null });
    }

    // ---- POST /auth/logout ----
    if (path === "/auth/logout" && method === "POST") {
      if (!requireSameOrigin(req)) return send(res, 403, { error: "CSRF: Origin nicht erlaubt" });
      const token = parseCookies(req.headers.cookie).magaloko_session;
      if (token) await db.from("sessions").delete().eq("token_hash", hashToken(token));
      clearSessionCookie(res);
      return send(res, 200, { ok: true });
    }

    // ---- Ab hier Auth-Pflicht (wenn aktiv) ----
    const sess = await getSession(req);
    if (requireAuth && !sess) return send(res, 401, { error: "nicht authentifiziert" });

    // ---- GET /api/state ----
    if (path === "/api/state" && method === "GET") {
      const { data, error } = await db.from("app_state").select("data, updated_at").eq("id", STATE_ID).maybeSingle();
      if (error) return send(res, 500, "read failed");
      const full = data?.data || {};
      if (sess && sess.tgRole === "mitarbeiter") {
        const filtered = filterStateForTgRole(full, sess.tgModules?.length ? sess.tgModules : ["akademie"]);
        return send(res, 200, filtered, { "X-MAGALOKO-Role": "mitarbeiter" });
      }
      return send(res, 200, full);
    }

    // ---- PUT /api/state (Optimistic Concurrency) ----
    if (path === "/api/state" && method === "PUT") {
      if (!requireSameOrigin(req)) return send(res, 403, { error: "CSRF: Origin nicht erlaubt" });
      if (sess && sess.tgRole === "mitarbeiter") return send(res, 403, { error: "Schreibzugriff für deine Rolle nicht erlaubt" });
      let parsed;
      try { parsed = JSON.parse(await readRawBody(req)); }
      catch (e) { return send(res, e.message === "body too large" ? 413 : 400, "invalid json"); }
      const base = Number(req.headers["x-base-updated-at"] || 0);
      const cur = await db.from("app_state").select("updated_at").eq("id", STATE_ID).maybeSingle();
      const diskUpdatedAt = Number(cur.data?.updated_at || 0);
      if (!req.headers["x-base-updated-at"] && diskUpdatedAt > 0)
        return send(res, 428, { error: "X-Base-Updated-At erforderlich", serverUpdatedAt: diskUpdatedAt });
      if (base > 0 && diskUpdatedAt > base)
        return send(res, 409, { error: "conflict", serverUpdatedAt: diskUpdatedAt, base });
      const sanitized = sanitizeStateJson(parsed);
      const newUpdatedAt = Number(sanitized.updatedAt) || Date.now();
      // Bedingtes Update: nur wenn updated_at noch dem gelesenen Stand entspricht (Race-Schutz)
      const upd = await db.from("app_state")
        .update({ data: sanitized, updated_at: newUpdatedAt })
        .eq("id", STATE_ID).eq("updated_at", diskUpdatedAt).select("updated_at");
      if (upd.error) return send(res, 500, "write failed");
      if (!upd.data || upd.data.length === 0) {
        const re = await db.from("app_state").select("updated_at").eq("id", STATE_ID).maybeSingle();
        return send(res, 409, { error: "conflict", serverUpdatedAt: Number(re.data?.updated_at || 0), base });
      }
      res.writeHead(204); res.end(); return;
    }

    // ---- GET /api/bot/scores ----
    if (path === "/api/bot/scores" && method === "GET") {
      const { data, error } = await db.from("bot_scores")
        .select("uid, name, correct, ts, marke").order("ts", { ascending: false }).limit(5000);
      if (error) return send(res, 500, "Fehler beim Laden der Bot-Scores");
      const byUser = new Map();
      for (const s of (data || [])) {
        const key = s.name || ("User" + s.uid);
        if (!byUser.has(key)) byUser.set(key, { name: key, uid: s.uid, total: 0, correct: 0, lastTs: "", byMarke: {} });
        const u = byUser.get(key);
        u.total++; if (s.correct) u.correct++;
        const ts = s.ts || "";
        if (ts > u.lastTs) u.lastTs = ts;
        const m = s.marke || "allgemein";
        u.byMarke[m] = u.byMarke[m] || { total: 0, correct: 0 };
        u.byMarke[m].total++; if (s.correct) u.byMarke[m].correct++;
      }
      const users = [...byUser.values()].map((u) => ({ ...u, pct: u.total ? Math.round((u.correct / u.total) * 100) : 0 }))
        .sort((a, b) => b.total - a.total);
      return send(res, 200, { users, totalDrills: (data || []).length, totalUsers: users.length });
    }

    // ---- GET /api/integrations/status ----
    if (path === "/api/integrations/status" && method === "GET")
      return send(res, 200, { mail: false, slack: !!slackWebhook, calendar: false });
    if (path === "/api/mail/status" && method === "GET")
      return send(res, 200, { configured: false });

    // ---- POST /api/slack/send ----
    if (path === "/api/slack/send" && method === "POST") {
      if (!requireSameOrigin(req)) return send(res, 403, { error: "CSRF: Origin nicht erlaubt" });
      if (!slackWebhook) return send(res, 400, { error: "Slack-Webhook nicht konfiguriert" });
      const { text } = JSON.parse(await readRawBody(req) || "{}");
      const r = await fetch(slackWebhook, { method: "POST", headers: JSON_H, body: JSON.stringify({ text }) });
      if (!r.ok) return send(res, 500, { error: "Slack-Nachricht fehlgeschlagen" });
      await audit("slack.sent", {});
      return send(res, 200, { ok: true });
    }

    // ---- POST /api/capture (State-Mutation) ----
    if (path === "/api/capture" && method === "POST") {
      if (!requireSameOrigin(req)) return send(res, 403, { error: "CSRF: Origin nicht erlaubt" });
      const body = JSON.parse(await readRawBody(req) || "{}");
      if (!body.text) return send(res, 400, { error: "text ist Pflicht" });
      const cur = await db.from("app_state").select("data, updated_at").eq("id", STATE_ID).maybeSingle();
      const state = cur.data?.data || {};
      if (!Array.isArray(state.captureInbox)) state.captureInbox = [];
      const e = {
        id: "cap-" + Date.now() + "-" + Math.round(Math.random() * 1000),
        source: body.source || "manual", subject: body.subject || "",
        text: String(body.text).slice(0, 10000), sender: body.sender || "",
        sentAt: body.sentAt || new Date().toISOString(), receivedAt: new Date().toISOString(),
        processed: false, parsedKind: null, parsedRefId: null
      };
      state.captureInbox.unshift(e);
      state.captureInbox = state.captureInbox.slice(0, 500);
      state.updatedAt = Date.now();
      await db.from("app_state").update({ data: sanitizeStateJson(state), updated_at: state.updatedAt })
        .eq("id", STATE_ID);
      await audit("capture.received", { source: body.source });
      return send(res, 200, { ok: true, entryId: e.id });
    }

    // ---- GET /api/audit/log ----
    if (path === "/api/audit/log" && method === "GET") {
      const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit")) || 500, 5000));
      const { data } = await db.from("audit_log").select("ts, event, detail").order("ts", { ascending: false }).limit(limit);
      const events = (data || []).map((r) => ({ ts: r.ts, event: r.event, ...(r.detail || {}) }));
      return send(res, 200, { total: events.length, events });
    }

    // ---- Sekundär-Features: in v1 noch nicht migriert (bewusst 501) ----
    if (path === "/api/stephan-link" && method === "GET")
      return send(res, 501, { error: "Stephan-Link in der Vercel-Migration noch nicht aktiv" });
    if (path === "/api/mail/send" && method === "POST")
      return send(res, 501, { error: "Mail-Versand in der Vercel-Migration noch nicht aktiv" });
    if (path === "/api/calendar.ics" && method === "GET")
      return send(res, 501, "Kalender in der Vercel-Migration noch nicht aktiv");

    return send(res, 404, { error: "not found", path });
  } catch (err) {
    console.error("[api]", path, err?.message);
    return send(res, 500, { error: "Interner Fehler" });
  }
}

// === POST /api/tg-auth — HMAC-Verifikation (portiert aus server.mjs) ===
async function tgAuth(req, res) {
  let body;
  try { body = JSON.parse(await readRawBody(req, 64 * 1024)); }
  catch (e) { return send(res, e.message === "body too large" ? 413 : 400, { error: "Payload" }); }
  const initData = body?.initData;
  if (!initData || typeof initData !== "string") return send(res, 400, { error: "initData fehlt" });

  const tgCfg = tgConfig();
  if (!tgCfg.token) return send(res, 500, { error: "Bot nicht konfiguriert" });

  const params = new URLSearchParams(initData);
  const hash = params.get("hash") || "";
  params.delete("hash");
  const dataCheckString = [...params.entries()].sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`).join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(tgCfg.token).digest();
  const expectedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  const hashOk = /^[0-9a-f]{64}$/i.test(hash) &&
    timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(hash, "hex"));
  if (!hashOk) return send(res, 401, { error: "Ungültige Telegram-Signatur" });

  const authDate = Number(params.get("auth_date"));
  const nowSec = Date.now() / 1000;
  if (!Number.isFinite(authDate) || authDate <= 0 || nowSec - authDate > 86400 || authDate - nowSec > 120)
    return send(res, 401, { error: "Telegram-Session abgelaufen/ungültig" });

  let tgUser; try { tgUser = JSON.parse(params.get("user") || "{}"); } catch { tgUser = {}; }
  const userId = Number(tgUser.id);
  if (!Number.isInteger(userId)) return send(res, 400, { error: "Ungültige User-ID" });

  const allowedIds = tgCfg.allowedUserIds;
  const allowAll = tgCfg.allowAllUsers === true;
  if (!allowAll && allowedIds.length === 0) return send(res, 503, { error: "Zugang nicht konfiguriert" });
  if (!allowAll && !allowedIds.includes(userId)) return send(res, 403, { error: "Kein Zugriff" });

  const ALL_MODULES = ["akademie", "produkt", "ai"];
  const adminList = tgCfg.adminUserIds.length ? tgCfg.adminUserIds : allowedIds;
  const isTgAdmin = adminList.includes(userId);
  const role = isTgAdmin ? "admin" : "mitarbeiter";
  // Policy: NUR Admin sieht alles. Alle anderen ausschließlich Akademie (keine produkt-/ai-Module).
  const modules = isTgAdmin ? ALL_MODULES.slice() : ["akademie"];

  const sessionToken = randomBytes(32).toString("base64url");
  const sessionHashed = hashToken(sessionToken);
  const email = `tg:${userId}@telegram`;
  const now = Date.now();
  const { error } = await db.from("sessions").insert({
    token_hash: sessionHashed, tg_user_id: userId, tg_role: role, tg_modules: modules,
    email, created_at: now, last_seen: now, ua: (req.headers["user-agent"] || "").slice(0, 300)
  });
  if (error) { console.error("[tg-auth] session insert", error.message); return send(res, 500, { error: "Interner Fehler" }); }
  setSessionCookie(res, sessionToken);
  return send(res, 200, { ok: true, email, role, modules, userId });
}
