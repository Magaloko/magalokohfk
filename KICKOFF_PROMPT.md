# Kopier diesen Block in einen neuen Claude-Code-Chat

---

Hallo Claude. Ich bin Mago — Digital Sales & Data Lead für Herr und Frau Klein (HFK), ein Kinder-Concept-Store in Wien mit JTL Wawi 2.0 + JTL-Shop 5.4.2. Hauptansprechpartner: Stephan (Geschäftsführer).

**Projekt-Setup:**
- Working Dir: `F:\JTL_Export\JTL_Export\magaloko`
- App: MAGALOKO — mein lokales Cockpit (Node + Vanilla JS + PWA)
- Start: `cd F:\JTL_Export\JTL_Export\magaloko && node server.mjs` (Port 4177)
- Für Multi-Device: `HOST=0.0.0.0` setzen, dann via Tailscale erreichbar unter `http://100.127.246.78:4177`
- State: `data/state.json` (auto-backup täglich in `data/backups/`)
- Auth-Config: `config/auth.json` (nicht ins Backup)

**Stack:**
- Server: Node 24 native (`node:http`, kein Express)
- Frontend: index.html + app.js (~9000 Zeilen) + styles.css (~3000 Zeilen) + sw.js (PWA)
- Login: Magic-Link via Brevo SMTP (`/auth/request` → `/auth/verify`)
- KI: DeepSeek-API (Key nur in sessionStorage, NICHT in state.json speichern)
- Externe Daten: JTL-CSV-Exporte in `F:\JTL_Export\JTL_Export\` (dbo_*.csv, Verkauf_*.csv, Rechnung_*.csv); Schema in schema.sql

**Was schon drin ist (90+ Module):** Hebel-Cockpit · Anomalien-Radar · Stephan-Profil & Versprechen-Tracker · Risk-Radar · Decision-Log · Pre-Mortems · Hypothesen-Tracking · Wirkungsnachweis · Saisonplan · Lieferanten-Verhandlungen · Einkaufsplaner v1.5 (Modul 1 Messen + Modul 2 Saison) · BCG-Marken · Champions/CLV · Cross-Selling · Sortimentsbereinigung · VIP-Wächter · SeBo-Bridge · KI-Tools-Hub (Devils Advocate, Übersetzer, Mail-Optimierer, Daten-Erklärer, Begriff-Erklärer) · Briefings mit Auto-Glossar · Quick-Add-FAB · Voice-Input · Globale Suche (Cmd+K) · Push-Notifications · Time-Tracking · Monatsbericht · Team-Modul · Honorar · Wettbewerbs-Radar · Mood-Trend · Knowledge-Graph · Jahres-Recap · Vendor-Karten · Pitches · Glossar.

**Wichtige Doku-Dateien:**
- `ROADMAP.md` — strategische Roadmap (8 Phasen)
- `SETUP_REMOTE_SECURE.md` — Tailscale + Magic-Link für Remote-Zugang
- `SETUP_TUNNEL.md` — Cloudflare Tunnel (öffentlich)
- `STEPHAN_TERMIN_26_05.md` — letzte Termin-Vorbereitung
- `F:\JTL_Export\JTL_Export\MAGO_OneSource_Konzept.md` — Stephans **echter Auftrag**: JTL→Postgres ETL → Metabase → Einkaufsplaner + ABC-Tool bis August
- `F:\JTL_Export\JTL_Export\EINKAUFSPLANER_v1.5_Messen_Saison.md` — Spec für Phase 3

**Aktueller Stand HFK (aus SeBo-Statistiken):**
- €44,5M kumulierter Umsatz / 466k Bestellungen / €95,90 AOV
- 32.540 Kunden, davon 753 VIPs = 68% Umsatz
- -21,7% Marge gesamt (Problem)
- Schrumpfung seit 2022-Peak (€5,07M → 2025 €3,67M = -28%)
- Februar 2025 Bruch -23% YoY, ungeklärt
- **Offene Stephan-Zugänge:** JTL-API/DB + Mail-Forwarding (seit Wochen) + Shop-Admin + GA4 + Doofinder. Nur Brevo läuft.

**Magos Arbeitsweisen:**
- **Keine Secrets in MAGALOKO-State speichern** (Knowledge-Card k4)
- **Auto-Backup** existiert serverseitig (täglich, 30 Tage rotierend) — vor großen Änderungen trotzdem manuell ⋯ → Backup
- **Stephan-Sprache**: direkt, kurz, mit Zahlen, kein Tech-Jargon (Profil-Trigger sind „vage Antworten" + „lange Tech-Erklärungen")
- **Cache-Issue**: nach Edits Service Worker via DevTools/Console deregistrieren, sonst sieht man alten Code

**Was ich von dir erwarte:**
- Direkter Ton ohne Floskeln
- Werkzeuge in Batches nutzen (besonders Browser via `browser_batch`)
- Bei Bug-Verdacht: erst `node --check` + `curl /api/state` + Konsole-Logs prüfen, bevor du Code änderst
- Größere Änderungen: erst TaskCreate, dann arbeiten
- Bei strategischen Entscheidungen: nicht selbst entscheiden, AskUserQuestion mit 2-4 Optionen

**Aktuell läuft:**
- MAGALOKO-Server auf 0.0.0.0:4177 (per Tailscale `100.127.246.78` von Handy/Tablets erreichbar)
- Tailscale installiert auf Heim-PC + Android-Handy
- Auth aktuell `requireAuth: false` (kein Login nötig) — bewusst weil nur Mago im Tailnet

**Was ist mein Anliegen heute:** [hier ergänzen]

---

## Kürzere Variante (wenn du nur kurz was klären willst)

Mago hier. MAGALOKO läuft unter `F:\JTL_Export\JTL_Export\magaloko\` (Node + Vanilla JS, ~9000 Zeilen `app.js`). Tailscale aktiv `100.127.246.78:4177`. Aktueller Auftrag: HFK-Operator-Modus für Stephan, OneSource-Plan (JTL→Postgres→Metabase→Einkaufsplaner) bis August. Was ich brauche: [...]
