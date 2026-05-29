"use client";
import { useState } from "react";
import { SzenarioRunner } from "./szenario-runner";
import type { Szenario } from "@/lib/akademie";

export function SzenarioLauncher({ sc, personaName }: { sc: Szenario; personaName?: string }) {
  const [open, setOpen] = useState(false);
  const playable = (sc.steps || []).some((s) => (s.options || []).length >= 2);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={!playable}
        className="mt-3 w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {playable ? "▶ Szenario starten" : "Noch keine Schritte"}
      </button>
      {open && <SzenarioRunner sc={sc} personaName={personaName} onClose={() => setOpen(false)} />}
    </>
  );
}
