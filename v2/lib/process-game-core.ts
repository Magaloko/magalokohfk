export type ProcessRunStatus = "Entwurf" | "Geprüft" | "Umgesetzt" | "Gelernt";
export type ProcessArea = "Einkauf" | "Sortiment" | "Kundenservice" | "Marketing" | "Finanzen" | "Daten";

export type ProcessRun = {
  id?: string;
  datum?: string;
  bereich?: ProcessArea | string;
  prozess?: string;
  entscheidung?: string;
  einsatz?: string;
  nachweis?: string;
  risiko?: string;
  status?: ProcessRunStatus | string;
  punkte?: number;
  systemSignal?: string;
  naechsterSchritt?: string;
};

export type ProcessMission = {
  id: string;
  bereich: ProcessArea;
  titel: string;
  einsatz: string;
  ziel: string;
  punkte: number;
  beispiel: string;
};

export const PROCESS_MISSIONS: ProcessMission[] = [
  {
    id: "ek-renner",
    bereich: "Einkauf",
    titel: "Renner nachbestellen",
    einsatz: "Bestand, Abverkauf, Lieferzeit, Marge",
    ziel: "konkrete Bestellmenge mit Begründung",
    punkte: 45,
    beispiel: "Nachbestellung nur, wenn Absatzsignal, Lieferzeit und Liquidität zusammenpassen.",
  },
  {
    id: "ek-penner",
    bereich: "Sortiment",
    titel: "Penner bereinigen",
    einsatz: "Lagerdauer, Kapitalbindung, Retouren, Saison",
    ziel: "Markdown, Tausch oder Auslistung entscheiden",
    punkte: 40,
    beispiel: "Langsamdreher bekommt eine nächste Aktion statt nur Beobachtung.",
  },
  {
    id: "svc-regel",
    bereich: "Kundenservice",
    titel: "Service-Regel festhalten",
    einsatz: "Falltyp, Kundenlage, erlaubte Antwort, Eskalation",
    ziel: "wiederverwendbare Antwortregel",
    punkte: 30,
    beispiel: "Aus einem Einzelfall wird eine klare Regel für ähnliche Fälle.",
  },
  {
    id: "data-luecke",
    bereich: "Daten",
    titel: "Datenlücke schließen",
    einsatz: "Quelle, Feld, Fehlerbild, Verantwortliche Person",
    ziel: "verlässlicher Systemeintrag oder Korrekturauftrag",
    punkte: 35,
    beispiel: "Unklare Daten werden nicht diskutiert, sondern prüfbar protokolliert.",
  },
  {
    id: "fin-check",
    bereich: "Finanzen",
    titel: "Liquiditäts-Check",
    einsatz: "Zahlungsziel, Skonto, Kontokorrent, Fälligkeit",
    ziel: "Ampelentscheidung vor Ausgabe",
    punkte: 50,
    beispiel: "Größere Ausgabe erst nach Cash- und Skonto-Logik freigeben.",
  },
  {
    id: "mkt-signal",
    bereich: "Marketing",
    titel: "Nachfrage-Signal verwerten",
    einsatz: "Suche, No-Result, Kampagne, Conversion",
    ziel: "Sortiments- oder Content-Aktion",
    punkte: 25,
    beispiel: "Kundensuche wird zu Einkauf, Content oder Kampagnenbriefing.",
  },
];

export type ProcessStats = {
  total: number;
  points: number;
  implemented: number;
  byArea: { area: string; count: number; points: number }[];
};

export function basePointsForProcess(prozess: unknown): number {
  const key = String(prozess || "");
  return PROCESS_MISSIONS.find((m) => m.titel === key || m.id === key)?.punkte || 25;
}

export function scoreRun(run: ProcessRun): number {
  const base = Number(run.punkte) || basePointsForProcess(run.prozess);
  const evidence = run.nachweis && run.nachweis.trim().length >= 8 ? 10 : 0;
  const signal = run.systemSignal && run.systemSignal.trim().length >= 4 ? 5 : 0;
  const status = run.status === "Gelernt" ? 20 : run.status === "Umgesetzt" ? 15 : run.status === "Geprüft" ? 8 : 0;
  return base + evidence + signal + status;
}

export function processStats(runs: ProcessRun[]): ProcessStats {
  const by = new Map<string, { area: string; count: number; points: number }>();
  for (const r of runs) {
    const area = r.bereich || "Sonstiges";
    const points = scoreRun(r);
    const cur = by.get(area) || { area, count: 0, points: 0 };
    cur.count++;
    cur.points += points;
    by.set(area, cur);
  }
  return {
    total: runs.length,
    points: runs.reduce((sum, r) => sum + scoreRun(r), 0),
    implemented: runs.filter((r) => r.status === "Umgesetzt" || r.status === "Gelernt").length,
    byArea: [...by.values()].sort((a, b) => b.points - a.points),
  };
}
