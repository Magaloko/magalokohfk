"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { NewEventButton, EventEditButton } from "./event-editor";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Icon } from "@/components/icon";
import type { Task, Decision, CalendarEvent, StaffMember } from "@/lib/cockpit";

type Tone = "accent" | "amber" | "red" | "green" | "teal" | "muted";
type Drag = { collection: string; id: string; field: string; min?: string; max?: string };
type Item = { date: string; time?: string; title: string; kindLabel: string; tone: Tone; layer: string; href?: string; event?: CalendarEvent; sort: number; drag?: Drag };

type View = "week" | "2weeks" | "month" | "quarter" | "year";
const VIEWS: { id: View; label: string }[] = [
  { id: "week", label: "Arbeitswoche" },
  { id: "2weeks", label: "2 Wochen" },
  { id: "month", label: "Monat" },
  { id: "quarter", label: "3 Monate" },
  { id: "year", label: "Jahr" },
];
const LAYERS: { id: string; label: string; tone: Tone }[] = [
  { id: "termine", label: "Termine", tone: "accent" },
  { id: "aufgaben", label: "Aufgaben", tone: "amber" },
  { id: "entscheidungen", label: "Entscheidungen", tone: "accent" },
  { id: "training", label: "Training", tone: "green" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfWeek = (d: Date) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const toneChip: Record<Tone, string> = {
  accent: "bg-accent/15 text-accent", amber: "bg-amber/15 text-amber", red: "bg-red/15 text-red",
  green: "bg-green/15 text-green", teal: "bg-teal/15 text-teal", muted: "bg-surface-2 text-muted",
};
const toneDot: Record<Tone, string> = {
  accent: "bg-accent", amber: "bg-amber", red: "bg-red", green: "bg-green", teal: "bg-teal", muted: "bg-muted-2",
};

export function CalendarView({ events, tasks, decisions, staff, today }: {
  events: CalendarEvent[]; tasks: Task[]; decisions: Decision[]; staff: StaffMember[]; today: string;
}) {
  const router = useRouter();
  const now = parse(today);
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState<Date>(now);
  const [sel, setSel] = useState(today);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState<string | null>(null);
  const [layers, setLayers] = useState<Set<string>>(() => new Set(LAYERS.map((l) => l.id)));
  const [narrow, setNarrow] = useState(false); // schmale Screens (Handy / Telegram-Mini-App)
  const dragRef = useRef<(Drag & { from: string }) | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const { byDate } = useMemo(() => {
    const byDate: Record<string, Item[]> = {};
    const push = (date: string | undefined, it: Omit<Item, "date">) => {
      if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return;
      const d = date.slice(0, 10);
      (byDate[d] ||= []).push({ date: d, ...it });
    };
    const eKind: Record<string, Tone> = { Termin: "accent", Erinnerung: "teal", Deadline: "red", Block: "muted" };
    for (const e of events) push(e.date, { title: e.title || "Termin", time: e.time, kindLabel: e.kind || "Termin", tone: eKind[e.kind || ""] || "accent", layer: "termine", event: e, sort: 0, drag: e.id ? { collection: "calendarEvents", id: e.id, field: "date" } : undefined });
    for (const t of tasks) if ((t.status || "") !== "Erledigt") push(t.dueDate, { title: t.title || "Aufgabe", kindLabel: "Aufgabe", tone: (t.dueDate || "") < today ? "red" : "amber", layer: "aufgaben", href: `/cockpit/tasks/${encodeURIComponent(t.id || String(tasks.indexOf(t)))}`, sort: 1, drag: t.id ? { collection: "tasks", id: t.id, field: "dueDate" } : undefined });
    for (const d of decisions) if ((d.status || "offen") !== "entschieden" && d.status !== "verworfen") push(d.frist, { title: d.titel || "Entscheidung", kindLabel: "Entscheidung", tone: (d.frist || "") < today ? "red" : "accent", layer: "entscheidungen", href: `/cockpit/entscheidungen/${encodeURIComponent(d.id || String(decisions.indexOf(d)))}`, sort: 2, drag: d.id ? { collection: "stephanDecisions", id: d.id, field: "frist" } : undefined });
    for (const m of staff) for (const c of m.completedScenarios || []) {
      push(c.completedAt, { title: `${m.name || "?"}: ${c.titel || "Training"}${typeof c.score === "number" ? ` (${c.score}%)` : ""}`, kindLabel: "Training", tone: "green", layer: "training", href: "/akademie/mitarbeiter", sort: 5 });
    }
    for (const d of Object.keys(byDate)) byDate[d].sort((a, b) => a.sort - b.sort || (a.time || "").localeCompare(b.time || ""));
    return { byDate };
  }, [events, tasks, decisions, staff, today]);

  // --- Drag & Drop: Eintrag auf einen anderen Tag ziehen -> Datum aktualisieren ---
  async function move(to: string) {
    const dr = dragRef.current; dragRef.current = null; setOver(null);
    if (!dr || dr.from === to || busy) return;
    if (dr.min && to < dr.min) { alert("Datum darf nicht vor dem Minimalwert liegen."); return; }
    if (dr.max && to > dr.max) { alert("Datum darf nicht nach dem Maximalwert liegen."); return; }
    setBusy(true);
    const r = await cockpitMutate({ collection: dr.collection, action: "update", id: dr.id, patch: { [dr.field]: to } });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  const dnd = (drag: Drag | undefined, from: string) => (!drag || busy) ? {} : {
    draggable: true,
    onDragStart: (e: React.DragEvent) => { dragRef.current = { ...drag, from }; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", drag.id); },
    onDragEnd: () => { dragRef.current = null; setOver(null); },
  };
  const cellDrop = (ds: string) => ({
    onDragOver: (e: React.DragEvent) => { if (dragRef.current) { e.preventDefault(); if (over !== ds) setOver(ds); } },
    onDragLeave: () => { if (over === ds) setOver(null); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); move(ds); },
  });
  const layerOn = (id: string) => layers.has(id);
  const toggleLayer = (id: string) => setLayers((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // --- Eine Tageszelle rendern ---
  function renderDay(d: Date, opts: { dim?: boolean; size: "lg" | "md" | "sm"; maxChips?: number; dots?: boolean }) {
    const ds = ymd(d);
    const pts = (byDate[ds] || []).filter((it) => layerOn(it.layer));
    const isToday = ds === today, isSel = ds === sel, isOver = over === ds;
    const maxChips = opts.maxChips ?? 2;
    const h = opts.size === "lg" ? "min-h-[78px]" : opts.size === "md" ? "min-h-[52px]" : "min-h-[30px]";
    return (
      <button key={ds} onClick={() => setSel(ds)} {...cellDrop(ds)}
        className={cn(
          "flex flex-col gap-1 rounded-lg border p-1.5 text-left transition", h,
          isOver ? "border-accent bg-accent/20 ring-1 ring-accent" : isSel ? "border-accent bg-accent/5" : "border-line hover:border-accent/40",
          opts.dim && "opacity-40",
        )}>
        <span className={cn("text-[11px] font-semibold leading-none", isToday ? "grid h-5 w-5 place-items-center rounded-full bg-accent text-bg" : "text-muted")}>{d.getDate()}</span>
        {opts.dots ? (
          pts.length > 0 && <span className="flex flex-wrap gap-0.5">{pts.map((p) => p.tone).slice(0, 5).map((tn, i) => <span key={i} className={cn("h-1.5 w-1.5 rounded-full", toneDot[tn])} />)}</span>
        ) : (
          <span className="flex flex-col gap-0.5">
            {pts.slice(0, maxChips).map((it, i) => (
              <span key={`p${i}`} {...dnd(it.drag, it.date)} title={it.title}
                className={cn("truncate rounded px-1 py-0.5 text-[10px] font-medium", toneChip[it.tone], it.drag && !busy && "cursor-grab active:cursor-grabbing")}>{it.title}</span>
            ))}
            {pts.length > maxChips && <span className="px-1 text-[10px] text-muted-2">+{pts.length - maxChips} mehr</span>}
          </span>
        )}
      </button>
    );
  }

  // --- Ein Monats-Block (fuer Monat / 3 Monate / Jahr) ---
  function monthBlock(year: number, month: number, size: "lg" | "md" | "sm", maxChips: number, dots = false, framed = false) {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks = size === "lg" ? 6 : Math.ceil((offset + daysInMonth) / 7);
    const start = addDays(first, -offset);
    const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
    return (
      <div key={`${year}-${month}`} className={cn(framed && "rounded-lg border border-line p-2")}>
        {framed && <div className="mb-1 text-center text-xs font-bold capitalize">{first.toLocaleDateString("de-AT", { month: "long" })}</div>}
        <div className={cn("grid grid-cols-7 gap-1", size === "lg" && "sm:min-w-[480px]")}>
          {size !== "sm" && WD.map((w) => <div key={w} className="px-0.5 py-0.5 text-center text-[10px] font-semibold uppercase text-muted-2">{w}</div>)}
          {cells.map((d) => renderDay(d, { dim: d.getMonth() !== month, size, maxChips, dots }))}
        </div>
      </div>
    );
  }

  // --- Tage-Streifen (fuer Arbeitswoche / 2 Wochen) ---
  function dayStrip(days: Date[], header: string[], cols: 5 | 7, maxChips: number, dots = false) {
    return (
      <div className={cn("grid gap-1", cols === 5 ? "grid-cols-5 sm:min-w-[460px]" : "grid-cols-7 sm:min-w-[560px]")}>
        {header.map((w) => <div key={w} className="px-1 py-1 text-center text-[11px] font-semibold uppercase text-muted-2">{w}</div>)}
        {days.map((d) => renderDay(d, { size: "lg", maxChips, dots }))}
      </div>
    );
  }

  // --- Navigation + Periodenbeschriftung je Ansicht ---
  const step = (dir: number) => {
    const d = new Date(anchor);
    if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else if (view === "2weeks") d.setDate(d.getDate() + 14 * dir);
    else if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "quarter") d.setMonth(d.getMonth() + 3 * dir);
    else d.setFullYear(d.getFullYear() + dir);
    setAnchor(d);
  };
  const goToday = () => { setAnchor(now); setSel(today); };
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("de-AT", o);

  let body: React.ReactNode;
  let periodLabel = "";
  if (view === "week") {
    const mo = startOfWeek(anchor);
    body = dayStrip(Array.from({ length: 5 }, (_, i) => addDays(mo, i)), WD.slice(0, 5), 5, narrow ? 2 : 4);
    periodLabel = `${fmt(mo, { day: "numeric", month: "short" })} – ${fmt(addDays(mo, 4), { day: "numeric", month: "short", year: "numeric" })}`;
  } else if (view === "2weeks") {
    const mo = startOfWeek(anchor);
    body = dayStrip(Array.from({ length: 14 }, (_, i) => addDays(mo, i)), WD, 7, narrow ? 0 : 3, narrow);
    periodLabel = `${fmt(mo, { day: "numeric", month: "short" })} – ${fmt(addDays(mo, 13), { day: "numeric", month: "short", year: "numeric" })}`;
  } else if (view === "month") {
    // Handy: kompakte Punkte-Darstellung (Details per Tipp); Desktop: Text-Kuerzel.
    body = narrow ? monthBlock(anchor.getFullYear(), anchor.getMonth(), "md", 0, true) : monthBlock(anchor.getFullYear(), anchor.getMonth(), "lg", 2);
    periodLabel = fmt(new Date(anchor.getFullYear(), anchor.getMonth(), 1), { month: "long", year: "numeric" });
  } else if (view === "quarter") {
    const b = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const months = [0, 1, 2].map((o) => new Date(b.getFullYear(), b.getMonth() + o, 1));
    body = narrow
      ? <div className="flex flex-col gap-4">{months.map((m) => monthBlock(m.getFullYear(), m.getMonth(), "md", 0, true, true))}</div>
      : <div className="flex flex-col gap-4">{months.map((m) => monthBlock(m.getFullYear(), m.getMonth(), "md", 2, false, true))}</div>;
    periodLabel = `${fmt(b, { month: "short" })} – ${fmt(new Date(b.getFullYear(), b.getMonth() + 2, 1), { month: "short", year: "numeric" })}`;
  } else {
    body = <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 12 }, (_, m) => monthBlock(anchor.getFullYear(), m, "sm", 0, true, true))}</div>;
    periodLabel = String(anchor.getFullYear());
  }

  const selPts = (byDate[sel] || []).filter((it) => layerOn(it.layer));
  const selLabel = parse(sel).toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      {/* Kalenderblatt */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button onClick={() => step(-1)} className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm hover:text-ink" aria-label="Zurueck">&#8249;</button>
              <button onClick={() => step(1)} className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm hover:text-ink" aria-label="Weiter">&#8250;</button>
              <button onClick={goToday} className="ml-1 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink">Heute</button>
            </div>
            <h2 className="text-base font-bold capitalize">{periodLabel}</h2>
          </div>
          <div className="flex flex-wrap gap-1">
            {VIEWS.map((v) => (
              <button key={v.id} onClick={() => setView(v.id)}
                className={cn("rounded-lg px-2.5 py-1.5 text-xs font-semibold transition", view === v.id ? "bg-accent text-bg" : "bg-surface-2 text-muted hover:text-ink")}>{v.label}</button>
            ))}
          </div>
        </div>

        <div className={cn("overflow-x-auto transition", busy && "pointer-events-none opacity-60")} aria-busy={busy}>{body}</div>

        {/* Ebenen-Filter (klickbare Legende) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {LAYERS.map((l) => {
            const on = layerOn(l.id);
            return (
              <button key={l.id} onClick={() => toggleLayer(l.id)} aria-pressed={on}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                  on ? "border-line bg-surface-2 text-ink" : "border-line bg-transparent text-muted-2 opacity-60 line-through")}>
                <span className={cn("h-2 w-2 rounded-full", on ? toneDot[l.tone] : "bg-muted-2")} />{l.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-2"><Icon name="arrow-right" className="h-3 w-3" />Tipp: Einträge per Drag &amp; Drop verschieben{busy ? " · speichert …" : ""}.</p>
      </div>

      {/* Tages-Detail */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold capitalize">{selLabel}</h3>
          <NewEventButton presetDate={sel} />
        </div>
        {selPts.length ? (
          <ul className="flex flex-col gap-2">
            {selPts.map((it, i) => (
              <li key={`p${i}`} className="rounded-lg border border-line bg-surface-2/40 p-2.5">
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
        ) : <p className="text-sm text-muted-2">Nichts an diesem Tag. &bdquo;+ Termin&ldquo; legt einen an.</p>}
      </div>
    </div>
  );
}
