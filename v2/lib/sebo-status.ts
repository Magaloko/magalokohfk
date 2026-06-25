export const SEBO_STATUS = {
  source: "HFK_SEBO_Konzept_v2.pdf + HFK_SEBO_Anhang_Mago_v2.pdf",
  updatedLabel: "Stand: 24.06.2026",
  summary: [
    { label: "SeBo v1", status: "5k-Abschluss pruefen", tone: "amber" as const },
    { label: "SeBo v2", status: "Neues Projekt", tone: "accent" as const },
    { label: "Architektur", status: "Stateful Cases", tone: "red" as const },
    { label: "DB", status: "Entscheidung offen", tone: "amber" as const },
    { label: "Mago", status: "Steuerung + Handover", tone: "teal" as const },
  ],
  running: [
    "Konzept v2.0 und technischer Mago-Anhang liegen vor.",
    "Zielbild: Kommunikations-Hub mit Mail, WhatsApp und Telefonnotizen.",
    "Kernwechsel: stateless Mail-Verarbeitung wird zu persistentem Case-Management.",
    "KI-Workflow bleibt zweistufig: classify_email, dann generate_response.",
  ],
  openP1: [
    "SeBo-v1-Ist-Stand von Dadakaev Labs einholen.",
    "5k-Auftrag gegen gelieferten Scope und Abnahmekriterien pruefen.",
    "DB-Entscheidung vorbereiten: Postgres One-Source vs. getrennte Supabase-DB.",
    "Statusmigration fuer 03_Wartet_auf_Kunde zu 03_Wartet_auf_Hersteller planen.",
  ],
  openP2: [
    "Outlook-Templates pro Kategorie als schnelle Vorerfassung.",
    "React-PWA fuer strukturierte Fallanlage mit Foto-Upload.",
    "Hersteller-Mapping fuer spaetere Portal-/API-Uebertragung.",
    "Approval-Step fuer jede Herstelleruebertragung definieren.",
  ],
  nextSteps: [
    "Stephan-Call mit Entscheidungsfragen vorbereiten.",
    "Dadakaev-Labs-Handover-Liste verschicken.",
    "v1-Abnahmeliste und v2-Change-Request-Liste trennen.",
    "Neue SeBo-Steuerungsseite im Cockpit als Arbeitsgrundlage nutzen.",
  ],
};
