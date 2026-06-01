import { db, STATE_ID } from "./supabase-server";

// Server-Reader für die erfassten Antworten auf den MasterMind-Fragenkatalog.
// Liest app_state (Container workspaces.hfk.data, Fallback top-level) — wie lib/mago.ts.
export type MasterMindAntwort = { id: string; frageId: string; status: string; antwort: string; notiz?: string };

// Indexiert nach frageId (letzter gewinnt — defensiv gegen seltene Doppel-Records).
export async function getMastermindAntworten(): Promise<Record<string, MasterMindAntwort>> {
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  const ws = (((st.workspaces as Record<string, any>)?.hfk?.data) || st) as Record<string, unknown>;
  const arr = Array.isArray(ws["mastermindAntworten"]) ? (ws["mastermindAntworten"] as any[]) : [];
  const out: Record<string, MasterMindAntwort> = {};
  for (const a of arr) {
    if (!a || !a.frageId) continue;
    out[String(a.frageId)] = {
      id: String(a.id || ""), frageId: String(a.frageId),
      status: String(a.status || "offen"), antwort: String(a.antwort || ""),
      notiz: a.notiz != null ? String(a.notiz) : undefined,
    };
  }
  return out;
}
