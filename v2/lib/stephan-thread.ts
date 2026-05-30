import { db } from "./supabase-server";

export type StephanMessage = {
  id: string;
  thread: string;
  direction: "incoming" | "outgoing";
  body: string;
  ai_draft?: string | null;
  source?: string | null;
  reply_to?: string | null;
  ref_kind?: string | null;
  ref_id?: string | null;
  occurred_at?: string | null;
  actor?: string | null;
  created_at: string;
};

// Liest den Stephan-Verlauf. Fail-soft: ist die Tabelle (Migration 0009) noch nicht
// eingespielt oder ein Fehler tritt auf, kommt ein leeres Array zurueck — die Seite
// bleibt funktionsfaehig (Verlauf einfach leer).
export async function getStephanThread(thread = "stephan"): Promise<StephanMessage[]> {
  try {
    const { data, error } = await db()
      .from("stephan_messages")
      .select("*")
      .eq("thread", thread)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error || !Array.isArray(data)) return [];
    // Chronologisch nach echtem Zeitpunkt (occurred_at) bzw. Erfassungszeit (created_at).
    return (data as StephanMessage[]).sort((a, b) =>
      String(a.occurred_at || a.created_at).localeCompare(String(b.occurred_at || b.created_at)));
  } catch {
    return [];
  }
}

// Alle Nachrichten über alle Threads (für die Beziehungs-Timeline + Thread-Liste). Fail-soft -> [].
export async function getAllStephanMessages(): Promise<StephanMessage[]> {
  try {
    const { data, error } = await db()
      .from("stephan_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(800);
    if (error || !Array.isArray(data)) return [];
    return (data as StephanMessage[]).sort((a, b) =>
      String(a.occurred_at || a.created_at).localeCompare(String(b.occurred_at || b.created_at)));
  } catch {
    return [];
  }
}

// Liefert die an ein konkretes Objekt (z. B. eine stephanDecision) gekoppelten Nachrichten. Fail-soft -> [].
export async function getStephanMessagesForRef(refKind: string, refId: string): Promise<StephanMessage[]> {
  if (!refKind || !refId) return [];
  try {
    const { data, error } = await db()
      .from("stephan_messages")
      .select("*")
      .eq("ref_kind", refKind)
      .eq("ref_id", refId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error || !Array.isArray(data)) return [];
    return (data as StephanMessage[]).sort((a, b) =>
      String(a.occurred_at || a.created_at).localeCompare(String(b.occurred_at || b.created_at)));
  } catch {
    return [];
  }
}
