import { db, STATE_ID } from "./supabase-server";

// === Typen (locker, da Quelle ein jsonb-Blob ist) ===
export type Drill = { id?: string; marke?: string; frage?: string; schwierigkeit?: string; verkaufstechnik?: string; lerntyp?: string[]; musterantwort?: string; optionen?: { text?: string; ist_richtig?: boolean; punkte?: number; feedback?: string }[] };
export type Marke = { id?: string; name?: string; philosophie?: string; herkunft?: { land?: string; stadt?: string; gruendung?: string | number }; kategorien?: (string | { name?: string })[]; hero_produkte?: (string | { name?: string })[]; verkaufsargumente?: (string | { argument?: string; text?: string })[]; usps?: string[] };
export type Einwand = { id?: string; einwand?: string; kategorie?: string; antwort?: string; beweis?: string };
export type Persona = { id?: string; name?: string; avatar?: string; alter?: string; kontext?: string; zitat?: string; schmerzpunkte?: unknown; werte?: unknown; einwaendeTypisch?: string; budget?: unknown };
export type Szenario = { id?: string; name?: string; situation?: string; personaId?: string; schwierigkeit?: string; steps?: { prompt?: string; options?: { text?: string; feedback?: string }[]; correctIdx?: number }[] };
export type Rollenspiel = { id?: string; titel?: string; persona?: string; setting?: string; verkaufstechnik?: string; produkt?: string; marke?: string; ziel_aov?: number; gesamtpunkte_max?: number; ablauf?: { schritt?: number; name?: string; beschreibung?: string }[]; einwaende?: { einwand?: string; psychologie?: string; erwartete_technik?: string }[]; bewertungskriterien?: { kriterium?: string; punkte_max?: number; beschreibung?: string }[]; erfolgskriterien?: string[] };
export type Angebot = { id?: string; name?: string; dauer?: string; preis?: string; zielgruppe?: string; inhalt?: string; ergebnis?: string };

export type AkademieData = {
  drills: Drill[]; marken: Marke[]; einwaende: Einwand[]; personas: Persona[];
  szenarien: Szenario[]; rollenspiele: Rollenspiel[]; angebote: Angebot[];
};

let _cache: { data: AkademieData; ts: number } | null = null;

// Liest die Akademie-Inhalte aus app_state (workspaces.hfk.data bevorzugt). Kurz-Cache 8s.
export async function getAkademieData(): Promise<AkademieData> {
  if (_cache && Date.now() - _cache.ts < 8000) return _cache.data;
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  const ws = ((st.workspaces as any)?.hfk?.data || st) as Record<string, unknown>;
  const arr = <T,>(k: string): T[] => (Array.isArray(ws[k]) ? (ws[k] as T[]) : []);
  const out: AkademieData = {
    drills: arr<Drill>("akademieDrills"),
    marken: arr<Marke>("akademieMarken"),
    einwaende: arr<Einwand>("salesObjections"),
    personas: arr<Persona>("salesPersonas"),
    szenarien: arr<Szenario>("trainingScenarios"),
    rollenspiele: arr<Rollenspiel>("akademieRoleplays"),
    angebote: arr<Angebot>("consultingServices"),
  };
  _cache = { data: out, ts: Date.now() };
  return out;
}
