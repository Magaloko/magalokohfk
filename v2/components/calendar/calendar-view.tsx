"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NewEventButton, EventEditButton } from "./event-editor";
import type { Task, Decision, WeeklyKpi, CalendarEvent, Lever, StaffMember } from "@/lib/cockpit";

type Tone = "accent" | "amber" | "red" | "green" | "teal" | "muted";
type Item = { date: string; time?: string; title: string; kindLabel: string; tone: Tone; href?: string; event?: CalendarEvent; sort: number };

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const toneChip: Record<Tone, string> = {
  accent: "bg-accent/15 text-accent", amber: "bg-amber/15 text-amber", red: "bg-red/15 text-red",
  green: "bg-green/15 text-green", teal: "bg-teal/15 text-teal", muted: "bg-surface-2 text-muted",
};
const toneDot: Record<Tone, string> = {
  accent: "bg-accent", amber: "bg-amber", red: "bg-red", green: "bg-green", teal: "bg-teal", muted: "bg-muted-2",
};

export function CalendarView({ events, tasks, decisions, kpis, levers, staff, today }: {
  events: CalendarEvent[]; tasks: Task[]; decisions: Decision[]; kpis: WeeklyKpi[]; levers: Lever[]; staff: StaffMember[]; today: string;
}) {
  const now = parse(today);
  const [vy, setVy] = useState(now.getFullYear());
  const [vm, setVm] = useState(now.getMonth());
  const [sel, setSel] = useState(today);

  const byDate = useMemo(() => {
    const map: Record<string, Item[]> = {};
    const push = (date: string | undefined, it: Omit<Item, "date">) => {
      if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return;
      const d = date.slice(0, 10);
      (map[d] ||= []).push({ date: d, ...it });
    };
    const eKind: Record<string, Tone> = { Termin: "accent", Erinnerung: "teal", Deadline: "red", Block: "muted" };
    for (const e of events) push(e.date, { title: e.title || "Termin", time: e.time, kindLabel: e.kind || "Termin", tone: eKind[e.kind || ""] || "accent", event: e, sort: 0 });
    for (const t of tasks) if ((t.status || "") !== "Erledigt") push(t.dueDate, { title: t.title || "Aufgabe", kindLabel: "Aufgabe", tone: (t.dueDate || "") < today ? "red" : "amber", href: `/cockpit/tasks/${encodeURIComponent(t.id || String(tasks.indexOf(t)))}`, sort: 1 });
    for (const d of decisions) if ((d.status || "offen") !== "entschieden" && d.status !== "verworfen") push(d.frist, { title: d.titel || "Entscheidung", kindLabel: "Entscheidung", tone: (d.frist || "") < today ? "red" : "accent", href: `/cockpit/entscheidungen/${encodeURIComponent(d.id || String(decisions.indexOf(d)))}`, sort: 2 });
    for (const k of kpis) push(k.weekStart, { title: `KPI-Woche${k.weekLabel ? " · " + k.weekLabel : ""}`, kindLabel: "KPI", tone: "teal", href: "/cockpit/kpis", sort: 3 });
    for (const l of levers) {
      if (l.status === "Verworfen") continue;
      const href = `/cockpit/hebel/${encodeURIComponent(l.id || String(levers.indexOf(l)))}`;
      if (l.startDate) push(l.startDate, { title: `🎚 Start: ${l.title || "Hebel"}`, kindLabel: "Hebel-Start", tone: "accent", href, sort: 4 });
      if (l.finishDate) push(l.finishDate, { title: `🎚 Ziel: ${l.title || "Hebel"}`, kindLabel: "Hebel-Ziel", tone: (l.finishDate < today && l.status !== "Live") ? "red" : "teal", href, sort: 4 });
    }
    for (const m of staff) for (const c of m.completedScenarios || []) {
      push(c.completedAt, { title: `👤 ${m.name || "?"}: ${c.titel || "Training"}${typeof c.score === "number" ? ` (${c.score}%)` : ""}`, kindLabel: "Training", tone: "green", href: "/akademie/mitarbeiter", sort: 5 });
    }
    for (const d of Object.keys(map)) map[d].sort((a, b) => a.sort - b.sort || (a.time || "").localeCompare(b.time || ""));
    return map;
  }, [events, tasks, decisions, kpis, levers, staff, today]);

  // 42 Zellen (6 Wochen), Montag-basiert.
  const cells = useMemo(() => {
    const first = new Date(vy, vm, 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(vy, vm, 1 - offset);
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [vy, vm]);

  const monthLabel = new Date(vy, vm, 1).toLocaleDateString("de-AT", { month: "long", year: "numeric" });
  const selItems = byDate[sel] || [];
  const selLabel = parse(sel).toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const go = (delta: number) => { const d = new Date(vy, vm + delta, 1); setVy(d.getFullYear()); setVm(d.getMonth()); };
  const goToday = () => { setVy(now.getFullYear()); setVm(now.getMonth()); setSel(today); };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      {/* Kalenderblatt */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={() => go(-1)} className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm hover:text-ink" aria-label="Vorheriger Monat">‹</button>
            <button onClick={() => go(1)} className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm hover:text-ink" aria-label="Nächster Monat">›</button>
            <button onClick={goToday} className="ml-1 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink">Heute</button>
          </div>
          <h2 className="text-base font-bold capitalize">{monthLabel}</h2>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WD.map((w) => <div key={w} className="px-1 py-1 text-center text-[11px] font-semibold uppercase text-muted-2">{w}</div>)}
          {cells.map((d) => {
            const ds = ymd(d);
            const inMonth = d.getMonth() === vm;
            const items = byDate[ds] || [];
            const isToday = ds === today;
            const isSel = ds === sel;
            return (
              <button key={ds} onClick={() => setSel(ds)}
                className={cn(
                  "flex min-h-[68px] flex-col gap-1 rounded-lg border p-1.5 text-left transition",
                  isSel ? "border-accent bg-accent/5" : "border-line hover:border-accent/40",
                  !inMonth && "opacity-40",
                )}>
                <span className={cn("text-xs font-semibold", isToday ? "grid h-5 w-5 place-items-center rounded-full bg-accent text-bg" : "text-muted")}>{d.getDate()}</span>
                <span className="flex flex-col gap-0.5">
                  {items.slice(0, 2).map((it, i) => (
                    <span key={i} className={cn("truncate rounded px-1 py-0.5 text-[10px] font-medium", toneChip[it.tone])}>{it.title}</span>
                  ))}
                  {items.length > 2 && <span className="px-1 text-[10px] text-muted-2">+{items.length - 2} mehr</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-2">
          <Legend tone="accent" label="Termin / Entscheidung / Hebel-Start" />
          <Legend tone="teal" label="Erinnerung / KPI / Hebel-Ziel" />
          <Legend tone="amber" label="Aufgabe fällig" />
          <Legend tone="green" label="Mitarbeiter-Training" />
          <Legend tone="red" label="Überfällig / Deadline" />
        </div>
      </div>

      {/* Tages-Detail */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold capitalize">{selLabel}</h3>
          <NewEventButton presetDate={sel} />
        </div>
        {selItems.length ? (
          <ul className="flex flex-col gap-2">
            {selItems.map((it, i) => (
              <li key={i} className="rounded-lg border border-line bg-surface-2/40 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm">
                    <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", toneDot[it.tone])} />
                    <span>
                      {it.href ? <Link href={it.href} className="font-medium hover:text-accent">{it.title}</Link> : <span className="font-medium">{it.title}</span>}
                      <span className="ml-1 text-xs text-muted-2">· {it.kindLabel}{it.time ? ` · ${it.time}` : ""}</span>
                    </span>
                  </span>
                  {it.event && <EventEditButton event={it.event} />}
                </div>
                {it.event?.notes && <p className="mt-1 pl-4 text-xs text-muted">{it.event.notes}</p>}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-2">Nichts an diesem Tag. „+ Termin" legt einen an.</p>}
      </div>
    </div>
  );
}

function Legend({ tone, label }: { tone: Tone; label: string }) {
  return <span className="inline-flex items-center gap-1"><span className={cn("h-2 w-2 rounded-full", toneDot[tone])} />{label}</span>;
}
