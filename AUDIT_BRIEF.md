# MAGALOKO — Audit-Briefing für Codex (oder anderen Review-Agenten)

## Was ist das
Lokales Single-User-Cockpit für „Mago" (Digital Sales & Data Lead + PA bei Herr und Frau Klein, Wiener Kinder-Concept-Store). Node 24 nativ (kein Express), Vanilla-JS-Frontend (PWA). Läuft auf dem Heim-PC, erreichbar via Tailscale im privaten Tailnet.

## Stack
- **Server**: `server.mjs` — `node:http`, eigener Router, statisches File-Serving, `/api/state` (GET/PUT JSON-Store), Magic-Link-Auth (Brevo SMTP), JTL-CSV-Streaming-Endpoints
- **Frontend**: `index.html` + `app.js` (~10.000 Zeilen, Vanilla-JS, ein State-Objekt) + `styles.css` (~6.000 Zeilen) + `sw.js` (Service Worker, cache-first)
- **Bot**: `telegram-bot.mjs` — dependency-freier Long-Polling-Bot, liest `data/state.json`
- **Persistenz**: `data/state.json` (ein großes JSON, client-authoritative — Browser PUT't den ganzen State)

## Architektur-Besonderheiten (bitte verstehen vor Kritik)
- **Multi-Workspace**: `state.workspaces.{hfk,crmKunde,zentrale}.data.*`. Aktiver Workspace wird per Hot-Swap ins Top-Level gespiegelt (shared references). Siehe `applyWorkspaceLayer()` + `switchWorkspace()` in app.js.
- **Kein Build-Step, keine npm-Deps** im Kern (bewusst). Alles vanilla.
- **Auth aktuell `requireAuth:false`** (bewusst — nur Mago im Tailnet). Bewerte Sicherheit unter DIESER Prämisse, aber markiere was kritisch würde wenn öffentlich.

## FOKUS DES AUDITS (Priorität)

### 1. Sicherheit (höchste Priorität)
- `server.mjs`: Path-Traversal-Schutz beim statischen Serving (`normalize` + `allowedExtensions`) — wirklich dicht?
- Magic-Link-Auth-Flow (`/auth/request`, `/auth/verify`): Token-Generierung, Session-Handling, Timing-Angriffe
- `/api/state` PUT: keine Größen-/Schema-Validierung? DoS-Potenzial? (MAX_BODY prüfen)
- JTL-Endpoints (`/api/jtl/*`): Streamen GB-große CSVs aus dem ELTERN-Ordner — Pfad-Injection möglich? Memory-Blowup bei parallelen Requests?
- Secrets-Handling: liegt irgendwo ein Key im Klartext-Log oder im State?

### 2. Korrektheit / Bugs
- `applyWorkspaceLayer()`: die Migration + Typ-Korrektur-Logik (Array vs Objekt). Race-Conditions bei shared references?
- Lost-Update-Problem: Browser PUT't ganzen State, Bot schreibt separate Datei (`bot-scores.jsonl`). Gibt es andere Stellen wo zwei Schreiber kollidieren?
- `saveState()` Debounce + Offline-Queue — Datenverlust-Szenarien?
- Service Worker (`sw.js`): cache-first kann veralteten Code servieren. Versionierungs-Strategie ok?

### 3. Performance
- `app.js` ~10k Zeilen, ein File — Initial-Parse-Zeit auf Mobil?
- Order-Index lädt 466k Bestellungen + 1,25M Positions in RAM (`loadOrderIndex`, `loadAbcIndex`) — Memory-Footprint? Blockiert es den Event-Loop beim Parsen?
- `render()` rendert ALLE ~40 Views bei jeder State-Änderung neu — unnötig teuer?
- `searchArticles`/`searchAddresses`: lineare Scans über 100k+ Einträge pro Keystroke (debounced) — ok?

### 4. Wartbarkeit
- 10k-Zeilen-app.js: sinnvolle Modul-Aufteilung möglich ohne Build-Step? (ES-Module-Imports?)
- Wiederholungen / Copy-Paste zwischen den ~40 Render-Funktionen?
- Fehlerbehandlung: konsistent? Stille `catch {}`-Blöcke die Bugs verstecken?

## Was NICHT bewerten
- `config/*` (Secrets, ausgeschlossen)
- `data/*` (Geschäftsdaten, ausgeschlossen)
- `lernsystem-2026/`, `marktanalyse-2026/` (importierte Inhalte, kein Code)
- Fehlende Tests/CI — ist bewusst ein Solo-Tool, kein Team-Projekt

## Gewünschtes Output-Format
1. **Top-Findings** nach Severity (kritisch / hoch / mittel / niedrig)
2. Pro Finding: Datei + Zeile, Problem, konkreter Fix-Vorschlag
3. **Quick-Wins** (hoher Wert, geringer Aufwand) separat hervorheben
4. Keine generischen Best-Practice-Predigten — nur was für DIESES Tool relevant ist
