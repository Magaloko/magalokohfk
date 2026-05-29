import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EmptyState } from "./empty-state";

export type Column<T> = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
  hideOnMobile?: boolean;
  className?: string;
};

// Generische Tabelle (Desktop) + Karten-Stack (Mobile). Rein präsentational (server-tauglich).
export function DataTable<T>({
  columns, rows, getKey, empty,
}: { columns: Column<T>[]; rows: T[]; getKey: (row: T, i: number) => string; empty?: { title: string; hint?: ReactNode } }) {
  if (!rows.length) return <EmptyState title={empty?.title || "Nichts vorhanden"} hint={empty?.hint} />;
  const alignCls = (a?: string) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left");
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {/* Desktop */}
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted-2">
            {columns.map((c) => (
              <th key={c.key} className={cn("px-4 py-3 font-semibold", alignCls(c.align))}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={getKey(row, i)} className="border-b border-line/60 last:border-0 hover:bg-surface-2/40">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3 align-top", alignCls(c.align), c.className)}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Mobile: gestapelt & linksbündig — lange Werte bleiben lesbar */}
      <ul className="divide-y divide-line/60 sm:hidden">
        {rows.map((row, i) => (
          <li key={getKey(row, i)} className="p-4">
            {columns.filter((c) => !c.hideOnMobile).map((c) => (
              <div key={c.key} className="mb-2.5 last:mb-0">
                <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-2">{c.label}</span>
                <span className="block text-sm">{c.render(row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
