import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { recordPathStep } from "@/lib/progress";
import { getGuide } from "@/lib/copilot-kb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Check-in für einen Guide-Schritt. Speichert über das vorhandene Pfad-System (pathId "copilot:<guideId>").
export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { guideId?: string; step?: unknown; done?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const guide = getGuide(String(body?.guideId || ""));
  if (!guide) return NextResponse.json({ error: "bad_guide" }, { status: 400 });
  const step = Math.round(Number(body?.step));
  if (!Number.isInteger(step) || step < 0 || step >= guide.steps.length) return NextResponse.json({ error: "bad_step" }, { status: 400 });

  const res = await recordPathStep(sess.email, "Du", `copilot:${guide.id}`, guide.steps.length, step, !!body?.done);
  if (!res.ok) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, steps: res.steps, justCompleted: res.justCompleted, xpGain: res.xpGain });
}
