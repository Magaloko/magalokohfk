"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Confetti } from "./confetti";
import type { LearnPath } from "@/lib/paths";

export function PathCard({ path, initial }: { path: LearnPath; initial: number[] }) {
  const [done, setDone] = useState<Set<number>>(new Set(initial));
  const [busy, setBusy] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const total = path.steps.length;
  const completed = done.size;
  const pct = Math.round((completed / total) * 100);
  const finished = completed >= total;

  async function toggle(step: number) {
    if (busy != null) return;
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
          <span className="text-2xl">{path.icon}</span>
          <div>
            <h3 className="font-bold">{path.title}</h3>
            <p className="mt-0.5 text-xs text-muted">{path.desc}</p>
          </div>
        </div>
        {finished
          ? <span className="shrink-0 rounded-full bg-green/15 px-3 py-1 text-xs font-semibold text-green">✓ Abgeschlossen · +60 XP</span>
          : <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted">{completed}/{total}</span>}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className={cn("h-full rounded-full transition-all", finished ? "bg-green" : "bg-accent")} style={{ width: `${pct}%` }} />
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {path.steps.map((s, i) => {
          const isDone = done.has(i);
          return (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-line bg-surface-2/40 px-3 py-2">
              <button onClick={() => toggle(i)} disabled={busy != null}
                aria-label={isDone ? "Als offen markieren" : "Als erledigt markieren"}
                className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs transition disabled:opacity-50",
                  isDone ? "border-green bg-green text-bg" : "border-line text-muted-2 hover:border-accent")}>
                {isDone ? "✓" : i + 1}
              </button>
              <div className="min-w-0 flex-1">
                <div className={cn("text-sm font-medium", isDone && "text-muted line-through")}>{s.title}</div>
                {s.hint && <div className="text-xs text-muted-2">{s.hint}</div>}
              </div>
              <Link href={s.href} className="shrink-0 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10">Öffnen →</Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
