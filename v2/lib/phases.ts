// MasterMind-Phasen — Stephans Plan als gemeinsame Taxonomie (client-safe, KEINE Server-Imports).
// Ordnet Tasks & Steuerungs-Punkte der Roadmap zu und treibt die Startseite "Stephan-Plan: Umsetzung".

export type Phase = { key: string; label: string; desc: string; roadmap: number; icon: string };

export const PHASES: Phase[] = [
  { key: "Foundation", label: "Foundation", desc: "Datenbasis", roadmap: 1, icon: "globe" },
  { key: "Treasury", label: "Treasury", desc: "Liquidität", roadmap: 2, icon: "money" },
  { key: "Einkaufssystem", label: "Einkaufssystem", desc: "P0 produktiv", roadmap: 3, icon: "bag" },
  { key: "VIPA", label: "VIPA", desc: "GF-Assistent", roadmap: 4, icon: "send" },
  { key: "SeBo", label: "SeBo", desc: "Service-Bot", roadmap: 4, icon: "chat" },
  { key: "VEKTRA", label: "VEKTRA", desc: "Verkaufstraining", roadmap: 5, icon: "academy" },
];

export const PHASE_KEYS: string[] = PHASES.map((p) => p.key);
export const phaseByKey = (k?: string): Phase | undefined => PHASES.find((p) => p.key === k);

// Blöcke für die Startseite (Roadmap-Reihenfolge). VIPA & SeBo = ein Block (Schritt 4).
export type UmsetzungsBlock = {
  key: string; label: string; desc: string; icon: string; step: number;
  phaseKeys: string[]; live?: boolean; note?: string;
};

export const UMSETZUNGS_BLOECKE: UmsetzungsBlock[] = [
  { key: "foundation", label: "Foundation", desc: "Datenbasis (ETL + Postgres)", icon: "globe", step: 1, phaseKeys: ["Foundation"] },
  { key: "treasury", label: "Treasury", desc: "Liquiditäts-Steuerung", icon: "money", step: 2, phaseKeys: ["Treasury"] },
  { key: "einkauf", label: "Einkaufssystem", desc: "P0 produktiv, P1 offen", icon: "bag", step: 3, phaseKeys: ["Einkaufssystem"], live: true, note: "Treasury, Brand-Budget, OOS und Optimizer stehen" },
  { key: "vipasebo", label: "VIPA & SeBo", desc: "GF-Assistent & Service-Bot", icon: "send", step: 4, phaseKeys: ["VIPA", "SeBo"] },
  { key: "vektra", label: "VEKTRA", desc: "Verkaufstraining", icon: "academy", step: 5, phaseKeys: ["VEKTRA"], live: true, note: "live, aber bewusst nachrangig" },
];
