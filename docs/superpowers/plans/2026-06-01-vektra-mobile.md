# VEKTRA-Trainer Mobile-Touch-Politur — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Untergroße Touch-Targets im VEKTRA-Trainer (+ geteilte Shell-Primitives) auf mobil-taugliche 40/44px bringen — via neuem `IconButton`-Primitive + gezielten Inline-Bumps.

**Architecture:** Hybrid. Ein `IconButton`-Primitive ersetzt alle nackten Icon-only-Buttons (garantierte Hit-Area); Icon+Text-/Text-/CTA-Buttons werden inline mit `min-h-10`/`min-h-11`/`py`-Anhebung versehen. Additive, größtenteils responsive Änderungen → Desktop bleibt unverändert.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4 + Design-Tokens (`@/components/icon`, `@/lib/cn`).

**Spec:** `docs/superpowers/specs/2026-06-01-vektra-mobile-design.md`

**Verifikation pro Task:** `tsc --noEmit`. Aus `F:\JTL_Export\JTL_Export\magaloko\v2`:
```powershell
Set-Location F:\JTL_Export\JTL_Export\magaloko\v2; .\node_modules\.bin\tsc.cmd --noEmit
```
Erwartet: keine Fehler. **Commits direkt auf `main`** (etablierter push→Prod-Loop). Kein Unit-Test-Runner — `tsc` + finale Prod-Browser-Messung (Task 10) ist der Verifikationsweg.

**Anti-Pauschal-Schutz (NICHT anfassen):** Mikro-Labels `text-[10px]`/`text-[11px]`, Pills, Card-Padding `p-4`/`p-5`, DataTable-Kartenstack, Antwort-Buttons der Runner (`py-3.5`).

**Wichtig für alle Tasks:** Jede `currentCode`-Stelle im Zweifel zuerst per Read im echten File verifizieren (Zeilennummern sind Richtwerte). Die Edits sind exakte String-Ersetzungen.

---

## File Structure

- **Neu:** `v2/components/_primitives/icon-button.tsx` — geteiltes Icon-Button-Primitive (eine Verantwortung: Icon-only-Button mit Hit-Area + Varianten).
- **Geändert (Shell, app-weit):** `v2/components/shell/mag-shell.tsx`, `v2/components/_primitives/page-shell.tsx`.
- **Geändert (Trainer):** `v2/components/akademie/`: `akademie-tabs`, `str-list`, `drill-editor-form`, `path-card`, `challenge-card`, `quiz-runner`, `drill-runner`, `szenario-runner`, `roleplay-runner`, `quiz-launcher`, `drill-launcher`, `einwand-editor`, `szenario-editor`, `rollenspiel-editor`, `angebot-editor`, `marke-editor`, `persona-editor`.

---

### Task 1: IconButton-Primitive anlegen

**Files:**
- Create: `v2/components/_primitives/icon-button.tsx`

- [ ] **Step 1: Datei anlegen**

```tsx
"use client";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

// Icon-only-Button mit garantierter Touch-Hit-Area (40/44px). Icon bleibt klein zentriert.
// Größe/Farbe nur über exklusive Props (nie via className) → keine Tailwind-Klassenkonflikte.
// className ausschließlich für Layout-Nudges (-ml-2 / -mr-2). type default "button" verhindert Form-Submit.
export function IconButton({
  icon, label, onClick, className, iconClassName = "h-4 w-4",
  type = "button", disabled, size = "md", tone = "default",
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  size?: "md" | "lg";
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

- [ ] **Step 2: tsc**

Run: `Set-Location F:\JTL_Export\JTL_Export\magaloko\v2; .\node_modules\.bin\tsc.cmd --noEmit`
Expected: keine Fehler.

- [ ] **Step 3: Commit**

```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/_primitives/icon-button.tsx; git commit -m "feat(vektra): IconButton-Primitive (40/44px Touch-Hit-Area)"
```

---

### Task 2: Shell-Primitives (mag-shell + page-shell)

**Files:**
- Modify: `v2/components/shell/mag-shell.tsx`
- Modify: `v2/components/_primitives/page-shell.tsx`

- [ ] **Step 1: mag-shell — IconButton-Import ergänzen**

Ergänze die Importzeile (nach dem bestehenden `Icon`-Import):
```tsx
import { IconButton } from "@/components/_primitives/icon-button";
```

- [ ] **Step 2: mag-shell — Drawer-Close (≈Z.89)**

Old:
```tsx
              <button onClick={() => setOpen(false)} aria-label="Schließen" className="text-muted-2"><Icon name="x" className="h-5 w-5" /></button>
```
New:
```tsx
              <IconButton icon="x" label="Schließen" onClick={() => setOpen(false)} size="lg" tone="default" iconClassName="h-6 w-6" className="-mr-2" />
```

- [ ] **Step 3: mag-shell — Hamburger (≈Z.99)**

Old:
```tsx
          <button onClick={() => setOpen(true)} aria-label="Menü"><Icon name="menu" className="h-6 w-6" /></button>
```
New:
```tsx
          <IconButton icon="menu" label="Menü" onClick={() => setOpen(true)} size="lg" tone="strong" iconClassName="h-6 w-6" className="-ml-2" />
```

- [ ] **Step 4: page-shell — Header mobil stapeln (≈Z.9)**

Old:
```tsx
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
```
New:
```tsx
      <header className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
```

- [ ] **Step 5: page-shell — Action-Container flex-wrap (≈Z.16)**

Old:
```tsx
        {action && <div className="flex gap-2">{action}</div>}
```
New:
```tsx
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
```

- [ ] **Step 6: tsc + Commit**

Run tsc (s.o.), erwartet keine Fehler.
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/shell/mag-shell.tsx v2/components/_primitives/page-shell.tsx; git commit -m "feat(vektra): mobile Hit-Area Hamburger/Drawer-Close + page-shell Header-Stack"
```

---

### Task 3: akademie-tabs (Tap-Höhe + Scrollbar)

**Files:**
- Modify: `v2/components/akademie/akademie-tabs.tsx`

- [ ] **Step 1: Scroll-Wrapper — Scrollbar ausblenden**

Old:
```tsx
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
```
New:
```tsx
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
```

- [ ] **Step 2: Übersicht-Link Tap-Höhe**

Old:
```tsx
            "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition",
```
New:
```tsx
            "whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition inline-flex items-center min-h-11",
```

- [ ] **Step 3: Map-Tabs Tap-Höhe**

Old:
```tsx
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition",
```
New:
```tsx
                "whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition inline-flex items-center min-h-11",
```

> Hinweis: Step 2 und Step 3 unterscheiden sich nur in der Einrückung (12 vs 16 Spaces) — beide Vorkommen sind unterschiedliche Tab-Blöcke. Edit jeweils mit exakter Einrückung.

- [ ] **Step 4: tsc + Commit**

```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/akademie/akademie-tabs.tsx; git commit -m "feat(vektra): Akademie-Tabs Tap-Höhe 44px + Scrollbar ausblenden"
```

---

### Task 4: str-list + drill-editor-form

**Files:**
- Modify: `v2/components/akademie/str-list.tsx`
- Modify: `v2/components/akademie/drill-editor-form.tsx`

- [ ] **Step 1: str-list — IconButton-Import**

Ergänze nach dem `Icon`-Import:
```tsx
import { IconButton } from "@/components/_primitives/icon-button";
```

- [ ] **Step 2: str-list — Entfernen-× (Z.15)**

Old:
```tsx
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-muted-2 hover:text-red" aria-label="entfernen"><Icon name="x" className="h-4 w-4" /></button>
```
New:
```tsx
            <IconButton icon="x" label="entfernen" onClick={() => setItems(items.filter((_, j) => j !== i))} tone="danger" />
```

- [ ] **Step 3: str-list — „+ hinzufügen" (Z.19)**

Old:
```tsx
      <button onClick={() => setItems([...items, ""])} className="mt-2 rounded bg-surface-2 px-2 py-1 text-xs font-semibold text-muted hover:text-ink">+ hinzufügen</button>
```
New:
```tsx
      <button onClick={() => setItems([...items, ""])} className="mt-2 rounded bg-surface-2 px-3 py-2 text-sm font-semibold text-muted hover:text-ink min-h-10">+ hinzufügen</button>
```

> Falls nach Step 2 `Icon` in str-list nicht mehr verwendet wird, ungenutzten Import entfernen (tsc-Check fängt es).

- [ ] **Step 4: drill-editor-form — IconButton-Import**

Ergänze nach dem `Icon`-Import:
```tsx
import { IconButton } from "@/components/_primitives/icon-button";
```

- [ ] **Step 5: drill-editor-form — RowActions gap (Z.36)**

Old:
```tsx
    <span className="inline-flex gap-1">
```
New:
```tsx
    <span className="inline-flex gap-2">
```

- [ ] **Step 6: drill-editor-form — RowActions Bearbeiten (Z.37)**

Old:
```tsx
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded bg-surface-2 px-2 py-1 text-xs hover:text-ink disabled:opacity-50" aria-label="Bearbeiten"><Icon name="edit" className="h-4 w-4" /></button>
```
New:
```tsx
      <IconButton disabled={busy} icon="edit" label="Bearbeiten" onClick={() => setEdit(true)} tone="default" />
```

- [ ] **Step 7: drill-editor-form — RowActions Löschen (Z.38)**

Old:
```tsx
      <button disabled={busy} onClick={del} className="rounded bg-red/10 px-2 py-1 text-xs text-red hover:bg-red/20 disabled:opacity-50" aria-label="Löschen"><Icon name="trash" className="h-4 w-4" /></button>
```
New:
```tsx
      <IconButton disabled={busy} icon="trash" label="Löschen" onClick={del} tone="danger" />
```

- [ ] **Step 8: drill-editor-form — Option-Zeile Layout (Z.80)**

Old:
```tsx
                <div className="flex flex-wrap items-center gap-2">
```
New:
```tsx
                <div className="flex flex-col gap-2 sm:flex-wrap sm:items-center">
```

- [ ] **Step 9: drill-editor-form — Checkbox-Größe (Z.82)**

Old:
```tsx
                    <input type="checkbox" checked={o.ist_richtig} onChange={(e) => updOpt(i, { ist_richtig: e.target.checked })} className="accent-green" />richtig
```
New:
```tsx
                    <input type="checkbox" checked={o.ist_richtig} onChange={(e) => updOpt(i, { ist_richtig: e.target.checked })} className="accent-green h-5 w-5" />richtig
```

- [ ] **Step 10: drill-editor-form — Option-Entfernen-× (Z.86)**

Old:
```tsx
                  <button onClick={() => setOpts(opts.filter((_, j) => j !== i))} className="text-muted-2 hover:text-red" aria-label="entfernen"><Icon name="x" className="h-4 w-4" /></button>
```
New:
```tsx
                  <IconButton icon="x" label="entfernen" onClick={() => setOpts(opts.filter((_, j) => j !== i))} tone="danger" />
```

- [ ] **Step 11: drill-editor-form — „+ Option" (Z.92)**

Old:
```tsx
          <button onClick={() => setOpts([...opts, blankOpt()])} className="mt-2 rounded bg-surface-2 px-2 py-1 text-xs font-semibold text-muted hover:text-ink">+ Option</button>
```
New:
```tsx
          <button onClick={() => setOpts([...opts, blankOpt()])} className="mt-2 rounded bg-surface-2 px-3 py-2 text-sm font-semibold text-muted hover:text-ink min-h-10">+ Option</button>
```

- [ ] **Step 12: tsc + Commit**

```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/akademie/str-list.tsx v2/components/akademie/drill-editor-form.tsx; git commit -m "feat(vektra): str-list + drill-editor Touch-Targets (IconButton, Option-Stack, Checkbox)"
```

---

### Task 5: path-card + challenge-card

**Files:**
- Modify: `v2/components/akademie/path-card.tsx`
- Modify: `v2/components/akademie/challenge-card.tsx`

- [ ] **Step 1: path-card — Schritt-Abhaken Hit-Area (≈Z.71)**

Zuerst Read die Datei und finde den Toggle-Button im `) : (`-Zweig. Ersetze den Button so, dass die äußere Tap-Fläche `h-11 w-11` ist und der optische Kreis als inneres `span h-6 w-6` erhalten bleibt:

Old (Struktur — exakte Einrückung im File verifizieren):
```tsx
                <button onClick={() => toggle(i)} disabled={busy != null}
                  aria-label={dn ? "Als offen markieren" : "Als erledigt markieren"}
                  className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs transition disabled:opacity-50",
                    dn ? "border-green bg-green text-bg" : "border-line text-muted-2 hover:border-accent")}>
                  {dn ? <Icon name="check" className="h-3 w-3" /> : i + 1}
                </button>
```
New:
```tsx
                <button onClick={() => toggle(i)} disabled={busy != null}
                  aria-label={dn ? "Als offen markieren" : "Als erledigt markieren"}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg transition disabled:opacity-50">
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs",
                    dn ? "border-green bg-green text-bg" : "border-line text-muted-2 hover:border-accent")}>
                    {dn ? <Icon name="check" className="h-3 w-3" /> : i + 1}
                  </span>
                </button>
```

- [ ] **Step 2: path-card — „Öffnen →"-Link (≈Z.83)**

Old:
```tsx
              <Link href={s.href} className="shrink-0 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10">Öffnen →</Link>
```
New:
```tsx
              <Link href={s.href} className="shrink-0 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/10 min-h-10">Öffnen →</Link>
```

- [ ] **Step 3: challenge-card — „Challenge starten"-CTA (≈Z.23)**

Old:
```tsx
            <button onClick={() => setOpen(true)} disabled={!playable}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50">
              Challenge starten
            </button>
```
New:
```tsx
            <button onClick={() => setOpen(true)} disabled={!playable}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50 min-h-11">
              Challenge starten
            </button>
```

- [ ] **Step 4: tsc + Commit**

```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/akademie/path-card.tsx v2/components/akademie/challenge-card.tsx; git commit -m "feat(vektra): path-card Abhak-Hit-Area + challenge-card CTA mobil"
```

---

### Task 6: quiz-runner + drill-runner + szenario-runner

**Files:**
- Modify: `v2/components/akademie/quiz-runner.tsx`
- Modify: `v2/components/akademie/drill-runner.tsx`
- Modify: `v2/components/akademie/szenario-runner.tsx`

> `quiz-runner` braucht KEINEN IconButton-Import (nur Inline-Bumps). `drill-runner` und `szenario-runner` brauchen ihn (Modal-Close).

- [ ] **Step 1: quiz-runner — Result „Nochmal" (Z.161)**

Old:
```tsx
            <button onClick={restart} className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg flex items-center gap-1.5"><Icon name="repeat" className="h-4 w-4" /> Nochmal</button>
```
New:
```tsx
            <button onClick={restart} className="rounded-lg bg-accent px-4 py-3 font-semibold text-bg flex items-center gap-1.5"><Icon name="repeat" className="h-4 w-4" /> Nochmal</button>
```

- [ ] **Step 2: quiz-runner — Result „Fertig" (Z.162)**

Old:
```tsx
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold flex items-center gap-1.5"><Icon name="check" className="h-4 w-4" /> Fertig</button>
```
New:
```tsx
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-3 font-semibold flex items-center gap-1.5"><Icon name="check" className="h-4 w-4" /> Fertig</button>
```

- [ ] **Step 3: drill-runner — IconButton-Import**

```tsx
import { IconButton } from "@/components/_primitives/icon-button";
```

- [ ] **Step 4: drill-runner — Modal-Close-× (Z.98)**

Old:
```tsx
        <button onClick={onClose} aria-label="Schließen" className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-muted hover:text-ink"><Icon name="x" className="h-4 w-4" /></button>
```
New:
```tsx
        <IconButton icon="x" label="Schließen" onClick={onClose} tone="default" />
```

- [ ] **Step 5: drill-runner — Result „Nochmal" (Z.83)**

Old:
```tsx
            <button onClick={restart} className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg"><Icon name="repeat" className="h-4 w-4 inline-block mr-1" />Nochmal</button>
```
New:
```tsx
            <button onClick={restart} className="rounded-lg bg-accent px-4 py-3 font-semibold text-bg"><Icon name="repeat" className="h-4 w-4 inline-block mr-1" />Nochmal</button>
```

- [ ] **Step 6: drill-runner — Result „Fertig" (Z.84)**

Old:
```tsx
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold"><Icon name="check" className="h-4 w-4 inline-block mr-1" />Fertig</button>
```
New:
```tsx
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-3 font-semibold"><Icon name="check" className="h-4 w-4 inline-block mr-1" />Fertig</button>
```

- [ ] **Step 7: szenario-runner — IconButton-Import**

```tsx
import { IconButton } from "@/components/_primitives/icon-button";
```

- [ ] **Step 8: szenario-runner — Modal-Close-× (Z.93)**

Old:
```tsx
        <button onClick={onClose} aria-label="Schließen" className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-muted hover:text-ink"><Icon name="x" className="h-4 w-4" /></button>
```
New:
```tsx
        <IconButton icon="x" label="Schließen" onClick={onClose} tone="default" />
```

- [ ] **Step 9: szenario-runner — Result „Nochmal" (Z.79)**

Old:
```tsx
            <button onClick={restart} className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg"><Icon name="repeat" className="h-4 w-4 inline-block mr-1" />Nochmal</button>
```
New:
```tsx
            <button onClick={restart} className="rounded-lg bg-accent px-4 py-3 font-semibold text-bg"><Icon name="repeat" className="h-4 w-4 inline-block mr-1" />Nochmal</button>
```

- [ ] **Step 10: szenario-runner — Result „Fertig" (Z.80)**

Old:
```tsx
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold"><Icon name="check" className="h-4 w-4 inline-block mr-1" />Fertig</button>
```
New:
```tsx
            <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-3 font-semibold"><Icon name="check" className="h-4 w-4 inline-block mr-1" />Fertig</button>
```

- [ ] **Step 11: tsc + Commit**

```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/akademie/quiz-runner.tsx v2/components/akademie/drill-runner.tsx v2/components/akademie/szenario-runner.tsx; git commit -m "feat(vektra): Runner Result-Buttons py-3 + Modal-Close IconButton"
```

---

### Task 7: roleplay-runner + quiz-launcher + drill-launcher

**Files:**
- Modify: `v2/components/akademie/roleplay-runner.tsx`
- Modify: `v2/components/akademie/quiz-launcher.tsx`
- Modify: `v2/components/akademie/drill-launcher.tsx`

> Nur `roleplay-runner` braucht den IconButton-Import.

- [ ] **Step 1: roleplay-runner — IconButton-Import**

```tsx
import { IconButton } from "@/components/_primitives/icon-button";
```

- [ ] **Step 2: roleplay-runner — Modal-Close-× (Z.108)**

Old:
```tsx
        <button onClick={onClose} aria-label="Schließen" className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-muted hover:text-ink"><Icon name="x" className="h-4 w-4" /></button>
```
New:
```tsx
        <IconButton icon="x" label="Schließen" onClick={onClose} tone="default" />
```

- [ ] **Step 3: roleplay-runner — „Gespräch auswerten" (Z.156-157)**

Old:
```tsx
            <button onClick={evaluate} disabled={sending}
              className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-surface-2/70 disabled:opacity-50"><Icon name="target" className="h-4 w-4 inline-block mr-1" />Gespräch auswerten</button>
```
New:
```tsx
            <button onClick={evaluate} disabled={sending}
              className="rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2/70 disabled:opacity-50 min-h-11"><Icon name="target" className="h-4 w-4 inline-block mr-1" />Gespräch auswerten</button>
```

- [ ] **Step 4: quiz-launcher — btn-Klasse (Z.11)**

Old:
```tsx
  const btn = "rounded-lg px-4 py-2 text-sm font-semibold transition";
```
New:
```tsx
  const btn = "rounded-lg px-4 py-2.5 text-sm font-semibold transition min-h-11";
```

- [ ] **Step 5: drill-launcher — Start-CTA (Z.23-29)**

Old:
```tsx
      <button
        onClick={() => setOpen(true)}
        disabled={!playable}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-1.5"
      >
        <Icon name="bolt" className="h-4 w-4" /> Drill-Training starten{playable ? ` (${playable})` : ""}
      </button>
```
New:
```tsx
      <button
        onClick={() => setOpen(true)}
        disabled={!playable}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-1.5 min-h-11"
      >
        <Icon name="bolt" className="h-4 w-4" /> Drill-Training starten{playable ? ` (${playable})` : ""}
      </button>
```

- [ ] **Step 6: drill-launcher — Marken-`<select>` (Z.31-38)**

Old:
```tsx
        <select
          value={marke}
          onChange={(e) => setMarke(e.target.value)}
          className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
```
New:
```tsx
        <select
          value={marke}
          onChange={(e) => setMarke(e.target.value)}
          className="rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent min-h-11"
        >
```

- [ ] **Step 7: tsc + Commit**

```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/akademie/roleplay-runner.tsx v2/components/akademie/quiz-launcher.tsx v2/components/akademie/drill-launcher.tsx; git commit -m "feat(vektra): roleplay Close/Auswerten + Launcher-CTAs/Select mobil"
```

---

### Task 8: einwand-editor + szenario-editor + rollenspiel-editor

**Files:**
- Modify: `v2/components/akademie/einwand-editor.tsx`
- Modify: `v2/components/akademie/szenario-editor.tsx`
- Modify: `v2/components/akademie/rollenspiel-editor.tsx`

> `einwand-editor`, `szenario-editor` (wegen Option-Entfernen) und `rollenspiel-editor` brauchen den IconButton-Import.

- [ ] **Step 1: einwand-editor — IconButton-Import**

```tsx
import { IconButton } from "@/components/_primitives/icon-button";
```

- [ ] **Step 2: einwand-editor — RowActions (Z.35-37, icon-only → IconButton)**

Old:
```tsx
    <span className="inline-flex gap-1">
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded bg-surface-2 px-2 py-1 text-xs hover:text-ink disabled:opacity-50" aria-label="Bearbeiten"><Icon name="edit" className="h-4 w-4" /></button>
      <button disabled={busy} onClick={del} className="rounded bg-red/10 px-2 py-1 text-xs text-red hover:bg-red/20 disabled:opacity-50" aria-label="Löschen"><Icon name="trash" className="h-4 w-4" /></button>
```
New:
```tsx
    <span className="inline-flex gap-2">
      <IconButton icon="edit" label="Bearbeiten" onClick={() => setEdit(true)} disabled={busy} />
      <IconButton icon="trash" label="Löschen" onClick={del} disabled={busy} tone="danger" />
```

> Nach diesem Edit prüfen, ob `Icon` in `einwand-editor` noch verwendet wird; falls nicht, den `Icon`-Import entfernen (tsc-Check verifiziert).

- [ ] **Step 3: szenario-editor — IconButton-Import**

```tsx
import { IconButton } from "@/components/_primitives/icon-button";
```

- [ ] **Step 4: szenario-editor — Card-Actions (Z.38-40, Icon+Text → inline-bump)**

Old:
```tsx
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
```
New:
```tsx
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-1.5 min-h-10 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="inline-flex items-center gap-1 rounded-lg bg-red/10 px-3 py-1.5 min-h-10 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4" />Löschen</button>
```

- [ ] **Step 5: szenario-editor — SzenarioForm Option-Entfernen-× (Z.101)**

Old:
```tsx
                    <button onClick={() => upd(i, { options: s.options.filter((_, k) => k !== j), correctIdx: Math.min(s.correctIdx, Math.max(0, s.options.length - 2)) })} className="text-muted-2 hover:text-red" aria-label="Option entfernen"><Icon name="x" className="h-4 w-4" /></button>
```
New:
```tsx
                    <IconButton icon="x" label="Option entfernen" onClick={() => upd(i, { options: s.options.filter((_, k) => k !== j), correctIdx: Math.min(s.correctIdx, Math.max(0, s.options.length - 2)) })} />
```

- [ ] **Step 6: rollenspiel-editor — IconButton-Import**

```tsx
import { IconButton } from "@/components/_primitives/icon-button";
```

- [ ] **Step 7: rollenspiel-editor — Card-Actions (Z.37-39, Icon+Text → inline-bump)**

Old:
```tsx
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
```
New:
```tsx
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-1.5 min-h-10 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="inline-flex items-center gap-1 rounded-lg bg-red/10 px-3 py-1.5 min-h-10 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4" />Löschen</button>
```

- [ ] **Step 8: rollenspiel-editor — RowList Entfernen-× (Z.51)**

Old:
```tsx
          <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="mt-1 text-muted-2 hover:text-red" aria-label="entfernen"><Icon name="x" className="h-4 w-4" /></button>
```
New:
```tsx
          <IconButton icon="x" label="entfernen" onClick={() => setItems(items.filter((_, j) => j !== i))} className="-mr-2" />
```

- [ ] **Step 9: tsc + Commit**

```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/akademie/einwand-editor.tsx v2/components/akademie/szenario-editor.tsx v2/components/akademie/rollenspiel-editor.tsx; git commit -m "feat(vektra): Editor-Card-Actions/RowActions Touch-Targets"
```

---

### Task 9: angebot-editor + marke-editor + persona-editor

**Files:**
- Modify: `v2/components/akademie/angebot-editor.tsx`
- Modify: `v2/components/akademie/marke-editor.tsx`
- Modify: `v2/components/akademie/persona-editor.tsx`

> Alle drei sind Icon+Text-Card-Actions → reine Inline-Bumps, KEIN IconButton-Import.

- [ ] **Step 1: angebot-editor — Card-Actions (Z.36-37)**

Old:
```tsx
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
```
New:
```tsx
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-2.5 text-xs font-semibold min-h-10 inline-flex items-center hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-2.5 text-xs font-semibold min-h-10 inline-flex items-center text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
```

- [ ] **Step 2: marke-editor — Card-Actions (Z.36-37)**

Old:
```tsx
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
```
New:
```tsx
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-2.5 text-xs font-semibold min-h-10 inline-flex items-center hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-2.5 text-xs font-semibold min-h-10 inline-flex items-center text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
```

- [ ] **Step 3: persona-editor — Card-Actions (Z.41-42)**

Old:
```tsx
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
```
New:
```tsx
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-2.5 text-xs font-semibold min-h-10 inline-flex items-center hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-2.5 text-xs font-semibold min-h-10 inline-flex items-center text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
```

- [ ] **Step 4: tsc + Commit**

```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/akademie/angebot-editor.tsx v2/components/akademie/marke-editor.tsx v2/components/akademie/persona-editor.tsx; git commit -m "feat(vektra): angebot/marke/persona Card-Actions min-h-10"
```

---

### Task 10: Push + Prod-Verifikation (objektive Tap-Target-Messung)

**Files:** keine — Verifikation.

- [ ] **Step 1: Push**

```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git push
```

- [ ] **Step 2: Deploy abwarten**

Vercel-Deploy von `main` abwarten (Region fra1). Deploy-Erkennung über Chunk-Fingerprint / Marker auf der Live-Seite.

- [ ] **Step 3: Objektive Messung am 390px-Viewport (Prod-Browser)**

Browser auf ~390px Breite. Auf den Kernseiten (Akademie-Übersicht, Lernpfade, ein Editor, ein offenes Runner-Modal) via `javascript_tool` messen:
- Tap-Targets (Hamburger, Drawer-Close, Tab, IconButton-Instanzen, CTAs): `el.getBoundingClientRect()` → Höhe & Breite **≥ 40px** (≥ 44px für `lg`/CTA).
- Überlauf: `document.documentElement.scrollWidth <= document.documentElement.clientWidth` → **true** (kein horizontaler Überlauf).

Beispiel-Snippet:
```js
JSON.stringify({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  taps: [...document.querySelectorAll('button[aria-label], a[href]')]
    .map(e => ({ l: e.getAttribute('aria-label') || e.textContent.trim().slice(0,16),
                 h: Math.round(e.getBoundingClientRect().height),
                 w: Math.round(e.getBoundingClientRect().width) }))
    .filter(t => t.h < 40)   // sollte (fast) leer sein
});
```

- [ ] **Step 4: Bericht an Nutzer**

Mess-Ergebnis berichten (welche Targets jetzt ≥40/44px, kein Überlauf). Hinweis: **finale Optik-Abnahme durch Mago am echten Handy** (CLAUDE.md-Pflicht).

---

## Self-Review (Plan gegen Spec)

- **Spec-Coverage:** Alle 40 Inventar-Stellen sind als Steps abgedeckt (Task 2–9), IconButton-Primitive (Task 1), Verifikation (Task 10). ✔
- **Import-Korrekturen:** quiz-runner ohne Import, szenario-editor mit Import, einwand-editor Icon-Cleanup-Hinweis — alle drin. ✔
- **Scrollbar-Fix:** `[scrollbar-width:none]` statt ungültigem `scrollbar-width-none`. ✔
- **Typkonsistenz:** IconButton-Props (`icon/label/onClick/className/iconClassName/type/disabled/size/tone`) identisch in Spec, Primitive (Task 1) und allen Aufrufen. ✔
- **Spezialfall path-card:** Wrapper-Muster (44px außen, Kreis innen) explizit, kein IconButton. ✔
