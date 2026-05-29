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

  // Zugang/Rolle/Bereiche aus Env + bot_users mergen
  const allow = new Set(cfg.allowedUserIds);
  const admins = new Set(cfg.adminUserIds.length ? cfg.adminUserIds : cfg.allowedUserIds);
  let myAreas: string[] = [];
  try {
    const { data: bu } = await db().from("bot_users").select("uid, role, modules");
    for (const r of bu || []) {
      const id = Number(r.uid); if (!Number.isInteger(id)) continue;
      allow.add(id); if (r.role === "admin") admins.add(id);
      if (id === userId && Array.isArray(r.modules)) myAreas = r.modules;
    }
  } catch { /* ignore */ }
  if (!cfg.allowAllUsers && allow.size === 0) return NextResponse.json({ error: "Zugang nicht konfiguriert" }, { status: 503 });
  if (!cfg.allowAllUsers && !allow.has(userId)) return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });

  const isAdmin = admins.has(userId);
  const role = isAdmin ? "admin" : "mitarbeiter";
  const sessionAreas = isAdmin ? ["*"] : normAreas(myAreas);
  const token = await createSession({ tgUserId: userId, role, modules: sessionAreas, email: `tg:${userId}@telegram`, ua: req.headers.get("user-agent") || "tg" });
  const res = NextResponse.json({ ok: true, role, userId });
  res.cookies.set("magaloko_session", token, cookieOptions());
  return res;
}
