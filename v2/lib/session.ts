import { cookies } from "next/headers";
import { createHash } from "node:crypto";
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
  // Hinweis: Die frühere per-Request-Bindung an X-Tg-Init ist mit Next.js-SSR-Navigation
  // (Server-Components senden keine eigenen Header) inkompatibel und würde eine Login-Schleife
  // erzeugen. Stattdessen: Cookie-basierte Session (httpOnly/secure/24h, an tgUserId in der Zeile
  // gebunden) + client-seitiger Account-Wechsel-Schutz (TgReauth) re-bindet bei Konto-Wechsel.
  db().from("sessions").update({ last_seen: Date.now() }).eq("token_hash", hashToken(token)).then(() => {}, () => {});
  return {
    tgRole: data.tg_role,
    tgModules: Array.isArray(data.tg_modules) ? data.tg_modules : [],
    tgUserId: data.tg_user_id,
    email: data.email,
  };
}
