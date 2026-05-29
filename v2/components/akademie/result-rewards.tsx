"use client";
import { useEffect, useRef, useState } from "react";
import { Confetti } from "./confetti";
import type { TrainingType } from "@/lib/progress";

type Reward = { xpGain: number; streak: number; level: { level: number }; newBadges: { id: string; icon: string; label: string }[] };

// Verbucht ein Trainingsergebnis (einmalig) und zeigt XP/Streak/neue Badges.
export function ResultRewards({ type, score, total, itemResults }: { type: TrainingType; score: number; total: number; itemResults?: { key: string; correct: boolean }[] }) {
  const [r, setR] = useState<Reward | null>(null);
  const [busy, setBusy] = useState(true);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const init = (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData) || "";
    if (init) headers["X-Tg-Init"] = init;
    fetch("/api/akademie/progress", { method: "POST", headers, body: JSON.stringify({ type, score, total, itemResults }) })
      .then((res) => (res.ok ? res.json() : null))
      .then((j) => { if (j && typeof j.xpGain === "number") setR(j); })
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [type, score, total]);

  if (busy) return <div className="mt-3 h-9 animate-pulse rounded-lg bg-surface-2" />;
  if (!r) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
      {r.newBadges.length > 0 && <Confetti intensity={0.7} />}
      <span className="rounded-full bg-accent/15 px-3 py-1 font-bold text-accent">+{r.xpGain} XP</span>
      <span className="rounded-full bg-surface-2 px-3 py-1 font-semibold text-muted">Level {r.level.level}</span>
      {r.streak >= 2 && <span className="rounded-full bg-amber/15 px-3 py-1 font-semibold text-amber">🔥 {r.streak} Tage</span>}
      {r.newBadges.map((b, i) => (
        <span key={b.id} className="mag-pop rounded-full bg-green/15 px-3 py-1 font-semibold text-green shadow-sm" style={{ animationDelay: `${i * 0.12}s` }} title={b.label}>🎉 {b.icon} {b.label}</span>
      ))}
    </div>
  );
}
