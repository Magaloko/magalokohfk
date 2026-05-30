import type { MagoModule } from "./mago-config";
import { PHASE_KEYS } from "./phases";

// "Umsetzungslead" — was Mago aktiv steuert, damit Stephans Plan im Alltag nicht zerfasert:
// offene Zugänge, technische Blocker, Freigaben und Abstimmungen. Stephan-relevant (Admin-Ebene,
// im Cockpit-Bereich), nutzt dasselbe generische CRUD wie der Mago-Bereich.
export const UMSETZUNG: MagoModule = {
  key: "umsetzung",
  collection: "umsetzungItems",
  idPrefix: "ums",
  route: "/cockpit/umsetzung",
  label: "Umsetzungslead",
  icon: "handshake",
  newLabel: "+ Punkt",
  emptyTitle: "Keine offenen Steuerungs-Punkte",
  subtitle: "Was Mago steuert: Zugänge, Blocker, Freigaben, Abstimmungen",
  fields: [
    { key: "typ", label: "Typ", type: "select", options: ["Zugang", "Blocker", "Freigabe", "Abstimmung", "Risiko"], inList: true },
    { key: "titel", label: "Titel", type: "text", required: true, inList: true },
    { key: "status", label: "Status", type: "select", options: ["offen", "angefragt", "in Arbeit", "erledigt"], inList: true },
    { key: "wer", label: "Wer (Stephan / Markus / Beate / Lorna …)", type: "text", inList: true },
    { key: "phase", label: "Phase (Stephan-Plan)", type: "select", options: PHASE_KEYS },
    { key: "datum", label: "Datum / Frist", type: "date", inList: true },
    { key: "notiz", label: "Notiz", type: "textarea", full: true },
  ],
};
