import { db, STATE_ID } from "./supabase-server";
import { MAGO_MODULES, type MagoItem } from "./mago-config";
import type { Lever, WeeklyKpi } from "./cockpit";

// Server-seitiger Reader für Magos privaten Bereich. Liest die Mago-Sammlungen aus
// app_state (Container workspaces.hfk.data, Fallback top-level) — wie lib/cockpit.ts.
// Zugriff wird auf den Seiten/Layout via requireSuperAdmin() erzwungen.

export type MagoData = Record<string, MagoItem[]>; // keyed by module.key

export async function getMagoData(): Promise<MagoData> {
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  const ws = (((st.workspaces as Record<string, any>)?.hfk?.data) || st) as Record<string, unknown>;
  const out: MagoData = {};
  for (const m of MAGO_MODULES) {
    out[m.key] = Array.isArray(ws[m.collection]) ? (ws[m.collection] as MagoItem[]) : [];
  }
  return out;
}

// App-State-Container (workspaces.hfk.data, Fallback top-level) — wie getMagoData.
async function magoWorkspace(): Promise<Record<string, unknown>> {
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  return (((st.workspaces as Record<string, any>)?.hfk?.data) || st) as Record<string, unknown>;
}
export async function getMagoCollection(name: string): Promise<MagoItem[]> {
  const ws = await magoWorkspace();
  return Array.isArray(ws[name]) ? (ws[name] as MagoItem[]) : [];
}
export async function getMagoLevers(): Promise<Lever[]> {
  const ws = await magoWorkspace();
  return Array.isArray(ws["magoHebel"]) ? (ws["magoHebel"] as Lever[]) : [];
}
export async function getMagoKpis(): Promise<WeeklyKpi[]> {
  const ws = await magoWorkspace();
  return Array.isArray(ws["magoKpis"]) ? (ws["magoKpis"] as WeeklyKpi[]) : [];
}
