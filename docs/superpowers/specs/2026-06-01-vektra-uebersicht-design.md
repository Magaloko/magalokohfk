# VEKTRA-Trainer — Mobile-Übersichtlichkeit (Design-Spec)

> **Status:** Design (brainstorming abgeschlossen, User-Approval erfolgt). Nächster Schritt: writing-plans → subagent-driven-development.
> **Datum:** 2026-06-01
> **Projekt:** MAGALOKO v2 (`F:\JTL_Export\JTL_Export\magaloko\v2`), live https://magalokohfk-xdnk.vercel.app

## Ziel

Den VEKTRA-Trainer am Handy **übersichtlicher** machen. Drei vom Nutzer benannte, am 390px-Viewport bestätigte Probleme:

1. **Tab-Leiste verbirgt Inhalt:** 10 horizontal scrollende Akademie-Tabs, **611px nach rechts verborgen** (mehr als die sichtbare Breite), seit dem Scrollbar-Hide ohne jede Affordanz → der Großteil der Bereiche ist am Handy unauffindbar.
2. **Akademie-Hub zu tief gestapelt:** 3,3 Bildschirme Scroll; die Bereichs-Übersicht („Bereiche"-Grid) kommt erst nach 5 vorgelagerten Blöcken.
3. **Drills-Seite dicht:** zwei Launcher + sofort eine flache, lange Gesamtliste aller Drills.

Kontext: VEKTRA ist Teil von **MasterMind** (zentrale Wissens-Foundation für HFK; „macht verstreutes Wissen allen verfügbar"). Eine klare, scanbare Bereichs-Übersicht passt direkt zu diesem Hub-Gedanken.

Dies ist eine **Informationsarchitektur-/Layout-Anpassung**, kein visuelles Redesign und kein Pauschal-Umbau.

## Scope

**In Scope (per Nutzer-Entscheidungen):**
- **Navigation:** Hub-first am Handy (Entscheidung „Hub-first: Übersicht IST die Navigation").
- **Hub:** Bereiche zuerst, Motivation kompakt darüber (Entscheidung „Bereiche zuerst, Motivation kompakt").
- **Drills:** Launcher oben, Voll-Liste einklappbar (Entscheidung „Launcher kompakt, Voll-Liste einklappbar").

**Ausdrücklich Out of Scope (Anti-Pauschal — Nutzer-Entscheidung „So lassen, nur Drills"):**
- Die reinen Inhalts-Seiten **Einwände, Marken, Personas, Szenarien, Rollenspiele, Angebote** — dort IST die Liste/Karten-Sammlung der Inhalt; Einklappen würde ihn verstecken. Bleiben unverändert.
- **Desktop-Layout** überall (nur mobil ändert sich; Desktop behält Tab-Leiste, Hub-Reihenfolge, offene Drills-Liste).
- Touch-Targets/IconButton aus der vorigen Runde, Bottom-Nav, Marken-Theming, sonstige Redesigns.

## Architektur / Komponenten

### 1. Navigation — `components/akademie/akademie-tabs.tsx`

Bereits Client-Komponente mit `usePathname`. Wird responsiv aufgeteilt (eine Komponente, zwei sticky Varianten):

- **Desktop (`md+`):** bestehende Tab-Leiste, gewrappt in `hidden md:block`. Inhalt unverändert (inkl. der Touch-Target-Klassen aus der letzten Runde).
- **Handy (`md:hidden`):** **keine** Tab-Leiste. Wenn `pathname !== "/akademie"` (Unterseite): eine schlanke sticky Zeile mit `<Link href="/akademie">← VEKTRA-Übersicht</Link>` (`min-h-11`, `text-accent`). Auf dem Hub (`overviewActive`): nichts gerendert (kein leerer Balken).

Struktur:
```tsx
return (
  <>
    <div className="hidden md:block sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Übersicht-Link + tabs.map(...) — unverändert */}
      </div>
    </div>
    {!overviewActive && (
      <div className="md:hidden sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-2">
          <Link href="/akademie" className="inline-flex items-center gap-1 min-h-11 text-sm font-semibold text-accent">
            <Icon name="academy" className="h-4 w-4" />← VEKTRA-Übersicht
          </Link>
        </div>
      </div>
    )}
  </>
);
```
`useEffect`/`localStorage`-Logik (zuletzt besuchte Sektion) bleibt unverändert. **Kein** zusätzlicher Bereich-Wechsler (YAGNI — Zurück zum Hub genügt).

### 2. Hub-Reihenfolge — `app/(app)/akademie/page.tsx`

Nur **mobil**; Desktop bleibt identisch. Zwei Eingriffe:

a) **Slim auf Handy:** Die Badge-Chips-Reihe (`<div className="mt-3 flex flex-wrap gap-2">…BADGES…`) erhält `hidden md:flex`. Damit bleibt oben am Handy nur die schlanke Motivation: Level-Avatar + Level/XP/Streak + dünner Fortschrittsbalken. Badges bleiben auf Desktop sichtbar.

b) **Bereiche zuerst (mobil):** Der Content-Container ist `flex flex-col gap-5`. Per responsivem `order` rückt die **„Bereiche"-`<section>`** am Handy auf Position 2 (direkt nach der Fortschritts-Section); die dazwischenliegenden Blöcke (Challenge, Lernpfade, Continue, Schnellstart) und die Bestenliste rutschen darunter. Auf Desktop stellt `md:order-none` (bzw. `md:order-0`) die jetzige DOM-Reihenfolge wieder her.

Order-Zuweisung (mobil → md zurückgesetzt), jeweils als Klasse am direkten Kind:
| Kind | mobil | desktop |
|---|---|---|
| Fortschritt-Section | `order-1` | `md:order-none` |
| **Bereiche-Section** | `order-2` | `md:order-none` |
| ChallengeCard | `order-3` | `md:order-none` |
| Lernpfade-Link | `order-4` | `md:order-none` |
| ContinueCard | `order-5` | `md:order-none` |
| Schnellstart-Section | `order-6` | `md:order-none` |
| Bestenliste-Section | `order-7` | `md:order-none` |

Order-Klassen sind robust gegen fehlende (bedingte) Kinder. Inhalte/Logik der Sections bleiben unverändert.

### 3. Drills — neues Primitive + `app/(app)/akademie/drills/page.tsx`

**Neu: `components/_primitives/collapsible-on-mobile.tsx`** (Client):
- Props: `{ title: string; children: ReactNode; defaultOpen?: boolean }` (default `false`).
- `const [open, setOpen] = useState(defaultOpen)`.
- Rendert einen Toggle-Button **nur am Handy** (`md:hidden`, `min-h-11`): „▾ {title}" / „▴ Einklappen" (Icon `chevron`/`check`-artig; vorhandenes Icon nutzen).
- Inhalt: `<div className={cn(open ? "block" : "hidden", "md:block")}>{children}</div>` → am Handy nur sichtbar wenn `open`; auf Desktop **immer** sichtbar (`md:block`), Toggle dort ausgeblendet → **keine Desktop-Regression**.

```tsx
"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";

export function CollapsibleOnMobile({ title, children, defaultOpen = false }:
  { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="md:hidden mb-3 inline-flex min-h-11 w-full items-center justify-between rounded-lg border border-line bg-surface px-4 text-sm font-semibold">
        <span>{open ? "Einklappen" : title}</span>
        <Icon name="arrow-right" className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
      </button>
      <div className={cn(open ? "block" : "hidden", "md:block")}>{children}</div>
    </div>
  );
}
```
> `arrow-right` ist das einzige passende vorhandene Icon (`components/icon.tsx:52`); rotiert (`rotate-90`) als Auf-/Zu-Indikator. Kein neues Icon nötig.

**Drills-Seite:** Die `<DataTable …/>` (Zeile 27) wird in `<CollapsibleOnMobile title={`Alle ${d.drills.length} Drills`}>…</CollapsibleOnMobile>` gewickelt. `DrillLauncher` + `QuizLauncher` bleiben unverändert oben.

## Verifikation

390px-Prod + Desktop-Gegencheck (md-Breakpoint):
- **Mobil:** Tab-Leiste auf Unterseiten weg, stattdessen „← VEKTRA-Übersicht"; auf dem Hub kein leerer Balken. Hub: Badges versteckt, Bereiche-Grid an Position 2. Drills: Liste eingeklappt, Toggle vergrößert sie. Kein horizontaler Überlauf (`scrollWidth<=clientWidth`).
- **Desktop (≥768px):** Tab-Leiste sichtbar wie bisher, Hub-Reihenfolge unverändert, Drills-Liste offen ohne Toggle, Badges sichtbar → keine Regression.
- Messung per `getBoundingClientRect()`/`matchMedia` im Browser; finale Optik-Abnahme durch Mago am echten Handy (CLAUDE.md visuelle Tasks). Verifikationsweg: `tsc --noEmit` + push→Prod-Browser.

## Risiken

- **`order`-Klassen:** Tailwind `order-1..7`/`order-none` sind Standard. Robust gegen bedingt nicht gerenderte Kinder. Desktop-Reihenfolge via `md:order-none` exakt wie heute — im Prod-Desktop gegenprüfen.
- **`CollapsibleOnMobile` Desktop:** `md:block` am Inhalt garantiert Sichtbarkeit auf Desktop unabhängig vom State; Toggle `md:hidden`. Damit kein Desktop-Effekt.
- **Kein Unit-Test-Runner** — `tsc --noEmit` + Prod-Browser ist der etablierte Verifikationsweg.
