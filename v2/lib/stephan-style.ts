import { db } from "./supabase-server";

// Liefert die letzten echten Antworten des Nutzers als Stil-Vorbild (Few-Shot). Quelle: ALLE
// outgoing-Nachrichten (thread-uebergreifend — die Stimme des Nutzers ist global). Dedupliziert,
// laengenbegrenzt. Fail-soft -> [].
export async function getStyleExamples(limit = 6): Promise<string[]> {
  try {
    const { data, error } = await db()
      .from("stephan_messages")
      .select("body, created_at")
      .eq("direction", "outgoing")
      .order("created_at", { ascending: false })
      .limit(Math.max(limit * 2, 20));
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

export type StyleProfile = { profile: string; built_from: number; updated_at: string };

// Liest das gecachte Stil-Profil. Fail-soft -> null (z. B. Tabelle 0010 noch nicht eingespielt).
export async function getStyleProfile(): Promise<StyleProfile | null> {
  try {
    const { data, error } = await db().from("stephan_style").select("profile, built_from, updated_at").eq("thread", "global").maybeSingle();
    if (error || !data || !String(data.profile || "").trim()) return null;
    return { profile: String(data.profile), built_from: Number(data.built_from || 0), updated_at: String(data.updated_at || "") };
  } catch {
    return null;
  }
}

export async function storeStyleProfile(profile: string, builtFrom: number, actor?: string): Promise<boolean> {
  try {
    const { error } = await db().from("stephan_style").upsert({ thread: "global", profile, built_from: builtFrom, actor: actor || null, updated_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
}

// Anzahl gesendeter Nachrichten (Korpusgroesse) — fuer "X neue seit letztem Profil". Fail-soft -> 0.
export async function countOutgoing(): Promise<number> {
  try {
    const { count, error } = await db().from("stephan_messages").select("id", { count: "exact", head: true }).eq("direction", "outgoing");
    return error ? 0 : Number(count || 0);
  } catch {
    return 0;
  }
}
