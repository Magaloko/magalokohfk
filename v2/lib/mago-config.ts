// Magos privater Bereich — reine Konfiguration & Typen. KEINE Server-Imports → client-safe
// (darf von Client-Komponenten importiert werden, anders als lib/mago.ts).
//
// Hier wird die Arbeit/Zusammenarbeit FÜR Stephan von MAGO selbst erfasst, bewertet und
// protokolliert — getrennt von der eigentlichen Umsetzung (Cockpit).

import { PHASE_KEYS } from "./phases";

export type MagoFieldType = "text" | "textarea" | "date" | "select" | "number";

export type MagoField = {
  key: string;
  label: string;
  type: MagoFieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  full?: boolean;     // volle Breite im Formular
  inList?: boolean;   // als Spalte in der Liste zeigen
  suffix?: string;    // Anzeige-Suffix (z. B. " h", " / 5")
};

export type MagoModule = {
  key: string;
  collection: string; // Sammlung in app_state (muss in der Mutate-API als SPEC registriert sein)
  idPrefix: string;
  route: string;
  label: string;
  icon: string;
  newLabel: string;
  emptyTitle: string;
  subtitle: string;
  fields: MagoField[];
};

export type MagoItem = { id?: string } & Record<string, unknown>;

const DATE_PH = "2026-05-30";

export const MAGO_MODULES: MagoModule[] = [
  {
    key: "protokoll", collection: "magoLog", idPrefix: "mlog", route: "/mago/protokoll",
    label: "Liefer-Protokoll", icon: "book", newLabel: "+ Eintrag", emptyTitle: "Noch keine Einträge",
    subtitle: "Was wurde wann für Stephan geliefert / umgesetzt",
    fields: [
      { key: "datum", label: "Datum", type: "date", inList: true, placeholder: DATE_PH },
      { key: "titel", label: "Titel", type: "text", required: true, inList: true },
      { key: "kategorie", label: "Kategorie", type: "select", options: ["Feature", "Fix", "Doku", "Meeting", "Sonstiges"], inList: true },
      { key: "status", label: "Status", type: "select", options: ["In Arbeit", "Geliefert", "Abgenommen"], inList: true },
      { key: "bezug", label: "Bezug (Phase / Aufgabe)", type: "text" },
      { key: "beschreibung", label: "Beschreibung", type: "textarea", full: true },
    ],
  },
  {
    key: "bewertung", collection: "magoBewertung", idPrefix: "mbew", route: "/mago/bewertung",
    label: "Bewertung", icon: "star", newLabel: "+ Bewertung", emptyTitle: "Noch keine Bewertungen",
    subtitle: "Wie läuft die Zusammenarbeit mit Stephan",
    fields: [
      { key: "datum", label: "Datum", type: "date", inList: true, placeholder: DATE_PH },
      { key: "phase", label: "Phase / Kontext", type: "text", inList: true },
      { key: "stimmung", label: "Stimmung", type: "select", options: ["gut", "neutral", "schwierig"], inList: true },
      { key: "score", label: "Score (1–5)", type: "number", inList: true, suffix: " / 5" },
      { key: "notiz", label: "Notiz (was lief gut / schlecht)", type: "textarea", full: true },
      { key: "offenePunkte", label: "Offene Punkte mit Stephan", type: "textarea", full: true },
    ],
  },
  {
    key: "zeit", collection: "magoZeit", idPrefix: "mzeit", route: "/mago/zeit",
    label: "Zeit & Aufwand", icon: "clock", newLabel: "+ Zeit", emptyTitle: "Noch keine Zeiten erfasst",
    subtitle: "Aufwand je Tätigkeit — Basis für Abrechnung & Reporting",
    fields: [
      { key: "datum", label: "Datum", type: "date", inList: true, placeholder: DATE_PH },
      { key: "taetigkeit", label: "Tätigkeit", type: "text", required: true, inList: true },
      { key: "stunden", label: "Stunden", type: "number", inList: true, suffix: " h" },
      { key: "satz", label: "Satz (€ / h)", type: "number", suffix: " €/h" },
      { key: "bezug", label: "Bezug (Phase / Aufgabe)", type: "text" },
      { key: "notiz", label: "Notiz", type: "textarea", full: true },
    ],
  },
  {
    key: "meilensteine", collection: "magoMeilensteine", idPrefix: "mms", route: "/mago/meilensteine",
    label: "Meilensteine", icon: "target", newLabel: "+ Meilenstein", emptyTitle: "Noch keine Meilensteine",
    subtitle: "Phasen & Abnahmen gegen Stephans Roadmap",
    fields: [
      { key: "titel", label: "Titel", type: "text", required: true, inList: true },
      { key: "phase", label: "Phase", type: "select", options: PHASE_KEYS, inList: true },
      { key: "status", label: "Status", type: "select", options: ["Geplant", "Erreicht", "Abgenommen"], inList: true },
      { key: "datumZiel", label: "Ziel-Datum", type: "date", inList: true, placeholder: "2026-09-30" },
      { key: "datumAbnahme", label: "Abnahme-Datum", type: "date" },
      { key: "notiz", label: "Notiz", type: "textarea", full: true },
    ],
  },
];

export const magoModule = (key: string): MagoModule => {
  const m = MAGO_MODULES.find((x) => x.key === key);
  if (!m) throw new Error(`Unbekanntes Mago-Modul: ${key}`);
  return m;
};
