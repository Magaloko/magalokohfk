import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { recordPathStep } from "@/lib/progress";
import { getPath } from "@/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { pathId?: string; step?: unknown; done?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const path = getPath(String(body?.pathId || ""));
  if (!path) return NextResponse.json({ error: "bad_path" }, { status: 400 });
  const step = Math.round(Number(body?.step));
  if (!Number.isInteger(step) || step < 0 || step >= path.steps.length) return NextResponse.json({ error: "bad_step" }, { status: 400 });

  const res = await recordPathStep(sess.email, "Du", path.id, path.steps.length, step, !!body?.done);
  if (!res.ok) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, steps: res.steps, justCompleted: res.justCompleted, xpGain: res.xpGain });
}
