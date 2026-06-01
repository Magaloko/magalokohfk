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

export type MasterMindVorgang = { id: string; titel: string; werkzeug: string; status: string; wartetAuf: string; naechsterSchritt: string; notiz: string; datum: string };
export type MasterMindToolStatus = { id: string; werkzeug: string; status: string; notiz: string };

// Container wie getMastermindAntworten (workspaces.hfk.data, Fallback top-level).
async function mmContainer(): Promise<Record<string, unknown>> {
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  return (((st.workspaces as Record<string, any>)?.hfk?.data) || st) as Record<string, unknown>;
}

export async function getMastermindVorgaenge(): Promise<MasterMindVorgang[]> {
  const ws = await mmContainer();
  const arr = Array.isArray(ws["mastermindVorgaenge"]) ? (ws["mastermindVorgaenge"] as any[]) : [];
  return arr.filter((v) => v && v.id).map((v) => ({
    id: String(v.id), titel: String(v.titel || ""), werkzeug: String(v.werkzeug || ""),
    status: String(v.status || "Offen"), wartetAuf: String(v.wartetAuf || ""),
    naechsterSchritt: String(v.naechsterSchritt || ""), notiz: String(v.notiz || ""), datum: String(v.datum || ""),
  }));
}

export async function getMastermindToolStatus(): Promise<Record<string, MasterMindToolStatus>> {
  const ws = await mmContainer();
  const arr = Array.isArray(ws["mastermindToolStatus"]) ? (ws["mastermindToolStatus"] as any[]) : [];
  const out: Record<string, MasterMindToolStatus> = {};
  for (const t of arr) {
    if (!t || !t.werkzeug) continue;
    out[String(t.werkzeug)] = { id: String(t.id || ""), werkzeug: String(t.werkzeug), status: String(t.status || "Plan"), notiz: String(t.notiz || "") };
  }
  return out;
}
