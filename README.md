# MAGALOKO

Mago Cockpit fuer digitale HFK-Steuerung.

## Starten

```powershell
cd F:\JTL_Export\JTL_Export\magaloko
node server.mjs
```

Danach im Browser oeffnen:

```text
http://127.0.0.1:4177
```

## Inhalt

- Start-Dashboard mit Tagesfokus, Entscheidungen, kritischen Zugaengen und Gespraechspunkt
- Systemlandkarte fuer JTL Wawi, JTL-Shop, SeBo, N8N, All-inkl, Analytics, GSC, Doofinder, DeepSeek und Brevo
- Zugangsliste ohne Passwort-/API-Key-Speicherung
- Roadmap/Kanban fuer Magos Aufgaben
- Stephan-Briefing-Generator mit Markdown-Ausgabe
- Gespraechsvorbereitung
- Jobs & Aufgaben: Rollenprofile, Aufgabenbereiche und Schritt-fuer-Schritt-Playbooks
- Wissenskarten fuer HFK-Kontext

## Sicherheit

MAGALOKO speichert nur lokale MVP-Daten im Browser-`localStorage`.
Keine Passwoerter, API-Keys oder Kundendaten eintragen.
