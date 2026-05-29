import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { callAiChat, answerReviewSystem, parseReview } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Persönliche Übung: KI bewertet die eigene Antwort des Mitarbeiters auf einen Einwand.
export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!rateLimit(`ai:${sess.email}`, 30, 60000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: { einwand?: string; musterantwort?: string; answer?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const einwand = String(body?.einwand ?? "").trim().slice(0, 600);
  const muster = String(body?.musterantwort ?? "").trim().slice(0, 1200);
  const answer = String(body?.answer ?? "").trim().slice(0, 3000);
  if (!answer) return NextResponse.json({ error: "empty" }, { status: 400 });

  const task = [
    `Eine Verkäuferin/ein Verkäufer übt die Antwort auf den Kundeneinwand: „${einwand || "(allgemein)"}“.`,
    muster ? `Zur Orientierung die hinterlegte Musterantwort (nicht zwingend die einzig richtige): „${muster}“.` : "",
    "Bewerte die unten stehende eigene Antwort: Geht sie auf den Einwand ein? Empathie, Nutzenargument, Abschlussfrage?",
  ].filter(Boolean).join(" ");

  try {
    const raw = await callAiChat(answerReviewSystem(task), [{ role: "user", content: answer }], 0.3);
    return NextResponse.json({ ok: true, review: parseReview(raw) });
  } catch (e) {
    const msg = (e as Error)?.message || "ai_error";
    if (msg === "NO_KEY") return NextResponse.json({ error: "no_key" }, { status: 503 });
    return NextResponse.json({ error: "ai_unreachable" }, { status: 502 });
  }
}
