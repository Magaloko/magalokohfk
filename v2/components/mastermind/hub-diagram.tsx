import { MASTERMIND } from "@/lib/strategy";
import { cn } from "@/lib/cn";

// Reines SVG-Hub-and-Spoke-Diagramm: Zentrale „MasterMind" + die 5 Werkzeuge als
// anklickbare Speichen (Anker → #wz-<key>). Server-Component, skaliert via viewBox.
const C = 220;             // Zentrum x/y
const RC = 62;             // Radius Zentrumskreis
const NW = 122, NH = 46;   // Knoten-Box (breit genug für „Einkaufssystem")
// Knoten-Zentren im Uhrzeigersinn ab oben (0/72/144/216/288 Grad, R=158)
const NODES = [
  { cx: 220, cy: 62 },
  { cx: 370, cy: 171 },
  { cx: 313, cy: 348 },
  { cx: 127, cy: 348 },
  { cx: 70, cy: 171 },
];

export function HubDiagram() {
  const wz = MASTERMIND.werkzeuge.slice(0, 5);
  return (
    <svg viewBox="0 0 440 440" role="img"
      aria-label="MasterMind-Architektur: Zentrale mit fünf Werkzeugen"
      className="mx-auto block h-auto w-full max-w-[560px]">
      {/* Speichen-Linien (zuerst — werden von Kreis/Knoten überdeckt) */}
      {NODES.map((n, i) => (
        <line key={`l${i}`} x1={C} y1={C} x2={n.cx} y2={n.cy} className="stroke-muted-2" strokeWidth={2} strokeOpacity={0.55} />
      ))}
      {/* Zentrum (Navy + Gold-Ring) */}
      <circle cx={C} cy={C} r={RC} className="fill-ink" />
      <circle cx={C} cy={C} r={RC} className="fill-none stroke-gold" strokeWidth={3.5} />
      <text x={C} y={C - 5} textAnchor="middle" className="fill-surface" fontSize={17} fontWeight={800}>MasterMind</text>
      <text x={C} y={C + 15} textAnchor="middle" className="fill-gold" fontSize={9.5} fontWeight={600}>zentrale Intelligenz</text>
      {/* Werkzeug-Knoten */}
      {wz.map((w, i) => {
        const n = NODES[i];
        const x = n.cx - NW / 2, y = n.cy - NH / 2;
        const live = w.status === "Live";
        return (
          <a key={w.key} href={`#wz-${w.key}`} className="group cursor-pointer">
            <rect x={x} y={y} width={NW} height={NH} rx={12}
              className={cn("fill-surface-2 transition group-hover:stroke-accent", live ? "stroke-green" : "stroke-line")}
              strokeWidth={live ? 2.5 : 1} />
            <circle cx={x + 16} cy={y + 15} r={5} className={live ? "fill-green" : "fill-accent"} />
            <text x={n.cx} y={n.cy + 5} textAnchor="middle" className="fill-ink" fontSize={13} fontWeight={700}>{w.name}</text>
          </a>
        );
      })}
    </svg>
  );
}
