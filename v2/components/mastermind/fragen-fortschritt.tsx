import { MASTERMIND_FRAGEN } from "@/lib/mastermind-fragen";
import type { MasterMindAntwort } from "@/lib/mastermind";

// Balken-Übersicht: pro Werkzeug (+ Querschnitt/Future) der Klärungs-Fortschritt
// (beantwortete / gesamte Fragen). Server-Component, reine CSS-Balken.
const GROUPS: { key: string; label: string }[] = [
  { key: "querschnitt", label: "Querschnitt" },
  { key: "treasury", label: "Treasury" },
  { key: "einkauf", label: "Einkaufssystem" },
  { key: "vipa", label: "VIPA" },
  { key: "sebo", label: "SeBo" },
  { key: "vektra", label: "VEKTRA" },
  { key: "future", label: "Future Scope" },
];

export function FragenFortschritt({ antworten }: { antworten: Record<string, MasterMindAntwort> }) {
  const rows = GROUPS.map((g) => {
    const fs = MASTERMIND_FRAGEN.filter((f) => f.werkzeug === g.key);
    const total = fs.length;
    const done = fs.filter((f) => antworten[f.id]?.status === "beantwortet").length;
    return { ...g, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }).filter((r) => r.total > 0);

  const totalAll = rows.reduce((s, r) => s + r.total, 0);
  const doneAll = rows.reduce((s, r) => s + r.done, 0);

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold">Klärungs-Fortschritt mit Stephan</h3>
        <span className="shrink-0 font-mono text-xs text-muted-2">{doneAll}/{totalAll} beantwortet</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-xs font-semibold sm:w-32">{r.label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div className={`h-full rounded-full ${r.pct === 100 ? "bg-green" : "bg-accent"}`} style={{ width: `${r.pct}%` }} />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-2">{r.done}/{r.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
