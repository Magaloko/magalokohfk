import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { callAiChat, answerReviewSystem, parseReview, aiConfigured } from "@/lib/ai";
import { createProposal, TYPE_LABEL, type ProposalType } from "@/lib/proposals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TYPES: ProposalType[] = ["einwand", "argumentation", "idee", "loesung", "korrektur"];

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { type?: string; title?: string; content?: string; target?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const type = (TYPES.includes(body?.type as ProposalType) ? body!.type : "idee") as ProposalType;
  const title = String(body?.title ?? "").trim().slice(0, 200);
  const content = String(body?.content ?? "").trim().slice(0, 6000);
  if (!title) return NextResponse.json({ error: "empty" }, { status: 400 });
  const target = type === "einwand" ? "salesObjections" : null;

  // KI-Pre-Check (best effort — Vorschlag wird auch ohne KI angelegt).
  let ai_review = {};
  if (aiConfigured()) {
    try {
      const task = `Bewerte diesen Mitarbeiter-Beitrag vom Typ „${TYPE_LABEL[type]}“. Titel: „${title}“.`;
      const raw = await callAiChat(answerReviewSystem(task), [{ role: "user", content }], 0.3);
      ai_review = parseReview(raw);
    } catch { /* KI optional */ }
  }

  const p = await createProposal({ author_key: sess.email, author_name: "Mitarbeiter", type, title, content, target, ai_review });
  if (!p) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, proposal: p });
}
