import { db } from "./supabase-server";

// Liefert die letzten echten Antworten des Nutzers als Stil-Vorbild (Few-Shot fuer den
// Stephan-Assistenten). Quelle: outgoing-Nachrichten im Stephan-Verlauf (stephan_messages).
// Dedupliziert grob und kappt die Laenge je Beispiel. Fail-soft -> [] (z. B. Tabelle fehlt).
export async function getStyleExamples(limit = 6): Promise<string[]> {
  try {
    const { data, error } = await db()
      .from("stephan_messages")
      .select("body, created_at")
      .eq("thread", "stephan")
      .eq("direction", "outgoing")
      .order("created_at", { ascending: false })
      .limit(limit * 2);
    if (error || !Array.isArray(data)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const r of data) {
      const t = String((r as { body?: unknown }).body ?? "").trim().slice(0, 700);
      if (!t) continue;
      const key = t.slice(0, 80).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}
