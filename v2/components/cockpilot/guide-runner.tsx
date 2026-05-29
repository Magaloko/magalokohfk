"use client";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { GuideStep } from "@/lib/copilot-kb";

export function GuideRunner({ guideId, steps, initialDone }: { guideId: string; steps: GuideStep[]; initialDone: number[] }) {
  const [done, setDone] = useState<Set<number>>(new Set(initialDone));
  const [busy, setBusy] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const total = steps.length;
  const completed = done.size;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  async function toggle(i: number) {
    if (busy !== null) return;
    const want = !done.has(i);
    setBusy(i);
    // optimistisch
    const optimistic = new Set(done); want ? optimistic.add(i) : optimistic.delete(i);
    setDone(optimistic);
    try {
      const r = await fetch("/api/cockpilot/step", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guideId, step: i, done: want }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && Array.isArray(j.steps)) {
        setDone(new Set<number>(j.steps));
        if (j.justCompleted) { setCelebrate(true); setTimeout(() => setCelebrate(false), 2600); }
      } else {
        setDone(done); // zurückrollen
      }
    } catch { setDone(done); }
    setBusy(null);
  }
  async function copy(text: string, i: number) {
    try { await navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 1500); } catch { /* noop */ }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Fortschritt */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">{completed}/{total} Schritten erledigt</span>
          <span className="text-muted-2">{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        {celebrate && (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-green/10 px-3 py-2 text-sm font-semibold text-green">
            <Icon name="party" className="h-4 w-4" />Guide abgeschlossen! +60 XP — stark.
          </p>
        )}
      </div>

      {/* Schritte */}
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => {
          const isDone = done.has(i);
          return (
            <li key={i} className={cn("rounded-xl border bg-surface p-4 shadow-sm transition", isDone ? "border-green/40" : "border-line")}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggle(i)} disabled={busy !== null} aria-pressed={isDone}
                  className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition disabled:opacity-50",
                    isDone ? "border-green bg-green text-bg" : "border-line text-transparent hover:border-accent")}>
                  <Icon name="check" className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-surface-2 text-[11px] font-bold text-muted-2">{i + 1}</span>
                    <h3 className={cn("font-semibold", isDone && "text-muted-2 line-through")}>{s.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted">{s.detail}</p>
                  {s.prompt && (
                    <div className="mt-2 rounded-lg border border-line bg-surface-2/50 p-2.5">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-muted-2">Prompt zum Kopieren</span>
                        <button onClick={() => copy(s.prompt!, i)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:opacity-80">
                          <Icon name={copied === i ? "check" : "copy"} className="h-3 w-3" />{copied === i ? "Kopiert" : "Kopieren"}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-sm italic text-ink">„{s.prompt}“</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
