# MAGALOKO Roadmap — Vom Cockpit zur App

Stand: 2026-05-25
Ziel: MAGALOKO wird zur primären Arbeitsumgebung für Mago — installiert auf Handy + Laptop, weltweit erreichbar, proaktiv, mit allem was zur Steuerung von HFK gebraucht wird.

---

## Leitprinzipien

1. **Mago first**: Jede Funktion muss Magos Arbeit konkret schneller oder besser machen — keine Features um der Features willen.
2. **Mobile = Primärgerät**: Wenn etwas auf dem Handy nicht funktioniert, ist es nicht fertig.
3. **Offline-fähig**: Mago muss auch im Zug, im Lager oder bei Stephan ohne Netz arbeiten können — Sync später.
4. **Keine Secrets im Tool**: Auth nur über sichere Tokens, Customer-Data bleibt in JTL.
5. **Schritte klein, Auslieferung sofort**: Jede Phase liefert für sich nutzbare Funktion.

---

## Phase 1 — Überall erreichbar (1-2 Tage)

**Ziel**: MAGALOKO ist von Magos Handy aus dem Café, der Bahn, beim Lieferanten erreichbar — mit eigener URL über HTTPS.

### 1.1 Cloudflare Tunnel einrichten
- `cloudflared` Binary lokal installieren
- Free-Plan-Account bei Cloudflare, Domain konfigurieren (z.B. `magaloko.deinedomain.de`)
- Tunnel anlegen: `cloudflared tunnel create magaloko` → routet `https://magaloko.deinedomain.de` → `http://127.0.0.1:4177`
- Als Windows-Service registrieren, damit der Tunnel startet wenn der PC läuft
- **Ergebnis**: Magos Handy öffnet `magaloko.deinedomain.de` → MAGALOKO da, mit gültigem SSL

### 1.2 Magic-Link-Auth (Pflicht vor öffentlicher URL)
- Neue Server-Routen `/auth/request` (E-Mail eingeben, Link via Brevo versenden) + `/auth/verify?token=…`
- Session-Cookie (httpOnly, secure, SameSite=Lax, 30 Tage)
- Middleware: alle `/api/*` und `/` Routen prüfen Session
- Token in `data/auth.json` (gehasht), nur Magos Mail darf anfragen
- Logout-Button im ⋯-Menü
- **Ergebnis**: Niemand außer Mago kommt rein, auch wenn die URL bekannt wird

### 1.3 HTTPS-Härtung
- HSTS-Header
- `Content-Security-Policy: default-src 'self'; …`
- Rate Limiting auf `/auth/*` (max 5 Versuche / 15 min)
- Audit-Log: `data/audit.jsonl` für jede Auth-Aktion

---

## Phase 2 — PWA: Installierbar wie eine App (1 Tag)

**Ziel**: Mago tippt „Home-Screen hinzufügen" und MAGALOKO wird zu einer App mit Icon, Splash-Screen, Vollbild — auf iOS und Android identisch.

### 2.1 PWA-Grundlagen
- `manifest.json` mit Name, Icons (192×192, 512×512), Theme-Farbe (`#1f1d19`), Display `standalone`
- App-Icon designen (Goldener „M" auf dunklem Grund — passt zu bestehendem Branding)
- Splash-Screens für iOS
- Service Worker (`sw.js`): cached static assets (HTML/CSS/JS) + JTL-Live-Daten letzte Version
- Install-Prompt in ⋯-Menü („App installieren")

### 2.2 Offline-Modus
- Service Worker cached `state.json` lokal
- Wenn `/api/state` offline → letzte gecachte Version zeigen
- Bei Reconnect → outstanding writes flushen (queue)
- Toast „offline" oben permanent wenn keine Verbindung

### 2.3 Touch-Optimierung
- Audit aller Buttons: mindestens 44px Tap-Target
- Swipe-Gesten in Listen (Aufgaben/Versprechen): nach links → Status weiter, nach rechts → erledigt
- Bottom-Nav-Bar auf Mobile (statt versteckter Sidebar): Heute / Hebel / Strategie / Mehr
- Sticky-Aktions-Bar pro View statt Toolbar-Wrapping

---

## Phase 3 — Quick Capture & Voice (2 Tage)

**Ziel**: Mago hört Stephan was sagen, zückt das Handy, hat in 5 Sekunden ein Versprechen oder eine Aufgabe erfasst — auch per Sprache.

### 3.1 Floating Quick-Add-Button
- Permanenter `+`-Button unten rechts auf jedem View
- Long-Press öffnet Schnellauswahl-Wheel: 📝 Aufgabe · 🤝 Versprechen · 💡 Idee · 🎯 Hebel · 📋 Notiz · 🟢 Mood
- Klick auf Typ → Mini-Formular mit nur 2-3 Pflichtfeldern
- Beim Speichern Toast mit Sprung-Link zum Detail-Edit für Nachträge

### 3.2 Voice Capture
- Web Speech API (`SpeechRecognition`) in Quick-Add integriert
- 🎤 Button beim Quick-Add → Audio aufnehmen, transkribieren (offline auf iOS/Android im Browser möglich)
- Direkt anschließend DeepSeek parsen lassen: aus Text Felder extrahieren (was, wann, Status, Kontext)
- Manuelle Bestätigung vor Speichern

### 3.3 Globale Suche (Cmd/Ctrl+K)
- Floating Search-Overlay (auch per Button auf Mobile)
- Sucht parallel über: Aufgaben · Versprechen · Hebel · Marken · VIP-Artikel · Briefings · Stephan-Fragen · Knowledge-Cards · KI-Library
- Tipp-Vervollständigung, Pfeiltasten/Enter für Navigation
- Jump-to mit Highlight des Treffers

---

## Phase 4 — Proaktivität (2-3 Tage)

**Ziel**: MAGALOKO erinnert Mago von selbst — Versprechen, das morgen fällig ist, VIP-Artikel unter Threshold, KPI-Anomalie.

### 4.1 Push-Notifications
- Web Push API + VAPID Keys
- Service Worker registriert für Push
- Backend-Routine: jede Stunde Stand prüfen, bei neuen kritischen Events Push senden
- Trigger:
  - Versprechen heute / morgen fällig
  - VIP-Artikel unter 50% Soll
  - Anomalie der Woche eingetragen
  - KPI-Schwelle gerissen
- Einstellungen pro Trigger-Kategorie (Mago kann Push deaktivieren)

### 4.2 Daily Briefing
- Neuer Nav-Punkt „Morgen-Briefing" in HEUTE
- Jeden Morgen 07:00 automatisch generiert (Server-Cronjob)
- DeepSeek bekommt: offene Versprechen, Top-3-Hebel, neue Anomalien, kritische VIPs, anstehende Gespräche
- Ergebnis: 8-Zeilen-Briefing „Heute wichtig: …, …, …. Pass auf: …. Empfehlung für Stephan-Gespräch heute Nachmittag: …"
- Auf Wunsch per Mail um 7:30 versenden

### 4.3 Smart Reminders
- Pro Kunden-Segment-Eintrag: nach Wiederkaufzyklus +14 Tage → Reminder
- Pro Briefing an Stephan: nach 7 Tagen → Reminder „Antwort von Stephan?"
- Pro Hebel-Status „In Arbeit": nach 14 Tagen ohne Update → Reminder

---

## Phase 5 — Tiefere Integrationen (3-5 Tage)

**Ziel**: MAGALOKO ist nicht nur Eingabemaske, sondern wirkt zurück in Magos Toolchain.

### 5.1 Mail-Versand
- Brevo SMTP via Server-API
- „Briefing senden" Button: PDF/HTML direkt an Stephan
- Versand-Log in Briefing-Karte (versendet am, geöffnet?, geantwortet?)
- Templates für Wochenupdate, Versprechen-Erinnerung, Reaktivierungs-Kampagne

### 5.2 Kalender-Sync
- `.ics`-Export pro Gespräch / Termin
- Optional: Google Calendar API (OAuth) — push neue Termine + überfällige Versprechen
- Wochenplan-View bekommt Kalender-Sync-Button

### 5.3 Echte KPIs aus JTL
- Server-Job liest täglich `Verkauf_tAuftrag.csv` + `Rechnung_tRechnung.csv` (oder JTL-Export-Endpoint)
- Aggregiert: Umsatz Tag/Woche/Monat/Jahr, Bestellungen, AOV, Wiederkaufquote, Bestand
- Befüllt automatisch `state.weeklyKpis` → Anomalie-Radar arbeitet live
- Februar-2025-Bruch wird auf Knopfdruck reproduzierbar

### 5.4 Slack/Discord-Bridge (optional)
- Webhook-URL einstellbar
- Bei neuen Versprechen / kritischen VIP / Kampagnen-Live → Notification in Slack
- „Stephan-Briefing fertig" Push

---

## Phase 6 — Pro-Features (laufend, je nach Bedarf)

**Ziel**: MAGALOKO deckt nicht nur Magos Operationen, sondern auch sein Self-Management ab.

### 6.1 Anhänge & Belege
- File-Upload bei Aufgabe / Versprechen / Briefing / Knowledge-Card
- Foto-Capture direkt aus Mobile (Lager-Screenshot, Whiteboard, Stephan-Notiz)
- Lokale Speicherung in `data/attachments/<entity-id>/`
- KI-OCR: Foto rein, Text raus, dann strukturiert in Modul übernehmen

### 6.2 Time-Tracking & Selbst-Steuerung
- Pomodoro-Timer pro Aufgabe
- Wochen-Übersicht: Stunden pro Bereich (Support / Shop / Daten / Einkauf / Stephan)
- Output-Journal: was wurde abgeliefert (für Vergütungs-/Status-Gespräch)
- Lern-Journal mit Tags

### 6.3 Reporting
- Monatsbericht-Generator: alle Modul-Daten zusammenstellen → 2-Seiten-PDF
- Schlussseite: „Was hat MAGALOKO Mago erspart" (Zeit-Schätzung)
- Auto-Versand an Mago + Stephan zum Monatsende

### 6.4 Team-Modul
- Personen-Karten: Beate, Lorna, Markus, Bernie, Stephan + jeweiliges Profil-Lite (wie Stephan-Profil)
- „Was bespreche ich heute mit X" — Sammelbecken
- Geburtstage, Vorlieben, Kommunikationsstil
- Last-Contact-Tracker

### 6.5 Rechnungs- & Honorar-Modul
- Stundensätze + erbrachte Tage
- Monats-Rechnung an HFK generieren
- Zahlungseingang tracken
- Cashflow-Forecast

---

## Phase 7 — Architektur (parallel, bei wachsendem State)

### 7.1 SQLite statt state.json
- Sobald state.json > 5 MB oder > 2.000 Items pro Collection
- `better-sqlite3` (synchron, schnell, kein Setup)
- Migrations-Skript: alle bestehenden Felder übernehmen
- API-Endpoints bleiben gleich

### 7.2 WebSocket für Realtime
- Wenn Mago auf 2 Geräten gleichzeitig arbeitet (Laptop + Handy)
- Änderung am einen Gerät → Update am anderen sofort sichtbar
- Lib: `ws` (eingebaut in Node, kein Overhead)

### 7.3 Backups automatisch
- Cronjob: tägliche Sicherung von `data/` nach `data/backups/YYYY-MM-DD.tar.gz`
- 30 Tage Aufbewahrung
- Optional: Upload nach S3-kompatiblem Speicher (Hetzner Storage Box / iDrive)

### 7.4 Audit-Log
- Jede Mutation in `data/audit.jsonl`: timestamp, user, action, entity-id, diff
- Ermöglicht „Was hab ich letzte Woche geändert?"-Ansicht
- Bei Datenverlust: Replay möglich

---

## Phase 8 — Wachstum & Features (post-Phase-7)

Brainstorming für später, was zu Mago als Operator passen würde:

- **OneSource-Integration**: wenn HFK das Postgres-Setup aus Stephans MAGO-Konzept tatsächlich aufbaut → direkter Sync statt CSV-Reader
- **eBay/Amazon-Listings-Sicht**: zentrale Übersicht über alle Marktplätze
- **A/B-Tracking**: pro Shop-Änderung Vorher/Nachher messen automatisch
- **Wettbewerbsbeobachtung**: tägliches Crawling 5-10 Konkurrenten, Preise/Sortiment
- **Stephan-Mood-Trend**: Mood-Log über Monate als Linienchart
- **Sortimentskuratoren-Modus**: Lorna kann selbst über MAGALOKO Saisonfeedback geben
- **Stephan-Sicht**: ein eingeschränkter Read-only-View nur für Stephan mit den wichtigsten Zahlen + offenen Entscheidungen
- **Multi-Tenant**: wenn Mago das System anderen Shop-Operators verkaufen will

---

## Empfohlene Reihenfolge

1. **Phase 1.1 + 1.2 + 1.3** zuerst — danach ist MAGALOKO am Handy. Ohne das nichts anderes nutzbar mobil.
2. **Phase 2.1 + 2.2** PWA-Install + Offline. Macht das Tool zur echten App.
3. **Phase 3.1 + 3.3** Quick-Add + globale Suche. Größter UX-Hebel pro Aufwand.
4. **Phase 4.1 + 4.2** Push + Daily Briefing. Macht MAGALOKO proaktiv — das hebt die Adoption massiv.
5. **Phase 5.3** Echte JTL-KPIs. Endlich realer Februar-Bruch-Tracker.
6. Danach **Phase 5.1 (Mail) und Phase 6.1 (Attachments)** nach Bedarf.
7. **Phase 7** parallel wenn Datenmenge wächst — kein Druck.

---

## Was bewusst nicht im Plan ist

- **Native iOS/Android-App**: PWA reicht für 95% des Usecase, eigene Apps wären massiver Mehraufwand
- **Multi-User mit komplexen Rollen**: Mago first, Stephan-View kommt erst wenn wirklich gefragt
- **JTL-Schreibzugriff**: MAGALOKO bleibt Cockpit, Wahrheit bleibt in JTL — keine Synchronisations-Hölle riskieren
- **Eigene KI hosten**: DeepSeek-/OpenAI-API reicht, eigenes Modell unnötig
- **Komplexes Workflow-Engine**: Vordefinierte Workflows ja, generischer Builder nein
- **Public Marketing Site**: MAGALOKO ist Magos Werkzeug, kein Produkt

---

## Anker für Mago

> Jede neue Funktion muss die Frage beantworten: *„Macht mich das schneller, besser oder ruhiger im Job?"*. Wenn nicht beides erfüllt — auslassen.

> Stephan-Test: *„Wenn Stephan plötzlich nachfragt — kann ich in 30 Sekunden eine Antwort aus dem Tool ziehen?"*. Wenn nein, fehlt was.

> Mobile-Test: *„Kann ich das im Stehen am Bahnsteig in 60 Sekunden machen?"*. Wenn nein, ist es nicht mobil-fertig.
