import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { allowedAreas } from "@/lib/auth-helpers";
import { callAiChat, customerSystem, coachSystem, parseCoach, type ChatMsg } from "@/lib/ai";
import type { Rollenspiel } from "@/lib/akademie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Begrenzt Verlaufslänge/-größe (Schutz vor Missbrauch & Token-Explosion).
function sanitizeMsgs(input: unknown): ChatMsg[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(-40)
    .map((m): ChatMsg | null => {
      const role = (m as { role?: string })?.role;
      const content = String((m as { content?: unknown })?.content ?? "").slice(0, 2000);
      if ((role === "user" || role === "assistant") && content) return { role, content };
      return null;
    })
    .filter((m): m is ChatMsg => m !== null);
}

// Nur die fürs Prompting nötigen Felder übernehmen (Längen kappen).
function sanitizeRp(input: unknown): Rollenspiel {
  const r = (input || {}) as Record<string, unknown>;
  const str = (v: unknown, n: number) => String(v ?? "").slice(0, n);
  return {
    titel: str(r.titel, 200),
    persona: str(r.persona, 600),
    setting: str(r.setting, 1200),
    produkt: str(r.produkt, 400),
    verkaufstechnik: str(r.verkaufstechnik, 200),
    gesamtpunkte_max: Number(r.gesamtpunkte_max) || 0,
    einwaende: Array.isArray(r.einwaende)
      ? (r.einwaende as Record<string, unknown>[]).slice(0, 12).map((e) => ({ einwand: str(e?.einwand, 300) }))
      : [],
    bewertungskriterien: Array.isArray(r.bewertungskriterien)
      ? (r.bewertungskriterien as Record<string, unknown>[]).slice(0, 12).map((k) => ({
          kriterium: str(k?.kriterium, 200),
          punkte_max: Number(k?.punkte_max) || 0,
          beschreibung: str(k?.beschreibung, 400),
        }))
      : [],
  };
}

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!allowedAreas(sess).includes("rollenspiele")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!rateLimit(`ai:${sess.email}`, 40, 60000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: { mode?: string; rp?: unknown; messages?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const mode = body?.mode === "coach" ? "coach" : "chat";
  const rp = sanitizeRp(body?.rp);
  const messages = sanitizeMsgs(body?.messages);

  try {
    if (mode === "chat") {
      const reply = await callAiChat(customerSystem(rp), messages, 0.85);
      return NextResponse.json({ reply });
    }
    // coach: erwartet messages = [{ role:"user", content: transcript }]
    const raw = await callAiChat(coachSystem(rp), messages, 0.3);
    try {
      return NextResponse.json({ coach: parseCoach(raw, rp) });
    } catch {
      return NextResponse.json({ error: "parse_failed" }, { status: 502 });
    }
  } catch (e) {
    const msg = (e as Error)?.message || "ai_error";
    if (msg === "NO_KEY") return NextResponse.json({ error: "no_key" }, { status: 503 });
    return NextResponse.json({ error: "ai_unreachable" }, { status: 502 });
  }
}
