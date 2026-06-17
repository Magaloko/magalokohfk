import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { allowedAreas } from "@/lib/auth-helpers";
import { recordResult, getProgress, levelInfo, type TrainingType } from "@/lib/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPE_AREA: Record<TrainingType, string> = {
  drill: "drills", quiz: "drills", szenario: "szenarien", rollenspiel: "rollenspiele", challenge: "drills",
};
const TYPES: TrainingType[] = ["drill", "quiz", "szenario", "rollenspiel", "challenge"];
const MAX_TOTAL_BY_TYPE: Record<TrainingType, number> = {
  drill: 200,
  quiz: 10,
  szenario: 50,
  rollenspiel: 50,
  challenge: 5,
};

export async function GET() {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const p = await getProgress(sess.email);
  return NextResponse.json({ progress: p, level: p ? levelInfo(p.xp) : null });
}

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { type?: string; score?: unknown; total?: unknown; attemptId?: unknown; itemResults?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const itemResults = Array.isArray(body?.itemResults)
    ? (body.itemResults as any[]).slice(0, 50)
        .map((r) => ({ key: String(r?.key || "").slice(0, 80), correct: !!r?.correct }))
        .filter((r) => r.key)
    : undefined;

  const type = TYPES.includes(body?.type as TrainingType) ? (body!.type as TrainingType) : null;
  if (!type) return NextResponse.json({ error: "bad_type" }, { status: 400 });

  // Bereichs-Gate: nur Trainings aus freigeschalteten Bereichen zählen.
  if (!allowedAreas(sess).includes(TYPE_AREA[type] as any)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const attemptId = String(body?.attemptId || "").replace(/[^a-zA-Z0-9:_-]/g, "").slice(0, 80);
  if (!attemptId) return NextResponse.json({ error: "bad_attempt" }, { status: 400 });
  const rawScore = Math.round(Number(body?.score) || 0);
  const rawTotal = Math.round(Number(body?.total) || 0);
  if (rawTotal > MAX_TOTAL_BY_TYPE[type]) return NextResponse.json({ error: "bad_score" }, { status: 400 });
  const score = Math.max(0, rawScore);
  const total = Math.max(0, rawTotal);
  if (!total || score > total) return NextResponse.json({ error: "bad_score" }, { status: 400 });

  const res = await recordResult(sess.email, "Du", { type, score, total, attemptId, itemResults });
  return NextResponse.json({
    ok: res.ok,
    duplicate: res.duplicate === true,
    xpGain: res.xpGain,
    newBadges: res.newBadges,
    xp: res.progress.xp,
    streak: res.progress.streak,
    level: levelInfo(res.progress.xp),
  });
}
