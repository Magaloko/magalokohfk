"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";

// Klappt seinen Inhalt NUR am Handy ein (Toggle). Auf Desktop (md+) immer offen, kein Toggle
// → keine Desktop-Regression. Für Seiten, deren lange Liste mobil sekundär ist (z. B. Drills).
export function CollapsibleOnMobile({ title, children, defaultOpen = false }:
  { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="md:hidden mb-3 inline-flex min-h-11 w-full items-center justify-between rounded-lg border border-line bg-surface px-4 text-sm font-semibold">
        <span>{open ? "Einklappen" : title}</span>
        <Icon name="arrow-right" className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
      </button>
      <div className={cn(open ? "block" : "hidden", "md:block")}>{children}</div>
    </div>
  );
}
