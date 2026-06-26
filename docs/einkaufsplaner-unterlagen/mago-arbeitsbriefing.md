# Mago-Arbeitsbriefing: Einkaufsplaner / SeBo EK-Tool

Stand: 2026-06-25

## Ziel

Mago muss aus Stephan und den Einkäuferinnen die operative Einkaufslogik herausziehen und in prüfbare Regeln übersetzen. Das Gespräch ist kein Tool-Demo-Termin. Es geht darum, herauszufinden:

- welche Einkaufsentscheidungen HFK wirklich trifft
- welche Daten dafür zählen
- wo Erfahrung wichtiger ist als reine Kennzahl
- welche Vorschläge das Tool machen darf
- welche Entscheidungen immer manuell bleiben müssen
- was als bezahlter Ausbau gilt

## Aktueller SeBo-/EK-Tool-Stand

Live geprüft unter `https://sebo.dadakaev.tech/dashboard`.

Vorhanden:

- ServiceBot/Tickets produktiv sichtbar
- Einkauf-App vorhanden
- Budget-Planer vorhanden
- API für Einkaufsempfehlungen vorhanden
- Artikel-API mit ca. 119.048 Artikeln
- Kunden-API mit ca. 36.153 Kunden
- Orders-API mit ca. 481.082 Orders
- Budgetberechnung liefert Vorschlagsbudget
- Einkaufsempfehlungen liefern artikelbezogene Vorschläge
- Lieferanten-API vorhanden
- Treasury-Routen vorhanden

Einkauf/Budget kann bereits:

- Budget berechnen
- Budget auf Marken/Basisartikel verteilen
- Artikel priorisieren
- Score-Modi nutzen
- OOS-Pflichtpositionen berücksichtigen
- Reichweite, Lieferzeit, Safety und DB1-Filter verwenden
- Empfehlungen mit Mengen, Kosten, DB1 und Score ausgeben

## Aktuelle Datenlage

Lokal vorhanden:

- Rechnungspositionen: ca. 1.170.970
- Auftragspositionen: ca. 1.517.661
- Artikel: ca. 114.819
- Lieferantenbestellungen: ca. 46.449
- Lieferantenbestellpositionen: ca. 443.617
- Mindestlagerbestand je Lager: ca. 486.036
- Retouren: ca. 1.927
- Retourenpositionen: ca. 2.948

Live/SeBo:

- Artikel, Kunden, Orders sind angebunden.
- Retouren sind noch nicht angebunden.
- Treasury-Forecast wirkt aktuell wie Platzhalter.
- Skonto-Opportunities leer.
- Produkt-/Lieferanten-UI zeigt teils weniger als die API tatsächlich liefert.
- Lieferantenkonditionen sind unvollständig.

## Kritische Lücken

1. Verkaufspositionen müssen zuverlässig mit `kartikel` verbunden sein.
2. Retouren müssen in die Einkaufslogik einfließen.
3. Lieferzeiten je Lieferant/Kategorie fehlen oder sind nicht gepflegt.
4. Mindestbestellwerte, Zahlungsziele, Skonto und Frachtgrenzen fehlen.
5. Einkaufspreise/Konditionen sind nicht vollständig belastbar.
6. Treasury braucht echte Cash-/Budgetlogik statt Platzhalter.
7. Tool-Vorschläge müssen gegen echte Einkaufsentscheidungen validiert werden.

## Gesprächsziel mit Stephan

Am Ende muss Mago wissen:

- Welche Kategorie zuerst produktionsreif werden soll.
- Welche Datenquelle als Wahrheit gilt.
- Welche Regeln das Tool anwenden darf.
- Welche Vorschläge manuell geprüft werden müssen.
- Welche Ausgabe Stephan wirklich nutzen würde.
- Welche Ausbaustufe bezahlt werden muss.

## Scope- und Preisabgrenzung

Bestehende Stabilisierung:

- Pilot
- Abnahme
- Dokumentation
- Fehlerkorrekturen vorhandener Funktionen
- Datenimport-Testbatch

Eigenes Datenpaket:

- Sales-Import produktionsfest machen
- `kartikel`-Matching
- Retourenimport
- Datenqualitätsreport
- Abgleich Sales/Lager/Artikel

Eigenes EK-Tool-Paket:

- Einkaufsregeln je Kategorie
- Ampellogik
- Lieferzeiten
- Safety-Buffer
- Saisonlogik
- OOS-Pflichtpositionen
- Penner-/Markdown-Logik

Eigenes Treasury-/Finanzpaket:

- Cash-Budget
- Zahlungsziele
- Skonto
- Kontokorrent-/Liquiditätsampel
- Order-Check ab definierter Schwelle

Eigenes JTL-Write-Back-Paket:

- Bestellvorschlag als Lieferantenauftrag in JTL
- Rechte-/Freigabeprozess
- Audit-Log
- Rollback-/Fehlerstrategie
- Testumgebung

## Satz für Stephan

„Das Einkaufstool ist technisch schon weit. Der nächste Schritt ist nicht noch mehr Oberfläche, sondern die fachliche Validierung: echte Artikel, echte Einkaufsentscheidungen, echte Datenregeln. Danach kann ich sauber sagen, welcher Ausbau Restarbeit ist und was ein neues Entwicklungspaket ist.“
