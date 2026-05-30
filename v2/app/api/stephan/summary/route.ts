import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth-helpers";
import { callAiChat, summarySystem } from "@/lib/ai";
import { getStephanThread } from "@/lib/stephan-thread";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Fasst den Stephan-Verlauf eines Threads zusammen (Transkript server-seitig gelesen, nie vom Client geschickt).
export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!rateLimit(`ai:${sess.email}`, 30, 60000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let threadName = "stephan";
  try { const b = await req.json(); if (typeof b?.thread === "string" && b.thread.trim()) threadName = b.thread.trim().slice(0, 60); } catch { /* default */ }

  const messages = await getStephanThread(threadName);
  if (!messages.length) return NextResponse.json({ error: "empty" }, { status: 400 });

  const transcript = messages
    .map((m) => `${m.direction === "incoming" ? "Stephan" : "Ich"}: ${m.body}`)
    .join("\n\n")
    .slice(0, 9000);

  try {
    const summary = await callAiChat(summarySystem(), [{ role: "user", content: `Gesprächsverlauf:\n"""\n${transcript}\n"""\n\nFasse zusammen.` }], 0.3);
    return NextResponse.json({ summary });
  } catch (e) {
    const msg = (e as Error)?.message || "ai_error";
    if (msg === "NO_KEY") return NextResponse.json({ error: "no_key" }, { status: 503 });
    return NextResponse.json({ error: "ai_unreachable" }, { status: 502 });
  }
}
