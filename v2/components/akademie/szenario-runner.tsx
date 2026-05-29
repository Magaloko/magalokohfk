"use client";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { Szenario } from "@/lib/akademie";

type Step = { prompt: string; options: { text: string; feedback?: string }[]; correctIdx: number };

function tgHaptic(kind: "success" | "error") {
  try { (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred(kind); } catch { /* ignore */ }
}

export function SzenarioRunner({ sc, personaName, onClose }: { sc: Szenario; personaName?: string; onClose: () => void }) {
  // Nur valide Schritte (≥2 Optionen, gültiger correctIdx).
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

  if (!steps.length) return <Modal onClose={onClose}><p className="text-center text-muted">Dieses Szenario hat noch keine spielbaren Schritte.</p><Done onClose={onClose} /></Modal>;

  const total = steps.length;
  const done = idx >= total;

  if (done) {
    const pct = Math.round((score / total) * 100);
    const emoji = pct === 100 ? "🎉" : pct >= 80 ? "🌟" : pct >= 60 ? "👍" : "📚";
    const msg = pct >= 80 ? "Hervorragend!" : pct >= 60 ? "Solide — Schwerpunkte nochmal anschauen." : "Vertiefe Einwände & Personas und versuch es nochmal.";
    return (
      <Modal onClose={onClose}>
        <div className="text-center">
          <div className="text-5xl">{emoji}</div>
          <div className="mt-2 text-3xl font-extrabold">{score}<span className="text-lg text-muted">/{total}</span></div>
          <div className="text-muted">{pct}%{best >= 2 ? ` · 🔥 beste Serie ${best}` : ""}</div>
          <p className="mt-4 text-sm text-muted">{msg}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={() => { setIdx(0); setScore(0); setStreak(0); setBest(0); setAnswered(null); }} className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg">🔄 Nochmal</button>
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold">✓ Fertig</button>
          </div>
        </div>
      </Modal>
    );
  }

  const step = steps[idx];
  const choose = (i: number) => {
    if (answered !== null) return;
    setAnswered(i);
    const correct = i === step.correctIdx;
    tgHaptic(correct ? "success" : "error");
    if (correct) { setScore((s) => s + 1); setStreak((s) => { const ns = s + 1; setBest((b) => Math.max(b, ns)); return ns; }); }
    else setStreak(0);
  };
  const next = () => { setAnswered(null); setIdx((i) => i + 1); };
  const progress = (idx / total) * 100;

  return (
    <Modal onClose={onClose}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-bold">{sc.name || "Szenario"}</h3>
        <button onClick={onClose} aria-label="Schließen" className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-muted hover:text-ink">✕</button>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted-2">Schritt {idx + 1}/{total}{personaName ? ` · ${personaName}` : ""}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 font-semibold", streak >= 3 ? "bg-amber/20 text-amber" : "bg-surface-2 text-muted")}>✓ {score} · 🔥 {streak}</span>
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
            {answered === step.correctIdx ? "✅ " : "❌ "}{step.options[answered].feedback || (answered === step.correctIdx ? "Richtig!" : "Leider falsch.")}
          </div>
          {answered !== step.correctIdx && step.options[step.correctIdx].feedback && (
            <div className="mt-2 rounded-lg border-l-2 border-accent bg-surface-2 px-3 py-2 text-sm text-muted">
              💡 Beste Antwort ({String.fromCharCode(65 + step.correctIdx)}): {step.options[step.correctIdx].feedback}
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
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-5 shadow-2xl">{children}</div>
    </div>
  );
}
