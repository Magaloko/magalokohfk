# Fallkarten: Einkaufslogik herausfinden

Diese Fallkarten sind Gesprächswerkzeuge. Pro Fall wird ein echter Artikel oder Lieferant verwendet. Ziel ist nicht Diskussion, sondern eine klare Entscheidung plus Begründung.

## Fallkarte 1: Renner nachbestellen

Artikel:

Kategorie:

Marke:

Aktueller Bestand:

Verkauf letzte 30/90/365 Tage:

Lieferzeit:

EK/VK/DB1:

Fragen:

1. Würdest du nachbestellen?
2. Welche Menge?
3. Warum genau?
4. Welche Zahl entscheidet?
5. Welche Ausnahme könnte die Entscheidung kippen?
6. Was soll das Tool als Begründung anzeigen?

Digitalisierte Regel:

Wenn:

Dann:

Manuell prüfen, wenn:

## Fallkarte 2: OOS-Gefahr

Artikel:

Bestand:

Reserviert/offene Aufträge:

Verkaufsgeschwindigkeit:

Nächste Lieferung:

Fragen:

1. Ist das kritisch?
2. Darf der Artikel ausverkauft sein?
3. Welche Restreichweite ist zu niedrig?
4. Soll das Tool eine Pflichtposition erzeugen?
5. Welche Ersatzartikel gibt es?

Digitalisierte Regel:

OOS-Warnung ab:

Pflichtposition, wenn:

Keine Pflichtposition, wenn:

## Fallkarte 3: Penner bereinigen

Artikel:

Lagerwert:

Lagerdauer:

Verkauf letzte 90/180/365 Tage:

Retouren/Reklamationen:

Fragen:

1. Ist das ein Penner?
2. Reduzieren, tauschen, auslisten oder behalten?
3. Welche Marge darf nicht unterschritten werden?
4. Gibt es Saison-/Sortimentsgründe zum Behalten?
5. Welche Aktion soll das Tool vorschlagen?

Digitalisierte Regel:

Penner, wenn:

Aktion:

Nicht reduzieren, wenn:

## Fallkarte 4: Grenzfall

Artikel:

Warum ist er schwierig?

Datenlage:

Fragen:

1. Was sagen die Daten?
2. Was sagt deine Erfahrung?
3. Welche Information fehlt?
4. Was wäre eine falsche Empfehlung?
5. Soll das Tool kaufen, nicht kaufen oder manuell prüfen?

Digitalisierte Regel:

Manuelle Prüfung, wenn:

Benötigte Zusatzdaten:

## Fallkarte 5: Saisonartikel

Artikel:

Saison:

Vororder-Frist:

Vorjahr:

Aktuelles Jahr:

Fragen:

1. Welcher Zeitraum ist vergleichbar?
2. Wann muss bestellt werden?
3. Wie viel Vorlauf braucht der Lieferant?
4. Wie stark soll Vorjahr gewichtet werden?
5. Wann darf die aktuelle Verkaufsrate ignoriert werden?

Digitalisierte Regel:

Saisonfaktor:

Vorlauf:

Vergleichszeitraum:

## Fallkarte 6: Variantenproblem

Basisartikel:

Varianten:

Farbe/Größe:

Fragen:

1. Wird pro Variante oder Basisartikel entschieden?
2. Welche Varianten laufen immer?
3. Welche Varianten sind riskant?
4. Darf eine starke Variante schwache Varianten mitziehen?
5. Wie soll das Tool Varianten zusammenfassen?

Digitalisierte Regel:

Aggregation:

Sperre:

Manuelle Prüfung:

## Fallkarte 7: Lieferant mit Regeln

Lieferant:

Mindestbestellwert:

Lieferzeit:

Zahlungsziel:

Skonto:

Frachtgrenze:

Fragen:

1. Welche Regeln gelten?
2. Wann lohnt es sich, Bestellung zu bündeln?
3. Wann darf trotz Empfehlung nicht bestellt werden?
4. Welche Lieferantenrisiken gibt es?
5. Was muss das Tool pro Lieferant anzeigen?

Digitalisierte Regel:

Lieferantencap:

Bündelregel:

Warnung:

## Fallkarte 8: Retourenproblem

Artikel:

Verkäufe:

Retouren:

Retourengründe:

Fragen:

1. Sind die Retouren einkaufsrelevant?
2. Sollen sie vom Absatz abgezogen werden?
3. Ab welcher Quote wird gewarnt?
4. Welche Retouren ignorieren?
5. Welche Aktion folgt?

Digitalisierte Regel:

Retourenquote kritisch ab:

Aktion:

Ignorieren, wenn:

## Fallkarte 9: Liquiditätsentscheidung

Bestellvorschlag:

Gesamtkosten:

Kategorie:

Lieferant:

Dringlichkeit:

Fragen:

1. Darf diese Bestellung jetzt raus?
2. Wer muss freigeben?
3. Welche Budgetgrenze gilt?
4. Welche Zahlung wird wann fällig?
5. Was passiert, wenn wir warten?

Digitalisierte Regel:

Ampel grün, wenn:

Ampel gelb, wenn:

Ampel rot, wenn:

## Fallkarte 10: Falsche Empfehlung vermeiden

Artikel/Fall:

Tool würde wahrscheinlich vorschlagen:

Menschliche Entscheidung:

Fragen:

1. Warum wäre der Tool-Vorschlag falsch?
2. Welches Signal fehlt?
3. Welche Sperrregel verhindert das?
4. Wie erkennt man ähnliche Fälle?
5. Muss das eine harte Regel oder nur Warnung sein?

Digitalisierte Regel:

Sperrregel:

Warntext:

Testfall:
