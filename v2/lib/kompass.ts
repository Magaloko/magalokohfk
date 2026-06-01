import { db, STATE_ID } from "./supabase-server";
import type { ProduktBasis, KompassEignung, KompassProdukt } from "./kompass-core";

// Server-Reader für den Baby-Kompass. Führt Basiskatalog `produkte` (Tabelle, aus JTL-Import)
// mit dem kuratierten Overlay `kompassEignung` (app_state) zusammen.
// Reine Logik/Typen liegen in lib/kompass-core.ts (client-sicher).
export * from "./kompass-core";

async function eignungContainer(): Promise<KompassEignung[]> {
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  const ws = (((st.workspaces as Record<string, any>)?.hfk?.data) || st) as Record<string, unknown>;
  const arr = Array.isArray(ws["kompassEignung"]) ? (ws["kompassEignung"] as any[]) : [];
  return arr.filter((e) => e && e.jtlArtikelNr).map((e) => ({
    id: String(e.id || ""), jtlArtikelNr: String(e.jtlArtikelNr),
    gewichtKlasse: String(e.gewichtKlasse || ""), faltmass: String(e.faltmass || ""),
    ohneLift: String(e.ohneLift || ""), kofferraum: String(e.kofferraum || ""),
    oeffi: String(e.oeffi || ""), gelaende: String(e.gelaende || ""),
    abGeburt: String(e.abGeburt || ""), jogging: String(e.jogging || ""),
    geschwister: String(e.geschwister || ""), ausschlussHinweis: String(e.ausschlussHinweis || ""),
  }));
}

function mapBasis(p: any): ProduktBasis {
  return {
    jtlArtikelNr: String(p.jtl_artikel_nr), name: String(p.name || ""),
    marke: String(p.marke || ""), kategorie: String(p.kategorie || ""),
    preisEur: p.preis_eur != null ? Number(p.preis_eur) : null,
  };
}

// Empfehlbare Produkte: nur die mit kuratiertem Eignungs-Overlay (kleiner, gepflegter Pool).
export async function getKompassProdukte(): Promise<KompassProdukt[]> {
  const eign = await eignungContainer();
  if (!eign.length) return [];
  const byNr = new Map(eign.map((e) => [e.jtlArtikelNr, e]));
  const { data } = await db().from("produkte").select("jtl_artikel_nr,name,marke,kategorie,preis_eur").in("jtl_artikel_nr", [...byNr.keys()]);
  const out: KompassProdukt[] = [];
  for (const p of data || []) {
    const e = byNr.get(String(p.jtl_artikel_nr));
    if (e) out.push({ ...mapBasis(p), eignung: e });
  }
  return out;
}

// Für die Cockpit-Pflege: aktiver Basiskatalog (gekappt) + bestehende Eignungen.
export async function getProdukteFuerPflege(limit = 600): Promise<{ produkte: ProduktBasis[]; eignung: KompassEignung[] }> {
  const eign = await eignungContainer();
  const { data } = await db().from("produkte").select("jtl_artikel_nr,name,marke,kategorie,preis_eur").eq("aktiv", true).order("name").limit(limit);
  return { produkte: (data || []).map(mapBasis), eignung: eign };
}
