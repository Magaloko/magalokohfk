import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/supabase-server";
import { genId } from "@/lib/cockpit-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n = 8000) => String(v ?? "").trim().slice(0, n);
const REF_KINDS = new Set(["stephanDecisions", "tasks", "levers"]);

// Loggt eine eingehende und/oder ausgehende Nachricht im Stephan-Verlauf.
// Sind beide gesetzt, wird die ausgehende per reply_to an die eingehende gekoppelt.
// Fremder Text wird ausschliesslich als Daten gespeichert — nie als Instruktion ausgefuehrt.
export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const incoming = clip(b?.incoming);
  const outgoing = clip(b?.outgoing);
  if (!incoming && !outgoing) return NextResponse.json({ error: "empty" }, { status: 400 });

  const ref_kind = REF_KINDS.has(String(b?.ref_kind)) ? String(b.ref_kind) : null;
  const ref_id = ref_kind ? clip(b?.ref_id, 200) || null : null;
  const rawDate = String(b?.occurred_at || "");
  const occurred_at = /^\d{4}-\d{2}-\d{2}/.test(rawDate) ? new Date(rawDate).toISOString() : null;
  const actor = sess.email;

  const rows: Record<string, unknown>[] = [];
  let inId: string | null = null;
  if (incoming) {
    inId = genId("sm");
    rows.push({ id: inId, thread: "stephan", direction: "incoming", body: incoming, ref_kind, ref_id, occurred_at, actor });
  }
  if (outgoing) {
    const ai_draft = clip(b?.ai_draft) || null;
    const source = clip(b?.source, 40) || (ai_draft ? "edited_draft" : "pasted");
    rows.push({ id: genId("sm"), thread: "stephan", direction: "outgoing", body: outgoing, ai_draft, source, reply_to: inId, ref_kind, ref_id, occurred_at, actor });
  }

  const { error } = await db().from("stephan_messages").insert(rows);
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, count: rows.length });
}

// Entfernt einen Verlaufseintrag (z. B. Fehl-Paste). Admin-only.
export async function DELETE(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "empty" }, { status: 400 });
  const { error } = await db().from("stephan_messages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
