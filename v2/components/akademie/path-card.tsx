"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Confetti } from "./confetti";
import { Icon } from "@/components/icon";
import type { LearnPath } from "@/lib/paths";

// initial = manuell abgehakte (Lese-)Schritte; autoDone = durch Training erfüllte Schritt-Indizes.
export function PathCard({ path, initial, autoDone = [] }: { path: LearnPath; initial: number[]; autoDone?: number[] }) {
  const [done, setDone] = useState<Set<number>>(new Set(initial));
  const [busy, setBusy] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const auto = new Set(autoDone);
  const isAuto = (i: number) => !!path.steps[i].auto?.length;
  const stepDone = (i: number) => (isAuto(i) ? auto.has(i) : done.has(i));
  const total = path.steps.length;
  const completed = path.steps.reduce((n, _s, i) => n + (stepDone(i) ? 1 : 0), 0);
  const pct = Math.round((completed / total) * 100);
  const finished = completed >= total;

  async function toggle(step: number) {
    if (busy != null || isAuto(step)) return; // auto-Schritte sind nicht manuell umschaltbar
    const willDone = !done.has(step);
    const optimistic = new Set(done);
    if (willDone) optimistic.add(step); else optimistic.delete(step);
    setDone(optimistic);
    setBusy(step);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const init = (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData) || "";
    if (init) headers["X-Tg-Init"] = init;
    const r = await fetch("/api/akademie/path", { method: "POST", headers, body: JSON.stringify({ pathId: path.id, step, done: willDone }) })
      .then((res) => (res.ok ? res.json() : null)).catch(() => null);
    setBusy(null);
    if (r?.steps) setDone(new Set(r.steps));
    if (r?.justCompleted) setCelebrate(true);
  }

  return (
    <section className={cn("rounded-xl border bg-surface p-4 shadow-sm transition", finished ? "border-green/40" : "border-line")}>
      {celebrate && <Confetti intensity={1.2} />}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon name={path.icon} className="h-5 w-5 shrink-0" />
          <div>
            <h3 className="font-bold">{path.title}</h3>
            <p className="mt-0.5 text-xs text-muted">{path.desc}</p>
          </div>
        </div>
        {finished
          ? <span className="shrink-0 rounded-full bg-green/15 px-3 py-1 text-xs font-semibold text-green flex items-center gap-1"><Icon name="check" className="h-4 w-4" /> Abgeschlossen · +60 XP</span>
          : <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted">{completed}/{total}</span>}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className={cn("h-full rounded-full transition-all", finished ? "bg-green" : "bg-accent")} style={{ width: `${pct}%` }} />
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {path.steps.map((s, i) => {
          const dn = stepDone(i);
          const autoStep = isAuto(i);
          return (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-line bg-surface-2/40 px-3 py-2">
              {autoStep ? (
                <span title={dn ? "Durch Training erfüllt" : "Erst das Training absolvieren"}
                  className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs", dn ? "border-green bg-green text-bg" : "border-line text-muted-2")}>
                  {dn ? <Icon name="check" className="h-3 w-3" /> : <Icon name="bolt" className="h-3 w-3" />}
                </span>
              ) : (
                <button onClick={() => toggle(i)} disabled={busy != null}
                  aria-label={dn ? "Als offen markieren" : "Als erledigt markieren"}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg transition disabled:opacity-50">
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs",
                    dn ? "border-green bg-green text-bg" : "border-line text-muted-2 hover:border-accent")}>
                    {dn ? <Icon name="check" className="h-3 w-3" /> : i + 1}
                  </span>
                </button>
              )}
              <div className="min-w-0 flex-1">
                <div className={cn("text-sm font-medium", dn && "text-muted line-through")}>{s.title}</div>
                {s.hint && <div className="text-xs text-muted-2">{s.hint}</div>}
                {autoStep && <div className={cn("text-[11px] font-semibold", dn ? "text-green" : "text-amber")}>{dn ? "durch Training erfüllt" : "Training nötig"}</div>}
              </div>
              <Link href={s.href} className="shrink-0 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/10 min-h-10">Öffnen →</Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
