// Baby-Kompass — REINE Logik & Definitionen (KEIN Server-/DB-Import!).
// Client-Komponenten dürfen nur hieraus importieren (nicht aus lib/kompass.ts → das zieht
// supabase-server ins Client-Bundle, vgl. CLAUDE.md §4).

// ---- Typen --------------------------------------------------------------

export type ProduktBasis = {
  jtlArtikelNr: string;
  name: string;
  marke: string;
  kategorie: string;
  preisEur: number | null;
};

// Kuratiertes Overlay (alle matching-relevanten Attribute — im JTL-Export NICHT vorhanden).
export type KompassEignung = {
  id: string;
  jtlArtikelNr: string;
  gewichtKlasse: string; // leicht | mittel | schwer
  faltmass: string; // kompakt | mittel | sperrig
  ohneLift: string; // ja | nein  (gut tragbar / treppentauglich)
  kofferraum: string; // klein | mittel | gross (passt gefaltet in …)
  oeffi: string; // ja | nein
  gelaende: string; // stadt | gemischt | gelaende
  abGeburt: string; // ja | nein
  jogging: string; // ja | nein
  geschwister: string; // ja | nein (zwei Kinder / Zwillinge)
  ausschlussHinweis: string;
};

export type KompassProdukt = ProduktBasis & { eignung: KompassEignung };

// ---- Eignungs-Felder (für Cockpit-Pflege + SPEC-Referenz) ---------------

function opt(vals: string[]) { return vals.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })); }
function jaNein() { return [{ value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }]; }

export const EIGNUNG_FELDER: { key: keyof KompassEignung; label: string; optionen?: { value: string; label: string }[] }[] = [
  { key: "gewichtKlasse", label: "Gewicht", optionen: opt(["leicht", "mittel", "schwer"]) },
  { key: "faltmass", label: "Faltmaß", optionen: opt(["kompakt", "mittel", "sperrig"]) },
  { key: "ohneLift", label: "Ohne Lift tragbar", optionen: jaNein() },
  { key: "kofferraum", label: "Passt in Kofferraum", optionen: opt(["klein", "mittel", "gross"]) },
  { key: "oeffi", label: "Öffi-tauglich", optionen: jaNein() },
  { key: "gelaende", label: "Untergrund", optionen: opt(["stadt", "gemischt", "gelaende"]) },
  { key: "abGeburt", label: "Ab Geburt", optionen: jaNein() },
  { key: "jogging", label: "Joggen/Sport", optionen: jaNein() },
  { key: "geschwister", label: "Zwei Kinder/Zwillinge", optionen: jaNein() },
  { key: "ausschlussHinweis", label: "Ausschluss-Hinweis (optional)" },
];

// ---- Fragebogen ---------------------------------------------------------

export type KompassFrage = { id: string; frage: string; optionen: { value: string; label: string }[] };

export const KOMPASS_FRAGEN: KompassFrage[] = [
  { id: "ohneLift", frage: "Müsst ihr den Wagen oft tragen — z. B. Treppen ohne (zuverlässigen) Lift?", optionen: [{ value: "ja", label: "Ja, oft tragen" }, { value: "nein", label: "Nein, ebenerdig/Lift" }] },
  { id: "auto", frage: "Wie sieht es mit dem Auto aus?", optionen: [{ value: "keins", label: "Kein Auto" }, { value: "klein", label: "Kleines Auto / kleiner Kofferraum" }, { value: "gross", label: "Großes Auto / großer Kofferraum" }] },
  { id: "oeffi", frage: "Seid ihr viel mit Öffis unterwegs?", optionen: jaNein() },
  { id: "gelaende", frage: "Wo seid ihr meistens unterwegs?", optionen: [{ value: "stadt", label: "Stadt / glatte Wege" }, { value: "gemischt", label: "Gemischt" }, { value: "gelaende", label: "Gelände / Feldwege" }] },
  { id: "abGeburt", frage: "Soll der Wagen ab Geburt nutzbar sein (Liegefunktion/Wanne)?", optionen: jaNein() },
  { id: "jogging", frage: "Wollt ihr damit joggen oder sehr sportlich unterwegs sein?", optionen: jaNein() },
  { id: "geschwister", frage: "Für zwei Kinder / Zwillinge (Geschwisterwagen)?", optionen: jaNein() },
  { id: "budget", frage: "Welcher Budget-Rahmen passt?", optionen: [{ value: "bis800", label: "bis ca. 800 €" }, { value: "800bis1300", label: "800–1300 €" }, { value: "ueber1300", label: "über 1300 €" }, { value: "egal", label: "egal" }] },
];

export type KompassAntworten = Record<string, string>;

// ---- Empfehlungslogik (deterministisch) ---------------------------------

export type Empfehlung = { produkt: KompassProdukt; score: number; gruende: string[] };
export type Ausschluss = { produkt: KompassProdukt; grund: string };

const BUDGET_MAX: Record<string, number> = { bis800: 800, "800bis1300": 1300, ueber1300: Infinity, egal: Infinity };

export function empfehlung(a: KompassAntworten, produkte: KompassProdukt[]): { empfehlungen: Empfehlung[]; ausgeschlossen: Ausschluss[] } {
  const empfehlungen: Empfehlung[] = [];
  const ausgeschlossen: Ausschluss[] = [];
  const maxBudget = BUDGET_MAX[a.budget] ?? Infinity;

  for (const p of produkte) {
    const e = p.eignung;
    // Harte Ausschlüsse
    if (a.abGeburt === "ja" && e.abGeburt === "nein") { ausgeschlossen.push({ produkt: p, grund: "nicht ab Geburt nutzbar (keine Liegefunktion)" }); continue; }
    if (a.geschwister === "ja" && e.geschwister === "nein") { ausgeschlossen.push({ produkt: p, grund: "nicht für zwei Kinder/Zwillinge ausgelegt" }); continue; }
    if (a.jogging === "ja" && e.jogging === "nein") { ausgeschlossen.push({ produkt: p, grund: "nicht zum Joggen geeignet" }); continue; }
    if (p.preisEur != null && p.preisEur > maxBudget * 1.1) { ausgeschlossen.push({ produkt: p, grund: `über dem Budget (${Math.round(p.preisEur)} €)` }); continue; }

    let score = 0; const gruende: string[] = [];
    if (a.ohneLift === "ja") {
      if (e.ohneLift === "ja") { score += 3; gruende.push("leicht zu tragen / treppentauglich"); }
      if (e.gewichtKlasse === "leicht") { score += 1; gruende.push("geringes Gewicht"); }
      if (e.gewichtKlasse === "schwer") { score -= 2; }
    }
    if (a.auto === "klein") {
      if (e.faltmass === "kompakt") { score += 2; gruende.push("kleines Faltmaß — passt in kleinen Kofferraum"); }
      if (e.faltmass === "sperrig") { score -= 2; }
    }
    if (a.auto === "keins" || a.oeffi === "ja") {
      if (e.oeffi === "ja") { score += 2; gruende.push("öffi-tauglich"); }
      if (e.gewichtKlasse === "leicht") { score += 1; }
    }
    if (a.gelaende && e.gelaende) {
      if (e.gelaende === a.gelaende) { score += 2; gruende.push("passt zum Untergrund"); }
      else if (a.gelaende === "gelaende" && e.gelaende === "stadt") { score -= 2; }
    }
    if (a.abGeburt === "ja" && e.abGeburt === "ja") { score += 1; gruende.push("ab Geburt nutzbar"); }
    if (a.jogging === "ja" && e.jogging === "ja") { score += 2; gruende.push("sport-/jogging-tauglich"); }
    if (a.geschwister === "ja" && e.geschwister === "ja") { score += 2; gruende.push("für zwei Kinder geeignet"); }

    empfehlungen.push({ produkt: p, score, gruende });
  }

  empfehlungen.sort((x, y) => y.score - x.score);
  return {
    empfehlungen: empfehlungen.filter((e) => e.score > 0).slice(0, 3),
    ausgeschlossen: ausgeschlossen.slice(0, 4),
  };
}
