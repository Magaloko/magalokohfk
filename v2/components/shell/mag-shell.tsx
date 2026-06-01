"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";
import { IconButton } from "@/components/_primitives/icon-button";

type Hub = { href: string; label: string; icon: string; adminOnly?: boolean; superOnly?: boolean };
type Section = { title?: string; adminOnly?: boolean; items: Hub[] };

// Gruppierte Navigation. Sichtbarkeit weiter über adminOnly/superOnly je Eintrag.
// Sektions-Überschriften werden nur gerendert, wenn mind. ein Eintrag der Gruppe sichtbar ist.
const SECTIONS: Section[] = [
  { items: [
    { href: "/mastermind", label: "MasterMind", icon: "compass", adminOnly: true },
    { href: "/akademie", label: "VEKTRA", icon: "academy" },
  ] },
  { title: "Steuerung", adminOnly: true, items: [
    { href: "/heute", label: "Heute", icon: "home", adminOnly: true },
    { href: "/cockpit", label: "Lieferung", icon: "cockpit", adminOnly: true },
    { href: "/kalender", label: "Kalender", icon: "calendar", adminOnly: true },
  ] },
  { title: "Team", items: [
    { href: "/cockpilot", label: "Cockpilot", icon: "sparkles" },
    { href: "/werkstatt", label: "Werkstatt", icon: "bulb" },
  ] },
  { items: [
    { href: "/mago", label: "Mago", icon: "briefcase", superOnly: true },
    { href: "/einstellungen", label: "Einstellungen", icon: "settings", superOnly: true },
  ] },
];

export function MagShell({ role, superAdmin = false, children }: { role: string; superAdmin?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = role === "admin";
  const canSee = (h: Hub) => (h.superOnly ? superAdmin : !h.adminOnly || isAdmin);
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Pro Sektion nur sichtbare Einträge; Sektionen ohne sichtbare Einträge fallen weg.
  const sections = SECTIONS
    .map((s) => ({ ...s, items: s.items.filter(canSee) }))
    .filter((s) => s.items.length > 0);

  const Nav = (
    <nav className="flex flex-col gap-1 p-3">
      {sections.map((s, i) => (
        <div key={s.title ?? `s${i}`} className="flex flex-col gap-1">
          {s.title && (
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted-2">{s.title}</div>
          )}
          {s.items.map((h) => (
            <Link key={h.href} href={h.href} onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                active(h.href) ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
              )}>
              <Icon name={h.icon} className="h-5 w-5" />{h.label}
            </Link>
          ))}
        </div>
      ))}
      <form action="/api/logout" method="post" className="mt-2">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-2 hover:bg-surface-2 hover:text-red">
          <Icon name="logout" className="h-5 w-5" />Abmelden
        </button>
      </form>
    </nav>
  );

  return (
    <div className="flex min-h-[var(--tg-vh,100vh)]">
      {/* Desktop-Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface md:block">
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/20 font-extrabold text-accent">M</div>
          <div><div className="text-sm font-extrabold">MasterMind</div><div className="text-xs text-muted-2">{isAdmin ? "Admin" : "VEKTRA"}</div></div>
        </div>
        {Nav}
      </aside>

      {/* Mobile-Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-line bg-surface">
            <div className="flex items-center justify-between px-4 py-5">
              <span className="font-extrabold">MasterMind</span>
              <IconButton icon="x" label="Schließen" onClick={() => setOpen(false)} size="lg" tone="default" iconClassName="h-6 w-6" className="-mr-2" />
            </div>
            {Nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar (mobil) */}
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <IconButton icon="menu" label="Menü" onClick={() => setOpen(true)} size="lg" tone="strong" iconClassName="h-6 w-6" className="-ml-2" />
          <span className="font-extrabold">MasterMind</span>
        </header>
        <main className="min-w-0 flex-1 pb-[env(safe-area-inset-bottom)]">{children}</main>
      </div>
    </div>
  );
}
