import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth-helpers";
import { getProposal, decideProposal, toPublic, type ProposalStatus } from "@/lib/proposals";
import { createItem } from "@/lib/cockpit-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-Entscheidung. approved/adapted bei Typ "einwand" -> Übernahme in salesObjections (Status merged).
export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { id?: string; decision?: string; title?: string; content?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const id = String(body?.id || "");
  const decision = body?.decision as ProposalStatus;
  if (!id || !["approved", "adapted", "rejected"].includes(decision)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const p = await getProposal(id);
  if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Bei "adapted" darf der Admin Titel/Inhalt anpassen.
  const title = (body?.title != null ? String(body.title) : p.title).trim().slice(0, 200);
  const content = (body?.content != null ? String(body.content) : p.content).trim().slice(0, 6000);

  let merged = false;
  if ((decision === "approved" || decision === "adapted") && p.type === "einwand" && p.target === "salesObjections" && title) {
    const r = await createItem("salesObjections", { einwand: title, antwort: content }, "obj");
    merged = r.ok;
  }

  const finalStatus: ProposalStatus = merged ? "merged" : decision;
  const updated = await decideProposal(id, finalStatus, sess.email);
  if (!updated) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, proposal: toPublic(updated, sess.email), merged });
}
