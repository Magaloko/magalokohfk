# MasterMind Phase 2b — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Fresh subagent per task, review between. Steps use `- [ ]`.

**Goal:** Retail-Hebel (`levers` ohne `phase`) + `weeklyKpis` per einmaliger, reversibler, idempotenter super-only Migration nach `magoHebel`/`magoKpis` (Mago-Bereich, super-only) verschieben; redundante Plan-Hebel (`levers` mit `phase`) löschen; die reichen Hebel-/KPI-Seiten nach `/mago` verschieben; Cockpit zu reinem MasterMind-Bau aufräumen.

**Architecture:** Next.js 15 App Router. Daten liegen in `app_state` (jsonb, Container `workspaces.hfk.data`). Schreiben über `app/api/cockpit/mutate/route.ts` (Registries SPEC/DYNAMIC/STRUCTURED) + `lib/cockpit-write.ts` (collection-agnostisch, Optimistic-Lock + History-Snapshot). Lesen über kleine typisierte Reader.

**Tech Stack:** Next.js 15, React 19, TS, Tailwind v4. **Verifikation:** `tsc --noEmit` (`v2/node_modules/.bin/tsc.cmd`) + `node --check` für `.mjs` + push→Prod-Browser. Commits direkt auf `main`. Arbeitsverzeichnis `v2/`.

**Gather-Artefakt (verbatim Ist-Inhalte + Edits):** `C:\Users\Mo\AppData\Local\Temp\claude\C--Users-Mo\964b298b-9ff5-4c9a-9ea3-c2beec87a4fb\tasks\ws8q78y9v.output` (JSON: `result.moves` = 4 zu verschiebende Seiten + `lib/mago.ts`-Reader; `result.magoData` = Mutate-API + `mago/page.tsx` + Referenzen; `result.cleanup` = heute/cockpit-page/cockpit-tabs/history/stephan-context Edits). Jede Task verweist auf die passende Sektion. **Sonderzeichen im Gather sind \\u-escaped → beim Schreiben als UTF-8-Literale einsetzen.**

**⚠️ KORREKTUREN gegenüber dem Gather (verbindlich):**
- `magoHebel`-SPEC muss das **`levers`-Schema spiegeln** (NICHT die Gather-Felder `titel/hebel/wirkungEur`): `fields: ["title","area","phase","status","confidence","risk","description","notes","startDate","finishDate"], numeric: ["expectedImpactEur","effortHours"], prefix: "mhbl"`. Sonst sanitiert die API echte Hebel-Felder weg.
- `magoKpis` gehört in **`DYNAMIC`** (wie `weeklyKpis`, dynamische Metrik-Felder), NICHT in SPEC.
- `lever-editor`/`kpi-editor` brauchen eine **`collection`-Prop**; die `/mago`-Seiten setzen `magoHebel`/`magoKpis`. `LeverActions.del()` `router.push('/cockpit/hebel')` → `/mago/hebel`.

---

## Task 1: Reader in `lib/mago.ts`

**Files:** Modify `v2/lib/mago.ts`

- [ ] **Step 1:** Gather-Sektion `result.moves.findings[path="…/lib/mago.ts"]` lesen. Ergänze `import type { Lever, WeeklyKpi } from "./cockpit";` und nach `getMagoData()`:

```ts
// App-State-Container (workspaces.hfk.data, Fallback top-level) — wie getMagoData.
async function magoWorkspace(): Promise<Record<string, unknown>> {
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  return (((st.workspaces as Record<string, any>)?.hfk?.data) || st) as Record<string, unknown>;
}
export async function getMagoCollection(name: string): Promise<MagoItem[]> {
  const ws = await magoWorkspace();
  return Array.isArray(ws[name]) ? (ws[name] as MagoItem[]) : [];
}
export async function getMagoLevers(): Promise<Lever[]> {
  const ws = await magoWorkspace();
  return Array.isArray(ws["magoHebel"]) ? (ws["magoHebel"] as Lever[]) : [];
}
export async function getMagoKpis(): Promise<WeeklyKpi[]> {
  const ws = await magoWorkspace();
  return Array.isArray(ws["magoKpis"]) ? (ws["magoKpis"] as WeeklyKpi[]) : [];
}
```

- [ ] **Step 2:** `tsc --noEmit` → 0 Fehler.
- [ ] **Step 3:** Commit `feat(v2): Mago-Reader getMagoLevers/getMagoKpis/getMagoCollection`.

## Task 2: Mutate-API — `magoHebel`/`magoKpis` registrieren (KORRIGIERT)

**Files:** Modify `v2/app/api/cockpit/mutate/route.ts`

- [ ] **Step 1:** Im `SPEC`-Objekt nach `magoMeilensteine` einfügen:

```ts
  magoHebel: { fields: ["title", "area", "phase", "status", "confidence", "risk", "description", "notes", "startDate", "finishDate"], numeric: ["expectedImpactEur", "effortHours"], prefix: "mhbl" },
```

- [ ] **Step 2:** `DYNAMIC` erweitern: `const DYNAMIC = new Set(["weeklyKpis", "magoKpis"]);`
- [ ] **Step 3:** `tsc --noEmit` → 0 Fehler. (Super-Admin-Gate `collection.startsWith("mago")` greift bereits automatisch.)
- [ ] **Step 4:** Commit `feat(v2): Mutate-API kennt magoHebel (SPEC) + magoKpis (DYNAMIC)`.

## Task 3: `collection`-Prop in lever-editor + kpi-editor

**Files:** Modify `v2/components/cockpit/lever-editor.tsx`, `v2/components/cockpit/kpi-editor.tsx`

- [ ] **Step 1:** Beide Dateien lesen. In **lever-editor.tsx**: `COL`-Konstante durch eine optionale `collection`-Prop (default `"levers"`) ersetzen, durch `NewLeverButton`/`LeverActions`/`LeverForm` durchreichen; jeder `cockpitMutate({collection: COL …})` → `collection`. `LeverActions.del()` `router.push("/cockpit/hebel")` → `router.push("/mago/hebel")`.
- [ ] **Step 2:** In **kpi-editor.tsx** analog: `collection`-Prop (default `"weeklyKpis"`) durch `NewKpiButton`/`KpiActions`/`KpiForm` durchreichen; ggf. Redirect auf `/mago/kennzahlen`.
- [ ] **Step 3:** `tsc --noEmit` → 0 Fehler (Default-Props halten Cockpit-Kompatibilität bis zum Cleanup).
- [ ] **Step 4:** Commit `feat(v2): lever-/kpi-editor mit collection-Prop`.

## Task 4: Neue `/mago`-Seiten (verschobene reiche UI)

**Files:** Create `v2/app/(app)/mago/hebel/page.tsx`, `…/mago/hebel/board/page.tsx`, `…/mago/hebel/[id]/page.tsx`, `…/mago/kennzahlen/page.tsx`

- [ ] **Step 1:** Für jede der 4 Seiten den `fullContent` aus `result.moves.findings` als Basis nehmen, die dort gelisteten `edits` (Guard `requireSuperAdmin`, Datenquelle `getMagoLevers`/`getMagoKpis`, Links `/cockpit/*`→`/mago/*`, History-Collection `magoHebel`) anwenden, **UTF-8-Literale** statt \\u-Escapes. **Zusätzlich** (Write-Path): den Editor-Komponenten `collection="magoHebel"` bzw. `collection="magoKpis"` übergeben (`<NewLeverButton collection="magoHebel" />`, `<LeverActions collection="magoHebel" … />`, `<KanbanBoard collection="magoHebel" … />`, `<NewKpiButton collection="magoKpis" />`, `<KpiActions collection="magoKpis" … />`).
- [ ] **Step 2:** `tsc --noEmit` → 0 Fehler.
- [ ] **Step 3:** Commit `feat(v2): /mago/hebel(+board,+[id]) und /mago/kennzahlen (verschobene UI)`.

## Task 5: MagoTabs — statische Tabs Hebel + Kennzahlen

**Files:** Modify `v2/components/mago/mago-tabs.tsx`

- [ ] **Step 1:** Datei lesen. Die Tab-Liste (`[Übersicht, ...MAGO_MODULES]`) um 2 **statische** Einträge ergänzen: `{ href: "/mago/hebel", label: "Hebel", icon: "lever" }` und `{ href: "/mago/kennzahlen", label: "Kennzahlen", icon: "kpi" }`. (Icons gegen `components/icon` prüfen — `lever`/`kpi` existieren.) Aktiv-Zustand wie vorhanden.
- [ ] **Step 2:** `tsc --noEmit` → 0 Fehler.
- [ ] **Step 3:** Commit `feat(v2): MagoTabs Hebel + Kennzahlen`.

## Task 6: Mago-Übersicht — 2 eigene Kacheln

**Files:** Modify `v2/app/(app)/mago/page.tsx`

- [ ] **Step 1:** Die `edits` aus `result.magoData.findings[path="…/mago/page.tsx"]` anwenden: `getMagoCollection`-Import; `const [hebel, kpis] = await Promise.all([getMagoCollection("magoHebel"), getMagoCollection("magoKpis")]);`; 2 eigene `<Link>`-Kacheln (`/mago/hebel`, `/mago/kennzahlen`) mit `hebel.length`/`kpis.length`. Icon-Namen gegen `components/icon` prüfen (sicher: `lever`/`kpi`).
- [ ] **Step 2:** `tsc --noEmit` → 0 Fehler.
- [ ] **Step 3:** Commit `feat(v2): Mago-Übersicht Kacheln Hebel + Kennzahlen`.

## Task 7: Migrations-Route (einmalig, reversibel, idempotent)

**Files:** Create `v2/app/api/admin/migrate-2b/route.ts`

- [ ] **Step 1:** Datei anlegen:

```ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { db, STATE_ID } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// EINMALIGE Phase-2b-Migration (super-only, idempotent, reversibel via state_history-Snapshot):
// Retail-Hebel (levers ohne phase) -> magoHebel; weeklyKpis -> magoKpis;
// Plan-Hebel (levers mit phase) GELÖSCHT; levers/weeklyKpis geleert.
export async function POST() {
  const sess = await getSession();
  if (!sess || !isSuperAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const cur = await db().from("app_state").select("data, updated_at").eq("id", STATE_ID).maybeSingle();
  const data = (cur.data?.data || {}) as Record<string, any>;
  const oldUpdatedAt = Number(cur.data?.updated_at || 0);
  const wsRaw = data?.workspaces?.hfk?.data;
  const ws = (wsRaw && typeof wsRaw === "object" && !Array.isArray(wsRaw)) ? wsRaw : data;

  const levers = Array.isArray(ws.levers) ? ws.levers : [];
  const weeklyKpis = Array.isArray(ws.weeklyKpis) ? ws.weeklyKpis : [];
  const alreadyMago = Array.isArray(ws.magoHebel) ? ws.magoHebel : [];
  if (alreadyMago.length > 0 || (levers.length === 0 && weeklyKpis.length === 0)) {
    return NextResponse.json({ ok: true, skipped: true, reason: "already_migrated_or_empty" });
  }

  const retail = levers.filter((l: any) => !l?.phase);
  // Snapshot des Alt-Stands -> reversibel
  await db().from("state_history").insert({ updated_at: oldUpdatedAt, client_id: "v2-migrate-2b", data: JSON.parse(JSON.stringify(data)), actor: sess.email });

  ws.magoHebel = retail;
  ws.magoKpis = weeklyKpis;
  ws.levers = [];
  ws.weeklyKpis = [];
  const newUpdatedAt = Date.now();
  data.updatedAt = newUpdatedAt;

  const upd = await db().from("app_state").update({ data, updated_at: newUpdatedAt }).eq("id", STATE_ID).eq("updated_at", oldUpdatedAt).select("updated_at");
  if (upd.error || !upd.data?.length) return NextResponse.json({ error: "write_failed_or_conflict" }, { status: 409 });
  return NextResponse.json({ ok: true, movedHebel: retail.length, deletedPlanHebel: levers.length - retail.length, movedKpis: weeklyKpis.length });
}
```

- [ ] **Step 2:** `tsc --noEmit` → 0 Fehler.
- [ ] **Step 3:** Commit + push `feat(v2): einmalige Phase-2b-Migrations-Route (super-only, reversibel)`.

## Task 8: Migration triggern (mit Nutzer abstimmen) + verifizieren

- [ ] **Step 1:** **Mit dem Nutzer abstimmen.** Nach Deploy: `POST /api/admin/migrate-2b` als Super-Admin auslösen (authentifizierter Browser-`fetch` oder durch den Nutzer). Antwort prüfen: `{ ok, movedHebel, deletedPlanHebel, movedKpis }`.
- [ ] **Step 2:** Prod verifizieren: `/mago/hebel` zeigt die Retail-Hebel (ROI-sortiert); `/mago/kennzahlen` zeigt die KPIs; CRUD/Drag&Drop funktionieren (kein `bad_collection`).

## Task 9: Cockpit/Heute/history/stephan aufräumen

**Files:** Modify `v2/components/cockpit/cockpit-tabs.tsx`, `v2/app/(app)/heute/page.tsx`, `v2/app/(app)/cockpit/page.tsx`, `v2/lib/history.ts`, `v2/lib/stephan-context.ts`; Delete/Redirect `v2/app/(app)/cockpit/hebel/*`, `v2/app/(app)/cockpit/kpis/page.tsx`

- [ ] **Step 1:** `cockpit-tabs.tsx`: TABS-Einträge `Hebel` (`/cockpit/hebel`) + `KPIs` (`/cockpit/kpis`) entfernen.
- [ ] **Step 2:** `heute/page.tsx`: Edits aus `result.cleanup.findings[heute]` anwenden — KPI-Snapshot-Block + zugehörige Vars (`sortedWeeks`-Import, `SKIP`/`pretty`, `weeklyKpis`-Destructuring, `latest`/`latestMetrics`) entfernen. **`levers` bleibt** (Agenda + Stat „Aktive Hebel"), zeigt nach Migration einfach 0/leer — ODER auf Wunsch die „Aktive Hebel"-Stat + Hebel-Agenda-Loop ebenfalls entfernen (Entscheidung beim Cleanup, Default: Stat „Aktive Hebel" entfernen, da Hebel nun Mago-privat). Subagent: exakte Edits am echten File + tsc.
- [ ] **Step 3:** `cockpit/page.tsx`: „Datenbestand"-Stat-Kacheln `Aktive Hebel` + `KPI-Wochen` entfernen; ungenutzte Vars (`isLeverActive`/`sortedWeeks`/`levers`/`weeklyKpis`) bereinigen.
- [ ] **Step 4:** `lib/history.ts`: `ACT_CONF`-Eintrag `levers` entfernen (Feed = `tasks` + `stephanDecisions`).
- [ ] **Step 5:** `lib/stephan-context.ts`: `levers`/`weeklyKpis`-Nutzung aus der Wissensbasis entfernen (Subagent: echte Datei lesen, exakte Edits).
- [ ] **Step 6:** `/cockpit/hebel`, `/cockpit/hebel/board`, `/cockpit/hebel/[id]`, `/cockpit/kpis`: **Redirect**-Seiten auf `/mago/hebel*`/`/mago/kennzahlen` (analog Phase-1-Redirects), damit Alt-/Bot-/Bookmark-Links nicht brechen.
- [ ] **Step 7:** `tsc --noEmit` → 0 Fehler. Commit `refactor(v2): Cockpit ohne Hebel/KPIs (Retail -> Mago); Cleanup`.

## Task 10: Migrations-Route entfernen + push

**Files:** Delete `v2/app/api/admin/migrate-2b/route.ts`

- [ ] **Step 1:** Nach erfolgreicher Migration (Task 8) die Route-Datei löschen. `tsc --noEmit` → 0. Commit + push `chore(v2): Migrations-Route entfernt (Phase 2b abgeschlossen)`.

## Task 11: Prod-Verifikation (Akzeptanzkriterien Spec §7)

- [ ] **Step 1:** `/mago` zeigt Kacheln Hebel + Kennzahlen mit Counts; `/mago/hebel` ROI-sortiert + Board + Detail; `/mago/kennzahlen` KPIs; alles super-only.
- [ ] **Step 2:** Cockpit ohne Hebel/KPIs-Tabs; `/heute` ohne KPI-Snapshot (+ Hebel-Stat je Entscheidung); Aktivitäts-Feed = Tasks/Entscheidungen; Plan-Hebel nirgends sichtbar.
- [ ] **Step 3:** `/cockpit/hebel` + `/cockpit/kpis` → Redirect auf `/mago/*`. `tsc` grün.

---

## Self-Review-Hinweise (für den Ausführenden)
- **Reihenfolge wichtig:** additiver Code (Tasks 1–7) ZUERST deployen, DANN Migration (Task 8), DANN Cleanup (Task 9). So ist `/mago/hebel` sofort befüllt und nichts bricht zwischendrin.
- **Reversibel:** Migration schreibt einen `state_history`-Snapshot des Alt-Stands; bei Problemen restaurierbar.
- **Write-Path-Falle:** Ohne Task 2 (SPEC/DYNAMIC) + Task 3 (collection-Prop) scheitert jeder Schreibzugriff der Mago-Hebel/KPI-Seiten mit `bad_collection` bzw. landet in der falschen Collection. Beide MÜSSEN vor Task 8 stehen.
