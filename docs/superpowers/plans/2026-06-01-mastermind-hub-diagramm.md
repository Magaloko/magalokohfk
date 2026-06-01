# MasterMind Hub-Diagramm — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Visuelles Hub-and-Spoke-Diagramm (Zentrale + 5 Werkzeug-Speichen, anklickbar) oben auf `/mastermind`.

**Architecture:** Reine-SVG-Server-Component (kein JS, skaliert via viewBox) + 3 kleine PlanView-Edits (Section + Anker-`id`s).

**Tech Stack:** Next.js 15, TypeScript, Tailwind v4 (fill/stroke-Utilities aus `@theme`-Tokens), `@/lib/strategy`, `@/lib/cn`.

**Spec:** `docs/superpowers/specs/2026-06-01-mastermind-hub-diagramm-design.md`

**Verifikation pro Task:** `tsc --noEmit` (`Set-Location F:\JTL_Export\JTL_Export\magaloko\v2; .\node_modules\.bin\tsc.cmd --noEmit`). **Commits direkt auf `main`.**

---

### Task 1: HubDiagram-Komponente

**Files:** Create `v2/components/mastermind/hub-diagram.tsx`

- [ ] **Step 1: Datei anlegen**

```tsx
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
```

- [ ] **Step 2: tsc** → keine Fehler.
- [ ] **Step 3: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/mastermind/hub-diagram.tsx; git commit -m "feat(mastermind): Hub-and-Spoke-Diagramm-Komponente (SVG)"
```

---

### Task 2: PlanView-Einbindung

**Files:** Modify `v2/components/mastermind/plan-view.tsx`

- [ ] **Step 1: Import ergänzen** (bei den bestehenden Imports oben):
```tsx
import { HubDiagram } from "@/components/mastermind/hub-diagram";
```

- [ ] **Step 2: Diagramm-Sektion unter dem Hero.**
OLD:
```tsx
      </section>

      {/* Wo wir stehen */}
      <SectionTitle icon="pin" kicker="Wo wir stehen" title="Ausgangslage & zentrale Frage" />
```
NEW:
```tsx
      </section>

      {/* System-Diagramm */}
      <SectionTitle icon="cockpit" kicker="Das System auf einen Blick" title="MasterMind & seine Werkzeuge" />
      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <HubDiagram />
      </div>

      {/* Wo wir stehen */}
      <SectionTitle icon="pin" kicker="Wo wir stehen" title="Ausgangslage & zentrale Frage" />
```

- [ ] **Step 3: Anker-`id` + `scroll-mt` an den Werkzeug-Karten** (Klick-Ziel der Speichen).
OLD:
```tsx
          <div key={w.key}
            className={`rounded-xl border bg-surface p-5 shadow-sm ${w.istDieseApp ? "border-accent ring-1 ring-accent/30" : "border-line"}`}>
```
NEW:
```tsx
          <div key={w.key} id={`wz-${w.key}`}
            className={`scroll-mt-24 rounded-xl border bg-surface p-5 shadow-sm ${w.istDieseApp ? "border-accent ring-1 ring-accent/30" : "border-line"}`}>
```

- [ ] **Step 4: tsc** → keine Fehler.
- [ ] **Step 5: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/mastermind/plan-view.tsx; git commit -m "feat(mastermind): Hub-Diagramm im Plan + Werkzeug-Anker"
```

---

### Task 3: Push + Prod-Verifikation

**Files:** keine.

- [ ] **Step 1: Push** `cd F:/JTL_Export/JTL_Export/magaloko; git push`
- [ ] **Step 2: Deploy abwarten.**
- [ ] **Step 3: Struktur prüfen** (`/mastermind`, Admin): genau ein `<svg>` mit `aria-label` „MasterMind-Architektur…"; **5** Speichen-Links `a[href^="#wz-"]` (treasury/einkauf/vipa/sebo/vektra); 5 Werkzeug-Karten mit `id="wz-…"` vorhanden (Klick-Ziele); kein horizontaler Überlauf (`scrollWidth<=clientWidth`).
- [ ] **Step 4: Anker-Funktion** — `#wz-treasury` setzen → Scroll-Position ändert sich Richtung der Treasury-Karte.
- [ ] **Step 5: Bericht** + Hinweis: **Optik-Abnahme durch Mago am eigenen Bildschirm**, dann Farben/Größen iterieren.

---

## Self-Review (Plan gegen Spec)
- **Komponente (T1):** reines SVG, 5 Knoten radial (NODES), Tokens `fill-ink/stroke-gold/fill-surface/stroke-line/stroke-green/fill-accent`, Anker `#wz-<key>`. ✔
- **Einbindung (T2):** Section unter Hero + Anker-`id` + `scroll-mt-24` an Karten. ✔
- **Klick-Kette:** Speiche `a href="#wz-key"` ↔ Karte `id="wz-key"` — Keys identisch (`w.key`). ✔
- **Verifikation:** strukturell messbar; Optik = Nutzer. ✔
