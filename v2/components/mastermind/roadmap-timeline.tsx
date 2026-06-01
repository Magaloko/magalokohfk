import { MASTERMIND } from "@/lib/strategy";

// Horizontale Roadmap-Timeline (SVG, skaliert via viewBox): nummerierte Schritte
// auf einer Linie, Status-gefärbt. „diese App" (VEKTRA) = grün gefüllt = live.
export function RoadmapTimeline() {
  const r = MASTERMIND.roadmap;
  const n = r.length;
  const W = 680, H = 110, y = 44, m = 56;
  const step = n > 1 ? (W - 2 * m) / (n - 1) : 0;
  const xOf = (i: number) => m + i * step;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Roadmap-Sequenz — Foundation zuerst"
      className="mx-auto block h-auto w-full max-w-[700px]">
      <line x1={xOf(0)} y1={y} x2={xOf(n - 1)} y2={y} className="stroke-line" strokeWidth={3} />
      {r.map((p, i) => {
        const x = xOf(i);
        const live = !!p.istDieseApp;
        return (
          <g key={p.schritt}>
            <circle cx={x} cy={y} r={17}
              className={live ? "fill-green" : "fill-surface stroke-accent"} strokeWidth={live ? 0 : 2.5} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize={15} fontWeight={800}
              className={live ? "fill-surface" : "fill-accent"}>{p.schritt}</text>
            <text x={x} y={y + 36} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-ink">{p.titel}</text>
            {live && <text x={x} y={y + 50} textAnchor="middle" fontSize={9.5} fontWeight={700} className="fill-green">live · diese App</text>}
          </g>
        );
      })}
    </svg>
  );
}
