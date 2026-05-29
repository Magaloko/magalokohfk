"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";

type Hub = { href: string; label: string; icon: string; adminOnly?: boolean; superOnly?: boolean };
const HUBS: Hub[] = [
  { href: "/heute", label: "Heute", icon: "home", adminOnly: true },
  { href: "/kalender", label: "Kalender", icon: "calendar", adminOnly: true },
  { href: "/akademie", label: "Akademie", icon: "academy" },
  { href: "/cockpilot", label: "Cockpilot", icon: "sparkles" },
  { href: "/cockpit", label: "Cockpit", icon: "cockpit", adminOnly: true },
  { href: "/einstellungen", label: "Einstellungen", icon: "settings", superOnly: true },
];

export function MagShell({ role, superAdmin = false, children }: { role: string; superAdmin?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = role === "admin";
  const hubs = HUBS.filter((h) => (h.superOnly ? superAdmin : !h.adminOnly || isAdmin));
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const Nav = (
    <nav className="flex flex-col gap-1 p-3">
      {hubs.map((h) => (
        <Link key={h.href} href={h.href} onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
            active(h.href) ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
          )}>
          <Icon name={h.icon} className="h-5 w-5" />{h.label}
        </Link>
      ))}
      <form action="/api/logout" method="post" className="mt-2">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-2 hover:bg-surface-2 hover:text-red">
<Icon name="logout" className="h-5 w-5" />Abmelden
        </button>
      </form>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop-Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface md:block">
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/20 font-extrabold text-accent">M</div>
          <div><div className="text-sm font-extrabold">MAGALOKO</div><div className="text-xs text-muted-2">{isAdmin ? "Admin" : "Akademie"}</div></div>
        </div>
        {Nav}
      </aside>

      {/* Mobile-Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-line bg-surface">
            <div className="flex items-center justify-between px-4 py-5">
              <span className="font-extrabold">MAGALOKO</span>
              <button onClick={() => setOpen(false)} aria-label="Schließen" className="text-muted-2"><Icon name="x" className="h-5 w-5" /></button>
            </div>
            {Nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar (mobil) */}
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menü"><Icon name="menu" className="h-6 w-6" /></button>
          <span className="font-extrabold">MAGALOKO</span>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
