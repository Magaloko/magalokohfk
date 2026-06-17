"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Confetti } from "./confetti";
import { ResultRewards } from "./result-rewards";
import { Icon } from "@/components/icon";
import type { Drill, Einwand, Marke } from "@/lib/akademie";
import type { TrainingType } from "@/lib/progress";

type Opt = { text: string; correct: boolean; feedback?: string };
type Q = { type: string; label: string; frage: string; opts: Opt[]; muster?: string; itemKey: string };
type Weak = Record<string, number>;

const newAttemptId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
  return { type: "drill", label: `Übung — ${d.marke || "allgemein"}`, frage: d.frage || "", opts, muster: d.musterantwort, itemKey: `drill:${d.id || ""}` };
}
function makeEinwandQ(einw: Einwand[], weak: Weak, only?: Set<string>): Q | null {
  const all = einw.filter((e) => e.antwort && e.antwort.trim().length >= 8);
  if (all.length < 4) return null;
  const pool = only ? all.filter((e) => only.has(`einwand:${e.id || ""}`)) : all;
  if (!pool.length) return null;
  const t = pickWeighted(pool, (x) => `einwand:${x.id || ""}`, weak);
  const wrong = shuffle(all.filter((e) => e !== t)).slice(0, 3);
  const opts = shuffle([{ text: t.antwort!.slice(0, 140), correct: true, feedback: `Beste Strategie bei „${t.kategorie || "diesem Einwand"}"` },
    ...wrong.map((e) => ({ text: e.antwort!.slice(0, 140), correct: false, feedback: "Passt zu einem anderen Einwand-Typ." }))]);
  return { type: "einwand", label: "Einwand", frage: `Kunde sagt: „${t.einwand}"\n\nWelche Antwort ist am besten?`, opts, muster: t.beweis ? t.beweis.slice(0, 160) : undefined, itemKey: `einwand:${t.id || ""}` };
}
function makeMarkenQ(marken: Marke[], weak: Weak, only?: Set<string>): Q | null {
  const named = marken.filter((m) => m.name);
  if (named.length < 4) return null;
  const pool = only ? named.filter((m) => only.has(`marken:${m.id || ""}`)) : named;
  if (!pool.length) return null;
  const t = pickWeighted(pool, (x) => `marken:${x.id || ""}`, weak);
  const key = `marken:${t.id || ""}`;
  const others = named.filter((m) => m !== t);
  const heroName = (h: string | { name?: string }) => (typeof h === "string" ? h : h?.name || "");

  // Frage-Varianten je nach Datenlage (Herkunft / USP / Hero-Produkt) — mehr Lernwert als nur Herkunftsland.
  const variants: Array<() => Q | null> = [];
  if (t.herkunft?.land) variants.push(() => {
    const laender = [...new Set(named.map((m) => m.herkunft?.land).filter((l): l is string => !!l && l !== t.herkunft!.land))];
    if (laender.length < 3) return null;
    const opts = shuffle([{ text: t.herkunft!.land!, correct: true, feedback: `${t.name} kommt aus ${t.herkunft!.land}.` },
      ...shuffle(laender).slice(0, 3).map((l) => ({ text: l, correct: false, feedback: `${t.name} kommt aus ${t.herkunft!.land}.` }))]);
    return { type: "marken", label: "Marke · Herkunft", frage: `Aus welchem Land kommt die Marke ${t.name}?`, opts, muster: t.philosophie ? `„${t.philosophie.slice(0, 120)}"` : undefined, itemKey: key };
  });
  const usp = (t.usps || []).find((u) => typeof u === "string" && u.trim().length >= 8);
  if (usp) variants.push(() => {
    const opts = shuffle([{ text: t.name!, correct: true, feedback: `Das ist ein USP von ${t.name}.` },
      ...shuffle(others).slice(0, 3).map((m) => ({ text: m.name!, correct: false, feedback: `Das ist ein USP von ${t.name}.` }))]);
    return { type: "marken", label: "Marke · USP", frage: `Welche Marke wirbt mit: „${usp.slice(0, 140)}"?`, opts, itemKey: key };
  });
  const hero = (t.hero_produkte || []).map(heroName).find((h) => h && h.trim().length >= 2);
  if (hero) variants.push(() => {
    const opts = shuffle([{ text: t.name!, correct: true, feedback: `„${hero}" gehört zu ${t.name}.` },
      ...shuffle(others).slice(0, 3).map((m) => ({ text: m.name!, correct: false, feedback: `„${hero}" gehört zu ${t.name}.` }))]);
    return { type: "marken", label: "Marke · Produkt", frage: `Zu welcher Marke gehört „${hero}"?`, opts, itemKey: key };
  });
  if (!variants.length) return null;
  return pick(variants)();
}

export function QuizRunner({ drills, einwaende, marken, n = 5, onClose, recordType = "quiz", title, focusWeak = false }: { drills: Drill[]; einwaende: Einwand[]; marken: Marke[]; n?: number; onClose: () => void; recordType?: TrainingType; title?: string; focusWeak?: boolean }) {
  // Spaced Repetition: gemerkte Schwächen laden, dann Fragen gewichtet generieren.
  const [weak, setWeak] = useState<Weak | null>(null);
  const [round, setRound] = useState(0);
  useEffect(() => {
    const headers: Record<string, string> = {};
    const init = (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData) || "";
    if (init) headers["X-Tg-Init"] = init;
    fetch("/api/akademie/progress", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setWeak((j?.progress?.stats?.weak as Weak) || {}))
      .catch(() => setWeak({}));
  }, [round]);

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
  }, [drills, einwaende, marken, n, weak, focusWeak, round]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const resultsRef = useRef<{ key: string; correct: boolean }[]>([]);
  const [attemptId, setAttemptId] = useState(() => newAttemptId());

  const done = questions.length > 0 && idx >= questions.length;
  const q = questions[idx];

  const choose = (i: number) => {
    if (answered !== null || !q) return;
    setAnswered(i);
    const correct = q.opts[i].correct;
    if (q.itemKey && q.itemKey.length > q.itemKey.indexOf(":") + 1) resultsRef.current.push({ key: q.itemKey, correct });
    if (correct) { setScore((s) => s + 1); setStreak((s) => { const ns = s + 1; setBest((b) => Math.max(b, ns)); return ns; }); }
    else setStreak(0);
  };
  const next = () => { setAnswered(null); setIdx((i) => i + 1); };
  // „Nochmal": frisches Schwächen-Profil laden (round++) -> Fragen werden neu generiert.
  const restart = () => { resultsRef.current = []; setIdx(0); setScore(0); setStreak(0); setBest(0); setAnswered(null); setAttemptId(newAttemptId()); setWeak(null); setRound((r) => r + 1); };

  // Tastatur: 1–9 / A–Z zum Antworten, Enter/Leertaste = weiter, Escape = schließen.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (weak === null || !questions.length || done || !q) return;
      if (answered === null) {
        const num = parseInt(e.key, 10);
        if (Number.isInteger(num) && num >= 1 && num <= q.opts.length) { e.preventDefault(); choose(num - 1); return; }
        if (e.key.length === 1) { const l = e.key.toLowerCase().charCodeAt(0) - 97; if (l >= 0 && l < q.opts.length) { e.preventDefault(); choose(l); } }
      } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, idx, done, q, weak, questions.length, onClose]);

  if (weak === null) return <Modal onClose={onClose}><p className="py-6 text-center text-muted">Quiz wird vorbereitet…</p></Modal>;
  if (!questions.length) return <Modal onClose={onClose}><p className="py-4 text-center text-muted">{focusWeak ? <span className="inline-flex items-center gap-1">Noch keine Schwächen erfasst — mach erst ein paar Quizze, dann tauchen hier deine schwachen Themen auf. <Icon name="bolt" className="h-4 w-4" /></span> : "Nicht genug Daten für ein Quiz."}</p><div className="text-center"><button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Schließen</button></div></Modal>;

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const resultIcon = pct === 100 ? "party" : pct >= 80 ? "trophy" : pct >= 60 ? "target" : pct >= 40 ? "bolt" : "book";
    return (
      <Modal onClose={onClose}>
        {pct >= 80 && <Confetti intensity={pct === 100 ? 1.4 : 1} />}
        <div className="text-center">
          <div className="flex justify-center"><Icon name={resultIcon} className="h-12 w-12" /></div>
          <div className="mt-2 text-3xl font-extrabold">{score}<span className="text-lg text-muted">/{questions.length}</span></div>
          <div className="text-muted flex items-center justify-center gap-1">{pct}% richtig{best >= 2 ? <><span> · </span><Icon name="flame" className="h-4 w-4" /><span> beste Serie {best}</span></> : ""}</div>
          <ResultRewards type={recordType} score={score} total={questions.length} attemptId={attemptId} itemResults={resultsRef.current} />
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={restart} className="rounded-lg bg-accent px-4 py-3 font-semibold text-bg flex items-center gap-1.5"><Icon name="repeat" className="h-4 w-4" /> Nochmal</button>
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-3 font-semibold flex items-center gap-1.5"><Icon name="check" className="h-4 w-4" /> Fertig</button>
          </div>
        </div>
      </Modal>
    );
  }

  const correctIdx = q.opts.findIndex((o) => o.correct);

  return (
    <Modal onClose={onClose}>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-2">{idx + 1}/{questions.length} · {q.label}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 font-semibold flex items-center gap-1", streak >= 3 ? "bg-amber/20 text-amber" : "bg-surface-2 text-muted")}><Icon name="check" className="h-4 w-4" /> {score} · <Icon name="flame" className="h-4 w-4" /> {streak}</span>
      </div>
      <p className="mb-4 whitespace-pre-wrap text-base font-semibold sm:text-lg">{q.frage}</p>
      <div className="flex flex-col gap-2">
        {q.opts.map((o, i) => {
          const show = answered !== null;
          const tone = show && o.correct ? "border-green bg-green/10" : show && i === answered && !o.correct ? "border-red bg-red/10" : "border-line hover:border-accent";
          return (
            <button key={i} disabled={show} onClick={() => choose(i)}
              className={cn("rounded-lg border px-4 py-3.5 text-left text-base leading-snug transition", tone, show && "cursor-default")}>
              <span className="mr-2 font-mono text-muted-2">{String.fromCharCode(65 + i)}</span>{o.text}
            </button>
          );
        })}
      </div>
      {answered !== null && (
        <div className="mt-3">
          <div className={cn("rounded-lg px-3 py-2 text-sm", q.opts[answered].correct ? "bg-green/10 text-green" : "bg-red/10 text-red")}>
            <span className="inline-flex items-center gap-1">{q.opts[answered].correct ? <Icon name="check" className="h-4 w-4" /> : <Icon name="x" className="h-4 w-4" />}{q.opts[answered].feedback || (q.opts[answered].correct ? "Richtig!" : "Leider falsch.")}</span>
          </div>
          {!q.opts[answered].correct && correctIdx >= 0 && (
            <div className="mt-2 rounded-lg border-l-2 border-green bg-surface-2 px-3 py-2 text-sm text-muted">
              <Icon name="check" className="h-4 w-4 inline-block mr-1" />Richtig ({String.fromCharCode(65 + correctIdx)}): {q.opts[correctIdx].text}
            </div>
          )}
          {q.muster && <div className="mt-2 rounded-lg border-l-2 border-accent bg-surface-2 px-3 py-2 text-sm text-muted">{q.muster}</div>}
          <button onClick={next} className="mt-3 w-full rounded-lg bg-accent px-4 py-3 text-base font-semibold text-bg">
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
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-2xl">{children}</div>
    </div>
  );
}
