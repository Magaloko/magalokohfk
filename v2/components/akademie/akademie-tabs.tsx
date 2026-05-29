"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS: { area: string; label: string; adminOnly?: boolean }[] = [
  { area: "angebote", label: "Angebote" },
  { area: "personas", label: "Personas" },
  { area: "einwaende", label: "Einwände" },
  { area: "szenarien", label: "Szenarien" },
  { area: "drills", label: "Drills" },
  { area: "rollenspiele", label: "Rollenspiele" },
  { area: "marken", label: "Marken" },
  { area: "mitarbeiter", label: "Mitarbeiter", adminOnly: true },
];

export function AkademieTabs({ allowed, isAdmin }: { allowed: string[]; isAdmin: boolean }) {
  const pathname = usePathname();
  const tabs = TABS.filter((t) => (t.adminOnly ? isAdmin : isAdmin || allowed.includes(t.area)));
  return (
    <div className="sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {tabs.map((t) => {
          const href = `/akademie/${t.area}`;
          const active = pathname === href;
          return (
            <Link key={t.area} href={href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                active ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
              )}>{t.label}</Link>
          );
        })}
      </div>
    </div>
  );
}
