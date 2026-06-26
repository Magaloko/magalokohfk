# Magaloko App-Dokumentation

Stand: 26.06.2026

Diese Dokumentation erklärt, wo sich die wichtigsten Bereiche in Magaloko befinden und wofür die einzelnen Module gedacht sind.

## Grundprinzip

Magaloko ist die Steuerungszentrale für SeBo, MasterMind, Einkaufsplaner, Service-Prozesse und Stephan-Updates.

Die App beantwortet im Alltag vier Fragen:

1. Was ist offen?
2. Worauf warten wir?
3. Was ist erledigt?
4. Was muss Stephan wissen oder entscheiden?

## Wichtigste Startseite

### `/cockpit` — Heute & Steuerung

Diese Seite ist der tägliche Einstieg.

Sie zeigt:

- offene Tasks
- offene Entscheidungen
- Blocker und Risiken
- Punkte, die auf Zugang, Freigabe oder Abstimmung warten
- erledigte oder gelieferte Punkte
- einen automatisch erzeugten Stephan-Update-Text
- das Mago Command Center zur schnellen Erfassung

Diese Seite zuerst öffnen, wenn du wissen willst, was jetzt wichtig ist.

## Steuerungsseiten

### `/cockpit/system` — SeBo System

Gesamtüberblick über alle SeBo-Module:

- JTL-Analytics-Sync
- Einkaufsplaner
- v2.0 Case-Management
- Treasury / Cashflow
- Billing, VIPA und VEKTRA

Diese Seite nutzen, wenn Stephan einen Gesamtstand braucht oder ein Modul priorisiert werden muss.

### `/cockpit/einkauf` — Einkaufsplaner

Detailseite für den MasterMind-Einkaufsplaner.

Sie erklärt:

- P0-Status: Treasury-Ampel, Brand-Budget, OOS-Schutz
- offene P1-Themen: Lieferzeit-Range, Kategorie-Regeln, Safety-Buffer, ML-Forecast
- offene P2-Themen: Event-Kalender, Rhythm-Break, Markdown-Steuerung
- technische Bezugspunkte wie Optimizer, API und Einkaufs-Cockpit

Diese Seite nutzen, wenn es um Einkauf, DB1, OOS, Budgets oder Bestellvorschläge geht.

### `/cockpit/sebo` — Service / SeBo

Steuerungsseite für SeBo v2 und das Case-Management.

Sie erklärt:

- v1-Abschluss
- v2-Neuscope
- Case-Management
- KI-Kategorisierung und KI-Drafts
- Reminder, Herstellerfälle und Handover-Bedarf

Diese Seite nutzen, wenn es um Kundenservice, Service-Automation oder SeBo-v2-Abnahme geht.

## Operative Seiten

### `/cockpit/tasks` — Tasks

Alle Aufgaben mit Status, Priorität, Bereich, Owner und Fälligkeit.

Nutzung:

- konkrete Arbeit planen
- offene Aufgaben prüfen
- erledigte Aufgaben markieren
- Aufgaben einem Modul oder einer Phase zuordnen

### `/cockpit/entscheidungen` — Entscheidungen

Alle Entscheidungen, die Stephan oder die Geschäftsführung treffen müssen.

Nutzung:

- offene Entscheidungen vorbereiten
- Empfehlungen festhalten
- Fristen sichtbar machen
- entschiedene oder vertagte Punkte dokumentieren

### `/cockpit/umsetzung` — Wartet auf

Liste für alles, was nicht weitergeht.

Typische Kategorien:

- Zugang
- Freigabe
- Abstimmung
- Blocker
- Risiko

Diese Seite nutzen, wenn klar sein muss, wer reagieren muss.

### `/cockpit/briefing` — Stephan-Update

Automatisch zusammengestelltes Update für Stephan.

Enthält:

- erledigte Punkte
- aktuellen Fokus
- Blocker
- offene Entscheidungen
- offene Zugänge
- Abstimmungen
- Risiken

Der Text kann direkt kopiert und an Stephan gesendet werden.

### `/cockpit/aktivitaet` — Aktivität

Chronologische Sicht auf Änderungen und zuletzt erfasste Punkte.

Diese Seite nutzen, wenn nachvollzogen werden soll, was zuletzt passiert ist.

### `/cockpit/stephan` — Stephan-Assist

Assistent für Fragen, Zusammenfassungen und Nachrichtenvorbereitung.

Nutzung:

- Updates formulieren
- Rückfragen vorbereiten
- Projektstand aus vorhandenen Daten erklären lassen

## Wissen und Prozessdigitalisierung

### `/prozesse` — Prozess-Spiel

Hier werden echte Fälle in prüfbare Prozess-Spielzüge umgewandelt.

Geeignet für:

- Einkaufsfälle
- Servicefälle
- Datenlücken
- Risiken
- Systemsignale
- nächste technische Schritte

### `/mastermind` — MasterMind

Strategische Gesamtsicht auf Stephans Plan.

Enthält:

- Vision
- Roadmap
- SeBo-Gesamtsystem
- Einkaufsplaner-Status
- SeBo-v2-Status
- offene Fragen an Stephan

## Typische Arbeitsabläufe

### Täglicher Start

1. `/cockpit` öffnen.
2. Blocker und Wartet-auf prüfen.
3. Nächste konkrete Schritte ansehen.
4. Neue Punkte im Mago Command Center erfassen.

### Update für Stephan

1. `/cockpit/briefing` öffnen.
2. Automatischen Text prüfen.
3. Fehlende Entscheidungen ergänzen.
4. Text kopieren und senden.

### Neuen offenen Punkt erfassen

1. Auf `/cockpit` im Mago Command Center frei notieren.
2. Typ wählen: Aufgabe, Entscheidung, Blocker, Status oder Einkaufsfall.
3. Felder ausfüllen.
4. Speichern.
5. Auf der passenden Detailseite weiterverfolgen.

### Einkaufslogik digitalisieren

1. `/cockpit/einkauf` öffnen.
2. P1- oder P2-Thema auswählen.
3. Echten Fall im Mago Command Center oder Prozess-Spiel erfassen.
4. Daraus Task, Entscheidung oder technische Umsetzung ableiten.

## Navigationsregel

Wenn du nicht weißt, wo du anfangen sollst:

1. Immer zuerst `/cockpit`.
2. Wenn es um Gesamtstand geht: `/cockpit/system`.
3. Wenn es um Arbeit geht: `/cockpit/tasks`.
4. Wenn Stephan entscheiden muss: `/cockpit/entscheidungen`.
5. Wenn etwas hängt: `/cockpit/umsetzung`.
6. Wenn du ein Update brauchst: `/cockpit/briefing`.
