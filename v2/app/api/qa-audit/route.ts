import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth-helpers";
import { callAiChat } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SYSTEM = [
  "Du prüfst Lern-Inhalte eines österreichischen Babyfachhandels (HFK).",
  "Aufgabe: Ist der folgende Text durchgehend auf Deutsch und sprachlich sauber (Rechtschreibung, klarer Stil)?",
  "Antworte AUSSCHLIESSLICH als JSON ohne Markdown:",
  '{"german": true oder false, "issues": "kurz, was nicht passt (leer wenn alles ok)", "fixed": "korrigierte, einwandfrei deutsche Fassung — leer lassen, wenn der Text bereits einwandfrei deutsch ist"}',
  "Inhalte (Produktwissen, Preise, Markennamen) NICHT verändern, nur Sprache/Grammatik. Markennamen bleiben unverändert.",
].join("\n");

function parse(raw: string): { german: boolean; issues: string; fixed: string } {
  let t = String(raw || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  try {
    const p = JSON.parse(t);
    return { german: p.german !== false, issues: String(p.issues || ""), fixed: String(p.fixed || "") };
  } catch {
    return { german: true, issues: "", fixed: "" };
  }
}

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { text?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const text = String(body?.text ?? "").trim().slice(0, 4000);
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });

  try {
    const raw = await callAiChat(SYSTEM, [{ role: "user", content: text }], 0.2);
    return NextResponse.json({ ok: true, result: parse(raw) });
  } catch (e) {
    const msg = (e as Error)?.message || "ai_error";
    if (msg === "NO_KEY") return NextResponse.json({ error: "no_key" }, { status: 503 });
    return NextResponse.json({ error: "ai_unreachable" }, { status: 502 });
  }
}
