"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Confetti } from "./confetti";
import { ResultRewards } from "./result-rewards";
import type { Drill } from "@/lib/akademie";
import { Icon } from "@/components/icon";

type Opt = { text: string; correct: boolean; feedback?: string };
type Q = { id?: string; marke: string; technik?: string; schwierigkeit?: string; frage: string; opts: Opt[]; muster?: string };

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function tgHaptic(kind: "success" | "error") {
  try { (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred(kind); } catch { /* ignore */ }
}

function toQuestion(d: Drill): Q | null {
  const opts = (d.optionen || []).map((o) => ({
    text: (o.text || "").trim(),
    correct: o.ist_richtig === true || (o.punkte || 0) > 0,
    feedback: o.feedback,
  })).filter((o) => o.text);
  if (opts.length < 2 || !opts.some((o) => o.correct)) return null;
  return { id: d.id, marke: d.marke || "allgemein", technik: d.verkaufstechnik, schwierigkeit: d.schwierigkeit, frage: d.frage || "", opts: shuffle(opts), muster: d.musterantwort };
}

export function DrillRunner({ drills, onClose }: { drills: Drill[]; onClose: () => void }) {
  const [round, setRound] = useState(0);
  const questions = useMemo<Q[]>(() => shuffle(drills.map(toQuestion).filter((q): q is Q => q !== null)), [drills, round]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [results, setResults] = useState<{ key: string; correct: boolean }[]>([]);

  const total = questions.length;
  const done = total > 0 && idx >= total;
  const q = questions[idx];

  const choose = (i: number) => {
    if (answered !== null || !q) return;
    setAnswered(i);
    const correct = q.opts[i].correct;
    tgHaptic(correct ? "success" : "error");
    if (q.id) setResults((r) => [...r, { key: `drill:${q.id}`, correct }]);
    if (correct) { setScore((s) => s + 1); setStreak((s) => { const ns = s + 1; setBest((b) => Math.max(b, ns)); return ns; }); }
    else setStreak(0);
  };
  const next = () => { setAnswered(null); setIdx((i) => i + 1); };
  const restart = () => { setIdx(0); setScore(0); setStreak(0); setBest(0); setAnswered(null); setResults([]); setRound((r) => r + 1); };

  // Tastatur: 1–9 / A–Z zum Antworten, Enter/Leertaste = weiter, Escape = schließen.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (done || !q) return;
      if (answered === null) {
        const n = parseInt(e.key, 10);
        if (Number.isInteger(n) && n >= 1 && n <= q.opts.length) { e.preventDefault(); choose(n - 1); return; }
        if (e.key.length === 1) { const l = e.key.toLowerCase().charCodeAt(0) - 97; if (l >= 0 && l < q.opts.length) { e.preventDefault(); choose(l); } }
      } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, idx, done, q, onClose]);

  if (!questions.length) return <Modal onClose={onClose}><p className="text-center text-muted">Keine spielbaren Drills für diese Auswahl.</p><div className="mt-4 text-center"><button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold">Schließen</button></div></Modal>;

  if (done) {
    const pct = Math.round((score / total) * 100);
    const icon = pct === 100 ? "party" : pct >= 80 ? "trophy" : pct >= 60 ? "target" : pct >= 40 ? "bolt" : "book";
    return (
      <Modal onClose={onClose}>
        {pct >= 80 && <Confetti intensity={pct === 100 ? 1.4 : 1} />}
        <div className="text-center">
          <div className="flex justify-center"><Icon name={icon} className="h-10 w-10" /></div>
          <div className="mt-2 text-3xl font-extrabold">{score}<span className="text-lg text-muted">/{total}</span></div>
          <div className="text-muted">{pct}% richtig{best >= 2 ? <> · <Icon name="flame" className="h-4 w-4 inline-block" /> beste Serie {best}</> : ""}</div>
          <ResultRewards type="drill" score={score} total={total} itemResults={results} />
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={restart} className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg"><Icon name="repeat" className="h-4 w-4 inline-block mr-1" />Nochmal</button>
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold"><Icon name="check" className="h-4 w-4 inline-block mr-1" />Fertig</button>
          </div>
        </div>
      </Modal>
    );
  }

  const correctIdx = q.opts.findIndex((o) => o.correct);
  const progress = (idx / total) * 100;

  return (
    <Modal onClose={onClose}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-bold"><Icon name="bolt" className="h-5 w-5 inline-block mr-1" />Drill-Training</h3>
        <button onClick={onClose} aria-label="Schließen" className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-muted hover:text-ink"><Icon name="x" className="h-4 w-4" /></button>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted-2">{idx + 1}/{total} · {q.marke}{q.technik ? ` · ${q.technik}` : ""}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 font-semibold inline-flex items-center gap-1", streak >= 3 ? "bg-amber/20 text-amber" : "bg-surface-2 text-muted")}><Icon name="check" className="h-3 w-3" /> {score} · <Icon name="flame" className="h-3 w-3" /> {streak}</span>
      </div>
      <p className="mb-4 whitespace-pre-wrap font-semibold">{q.frage}</p>
      <div className="flex flex-col gap-2">
        {q.opts.map((o, i) => {
          const show = answered !== null;
          const tone = show && o.correct ? "border-green bg-green/10"
            : show && i === answered && !o.correct ? "border-red bg-red/10"
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
          <div className={cn("rounded-lg px-3 py-2 text-sm", q.opts[answered].correct ? "bg-green/10 text-green" : "bg-red/10 text-red")}>
            {q.opts[answered].correct ? <Icon name="check" className="h-4 w-4 inline-block mr-1" /> : <Icon name="x" className="h-4 w-4 inline-block mr-1" />}{q.opts[answered].feedback || (q.opts[answered].correct ? "Richtig!" : "Leider falsch.")}
          </div>
          {!q.opts[answered].correct && q.opts[correctIdx]?.feedback && (
            <div className="mt-2 rounded-lg border-l-2 border-green bg-surface-2 px-3 py-2 text-sm text-muted">
              <Icon name="check" className="h-4 w-4 inline-block mr-1" />Richtig ({String.fromCharCode(65 + correctIdx)}): {q.opts[correctIdx].feedback}
            </div>
          )}
          {q.muster && <div className="mt-2 rounded-lg border-l-2 border-accent bg-surface-2 px-3 py-2 text-sm text-muted"><Icon name="bulb" className="h-4 w-4 inline-block mr-1" />Musterantwort: {q.muster}</div>}
          <button onClick={next} className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-bg">
            {idx === total - 1 ? "Ergebnis →" : "Nächster Drill →"}
          </button>
        </div>
      )}
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-5 shadow-2xl">{children}</div>
    </div>
  );
}
