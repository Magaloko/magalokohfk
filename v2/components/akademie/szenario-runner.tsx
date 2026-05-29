"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Confetti } from "./confetti";
import { ResultRewards } from "./result-rewards";
import type { Szenario } from "@/lib/akademie";
import { Icon } from "@/components/icon";

type Step = { prompt: string; options: { text: string; feedback?: string }[]; correctIdx: number };

function tgHaptic(kind: "success" | "error") {
  try { (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred(kind); } catch { /* ignore */ }
}

export function SzenarioRunner({ sc, personaName, onClose }: { sc: Szenario; personaName?: string; onClose: () => void }) {
  // Nur valide Schritte (≥2 Optionen, gültiger correctIdx). Reihenfolge bleibt (Story).
  const steps = useMemo<Step[]>(() => {
    return (sc.steps || [])
      .map((s) => ({
        prompt: s.prompt || "",
        options: (s.options || []).map((o) => ({ text: o.text || "", feedback: o.feedback })),
        correctIdx: Number.isInteger(s.correctIdx) ? (s.correctIdx as number) : 0,
      }))
      .filter((s) => s.options.length >= 2 && s.correctIdx >= 0 && s.correctIdx < s.options.length);
  }, [sc]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);

  const total = steps.length;
  const done = total > 0 && idx >= total;
  const step = steps[idx];

  const choose = (i: number) => {
    if (answered !== null || !step) return;
    setAnswered(i);
    const correct = i === step.correctIdx;
    tgHaptic(correct ? "success" : "error");
    if (correct) { setScore((s) => s + 1); setStreak((s) => { const ns = s + 1; setBest((b) => Math.max(b, ns)); return ns; }); }
    else setStreak(0);
  };
  const next = () => { setAnswered(null); setIdx((i) => i + 1); };
  const restart = () => { setIdx(0); setScore(0); setStreak(0); setBest(0); setAnswered(null); };

  // Tastatur: 1–9 / A–Z antworten, Enter/Leertaste = weiter, Escape = schließen.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (done || !step) return;
      if (answered === null) {
        const num = parseInt(e.key, 10);
        if (Number.isInteger(num) && num >= 1 && num <= step.options.length) { e.preventDefault(); choose(num - 1); return; }
        if (e.key.length === 1) { const l = e.key.toLowerCase().charCodeAt(0) - 97; if (l >= 0 && l < step.options.length) { e.preventDefault(); choose(l); } }
      } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, idx, done, step, onClose]);

  if (!steps.length) return <Modal onClose={onClose}><p className="text-center text-muted">Dieses Szenario hat noch keine spielbaren Schritte.</p><Done onClose={onClose} /></Modal>;

  if (done) {
    const pct = Math.round((score / total) * 100);
    const icon = pct === 100 ? "party" : pct >= 80 ? "star" : pct >= 60 ? "check" : "book";
    const msg = pct >= 80 ? "Hervorragend!" : pct >= 60 ? "Solide — Schwerpunkte nochmal anschauen." : "Vertiefe Einwände & Personas und versuch es nochmal.";
    return (
      <Modal onClose={onClose}>
        {pct >= 80 && <Confetti intensity={pct === 100 ? 1.4 : 1} />}
        <div className="text-center">
          <div className="flex justify-center"><Icon name={icon} className="h-10 w-10" /></div>
          <div className="mt-2 text-3xl font-extrabold">{score}<span className="text-lg text-muted">/{total}</span></div>
          <div className="text-muted">{pct}%{best >= 2 ? <> · <Icon name="flame" className="h-4 w-4 inline-block" /> beste Serie {best}</> : ""}</div>
          <p className="mt-4 text-sm text-muted">{msg}</p>
          <ResultRewards type="szenario" score={score} total={total} />
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={restart} className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg"><Icon name="repeat" className="h-4 w-4 inline-block mr-1" />Nochmal</button>
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold"><Icon name="check" className="h-4 w-4 inline-block mr-1" />Fertig</button>
          </div>
        </div>
      </Modal>
    );
  }

  const progress = (idx / total) * 100;

  return (
    <Modal onClose={onClose}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-bold">{sc.name || "Szenario"}</h3>
        <button onClick={onClose} aria-label="Schließen" className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-muted hover:text-ink"><Icon name="x" className="h-4 w-4" /></button>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted-2">Schritt {idx + 1}/{total}{personaName ? ` · ${personaName}` : ""}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 font-semibold inline-flex items-center gap-1", streak >= 3 ? "bg-amber/20 text-amber" : "bg-surface-2 text-muted")}><Icon name="check" className="h-3 w-3" /> {score} · <Icon name="flame" className="h-3 w-3" /> {streak}</span>
      </div>
      <p className="mb-4 whitespace-pre-wrap font-semibold">{step.prompt}</p>
      <div className="flex flex-col gap-2">
        {step.options.map((o, i) => {
          const show = answered !== null;
          const tone = show && i === step.correctIdx ? "border-green bg-green/10"
            : show && i === answered && i !== step.correctIdx ? "border-red bg-red/10"
            : "border-line hover:border-accent";
          return (
            <button key={i} disabled={show} onClick={() => choose(i)}
              className={cn("rounded-lg border px-4 py-3 text-left text-sm transition", tone, show && "cursor-default")}>
              <span className="mr-2 font-mono text-muted-2">{String.fromCharCode(65 + i)}</span>{o.text}
            </button>
          );
        })}
      </div>
      {answered !== null && (
        <div className="mt-3">
          <div className={cn("rounded-lg px-3 py-2 text-sm", answered === step.correctIdx ? "bg-green/10 text-green" : "bg-red/10 text-red")}>
            {answered === step.correctIdx ? <Icon name="check" className="h-4 w-4 inline-block mr-1" /> : <Icon name="x" className="h-4 w-4 inline-block mr-1" />}{step.options[answered].feedback || (answered === step.correctIdx ? "Richtig!" : "Leider falsch.")}
          </div>
          {answered !== step.correctIdx && step.options[step.correctIdx].feedback && (
            <div className="mt-2 rounded-lg border-l-2 border-accent bg-surface-2 px-3 py-2 text-sm text-muted">
              <Icon name="bulb" className="h-4 w-4 inline-block mr-1" />Beste Antwort ({String.fromCharCode(65 + step.correctIdx)}): {step.options[step.correctIdx].feedback}
            </div>
          )}
          <button onClick={next} className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-bg">
            {idx === total - 1 ? "Ergebnis →" : "Nächster Schritt →"}
          </button>
        </div>
      )}
    </Modal>
  );
}

function Done({ onClose }: { onClose: () => void }) {
  return <div className="mt-4 text-center"><button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold">Schließen</button></div>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-2xl">{children}</div>
    </div>
  );
}
