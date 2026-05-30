import { db, STATE_ID } from "./supabase-server";
import { MAGO_MODULES, type MagoItem } from "./mago-config";

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
