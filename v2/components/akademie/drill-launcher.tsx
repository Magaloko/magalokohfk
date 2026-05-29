"use client";
import { useMemo, useState } from "react";
import { DrillRunner } from "./drill-runner";
import type { Drill } from "@/lib/akademie";

export function DrillLauncher({ drills }: { drills: Drill[] }) {
  const [marke, setMarke] = useState("all");
  const [open, setOpen] = useState(false);

  const marken = useMemo(
    () => [...new Set(drills.map((d) => d.marke).filter((m): m is string => !!m))].sort((a, b) => a.localeCompare(b)),
    [drills],
  );
  const filtered = useMemo(
    () => (marke === "all" ? drills : drills.filter((d) => d.marke === marke)),
    [drills, marke],
  );
  const playable = filtered.filter((d) => (d.optionen || []).length >= 2 && d.optionen!.some((o) => o.ist_richtig === true || (o.punkte || 0) > 0)).length;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        onClick={() => setOpen(true)}
        disabled={!playable}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ⚡ Drill-Training starten{playable ? ` (${playable})` : ""}
      </button>
      {marken.length > 0 && (
        <select
          value={marke}
          onChange={(e) => setMarke(e.target.value)}
          className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="all">Alle Marken</option>
          {marken.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      )}
      {open && <DrillRunner drills={filtered} onClose={() => setOpen(false)} />}
    </div>
  );
}
