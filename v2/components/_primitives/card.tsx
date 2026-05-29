import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent/40", className)}>
      {children}
    </div>
  );
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "accent" | "green" | "amber" | "red" | "teal" }) {
  const tones: Record<string, string> = {
    muted: "bg-surface-2 text-muted",
    accent: "bg-accent/15 text-accent",
    green: "bg-green/15 text-green",
    amber: "bg-amber/15 text-amber",
    red: "bg-red/15 text-red",
    teal: "bg-teal/15 text-teal",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}
