export const SEBO_STATUS = {
  source: "HFK_SEBO_Konzept_v2.pdf + HFK_SEBO_Anhang_Mago_v2.pdf + Amok AI Status Juni 2026",
  updatedLabel: "Stand: Juni 2026",
  summary: [
    { label: "SeBo v1", status: "Kern produktiv", tone: "green" as const },
    { label: "5k-Abschluss", status: "Pilot/Doku fehlen", tone: "red" as const },
    { label: "SeBo v2", status: "Neues Projekt", tone: "accent" as const },
    { label: "analytics_sales", status: "leer", tone: "red" as const },
    { label: "Mago", status: "Abnahme + Steuerung", tone: "teal" as const },
  ],
  running: [
    "Ticket-System, KI-Kategorisierung und KI-Drafts sind produktiv.",
    "JTL-Kundenmapping und Feature-Flag-System sind stabil.",
    "Automatische Erstantworten sind technisch fertig, aber nicht produktiv aktiv.",
    "Konzept v2.0 und technischer Mago-Anhang liegen vor.",
  ],
  openP1: [
    "5k-Projekt mit Pilot, Abnahme und Dokumentation abschliessen.",
    "analytics_sales mit echten Daten befuellen.",
    "Bestellhistorie fertigstellen und testen.",
    "Automatische Erstantworten testen, aber erst nach Freigabe produktiv aktivieren.",
  ],
  openP2: [
    "JTL-Sync fuer Sales-Daten langfristig automatisieren.",
    "Rule-Engine vs. Power Automate mit Stephan klaeren.",
    "Outlook-Templates pro Kategorie als schnelle Vorerfassung.",
    "React-PWA fuer strukturierte Fallanlage mit Foto-Upload.",
  ],
  nextSteps: [
    "5k-Abnahmeplan erstellen und gegen urspruenglichen Auftrag halten.",
    "analytics_sales zuerst per Test-Batch befuellen.",
    "Dokumentation/Schulung als Abschluss-Deliverable einplanen.",
    "Stephan-Call mit Entscheidungsfragen vorbereiten.",
  ],
};
