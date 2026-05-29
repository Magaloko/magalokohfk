"use client";
import { useState } from "react";
import { QuizRunner } from "./quiz-runner";
import type { Drill, Einwand, Marke } from "@/lib/akademie";

export function QuizLauncher({ drills, einwaende, marken }: { drills: Drill[]; einwaende: Einwand[]; marken: Marke[] }) {
  const [open, setOpen] = useState<null | number>(null);
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setOpen(5)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg">🎯 Quick-Quiz (5)</button>
        <button onClick={() => setOpen(3)} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">☀️ Kurz-Quiz (3)</button>
      </div>
      {open !== null && (
        <QuizRunner drills={drills} einwaende={einwaende} marken={marken} n={open} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
