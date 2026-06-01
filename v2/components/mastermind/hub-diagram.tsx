import { MASTERMIND } from "@/lib/strategy";
import { cn } from "@/lib/cn";

// Reines SVG-Hub-and-Spoke-Diagramm: Zentrale „MasterMind" + die 5 Werkzeuge als
// anklickbare Speichen (Anker → #wz-<key>). Server-Component, skaliert via viewBox.
const C = 210;            // Zentrum x/y
const RC = 56;            // Radius Zentrumskreis
const NW = 104, NH = 44;  // Knoten-Box
// Knoten-Zentren im Uhrzeigersinn ab oben (0/72/144/216/288 Grad, R=150)
const NODES = [
  { cx: 210, cy: 60 },
  { cx: 353, cy: 164 },
  { cx: 298, cy: 331 },
  { cx: 122, cy: 331 },
  { cx: 67, cy: 164 },
];

export function HubDiagram() {
  const wz = MASTERMIND.werkzeuge.slice(0, 5);
  return (
    <svg viewBox="0 0 420 420" role="img"
      aria-label="MasterMind-Architektur: Zentrale mit fünf Werkzeugen"
      className="mx-auto block h-auto w-full max-w-[520px]">
      {/* Speichen-Linien (zuerst — werden von Kreis/Knoten überdeckt) */}
      {NODES.map((n, i) => (
        <line key={`l${i}`} x1={C} y1={C} x2={n.cx} y2={n.cy} className="stroke-line" strokeWidth={2} />
      ))}
      {/* Zentrum */}
      <circle cx={C} cy={C} r={RC} className="fill-ink" />
      <circle cx={C} cy={C} r={RC} className="fill-none stroke-gold" strokeWidth={3} />
      <text x={C} y={C - 4} textAnchor="middle" className="fill-surface" fontSize={15} fontWeight={800}>MasterMind</text>
      <text x={C} y={C + 16} textAnchor="middle" className="fill-gold" fontSize={9} fontWeight={600}>zentrale Intelligenz</text>
      {/* Werkzeug-Knoten */}
      {wz.map((w, i) => {
        const n = NODES[i];
        const x = n.cx - NW / 2, y = n.cy - NH / 2;
        const live = w.status === "Live";
        return (
          <a key={w.key} href={`#wz-${w.key}`} className="group cursor-pointer">
            <rect x={x} y={y} width={NW} height={NH} rx={10}
              className={cn("fill-surface transition group-hover:stroke-accent", live ? "stroke-green" : "stroke-line")}
              strokeWidth={live ? 2 : 1.5} />
            <circle cx={x + 14} cy={y + 14} r={4} className={live ? "fill-green" : "fill-accent"} />
            <text x={n.cx} y={n.cy + 4} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={700}>{w.name}</text>
          </a>
        );
      })}
    </svg>
  );
}
