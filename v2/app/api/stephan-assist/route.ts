import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth-helpers";
import { callAiChat, stephanSystem, type ChatMsg } from "@/lib/ai";
import { buildStephanContext } from "@/lib/stephan-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!rateLimit(`ai:${sess.email}`, 30, 60000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: { message?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const message = String(body?.message ?? "").trim().slice(0, 4000);
  if (!message) return NextResponse.json({ error: "empty" }, { status: 400 });

  try {
    const today = new Date().toISOString().slice(0, 10);
    const context = await buildStephanContext();
    const messages: ChatMsg[] = [{
      role: "user",
      content: `Eingehende Nachricht:\n"""\n${message}\n"""\n\nEntwirf eine Antwort – ausschließlich auf Basis der MAGALOKO-Wissensbasis. Was nicht belegt ist, ausdrücklich als fehlend kennzeichnen.`,
    }];
    // Niedrige Temperatur für maximale Zuverlässigkeit/Faktentreue.
    const reply = await callAiChat(stephanSystem(context, today), messages, 0.2);
    return NextResponse.json({ reply });
  } catch (e) {
    const msg = (e as Error)?.message || "ai_error";
    if (msg === "NO_KEY") return NextResponse.json({ error: "no_key" }, { status: 503 });
    return NextResponse.json({ error: "ai_unreachable" }, { status: 502 });
  }
}
