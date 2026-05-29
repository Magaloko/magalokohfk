"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Confetti } from "./confetti";
import { ResultRewards } from "./result-rewards";
import type { Drill, Einwand, Marke } from "@/lib/akademie";
import type { TrainingType } from "@/lib/progress";

type Opt = { text: string; correct: boolean; feedback?: string };
type Q = { type: string; label: string; frage: string; opts: Opt[]; muster?: string; itemKey: string };
type Weak = Record<string, number>;

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
// Adaptive Auswahl: schwache Items (häufig falsch) bekommen höheres Gewicht.
function pickWeighted<T>(pool: T[], keyOf: (t: T) => string, weak: Weak): T {
  const w = pool.map((t) => 1 + (weak[keyOf(t)] || 0) * 2);
  const sum = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

function makeDrillQ(drills: Drill[], weak: Weak, only?: Set<string>): Q | null {
  const pool = drills.filter((d) => (d.optionen || []).length >= 2 && d.optionen!.some((o) => o.ist_richtig === true || (o.punkte || 0) > 0) && (!only || only.has(`drill:${d.id || ""}`)));
  if (!pool.length) return null;
  const d = pickWeighted(pool, (x) => `drill:${x.id || ""}`, weak);
  const opts = shuffle((d.optionen || []).map((o) => ({ text: (o.text || "").slice(0, 140), correct: o.ist_richtig === true || (o.punkte || 0) > 0, feedback: o.feedback })));
  if (!opts.some((o) => o.correct)) return null;
  return { type: "drill", label: `⚡ Drill — ${d.marke || "allgemein"}`, frage: d.frage || "", opts, muster: d.musterantwort, itemKey: `drill:${d.id || ""}` };
}
function makeEinwandQ(einw: Einwand[], weak: Weak, only?: Set<string>): Q | null {
  const all = einw.filter((e) => e.antwort && e.antwort.trim().length >= 8);
  if (all.length < 4) return null;
  const pool = only ? all.filter((e) => only.has(`einwand:${e.id || ""}`)) : all;
  if (!pool.length) return null;
  const t = pickWeighted(pool, (x) => `einwand:${x.id || ""}`, weak);
  const wrong = shuffle(all.filter((e) => e !== t)).slice(0, 3);
  const opts = shuffle([{ text: t.antwort!.slice(0, 140), correct: true, feedback: `✓ Beste Strategie bei „${t.kategorie || "diesem Einwand"}"` },
    ...wrong.map((e) => ({ text: e.antwort!.slice(0, 140), correct: false, feedback: "✗ Passt zu einem anderen Einwand-Typ." }))]);
  return { type: "einwand", label: "💬 Einwand", frage: `Kunde sagt: „${t.einwand}"\n\nWelche Antwort ist am besten?`, opts, muster: t.beweis ? `💡 ${t.beweis.slice(0, 160)}` : undefined, itemKey: `einwand:${t.id || ""}` };
}
function makeMarkenQ(marken: Marke[], weak: Weak, only?: Set<string>): Q | null {
  const all = marken.filter((m) => m.herkunft?.land);
  if (all.length < 4) return null;
  const pool = only ? all.filter((m) => only.has(`marken:${m.id || ""}`)) : all;
  if (!pool.length) return null;
  const t = pickWeighted(pool, (x) => `marken:${x.id || ""}`, weak);
  const laender = [...new Set(all.map((m) => m.herkunft!.land!))];
  const wrong = shuffle(laender.filter((l) => l !== t.herkunft!.land)).slice(0, 3);
  if (wrong.length < 3) return null;
  const opts = shuffle([{ text: t.herkunft!.land!, correct: true, feedback: `✓ ${t.name} kommt aus ${t.herkunft!.land}` },
    ...wrong.map((l) => ({ text: l, correct: false, feedback: `✗ ${t.name} kommt aus ${t.herkunft!.land}.` }))]);
  return { type: "marken", label: "🏷 Marke", frage: `Aus welchem Land kommt die Marke ${t.name}?`, opts, muster: t.philosophie ? `„${t.philosophie.slice(0, 120)}"` : undefined, itemKey: `marken:${t.id || ""}` };
}

export function QuizRunner({ drills, einwaende, marken, n = 5, onClose, recordType = "quiz", title, focusWeak = false }: { drills: Drill[]; einwaende: Einwand[]; marken: Marke[]; n?: number; onClose: () => void; recordType?: TrainingType; title?: string; focusWeak?: boolean }) {
  // Spaced Repetition: gemerkte Schwächen laden, dann Fragen gewichtet generieren.
  const [weak, setWeak] = useState<Weak | null>(null);
  useEffect(() => {
    const headers: Record<string, string> = {};
    const init = (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData) || "";
    if (init) headers["X-Tg-Init"] = init;
    fetch("/api/akademie/progress", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setWeak((j?.progress?.stats?.weak as Weak) || {}))
      .catch(() => setWeak({}));
  }, []);

  const questions = useMemo<Q[]>(() => {
    if (weak === null) return [];
    const only = focusWeak ? new Set(Object.keys(weak)) : undefined;
    const gens: Array<() => Q | null> = [];
    if (drills.length >= 2) gens.push(() => makeDrillQ(drills, weak, only));
    if (einwaende.length >= 4) gens.push(() => makeEinwandQ(einwaende, weak, only));
    if (marken.length >= 4) gens.push(() => makeMarkenQ(marken, weak, only));
    const out: Q[] = []; const seen = new Set<string>(); let tries = 0;
    while (out.length < n && tries < n * 12) {
      tries++;
      const q = gens.length ? pick(gens)() : null;
      if (q && (!q.itemKey.endsWith(":") ? !seen.has(q.itemKey) : true)) { if (q.itemKey) seen.add(q.itemKey); out.push(q); }
    }
    return out;
  }, [drills, einwaende, marken, n, weak, focusWeak]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const resultsRef = useRef<{ key: string; correct: boolean }[]>([]);

  if (weak === null) return <Modal onClose={onClose}><p className="py-6 text-center text-muted">Quiz wird vorbereitet…</p></Modal>;
  if (!questions.length) return <Modal onClose={onClose}><p className="py-4 text-center text-muted">{focusWeak ? "Noch keine Schwächen erfasst — mach erst ein paar Quizze, dann tauchen hier deine schwachen Themen auf. 💪" : "Nicht genug Daten für ein Quiz."}</p><div className="text-center"><button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Schließen</button></div></Modal>;

  const done = idx >= questions.length;
  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct === 100 ? "🎉" : pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : pct >= 40 ? "💪" : "📚";
    return (
      <Modal onClose={onClose}>
        {pct >= 80 && <Confetti intensity={pct === 100 ? 1.4 : 1} />}
        <div className="text-center">
          <div className="text-5xl">{emoji}</div>
          <div className="mt-2 text-3xl font-extrabold">{score}<span className="text-lg text-muted">/{questions.length}</span></div>
          <div className="text-muted">{pct}% richtig{best >= 2 ? ` · 🔥 beste Serie ${best}` : ""}</div>
          <ResultRewards type={recordType} score={score} total={questions.length} itemResults={resultsRef.current} />
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={() => { resultsRef.current = []; setIdx(0); setScore(0); setStreak(0); setBest(0); setAnswered(null); }} className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg">🔄 Nochmal</button>
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold">✓ Fertig</button>
          </div>
        </div>
      </Modal>
    );
  }

  const q = questions[idx];
  const choose = (i: number) => {
    if (answered !== null) return;
    setAnswered(i);
    const correct = q.opts[i].correct;
    if (q.itemKey && q.itemKey.length > q.itemKey.indexOf(":") + 1) resultsRef.current.push({ key: q.itemKey, correct });
    if (correct) { setScore((s) => s + 1); setStreak((s) => { const ns = s + 1; setBest((b) => Math.max(b, ns)); return ns; }); }
    else setStreak(0);
  };
  const next = () => { setAnswered(null); setIdx((i) => i + 1); };

  return (
    <Modal onClose={onClose}>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-semibold text-muted">{idx + 1}/{questions.length} · {q.label}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 font-semibold", streak >= 3 ? "bg-amber/20 text-amber" : "bg-surface-2 text-muted")}>✓ {score} · 🔥 {streak}</span>
      </div>
      <p className="mb-4 whitespace-pre-wrap font-semibold">{q.frage}</p>
      <div className="flex flex-col gap-2">
        {q.opts.map((o, i) => {
          const show = answered !== null;
          const tone = show && o.correct ? "border-green bg-green/10" : show && i === answered && !o.correct ? "border-red bg-red/10" : "border-line hover:border-accent";
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
            {q.opts[answered].correct ? "✅ " : "❌ "}{q.opts[answered].feedback || (q.opts[answered].correct ? "Richtig!" : "Leider falsch.")}
          </div>
          {q.muster && <div className="mt-2 rounded-lg border-l-2 border-accent bg-surface-2 px-3 py-2 text-sm text-muted">{q.muster}</div>}
          <button onClick={next} className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-bg">
            {idx === questions.length - 1 ? "Ergebnis →" : "Nächste Frage →"}
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
