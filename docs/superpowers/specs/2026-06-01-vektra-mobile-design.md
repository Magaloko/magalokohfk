# VEKTRA-Trainer — Mobile-Touch-Politur (Design-Spec)

> **Status:** Design (brainstorming abgeschlossen, User-Approval erfolgt). Nächster Schritt: Implementierungsplan (writing-plans) → subagent-getriebene Umsetzung.
> **Datum:** 2026-06-01
> **Projekt:** MAGALOKO v2 (`F:\JTL_Export\JTL_Export\magaloko\v2`), live https://magalokohfk-xdnk.vercel.app

## Ziel

Den **VEKTRA-Trainer** (Akademie, das erste Präsentations-Feature für das HFK-Verkaufsteam) mobil **einhändig gut bedienbar** machen. Das Sales-Team nutzt ihn laut Strategie mobile-first (iOS Safari / Android Chrome, 390px-Klasse, einhändig). Konkretes, vom Audit belegtes Kernproblem: **untergroße Touch-Targets** — nackte Icon-Buttons ohne Hit-Area (16–24px) und Sekundär-/CTA-Buttons unter ~40px Tap-Höhe, teils direkt neben Eingabefeldern (Fehlklick-Risiko).

Dies ist **keine** visuelle Neugestaltung und **kein** Pauschal-Refactor. Der Trainings-Kern (Antwort-Buttons der Runner, `py-3.5`, ≈50px) ist mobil bereits vorbildlich und bleibt. Es geht ausschließlich um die im Audit konkret benannten Touch-/Layout-Schwachstellen.

## Scope

**In Scope (User-Entscheidung „Trainer + geteilte Shell-Fixes"):**
- Alle `components/akademie/*`-Komponenten des Trainers (Editoren, Runner, Launcher, Cards, Tabs, Listen).
- App-weite geteilte Primitives, die das mobile Trainer-Erlebnis rahmen: `components/shell/mag-shell.tsx` (Hamburger, Drawer-Close) und `components/_primitives/page-shell.tsx` (Header-Umbruch). Diese wirken auch auf Cockpit/Mago — bewusst akzeptiert, weil risikoarm (nur größere Hit-Area / saubererer Umbruch).

**Out of Scope (separate Aufträge):**
- DataTable-Mobile-Kartenstack (bereits vorbildlich gelöst).
- Topbar-Section-Kontext / Marken-Theming / Farb- oder Typo-Redesign.
- Bottom-Tab-Navigation, Daumen-Zonen-Umbau, sonstige Layout-Neukonzepte.

**Bewusst unangetastet (anti-pauschal, geschützte Akzente):**
- Mikro-Labels `text-[10px]` / `text-[11px]` (Nav-Section-Headings, Pills, Tabellen-Labels).
- `Pill`-Komponente, Card-Paddings `p-4`/`p-5`, `rounded-xl`.
- Antwort-Buttons der Runner (`px-4 py-3.5 text-base`, ≈50px) — Zielmuster.
- Safe-Area / `--tg-vh` / `env(safe-area-inset-bottom)` — korrekt.

## Architektur / Ansatz

**Hybrid (User-Entscheidung):** Ein gemeinsames Icon-Button-Primitive für das wiederkehrende „nacktes Icon ohne Hit-Area"-Muster + gezielte Inline-Bumps für die Einzel-/Text-Buttons. Das Primitive ist der gemeinsame Mechanismus, der „einheitlich" garantiert und künftige Drift verhindert (Altitude: ein Mechanismus statt ~10 Bandaids).

### Neues Primitive: `components/_primitives/icon-button.tsx`

Ein `<button>` mit garantierter 40/44px-Hit-Area; das Icon bleibt klein zentriert. Varianten als **exklusive Props** (Größe/Farbe nie via `className` überschrieben → keine Tailwind-Klassenkonflikte). `className` ausschließlich für Layout-Nudges (`-ml-2` / `-mr-2`). `type` default `"button"` (verhindert versehentliches Form-Submit in den Editor-Formularen).

```tsx
"use client";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

export function IconButton({
  icon, label, onClick, className, iconClassName = "h-4 w-4",
  type = "button", disabled, size = "md", tone = "default",
}: {
  icon: string;
  label: string;                 // aria-label (Pflicht — a11y)
  onClick?: () => void;
  className?: string;            // nur Layout-Nudges, NICHT Größe/Farbe
  iconClassName?: string;        // default h-4 w-4
  type?: "button" | "submit";
  disabled?: boolean;
  size?: "md" | "lg";            // md = 40px (Standard), lg = 44px
  tone?: "default" | "danger" | "strong";
}) {
  const sizes = { md: "h-10 w-10", lg: "h-11 w-11" };
  const tones = {
    default: "text-muted-2 hover:text-ink",
    danger: "text-muted-2 hover:text-red",
    strong: "text-ink",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={label}
      className={cn("grid shrink-0 place-items-center rounded-lg active:bg-surface-2 disabled:opacity-50",
        sizes[size], tones[tone], className)}>
      <Icon name={icon} className={iconClassName} />
    </button>
  );
}
```

### Einheitliche Tap-Regeln

1. **Icon-only-Buttons** (Icon ohne Text, ohne Padding) → `IconButton`. Standard `size="md"` (40px). `size="lg"` (44px) **nur** für: Hamburger, Drawer-Close, Lernpfad-Abhaken. `tone="danger"` für Lösch-/Entfernen-Aktionen, `tone="strong"` für den Hamburger, sonst `tone="default"`.
2. **Icon+Text-Buttons** → **nicht** auf IconButton umstellen; stattdessen inline `min-h-10` (40px) + `inline-flex items-center` ergänzen, Text bleibt.
3. **Sekundär-Text-Buttons / Links / Tabs** → inline `min-h-10` + Padding anheben (`py-1.5`→`py-2.5`); `text-xs`→`text-sm` wo die Tap-Höhe es braucht (kein Mikro-Label).
4. **Primär-CTAs** (Launcher-Start, Quiz/Drill/Szenario-Result „Nochmal/Fertig") → `py-3` bzw. `min-h-11` (44–46px).
5. **Native `<select>`** als Tap-Ziel → `min-h-11 py-2.5`.

**Spezialfall `path-card` Schritt-Abhaken:** Kein Icon, sondern ein bordierter Kreis mit Nummer/Häkchen. **Nicht** IconButton. Stattdessen äußere Tap-Fläche `h-11 w-11 grid place-items-center`, optischer Kreis als inneres `span h-6 w-6 rounded-full border` klein behalten.

## Fix-Inventar (40 Stellen / 19 Dateien)

Verbatim Vorher/Nachher steht im Implementierungsplan. Hier die vollständige Übersicht zur Review.

### A — Geteilte Shell-Primitives (app-weit)
| Datei | Stelle | Ansatz |
|---|---|---|
| `shell/mag-shell.tsx` | Drawer-Close (Icon `x`, h-5) | IconButton `lg`/`default`, `-mr-2` |
| `shell/mag-shell.tsx` | Hamburger (Icon `menu`, h-6) | IconButton `lg`/`strong`, `-ml-2` |
| `_primitives/page-shell.tsx` | Header `flex-wrap items-end` → mobil stapeln | layout |
| `_primitives/page-shell.tsx` | Action-Container → `flex-wrap` | layout |

### B — Trainer-Navigation
| Datei | Stelle | Ansatz |
|---|---|---|
| `akademie/akademie-tabs.tsx` | Scroll-Wrapper Scrollbar ausblenden (`[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`) | layout |
| `akademie/akademie-tabs.tsx` | Übersicht-Link `py-1.5`→`py-2.5` + `min-h-11` | inline-bump |
| `akademie/akademie-tabs.tsx` | Map-Tabs `py-1.5`→`py-2.5` + `min-h-11` | inline-bump |

### C — Trainer-Editoren (Listen / Forms)
| Datei | Stelle | Ansatz |
|---|---|---|
| `akademie/str-list.tsx` | Entfernen-× | IconButton `danger` |
| `akademie/str-list.tsx` | „+ hinzufügen" | inline-bump `min-h-10` |
| `akademie/drill-editor-form.tsx` | RowActions Bearbeiten / Löschen | IconButton `default`/`danger` |
| `akademie/drill-editor-form.tsx` | RowActions `gap-1`→`gap-2` | layout |
| `akademie/drill-editor-form.tsx` | Option-Entfernen-× | IconButton `danger` |
| `akademie/drill-editor-form.tsx` | Option-Zeile mobil stapeln | layout |
| `akademie/drill-editor-form.tsx` | Checkbox `h-5 w-5` | layout |
| `akademie/drill-editor-form.tsx` | „+ Option" | inline-bump `min-h-10` |
| `akademie/einwand-editor.tsx` | RowActions Bearbeiten / Löschen (icon-only) | IconButton `default`/`danger`, `gap-2` |
| `akademie/szenario-editor.tsx` | Card-Actions Bearbeiten / Löschen (Icon+Text) | inline-bump `min-h-10` |
| `akademie/szenario-editor.tsx` | SzenarioForm Option-Entfernen-× | IconButton `default` |
| `akademie/rollenspiel-editor.tsx` | Card-Actions Bearbeiten / Löschen (Icon+Text) | inline-bump `min-h-10` |
| `akademie/rollenspiel-editor.tsx` | RowList Entfernen-× | IconButton `default`, `-mr-2` |
| `akademie/angebot-editor.tsx` | Card-Actions Bearbeiten / Löschen (Icon+Text) | inline-bump `min-h-10` |
| `akademie/marke-editor.tsx` | Card-Actions Bearbeiten / Löschen (Icon+Text) | inline-bump `min-h-10` |
| `akademie/persona-editor.tsx` | Card-Actions Bearbeiten / Löschen (Icon+Text) | inline-bump `min-h-10` |

### D — Trainer Runner / Launcher / Cards
| Datei | Stelle | Ansatz |
|---|---|---|
| `akademie/path-card.tsx` | Schritt-Abhaken → 44px Wrapper + innerer Kreis | layout (Spezialfall) |
| `akademie/path-card.tsx` | „Öffnen →"-Link `py-1.5`→`py-2` + `min-h-10` | inline-bump |
| `akademie/challenge-card.tsx` | „Challenge starten"-CTA `py-2.5` + `min-h-11` | inline-bump |
| `akademie/quiz-runner.tsx` | Result „Nochmal" / „Fertig" `py-2`→`py-3` | inline-bump |
| `akademie/drill-runner.tsx` | Modal-Close-× | IconButton `default` |
| `akademie/drill-runner.tsx` | Result „Nochmal" / „Fertig" `py-2`→`py-3` | inline-bump |
| `akademie/szenario-runner.tsx` | Modal-Close-× | IconButton `default` |
| `akademie/szenario-runner.tsx` | Result „Nochmal" / „Fertig" `py-2`→`py-3` | inline-bump |
| `akademie/roleplay-runner.tsx` | Modal-Close-× | IconButton `default` |
| `akademie/roleplay-runner.tsx` | „Gespräch auswerten" (Icon+Text) `py-1.5`→`py-2.5` + `min-h-11` | inline-bump |
| `akademie/quiz-launcher.tsx` | gemeinsame `btn`-Klasse `py-2.5` + `min-h-11` | inline-bump |
| `akademie/drill-launcher.tsx` | Start-CTA `py-2.5` + `min-h-11` | inline-bump |
| `akademie/drill-launcher.tsx` | Marken-`<select>` `py-2.5` + `min-h-11` | layout |

## Import-/Cleanup-Hinweise (Korrekturen am Gather)

- **IconButton-Import benötigt in:** `mag-shell`, `str-list`, `drill-editor-form`, `drill-runner`, `szenario-runner`, `roleplay-runner`, `einwand-editor`, `szenario-editor` (wegen Option-Entfernen), `rollenspiel-editor`.
- **Kein IconButton-Import:** `quiz-runner` (nur Inline-Bumps — die Gather-Notiz war widersprüchlich), `page-shell`, `akademie-tabs`, `path-card`, `challenge-card`, `quiz-launcher`, `drill-launcher`, `angebot-editor`, `marke-editor`, `persona-editor`.
- **`akademie-tabs` Scrollbar:** `[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden` (das vom Gather genannte `scrollbar-width-none` ist **keine** gültige Klasse).
- **`einwand-editor`:** Nach Umbau beider RowActions auf IconButton wird `Icon` in der Datei evtl. ungenutzt → ungenutzten Import entfernen (der `tsc --noEmit`-Check verifiziert).

## Verifikation

Etablierter Loop: Edit → `tsc --noEmit` (`v2/node_modules/.bin/tsc.cmd`) → Commit direkt auf `main` → Push → Vercel-Deploy → Prod-Browser. Zusätzlich für diese mobile Aufgabe:

1. **Objektive Tap-Target-Messung** am 390px-Viewport auf Prod via `javascript_tool`: `getBoundingClientRect()` der betroffenen Buttons → Höhe/Breite ≥ 40px (bzw. ≥ 44px für `lg`/CTA). Auflösungs-unabhängig, kein Screenshot nötig.
2. **Überlauf-Check:** `document.documentElement.scrollWidth <= clientWidth` (kein horizontaler Überlauf) auf den Kernseiten (Akademie-Übersicht, Lernpfade, ein Editor, ein Runner-Modal).
3. **Finale Optik-Abnahme: durch Mago am echten Handy** (CLAUDE.md-Pflicht für visuelle Tasks — die Browser-Tool-Mobil-Screenshots lösen zu niedrig auf).

## Non-Goals / Risiken

- **Risiko Tailwind-Klassen:** `min-h-10`/`min-h-11`/`h-10`/`h-11` sind Standard-Scale (40/44px) und vorhanden. Die einzige Nicht-Standard-Klasse (`[scrollbar-width:none]` etc.) ist eine gültige Tailwind-Arbitrary-Property.
- **Risiko Regression Desktop:** Alle Bumps sind additiv (`min-h-*`, größeres `py`) oder responsive (`sm:`-Präfix beim page-shell-Header) — Desktop-Layout bleibt unverändert. `tsc` + Prod-Sichtung bestätigen.
- **Kein Unit-Test-Runner** im Projekt — `tsc --noEmit` + Prod-Browser-Messung ist der etablierte, ausreichende Verifikationsweg.
