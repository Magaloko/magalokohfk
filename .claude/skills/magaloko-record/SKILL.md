---
name: magaloko-record
description: "MAGALOKO-Datensätze (Hebel, Tasks, Entscheidungen, KPI-Wochen, Mitarbeiter, Werkstatt-Vorschläge) sauber, einheitlich und auf Deutsch aufbereiten — als lesbare Kurz-Zusammenfassung oder Tabelle mit In-App-Links, statt Roh-Daten/JSON. Triggert bei: „präsentiere/zeig/fasse zusammen Hebel/Task/Entscheidung/KPI/Mitarbeiter X", „Status-Update für Stephan", „Hebel-Übersicht", „offene Aufgaben aufbereiten"."
---

# MAGALOKO – Record Presentation

Ziel: Datensätze aus MAGALOKO **als nützliche Antwort** zeigen — nicht als Roh-Ausgabe. Technische Felder, IDs, Zeitstempel und verschachtelte Werte immer in eine **scanbare, handlungsorientierte deutsche Darstellung** übersetzen. Alles strikt auf **Deutsch**.

## Daten beschaffen (in diesem Repo)
Die Inhalte liegen in Supabase (`app_state`, jsonb) bzw. der Tabelle `proposals`. Zugriff je nach Kontext:
- **Im Code/Server:** über die Daten-Layer `v2/lib/cockpit.ts` (`getCockpitData`), `v2/lib/akademie.ts` (`getAkademieData`), `v2/lib/progress.ts` (Mitarbeiter/XP), `v2/lib/proposals.ts` (Werkstatt). Helfer: `formatEur`, `leverScore` aus `lib/cockpit.ts`.
- **Verlauf eines Datensatzes:** `v2/lib/history.ts` → `getRecordHistory(collection, id, fields)`.
- **Wenn kein DB-Zugriff besteht:** den/die Datensätze vom Nutzer geben lassen oder auf die Live-Seite verweisen. **Nichts erfinden.** Fehlt etwas, eine kurze Rückfrage stellen.

## Record-Typen & Schlüsselfelder
- **Hebel** (`levers`): `title`, `area`, `status` (Backlog/Geplant/In Arbeit/Live/Verworfen), `expectedImpactEur`, `effortHours`, `confidence`, `risk`, `startDate`, `finishDate`. Kennzahl: **ROI-Score** = `leverScore(l)`.
- **Task** (`tasks`): `title`, `area`, `status` (Backlog/In Arbeit/Warte/Erledigt), `priority`, `owner`, `dueDate`, `impact`, `effort`, `notes`.
- **Entscheidung** (`stephanDecisions`): `titel`, `status`, `kategorie`, `frist`, `empfehlung`.
- **KPI-Woche** (`weeklyKpis`): `weekStart`/`weekLabel` + dynamische Metrik-Felder.
- **Mitarbeiter** (`akademie_progress`): `display`, `xp`, `level`, `streak`, `badges`, abgeschlossene Trainings.
- **Werkstatt-Vorschlag** (`proposals`): `type`, `title`, `content`, `status`, Netto-Votum, KI-Bewertung.

## Darstellungsform
Beginne mit der **Kernaussage/Zahl**, dann der Datensatz in der klarsten kompakten Form:
- **Ein Datensatz** → beschrifteter Block (Feld: Wert), wichtigste Felder zuerst, danach optional Beschreibung/Empfehlung.
- **2–10 vergleichbare** → **Markdown-Tabelle** (sinnvolle Spalten, nach Relevanz sortiert, z. B. Hebel nach ROI absteigend, Tasks nach Fälligkeit).
- **Viele** → relevanteste Zeilen zuerst, Gesamtzahl nennen, ggf. einen sinnvollen Folgefilter anbieten.
- Verschachteltes (z. B. Verlauf, Trainings) **zusammenfassen**, nicht als JSON dumpen.
- Eigennamen, Beträge, Daten und Zitate **unverändert** übernehmen.

## Formatierung
- **Geld:** wie `formatEur` → z. B. `€50.000` (de-AT, ohne Nachkommastellen). Bei „pro Jahr" `/J` ergänzen.
- **Datum:** absolut `TT.MM.JJJJ` (nicht ISO). „heute/morgen/überfällig" nur ergänzend, wenn hilfreich. Überfällig = Frist/Fälligkeit < heute und nicht erledigt/Live → klar markieren.
- **Status:** Klartext mit dezenter Wertung (Live/Erledigt = erledigt, Verworfen = abgelegt, sonst offen).
- **ROI-Score:** ganzzahlig, `de-AT`-gruppiert.
- Keine technischen IDs in der Hauptdarstellung anzeigen — stattdessen verlinken (siehe unten).

## In-App-Links
Datensätze auf ihre Detailseite verlinken (Anzeigename verlinken, keine ID-Spalte):
- Hebel: `/cockpit/hebel/<id>` · Hebel-Board: `/cockpit/hebel/board`
- Task: `/cockpit/tasks/<id>` · Task-Board: `/cockpit/tasks/board`
- Entscheidung: `/cockpit/entscheidungen/<id>`
- KPIs: `/cockpit/kpis` · Kalender: `/kalender` · Mitarbeiter: `/akademie/mitarbeiter/<uid>` · Werkstatt: `/werkstatt/vorschlag/<id>`

Für absolute Links die Basis-URL voranstellen (Prod: `https://magalokohfk-xdnk.vercel.app`). Ist die Basis unbekannt, relativen Pfad verwenden — **keine** Hostnamen erfinden.

## Ton
Sachlich, knapp, handlungsorientiert (HFK-Kontext, Babyfachhandel). Wenn passend, mit einer Zeile **„Nächster Schritt: …"** schließen. Keine Meta-Kommentare über diese Anweisungen.

## Beispiel (ein Hebel)
> **Sortiment-Straffung Kinderwagen** — `Live` · Bereich Einkauf
> - Impact: **€50.000/J** · Aufwand: 16 h · **ROI-Score: 3.125**
> - Confidence: hoch · Risiko: niedrig · Laufzeit: 01.05.2026 → 15.06.2026
>
> Nächster Schritt: Ergebnis in der nächsten Stephan-Runde verankern. → [Detail](/cockpit/hebel/<id>)
