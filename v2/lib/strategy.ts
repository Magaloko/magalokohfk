// MasterMind — Stephans Strategie-Grundlagen (Version 2.0, Mai 2026) als strukturierte
// Single Source of Truth. Speist die Strategie-/Roadmap-Seite (cockpit/strategie) UND den
// Stephan-Assistenten (lib/stephan-context.ts).
//
// Inhalte 1:1 aus dem Strategie-Dokument — bewusst KEINE erfundenen Zahlen (Halluzinations-Schutz,
// Architektur-Prinzip 6.4). Wo das Dokument keine Zahl nennt, steht hier auch keine.
// VEKTRA = das Trainer-Werkzeug dieser App (MasterMind).

export type WerkzeugStatus = "Live" | "Geplant" | "Future Scope";
export type AgentTyp = "deterministisch" | "agentisch" | "hybrid";

export type Werkzeug = {
  key: string;
  name: string;
  rolle: string;          // z. B. "der Verkaufstrainer"
  icon: string;           // Icon-Name aus components/icon.tsx
  zweck: string;
  faehigkeiten: string[];
  hebel: string;          // der strategische Hebel dieses Werkzeugs
  status: WerkzeugStatus;
  agentTyp: AgentTyp;
  istDieseApp?: boolean;
};

export type Hebel = { titel: string; beschreibung: string };
export type Vertrauensebene = { ebene: string; wer: string; beispiele: string };
export type FutureScope = { name: string; icon: string; beschreibung: string; status: string };
export type RoadmapPhase = { schritt: number; titel: string; beschreibung: string; timing?: string; istDieseApp?: boolean };
export type Prinzip = { titel: string; beschreibung: string };

export type MasterMindPlan = {
  tagline: string;
  unterzeile: string;
  version: string;
  vertraulich: string;
  vision: string;
  position: string;
  phase: string;
  zentraleFrage: string;
  hebel: Hebel[];
  vertrauensebenen: Vertrauensebene[];
  werkzeuge: Werkzeug[];
  futureScope: FutureScope[];
  roadmap: RoadmapPhase[];
  ziele2028: string[];
  differenzierung: string[];
  prinzipien: Prinzip[];
};

export const MASTERMIND: MasterMindPlan = {
  tagline: "Strategie. Vision. Werkzeuge.",
  unterzeile: "Was HFK in den nächsten 24 Monaten baut — und warum.",
  version: "Version 2.0 · Mai 2026",
  vertraulich: "Vertraulich · Adressaten: Geschäftsführung, Schlüssel-Stakeholder, Partner",

  vision:
    "Das MasterMind-System ist die zentrale Intelligenz hinter HFK. Es bündelt Daten, Marken-Wissen, " +
    "Finanz-Logik und Verkaufs-Expertise in einem Tool-Set, das die Geschäftsführung, das Team und " +
    "perspektivisch die Kunden bedient — kanalübergreifend, vertrauenswürdig, lernfähig.",

  position:
    "HFK ist ein Premium-Familienkonzeptstore in Wien-Neubau (Kirchengasse 7). Kuratierte Markenware für " +
    "junge Familien — Mode, Kinderwagen, Spielzeug, Möbel, Pflege. Jahresumsatz rund 2,5 Mio. €, stationär " +
    "und über den eigenen Web-Shop. USP: nicht die günstigsten oder größten, sondern die kuratiertesten und " +
    "beratungsstärksten. Genau das muss digital nachgebaut werden, ohne die Identität zu verlieren.",

  phase:
    "Aktuelle Phase: Stabilisierung. Kontokorrent an der oberen Grenze, Eigenmarken mit 14–18 Wochen Vorlauf, " +
    "Saisonalität drückt zyklisch die Liquidität. Premium-Beratung skaliert nicht über die Personalkapazität " +
    "hinaus — das ist Wachstumsbremse Nummer eins.",

  zentraleFrage:
    "Wie skalieren wir HFK, ohne zu verwässern? Wie machen wir die Beratungsqualität, die uns ausmacht, auch " +
    "dann verfügbar, wenn wir nicht jedem Kunden persönlich gegenübersitzen — und wie binden wir gleichzeitig " +
    "die Finanzdisziplin ein, die für Wachstum nötig ist?",

  hebel: [
    {
      titel: "Skalierung der Beratungs-Kompetenz",
      beschreibung:
        "Marken-Wissen, Argumente und Empfehlungs-Logik werden digital verfügbar gemacht — für das Verkaufsteam, " +
        "das Service-Team, perspektivisch für Kunden direkt.",
    },
    {
      titel: "Finanzielle Disziplin im Einkauf",
      beschreibung:
        "Jede größere Order wird vor Bestätigung gegen den Liquiditäts-Forecast geprüft. Skonti werden " +
        "systematisch genutzt. Margen werden datenbasiert gesteuert statt nach Bauchgefühl.",
    },
  ],

  vertrauensebenen: [
    { ebene: "GF-SAFE", wer: "Geschäftsführung", beispiele: "Lieferantenkonditionen, Margen, Liquidität, Vertragsdetails, strategische Pläne" },
    { ebene: "TEAM", wer: "Alle Mitarbeitenden", beispiele: "Marken-Profile, Verkaufsdaten, Kunden-Daten, Bestand, interne Workflows" },
    { ebene: "PUBLIC", wer: "Kunden, Öffentlichkeit", beispiele: "Marken-Stories, Produktbeschreibungen, öffentliche Inhalte" },
  ],

  werkzeuge: [
    {
      key: "treasury",
      name: "Treasury",
      rolle: "die Liquiditäts-Steuerung",
      icon: "money",
      zweck:
        "HFK-Einkauf wird liquiditätsbewusst: Jede Order ab 2.000 € wird vor Bestätigung gegen den " +
        "Cashflow-Forecast geprüft — ohne den Buyer zu entmündigen.",
      faehigkeiten: [
        "Cashflow-Forecast über 180 Tage",
        "Konfidenz-Logik (hoch/mittel/niedrig, Gewichte 1,0 / 0,9 / 0,7)",
        "Order-Ampel ab 2.000 € (grün/gelb/rot) plus 3 Alternativ-Vorschläge",
        "Skonto-Optimierung über effektiven Jahreszins",
        "Liqui-Cockpit für die GF mit Szenario-Schiebern",
        "Forecast-Accuracy-Tracking (wöchentliche Kalibrierung)",
      ],
      hebel: "Verhindert akute Liquiditäts-Engpässe und macht Wachstum trotz angespannter Lage planbar.",
      status: "Geplant",
      agentTyp: "deterministisch",
    },
    {
      key: "einkauf",
      name: "Einkaufssystem",
      rolle: "die Margen-Steuerung",
      icon: "bag",
      zweck:
        "Sortiments-Entscheidungen werden datenbasiert getroffen: Renner zuverlässig nachbestellen, Penner " +
        "gezielt abverkaufen, neue Marken mit klarer Margen-Logik ins Sortiment. Macht den Buyer schneller und treffsicherer.",
      faehigkeiten: [
        "Autopilot für Renner (A-Klasse, hoher DB1)",
        "Event-Kalender (Black Friday, Schulanfang, Weihnachten …)",
        "OOS-Frühwarnung mit Lieferzeit-Range",
        "Kategorie-Logik mit Safety-Buffer",
        "Fashion-Steuerung (Sell-Through-Markdown mit Floor)",
        "Zielkauf KiWa & Möbel (Vorkasse, auftragsorientiert)",
        "Sichtbarkeits-Check Top-20-Renner · Rhythm-Break-Detection",
      ],
      hebel: "Ein bis zwei Prozentpunkte mehr DB1 über 12 Monate, plus deutlich weniger Kapitalbindung in Pennern.",
      status: "Geplant",
      agentTyp: "hybrid",
    },
    {
      key: "vipa",
      name: "VIPA",
      rolle: "der persönliche Assistent",
      icon: "send",
      zweck:
        "Persönlicher Assistent für die Geschäftsführung: reduziert Mail-Volumen, erinnert proaktiv an " +
        "Fälligkeiten, führt Routine-Kommunikation aus. Ziel: mehr Zeit für Wesentliches.",
      faehigkeiten: [
        "Mail-Triage (klassifiziert & priorisiert)",
        "Proaktive Reminder (Skonto-Fristen, Steuern, Lieferungen)",
        "Team-Task-Sub (delegiert an die richtige Person)",
        "Schnellschritt (vorbereitete Routine-Antworten)",
        "Anruf & WhatsApp werden Tasks (mit Kalender-Eintrag)",
        "Mail diktieren — VIPA formuliert im HFK-Ton aus",
      ],
      hebel: "Gewinnt GF-Kapazität zurück — rund 200 Stunden im Jahr für strategische Arbeit, weniger Vergessens-Risiken.",
      status: "Geplant",
      agentTyp: "agentisch",
    },
    {
      key: "sebo",
      name: "SeBo",
      rolle: "der Service-Bot",
      icon: "chat",
      zweck:
        "Kundenservice-Anfragen werden automatisch klassifiziert, Daten zusammengetragen und Antwortvorschläge " +
        "generiert. Mensch im Loop für den Versand — niemals vollautomatischer Versand an Kunden.",
      faehigkeiten: [
        "Klassifikation in 5 Kategorien (Retoure, Lieferung, Rechnung, Produkt, Sonstiges)",
        "Priorisierung in 3 Stufen (kritisch / wichtig / normal)",
        "Automatischer Datenabruf zur Bestellnummer",
        "Antwortvorschlag mit echten Daten",
        "Halluzinations-Schutz (markiert unklare Fälle als „manuelle Prüfung“)",
        "Eskalations-Logik mit Kontext-Zusammenfassung",
      ],
      hebel: "Bearbeitungszeit pro Standard-Anfrage halbiert sich, Antwort-Qualität wird konsistenter.",
      status: "Geplant",
      agentTyp: "agentisch",
    },
    {
      key: "vektra",
      name: "VEKTRA",
      rolle: "der Verkaufstrainer",
      icon: "academy",
      zweck:
        "Mobile App für das Verkaufsteam: trainiert Marken-Wissen, simuliert Beratungsgespräche, coacht " +
        "Einwand-Behandlung. Premium-Ästhetik. Perspektivisch erweiterbar zum Verkaufs-Cockpit mit Live-Abfrage.",
      faehigkeiten: [
        "Wissens-Quiz (KI-generiert je Marke, mit Erklärung)",
        "Beratungs-Rollenspiel (3 Längen: Kurz / Standard / Frei)",
        "Einwand-Coaching (1–5 Sterne, mit Profi-Tipps)",
        "Persönlicher Fortschritts-Tracker (auch fürs Store-Management)",
        "Halluzinations-Schutz (nur hinterlegte Marken-Profile)",
        "Mobile-optimiert (iOS Safari / Android Chrome, ohne Installation)",
      ],
      hebel:
        "Neue Mitarbeitende sind statt zwölf in drei Monaten einsatzbereit; Beratungs-Qualität steigt strukturell — " +
        "direkter Hebel auf die Margenbasis des Premium-USP.",
      status: "Live",
      agentTyp: "hybrid",
      istDieseApp: true,
    },
  ],

  futureScope: [
    {
      name: "Brand Intelligence — das Marken-Brain",
      icon: "gem",
      beschreibung:
        "Zentrale, versionierte Datenbank für alle Marken-Profile (zwölf Felder je Marke). KI-unterstützte " +
        "Aktualisierung mit Buyer-Review als Qualitäts-Gate, plus wöchentlicher „Brand Pulse“. Wird zur " +
        "Datenfoundation für VEKTRA, SeBo, Redaktionskalender und perspektivisch die Customer App.",
      status: "Konzept v1.0 · ab Q3–Q4 2026 · geparkt bis Stephan die Wiederaufnahme entscheidet",
    },
    {
      name: "Customer Experience 2027 — die Kundenseite",
      icon: "rocket",
      beschreibung:
        "Native HFK-Familien-App. Differenzierende Killer-Features: Babywetter (Wetter + altersgerechte " +
        "Kleidungsempfehlung) und Größenrechner mit Marken-Schnitt-Awareness. Plus Direktkauf, " +
        "Dokumentenspeicher, Beratungsbot 24/7, Wunschzettel und Bonus-System. „Alle reden davon, wir machen es.“",
      status: "Konzept v1.0 · ab Q1 2027 · größeres, förderbares Vorhaben",
    },
  ],

  roadmap: [
    { schritt: 1, titel: "Foundation", beschreibung: "Die gemeinsame Datenbasis (ETL-Pipeline + HFK-Postgres-Schema) muss stehen, bevor Werkzeuge belastbar darauf aufsetzen." },
    { schritt: 2, titel: "Treasury", beschreibung: "Hier ist der wirtschaftliche Druck am höchsten. Erfolg hier bestätigt die Foundation." },
    { schritt: 3, titel: "Einkaufssystem", beschreibung: "Baut auf Treasury auf (Liqui-Check pro Order) und vervollständigt den größten Hebel." },
    { schritt: 4, titel: "VIPA & SeBo (parallel)", beschreibung: "Beide profitieren von der Foundation, sind aber unabhängig von Treasury und Einkauf." },
    { schritt: 5, titel: "VEKTRA", beschreibung: "Im Plan zuletzt; konnte aber mit Code-basierten Marken-Profilen früher starten — genau das ist diese App.", istDieseApp: true },
    { schritt: 6, titel: "Future Scope", beschreibung: "Brand Intelligence ab Q3–Q4 2026, Customer Experience 2027 ab Q1 2027.", timing: "2026–2027" },
  ],

  ziele2028: [
    "Die Liquidität ist nachhaltig stabilisiert — Kontokorrent kontrolliert reduziert, Skonti systematisch genutzt, Forecast-Genauigkeit auf belastbarem Niveau.",
    "Der Einkauf ist datenbasiert — Sortiment auf DB1 optimiert, Penner gezielt abverkauft, Renner zuverlässig nachbestockt, Marken-Schwerpunkte saisonal gesetzt.",
    "Das Team ist entlastet und befähigt — Routine-Mails reduziert, Service-Bearbeitung schneller, Verkaufstraining systematisch, alle Tools sprechen miteinander.",
    "Die Kunden erleben uns digital konsistent — bei Umsetzung der Customer-App-Vision bekommt jede Familie einen digitalen Concierge.",
    "Die Architektur trägt — ERP-Wechsel wäre möglich (nicht zwingend), Wachstum nach Ungarn technisch vorbereitet, Investor-Pitch mit echter Produkt-Substanz.",
  ],

  differenzierung: [
    "Wir wissen, was die Familie braucht — auch vor dem ersten Kontakt: Wachstumsphase, Marken-Präferenzen, frühere Käufe, Saisonalität.",
    "Unsere Beratung skaliert, ohne flacher zu werden — neue Verkäufer:innen schneller einsatzbereit, bestehende bleiben aktuell.",
    "Wir treffen Entscheidungen auf Datenbasis — nicht auf Bauchgefühl, sondern Daten plus Erfahrung verzahnt.",
  ],

  prinzipien: [
    { titel: "ERP-Agnostik", beschreibung: "Werkzeuge sprechen mit der HFK-eigenen Datenschicht, nicht direkt mit dem ERP. Ein Connector übersetzt — bei ERP-Wechsel wird nur dieser neu gebaut." },
    { titel: "Vertrauensebenen", beschreibung: "[GF-SAFE] / [TEAM] / [PUBLIC]. Jedes Datenfeld zugeordnet, jedes Werkzeug greift nur auf nötige Ebenen zu." },
    { titel: "Agent-Hybrid", beschreibung: "Determinismus wo Auditierbarkeit gefordert ist, KI-Agenten wo Kontext-Verarbeitung Wert bringt. Treasury deterministisch, VIPA/SeBo agentisch, VEKTRA/Einkauf hybrid." },
    { titel: "Halluzinations-Schutz", beschreibung: "KI erfindet niemals Fakten außerhalb der Daten. Harte System-Prompts, Konfidenz-Stufen je Feld, Audit-Logging." },
    { titel: "Dokumentations-Standard", beschreibung: "Ohne Doku keine Abnahme. Code-Header, Architektur-Markdown, Handover-Checkliste. Code-Eigentum bei HFK, kein Lock-In." },
  ],
};

// Kompakte, token-begrenzte Strategie-Zusammenfassung für den Stephan-Assistenten.
// Wird der Wissensbasis vorangestellt, damit Fragen zu Roadmap/Zielen/Werkzeugen belegbar
// (aus Stephans Plan) beantwortet werden können — nicht aus erfundenem Wissen.
export function strategySummaryText(): string {
  const m = MASTERMIND;
  const out: string[] = [];
  out.push(`MASTERMIND — ${m.tagline} ${m.unterzeile} (${m.version}).`);
  out.push(`Vision: ${m.vision}`);
  out.push("Zwei strategische Hebel: " + m.hebel.map((h) => `${h.titel} (${h.beschreibung})`).join(" · "));
  out.push("Drei Vertrauensebenen: " + m.vertrauensebenen.map((v) => `[${v.ebene}] ${v.wer}`).join(" · "));
  out.push("Werkzeug-Set:");
  for (const w of m.werkzeuge) {
    out.push(`- ${w.name} (${w.rolle}) — Status: ${w.status}${w.istDieseApp ? " = DIESE APP" : ""}. Zweck: ${w.zweck} Hebel: ${w.hebel}`);
  }
  out.push("Future Scope: " + m.futureScope.map((f) => `${f.name} (${f.status})`).join(" · "));
  out.push("Roadmap-Sequenz: " + m.roadmap.map((r) => `${r.schritt}. ${r.titel}`).join(" → "));
  out.push("Ziele bis Mitte 2028:");
  for (const z of m.ziele2028) out.push(`- ${z}`);
  out.push("Architektur-Prinzipien: " + m.prinzipien.map((p) => p.titel).join(" · "));
  return out.join("\n");
}
