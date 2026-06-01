# MasterMind Phase 2a — Perf-Fix History/Aktivität (Design-Spec)

**Datum:** 2026-06-01 · **App:** MAGALOKO v2 (`v2/`) · **Status:** freigegeben (Brainstorming abgeschlossen)

## 1. Ziel

Die ~13 s Ladezeit von `/heute`, `/cockpit/aktivitaet` und allen Cockpit-Detailseiten (Task/Hebel/Entscheidung) auf **~2 s** senken — **ohne** Datenmodell-Änderung. Quick-Fix als eigenständiger erster Schritt von Phase 2 (Phase 2b = Cockpit-Reorg + Retail-Trennung, separat).

## 2. Ursache (gemessen, Prod)

`getRecentActivity` und `getRecordHistory` (`lib/history.ts`) laden `state_history` mit `.select("updated_at, data, actor").limit(120)` — also **120× den kompletten App-State-jsonb** (alle Hebel/Tasks/KPIs/…) und difften ihn in JS. Mehrere MB Transfer + Parse pro Request.
Belege: `/cockpit/aktivitaet` (fast nur `getRecentActivity`) = 13 428 ms; Listen ohne History = ~1,2 s.

## 3. Änderungen

1. **Snapshot-Zahl reduzieren** — geteilte Konstante `const HISTORY_SNAPSHOTS = 20;` in `lib/history.ts`; beide `.limit(120)` → `.limit(HISTORY_SNAPSHOTS)`. (Entscheidung: N=20 ≈ ~2 s; ~6× weniger Daten.)
2. **Interne Awaits parallelisieren** — in `getRecentActivity` und `getRecordHistory` die zwei Reads (`state_history`-`snaps` + `app_state`-`cur`) via `Promise.all` statt sequenziell.
3. **Seiten-Awaits parallelisieren** — `app/(app)/heute/page.tsx`: `getCockpitData()` + `getRecentActivity(6)` + `getProgress(sess.email)` via `Promise.all` (heute sequenziell).

## 4. Bewusst NICHT (→ später / Phase 2b)

- „Sauberer" Weg: kompaktes Änderungs-Log beim Write (Diff statt Voll-Snapshot) → volle Tiefe + schnell. Fasst das Datenmodell an, das Phase 2b ohnehin umbaut.
- `force-dynamic` → ISR-Caching.
- SQL-Aggregation der `mitarbeiter`-`limit(8000)`-Abfrage.

## 5. Trade-off / Nebenwirkung

Detailseiten zeigen die Änderungs-Historie nur noch über die **letzten ~20 Speicher-Stände** (statt 120). Für „letzte Aktivität" und „jüngste Änderungen" ausreichend; volle Tiefe kommt mit dem sauberen Weg (Phase 2b).

## 6. Akzeptanzkriterien

1. `/cockpit/aktivitaet` und `/heute` TTFB **≤ ~3 s** (vorher ~13 s) — Prod-Messung.
2. Aktivitäts-Feed (`/heute`, `/cockpit/aktivitaet`) und Detailseiten-Historie rendern weiter korrekt (nicht leer).
3. `tsc --noEmit` grün; keine Datenmodell-/Guard-/Slug-Änderung.

## 7. Dateien

- `v2/lib/history.ts` (Konstante + 2× limit + 2× Promise.all)
- `v2/app/(app)/heute/page.tsx` (Promise.all)
