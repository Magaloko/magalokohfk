# MasterMind Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die App präsentationsreif auf den MasterMind-Plan ausrichten — App-Marke „VEKTRA"→„MasterMind", Trainer (Akademie)→„VEKTRA", Plan als Heim (`/mastermind`), gruppierte Navigation — ohne Slug-/Daten-/Guard-Änderung.

**Architecture:** Next.js 15 App Router (Server Components). Reine Label-/Branding-/Struktur-Änderungen + eine neue Top-Level-Route `/mastermind` (extrahierte Plan-Komponente, wiederverwendet `lib/strategy.ts`). Bestehende Routen-Slugs bleiben (Bot-Deeplinks/interne Links intakt); `/cockpit/strategie` wird Redirect.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4. **Verifikation in diesem Projekt:** kein Unit-Test-Runner — Gate ist `tsc --noEmit` (`v2/node_modules/.bin/tsc.cmd`) + `node --check` für `.mjs`, danach push→Prod-Browser (etablierter Loop). Arbeitsverzeichnis: `F:\JTL_Export\JTL_Export\magaloko\v2`. Commits direkt auf `main`.

**Disambiguierungs-Regel (gilt durchgängig):** „VEKTRA" als **App-Marke/Datenbasis** → „MasterMind". „VEKTRA" als **Werkzeug/Trainer** (`lib/strategy.ts` werkzeug.name, `lib/phases.ts`, Bot-Trainer-Menü „🎯 VEKTRA") → **bleibt VEKTRA**. Trainer-Bereich „Akademie" → sichtbar „VEKTRA". **Slugs nie umbenennen.**

---

## Task 1: MasterMind-Heim + Routing

**Files:**
- Create: `v2/components/mastermind/plan-view.tsx`
- Create: `v2/app/(app)/mastermind/page.tsx`
- Create: `v2/app/(app)/vektra/page.tsx`
- Modify (ersetzen): `v2/app/(app)/cockpit/strategie/page.tsx`
- Modify: `v2/app/page.tsx`
- Modify: `v2/components/cockpit/cockpit-tabs.tsx`
- Modify: `v2/app/(app)/cockpit/page.tsx`

- [ ] **Step 1: Plan-View-Komponente anlegen** (extrahierter Render-Body aus `cockpit/strategie`)

Create `v2/components/mastermind/plan-view.tsx`:

```tsx
import { MASTERMIND, type Werkzeug } from "@/lib/strategy";
import { Card, Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";

const statusTone = (s: Werkzeug["status"]): "green" | "accent" | "muted" =>
  s === "Live" ? "green" : s === "Geplant" ? "accent" : "muted";

function SectionTitle({ icon, kicker, title }: { icon: string; kicker: string; title: string }) {
  return (
    <div className="mb-3 mt-8 first:mt-0">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
        <Icon name={icon} className="h-3.5 w-3.5" /> {kicker}
      </div>
      <h2 className="mt-1 text-lg font-extrabold tracking-tight">{title}</h2>
    </div>
  );
}

// Render-Body des MasterMind-Plans (aus cockpit/strategie extrahiert).
// Reine Server-Component (kein State) — wird von app/(app)/mastermind/page.tsx in eine
// PageShell eingebettet. MASTERMIND ist die Single Source of Truth aus lib/strategy.ts.
export function PlanView() {
  const m = MASTERMIND;

  return (
    <>
      {/* Hero */}
      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="amber"><Icon name="lock" className="mr-1 h-3 w-3" /> GF-SAFE</Pill>
          <span className="text-xs text-muted-2">{m.vertraulich}</span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{m.tagline}</h2>
        <p className="mt-1 text-sm font-semibold text-muted">{m.unterzeile}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{m.vision}</p>
      </section>

      {/* Wo wir stehen */}
      <SectionTitle icon="pin" kicker="Wo wir stehen" title="Ausgangslage & zentrale Frage" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm leading-relaxed text-muted">{m.position}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{m.phase}</p>
        </Card>
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent">
            <Icon name="compass" className="h-3.5 w-3.5" /> Die zentrale strategische Frage
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-ink">{m.zentraleFrage}</p>
        </div>
      </div>

      {/* Zwei strategische Hebel */}
      <SectionTitle icon="lever" kicker="Fundament" title="Die zwei strategischen Hebel" />
      <div className="grid gap-4 sm:grid-cols-2">
        {m.hebel.map((h, i) => (
          <Card key={h.titel}>
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/15 font-extrabold text-accent">{i + 1}</span>
              <div>
                <h3 className="text-sm font-bold">{h.titel}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{h.beschreibung}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Vertrauensebenen */}
      <SectionTitle icon="key" kicker="Architektur-Pflicht" title="Drei Vertrauensebenen" />
      <div className="grid gap-3 sm:grid-cols-3">
        {m.vertrauensebenen.map((v) => (
          <Card key={v.ebene}>
            <Pill tone={v.ebene === "GF-SAFE" ? "amber" : v.ebene === "TEAM" ? "accent" : "green"}>{v.ebene}</Pill>
            <div className="mt-2 text-sm font-bold">{v.wer}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-2">{v.beispiele}</p>
          </Card>
        ))}
      </div>

      {/* Werkzeug-Set */}
      <SectionTitle icon="cockpit" kicker="Das Werkzeug-Set" title="Fünf operative Werkzeuge" />
      <div className="grid gap-4 lg:grid-cols-2">
        {m.werkzeuge.map((w) => (
          <div key={w.key}
            className={`rounded-xl border bg-surface p-5 shadow-sm ${w.istDieseApp ? "border-accent ring-1 ring-accent/30" : "border-line"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                  <Icon name={w.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold leading-none">{w.name}</h3>
                  <span className="text-xs text-muted-2">{w.rolle}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Pill tone={statusTone(w.status)}>{w.status}</Pill>
                {w.istDieseApp && <span className="text-[10px] font-bold uppercase tracking-wide text-accent">Diese App</span>}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{w.zweck}</p>
            <ul className="mt-3 grid gap-1">
              {w.faehigkeiten.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-muted-2">
                  <Icon name="check" className="mt-0.5 h-3 w-3 shrink-0 text-accent" /> <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
              <Icon name="bolt" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
              <span><span className="font-semibold text-ink">Hebel:</span> {w.hebel}</span>
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-wide text-muted-2">{w.agentTyp}</div>
          </div>
        ))}
      </div>

      {/* Future Scope */}
      <SectionTitle icon="rocket" kicker="Future Scope" title="Zwei strategische Erweiterungen" />
      <div className="grid gap-4 sm:grid-cols-2">
        {m.futureScope.map((f) => (
          <Card key={f.name}>
            <div className="flex items-center gap-2">
              <Icon name={f.icon} className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-bold">{f.name}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.beschreibung}</p>
            <p className="mt-3 text-xs font-medium text-muted-2">{f.status}</p>
          </Card>
        ))}
      </div>

      {/* Roadmap */}
      <SectionTitle icon="repeat" kicker="Roadmap" title="Sequenz — Foundation zuerst" />
      <Card>
        <ol className="flex flex-col">
          {m.roadmap.map((r, i) => (
            <li key={r.schritt} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${r.istDieseApp ? "bg-accent text-bg" : "bg-accent/15 text-accent"}`}>{r.schritt}</span>
                {i < m.roadmap.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold">{r.titel}</h3>
                  {r.istDieseApp && <Pill tone="green">live · diese App</Pill>}
                  {r.timing && <span className="text-xs text-muted-2">{r.timing}</span>}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{r.beschreibung}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Ziele 2028 */}
      <SectionTitle icon="target" kicker="Wo wir in 24 Monaten stehen" title="Ziele bis Mitte 2028" />
      <div className="grid gap-3 sm:grid-cols-2">
        {m.ziele2028.map((z, i) => (
          <div key={i} className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-4 shadow-sm">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-green" />
            <p className="text-sm leading-relaxed text-muted">{z}</p>
          </div>
        ))}
      </div>

      {/* Differenzierung */}
      <SectionTitle icon="star" kicker="Was uns vom Markt unterscheidet" title="Die HFK-Differenzierung" />
      <div className="grid gap-3 lg:grid-cols-3">
        {m.differenzierung.map((d, i) => (
          <Card key={i}><p className="text-sm leading-relaxed text-muted">{d}</p></Card>
        ))}
      </div>

      {/* Prinzipien */}
      <SectionTitle icon="globe" kicker="Nicht verhandelbar" title="Architektur-Prinzipien" />
      <div className="grid gap-3 sm:grid-cols-2">
        {m.prinzipien.map((p) => (
          <Card key={p.titel}>
            <h3 className="text-sm font-bold">{p.titel}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{p.beschreibung}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: MasterMind-Heim-Seite anlegen**

Create `v2/app/(app)/mastermind/page.tsx`:

```tsx
import { requireAdmin } from "@/lib/auth-helpers";
import { MASTERMIND } from "@/lib/strategy";
import { PageShell } from "@/components/_primitives/page-shell";
import { PlanView } from "@/components/mastermind/plan-view";

export const dynamic = "force-dynamic";

// MasterMind — Stephans Strategie & Roadmap. Admin-Heim (Root-Redirect zeigt hierher).
// Render-Body liegt in components/mastermind/plan-view.tsx (Single Source: lib/strategy.ts).
export default async function MasterMindPage() {
  await requireAdmin();
  const m = MASTERMIND;

  return (
    <PageShell icon="compass" title="Strategie & Roadmap" subtitle={`MasterMind — der Plan von Stephan · ${m.version}`}>
      <PlanView />
    </PageShell>
  );
}
```

- [ ] **Step 3: `/cockpit/strategie` zum Redirect machen** (Slug bleibt, leitet auf `/mastermind`)

Replace the ENTIRE content of `v2/app/(app)/cockpit/strategie/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Verschoben: Der MasterMind-Plan lebt jetzt unter /mastermind.
// Slug bleibt erhalten (bestehende Links/Tabs funktionieren), leitet nur weiter.
export default function StrategieRedirect() {
  redirect("/mastermind");
}
```

- [ ] **Step 4: Komfort-Redirect `/vektra` → `/akademie`**

Create `v2/app/(app)/vektra/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Komfort-Redirect: /vektra → /akademie (der Trainer-/VEKTRA-Bereich).
export default function VektraRedirect() {
  redirect("/akademie");
}
```

- [ ] **Step 5: Root-Redirect Admin → `/mastermind`**

In `v2/app/page.tsx`, replace exactly:

```tsx
  redirect(isAdmin(sess) ? "/heute" : "/akademie");
```

with:

```tsx
  redirect(isAdmin(sess) ? "/mastermind" : "/akademie");
```

- [ ] **Step 6: Interne Plan-Links auf `/mastermind` umstellen**

In `v2/components/cockpit/cockpit-tabs.tsx`, replace exactly:

```tsx
  { href: "/cockpit/strategie", icon: "globe", label: "Strategie" },
```

with:

```tsx
  { href: "/mastermind", icon: "globe", label: "Strategie" },
```

In `v2/app/(app)/cockpit/page.tsx`, replace exactly:

```tsx
          <Link href="/cockpit/strategie" className="shrink-0 text-xs font-semibold text-accent">Plan ansehen →</Link>
```

with:

```tsx
          <Link href="/mastermind" className="shrink-0 text-xs font-semibold text-accent">Plan ansehen →</Link>
```

- [ ] **Step 7: Typecheck**

Run (in `v2/`): `./node_modules/.bin/tsc.cmd --noEmit`
Expected: 0 Fehler (Exit 0). Falls Fehler zu `@/components/mastermind/plan-view` → Pfad/Export prüfen.

- [ ] **Step 8: Commit**

```bash
git -C "F:/JTL_Export/JTL_Export/magaloko" add -- "v2/components/mastermind/plan-view.tsx" "v2/app/(app)/mastermind/page.tsx" "v2/app/(app)/vektra/page.tsx" "v2/app/(app)/cockpit/strategie/page.tsx" "v2/app/page.tsx" "v2/components/cockpit/cockpit-tabs.tsx" "v2/app/(app)/cockpit/page.tsx"
git -C "F:/JTL_Export/JTL_Export/magaloko" commit -m "feat(v2): MasterMind-Heim /mastermind + Root-Redirect + Strategie-Redirect (Phase 1)"
```

---

## Task 2: Branding App → MasterMind (Shell · Login · Layout)

**Files:**
- Modify: `v2/app/layout.tsx`
- Modify: `v2/app/login/page.tsx`
- Modify (ersetzen): `v2/components/shell/mag-shell.tsx`

- [ ] **Step 1: Layout-Metadata (Titel + Description)**

In `v2/app/layout.tsx`, replace exactly:

```tsx
  title: { default: "VEKTRA", template: "%s · VEKTRA" },
  description: "HFK Cockpit & Verkaufs-Akademie",
```

with:

```tsx
  title: { default: "MasterMind", template: "%s · MasterMind" },
  description: "HFK Cockpit & VEKTRA",
```

- [ ] **Step 2: Login-Marke + Untertitel**

In `v2/app/login/page.tsx`, replace exactly:

```tsx
          <div><div className="text-lg font-extrabold">VEKTRA</div><div className="text-xs text-muted-2">Cockpit & Akademie</div></div>
```

with:

```tsx
          <div><div className="text-lg font-extrabold">MasterMind</div><div className="text-xs text-muted-2">Cockpit & VEKTRA</div></div>
```

- [ ] **Step 3: Shell — gruppierte Nav + Marke MasterMind + Nav-Label VEKTRA**

Replace the ENTIRE content of `v2/components/shell/mag-shell.tsx` with:

```tsx
"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";

type Hub = { href: string; label: string; icon: string; adminOnly?: boolean; superOnly?: boolean };
type Section = { title?: string; adminOnly?: boolean; items: Hub[] };

// Gruppierte Navigation. Sichtbarkeit weiter über adminOnly/superOnly je Eintrag.
// Sektions-Überschriften werden nur gerendert, wenn mind. ein Eintrag der Gruppe sichtbar ist.
const SECTIONS: Section[] = [
  { items: [
    { href: "/mastermind", label: "MasterMind", icon: "compass", adminOnly: true },
    { href: "/akademie", label: "VEKTRA", icon: "academy" },
  ] },
  { title: "Steuerung", adminOnly: true, items: [
    { href: "/heute", label: "Heute", icon: "home", adminOnly: true },
    { href: "/cockpit", label: "Lieferung", icon: "cockpit", adminOnly: true },
    { href: "/kalender", label: "Kalender", icon: "calendar", adminOnly: true },
  ] },
  { title: "Team", items: [
    { href: "/cockpilot", label: "Cockpilot", icon: "sparkles" },
    { href: "/werkstatt", label: "Werkstatt", icon: "bulb" },
  ] },
  { items: [
    { href: "/mago", label: "Mago", icon: "briefcase", superOnly: true },
    { href: "/einstellungen", label: "Einstellungen", icon: "settings", superOnly: true },
  ] },
];

export function MagShell({ role, superAdmin = false, children }: { role: string; superAdmin?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = role === "admin";
  const canSee = (h: Hub) => (h.superOnly ? superAdmin : !h.adminOnly || isAdmin);
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Pro Sektion nur sichtbare Einträge; Sektionen ohne sichtbare Einträge fallen weg.
  const sections = SECTIONS
    .map((s) => ({ ...s, items: s.items.filter(canSee) }))
    .filter((s) => s.items.length > 0);

  const Nav = (
    <nav className="flex flex-col gap-1 p-3">
      {sections.map((s, i) => (
        <div key={s.title ?? `s${i}`} className="flex flex-col gap-1">
          {s.title && (
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted-2">{s.title}</div>
          )}
          {s.items.map((h) => (
            <Link key={h.href} href={h.href} onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                active(h.href) ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
              )}>
              <Icon name={h.icon} className="h-5 w-5" />{h.label}
            </Link>
          ))}
        </div>
      ))}
      <form action="/api/logout" method="post" className="mt-2">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-2 hover:bg-surface-2 hover:text-red">
          <Icon name="logout" className="h-5 w-5" />Abmelden
        </button>
      </form>
    </nav>
  );

  return (
    <div className="flex min-h-[var(--tg-vh,100vh)]">
      {/* Desktop-Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface md:block">
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/20 font-extrabold text-accent">M</div>
          <div><div className="text-sm font-extrabold">MasterMind</div><div className="text-xs text-muted-2">{isAdmin ? "Admin" : "VEKTRA"}</div></div>
        </div>
        {Nav}
      </aside>

      {/* Mobile-Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-line bg-surface">
            <div className="flex items-center justify-between px-4 py-5">
              <span className="font-extrabold">MasterMind</span>
              <button onClick={() => setOpen(false)} aria-label="Schließen" className="text-muted-2"><Icon name="x" className="h-5 w-5" /></button>
            </div>
            {Nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar (mobil) */}
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menü"><Icon name="menu" className="h-6 w-6" /></button>
          <span className="font-extrabold">MasterMind</span>
        </header>
        <main className="min-w-0 flex-1 pb-[env(safe-area-inset-bottom)]">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run (in `v2/`): `./node_modules/.bin/tsc.cmd --noEmit`
Expected: 0 Fehler. (MagShell-Signatur `(role, superAdmin, children)` unverändert → `(app)/layout.tsx`-Aufruf bleibt kompatibel.)

- [ ] **Step 5: Commit**

```bash
git -C "F:/JTL_Export/JTL_Export/magaloko" add -- "v2/app/layout.tsx" "v2/app/login/page.tsx" "v2/components/shell/mag-shell.tsx"
git -C "F:/JTL_Export/JTL_Export/magaloko" commit -m "feat(v2): App-Marke -> MasterMind + gruppierte Nav (Phase 1)"
```

---

## Task 3: Trainer-Relabel Akademie → VEKTRA + Werkzeug-Präzisierung

**Files:**
- Modify: `v2/app/(app)/akademie/page.tsx`
- Modify: `v2/lib/bot/handler.mjs`
- Modify: `v2/app/(app)/cockpit/page.tsx`
- Modify: `v2/lib/strategy.ts`

- [ ] **Step 1: Trainer-Hub-Titel**

In `v2/app/(app)/akademie/page.tsx`, replace exactly:

```tsx
    <PageShell title="Akademie" icon="academy" subtitle="Dein Verkaufstraining — wähle einen Bereich oder leg direkt los.">
```

with:

```tsx
    <PageShell title="VEKTRA" icon="academy" subtitle="Dein Verkaufstraining — wähle einen Bereich oder leg direkt los.">
```

- [ ] **Step 2: Bot — Menü-Button + Start-Header (Trainer = VEKTRA; Route bleibt)**

In `v2/lib/bot/handler.mjs`, replace exactly:

```js
  else btn = { type: "web_app", text: "🎓 Akademie", web_app: { url: WEBAPP_URL + "/akademie" } };
```

with:

```js
  else btn = { type: "web_app", text: "🎓 VEKTRA", web_app: { url: WEBAPP_URL + "/akademie" } };
```

And replace exactly (Start-Header; nur das erste Listen-Element):

```js
  const lines = ["🎓 <b>HFK Verkaufs-Akademie</b>", "", "Trainiere Produktwissen & Verkauf — direkt im Chat.", "", "<b>🎯 Training:</b>", "/drill — Zufalls-Quiz", "/quiz — Gemischtes Quiz (z.B. <code>/quiz 7</code>)", "/tagesaufgabe — Tägliche Challenge ☀️", "/marke <i>LIEWOOD</i> · /einwand <i>preis</i> · /persona <i>anna</i>", "/rollenspiel · /score · /lern", "/check — Wissens-Check · /fortschritt — Skill-Profil", "", "<b>🧠 Microsoft Copilot:</b>", "/copilot — Hilfe & Schritt-für-Schritt zu Outlook, Excel, Word, Teams"];
```

with:

```js
  const lines = ["🎓 <b>HFK VEKTRA</b>", "", "Trainiere Produktwissen & Verkauf — direkt im Chat.", "", "<b>🎯 Training:</b>", "/drill — Zufalls-Quiz", "/quiz — Gemischtes Quiz (z.B. <code>/quiz 7</code>)", "/tagesaufgabe — Tägliche Challenge ☀️", "/marke <i>LIEWOOD</i> · /einwand <i>preis</i> · /persona <i>anna</i>", "/rollenspiel · /score · /lern", "/check — Wissens-Check · /fortschritt — Skill-Profil", "", "<b>🧠 Microsoft Copilot:</b>", "/copilot — Hilfe & Schritt-für-Schritt zu Outlook, Excel, Word, Teams"];
```

**NICHT anfassen:** `handler.mjs:332` „🎯 VEKTRA — Was möchtest du tun?" (Bot-Trainer-Menü, bleibt VEKTRA).

- [ ] **Step 3: Cockpit-Hero — Werkzeug-Präzisierung**

In `v2/app/(app)/cockpit/page.tsx`, replace exactly:

```tsx
            <p className="mt-1 max-w-2xl text-sm text-muted">VEKTRA (diese App) ist der erste sichtbare Baustein, aber bewusst nachrangig. Der strategische Schwerpunkt bleibt Foundation, Treasury und Einkauf.</p>
```

with:

```tsx
            <p className="mt-1 max-w-2xl text-sm text-muted">VEKTRA (der Trainer) ist der erste sichtbare Baustein, aber bewusst nachrangig. Der strategische Schwerpunkt bleibt Foundation, Treasury und Einkauf.</p>
```

- [ ] **Step 4: Strategy-Kommentar präzisieren** (Werkzeug-Name bleibt VEKTRA!)

In `v2/lib/strategy.ts`, replace exactly:

```ts
// VEKTRA = diese App.
```

with:

```ts
// VEKTRA = das Trainer-Werkzeug dieser App (MasterMind).
```

- [ ] **Step 5: Verifikation**

Run (in `v2/`): `./node_modules/.bin/tsc.cmd --noEmit` → 0 Fehler.
Run: `node --check v2/lib/bot/handler.mjs` → Exit 0.

- [ ] **Step 6: Commit**

```bash
git -C "F:/JTL_Export/JTL_Export/magaloko" add -- "v2/app/(app)/akademie/page.tsx" "v2/lib/bot/handler.mjs" "v2/app/(app)/cockpit/page.tsx" "v2/lib/strategy.ts"
git -C "F:/JTL_Export/JTL_Export/magaloko" commit -m "feat(v2): Trainer-Relabel Akademie -> VEKTRA (Phase 1)"
```

---

## Task 4: Interne App-Marken-Strings „VEKTRA" → „MasterMind"

Nur **App-Marke/Datenbasis** (KI-Prompts/Copy). Werkzeug/Trainer-Vorkommen (`strategy.ts`, `phases.ts`, Bot „🎯 VEKTRA", `handler.mjs:490` „VEKTRA-Kontext") **bleiben unverändert**.

**Files:**
- Modify: `v2/lib/ai.ts`
- Modify: `v2/lib/stephan-context.ts`
- Modify: `v2/components/cockpit/stephan-assist.tsx`
- Modify: `v2/app/api/stephan-assist/route.ts`
- Modify: `v2/app/(app)/cockpit/stephan/page.tsx`
- Modify: `v2/lib/copilot-kb.mjs`

- [ ] **Step 1: `lib/ai.ts` (5 Stellen)**

Replace each exactly:

1. `// Stephan-Assistent: Antwort auf eine eingehende Nachricht — STRENG nur auf Basis der VEKTRA-Wissensbasis.`
   → `// Stephan-Assistent: Antwort auf eine eingehende Nachricht — STRENG nur auf Basis der MasterMind-Wissensbasis.`
2. `    "Du bist der VEKTRA-Assistent und hilfst Mago (Dienstleister/Entwickler), Nachrichten seines Auftraggebers Stephan zu beantworten. Stephan ist Inhaber von „Herr und Frau Klein“ (HFK), einem Babyfachhandel in Wien/Österreich.",`
   → `    "Du bist der MasterMind-Assistent und hilfst Mago (Dienstleister/Entwickler), Nachrichten seines Auftraggebers Stephan zu beantworten. Stephan ist Inhaber von „Herr und Frau Klein“ (HFK), einem Babyfachhandel in Wien/Österreich.",`
3. `    "1. Stütze die Antwort AUSSCHLIESSLICH auf die unten stehende VEKTRA-WISSENSBASIS. Nutze KEIN externes Wissen, keine Annahmen, keine erfundenen Zahlen, Namen, Preise, Fristen oder Fakten.",`
   → `    "1. Stütze die Antwort AUSSCHLIESSLICH auf die unten stehende MASTERMIND-WISSENSBASIS. Nutze KEIN externes Wissen, keine Annahmen, keine erfundenen Zahlen, Namen, Preise, Fristen oder Fakten.",`
4. `    "2. Wenn die Wissensbasis die Frage nicht oder nur teilweise beantwortet, sage das ausdrücklich: „Dazu liegen in VEKTRA keine Daten vor.“ und benenne genau, welche Information fehlt. Erfinde NICHTS, um eine Lücke zu füllen.",`
   → `    "2. Wenn die Wissensbasis die Frage nicht oder nur teilweise beantwortet, sage das ausdrücklich: „Dazu liegen in MasterMind keine Daten vor.“ und benenne genau, welche Information fehlt. Erfinde NICHTS, um eine Lücke zu füllen.",`
5. `    "===== VEKTRA-WISSENSBASIS =====",`
   → `    "===== MASTERMIND-WISSENSBASIS =====",`

- [ ] **Step 2: `lib/stephan-context.ts` (1 Stelle)**

`// Baut eine kompakte, token-begrenzte Wissensbasis aus ALLEN VEKTRA-Daten.`
→ `// Baut eine kompakte, token-begrenzte Wissensbasis aus ALLEN MasterMind-Daten.`

- [ ] **Step 3: `components/cockpit/stephan-assist.tsx` (3 Stellen)**

1. `            {busy ? "Suche in VEKTRA …" : "Antwort entwerfen"}`
   → `            {busy ? "Suche in MasterMind …" : "Antwort entwerfen"}`
2. `          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-2" title="Die KI ahmt deinen Schreibstil aus früheren Antworten nach (Fakten bleiben aus den VEKTRA-Daten).">`
   → `          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-2" title="Die KI ahmt deinen Schreibstil aus früheren Antworten nach (Fakten bleiben aus den MasterMind-Daten).">`
3. `          <span className="text-xs text-muted-2">Fakten ausschließlich aus VEKTRA-Daten.</span>`
   → `          <span className="text-xs text-muted-2">Fakten ausschließlich aus MasterMind-Daten.</span>`

- [ ] **Step 4: `app/api/stephan-assist/route.ts` (1 Stelle)**

`      content: \`Eingehende Nachricht von Stephan (Auftraggeber):\n"""\n${message}\n"""\n\nEntwirf in Magos Namen eine Antwort an Stephan – ausschließlich auf Basis der VEKTRA-Wissensbasis. Was nicht belegt ist, ausdrücklich als fehlend kennzeichnen.\`,`
→ ersetze nur `VEKTRA-Wissensbasis` durch `MasterMind-Wissensbasis` in dieser Zeile.

- [ ] **Step 5: `app/(app)/cockpit/stephan/page.tsx` (1 Stelle)**

`    <PageShell title="Stephan-Assistent" icon="chat" subtitle="Antwort entwerfen · Gespräch festhalten · auf Basis der VEKTRA-Daten">`
→ `    <PageShell title="Stephan-Assistent" icon="chat" subtitle="Antwort entwerfen · Gespräch festhalten · auf Basis der MasterMind-Daten">`

- [ ] **Step 6: `lib/copilot-kb.mjs` (8 Stellen)** — ersetze jeweils das Wort/Phrase „VEKTRA" durch „MasterMind" in genau diesen Zeilen:

1. `…die To-dos in VEKTRA (Cockpit → Tasks)…` → `…die To-dos in MasterMind (Cockpit → Tasks)…`
2. `{ title: "In VEKTRA hinterlegen", …` → `{ title: "In MasterMind hinterlegen", …`
3. `…als KPI/Notiz in VEKTRA (Cockpit → KPIs) festhalten.` → `…als KPI/Notiz in MasterMind (Cockpit → KPIs) festhalten.`
4. `{ title: "In VEKTRA übernehmen", …` → `{ title: "In MasterMind übernehmen", …`
5. `{ q: "Was kann Mago/VEKTRA dabei für HFK tun?", …` → `{ q: "Was kann Mago/MasterMind dabei für HFK tun?", …`
6. `out.push("\n# SCHRITT-FÜR-SCHRITT-GUIDES (in VEKTRA verfügbar, mit Check-ins)");` → `… (in MasterMind verfügbar, mit Check-ins)");`
7. `"Du bist „Cockpilot“, der Microsoft-365-Copilot-Trainer von VEKTRA für …"` → `… der Microsoft-365-Copilot-Trainer von MasterMind für …`
8. `"5. Weise auf passende fertige Anleitungen in VEKTRA hin: …"` → `"5. Weise auf passende fertige Anleitungen in MasterMind hin: …"`

- [ ] **Step 7: Verifikation**

Run (in `v2/`): `./node_modules/.bin/tsc.cmd --noEmit` → 0 Fehler.
Run: `node --check v2/lib/copilot-kb.mjs` → Exit 0.

- [ ] **Step 8: Commit**

```bash
git -C "F:/JTL_Export/JTL_Export/magaloko" add -- "v2/lib/ai.ts" "v2/lib/stephan-context.ts" "v2/components/cockpit/stephan-assist.tsx" "v2/app/api/stephan-assist/route.ts" "v2/app/(app)/cockpit/stephan/page.tsx" "v2/lib/copilot-kb.mjs"
git -C "F:/JTL_Export/JTL_Export/magaloko" commit -m "feat(v2): interne App-Marke VEKTRA -> MasterMind (Phase 1)"
```

---

## Task 5: Verifikation (push → Prod-Browser)

**Kein neuer Code** — nur Verifikation gemäß Akzeptanzkriterien der Spec (§9).

- [ ] **Step 1: Gesamt-Typecheck + Syntax**

Run (in `v2/`): `./node_modules/.bin/tsc.cmd --noEmit` → 0 Fehler.
Run: `node --check v2/lib/bot/handler.mjs` und `node --check v2/lib/copilot-kb.mjs` → Exit 0.

- [ ] **Step 2: Push**

```bash
git -C "F:/JTL_Export/JTL_Export/magaloko" push origin main
```

- [ ] **Step 3: Prod-Browser-Verifikation** (nach Vercel-Deploy; Build-Fingerprint abwarten)

Auf `https://magalokohfk-xdnk.vercel.app` als Admin prüfen:
1. Shell-Kopf/Drawer/Topbar zeigen **„MasterMind"** (Logo „M"); Tab-Titel = „MasterMind".
2. Sidebar gruppiert: **MasterMind · VEKTRA · [Steuerung] Heute/Lieferung/Kalender · [Team] Cockpilot/Werkstatt · Mago · Einstellungen**.
3. `/` (Root) als Admin → leitet auf **`/mastermind`**; Seite rendert die **Werkzeug-Landkarte** (5 Tools, VEKTRA „Live").
4. Nav „VEKTRA" → Trainer-Hub mit Titel **„VEKTRA"**.
5. `/cockpit/strategie` → Redirect auf `/mastermind`. `/vektra` → Redirect auf `/akademie`.
6. Login-Karte zeigt „MasterMind / Cockpit & VEKTRA".
7. (Optional, Telegram) Bot-Menü-Button heißt „🎓 VEKTRA"; `/start`-Header „🎓 HFK VEKTRA"; Bot-Trainer-Menü weiter „🎯 VEKTRA".

- [ ] **Step 4: Abschluss**

Wenn alle Akzeptanzkriterien erfüllt: Phase 1 fertig. Phase 2 (Daten-Kopplung Tasks/Hebel/KPIs → Werkzeuge + Perf-Fix der History) = separater Spec.

---

## Hinweise / bewusst NICHT in Phase 1

- **Slugs unverändert** (`/akademie`, `/cockpit`, …) → Bot-Deeplinks/Bookmarks intakt.
- **Guards unverändert** (requireAdmin/requireUser/requireSuperAdmin).
- **Bleibt VEKTRA:** `lib/strategy.ts` werkzeug.name + Roadmap, `lib/phases.ts` (Zeilen 12/29), Bot-Trainer-Menü `handler.mjs:332`, `handler.mjs:490` „VEKTRA-Kontext".
- **Interne technische Bezeichner bleiben** (Route-Slug `/akademie`, `AKADEMIE_AREAS`, DB `akademie_progress`, Komponenten `AkademieTabs`/`AkademieHub`, Datenfelder `akademieDrills` etc., README-Doku).
- **Bereichs-Freigabe-Copy „Akademie-Bereiche"** (user-manager, einstellungen, Bot-Rollen-Hinweise) bleibt — bezeichnet die Freigabe-Logik, nicht den Trainer-Titel. Bei Wunsch separat klären.
