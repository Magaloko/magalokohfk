import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isSuperAdmin, AKADEMIE_AREAS } from "@/lib/auth-helpers";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/supabase-server";
import { webCodeHash } from "@/lib/auth-crypto";

const genWebCode = () => randomBytes(6).toString("base64url"); // ~8 Zeichen, ~48 bit

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AREA_SET = new Set<string>(AKADEMIE_AREAS as readonly string[]);

async function guard() {
  const sess = await getSession();
  if (!sess) return { err: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  if (!isSuperAdmin(sess)) return { err: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return { sess };
}

export async function GET() {
  const g = await guard(); if (g.err) return g.err;
  const { data } = await db().from("bot_users").select("uid, name, role, modules, web_code_hash").order("added_at", { ascending: true });
  const users = (data || []).map((u) => ({
    uid: Number(u.uid), name: u.name || "", role: u.role || "mitarbeiter",
    modules: Array.isArray(u.modules) ? u.modules : [], hasCode: !!u.web_code_hash,
  }));
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const g = await guard(); if (g.err) return g.err;
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const action = String(b?.action || "");
  const uid = Number(b?.uid);
  if (!Number.isInteger(uid) || uid <= 0) return NextResponse.json({ error: "bad_uid" }, { status: 400 });

  try {
    if (action === "add") {
      await db().from("bot_users").upsert({ uid, name: String(b?.name || "").slice(0, 80), role: "mitarbeiter", modules: [] }, { onConflict: "uid" });
      return NextResponse.json({ ok: true });
    }
    if (action === "setRole") {
      const role = b?.role === "admin" ? "admin" : "mitarbeiter";
      await db().from("bot_users").update({ role }).eq("uid", uid);
      return NextResponse.json({ ok: true });
    }
    if (action === "setAreas") {
      const modules = (Array.isArray(b?.modules) ? b.modules : []).filter((m: unknown) => typeof m === "string" && AREA_SET.has(m)).slice(0, 7);
      await db().from("bot_users").update({ modules }).eq("uid", uid);
      return NextResponse.json({ ok: true });
    }
    if (action === "setName") {
      await db().from("bot_users").update({ name: String(b?.name || "").slice(0, 80) }).eq("uid", uid);
      return NextResponse.json({ ok: true });
    }
    if (action === "webcode") {
      const code = genWebCode();
      await db().from("bot_users").update({ web_code_hash: webCodeHash(code) }).eq("uid", uid);
      return NextResponse.json({ ok: true, code }); // Klartext nur einmal zurückgeben
    }
    if (action === "remove") {
      await db().from("bot_users").delete().eq("uid", uid);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch (e) {
    console.error("[admin/users]", (e as Error)?.message);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
