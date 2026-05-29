import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { voteProposal, toPublic } from "@/lib/proposals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { id?: string; value?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const id = String(body?.id || "");
  const value = Math.sign(Number(body?.value) || 0); // 1, -1 oder 0 (zurücknehmen)
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const p = await voteProposal(id, sess.email, value);
  if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, proposal: toPublic(p, sess.email) });
}
