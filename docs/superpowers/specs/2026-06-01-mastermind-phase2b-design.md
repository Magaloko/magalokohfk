# MasterMind Phase 2b — Cockpit-Reorg + Retail-Trennung (Design-Spec)

**Datum:** 2026-06-01 · **App:** MAGALOKO v2 (`v2/`) · **Status:** freigegeben (Brainstorming abgeschlossen)

## 1. Ziel & Entscheidungen

Das Cockpit („Lieferung") soll **ausschließlich den MasterMind-Bau** (5 Werkzeuge/Roadmap) steuern. Die generischen Retail-Daten gehören nicht dorthin und werden in **Magos privaten Bereich** verschoben.

Entscheidungen (Brainstorming):
1. **Retail-ROI-Hebel** (Doofinder, Shop-Pagespeed, Brevo, Penner-Markdown, Retouren, Conversion-Audit, … = `levers` **ohne** `phase`) = **Magos HFK-Quick-Wins** → in den **Mago-Bereich** (super-only).
2. **Retail-KPIs** (`weeklyKpis`, Orders/Revenue/Sessions/Conversion) → ebenfalls **Mago** (super-only).
3. **Redundante Plan-Hebel** (`levers` **mit** `phase` = Foundation/Treasury/Einkaufssystem/VIPA/SeBo/VEKTRA + die 2 strategischen) = Dopplung der Werkzeug-Landkarte → **gelöscht**.
4. **Umsetzungs-Ansatz B (physische Migration)**, reversibel über `state_history`-Snapshots.
5. **Reiche UI mitnehmen:** die bestehenden Hebel-Seiten (ROI-Sortierung, Board, Detail+Historie) + KPI-Seite **wandern nach `/mago`**.

## 2. Abschnitt 1 — Migration (einmalig, reversibel)

**Mechanismus:** eine **super-only Admin-Route** `app/api/admin/migrate-2b/route.ts`, die `app_state` **einmal atomar** umbaut (ein Lesen, ein Snapshot des Alt-Stands, ein Write):
- `magoHebel` := `levers.filter(l => !l.phase)` (Retail-Quick-Wins)
- `magoKpis`  := `weeklyKpis`
- `levers`    := `[]` (Retail verschoben, Plan-Hebel gelöscht)
- `weeklyKpis`:= `[]`

Details:
- **Idempotent:** läuft nur, wenn noch nicht migriert (z. B. `magoHebel` leer **und** `levers` enthält Retail-Items). Sonst no-op mit klarer Meldung.
- **Snapshot vor Write** (wie `cockpit-write.ts`): voller Alt-Stand in `state_history` → **reversibel**.
- `levers`/`weeklyKpis` sind **nicht** in der Anti-Wipe-Schutzliste (`PROTECTED` in `cockpit-write.ts`) → Leeren ist erlaubt.
- Trigger: **super-only Button/Link** (z. B. in `/einstellungen` oder einer Mini-Admin-Seite); Route nach erfolgreichem Lauf wieder **entfernen** (eigener Folge-Commit).

## 3. Abschnitt 2 — Mago: 2 neue Module (super-only)

Neue Collections in `app_state`: `magoHebel`, `magoKpis`. In der Mutate-API als SPEC registrieren (analog vorhandener Mago-Collections), damit CRUD funktioniert.

- **Wachstums-Hebel** (`magoHebel`): die bestehenden Hebel-Seiten **verschoben** nach `/mago/hebel`, `/mago/hebel/board`, `/mago/hebel/[id]` (lesen `magoHebel` statt `levers`; `leverScore`/Board/Detail-Historie bleiben). Guard `requireSuperAdmin`.
- **HFK-Kennzahlen** (`magoKpis`): die bestehende KPI-Seite **verschoben** nach `/mago/kennzahlen` (liest `magoKpis`). Guard `requireSuperAdmin`.
- Mago-Übersicht (`/mago`): bekommt **2 eigene Kacheln** (Links auf `/mago/hebel` + `/mago/kennzahlen`, mit Count aus `magoHebel`/`magoKpis`) — **NICHT** als generische `MAGO_MODULES`-Einträge, da diese Module reiche eigene Seiten haben (kein generisches `MagoCrud`). `MAGO_MODULES` bleibt für Protokoll/Bewertung/Zeit/Meilensteine.

**Hinweis Historie:** Die verschobene Hebel-Detailseite ruft `getRecordHistory("magoHebel", …)`. Alt-Snapshots haben die Items unter `levers` → die Änderungs-Historie eines Hebels startet **nach** der Migration neu (kurze Tiefe). Bewusst akzeptiert (sekundär).

## 4. Abschnitt 3 — Cockpit/Heute aufräumen

- `components/cockpit/cockpit-tabs.tsx`: Tabs **Hebel** + **KPIs** entfernen.
- `app/(app)/cockpit/hebel*` + `app/(app)/cockpit/kpis`: entfernen (oder Redirect auf `/mago/...` für Alt-Links).
- `app/(app)/heute/page.tsx`: Blöcke **„Top-Hebel nach ROI"** + **„KPI-Snapshot"** entfernen (sie nutzen `levers`/`weeklyKpis`, nach Migration leer).
- `app/(app)/cockpit/page.tsx` (Hub): „Aktive Hebel" + „KPI-Wochen"-Counts aus „Datenbestand" entfernen.
- `lib/history.ts` `ACT_CONF`: Eintrag `levers` **entfernen** (Cockpit-Aktivitäts-Feed = nur Tasks + Entscheidungen). `getRecordHistory` für Hebel zieht künftig im Mago-Hebel-Detail (separat, liest `magoHebel` — Historie dort optional/sekundär).
- `lib/stephan-context.ts`: `levers`/`weeklyKpis` aus der Stephan-Wissensbasis **entfernen** (Retail ist jetzt Mago-privat; konsistent).

## 5. Betroffene Konsumenten (aus Grep, zu prüfen/anpassen)

`getCockpitData().levers`/`.weeklyKpis` werden genutzt in: `heute`, `cockpit/page`, `cockpit/hebel*`, `cockpit/kpis`, `cockpit/briefing`, `cockpit/stephan` (via stephan-context), `cockpit/umsetzung` (nur umsetzung). Jede Hebel-/KPI-Nutzung außerhalb von Mago wird entfernt; `getCockpitData` behält die Felder (leer) für Abwärtskompatibilität ODER `levers`/`weeklyKpis` werden später aus dem Typ entfernt (optional, separat).

## 6. Bewusst NICHT / Risiken

- **Kein** Umbau der Task-Kopplung — Tasks sind bereits plan-konform (Feed bestätigt). Cockpit zeigt Tasks weiter nach Phase/Werkzeug (`UMSETZUNGS_BLOECKE` bleibt).
- Migration berührt **Prod-Daten** — Schutz: idempotent + Snapshot (reversibel) + Anti-Wipe greift für `tasks`. Trigger bewusst durch Mago (super-only), Route danach entfernt.
- `leverScore`/`isLeverActive`/`sortedWeeks` (lib/cockpit.ts) bleiben (von den verschobenen Mago-Seiten genutzt).

## 7. Akzeptanzkriterien

1. Nach Migration: `/mago` zeigt „Wachstums-Hebel" (die Retail-Hebel, ROI-sortiert) + „HFK-Kennzahlen" (die KPIs); volle CRUD; super-only.
2. Cockpit hat **keine** Hebel/KPIs-Tabs mehr; `/heute` ohne Top-Hebel/KPI-Snapshot; Hub-Counts angepasst; Aktivitäts-Feed = Tasks/Entscheidungen.
3. Plan-Hebel sind weg (nicht mehr in `levers`, nirgends sichtbar).
4. `tsc --noEmit` grün; Migration reversibel (Snapshot vorhanden); keine Slug-Brüche (Alt-Hebel/KPI-Links per Redirect oder bewusst entfernt).
5. Prod-Verifikation: `/mago/hebel` rendert die Retail-Hebel; Cockpit/Heute sauber; Ladezeiten unverändert/besser.

## 8. Reihenfolge (für den Plan)

1. Mutate-API-SPEC für `magoHebel`/`magoKpis` + Mago-Seiten (verschobene Hebel/KPI-UI) + Mago-Übersicht-Kacheln. **(Code zuerst, damit nach Migration sofort sichtbar.)**
2. Migrations-Route + super-only Trigger.
3. **Migration triggern** (durch Mago) → verifizieren.
4. Cockpit/Heute/history/stephan-context Cleanup.
5. Migrations-Route wieder entfernen.
6. Prod-Verifikation gegen §7.
