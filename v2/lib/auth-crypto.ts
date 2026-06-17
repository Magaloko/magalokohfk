import { createHash, createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { db, SESSION_SECRET } from "./supabase-server";

export const SESSION_DAYS = 1;

export function hashToken(token: string) {
  return createHash("sha256").update(token + SESSION_SECRET).digest("hex");
}
export function webCodeHash(code: string) {
  return createHash("sha256").update(String(code) + SESSION_SECRET).digest("hex");
}
export function verifyAdminPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw || !input) return false;
  const a = createHash("sha256").update(String(input)).digest();
  const b = createHash("sha256").update(pw).digest();
  return timingSafeEqual(a, b);
}

const toIds = (v?: string) => String(v || "").split(",").map((s) => Number(s.trim())).filter(Number.isInteger);
export function tgConfig() {
  let users: Record<string, { role?: string; modules?: string[] }> = {};
  try { users = JSON.parse(process.env.TG_USERS_JSON || "{}"); } catch { /* ignore */ }
  return {
    token: process.env.TELEGRAM_TOKEN || "",
    allowedUserIds: toIds(process.env.ALLOWED_USER_IDS),
    adminUserIds: toIds(process.env.ADMIN_USER_IDS),
    allowAllUsers: process.env.TG_ALLOW_ALL === "true",
    users,
  };
}

// Verifiziert Telegram-initData; gibt {ok, userId} zurück.
export function verifyTg(initData: string): { ok: boolean; userId: number | null } {
  const token = tgConfig().token;
  if (!token || !initData) return { ok: false, userId: null };
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash") || "";
    params.delete("hash");
    const dcs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("\n");
    const secret = createHmac("sha256", "WebAppData").update(token).digest();
    const expected = createHmac("sha256", secret).update(dcs).digest("hex");
    if (!/^[0-9a-f]{64}$/i.test(hash) || !timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hash, "hex"))) return { ok: false, userId: null };
    const authDate = Number(params.get("auth_date"));
    const now = Date.now() / 1000;
    if (!Number.isFinite(authDate) || authDate <= 0 || now - authDate > 86400 || authDate - now > 120) return { ok: false, userId: null };
    const u = JSON.parse(params.get("user") || "{}");
    const userId = Number(u.id);
    return Number.isInteger(userId) ? { ok: true, userId } : { ok: false, userId: null };
  } catch { return { ok: false, userId: null }; }
}

// Erstellt eine Session-Zeile, gibt das (Klartext-)Token zurück (Cookie setzt der Aufrufer).
export async function createSession(opts: { tgUserId: number | null; role: string; modules: string[]; email: string; ua?: string }): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  await db().from("sessions").insert({
    token_hash: hashToken(token), tg_user_id: opts.tgUserId, tg_role: opts.role,
    tg_modules: opts.modules, email: opts.email, created_at: now, last_seen: now, ua: (opts.ua || "web").slice(0, 300),
  });
  return token;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}
