# MasterMind „Wo wir stehen" — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** „Aktueller Stand"-Sektion oben in `/mastermind`: Tool-Status (Plan/In Bau/Live/Blockiert) je Tool + offene Vorgänge/Threads (mit „wartet auf"), beantwortbar/editierbar; beantwortete fließen in den Copiloten; mit echtem SeBo-Stand befüllt.

**Architecture:** 2 neue app_state-Sammlungen via Mutate-API (Optimistic-Lock + Anti-Wipe) + Server-Reader + ein Client-Section-Component + PlanView/page-Einbindung + stephan-context-Block.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4. Muster: `mastermindAntworten`/`FragenBlock`.

**Spec:** `docs/superpowers/specs/2026-06-01-mastermind-wo-wir-stehen-design.md`

**Verifikation pro Task:** `Set-Location F:\JTL_Export\JTL_Export\magaloko\v2; .\node_modules\.bin\tsc.cmd --noEmit` → keine Fehler. **Commits direkt auf `main`.**

---

### Task 1: Sammlungen registrieren (Mutate-SPEC + Anti-Wipe)

**Files:** Modify `v2/app/api/cockpit/mutate/route.ts`, `v2/lib/cockpit-write.ts`

- [ ] **Step 1: SPEC** — nach der `mastermindAntworten`-Zeile ergänzen.
OLD:
```ts
  mastermindAntworten: { fields: ["frageId", "status", "antwort", "notiz"], prefix: "mma" },
};
```
NEW:
```ts
  mastermindAntworten: { fields: ["frageId", "status", "antwort", "notiz"], prefix: "mma" },
  mastermindVorgaenge: { fields: ["titel", "werkzeug", "status", "wartetAuf", "naechsterSchritt", "notiz", "datum"], prefix: "mmv" },
  mastermindToolStatus: { fields: ["werkzeug", "status", "notiz"], prefix: "mts" },
};
```

- [ ] **Step 2: PROTECTED** — in `cockpit-write.ts`.
OLD:
```ts
  "magoHebel", "magoKpis",
  "mastermindAntworten",
];
```
NEW:
```ts
  "magoHebel", "magoKpis",
  "mastermindAntworten", "mastermindVorgaenge", "mastermindToolStatus",
];
```

- [ ] **Step 3: tsc** → keine Fehler.
- [ ] **Step 4: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/app/api/cockpit/mutate/route.ts v2/lib/cockpit-write.ts; git commit -m "feat(mastermind): Sammlungen Vorgaenge + ToolStatus (SPEC + Anti-Wipe)"
```

---

### Task 2: Reader erweitern — `lib/mastermind.ts`

**Files:** Modify `v2/lib/mastermind.ts`

- [ ] **Step 1: Typen + Reader anhängen** (ans Dateiende, nach `getMastermindAntworten`):

```ts
export type MasterMindVorgang = { id: string; titel: string; werkzeug: string; status: string; wartetAuf: string; naechsterSchritt: string; notiz: string; datum: string };
export type MasterMindToolStatus = { id: string; werkzeug: string; status: string; notiz: string };

// Container wie getMastermindAntworten (workspaces.hfk.data, Fallback top-level).
async function mmContainer(): Promise<Record<string, unknown>> {
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  return (((st.workspaces as Record<string, any>)?.hfk?.data) || st) as Record<string, unknown>;
}

export async function getMastermindVorgaenge(): Promise<MasterMindVorgang[]> {
  const ws = await mmContainer();
  const arr = Array.isArray(ws["mastermindVorgaenge"]) ? (ws["mastermindVorgaenge"] as any[]) : [];
  return arr.filter((v) => v && v.id).map((v) => ({
    id: String(v.id), titel: String(v.titel || ""), werkzeug: String(v.werkzeug || ""),
    status: String(v.status || "Offen"), wartetAuf: String(v.wartetAuf || ""),
    naechsterSchritt: String(v.naechsterSchritt || ""), notiz: String(v.notiz || ""), datum: String(v.datum || ""),
  }));
}

export async function getMastermindToolStatus(): Promise<Record<string, MasterMindToolStatus>> {
  const ws = await mmContainer();
  const arr = Array.isArray(ws["mastermindToolStatus"]) ? (ws["mastermindToolStatus"] as any[]) : [];
  const out: Record<string, MasterMindToolStatus> = {};
  for (const t of arr) {
    if (!t || !t.werkzeug) continue;
    out[String(t.werkzeug)] = { id: String(t.id || ""), werkzeug: String(t.werkzeug), status: String(t.status || "Plan"), notiz: String(t.notiz || "") };
  }
  return out;
}
```

- [ ] **Step 2: tsc** → keine Fehler.
- [ ] **Step 3: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/lib/mastermind.ts; git commit -m "feat(mastermind): Reader getMastermindVorgaenge + getMastermindToolStatus"
```

---

### Task 3: `components/mastermind/wo-wir-stehen.tsx` (Client)

**Files:** Create `v2/components/mastermind/wo-wir-stehen.tsx`

- [ ] **Step 1: Datei anlegen** (genau dieser Inhalt):

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { MASTERMIND } from "@/lib/strategy";
import type { MasterMindVorgang, MasterMindToolStatus } from "@/lib/mastermind";

const TOOLS: { key: string; label: string }[] = [
  { key: "foundation", label: "Foundation" },
  ...MASTERMIND.werkzeuge.map((w) => ({ key: w.key, label: w.name })),
];
const TOOL_LABEL: Record<string, string> = Object.fromEntries(TOOLS.map((t) => [t.key, t.label]));
const TOOL_STATI = ["Plan", "In Bau", "Live", "Blockiert"];
const VORGANG_STATI = ["Offen", "Wartet", "In Arbeit", "Erledigt"];

const dotClass = (s?: string) =>
  s === "Live" ? "bg-green" : s === "In Bau" ? "bg-amber" : s === "Blockiert" ? "bg-red" : "bg-muted-2";
const vBadge = (s: string): "amber" | "accent" | "green" | "muted" =>
  s === "Wartet" ? "amber" : s === "In Arbeit" ? "accent" : s === "Erledigt" ? "green" : "muted";

async function mutate(body: Record<string, unknown>) {
  const res = await fetch("/api/cockpit/mutate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return res.ok;
}

export function WoWirStehen({ vorgaenge, toolStatus }:
  { vorgaenge: MasterMindVorgang[]; toolStatus: Record<string, MasterMindToolStatus> }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [adding, setAdding] = useState(false);
  const offen = vorgaenge.filter((v) => v.status !== "Erledigt");
  const waitCount = (key: string) => offen.filter((v) => v.werkzeug === key && v.status === "Wartet").length;

  return (
    <section className="rounded-xl border border-accent/30 bg-accent/5 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent">
        <Icon name="compass" className="h-3.5 w-3.5" /> Aktueller Stand
      </div>
      <h2 className="mt-1 text-lg font-extrabold tracking-tight">Wo wir gerade stehen</h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {TOOLS.map((t) => <ToolChip key={t.key} tool={t} status={toolStatus[t.key]} wait={waitCount(t.key)} onSaved={refresh} />)}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-2">Offene Vorgänge ({offen.length})</h3>
        <button type="button" onClick={() => setAdding(!adding)}
          className="inline-flex min-h-9 items-center rounded-lg bg-accent px-3 text-xs font-semibold text-bg">{adding ? "Abbrechen" : "+ Vorgang"}</button>
      </div>
      {adding && <div className="mt-2"><VorgangForm onClose={() => setAdding(false)} onSaved={refresh} /></div>}
      <div className="mt-2 flex flex-col gap-2">
        {offen.length ? offen.map((v) => <VorgangRow key={v.id} v={v} onSaved={refresh} />)
          : <p className="text-sm text-muted-2">Keine offenen Vorgänge.</p>}
      </div>
    </section>
  );
}

function ToolChip({ tool, status, wait, onSaved }:
  { tool: { key: string; label: string }; status?: MasterMindToolStatus; wait: number; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  useEffect(() => { setBusy(false); }, [status?.id, status?.status]);
  const cur = status?.status || "Plan";
  async function set(newStatus: string) {
    if (busy || newStatus === cur) return;
    setBusy(true);
    const ok = status?.id
      ? await mutate({ collection: "mastermindToolStatus", action: "update", id: status.id, patch: { status: newStatus } })
      : await mutate({ collection: "mastermindToolStatus", action: "create", item: { werkzeug: tool.key, status: newStatus } });
    if (ok) onSaved(); else setBusy(false);
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass(cur))} />
      {tool.label}
      <select value={cur} onChange={(e) => set(e.target.value)} disabled={busy}
        className="ml-0.5 rounded bg-surface-2 px-1 py-0.5 text-[11px] outline-none">
        {TOOL_STATI.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {wait > 0 && <span className="text-amber">· wartet {wait}</span>}
    </span>
  );
}

function VorgangRow({ v, onSaved }: { v: MasterMindVorgang; onSaved: () => void }) {
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  async function erledigt() {
    setBusy(true);
    const ok = await mutate({ collection: "mastermindVorgaenge", action: "update", id: v.id, patch: { status: "Erledigt" } });
    if (ok) onSaved(); else setBusy(false);
  }
  if (edit) return <VorgangForm v={v} onClose={() => setEdit(false)} onSaved={onSaved} />;
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase text-muted-2">{TOOL_LABEL[v.werkzeug] || v.werkzeug}</span>
        <Pill tone={vBadge(v.status)}>{v.status}{v.status === "Wartet" && v.wartetAuf ? `: ${v.wartetAuf}` : ""}</Pill>
        <span className="text-sm font-semibold">{v.titel}</span>
      </div>
      {v.naechsterSchritt && <p className="mt-1 text-xs text-muted">Nächster Schritt: {v.naechsterSchritt}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => setEdit(true)} className="inline-flex min-h-9 items-center rounded-lg bg-surface-2 px-3 text-xs font-semibold text-accent">Bearbeiten</button>
        <button type="button" onClick={erledigt} disabled={busy} className="inline-flex min-h-9 items-center rounded-lg bg-green/10 px-3 text-xs font-semibold text-green disabled:opacity-50">{busy ? "…" : "Erledigt"}</button>
      </div>
    </div>
  );
}

function VorgangForm({ v, onClose, onSaved }: { v?: MasterMindVorgang; onClose: () => void; onSaved: () => void }) {
  const [titel, setTitel] = useState(v?.titel || "");
  const [werkzeug, setWerkzeug] = useState(v?.werkzeug || "sebo");
  const [status, setStatus] = useState(v?.status || "Offen");
  const [wartetAuf, setWartetAuf] = useState(v?.wartetAuf || "");
  const [naechsterSchritt, setNaechsterSchritt] = useState(v?.naechsterSchritt || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inp = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
  async function save() {
    if (!titel.trim()) { setErr("Titel fehlt."); return; }
    setBusy(true); setErr("");
    const item = { titel, werkzeug, status, wartetAuf, naechsterSchritt };
    const ok = v
      ? await mutate({ collection: "mastermindVorgaenge", action: "update", id: v.id, patch: item })
      : await mutate({ collection: "mastermindVorgaenge", action: "create", item });
    if (ok) { onClose(); onSaved(); } else { setErr("Speichern fehlgeschlagen."); setBusy(false); }
  }
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="flex flex-col gap-2">
        <input value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="Titel des Vorgangs" className={inp} />
        <div className="flex flex-wrap gap-2">
          <select value={werkzeug} onChange={(e) => setWerkzeug(e.target.value)} className={cn(inp, "w-auto")}>
            {TOOLS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={cn(inp, "w-auto")}>
            {VORGANG_STATI.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={wartetAuf} onChange={(e) => setWartetAuf(e.target.value)} placeholder="wartet auf … (z. B. HFK-IT)" className={cn(inp, "min-w-40 flex-1")} />
        </div>
        <input value={naechsterSchritt} onChange={(e) => setNaechsterSchritt(e.target.value)} placeholder="nächster Schritt" className={inp} />
        {err && <p className="text-xs text-red">{err}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={save} disabled={busy} className="min-h-10 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "Speichert …" : "Speichern"}</button>
          <button type="button" onClick={onClose} disabled={busy} className="min-h-10 rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: tsc** → keine Fehler.
- [ ] **Step 3: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/mastermind/wo-wir-stehen.tsx; git commit -m "feat(mastermind): WoWirStehen-Sektion (Tool-Status + Vorgaenge, CRUD)"
```

---

### Task 4: PlanView + Seite

**Files:** Modify `v2/components/mastermind/plan-view.tsx`, `v2/app/(app)/mastermind/page.tsx`

- [ ] **Step 1: plan-view Imports** — nach den bestehenden mastermind-Imports:
```tsx
import { WoWirStehen } from "@/components/mastermind/wo-wir-stehen";
import type { MasterMindVorgang, MasterMindToolStatus } from "@/lib/mastermind";
```

- [ ] **Step 2: plan-view Signatur + Sektion oben.**
OLD:
```tsx
export function PlanView({ antworten }: { antworten: Record<string, MasterMindAntwort> }) {
  const m = MASTERMIND;

  return (
    <>
      {/* Hero */}
```
NEW:
```tsx
export function PlanView({ antworten, vorgaenge, toolStatus }:
  { antworten: Record<string, MasterMindAntwort>; vorgaenge: MasterMindVorgang[]; toolStatus: Record<string, MasterMindToolStatus> }) {
  const m = MASTERMIND;

  return (
    <>
      {/* Aktueller Stand — zuerst sichtbar */}
      <WoWirStehen vorgaenge={vorgaenge} toolStatus={toolStatus} />

      {/* Hero */}
```

- [ ] **Step 3: page Imports.**
OLD:
```tsx
import { getMastermindAntworten } from "@/lib/mastermind";
```
NEW:
```tsx
import { getMastermindAntworten, getMastermindVorgaenge, getMastermindToolStatus } from "@/lib/mastermind";
```

- [ ] **Step 4: page laden + durchreichen.**
OLD:
```tsx
  await requireAdmin();
  const m = MASTERMIND;
  const antworten = await getMastermindAntworten();

  return (
    <PageShell icon="compass" title="Strategie & Roadmap" subtitle={`MasterMind — der Plan von Stephan · ${m.version}`}>
      <PlanView antworten={antworten} />
    </PageShell>
  );
```
NEW:
```tsx
  await requireAdmin();
  const m = MASTERMIND;
  const [antworten, vorgaenge, toolStatus] = await Promise.all([
    getMastermindAntworten(), getMastermindVorgaenge(), getMastermindToolStatus(),
  ]);

  return (
    <PageShell icon="compass" title="Strategie & Roadmap" subtitle={`MasterMind — der Plan von Stephan · ${m.version}`}>
      <PlanView antworten={antworten} vorgaenge={vorgaenge} toolStatus={toolStatus} />
    </PageShell>
  );
```

- [ ] **Step 5: tsc** → keine Fehler.
- [ ] **Step 6: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/mastermind/plan-view.tsx "v2/app/(app)/mastermind/page.tsx"; git commit -m "feat(mastermind): WoWirStehen oben im Plan + Daten laden"
```

---

### Task 5: Copilot-Anbindung — `lib/stephan-context.ts`

**Files:** Modify `v2/lib/stephan-context.ts`

- [ ] **Step 1: Imports erweitern** (vorhandenen mastermind-Import ergänzen):
OLD:
```tsx
import { getMastermindAntworten } from "./mastermind";
```
NEW:
```tsx
import { getMastermindAntworten, getMastermindVorgaenge, getMastermindToolStatus } from "./mastermind";
```

- [ ] **Step 2: mitladen** — die Promise.all-Zeile erweitern.
OLD:
```tsx
  const [c, a, mmAntworten] = await Promise.all([getCockpitData(), getAkademieData(), getMastermindAntworten()]);
```
NEW:
```tsx
  const [c, a, mmAntworten, mmVorgaenge, mmToolStatus] = await Promise.all([getCockpitData(), getAkademieData(), getMastermindAntworten(), getMastermindVorgaenge(), getMastermindToolStatus()]);
```

- [ ] **Step 3: Block einfügen** — direkt VOR dem `## MASTERMIND-KLÄRUNGEN`-Block (also vor `const wzName = ...`):
OLD:
```tsx
  const wzName = (key: string) =>
```
NEW:
```tsx
  const toolN = (key: string) => MASTERMIND.werkzeuge.find((w) => w.key === key)?.name || (key === "foundation" ? "Foundation" : key);
  const statusZeilen = Object.values(mmToolStatus).filter((t) => t.status).map((t) => `- ${toolN(t.werkzeug)}: ${t.status}`);
  const offeneVorgaenge = mmVorgaenge.filter((v) => v.status !== "Erledigt");
  if (statusZeilen.length || offeneVorgaenge.length) {
    const teile: string[] = ["## AKTUELLER STAND (operativ)"];
    if (statusZeilen.length) teile.push("Tool-Status:\n" + statusZeilen.join("\n"));
    if (offeneVorgaenge.length) teile.push("Offene Vorgänge:\n" + offeneVorgaenge.map((v) =>
      `- [${toolN(v.werkzeug)}] ${cut(v.titel, 120)}${v.status === "Wartet" && v.wartetAuf ? ` (wartet auf ${cut(v.wartetAuf, 60)})` : ""}${v.naechsterSchritt ? ` · nächster Schritt: ${cut(v.naechsterSchritt, 120)}` : ""}`).join("\n"));
    out.push(teile.join("\n"));
  }

  const wzName = (key: string) =>
```

- [ ] **Step 4: tsc** → keine Fehler.
- [ ] **Step 5: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/lib/stephan-context.ts; git commit -m "feat(mastermind): operativer Stand + Vorgaenge in den Copiloten"
```

---

### Task 6: Push + Prod-Verifikation + Seed

**Files:** keine (Verifikation + Daten-Seed über die authentifizierte Super-Admin-Browser-Session).

- [ ] **Step 1: Push** `cd F:/JTL_Export/JTL_Export/magaloko; git push`
- [ ] **Step 2: Deploy abwarten** (Marker: Sektion „Wo wir gerade stehen" auf `/mastermind`).
- [ ] **Step 3: Seed** — im eingeloggten Browser (Super-Admin) per `javascript_tool` 8 Records anlegen (6 ToolStatus, 2 Vorgänge). Body je Record an `/api/cockpit/mutate`, `action:"create"`:
  - `mastermindToolStatus`: {werkzeug:"foundation",status:"In Bau"}, {werkzeug:"treasury",status:"In Bau"}, {werkzeug:"einkauf",status:"Plan"}, {werkzeug:"vipa",status:"Plan"}, {werkzeug:"sebo",status:"In Bau"}, {werkzeug:"vektra",status:"Live"}
  - `mastermindVorgaenge`: {titel:"Live-Wawi-Anbindung (DB-API)", werkzeug:"sebo", status:"Wartet", wartetAuf:"HFK-IT", naechsterSchritt:"API-Doku + Firewall-Freigabe (IP 187.127.79.228, Port 5883, HTTPS/Auth) abwarten", notiz:"SeBo nutzt Nov-2025-Snapshot; Live-Feed fehlt."}, {titel:"Echtes HFK-Service-Postfach anbinden", werkzeug:"sebo", status:"Wartet", wartetAuf:"HFK", naechsterSchritt:"Zugang zum echten Service-Postfach klären", notiz:"Ticket-Inbox aktuell voll Spam/DMARC; echte Tickets fehlen."}
- [ ] **Step 4: Verifizieren** — `/mastermind` neu laden: Sektion oben, 6 Tool-Chips (SeBo amber „In Bau · wartet 2", VEKTRA grün „Live", …), 2 SeBo-Vorgänge sichtbar; Reload → persistent; kein Überlauf.
- [ ] **Step 5: Bericht** + Hinweis Optik-Abnahme.

---

## Self-Review (Plan gegen Spec)
- **Sammlungen (T1):** Vorgaenge + ToolStatus in SPEC + PROTECTED. ✔
- **Reader (T2):** beide Funktionen, Container wie Antworten. ✔
- **Component (T3):** Tool-Chips (Status-Select, create/update by werkzeug, busy-Reset via useEffect) + Vorgänge-CRUD (create/edit/erledigt, Form schließt → kein Doppel-Create). ✔
- **Einbindung (T4):** PlanView-Prop + Sektion als erstes Element; page lädt per Promise.all. ✔
- **Copilot (T5):** „AKTUELLER STAND"-Block vor KLÄRUNGEN; `MASTERMIND` ist in stephan-context bereits importiert (aus KLÄRUNGEN-Feature). ✔
- **Seed (T6):** 6 ToolStatus + 2 Vorgänge → „SeBo · In Bau · wartet 2". ✔
- **Typkonsistenz:** Pill-Tones (amber/accent/green/muted), Icons (compass), Tool-Keys = MASTERMIND.werkzeuge[].key + "foundation". ✔
