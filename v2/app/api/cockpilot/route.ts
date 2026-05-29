import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { callAiChat, type ChatMsg } from "@/lib/ai";
import { buildCopilotKB, copilotSystemPrompt } from "@/lib/copilot-kb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function sanitizeMsgs(input: unknown): ChatMsg[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(-16)
    .map((m): ChatMsg | null => {
      const role = (m as { role?: string })?.role;
      const content = String((m as { content?: unknown })?.content ?? "").slice(0, 3000);
      if ((role === "user" || role === "assistant") && content) return { role, content };
      return null;
    })
    .filter((m): m is ChatMsg => m !== null);
}

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { messages?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const messages = sanitizeMsgs(body?.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "empty" }, { status: 400 });

  try {
    const today = new Date().toISOString().slice(0, 10);
    const reply = await callAiChat(copilotSystemPrompt(buildCopilotKB(), today), messages, 0.3);
    return NextResponse.json({ reply });
  } catch (e) {
    const msg = (e as Error)?.message || "ai_error";
    if (msg === "NO_KEY") return NextResponse.json({ error: "no_key" }, { status: 503 });
    return NextResponse.json({ error: "ai_unreachable" }, { status: 502 });
  }
}
