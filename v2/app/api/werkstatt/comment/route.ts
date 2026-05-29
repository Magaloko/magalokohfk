import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addComment } from "@/lib/proposals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { id?: string; body?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const id = String(body?.id || "");
  const text = String(body?.body ?? "").trim().slice(0, 2000);
  if (!id || !text) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const p = await addComment(id, sess.email, "Mitarbeiter", text);
  if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, proposal: p });
}
