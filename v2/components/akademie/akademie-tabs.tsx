"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";

const TABS: { area: string; label: string; adminOnly?: boolean; always?: boolean }[] = [
  { area: "lernpfade", label: "Lernpfade", always: true },
  { area: "angebote", label: "Angebote" },
  { area: "personas", label: "Personas" },
  { area: "einwaende", label: "Einwände" },
  { area: "szenarien", label: "Szenarien" },
  { area: "drills", label: "Übungen" },
  { area: "rollenspiele", label: "Rollenspiele" },
  { area: "marken", label: "Marken" },
  { area: "mitarbeiter", label: "Mitarbeiter", adminOnly: true },
];

export function AkademieTabs({ allowed, isAdmin }: { allowed: string[]; isAdmin: boolean }) {
  const pathname = usePathname();
  const tabs = TABS.filter((t) => t.always || (t.adminOnly ? isAdmin : isAdmin || allowed.includes(t.area)));

  // Zuletzt besuchte Sektion merken (für „Weitermachen" auf dem Hub).
  useEffect(() => {
    const m = pathname.match(/^\/akademie\/([^/]+)/);
    if (m && m[1]) { try { localStorage.setItem("mag_ak_last", m[1]); } catch { /* ignore */ } }
  }, [pathname]);

  const overviewActive = pathname === "/akademie";
  return (
    <>
      <div className="hidden md:block sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/akademie"
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition inline-flex items-center min-h-11",
              overviewActive ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
            )}><span className="flex items-center gap-1"><Icon name="academy" className="h-4 w-4" />Übersicht</span></Link>
          {tabs.map((t) => {
            const href = `/akademie/${t.area}`;
            const active = pathname === href;
            return (
              <Link key={t.area} href={href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition inline-flex items-center min-h-11",
                  active ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
                )}>{t.area === "lernpfade" ? <span className="flex items-center gap-1"><Icon name="compass" className="h-4 w-4" />{t.label}</span> : t.label}</Link>
            );
          })}
        </div>
      </div>
      {!overviewActive && (
        <div className="md:hidden sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-2">
            <Link href="/akademie" className="inline-flex items-center gap-1 min-h-11 text-sm font-semibold text-accent">
              <Icon name="academy" className="h-4 w-4" />← VEKTRA-Übersicht
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
