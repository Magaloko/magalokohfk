import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase-server";
import { verifyAdminPassword, webCodeHash, createSession, cookieOptions } from "@/lib/auth-crypto";
import { normAreas } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  // Brute-Force-Schutz: max 10 / 15min / IP
  try {
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await db().from("web_login_attempts").select("id", { count: "exact", head: true }).gte("ts", since).eq("ip", ip);
    if ((count || 0) >= 10) return NextResponse.json({ error: "Zu viele Versuche — bitte in 15 Min erneut." }, { status: 429 });
  } catch { /* ignore */ }

  let password = "";
  try { password = String((await req.json())?.password || ""); } catch { /* ignore */ }
  if (!password) return NextResponse.json({ error: "Passwort/Code fehlt" }, { status: 400 });

  // Admin-Passwort
  if (verifyAdminPassword(password)) {
    const token = await createSession({ tgUserId: null, role: "admin", modules: ["*"], email: "web:admin" });
    const res = NextResponse.json({ ok: true, role: "admin" });
    res.cookies.set("magaloko_session", token, cookieOptions());
    return res;
  }
  // Mitarbeiter-Zugangscode
  const { data: u } = await db().from("bot_users").select("uid, role, modules").eq("web_code_hash", webCodeHash(password)).maybeSingle();
  if (u) {
    const isAdm = u.role === "admin";
    const token = await createSession({
      tgUserId: u.uid, role: isAdm ? "admin" : "mitarbeiter",
      modules: isAdm ? ["*"] : normAreas(u.modules), email: "web:" + u.uid,
    });
    const res = NextResponse.json({ ok: true, role: isAdm ? "admin" : "mitarbeiter" });
    res.cookies.set("magaloko_session", token, cookieOptions());
    return res;
  }
  try { await db().from("web_login_attempts").insert({ ip: ip.slice(0, 64) }); } catch { /* ignore */ }
  return NextResponse.json({ error: "Falsches Passwort / Code" }, { status: 401 });
}
