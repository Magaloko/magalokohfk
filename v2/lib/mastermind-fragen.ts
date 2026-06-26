// Statischer MasterMind-Fragenkatalog (abgeleitet aus lib/strategy.ts / MASTERMIND v2.0).
// Client-safe: reine Daten, KEINE Server-Imports. Antworten werden separat in app_state
// (Sammlung mastermindAntworten) erfasst und über frageId = id verknüpft.

export type FragePrio = "P0" | "P1" | "P2" | "P3" | "P4";
export type FrageEbene = "GF-SAFE" | "TEAM" | "PUBLIC";
export type MasterMindFrage = {
  id: string;
  werkzeug: string; // Tool-Key (treasury/einkauf/vipa/sebo/vektra) ODER "querschnitt" / "future"
  prio: FragePrio;
  frage: string;
  ebene?: FrageEbene;
};

export const MASTERMIND_FRAGEN: MasterMindFrage[] = [
  // Querschnitt / Foundation (P0)
  { id: "qs-1", werkzeug: "querschnitt", prio: "P0", ebene: "GF-SAFE", frage: "Datenquellen-Inventur: Welche Systeme speisen die HFK-Datenschicht (JTL Wawi/eazybusiness, Web-Shop, Banking, Lieferanten-Portale, Buchhaltung)? Was per API, was nur per Export?" },
  { id: "qs-2", werkzeug: "querschnitt", prio: "P0", ebene: "GF-SAFE", frage: "ERP-Connector: Aktuelles ERP = JTL Wawi? Welche Tabellen/Felder sind verlässlich gepflegt (tBestellung, tBestellpos, tArtikel, tWarenLager)? Wo ist die Datenqualität schwach?" },
  { id: "qs-3", werkzeug: "querschnitt", prio: "P0", frage: "Vertrauensebenen konkret: Wer hat GF-SAFE-Zugriff (nur Stephan/Beate? Lorna? Sarah?)? Wie werden TEAM- und PUBLIC-Felder operativ getrennt? Wer vergibt Rechte?" },
  { id: "qs-4", werkzeug: "querschnitt", prio: "P0", ebene: "GF-SAFE", frage: "Hosting & Datenschutz: Wo dürfen GF-SAFE-Daten (Margen, Konditionen, Bankdaten) liegen — Cloud-Region, DSGVO-Auflagen, Auftragsverarbeitung?" },
  { id: "qs-5", werkzeug: "querschnitt", prio: "P0", frage: "Datenverantwortung & Pflege-Rhythmus: Wer pflegt welche Daten und wie oft (Marken = Lorna? Finanzen = Beate? Verkaufsdaten = Sarah? Marketing = Adnan?)?" },
  { id: "qs-6", werkzeug: "querschnitt", prio: "P0", frage: 'Abnahme-Standard: Was ist dein Abnahme-Kriterium pro Werkzeug (wer testet, wie lange Pilot, was muss erfüllt sein für „live")?' },
  { id: "qs-7", werkzeug: "querschnitt", prio: "P0", frage: "Reihenfolge-Bestätigung: Bleibt es bei Foundation → Treasury → Einkauf? Oder zwingt der Liquiditäts-Druck zu einem schlanken Treasury-Vorlauf parallel zur Foundation?" },

  // Treasury (P0)
  { id: "tre-1", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Kontokorrent: Aktueller Rahmen, aktueller Stand, Zielreduktion bis wann? Zinssatz?" },
  { id: "tre-2", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Cash-Inflows: Quellen & Systeme für Zuflüsse (Tagesumsätze stationär + Shop, offene Forderungen, Zahlungsziele)?" },
  { id: "tre-3", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Cash-Outflows: Fixkosten (Miete Kirchengasse 7, Gehälter, Versicherungen), Lieferantenverbindlichkeiten, Steuern, Leasing — Höhe & Fälligkeiten?" },
  { id: "tre-4", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: '180-Tage-Forecast: Welche Positionen müssen wöchentlich rein? Welche Genauigkeit gilt als „belastbar" (Ziel-%)? Wer kalibriert?' },
  { id: "tre-5", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: 'Order-Ampel-Schwelle: Bestätigst du die 2.000-€-Grenze für die Prüfung? Wer darf „rot" überschreiben (nur GF)? Wie werden die 3 Alternativ-Vorschläge gewichtet?' },
  { id: "tre-6", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Konfidenz-Gewichte: Bleiben 1,0 / 0,9 / 0,7 für hoch/mittel/niedrig? Wer setzt die Konfidenz je Forecast-Position?" },
  { id: "tre-7", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Skonto-Landschaft: Welche Lieferanten bieten Skonto, zu welchen Konditionen (z. B. 2 % / 10 Tage netto 30)? Ab welchem effektiven Jahreszins lohnt das Ziehen?" },
  { id: "tre-8", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Saisonalität: Welche Monate sind die kritischen Liquiditäts-Tiefpunkte? Wie wirken die 14–18 Wochen Eigenmarken-Vorlauf konkret?" },
  { id: "tre-9", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Liqui-Cockpit-Szenarien: Welche Szenario-Schieber braucht die GF (Umsatz ±, Zahlungsziel-Verschiebung, Großorder, Lieferanten-Ausfall)?" },

  // Einkaufssystem (P1/P2 nach P0-Produktivstand 26.06.2026)
  { id: "ein-1", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "Historische Lieferzeit-Range: Welche Quelle ist verbindlich fuer Min/Avg/Max je Artikel, Lieferant oder Kategorie - Bestellungen, Lieferantenangabe oder manuelle Overrides?" },
  { id: "ein-2", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "Kategorie-Regeln: Bestaetigung, dass KiWa und Moebel keinen Autopilot bekommen; welche weiteren Kategorien brauchen Sperre oder Buyer-Review?" },
  { id: "ein-3", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "Saisonaufschlaege: Bleiben Saisonmode +30 % und Spielzeug Q4 +20 % als Startregel? Welche Marken oder Warengruppen sind Ausnahmen?" },
  { id: "ein-4", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "Safety-Buffer: Welche Standardtage gelten je Kategorie und welche strategischen Artikel brauchen artikel-spezifische Overrides?" },
  { id: "ein-5", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "Autopilot-Grenze nach P0: Welche P0-Vorschlaege duerfen automatisch laufen und ab welchem Order-Volumen oder Risiko ist Buyer-/GF-Review Pflicht?" },
  { id: "ein-6", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "ML-Forecast: Was ist das Abnahmekriterium gegen die aktuelle Heuristik - Forecast-Fehler, OOS-Vermeidung, DB1-Uplift oder manuelle Buyer-Akzeptanz?" },
  { id: "ein-7", werkzeug: "einkauf", prio: "P2", frage: "Event-Kalender: Welche Events steuern HFK wirklich (Black Friday, Schulanfang, Weihnachten, Mode-Saisonwechsel) und mit welchem Vorlauf je Kategorie?" },
  { id: "ein-8", werkzeug: "einkauf", prio: "P2", frage: "Rhythm-Break und Sichtbarkeit: Woran erkennt HFK einen gebrochenen Verkaufsrhythmus und wie wird Sichtbarkeit fuer Top-20-Renner gemessen?" },

  // VIPA (P2)
  { id: "vip-1", werkzeug: "vipa", prio: "P2", ebene: "GF-SAFE", frage: "Mail-Zugang: Welches Postfach, welche Rechte (nur Lesen/Triage vs. auch Senden)?" },
  { id: "vip-2", werkzeug: "vipa", prio: "P2", frage: 'Mail-Klassen: Welche Kategorien priorisieren (Lieferant, Steuer/Behörde, Kunde, intern, Bank)? Was ist „kritisch"?' },
  { id: "vip-3", werkzeug: "vipa", prio: "P2", ebene: "GF-SAFE", frage: "Reminder-Quellen: Welche Fristen proaktiv (Skonto, Steuertermine, Lieferungen) — woher kommen die Termine (Kalender, Buchhaltung)?" },
  { id: "vip-4", werkzeug: "vipa", prio: "P2", frage: 'Delegation (Team-Aufgaben-Zuordnung): Wer ist für was die „richtige Person" (Lorna/Marken, Sarah/Kundenservice, Adnan/Marketing, Beate/Finanzen)? Delegations-Regeln?' },
  { id: "vip-5", werkzeug: "vipa", prio: "P2", frage: "HFK-Ton: 2–3 Referenz-Mails, an denen VIPA den Schreibstil lernt?" },
  { id: "vip-6", werkzeug: "vipa", prio: "P2", frage: "Kanäle: Sollen Anruf & WhatsApp wirklich zu Tasks werden — welche Nummern/Accounts (WhatsApp Business)?" },
  { id: "vip-7", werkzeug: "vipa", prio: "P2", ebene: "GF-SAFE", frage: "Autonomie-Grenze: Was darf VIPA selbst senden vs. nur vorbereiten (Mensch-im-Loop)?" },

  // SeBo (P2)
  { id: "seb-1", werkzeug: "sebo", prio: "P2", frage: "Kanäle & Volumen: Wo kommen Service-Anfragen rein (Mail, Shop-Kontaktformular, WhatsApp)? Wie viele pro Tag?" },
  { id: "seb-2", werkzeug: "sebo", prio: "P2", frage: "5 Kategorien: Bestätigung Retoure / Lieferung / Rechnung / Produkt / Sonstiges — oder fehlt eine (z. B. Reklamation, Beratung)?" },
  { id: "seb-3", werkzeug: "sebo", prio: "P2", ebene: "GF-SAFE", frage: "Datenabruf: Welche Bestelldaten per Bestellnummer (aus Wawi/Shop) darf SeBo ziehen?" },
  { id: "seb-4", werkzeug: "sebo", prio: "P2", ebene: "TEAM", frage: "Policies für korrekte Antworten: Retouren-Fristen & -Kosten, Versandregeln, Rechnungs-Handling — die harten Regeln, damit SeBo nicht halluziniert." },
  { id: "seb-5", werkzeug: "sebo", prio: "P2", frage: 'Eskalation & SLA: Wer ist der Mensch im Loop (Sarah/Service?)? Antwort-SLA? Wann „manuelle Prüfung"?' },

  // VEKTRA (P3, live — Ausbau)
  { id: "vek-1", werkzeug: "vektra", prio: "P3", ebene: "TEAM", frage: "Inhalts-Lücken: Welche Marken-Profile fehlen noch / sind veraltet? Wer pflegt sie verbindlich (Lorna)?" },
  { id: "vek-2", werkzeug: "vektra", prio: "P3", ebene: "TEAM", frage: "Verkaufs-Cockpit / Live-Abfrage: Welche Live-Daten braucht das Team im Verkaufsgespräch (Bestand, Größe/Schnitt, Liefertermin, Preis)?" },
  { id: "vek-3", werkzeug: "vektra", prio: "P3", frage: 'Verbindlicher Rollout: Wer nutzt VEKTRA verpflichtend, mit welchem Ziel? Wie messen wir „neue Mitarbeitende in 3 statt 12 Monaten einsatzbereit"?' },
  { id: "vek-4", werkzeug: "vektra", prio: "P3", frage: "Management-Sicht: Welche KPIs will das Store-Management je Mitarbeiter sehen (Trainings, Quote, Schwächen)?" },

  // Future Scope & Strategisch (P4)
  { id: "fut-1", werkzeug: "future", prio: "P4", ebene: "GF-SAFE", frage: 'Brand Intelligence — Wiederaufnahme: Welches Signal/Datum löst die Reaktivierung aus? Bestätigung der „12 Felder je Marke"? Quelle für den wöchentlichen „Brand Pulse"?' },
  { id: "fut-2", werkzeug: "future", prio: "P4", frage: "Customer App 2027: Budget/Förderung geklärt? Datenquellen für die Killer-Features (Babywetter, Größenrechner mit Marken-Schnitt-Awareness)?" },
  { id: "fut-3", werkzeug: "future", prio: "P4", ebene: "GF-SAFE", frage: "Ungarn-Expansion: Zeithorizont? Was muss die Architektur dafür vorbereiten (Mehrsprachigkeit, zweiter Standort, Steuer/Recht)?" },
  { id: "fut-4", werkzeug: "future", prio: "P4", ebene: "GF-SAFE", frage: 'Investor-Pitch: Welche Produkt-Substanz soll bis wann stehen, um den Pitch mit „echter Substanz" zu führen?' },
  { id: "fut-5", werkzeug: "future", prio: "P4", ebene: "GF-SAFE", frage: "ERP-Wechsel-Option: Ist ein ERP-Wechsel mittelfristig realistisch oder rein optional? Beeinflusst das den Connector-Bau jetzt?" },
];

export const fragenFuer = (werkzeug: string): MasterMindFrage[] =>
  MASTERMIND_FRAGEN.filter((f) => f.werkzeug === werkzeug);
