import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth-helpers";
import { callAiChat, styleProfileSystem } from "@/lib/ai";
import { getStyleExamples, storeStyleProfile, countOutgoing } from "@/lib/stephan-style";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Baut das persistente Stil-Profil aus den gesendeten Antworten neu und speichert es (Phase 2b).
export async function POST() {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!rateLimit(`ai:${sess.email}`, 30, 60000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const examples = await getStyleExamples(20);
  if (!examples.length) return NextResponse.json({ error: "empty" }, { status: 400 });

  try {
    const corpus = examples.map((e, i) => `[${i + 1}] ${e}`).join("\n\n");
    const raw = await callAiChat(styleProfileSystem(), [{ role: "user", content: corpus }], 0.3);
    const profile = String(raw || "").trim().slice(0, 1500);
    if (!profile) return NextResponse.json({ error: "ai_unreachable" }, { status: 502 });
    const builtFrom = await countOutgoing();
    const ok = await storeStyleProfile(profile, builtFrom, sess.email);
    if (!ok) return NextResponse.json({ error: "save_failed" }, { status: 500 });
    return NextResponse.json({ ok: true, profile, built_from: builtFrom });
  } catch (e) {
    const msg = (e as Error)?.message || "ai_error";
    if (msg === "NO_KEY") return NextResponse.json({ error: "no_key" }, { status: 503 });
    return NextResponse.json({ error: "ai_unreachable" }, { status: 502 });
  }
}
