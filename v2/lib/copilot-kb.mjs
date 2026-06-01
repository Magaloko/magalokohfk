// Gemeinsame Microsoft-365-Copilot-Wissensbasis für HFK (Herr und Frau Klein).
// EINE Quelle für Web-App (über copilot-kb.ts) UND Telegram-Bot (direkter Import).
// Inhalte praxisnah, deutsch, retail-/babyfachhandel-spezifisch.

export const APPS = [
  { key: "outlook", label: "Outlook", icon: "send" },
  { key: "excel", label: "Excel", icon: "kpi" },
  { key: "word", label: "Word", icon: "book" },
  { key: "teams", label: "Teams", icon: "users" },
  { key: "powerpoint", label: "PowerPoint", icon: "scenario" },
  { key: "copilotchat", label: "Copilot Chat", icon: "chat" },
];
export const appLabel = (k) => APPS.find((a) => a.key === k)?.label || k;

export const ROLES = [
  { key: "einkauf", label: "Einkauf", icon: "package" },
  { key: "marketing", label: "Marketing", icon: "globe" },
  { key: "buchhaltung", label: "Buchhaltung", icon: "money" },
];
export const roleLabel = (k) => ROLES.find((r) => r.key === k)?.label || k;

export const COPILOT_GUIDES = [
  // ===== OUTLOOK =====
  {
    id: "outlook-inbox-triage", app: "outlook", minutes: 5,
    title: "Posteingang in 5 Minuten priorisieren",
    goal: "Morgens schnell sehen, was wirklich wichtig ist, und nichts übersehen.",
    steps: [
      { title: "Copilot öffnen", detail: "Im neuen Outlook bzw. Outlook im Web oben rechts im Menüband auf das Copilot-Symbol klicken. (Setzt eine Microsoft-365-Copilot-Lizenz voraus.)" },
      { title: "Posteingang zusammenfassen lassen", detail: "Copilot-Chat in Outlook nutzen und nach den wichtigsten ungelesenen Mails fragen.", prompt: "Fasse meine ungelesenen E-Mails von heute zusammen und ordne sie nach Dringlichkeit. Markiere, welche eine Antwort von mir brauchen." },
      { title: "Eine lange Konversation verdichten", detail: "Eine längere E-Mail-Kette öffnen und oben „Zusammenfassen“ wählen — Copilot fasst Verlauf und offene Punkte zusammen." },
      { title: "Aufgaben ableiten", detail: "Aus der Zusammenfassung die To-dos in MasterMind (Cockpit → Tasks) oder als Outlook-Aufgabe festhalten.", prompt: "Welche konkreten Aufgaben ergeben sich für mich aus diesen E-Mails? Liste sie als kurze Stichpunkte." },
    ],
    tips: ["Keine sensiblen Kundendaten (Geburts-/Gesundheitsdaten) in freie Prompts schreiben.", "Copilot kann irren — Prioritäten kurz gegenchecken."],
  },
  {
    id: "outlook-reply-draft", app: "outlook", minutes: 4,
    title: "Professionelle Antwort auf eine Kundenanfrage",
    goal: "In Sekunden einen freundlichen, korrekten Antwortentwurf erzeugen und anpassen.",
    steps: [
      { title: "Auf die Mail antworten", detail: "Die Kundenanfrage öffnen und auf „Antworten“ klicken." },
      { title: "Entwurf mit Copilot starten", detail: "Im leeren Antwortfeld auf „Mit Copilot entwerfen“ klicken und den Auftrag eingeben.", prompt: "Schreibe eine freundliche, professionelle Antwort: Wir haben den Kinderwagen [Modell] in der gewünschten Farbe vorrätig und bieten eine kostenlose Beratung an. Schlage zwei Termine diese Woche vor." },
      { title: "Ton & Länge feinjustieren", detail: "Über die Copilot-Optionen Ton (z. B. „freundlich“) und Länge anpassen oder per Folgebefehl nachschärfen.", prompt: "Mach die Antwort etwas herzlicher und kürzer, und füge eine Grußformel mit unserem Geschäftsnamen hinzu." },
      { title: "Prüfen und senden", detail: "Entwurf gegenlesen (Preise, Verfügbarkeit, Namen stimmen?), korrigieren, dann senden. Der Mensch bleibt verantwortlich." },
    ],
    tips: ["Konkrete Fakten (Preis, Modell, Termin) selbst vorgeben — Copilot erfindet sonst Platzhalter.", "Vor dem Senden immer prüfen."],
  },
  {
    id: "outlook-meeting-prep", app: "outlook", minutes: 6,
    title: "Lieferanten-/Markentermin vorbereiten",
    goal: "Mit einem Befehl alle relevanten Mails und Infos zu einem Partner gebündelt bekommen.",
    steps: [
      { title: "Copilot-Chat (Arbeit) öffnen", detail: "In Outlook oder über Microsoft 365 Copilot den Chat öffnen, der auf deine Mails/Dateien zugreift." },
      { title: "Vorbereitung anfordern", detail: "Nach allem zur Marke/zum Lieferanten fragen.", prompt: "Bereite mich auf das Gespräch mit [Lieferant/Marke] vor: Fasse unsere letzten E-Mails, offene Bestellungen, zugesagte Liefertermine und offene Fragen zusammen." },
      { title: "Agenda erstellen", detail: "Aus der Zusammenfassung eine kurze Agenda ableiten lassen.", prompt: "Erstelle daraus eine Agenda mit 4 Punkten und je einer Leitfrage." },
      { title: "In MasterMind hinterlegen", detail: "Den Termin im Kalender und ggf. als Entscheidung/Task im Cockpit anlegen." },
    ],
  },

  // ===== EXCEL =====
  {
    id: "excel-analyze-sales", app: "excel", minutes: 7,
    title: "Verkaufszahlen analysieren",
    goal: "Aus einer Verkaufstabelle Trends, Ausreißer und Empfehlungen herausholen — ohne Formelwissen.",
    steps: [
      { title: "Daten als Tabelle formatieren", detail: "Wichtig: Daten markieren und mit Strg+T in eine echte Excel-Tabelle umwandeln. Copilot in Excel arbeitet zuverlässig nur mit formatierten Tabellen." },
      { title: "Copilot in Excel öffnen", detail: "Auf der Registerkarte „Start“ ganz rechts auf das Copilot-Symbol klicken." },
      { title: "Analyse anfordern", detail: "Nach Erkenntnissen fragen.", prompt: "Analysiere diese Verkaufsdaten: Welche Marken/Produkte wachsen, welche schwächeln? Zeige die Top 5 und auffällige Trends." },
      { title: "Visualisierung vorschlagen lassen", detail: "Copilot kann Diagramme und PivotTables vorschlagen und einfügen.", prompt: "Erstelle ein Diagramm, das den Umsatz pro Monat und Warengruppe zeigt." },
      { title: "Ergebnis übernehmen", detail: "Passende Erkenntnisse als KPI/Notiz in MasterMind (Cockpit → KPIs) festhalten." },
    ],
    tips: ["Spaltenüberschriften klar benennen (z. B. „Umsatz“, „Marke“, „Monat“) — Copilot versteht so besser.", "Keine Klarnamen von Kund:innen in der Tabelle, wenn vermeidbar."],
  },
  {
    id: "excel-formula", app: "excel", minutes: 5,
    title: "Formeln erstellen & verstehen lassen",
    goal: "Berechnungen anlegen und unbekannte Formeln erklärt bekommen.",
    steps: [
      { title: "Copilot in Excel öffnen", detail: "Registerkarte „Start“ → Copilot-Symbol." },
      { title: "Neue Spalte per Befehl", detail: "Copilot eine Formelspalte erstellen lassen.", prompt: "Füge eine Spalte „Marge %“ hinzu, die (Verkaufspreis − Einkaufspreis) / Verkaufspreis als Prozent berechnet." },
      { title: "Formel erklären lassen", detail: "Eine vorhandene Formelzelle markieren und erklären lassen.", prompt: "Erkläre mir in einfachen Worten, was diese Formel macht und wann sie fehlschlägt." },
      { title: "Prüfen", detail: "Stichprobe rechnen: Ergibt die Formel bei einer Zeile das erwartete Ergebnis?" },
    ],
  },
  {
    id: "excel-clean", app: "excel", minutes: 6,
    title: "Tabelle aufräumen & ergänzen",
    goal: "Unsaubere Listen schnell sortieren, kennzeichnen und vervollständigen.",
    steps: [
      { title: "Als Tabelle formatieren", detail: "Strg+T auf den Datenbereich anwenden." },
      { title: "Hervorheben lassen", detail: "Copilot Auffälligkeiten markieren lassen.", prompt: "Markiere alle Zeilen, bei denen der Lagerbestand unter 5 liegt, und sortiere nach Lagerbestand aufsteigend." },
      { title: "Kategorisieren", detail: "Neue Hilfsspalte erzeugen lassen.", prompt: "Füge eine Spalte „Nachbestellen“ mit „Ja/Nein“ hinzu, basierend auf Lagerbestand unter 5." },
      { title: "Ergebnis prüfen", detail: "Kurz kontrollieren, ob die Kennzeichnung stimmt." },
    ],
  },

  // ===== WORD =====
  {
    id: "word-draft", app: "word", minutes: 5,
    title: "Beratungsprotokoll aus Stichpunkten",
    goal: "Aus ein paar Notizen ein sauberes Dokument erzeugen.",
    steps: [
      { title: "Neues Dokument öffnen", detail: "Leeres Word-Dokument starten — Copilot „Mit Copilot entwerfen“ erscheint oben im Text." },
      { title: "Auftrag + Stichpunkte geben", detail: "Den Entwurfsbefehl mit deinen Stichpunkten füttern.", prompt: "Erstelle ein Beratungsprotokoll für einen Babyfachhandel aus diesen Stichpunkten: Familie erwartet Zwillinge, Budget mittel, interessiert an Kinderwagen-Duo und Autositz, Folgetermin nächste Woche. Struktur: Anliegen, Empfehlung, nächste Schritte." },
      { title: "Verfeinern", detail: "Abschnitte umschreiben/kürzen lassen.", prompt: "Formuliere den Abschnitt „Empfehlung“ konkreter und füge eine Tabelle mit Produkt, Marke und Preis ein." },
      { title: "Finalisieren", detail: "Logo/Vorlage anwenden, Fakten prüfen, speichern." },
    ],
    tips: ["Je konkreter die Stichpunkte, desto besser der Entwurf.", "Vorlagen wiederverwenden spart Zeit (Mago kann HFK-Vorlagen bereitstellen)."],
  },
  {
    id: "word-rewrite", app: "word", minutes: 4,
    title: "Schreiben umformulieren (z. B. Reklamation)",
    goal: "Einen Text höflicher, klarer oder kürzer machen.",
    steps: [
      { title: "Text markieren", detail: "Den zu ändernden Absatz markieren — das Copilot-Symbol am Rand erscheint." },
      { title: "Umschreiben lassen", detail: "Über „Mit Copilot umschreiben“ den Wunsch angeben.", prompt: "Formuliere diesen Absatz höflich, lösungsorientiert und in maximal 5 Sätzen um. Ton: verständnisvoll, professionell." },
      { title: "Variante wählen", detail: "Aus den Vorschlägen die beste Version übernehmen oder erneut anpassen." },
      { title: "Prüfen", detail: "Aussage und Fakten gegenlesen, dann übernehmen." },
    ],
  },
  {
    id: "word-summarize", app: "word", minutes: 4,
    title: "Langes Dokument zusammenfassen & befragen",
    goal: "Schnell verstehen, worum es geht, und gezielt Fragen stellen.",
    steps: [
      { title: "Dokument öffnen & Copilot starten", detail: "Im geöffneten Dokument das Copilot-Symbol oben rechts anklicken." },
      { title: "Zusammenfassung anfordern", detail: "Kernpunkte ziehen lassen.", prompt: "Fasse dieses Dokument in 5 Stichpunkten zusammen und nenne die wichtigsten Fristen oder Bedingungen." },
      { title: "Gezielt nachfragen", detail: "Konkrete Fragen ans Dokument stellen.", prompt: "Welche Kündigungsfrist und welche Konditionen gelten laut diesem Vertrag?" },
      { title: "Belege prüfen", detail: "Wichtige Aussagen an der Originalstelle im Dokument verifizieren." },
    ],
  },

  // ===== TEAMS =====
  {
    id: "teams-recap", app: "teams", minutes: 5,
    title: "Meeting-Zusammenfassung & Action Items",
    goal: "Nach (oder während) einer Besprechung sofort Ergebnisse und Aufgaben haben.",
    steps: [
      { title: "Transkript/Aufzeichnung aktivieren", detail: "Für die beste Zusammenfassung das Meeting transkribieren oder aufzeichnen lassen (Teilnehmende informieren)." },
      { title: "Copilot im Meeting öffnen", detail: "Während des Meetings oben auf „Copilot“ klicken — auch nach dem Meeting verfügbar (Intelligent Recap)." },
      { title: "Recap & Aufgaben anfordern", detail: "Nach Ergebnissen und To-dos fragen.", prompt: "Fasse die Besprechung zusammen: Welche Entscheidungen wurden getroffen und welche Action Items hat wer bis wann?" },
      { title: "Offene Punkte klären", detail: "Gezielt nachhaken.", prompt: "Was sind meine persönlichen Action Items aus diesem Meeting?" },
      { title: "In MasterMind übernehmen", detail: "Aufgaben/Entscheidungen ins Cockpit übertragen." },
    ],
    tips: ["Copilot im Meeting braucht Transkript oder Aufzeichnung für volle Funktion.", "Teilnehmende über Aufzeichnung informieren (Datenschutz)."],
  },
  {
    id: "teams-catchup", app: "teams", minutes: 4,
    title: "Verpasste Chats & Kanäle aufholen",
    goal: "Nach Abwesenheit in Minuten auf Stand kommen.",
    steps: [
      { title: "Chat/Kanal öffnen", detail: "Den betreffenden Chat oder Kanal in Teams öffnen." },
      { title: "Copilot im Chat starten", detail: "Oben rechts im Chat auf das Copilot-Symbol klicken." },
      { title: "Aufholen lassen", detail: "Nach dem Wesentlichen seit gestern fragen.", prompt: "Fasse die wichtigsten Nachrichten in diesem Kanal seit gestern zusammen und nenne offene Fragen an mich." },
      { title: "Antworten", detail: "Wo nötig direkt antworten — Entwürfe kann Copilot ebenfalls vorschlagen." },
    ],
  },

  // ===== POWERPOINT =====
  {
    id: "ppt-from-word", app: "powerpoint", minutes: 6,
    title: "Präsentation aus einem Word-Dokument",
    goal: "Aus einem bestehenden Dokument in Minuten einen Foliensatz machen.",
    steps: [
      { title: "Neue Präsentation öffnen", detail: "PowerPoint starten und auf der Registerkarte „Start“ das Copilot-Symbol anklicken." },
      { title: "Aus Datei erstellen", detail: "Copilot eine Präsentation aus dem Dokument erzeugen lassen.", prompt: "Erstelle eine Präsentation aus dem Dokument [Dateiname] mit Titelfolie, Agenda und je einer Folie pro Abschnitt." },
      { title: "Folien straffen", detail: "Textmenge reduzieren und Struktur schärfen.", prompt: "Reduziere den Text pro Folie auf Stichpunkte und füge am Ende eine Zusammenfassungsfolie hinzu." },
      { title: "Sprechernotizen erzeugen", detail: "Notizen für den Vortrag ergänzen lassen.", prompt: "Erstelle kurze Sprechernotizen für jede Folie." },
    ],
    tips: ["Copilot in PowerPoint braucht ein gespeichertes Quelldokument (OneDrive/SharePoint).", "Folien danach gegenlesen — Fakten und Zahlen prüfen."],
  },
  {
    id: "ppt-brand-deck", app: "powerpoint", minutes: 7,
    title: "Marken-/Lieferantenpräsentation erstellen",
    goal: "Einen überzeugenden Foliensatz zu einem Thema von Grund auf erzeugen.",
    steps: [
      { title: "Copilot öffnen", detail: "Start-Registerkarte → Copilot-Symbol." },
      { title: "Thema vorgeben", detail: "Copilot einen kompletten Entwurf erstellen lassen.", prompt: "Erstelle eine 8-Folien-Präsentation über die Marke [Marke] für ein Verkaufstraining: Herkunft, USPs, Hero-Produkte, typische Einwände, Cross-Selling-Ideen." },
      { title: "Design & Bilder", detail: "Über den PowerPoint-Designer Layout/Bilder vorschlagen lassen und passende wählen." },
      { title: "Zuspitzen", detail: "Einzelne Folien verbessern.", prompt: "Mach die Folie „USPs“ prägnanter und füge eine Folie mit 3 Verkaufsargumenten hinzu." },
    ],
  },

  // ===== COPILOT CHAT =====
  {
    id: "chat-find", app: "copilotchat", minutes: 4,
    title: "Unternehmensweit Infos & Dateien finden",
    goal: "Eine Antwort über alle Mails, Dateien und Chats hinweg bekommen — mit Quellen.",
    steps: [
      { title: "Copilot Chat öffnen", detail: "Im Browser/Edge mit Arbeitskonto, in der Microsoft-365-App oder in Teams; den Modus „Arbeit“ wählen, damit Copilot auf Firmendaten zugreift." },
      { title: "Frage stellen", detail: "Konkret nach der Information suchen.", prompt: "Wo finde ich den aktuellen Liefertermin von [Marke]? Suche in meinen E-Mails und Dateien und nenne die Quelle." },
      { title: "Quelle prüfen", detail: "Copilot nennt Quellen-Links — diese öffnen und die Aussage verifizieren." },
    ],
    tips: ["„Arbeit“-Modus nutzen — der „Web“-Modus durchsucht keine Firmendaten.", "Funktioniert am besten, wenn Dateien in OneDrive/SharePoint liegen."],
  },
  {
    id: "chat-catchup", app: "copilotchat", minutes: 3,
    title: "Tagesüberblick holen",
    goal: "In 30 Sekunden wissen, was heute wichtig ist.",
    steps: [
      { title: "Copilot Chat öffnen", detail: "Arbeitsmodus wählen." },
      { title: "Überblick anfordern", detail: "Tag zusammenfassen lassen.", prompt: "Was ist heute Wichtiges passiert? Fasse meine E-Mails, Teams-Chats und Termine zusammen und nenne, was meine Aufmerksamkeit braucht." },
      { title: "Aufgaben ableiten", detail: "Daraus To-dos ins Cockpit übernehmen." },
    ],
  },
  {
    id: "chat-draft-multi", app: "copilotchat", minutes: 5,
    title: "Aus mehreren Quellen ein Dokument erstellen",
    goal: "Infos aus Mail + Datei zu einer sauberen Übersicht zusammenführen.",
    steps: [
      { title: "Copilot Chat öffnen", detail: "Arbeitsmodus wählen." },
      { title: "Quellen benennen", detail: "Copilot auf konkrete Dateien/Mails verweisen.", prompt: "Erstelle aus der E-Mail von [Lieferant] und der Excel-Liste [Datei] eine kurze Bestellzusammenfassung als Tabelle (Artikel, Menge, Liefertermin)." },
      { title: "Export/Übernahme", detail: "Ergebnis in Word/Excel übernehmen und prüfen." },
    ],
  },

  // ===== ROLLEN: EINKAUF =====
  {
    id: "einkauf-lieferstatus", app: "copilotchat", role: "einkauf", minutes: 5,
    title: "Liefer- & Bestellstatus bündeln",
    goal: "Alle offenen Bestellungen und Liefertermine auf einen Blick.",
    steps: [
      { title: "Copilot Chat (Arbeit) öffnen", detail: "Damit Copilot Mails & Dateien durchsucht." },
      { title: "Status anfordern", detail: "Nach offenen Bestellungen fragen.", prompt: "Fasse alle offenen Bestellungen und zugesagten Liefertermine aus meinen E-Mails der letzten 4 Wochen zusammen, gruppiert nach Lieferant." },
      { title: "In Excel übertragen", detail: "Liste in eine Tabelle kopieren und mit Strg+T formatieren." },
      { title: "Nachfassen", detail: "Bei Verzug eine Erinnerung entwerfen lassen.", prompt: "Schreibe eine höfliche Erinnerung an [Lieferant] wegen der überfälligen Lieferung [Bestellnummer]." },
    ],
    tips: ["Keine sensiblen Konditionen in unsichere Kanäle kopieren."],
  },
  {
    id: "einkauf-vergleich", app: "excel", role: "einkauf", minutes: 6,
    title: "Lieferanten & Konditionen vergleichen",
    goal: "Schnell sehen, wo die beste Marge liegt.",
    steps: [
      { title: "Daten als Tabelle formatieren", detail: "Konditionsliste markieren, Strg+T." },
      { title: "Copilot in Excel öffnen", detail: "Start-Registerkarte → Copilot." },
      { title: "Vergleich anfordern", detail: "Top-Lieferanten herausarbeiten.", prompt: "Vergleiche die Einkaufskonditionen je Lieferant: Wer bietet die beste Marge bei welcher Warengruppe? Zeige die Top 3 mit Begründung." },
      { title: "Entscheidung festhalten", detail: "Ergebnis als Entscheidung im Cockpit (Stephan) hinterlegen." },
    ],
  },

  // ===== ROLLEN: MARKETING =====
  {
    id: "marketing-social", app: "word", role: "marketing", minutes: 4,
    title: "Social-Media-Post entwerfen",
    goal: "Mehrere Varianten für einen Aktions-Post in Sekunden.",
    steps: [
      { title: "Word oder Copilot Chat öffnen", detail: "Beides geht — für reinen Text reicht Copilot Chat." },
      { title: "Post generieren", detail: "Varianten mit klaren Vorgaben anfordern.", prompt: "Schreibe 3 Varianten für einen Instagram-Post über unsere neue [Marke]-Kinderwagen-Aktion: freundlich, mit Emojis, je max. 280 Zeichen, inkl. 5 passenden Hashtags." },
      { title: "Feinschliff", detail: "Tonalität und CTA anpassen.", prompt: "Mach Variante 2 verspielter und füge einen klaren Call-to-Action zur Beratung hinzu." },
      { title: "Freigabe", detail: "Vor dem Posten Marke, Preis und Aktionszeitraum prüfen." },
    ],
    tips: ["Markennamen/Aktionsdetails selbst vorgeben — nicht raten lassen."],
  },
  {
    id: "marketing-newsletter", app: "outlook", role: "marketing", minutes: 5,
    title: "Eltern-Newsletter entwerfen",
    goal: "Einen herzlichen Newsletter-Entwurf für (werdende) Eltern.",
    steps: [
      { title: "Neue Mail / Word öffnen", detail: "„Mit Copilot entwerfen“ nutzen." },
      { title: "Newsletter generieren", detail: "Struktur und Ton vorgeben.", prompt: "Entwirf einen kurzen Newsletter für werdende Eltern: herzliche Begrüßung, 3 Produkt-Highlights der Saison, Einladung zur kostenlosen Erstausstattungs-Beratung. Ton: warm, nahbar." },
      { title: "Personalisieren", detail: "Anrede/Filiale ergänzen, Highlights mit echten Produkten füllen." },
      { title: "Prüfen", detail: "Links, Preise und Termine kontrollieren." },
    ],
  },

  // ===== ROLLEN: BUCHHALTUNG =====
  {
    id: "buha-monatszahlen", app: "excel", role: "buchhaltung", minutes: 6,
    title: "Monatszahlen aufbereiten",
    goal: "Umsätze pro Monat/Warengruppe verdichten und Abweichungen sehen.",
    steps: [
      { title: "Als Tabelle formatieren", detail: "Umsatzdaten markieren, Strg+T." },
      { title: "Copilot in Excel öffnen", detail: "Start-Registerkarte → Copilot." },
      { title: "Auswertung anfordern", detail: "Verdichten und Abweichungen markieren.", prompt: "Fasse diese Umsatztabelle pro Monat und Warengruppe zusammen und markiere Abweichungen über 10 % zum Vormonat." },
      { title: "Übernehmen", detail: "Kennzahlen als KPI ins Cockpit (KPIs) eintragen." },
    ],
    tips: ["Zahlen immer gegen die Quelle prüfen, bevor sie weitergegeben werden."],
  },
  {
    id: "buha-zahlungserinnerung", app: "word", role: "buchhaltung", minutes: 4,
    title: "Zahlungserinnerung formulieren",
    goal: "Eine höfliche, korrekte erste Zahlungserinnerung.",
    steps: [
      { title: "Word/Outlook öffnen", detail: "„Mit Copilot entwerfen“ nutzen." },
      { title: "Erinnerung entwerfen", detail: "Sachlich und freundlich formulieren lassen.", prompt: "Formuliere eine höfliche, sachliche erste Zahlungserinnerung an einen Geschäftskunden zur offenen Rechnung Nr. [X] über [Betrag], fällig am [Datum]. Freundlich, ohne Druck, mit Bitte um kurze Rückmeldung." },
      { title: "Daten einsetzen", detail: "Rechnungsnummer, Betrag, Frist und Bankverbindung selbst einfügen." },
      { title: "Prüfen & senden", detail: "Beträge und Fristen kontrollieren." },
    ],
    tips: ["Mahnstufe/Fristen mit der Buchhaltung abstimmen — Copilot kennt eure Regeln nicht."],
  },
];

export const COPILOT_FAQ = [
  { q: "Was ist Microsoft 365 Copilot?", a: "Ein KI-Assistent, der direkt in Word, Excel, Outlook, Teams & PowerPoint arbeitet und auf deine Unternehmensdaten (Mails, Dateien, Chats) im Rahmen deiner Berechtigungen zugreift. Er entwirft, fasst zusammen, analysiert und beantwortet Fragen." },
  { q: "Brauche ich eine besondere Lizenz?", a: "Für Copilot direkt in den Office-Apps (Word/Excel/Outlook/Teams) wird die kostenpflichtige Microsoft-365-Copilot-Lizenz benötigt, zusätzlich zu einem passenden Microsoft-365-Plan. „Copilot Chat“ (im Browser/Edge mit Arbeitskonto) ist eingeschränkter verfügbar." },
  { q: "Sind unsere Daten sicher?", a: "Im geschäftlichen Copilot gilt kommerzieller Datenschutz: Eingaben/Antworten werden nicht zum Training öffentlicher Modelle verwendet, und Copilot respektiert bestehende Zugriffsrechte. Trotzdem: keine besonders sensiblen Daten (z. B. Gesundheits-/Geburtsdaten von Kund:innen) unnötig eingeben." },
  { q: "Wie schreibe ich einen guten Prompt?", a: "Vier Bausteine: 1) Ziel (was soll herauskommen), 2) Kontext (für wen, worum geht es), 3) Quelle (welche Datei/Mail), 4) Format & Ton (Tabelle, Stichpunkte, freundlich/kurz). Je konkreter, desto besser." },
  { q: "Kann Copilot Fehler machen?", a: "Ja. Copilot kann Dinge falsch zusammenfassen oder Platzhalter erfinden. Ergebnisse immer prüfen, besonders Zahlen, Preise, Namen und Fristen. Der Mensch bleibt verantwortlich („human in the loop“)." },
  { q: "Wo finde ich Copilot in der App?", a: "Outlook: Copilot-Symbol oben rechts bzw. „Mit Copilot entwerfen“ beim Verfassen. Word: oben rechts und am Absatzrand. Excel: Registerkarte „Start“ ganz rechts (Daten vorher als Tabelle formatieren). Teams: „Copilot“ oben im Meeting/Chat." },
  { q: "Was kann Mago/MasterMind dabei für HFK tun?", a: "Mago übersetzt Copilot in den HFK-Alltag: rollenbasierte Arbeitsanweisungen, eine deutsche Prompt-Bibliothek, Schulung & Zertifizierung, Datenschutz-Leitplanken und ein ROI-Tracking der gesparten Zeit — alles gebündelt im Cockpilot." },
];

// Prompt-Bibliothek — kopierfertige Prompts, nach App/Rolle gefiltert.
export const COPILOT_PROMPTS = [
  { id: "p-ol-1", app: "outlook", title: "Posteingang zusammenfassen", prompt: "Fasse meine ungelesenen E-Mails von heute zusammen und ordne sie nach Dringlichkeit. Markiere, welche eine Antwort brauchen." },
  { id: "p-ol-2", app: "outlook", title: "Antwort entwerfen", prompt: "Entwirf eine freundliche, professionelle Antwort auf diese Anfrage und schlage einen Beratungstermin diese Woche vor." },
  { id: "p-ol-3", app: "outlook", title: "Termine & Fristen finden", prompt: "Welche Termine, Liefertermine und Fristen stehen in dieser E-Mail-Kette? Liste sie mit Datum." },
  { id: "p-ol-4", app: "outlook", title: "Höflich nachfassen", prompt: "Schreibe eine höfliche Erinnerung an [Lieferant] wegen der ausstehenden Lieferung [Bestellnummer]." },
  { id: "p-xl-1", app: "excel", title: "Verkaufsdaten analysieren", prompt: "Analysiere diese Verkaufsdaten: Top-5-Produkte, auffällige Trends, was wächst und was schwächelt." },
  { id: "p-xl-2", app: "excel", title: "Diagramm erstellen", prompt: "Erstelle ein Diagramm, das den Umsatz pro Monat und Warengruppe zeigt." },
  { id: "p-xl-3", app: "excel", title: "Formelspalte anlegen", prompt: "Füge eine Spalte „Marge %“ hinzu: (Verkaufspreis − Einkaufspreis) / Verkaufspreis als Prozent." },
  { id: "p-xl-4", app: "excel", title: "Liste bereinigen", prompt: "Markiere alle Zeilen mit Lagerbestand unter 5 und sortiere nach Lagerbestand aufsteigend." },
  { id: "p-wd-1", app: "word", title: "Dokument aus Stichpunkten", prompt: "Erstelle ein Beratungsprotokoll aus diesen Stichpunkten: [...]. Struktur: Anliegen, Empfehlung, nächste Schritte." },
  { id: "p-wd-2", app: "word", title: "Text umschreiben", prompt: "Formuliere diesen Absatz höflich, klar und in maximal 5 Sätzen um. Ton: professionell." },
  { id: "p-wd-3", app: "word", title: "Dokument zusammenfassen", prompt: "Fasse dieses Dokument in 5 Stichpunkten zusammen und nenne die wichtigsten Fristen und Bedingungen." },
  { id: "p-tm-1", app: "teams", title: "Meeting-Recap", prompt: "Fasse die Besprechung zusammen: Welche Entscheidungen wurden getroffen und welche Action Items hat wer bis wann?" },
  { id: "p-tm-2", app: "teams", title: "Meine Action Items", prompt: "Was sind meine persönlichen Action Items aus diesem Meeting?" },
  { id: "p-tm-3", app: "teams", title: "Kanal aufholen", prompt: "Fasse die wichtigsten Nachrichten in diesem Kanal seit gestern zusammen und nenne offene Fragen an mich." },
  { id: "p-pp-1", app: "powerpoint", title: "Präsentation aus Word", prompt: "Erstelle eine Präsentation aus dem Dokument [Datei] mit Titelfolie, Agenda und je einer Folie pro Abschnitt." },
  { id: "p-pp-2", app: "powerpoint", title: "Markenpräsentation", prompt: "Erstelle eine 8-Folien-Präsentation über die Marke [Marke]: Herkunft, USPs, Hero-Produkte, typische Einwände." },
  { id: "p-pp-3", app: "powerpoint", title: "Sprechernotizen", prompt: "Erstelle kurze Sprechernotizen für jede Folie." },
  { id: "p-cc-1", app: "copilotchat", title: "Info firmenweit finden", prompt: "Wo finde ich den aktuellen Liefertermin von [Marke]? Suche in meinen E-Mails und Dateien und nenne die Quelle." },
  { id: "p-cc-2", app: "copilotchat", title: "Tagesüberblick", prompt: "Was ist heute Wichtiges passiert? Fasse meine E-Mails, Teams-Chats und Termine zusammen." },
  { id: "p-ek-1", app: "copilotchat", role: "einkauf", title: "Bestellstatus bündeln", prompt: "Fasse alle offenen Bestellungen und zugesagten Liefertermine der letzten 4 Wochen zusammen, gruppiert nach Lieferant." },
  { id: "p-ek-2", app: "excel", role: "einkauf", title: "Konditionen vergleichen", prompt: "Vergleiche die Einkaufskonditionen je Lieferant: beste Marge je Warengruppe, Top 3 mit Begründung." },
  { id: "p-mk-1", app: "word", role: "marketing", title: "Instagram-Post", prompt: "Schreibe 3 Varianten für einen Instagram-Post über die [Marke]-Aktion: freundlich, mit Emojis, max. 280 Zeichen, 5 Hashtags." },
  { id: "p-mk-2", app: "outlook", role: "marketing", title: "Eltern-Newsletter", prompt: "Entwirf einen kurzen Newsletter für werdende Eltern: Begrüßung, 3 Produkt-Highlights, Einladung zur kostenlosen Beratung. Ton: herzlich." },
  { id: "p-bh-1", app: "excel", role: "buchhaltung", title: "Monatszahlen verdichten", prompt: "Fasse diese Umsatztabelle pro Monat und Warengruppe zusammen und markiere Abweichungen über 10 % zum Vormonat." },
  { id: "p-bh-2", app: "word", role: "buchhaltung", title: "Zahlungserinnerung", prompt: "Formuliere eine höfliche erste Zahlungserinnerung zur Rechnung Nr. [X] über [Betrag], fällig am [Datum]. Freundlich, ohne Druck." },
];

export const getGuide = (id) => COPILOT_GUIDES.find((g) => g.id === id);
export const guidesByApp = (app) => COPILOT_GUIDES.filter((g) => g.app === app);
export const guidesByRole = (role) => COPILOT_GUIDES.filter((g) => g.role === role);

// Erdungs-Text für den Cockpilot-Assistenten.
export function buildCopilotKB() {
  const out = [];
  out.push("# GRUNDLAGEN (FAQ)");
  out.push(COPILOT_FAQ.map((f) => `F: ${f.q}\nA: ${f.a}`).join("\n\n"));
  out.push("\n# SCHRITT-FÜR-SCHRITT-GUIDES (in MasterMind verfügbar, mit Check-ins)");
  for (const g of COPILOT_GUIDES) {
    const tag = g.role ? `${appLabel(g.app)} · Rolle: ${roleLabel(g.role)}` : appLabel(g.app);
    const steps = g.steps.map((s, i) => `  ${i + 1}. ${s.title} — ${s.detail}${s.prompt ? `\n     Beispiel-Prompt: „${s.prompt}“` : ""}`).join("\n");
    out.push(`## [${tag}] ${g.title} (Guide-ID: ${g.id}, ~${g.minutes} Min.)\nZiel: ${g.goal}\n${steps}${g.tips?.length ? `\nTipps: ${g.tips.join(" | ")}` : ""}`);
  }
  out.push("\n# PROMPT-BIBLIOTHEK (kopierfertige Prompts)");
  out.push(COPILOT_PROMPTS.map((p) => `- [${appLabel(p.app)}${p.role ? ` · ${roleLabel(p.role)}` : ""}] ${p.title}: „${p.prompt}“`).join("\n"));
  return out.join("\n\n");
}

// Gemeinsamer System-Prompt für den Cockpilot-Assistenten. channel: "web" | "telegram".
export function copilotSystemPrompt(kb, today, channel = "web") {
  const lines = [
    "Du bist „Cockpilot“, der Microsoft-365-Copilot-Trainer von MasterMind für „Herr und Frau Klein“ (HFK), einen Babyfachhandel in Wien/Österreich.",
    "Deine Aufgabe: Fragen rund um Microsoft 365 Copilot (Word, Excel, Outlook, Teams, PowerPoint, Copilot Chat) sehr präzise und praxisnah beantworten und exakte Arbeitsanweisungen geben.",
    "",
    "ANTWORT-REGELN:",
    "1. Antworte immer auf Deutsch, freundlich, klar und konkret. Sprich Mitarbeitende mit „du“ an.",
    "2. Liefere bei Handlungsfragen eine nummerierte SCHRITT-FÜR-SCHRITT-Anleitung. Wo hilfreich, gib einen fertigen Beispiel-Prompt zum Kopieren an (in Anführungszeichen).",
    "3. Stütze dich vorrangig auf die unten stehende COCKPILOT-WISSENSBASIS. Allgemein etabliertes, korrektes Microsoft-365-Copilot-Wissen darfst du ergänzen — aber erfinde KEINE Menüpunkte, Schaltflächen oder Funktionen, die es nicht gibt.",
    "4. Wenn du dir bei einem Detail nicht sicher bist, sage das offen und nenne, wo man es nachsehen kann (z. B. Copilot-Symbol in der App), statt zu raten.",
    "5. Weise auf passende fertige Anleitungen in MasterMind hin: „→ In-App-Guide: <Titel>“, wenn ein Guide aus der Wissensbasis zur Frage passt.",
    "6. Erinnere bei sensiblen Daten kurz an Datenschutz (keine besonders sensiblen Kundendaten unnötig eingeben) — nur wenn relevant.",
    "7. Halte dich kurz und nützlich. Schließe mit einer Zeile „Nächster Schritt: …“.",
  ];
  if (channel === "telegram") {
    lines.push("8. Formatierung: Telegram-HTML erlaubt (<b>, <i>, <code>), aber KEIN Markdown (#, ##, **). Maximal ~350 Wörter.");
  }
  lines.push("", `Heutiges Datum: ${today}.`, "", "===== COCKPILOT-WISSENSBASIS =====", kb || "(keine Daten)", "===== ENDE WISSENSBASIS =====");
  return lines.join("\n");
}
