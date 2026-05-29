import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { allowedAreas } from "@/lib/auth-helpers";
import { recordResult, getProgress, levelInfo, type TrainingType } from "@/lib/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPE_AREA: Record<TrainingType, string> = {
  drill: "drills", quiz: "drills", szenario: "szenarien", rollenspiel: "rollenspiele",
};
const TYPES: TrainingType[] = ["drill", "quiz", "szenario", "rollenspiel"];

export async function GET() {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const p = await getProgress(sess.email);
  return NextResponse.json({ progress: p, level: p ? levelInfo(p.xp) : null });
}

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { type?: string; score?: unknown; total?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const type = TYPES.includes(body?.type as TrainingType) ? (body!.type as TrainingType) : null;
  if (!type) return NextResponse.json({ error: "bad_type" }, { status: 400 });

  // Bereichs-Gate: nur Trainings aus freigeschalteten Bereichen zählen.
  if (!allowedAreas(sess).includes(TYPE_AREA[type] as any)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const score = Math.max(0, Math.min(10000, Math.round(Number(body?.score) || 0)));
  const total = Math.max(0, Math.min(10000, Math.round(Number(body?.total) || 0)));
  if (!total || score > total) return NextResponse.json({ error: "bad_score" }, { status: 400 });

  const res = await recordResult(sess.email, "Du", { type, score, total });
  return NextResponse.json({
    ok: res.ok,
    xpGain: res.xpGain,
    newBadges: res.newBadges,
    xp: res.progress.xp,
    streak: res.progress.streak,
    level: levelInfo(res.progress.xp),
  });
}
