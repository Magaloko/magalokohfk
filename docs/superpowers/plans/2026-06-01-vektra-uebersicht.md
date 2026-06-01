# VEKTRA-Trainer Mobile-Übersichtlichkeit — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Mobile Übersichtlichkeit des VEKTRA-Trainers: Hub-first-Navigation (Tabs am Handy weg, Back-Link auf Unterseiten), Hub-Reihenfolge (Bereiche zuerst, Motivation schlank), Drills-Liste einklappbar. Desktop bleibt überall unverändert.

**Architecture:** Rein additive/responsive Tailwind-Änderungen (`md:`-Breakpoint, `order-*`, `hidden`/`md:block`) + ein neues kleines Client-Primitive. Keine Logik-/Datenänderung.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, `@/components/icon`, `@/lib/cn`.

**Spec:** `docs/superpowers/specs/2026-06-01-vektra-uebersicht-design.md`

**Verifikation pro Task:** `tsc --noEmit` aus `F:\JTL_Export\JTL_Export\magaloko\v2`:
```powershell
Set-Location F:\JTL_Export\JTL_Export\magaloko\v2; .\node_modules\.bin\tsc.cmd --noEmit
```
Erwartet: keine Fehler. **Commits direkt auf `main`.**

**Anti-Pauschal-Schutz (NICHT anfassen):** Bereichs-Seiten Einwände/Marken/Personas/Szenarien/Rollenspiele/Angebote, Desktop-Layout überall, Touch-Targets der letzten Runde.

**Wichtig:** `currentCode`-Stellen im Zweifel per Read verifizieren (Zeilennummern sind Richtwerte). Edits sind exakte String-Ersetzungen.

---

## File Structure

- **Neu:** `v2/components/_primitives/collapsible-on-mobile.tsx` — Handy-Einklapp-Wrapper (eine Verantwortung).
- **Geändert:** `v2/components/akademie/akademie-tabs.tsx` (responsive Navi), `v2/app/(app)/akademie/page.tsx` (Hub-Reihenfolge), `v2/app/(app)/akademie/drills/page.tsx` (Liste einklappbar).

---

### Task 1: CollapsibleOnMobile-Primitive

**Files:** Create `v2/components/_primitives/collapsible-on-mobile.tsx`

- [ ] **Step 1: Datei anlegen**

```tsx
"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";

// Klappt seinen Inhalt NUR am Handy ein (Toggle). Auf Desktop (md+) immer offen, kein Toggle
// → keine Desktop-Regression. Für Seiten, deren lange Liste mobil sekundär ist (z. B. Drills).
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

- [ ] **Step 2: tsc** → keine Fehler.
- [ ] **Step 3: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/_primitives/collapsible-on-mobile.tsx; git commit -m "feat(vektra): CollapsibleOnMobile-Primitive (mobil einklappbar, Desktop offen)"
```

---

### Task 2: Navigation hub-first — `akademie-tabs.tsx`

**Files:** Modify `v2/components/akademie/akademie-tabs.tsx`

- [ ] **Step 1: Return-Block ersetzen.** Ersetze den GESAMTEN `return (...)`-Block (ab `  return (` bis `  );`) durch:

Old:
```tsx
  return (
    <div className="sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/akademie"
          className={cn(
            "whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition inline-flex items-center min-h-11",
            overviewActive ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
          )}><span className="flex items-center gap-1"><Icon name="academy" className="h-4 w-4" />Übersicht</span></Link>
        {tabs.map((t) => {
          const href = `/akademie/${t.area}`;
          const active = pathname === href;
          return (
            <Link key={t.area} href={href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition inline-flex items-center min-h-11",
                active ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
              )}>{t.area === "lernpfade" ? <span className="flex items-center gap-1"><Icon name="compass" className="h-4 w-4" />{t.label}</span> : t.label}</Link>
          );
        })}
      </div>
    </div>
  );
```
New:
```tsx
  return (
    <>
      <div className="hidden md:block sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/akademie"
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition inline-flex items-center min-h-11",
              overviewActive ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
            )}><span className="flex items-center gap-1"><Icon name="academy" className="h-4 w-4" />Übersicht</span></Link>
          {tabs.map((t) => {
            const href = `/akademie/${t.area}`;
            const active = pathname === href;
            return (
              <Link key={t.area} href={href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition inline-flex items-center min-h-11",
                  active ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
                )}>{t.area === "lernpfade" ? <span className="flex items-center gap-1"><Icon name="compass" className="h-4 w-4" />{t.label}</span> : t.label}</Link>
            );
          })}
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

- [ ] **Step 2: tsc** → keine Fehler.
- [ ] **Step 3: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/akademie/akademie-tabs.tsx; git commit -m "feat(vektra): Akademie-Navi hub-first am Handy (Tabs Desktop, Back-Link mobil)"
```

---

### Task 3: Hub-Reihenfolge — `akademie/page.tsx`

**Files:** Modify `v2/app/(app)/akademie/page.tsx`

Mobil: Badges ausblenden + Bereiche-Grid per `order` nach oben. Desktop via `md:order-none` unverändert. Fortschritt-Section bleibt erste (Standard-Order), darum braucht sie keine order-Klasse.

- [ ] **Step 1: Badges-Reihe mobil ausblenden (Z.66)**

Old:
```tsx
          <div className="mt-3 flex flex-wrap gap-2">
```
New:
```tsx
          <div className="mt-3 hidden flex-wrap gap-2 md:flex">
```

- [ ] **Step 2: Bereiche-Section nach oben (mobil order-1) (Z.104)**

Old:
```tsx
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-2">Bereiche</h2>
```
New:
```tsx
        <section className="order-1 md:order-none">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-2">Bereiche</h2>
```

- [ ] **Step 3: ChallengeCard wrappen (order-2) (Z.79)**

Old:
```tsx
        {showQuick && <ChallengeCard drills={d.drills} einwaende={d.einwaende} marken={d.marken} doneToday={challengeDone} streak={progress.streak} />}
```
New:
```tsx
        {showQuick && <div className="order-2 md:order-none"><ChallengeCard drills={d.drills} einwaende={d.einwaende} marken={d.marken} doneToday={challengeDone} streak={progress.streak} /></div>}
```

- [ ] **Step 4: Lernpfade-Link (order-2) (Z.81)**

Old:
```tsx
        <Link href="/akademie/lernpfade" className="group flex items-center justify-between rounded-xl border border-line bg-gradient-to-br from-accent/10 to-transparent p-4 shadow-sm transition hover:border-accent">
```
New:
```tsx
        <Link href="/akademie/lernpfade" className="group order-2 md:order-none flex items-center justify-between rounded-xl border border-line bg-gradient-to-br from-accent/10 to-transparent p-4 shadow-sm transition hover:border-accent">
```

- [ ] **Step 5: ContinueCard wrappen (order-2) (Z.92)**

Old:
```tsx
        <ContinueCard allowed={areas} />
```
New:
```tsx
        <div className="order-2 md:order-none"><ContinueCard allowed={areas} /></div>
```

- [ ] **Step 6: Schnellstart-Section (order-2) (Z.95)**

Old:
```tsx
          <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
```
New:
```tsx
          <section className="order-2 md:order-none rounded-xl border border-line bg-surface p-4 shadow-sm">
```

- [ ] **Step 7: Bestenliste-Section (order-3) (Z.132)**

Old:
```tsx
          <section>
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="trophy" className="h-4 w-4" /> Bestenliste (anonym)</h2>
```
New:
```tsx
          <section className="order-3 md:order-none">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="trophy" className="h-4 w-4" /> Bestenliste (anonym)</h2>
```

> Logik der Order-Klassen: Fortschritt = Standard-Order 0 (oben). Mobil: Bereiche(1) → Challenge/Lernpfade/Continue/Schnellstart(2, DOM-Reihenfolge erhalten) → Bestenliste(3). Desktop: alle `md:order-none` (=0) → ursprüngliche DOM-Reihenfolge unverändert.

- [ ] **Step 8: tsc** → keine Fehler.
- [ ] **Step 9: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add "v2/app/(app)/akademie/page.tsx"; git commit -m "feat(vektra): Hub mobil Bereiche zuerst + Badges schlank (Desktop unveraendert)"
```

---

### Task 4: Drills-Liste einklappbar — `drills/page.tsx`

**Files:** Modify `v2/app/(app)/akademie/drills/page.tsx`

- [ ] **Step 1: Import ergänzen** (nach den bestehenden `_primitives`-Imports):
```tsx
import { CollapsibleOnMobile } from "@/components/_primitives/collapsible-on-mobile";
```

- [ ] **Step 2: DataTable wrappen (Z.27)**

Old:
```tsx
      <DataTable columns={cols} rows={d.drills} getKey={(r, i) => r.id || String(i)} empty={{ title: "Noch keine Drills", hint: "Lernsystem importieren." }} />
```
New:
```tsx
      <CollapsibleOnMobile title={`Alle ${d.drills.length} Drills`}>
        <DataTable columns={cols} rows={d.drills} getKey={(r, i) => r.id || String(i)} empty={{ title: "Noch keine Drills", hint: "Lernsystem importieren." }} />
      </CollapsibleOnMobile>
```

- [ ] **Step 3: tsc** → keine Fehler.
- [ ] **Step 4: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add "v2/app/(app)/akademie/drills/page.tsx"; git commit -m "feat(vektra): Drills-Voll-Liste am Handy einklappbar (Launcher bleiben oben)"
```

---

### Task 5: Push + Prod-Verifikation (mobil + Desktop-Gegencheck)

**Files:** keine.

- [ ] **Step 1: Push** `cd F:/JTL_Export/JTL_Export/magaloko; git push`
- [ ] **Step 2: Deploy abwarten** (Marker im Browser prüfen).
- [ ] **Step 3: Mobil (390px) prüfen:**
  - `/akademie`: keine Tab-Leiste; Badges versteckt; Bereiche-Grid direkt nach der Fortschritts-Zeile (per JS: Reihenfolge der Sektionen). Kein horizontaler Überlauf.
  - `/akademie/drills`: „← VEKTRA-Übersicht" oben statt Tabs; Drill-Liste eingeklappt; Toggle klappt sie auf.
  - Eine reine Inhalts-Seite (z. B. `/akademie/einwaende`): „← VEKTRA-Übersicht" oben, Liste unverändert sichtbar.
- [ ] **Step 4: Desktop-Gegencheck (≥768px):** Tab-Leiste sichtbar; Hub-Reihenfolge wie vorher; Drills-Liste offen ohne Toggle; Badges sichtbar.
- [ ] **Step 5: Bericht** + Hinweis: finale Optik-Abnahme durch Mago am echten Handy.

---

## Self-Review (Plan gegen Spec)

- **Coverage:** Navigation (T2), Hub-Reihenfolge+Slim (T3), Drills einklappbar (T1+T4), Verifikation (T5). ✔
- **Desktop-Schutz:** `hidden md:block`/`md:hidden` (T2), `md:order-none` (T3), `md:block` im Primitive (T1/T4) → Desktop überall neutral. ✔
- **Icon:** `arrow-right` (existiert, `icon.tsx:52`), rotiert. ✔
- **Order-Eindeutigkeit:** Fortschritt ohne Klasse (Order 0); Bereiche 1, Mitte 2, Bestenliste 3; `<section>`-Mehrdeutigkeit durch h2-Kontext aufgelöst. ✔
- **Out of Scope:** andere Bereichs-Seiten + Desktop unangetastet. ✔
