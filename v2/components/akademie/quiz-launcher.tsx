"use client";
import { useState } from "react";
import { QuizRunner } from "./quiz-runner";
import type { Drill, Einwand, Marke } from "@/lib/akademie";

type Cfg = { n: number; drills: Drill[]; einwaende: Einwand[]; marken: Marke[]; focusWeak?: boolean };

export function QuizLauncher({ drills, einwaende, marken }: { drills: Drill[]; einwaende: Einwand[]; marken: Marke[] }) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const btn = "rounded-lg px-4 py-2 text-sm font-semibold transition";
  const has = { drills: drills.length >= 2, einwaende: einwaende.length >= 4, marken: marken.length >= 4 };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCfg({ n: 5, drills, einwaende, marken })} className={`${btn} bg-accent text-bg hover:opacity-90`}>🎯 Quick-Quiz (5)</button>
        <button onClick={() => setCfg({ n: 3, drills, einwaende, marken })} className={`${btn} bg-surface-2 hover:text-ink`}>☀️ Kurz-Quiz (3)</button>
        <button onClick={() => setCfg({ n: 5, drills, einwaende, marken, focusWeak: true })} className={`${btn} bg-amber/15 text-amber hover:bg-amber/25`}>🔁 Schwächen üben</button>
        {has.drills && <button onClick={() => setCfg({ n: 5, drills, einwaende: [], marken: [] })} className={`${btn} bg-surface-2 hover:text-ink`}>⚡ Nur Drills</button>}
        {has.einwaende && <button onClick={() => setCfg({ n: 5, drills: [], einwaende, marken: [] })} className={`${btn} bg-surface-2 hover:text-ink`}>💬 Nur Einwände</button>}
        {has.marken && <button onClick={() => setCfg({ n: 5, drills: [], einwaende: [], marken })} className={`${btn} bg-surface-2 hover:text-ink`}>🏷 Nur Marken</button>}
      </div>
      {cfg && (
        <QuizRunner drills={cfg.drills} einwaende={cfg.einwaende} marken={cfg.marken} n={cfg.n} focusWeak={cfg.focusWeak} onClose={() => setCfg(null)} />
      )}
    </>
  );
}
