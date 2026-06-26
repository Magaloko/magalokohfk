import { cookies } from "next/headers";
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

function devSecret() {
  return SESSION_SECRET && SESSION_SECRET.length >= 16 ? SESSION_SECRET : "magaloko-local-dev-session-secret";
}

function readDevSession(token: string): Session | null {
  if (process.env.NODE_ENV === "production" || !token.startsWith("dev.")) return null;
  const [, payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", devSecret()).update(payload).digest("base64url");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { user?: string; role?: string; modules?: string[]; email?: string; iat?: number };
    if (!data.iat || Date.now() - Number(data.iat) > SESSION_MS) return null;
    if (data.user !== "mago" && data.user !== "codex") return null;
    return { tgRole: data.role || "admin", tgModules: Array.isArray(data.modules) ? data.modules : ["*"], tgUserId: null, email: data.email || `local:${data.user}` };
  } catch {
    return null;
  }
}

// Liest die Session aus dem Cookie (Server-Component-/Route-tauglich).
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("magaloko_session")?.value;
  if (!token) return null;
  const dev = readDevSession(token);
  if (dev) return dev;
  // Fail-closed: ohne starkes SESSION_SECRET keine produktiven DB-Sessions (sonst unsichere Hashes).
  if (!SESSION_SECRET || SESSION_SECRET.length < 16) { console.error("[session] SESSION_SECRET fehlt/zu kurz — Zugriff verweigert"); return null; }
  const { data, error } = await db().from("sessions").select("*").eq("token_hash", hashToken(token)).maybeSingle();
  if (error) {
    console.error("[session] Session-Lookup fehlgeschlagen", error.code || error.message);
    return null;
  }
  if (!data) {
    console.warn("[session] Cookie vorhanden, aber keine Session-Zeile gefunden");
    return null;
  }
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
