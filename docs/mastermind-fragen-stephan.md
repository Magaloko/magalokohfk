# MasterMind — Priorisierter Fragenkatalog an Stephan

> Zweck: Stephans Kopf-Wissen strukturiert **aus dem MasterMind-Plan herausziehen**, damit die Werkzeuge belastbar gebaut und betrieben werden können. Der Plan (`lib/strategy.ts`) nennt bewusst **keine** konkreten Zahlen, Schwellen und Regeln (Halluzinations-Schutz, Prinzip 6.4) — genau diese Lücken füllen die folgenden Fragen.
>
> **Priorisierung** = Roadmap-Sequenz (Foundation → Treasury → Einkauf → VIPA & SeBo → VEKTRA → Future Scope) **+** aktueller Stabilisierungs-Druck (Kontokorrent an der Grenze → Liquidität zuerst). VEKTRA ist live, daher beim Ausbau nachrangig.
>
> Tags: **[GF-SAFE]** = vertrauliche GF-Ebene · **[TEAM]** · **[PUBLIC]**. Quelle pro Frage: das jeweilige Werkzeug bzw. der Querschnitt.
>
> Stand: 2026-06-01 · abgeleitet aus MASTERMIND v2.0 (Mai 2026).

---

## P0 — Querschnitt / Foundation-Governance (gilt für ALLE Werkzeuge, zuerst klären)

Diese Punkte sind das Fundament — ohne sie steht kein einziges Werkzeug belastbar.

1. **Datenquellen-Inventur:** Welche Systeme speisen die HFK-Datenschicht (JTL Wawi/`eazybusiness`, Web-Shop, Banking, Lieferanten-Portale, Buchhaltung)? Was per API, was nur per Export? **[GF-SAFE]**
2. **ERP-Connector:** Aktuelles ERP = JTL Wawi? Welche Tabellen/Felder sind verlässlich gepflegt (tBestellung, tBestellpos, tArtikel, tWarenLager)? Wo ist die Datenqualität schwach? **[GF-SAFE]**
3. **Vertrauensebenen konkret:** Wer hat GF-SAFE-Zugriff (nur Stephan/Beate? Lorna? Sarah?)? Wie werden TEAM- und PUBLIC-Felder operativ getrennt? Wer vergibt Rechte?
4. **Hosting & Datenschutz:** Wo dürfen GF-SAFE-Daten (Margen, Konditionen, Bankdaten) liegen — Cloud-Region, DSGVO-Auflagen, Auftragsverarbeitung? **[GF-SAFE]**
5. **Daten-Ownership & Pflege-Rhythmus:** Wer pflegt welche Daten und wie oft (Marken = Lorna? Finanzen = Beate? Sales-Daten = Sarah? Marketing = Adnan?)?
6. **Abnahme-Standard:** Was ist dein Abnahme-Kriterium pro Werkzeug (wer testet, wie lange Pilot, was muss erfüllt sein für „live")? (Prinzip: „Ohne Doku keine Abnahme.")
7. **Reihenfolge-Bestätigung:** Bleibt es bei Foundation → Treasury → Einkauf? Oder zwingt der Liquiditäts-Druck zu einem schlanken Treasury-Vorlauf parallel zur Foundation?

---

## P0 — Treasury (Liquiditäts-Steuerung · höchster wirtschaftlicher Druck)

*Status Geplant · deterministisch. „Erfolg hier bestätigt die Foundation."*

8. **Kontokorrent:** Aktueller Rahmen, aktueller Stand, Zielreduktion bis wann? Zinssatz? **[GF-SAFE]**
9. **Cash-Inflows:** Quellen & Systeme für Zuflüsse (Tagesumsätze stationär + Shop, offene Forderungen, Zahlungsziele)? **[GF-SAFE]**
10. **Cash-Outflows:** Fixkosten (Miete Kirchengasse 7, Gehälter, Versicherungen), Lieferantenverbindlichkeiten, Steuern, Leasing — Höhe & Fälligkeiten? **[GF-SAFE]**
11. **180-Tage-Forecast:** Welche Positionen müssen wöchentlich rein? Welche Genauigkeit gilt als „belastbar" (Ziel-%)? Wer kalibriert? **[GF-SAFE]**
12. **Order-Ampel-Schwelle:** Bestätigst du die 2.000-€-Grenze für die Prüfung? Wer darf „rot" überschreiben (nur GF)? Wie werden die 3 Alternativ-Vorschläge gewichtet? **[GF-SAFE]**
13. **Konfidenz-Gewichte:** Bleiben 1,0 / 0,9 / 0,7 für hoch/mittel/niedrig? Wer setzt die Konfidenz je Forecast-Position? **[GF-SAFE]**
14. **Skonto-Landschaft:** Welche Lieferanten bieten Skonto, zu welchen Konditionen (z. B. 2 % / 10 Tage netto 30)? Ab welchem effektiven Jahreszins lohnt das Ziehen? **[GF-SAFE]**
15. **Saisonalität:** Welche Monate sind die kritischen Liquiditäts-Tiefpunkte? Wie wirken die 14–18 Wochen Eigenmarken-Vorlauf konkret? **[GF-SAFE]**
16. **Liqui-Cockpit-Szenarien:** Welche Szenario-Schieber braucht die GF (Umsatz ±, Zahlungsziel-Verschiebung, Großorder, Lieferanten-Ausfall)? **[GF-SAFE]**

---

## P1 — Einkaufssystem (Margen-Steuerung · größter Hebel, baut auf Treasury)

*Status Geplant · hybrid. Ziel: 1–2 Prozentpunkte mehr DB1, weniger Kapitalbindung.*

17. **A/B/C-Klassen & DB1:** Wie definierst du „A-Klasse / hoher DB1" (Schwellen)? Woher kommt der DB1 je Artikel verlässlich? **[GF-SAFE]**
18. **Autopilot-Grenze:** Darf das System Renner eigenständig nachbestellen oder nur vorschlagen (Buyer-Review)? Bis zu welchem Order-Volumen autonom? **[GF-SAFE]**
19. **Penner-Definition:** Ab wann ist ein Artikel ein „Penner" (Sell-Through-Schwelle, Lagerdauer, Kapitalbindung)? **[GF-SAFE]**
20. **Markdown-Logik:** Sell-Through-Markdown-Stufen je Kategorie + Floor (Mindestmarge), unter den nie reduziert wird? **[GF-SAFE]**
21. **Event-Kalender:** Welche Events steuern HFK wirklich (Black Friday, Schulanfang, Weihnachten, Mode-Saisonwechsel) — mit welchen Vorlaufzeiten?
22. **OOS-Frühwarnung:** Lieferzeit-Range je Lieferant/Kategorie (Mode vs. KiWa/Möbel = 14–18 Wochen?)? Safety-Buffer je Kategorie? **[GF-SAFE]**
23. **Zielkauf KiWa & Möbel:** Bestätigung Vorkasse/auftragsorientiert? Welche Lieferanten, welche Konditionen? **[GF-SAFE]**
24. **Top-20-Renner-Sichtbarkeit:** Woran misst sich „Sichtbarkeit" (Shop-Position, Bestand, Platzierung im Store)? Was ist ein „Rhythm-Break"?

---

## P2 — VIPA (GF-Assistent · parallel zu SeBo, baut auf Foundation)

*Status Geplant · agentisch. Ziel: ~200 GF-Stunden/Jahr zurückgewinnen.*

25. **Mail-Zugang:** Welches Postfach, welche Rechte (nur Lesen/Triage vs. auch Senden)? **[GF-SAFE]**
26. **Mail-Klassen:** Welche Kategorien priorisieren (Lieferant, Steuer/Behörde, Kunde, intern, Bank)? Was ist „kritisch"?
27. **Reminder-Quellen:** Welche Fristen proaktiv (Skonto, Steuertermine, Lieferungen) — woher kommen die Termine (Kalender, Buchhaltung)? **[GF-SAFE]**
28. **Delegation (Team-Task-Sub):** Wer ist für was die „richtige Person" (Lorna/Marken, Sarah/Sales-Service, Adnan/Marketing, Beate/Finanzen)? Delegations-Regeln?
29. **HFK-Ton:** 2–3 Referenz-Mails, an denen VIPA den Schreibstil lernt?
30. **Kanäle:** Sollen Anruf & WhatsApp wirklich zu Tasks werden — welche Nummern/Accounts (WhatsApp Business)?
31. **Autonomie-Grenze:** Was darf VIPA selbst senden vs. nur vorbereiten (Mensch-im-Loop)? **[GF-SAFE]**

---

## P2 — SeBo (Service-Bot · parallel zu VIPA)

*Status Geplant · agentisch. Mensch im Loop für Versand — nie vollautomatisch an Kunden.*

32. **Kanäle & Volumen:** Wo kommen Service-Anfragen rein (Mail, Shop-Kontaktformular, WhatsApp)? Wie viele pro Tag?
33. **5 Kategorien:** Bestätigung Retoure / Lieferung / Rechnung / Produkt / Sonstiges — oder fehlt eine (z. B. Reklamation, Beratung)?
34. **Datenabruf:** Welche Bestelldaten per Bestellnummer (aus Wawi/Shop) darf SeBo ziehen? **[GF-SAFE]**
35. **Policies für korrekte Antworten:** Retouren-Fristen & -Kosten, Versandregeln, Rechnungs-Handling — die harten Regeln, damit SeBo nicht halluziniert. **[TEAM]**
36. **Eskalation & SLA:** Wer ist der Mensch im Loop (Sarah/Service?)? Antwort-SLA? Wann „manuelle Prüfung"?

---

## P3 — VEKTRA (Verkaufstrainer · LIVE, Fragen zum Ausbau)

*Status Live = diese App. Fragen zielen auf Inhaltstiefe & die Sales-Cockpit-Erweiterung.*

37. **Inhalts-Lücken:** Welche Marken-Profile fehlen noch / sind veraltet? Wer pflegt sie verbindlich (Lorna)? **[TEAM]**
38. **Sales-Cockpit / Live-Lookup:** Welche Live-Daten braucht das Team im Verkaufsgespräch (Bestand, Größe/Schnitt, Liefertermin, Preis)? **[TEAM]**
39. **Verbindlicher Rollout:** Wer nutzt VEKTRA verpflichtend, mit welchem Ziel? Wie messen wir „neue Mitarbeitende in 3 statt 12 Monaten einsatzbereit"?
40. **Management-Sicht:** Welche KPIs will das Store-Management je Mitarbeiter sehen (Trainings, Quote, Schwächen)?

---

## P4 — Future Scope & Strategisch (geparkt / Horizont 2026–2027)

*Brand Intelligence ab Q3–Q4 2026 (geparkt bis Stephan entscheidet); Customer Experience ab Q1 2027.*

41. **Brand Intelligence — Wiederaufnahme:** Welches Signal/Datum löst die Reaktivierung aus? Bestätigung der „12 Felder je Marke"? Quelle für den wöchentlichen „Brand Pulse"? **[GF-SAFE]**
42. **Customer App 2027:** Budget/Förderung geklärt? Datenquellen für die Killer-Features (Babywetter, Größenrechner mit Marken-Schnitt-Awareness)?
43. **Ungarn-Expansion:** Zeithorizont? Was muss die Architektur dafür vorbereiten (Mehrsprachigkeit, zweiter Standort, Steuer/Recht)? **[GF-SAFE]**
44. **Investor-Pitch:** Welche Produkt-Substanz soll bis wann stehen, um den Pitch mit „echter Substanz" zu führen? **[GF-SAFE]**
45. **ERP-Wechsel-Option:** Ist ein ERP-Wechsel mittelfristig realistisch oder rein optional? Beeinflusst das den Connector-Bau jetzt? **[GF-SAFE]**

---

### Hinweis zur Nutzung
- **Reihenfolge im Gespräch:** P0 (Querschnitt + Treasury) zuerst — sie blockieren alles Weitere.
- **Antworten = Wissensbasis:** Jede beantwortete Frage wird zur belegbaren Faktenbasis (kein erfundenes Wissen) für das jeweilige Werkzeug.
- **Offen lassen ist ok:** Wo Stephan (noch) keine Zahl nennt, bleibt die Frage offen markiert — nichts wird erfunden.
