import { cookies, headers } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { db, SESSION_SECRET } from "./supabase-server";

export type Session = {
  tgRole: "admin" | "mitarbeiter" | string;
  tgModules: string[];
  tgUserId: number | null;
  email: string;
};

const SESSION_MS = 24 * 60 * 60 * 1000; // 24h (wie Live)

function hashToken(token: string) {
  return createHash("sha256").update(token + SESSION_SECRET).digest("hex");
}

// HMAC-Verifikation der Telegram-initData (für 'tg:'-Sessions). Web-Sessions sind exempt.
function verifyTgInitData(initData: string | null, expectedUserId: number | null): boolean {
  if (!initData) return false;
  const token = process.env.TELEGRAM_TOKEN || "";
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
    const now = Date.now() / 1000;
    if (!Number.isFinite(authDate) || authDate <= 0 || now - authDate > 86400 || authDate - now > 120) return false;
    const u = JSON.parse(params.get("user") || "{}");
    return Number(u.id) === Number(expectedUserId);
  } catch { return false; }
}

// Liest die Session aus dem Cookie (Server-Component-/Route-tauglich).
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("magaloko_session")?.value;
  if (!token) return null;
  const { data, error } = await db().from("sessions").select("*").eq("token_hash", hashToken(token)).maybeSingle();
  if (error || !data) return null;
  if (Number(data.last_seen) + SESSION_MS < Date.now()) {
    db().from("sessions").delete().eq("token_hash", hashToken(token)).then(() => {}, () => {});
    return null;
  }
  // Telegram-Sessions ('tg:') sind an frische initData gebunden; Web-Sessions ('web:') nicht.
  if (data.tg_user_id != null && String(data.email || "").startsWith("tg:")) {
    const init = (await headers()).get("x-tg-init");
    if (!verifyTgInitData(init, data.tg_user_id)) return null;
  }
  db().from("sessions").update({ last_seen: Date.now() }).eq("token_hash", hashToken(token)).then(() => {}, () => {});
  return {
    tgRole: data.tg_role,
    tgModules: Array.isArray(data.tg_modules) ? data.tg_modules : [],
    tgUserId: data.tg_user_id,
    email: data.email,
  };
}
