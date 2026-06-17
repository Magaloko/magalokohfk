"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuizRunner } from "./quiz-runner";
import { Icon } from "@/components/icon";
import type { Drill, Einwand, Marke } from "@/lib/akademie";

export function ChallengeCard({ drills, einwaende, marken, doneToday, streak }: {
  drills: Drill[]; einwaende: Einwand[]; marken: Marke[]; doneToday: boolean; streak: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const playable = drills.length >= 2 || einwaende.length >= 4 || marken.length >= 4;

  return (
    <section className="rounded-xl border border-amber/30 bg-gradient-to-br from-amber/10 to-transparent p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-1.5"><Icon name="sun" className="h-4 w-4" /> Tagesaufgabe</h2>
          <p className="mt-0.5 text-xs text-muted">5 gemischte Fragen · <span className="font-semibold text-amber">+25 Bonus-XP</span> · hält deine Serie am Leben</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber/15 px-3 py-1 text-sm font-semibold text-amber flex items-center gap-1"><Icon name="flame" className="h-4 w-4" /> {streak} Tage</span>
          {doneToday ? (
            <span className="rounded-full bg-green/15 px-3 py-1.5 text-sm font-semibold text-green flex items-center gap-1"><Icon name="check" className="h-4 w-4" /> heute erledigt</span>
          ) : (
            <button onClick={() => setOpen(true)} disabled={!playable}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50 min-h-11">
              Tagesrunde starten
            </button>
          )}
        </div>
      </div>
      {open && (
        <QuizRunner drills={drills} einwaende={einwaende} marken={marken} n={5} recordType="challenge"
          onClose={() => { setOpen(false); router.refresh(); }} />
      )}
    </section>
  );
}
