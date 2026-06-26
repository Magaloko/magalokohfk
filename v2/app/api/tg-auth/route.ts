import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase-server";
import { tgConfig, verifyTg, createSession, cookieOptions } from "@/lib/auth-crypto";
import { normAreas } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let initData = "";
  try { initData = String((await req.json())?.initData || ""); } catch { /* ignore */ }
  if (!initData) return NextResponse.json({ error: "initData fehlt" }, { status: 400 });

  const cfg = tgConfig();
  if (!cfg.token) return NextResponse.json({ error: "Bot nicht konfiguriert" }, { status: 500 });
  const v = verifyTg(initData);
  if (!v.ok || v.userId == null) return NextResponse.json({ error: "Ungültige Telegram-Signatur" }, { status: 401 });
  const userId = v.userId;

  // STRIKTE Allowlist (deny-by-default): Zugang NUR für explizit zugelassene IDs.
  // Erlaubt = ALLOWED_USER_IDS (Env) ∪ ADMIN_USER_IDS (Env) ∪ Einträge in bot_users.
  // Admin = NUR ADMIN_USER_IDS (Env) ∪ bot_users(role='admin'). Kein Allow-All, keine
  // Auto-Admin-Eskalation, egal wie die Env gesetzt ist.
  const envUser = cfg.users[String(userId)] || {};
  const allow = new Set<number>(cfg.allowedUserIds);
  const admins = new Set<number>(cfg.adminUserIds);
  if (envUser.role) allow.add(userId);
  if (envUser.role === "admin") admins.add(userId);
  let myAreas: string[] = Array.isArray(envUser.modules) ? envUser.modules : [];
  try {
    const { data: bu, error } = await db().from("bot_users").select("uid, role, modules").eq("uid", userId).maybeSingle();
    if (error) throw error;
    if (bu) {
      allow.add(userId);
      if (bu.role === "admin") admins.add(userId);
      if (Array.isArray(bu.modules)) myAreas = bu.modules;
    }
  } catch (e) {
    console.error("[tg-auth] Nutzerfreigabe konnte nicht geladen werden", e);
    if (!allow.has(userId) && !admins.has(userId)) return NextResponse.json({ error: "Freigabe derzeit nicht prüfbar" }, { status: 503 });
  }
  admins.forEach((a) => allow.add(a)); // Admins sind implizit zugelassen
  if (!allow.has(userId)) return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });

  const isAdmin = admins.has(userId);
  const role = isAdmin ? "admin" : "mitarbeiter";
  const sessionAreas = isAdmin ? ["*"] : normAreas(myAreas);
  try {
    const token = await createSession({ tgUserId: userId, role, modules: sessionAreas, email: `tg:${userId}@telegram`, ua: req.headers.get("user-agent") || "tg" });
    const res = NextResponse.json({ ok: true, role, userId });
    res.cookies.set("magaloko_session", token, cookieOptions());
    return res;
  } catch (e) {
    console.error("[tg-auth] Session konnte nicht gespeichert werden", e);
    return NextResponse.json({ error: "Telegram-Anmeldung derzeit nicht verfügbar" }, { status: 503 });
  }
}
