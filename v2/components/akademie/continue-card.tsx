"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

const LABELS: Record<string, string> = {
  angebote: "Angebote", personas: "Personas", einwaende: "Einwände", szenarien: "Szenarien",
  drills: "Tagesübungen", rollenspiele: "Rollenspiele", marken: "Marken-Bibel", mitarbeiter: "Mitarbeiter",
};

// Liest die zuletzt besuchte Akademie-Sektion (localStorage, vom AkademieTabs gesetzt).
export function ContinueCard({ allowed }: { allowed: string[] }) {
  const [area, setArea] = useState<string | null>(null);
  useEffect(() => {
    try {
      const a = localStorage.getItem("mag_ak_last");
      if (a && LABELS[a] && allowed.includes(a)) setArea(a);
    } catch { /* ignore */ }
  }, [allowed]);

  if (!area) return null;
  return (
    <Link href={`/akademie/${area}`}
      className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 transition hover:border-accent">
      <span className="text-sm font-semibold text-ink flex items-center gap-1.5"><Icon name="undo" className="h-4 w-4" /> Weitermachen: <span className="text-accent">{LABELS[area]}</span></span>
      <span className="text-accent">→</span>
    </Link>
  );
}
