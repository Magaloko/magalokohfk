export type EinkaufTone = "muted" | "accent" | "green" | "amber" | "red" | "teal";

export const EINKAUFSPLANER_STATUS = {
  source: "Codex-Kontext SeBo Einkaufsplaner, Stand 26.06.2026",
  updatedLabel: "Stand: 26.06.2026",
  mission: {
    title: "SeBo Einkaufsplaner ist P0-produktiv, P1 wird jetzt kontrolliert nachgezogen",
    summary:
      "Der Einkaufsplaner ist das zentrale MasterMind-System fuer DB1-optimierten Einkauf. P0 steht: Treasury-Ampel, Brand-Budget nach DB1, OOS-Schutz, ABC/XYZ, DB1-Filter und Budget-Optimierung sind produktiv. Mago muss jetzt P1 sauber priorisieren und jede fachliche Regel als pruefbaren Einkaufsfall erfassen.",
    guardrail:
      "Keine Deploys waehrend laufendem JTL-Sync ohne explizites Go. Optimizer-Aenderungen immer zusammen mit API und UI pruefen; TypeScript-Check vor Commit.",
  },
  summary: [
    { label: "P0 Kern", status: "Produktiv", tone: "green" as EinkaufTone },
    { label: "JTL Products", status: "IsActive Sync", tone: "green" as EinkaufTone },
    { label: "analytics_sales", status: "CSV/Backfill", tone: "amber" as EinkaufTone },
    { label: "P1 Regeln", status: "Teilweise", tone: "amber" as EinkaufTone },
    { label: "ML-Forecast", status: "POC", tone: "accent" as EinkaufTone },
  ],
  implementedP0: [
    "Treasury-Order-Ampel fuer Bestellungen ab 2.000 EUR.",
    "Brand-Budget-Verteilung nach realem DB1-Beitrag der letzten 365 Tage.",
    "OOS-Schutz priorisiert Renner, Dauerlaeufer und saisonale Hits.",
    "ABC/XYZ-Klassifizierung mit DB1-Filter.",
    "Budget-Optimizer mit Knapsack-Logik und Brand-Limits.",
    "Einkaufs-Cockpit und Budget-Planer UI sind vorhanden.",
  ],
  partial: [
    "Safety-Buffer und Kategorie-Regeln sind im DB-Schema vorhanden, aber noch nicht konsistent aktiv.",
    "Python-POC mit XGBoost ist weiter als der produktive TypeScript-Code.",
    "analytics_sales wird hauptsaechlich ueber CSV-Import und Matching-Scripts befuellt.",
  ],
  openP1: [
    "P1.1 Historische Lieferzeit-Range: Min/Avg/Max aus 12 Monaten ableiten.",
    "P1.2 Kategorie-Regeln aktivieren: KiWa/Moebel kein Autopilot, Saisonmode +30 %, Spielzeug Q4 +20 %.",
    "P1.3 Artikel-spezifischen Safety-Buffer konsistent in Sicherheitsbestand und UI anzeigen.",
    "P1.4 ML-Forecast aus dem Python-POC produktionsnah in TypeScript/Service-Schicht ueberfuehren.",
  ],
  openP2: [
    "Event-Kalender fuer Black Friday, Weihnachten, Schulanfang und Saisonwechsel.",
    "Rhythm-Break Detection fuer Top-Renner.",
    "Top-20- und Markdown-Steuerung mit Mindestmargen-Floor.",
    "Sichtbarkeits-Check fuer strategisch wichtige Artikel.",
  ],
  architecture: [
    { label: "lib/einkauf/optimizer.ts", detail: "Kern: generateCandidates und applyBudget." },
    { label: "lib/einkauf/calculations.ts", detail: "DB1, Saison-Index, Nachfrageprofil und Lifecycle." },
    { label: "lib/einkauf.ts", detail: "Orchestrierung, Treasury-Ampel und Hauptlogik." },
    { label: "lib/einkauf/db.ts", detail: "DB-Zugriff, Artikel-Config, Safety-Buffer, Kategorie-Regeln und Lieferzeit-Override." },
    { label: "app/api/einkauf/recommendations/route.ts", detail: "API fuer Budget-Optimierung und Vorschlaege." },
    { label: "app/dashboard/einkauf/*", detail: "Einkaufs-Cockpit und Budget-Planer UI." },
  ],
  dataSources: [
    "sebo.analytics_products",
    "sebo.analytics_sales",
    "sebo.analytics_inventory_snapshots",
    "sebo.einkauf_artikel_config",
  ],
  syncChange: {
    title: "Produkt-Sync Filter seit 26.06.2026",
    points: [
      "syncProducts filtert nur noch item.Id != null.",
      "Artikel muessen weiterhin IsActive === true sein.",
      "EK <= 0 ist kein Ausschlusskriterium mehr.",
      "Artikelalter > 3 Jahre ist kein Ausschlusskriterium mehr.",
    ],
  },
  nextTasks: [
    {
      title: "P1.1 Lieferzeit-Range spezifizieren",
      owner: "Mago + Einkauf",
      priority: "hoch",
      reason: "Der aktuelle Default von 14 Tagen ist fuer KiWa, Moebel und Eigenmarken fachlich zu grob.",
    },
    {
      title: "Kategorie-Regeln als Testfaelle erfassen",
      owner: "Mago",
      priority: "hoch",
      reason: "P1.2 darf nicht nur Text sein; jede Regel braucht Artikelbeispiele, Sperrlogik und erwartete UI-Ausgabe.",
    },
    {
      title: "Safety-Buffer in Optimizer, API und UI pruefen",
      owner: "Entwicklung",
      priority: "hoch",
      reason: "Schema existiert, aber inkonsistente Anwendung fuehrt direkt zu falschen Bestellvorschlaegen.",
    },
    {
      title: "ML-POC gegen Heuristik benchmarken",
      owner: "Entwicklung",
      priority: "mittel",
      reason: "XGBoost erst produktiv uebernehmen, wenn Forecast-Qualitaet und Fallback-Regeln belastbar sind.",
    },
  ],
  stephanQuestions: [
    "Welche Kategorien sind Autopilot-Sperren: KiWa, Moebel, weitere?",
    "Welche Lieferzeit-Quelle ist verbindlich: historische Bestellungen, Lieferantenangabe oder manuelle Overrides?",
    "Welche Safety-Buffer gelten je Kategorie und welche Artikel brauchen Einzel-Override?",
    "Ab welchem DB1- oder Kapitalbindungsrisiko soll Mago einen Vorschlag blockieren statt nur warnen?",
    "Welche Events steuern HFK wirklich operativ und wie viele Wochen Vorlauf sind je Event relevant?",
  ],
};
