"use client";
import { useMemo } from "react";

const COLORS = ["#6ea8fe", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#22d3ee"];

// Kurzer Konfetti-Regen (fire-once beim Mount). Rendert nichts bei prefers-reduced-motion.
export function Confetti({ count = 90, intensity = 1 }: { count?: number; intensity?: number }) {
  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pieces = useMemo(
    () =>
      Array.from({ length: Math.round(count * intensity) }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        dur: 1.3 + Math.random() * 1.1,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 360,
        w: 6 + Math.random() * 7,
        round: Math.random() > 0.7,
      })),
    [count, intensity],
  );

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style>{`@keyframes mag-confetti{0%{transform:translateY(-12vh) rotate(0);opacity:1}100%{transform:translateY(112vh) rotate(720deg);opacity:0}}`}</style>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-6vh",
            width: p.w,
            height: p.round ? p.w : p.w * 0.55,
            background: p.color,
            borderRadius: p.round ? "9999px" : 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `mag-confetti ${p.dur}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
