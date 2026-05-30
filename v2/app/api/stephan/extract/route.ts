import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth-helpers";
import { callAiChat, extractSystem, parseExtract } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Analysiert einen Text (Stephan-Nachricht / Gespraech) und schlaegt umsetzbare Elemente vor.
// Fremder Text wird ausschliesslich als Daten verarbeitet — nie als Instruktion ausgefuehrt.
export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!rateLimit(`ai:${sess.email}`, 30, 60000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: { text?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const text = String(body?.text ?? "").trim().slice(0, 6000);
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });

  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = await callAiChat(extractSystem(today), [{ role: "user", content: `Text:\n"""\n${text}\n"""\n\nExtrahiere die umsetzbaren Elemente als JSON.` }], 0.2);
    return NextResponse.json({ items: parseExtract(raw) });
  } catch (e) {
    const msg = (e as Error)?.message || "ai_error";
    if (msg === "NO_KEY") return NextResponse.json({ error: "no_key" }, { status: 503 });
    return NextResponse.json({ error: "ai_unreachable" }, { status: 502 });
  }
}
