# Digitalisierungs-Protokoll: Einkaufswissen in Regeln übersetzen

Dieses Schema nutzt Mago nach jedem Gespräch, um mündliche Expertise in MAGALOKO und später in SeBo/EK-Tool-Logik zu überführen.

## 1. Prozess-Spielzug für MAGALOKO `/prozesse`

Bereich:

Prozess:

Datum:

Beteiligte:

Entscheidung:

Einsatz:

Systemsignal:

Nachweis:

Risiko:

Status:

Nächster Schritt:

Beispiel:

- Bereich: Einkauf
- Prozess: Renner nachbestellen
- Entscheidung: Joolz Regenschutz nachbestellen, aber Menge begrenzen.
- Einsatz: Bestand 4, Verkauf 21 Stück im Fenster, DB1 35 %, Lieferzeit unklar.
- Systemsignal: Bestand reicht nicht für Zielreichweite.
- Nachweis: EK-Recommendation + Lagerbestand + Sales.
- Risiko: Lieferzeit fehlt, DB1 niedrig, kein Autopilot ohne Lieferantendaten.
- Nächster Schritt: Lieferzeit und Mindestbestellwert für Joolz klären.

## 2. Regelkarte

Regelname:

Zweck:

Gilt für:

Eingabedaten:

Formel/Logik:

Ampel:

- Grün:
- Gelb:
- Rot:

Ausnahmen:

Manuelle Prüfung, wenn:

Sperre, wenn:

Begründungstext für Tool:

Testartikel:

Abnahme durch:

## 3. Datenfeld-Karte

Datenfeld:

Warum benötigt:

Quelle:

Aktueller Status:

Qualität:

Aktualisierung:

Fehlerbild:

Fallback:

Owner:

Beispielwerte:

## 4. Systemsignal-Karte

Signal:

Beschreibung:

Berechnung:

Schwelle:

Zeitraum:

Kategorieabhängig:

Lieferantenabhängig:

Was soll passieren:

Warntext:

## 5. Testfall-Karte

Testfall-ID:

Artikel:

Kategorie:

Marke:

Input-Daten:

Erwartete Tool-Entscheidung:

Erwartete Menge:

Erwartete Begründung:

Menschliche Entscheidung:

Abweichung:

Korrektur:

## 6. Preis-/Scope-Karte für Mago intern

Thema:

Ist es bestehende Stabilisierung?

Ist es neues Datenpaket?

Ist es neues Logikpaket?

Ist es neues Integrationspaket?

Risiko:

Abhängigkeiten:

Schätzung:

Preisargument:

Nicht kostenlos mitmachen, wenn:

## 7. Checkliste nach jedem Termin

- Wurden mindestens 3 echte Artikel besprochen?
- Gibt es mindestens eine klare Regel?
- Gibt es mindestens eine Ausnahme?
- Gibt es mindestens eine Sperrregel?
- Wurde die Datenquelle geklärt?
- Wurde der nächste technische Schritt benannt?
- Ist klar, ob das Restarbeit oder neuer Scope ist?
- Wurde ein Testfall für spätere Abnahme definiert?

## 8. Von Gespräch zu Umsetzung

1. Gesprächsnotizen in Prozess-Spielzüge übertragen.
2. Regeln in Regelkarten verdichten.
3. fehlende Datenfelder sammeln.
4. Testfälle mit echten Artikeln definieren.
5. technische Umsetzung nur für bestätigte Regeln starten.
6. vor JTL-Write-Back immer erst CSV-/Vorschlagsmodus validieren.
