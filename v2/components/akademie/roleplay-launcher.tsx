"use client";
import { useState } from "react";
import { RoleplayRunner } from "./roleplay-runner";
import type { Rollenspiel } from "@/lib/akademie";

export function RoleplayLauncher({ rp }: { rp: Rollenspiel }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
      >
        🎙 Live-Rollenspiel starten
      </button>
      {open && <RoleplayRunner rp={rp} onClose={() => setOpen(false)} />}
    </>
  );
}
