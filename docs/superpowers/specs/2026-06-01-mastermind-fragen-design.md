# MasterMind-Fragen im Plan — Design-Spec

> **Status:** Design (brainstorming abgeschlossen, User-Approval erfolgt). Nächster Schritt: writing-plans → subagent-driven-development.
> **Datum:** 2026-06-01
> **Projekt:** MAGALOKO v2 (`F:\JTL_Export\JTL_Export\magaloko\v2`), live https://magalokohfk-xdnk.vercel.app

## Ziel

Stephans MasterMind-Plan operationalisieren: Pro Werkzeug (und für die Querschnitt-/Future-Themen) werden die **offenen Klärungsfragen** an Stephan im `/mastermind`-Plan sichtbar, **beantwortbar** und **nachverfolgbar** (offen/beantwortet). Beantwortete Fragen werden Teil der belegbaren **Wissensbasis** des Stephan-Copiloten. Der Fragenkatalog ist abgeleitet aus `lib/strategy.ts` (MASTERMIND v2.0) und liegt vor in `docs/mastermind-fragen-stephan.md` (45 Fragen, P0–P4).

Direkter Bezug zur MasterMind-Vision: „macht verstreutes Wissen allen verfügbar" — die Antworten überführen Stephans Kopf-Wissen in das System.

## Scope

**In Scope:**
- Statischer Fragenkatalog (45 Fragen) als Code-Konstante.
- Erfassbare Antwort-Sammlung (Status + Antworttext) via bestehende Mutate-API.
- Anzeige/Erfassung im `/mastermind`-Plan: pro Werkzeug-Karte + Querschnitt-Block + Future-Block.
- Anbindung der beantworteten Q&A an den Stephan-Copiloten (`lib/stephan-context.ts`).

**Out of Scope (YAGNI):**
- Eigene Fragen hinzufügen/bearbeiten (Katalog ist fest in v1).
- Fragen-Editor/CRUD für die Fragetexte.
- Mago-/Cockpit-Seiten, andere Werkzeuge, der `MASTERMIND`-Plan-Inhalt selbst.

**Zugriff:** `/mastermind` ist admin-only (Plan ist GF-SAFE). Anzeige für Admins, **Erfassung für alle Admins** (`isAdmin` — Stephan kann via GF-Admin-Login selbst antworten). Kein Super-Admin-Gate (Sammlung beginnt NICHT mit `mago`).

## Architektur / Komponenten

### 1. Statischer Katalog — `lib/mastermind-fragen.ts` (neu, client-safe)

```ts
export type FragePrio = "P0" | "P1" | "P2" | "P3" | "P4";
export type FrageEbene = "GF-SAFE" | "TEAM" | "PUBLIC";
export type MasterMindFrage = {
  id: string;            // stabil, z. B. "tre-1"
  werkzeug: string;      // Tool-Key ODER "querschnitt" / "future"
  prio: FragePrio;
  frage: string;
  ebene?: FrageEbene;
};
export const MASTERMIND_FRAGEN: MasterMindFrage[] = [ /* 45 Einträge */ ];
export const fragenFuer = (werkzeug: string) => MASTERMIND_FRAGEN.filter((f) => f.werkzeug === werkzeug);
```

**ID-/Gruppen-Schema** (Texte 1:1 aus `docs/mastermind-fragen-stephan.md`):
| werkzeug | prio | ids | Fragen-Nr. im Dok |
|---|---|---|---|
| `querschnitt` | P0 | `qs-1`…`qs-7` | 1–7 |
| `treasury` | P0 | `tre-1`…`tre-9` | 8–16 |
| `einkauf` | P1 | `ein-1`…`ein-8` | 17–24 |
| `vipa` | P2 | `vip-1`…`vip-7` | 25–31 |
| `sebo` | P2 | `seb-1`…`seb-5` | 32–36 |
| `vektra` | P3 | `vek-1`…`vek-4` | 37–40 |
| `future` | P4 | `fut-1`…`fut-5` | 41–45 |

Tool-Keys müssen exakt `MASTERMIND.werkzeuge[].key` entsprechen: `treasury`, `einkauf`, `vipa`, `sebo`, `vektra`. `ebene` aus den `[GF-SAFE]`/`[TEAM]`-Tags des Dokuments.

### 2. Antwort-Sammlung — `mastermindAntworten` (Mutate-API)

In `app/api/cockpit/mutate/route.ts` → `SPEC`:
```ts
mastermindAntworten: { fields: ["frageId", "status", "antwort", "notiz"], prefix: "mma" },
```
- `status`: `"offen"` | `"beantwortet"` (String, vom Client gesetzt).
- Schreibrecht: `isAdmin` (vorhandenes Gate; KEIN `mago`-Super-Gate, da Key nicht mit `mago` beginnt).
- Ein Record je beantworteter Frage; Verknüpfung via `frageId` (= Katalog-`id`).

In `lib/cockpit-write.ts` → `PROTECTED` die Sammlung `"mastermindAntworten"` ergänzen (Anti-Wipe — analog `magoHebel`/`magoKpis`).

### 3. Reader — `lib/mastermind.ts` (neu, server)

```ts
export type MasterMindAntwort = { id: string; frageId: string; status: string; antwort: string; notiz?: string };
// Liest container.mastermindAntworten, indexiert nach frageId (letzter gewinnt).
export async function getMastermindAntworten(): Promise<Record<string, MasterMindAntwort>>;
```
Nutzt denselben Container-Auflöser wie andere Reads (`workspaces.hfk.data` bevorzugt).

### 4. Anzeige — PlanView + `components/mastermind/fragen-block.tsx` (neu, Client)

**`FragenBlock`** (Client):
- Props: `{ fragen: MasterMindFrage[]; antworten: Record<string, MasterMindAntwort>; titel?: string }`.
- Default **eingeklappt**: ein Toggle-Button „Offene Fragen ({offen} offen · {beantwortet} beantwortet)" (alle Viewports; `useState`).
- Aufgeklappt: Liste je Frage — Prio-Pill, optional `[GF-SAFE]`-Tag, Fragetext, Status. Inline-Erfassung: Textarea (`antwort`) + Status-Umschalter („offen"/„beantwortet") + „Speichern".
- Speichern via `POST /api/cockpit/mutate`:
  - Kein Record für `frageId` → `{ collection: "mastermindAntworten", action: "create", item: { frageId, status, antwort } }`.
  - Record vorhanden → `{ collection: "mastermindAntworten", action: "update", id: <record.id>, patch: { status, antwort } }`.
  - Bei Erfolg `router.refresh()` (Server-Daten neu laden). Konflikt (409) → Hinweis „bitte neu laden".
- Beantwortete Fragen zeigen die Antwort + „beantwortet"-Pill.

**PlanView** (`components/mastermind/plan-view.tsx`) wird zu async/erhält `antworten`-Prop:
- Im `m.werkzeuge.map(...)` unter jedem Werkzeug-Block: `<FragenBlock fragen={fragenFuer(w.key)} antworten={antworten} />` (nur wenn `fragenFuer(w.key).length`).
- **Neuer Abschnitt „Querschnitt / Foundation"** direkt vor dem Werkzeug-Set: `<FragenBlock titel="Querschnitt / Foundation" fragen={fragenFuer("querschnitt")} antworten={antworten} />`.
- **Future-Fragen** im Future-Scope-Abschnitt: `<FragenBlock titel="Offene Fragen — Future Scope" fragen={fragenFuer("future")} antworten={antworten} />`.

**`app/(app)/mastermind/page.tsx`**: lädt `const antworten = await getMastermindAntworten();` und übergibt `<PlanView antworten={antworten} />`. Sicherstellen, dass die Seite `requireAdmin()` nutzt.

### 5. Wissensbasis — `lib/stephan-context.ts`

Neuer Block am Ende des Kontexts:
```
## MASTERMIND-KLÄRUNGEN (von Stephan beantwortet)
- [Treasury] <Fragetext>: „<Antwort>"
- [Einkauf] …
```
Quelle: `getMastermindAntworten()` × `MASTERMIND_FRAGEN`, nur Einträge mit `status === "beantwortet"` und nicht-leerer `antwort`, gruppiert/gelabelt nach Werkzeug (Tool-Name aus `MASTERMIND.werkzeuge`, sonst „Querschnitt"/„Future"). Token-begrenzt (`cut`).

## Datenfluss

1. Admin öffnet `/mastermind` → Server liest `mastermindAntworten`, PlanView rendert je Werkzeug den `FragenBlock` (Katalog ∪ Antworten).
2. Admin tippt Antwort + setzt „beantwortet" → POST mutate (create/update) → app_state jsonb (Optimistic-Lock + state_history).
3. `router.refresh()` → neuer Stand sichtbar.
4. Stephan-Copilot baut Kontext → beantwortete Q&A sind als belegbare Fakten enthalten.

## Verifikation

`tsc --noEmit` + push→Prod-Browser (390px + Desktop):
- Pro Werkzeug ein „Offene Fragen"-Block mit korrektem Zähler; Querschnitt-Block vor dem Set, Future-Block im Future-Abschnitt.
- Antwort erfassen → speichern → Status „beantwortet" + Antworttext sichtbar; nach Reload **persistent** (echter app_state-Write).
- Update einer bestehenden Antwort funktioniert (kein Duplikat).
- (Stichprobe) Copilot-Kontext: eine beantwortete Frage taucht unter „MASTERMIND-KLÄRUNGEN" auf — prüfbar über den Stephan-Assistenten oder indirekt.
- Mobil keine Überläufe; Blöcke eingeklappt per Default.

## Risiken

- **Doppel-Antworten:** Erst-Erfassung = create, danach update by record-id → kein Duplikat. Reader indexiert defensiv „letzter gewinnt".
- **Anti-Wipe:** `mastermindAntworten` muss in `cockpit-write` PROTECTED, sonst Wipe-Risiko bei Teil-Writes (wie bei magoHebel/magoKpis in Phase 2b gelernt).
- **PlanView async:** Umstellung auf async Server-Component — `mastermind/page.tsx` muss `await` anpassen.
- **Kein Unit-Runner** — `tsc` + Prod-Browser (inkl. echtem Schreib-Roundtrip) ist der Verifikationsweg.
