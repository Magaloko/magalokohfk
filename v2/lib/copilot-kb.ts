// Kuratierte Microsoft-365-Copilot-Wissensbasis für HFK (Herr und Frau Klein).
// Quelle für (a) die Schritt-für-Schritt-Guides mit Check-ins und (b) die Erdung des Cockpilot-Assistenten.
// Inhalte praxisnah, deutsch, retail-/babyfachhandel-spezifisch.

export type AppKey = "outlook" | "excel" | "word" | "teams";
export type GuideStep = { title: string; detail: string; prompt?: string };
export type CopilotGuide = { id: string; app: AppKey; title: string; goal: string; minutes: number; steps: GuideStep[]; tips?: string[] };

export const APPS: { key: AppKey; label: string; icon: string }[] = [
  { key: "outlook", label: "Outlook", icon: "send" },
  { key: "excel", label: "Excel", icon: "kpi" },
  { key: "word", label: "Word", icon: "book" },
  { key: "teams", label: "Teams", icon: "users" },
];
export const appLabel = (k: AppKey) => APPS.find((a) => a.key === k)?.label || k;

export const COPILOT_GUIDES: CopilotGuide[] = [
  // ===== OUTLOOK =====
  {
    id: "outlook-inbox-triage", app: "outlook", minutes: 5,
    title: "Posteingang in 5 Minuten priorisieren",
    goal: "Morgens schnell sehen, was wirklich wichtig ist, und nichts übersehen.",
    steps: [
      { title: "Copilot öffnen", detail: "Im neuen Outlook bzw. Outlook im Web oben rechts im Menüband auf das Copilot-Symbol klicken. (Setzt eine Microsoft-365-Copilot-Lizenz voraus.)" },
      { title: "Posteingang zusammenfassen lassen", detail: "Copilot-Chat in Outlook nutzen und nach den wichtigsten ungelesenen Mails fragen.", prompt: "Fasse meine ungelesenen E-Mails von heute zusammen und ordne sie nach Dringlichkeit. Markiere, welche eine Antwort von mir brauchen." },
      { title: "Eine lange Konversation verdichten", detail: "Eine längere E-Mail-Kette öffnen und oben „Zusammenfassen“ wählen — Copilot fasst Verlauf und offene Punkte zusammen." },
      { title: "Aufgaben ableiten", detail: "Aus der Zusammenfassung die To-dos in MAGALOKO (Cockpit → Tasks) oder als Outlook-Aufgabe festhalten.", prompt: "Welche konkreten Aufgaben ergeben sich für mich aus diesen E-Mails? Liste sie als kurze Stichpunkte." },
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
      { title: "In MAGALOKO hinterlegen", detail: "Den Termin im Kalender und ggf. als Entscheidung/Task im Cockpit anlegen." },
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
      { title: "Ergebnis übernehmen", detail: "Passende Erkenntnisse als KPI/Notiz in MAGALOKO (Cockpit → KPIs) festhalten." },
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
      { title: "In MAGALOKO übernehmen", detail: "Aufgaben/Entscheidungen ins Cockpit übertragen." },
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
];

export const COPILOT_FAQ: { q: string; a: string }[] = [
  { q: "Was ist Microsoft 365 Copilot?", a: "Ein KI-Assistent, der direkt in Word, Excel, Outlook, Teams & PowerPoint arbeitet und auf deine Unternehmensdaten (Mails, Dateien, Chats) im Rahmen deiner Berechtigungen zugreift. Er entwirft, fasst zusammen, analysiert und beantwortet Fragen." },
  { q: "Brauche ich eine besondere Lizenz?", a: "Für Copilot direkt in den Office-Apps (Word/Excel/Outlook/Teams) wird die kostenpflichtige Microsoft-365-Copilot-Lizenz benötigt, zusätzlich zu einem passenden Microsoft-365-Plan. „Copilot Chat“ (im Browser/Edge mit Arbeitskonto) ist eingeschränkter verfügbar." },
  { q: "Sind unsere Daten sicher?", a: "Im geschäftlichen Copilot gilt kommerzieller Datenschutz: Eingaben/Antworten werden nicht zum Training öffentlicher Modelle verwendet, und Copilot respektiert bestehende Zugriffsrechte. Trotzdem: keine besonders sensiblen Daten (z. B. Gesundheits-/Geburtsdaten von Kund:innen) unnötig eingeben." },
  { q: "Wie schreibe ich einen guten Prompt?", a: "Vier Bausteine: 1) Ziel (was soll herauskommen), 2) Kontext (für wen, worum geht es), 3) Quelle (welche Datei/Mail), 4) Format & Ton (Tabelle, Stichpunkte, freundlich/kurz). Je konkreter, desto besser." },
  { q: "Kann Copilot Fehler machen?", a: "Ja. Copilot kann Dinge falsch zusammenfassen oder Platzhalter erfinden. Ergebnisse immer prüfen, besonders Zahlen, Preise, Namen und Fristen. Der Mensch bleibt verantwortlich („human in the loop“)." },
  { q: "Wo finde ich Copilot in der App?", a: "Outlook: Copilot-Symbol oben rechts bzw. „Mit Copilot entwerfen“ beim Verfassen. Word: oben rechts und am Absatzrand. Excel: Registerkarte „Start“ ganz rechts (Daten vorher als Tabelle formatieren). Teams: „Copilot“ oben im Meeting/Chat." },
  { q: "Was kann Mago/MAGALOKO dabei für HFK tun?", a: "Mago übersetzt Copilot in den HFK-Alltag: rollenbasierte Arbeitsanweisungen, eine deutsche Prompt-Bibliothek, Schulung & Zertifizierung, Datenschutz-Leitplanken und ein ROI-Tracking der gesparten Zeit — alles gebündelt im Cockpilot." },
];

export const getGuide = (id: string) => COPILOT_GUIDES.find((g) => g.id === id);
export const guidesByApp = (app: AppKey) => COPILOT_GUIDES.filter((g) => g.app === app);

// Erdungs-Text für den Cockpilot-Assistenten (statisch, schnell).
export function buildCopilotKB(): string {
  const out: string[] = [];
  out.push("# GRUNDLAGEN (FAQ)");
  out.push(COPILOT_FAQ.map((f) => `F: ${f.q}\nA: ${f.a}`).join("\n\n"));
  out.push("\n# SCHRITT-FÜR-SCHRITT-GUIDES (in MAGALOKO verfügbar, mit Check-ins)");
  for (const g of COPILOT_GUIDES) {
    const steps = g.steps.map((s, i) => `  ${i + 1}. ${s.title} — ${s.detail}${s.prompt ? `\n     Beispiel-Prompt: „${s.prompt}“` : ""}`).join("\n");
    out.push(`## [${appLabel(g.app)}] ${g.title} (Guide-ID: ${g.id}, ~${g.minutes} Min.)\nZiel: ${g.goal}\n${steps}${g.tips?.length ? `\nTipps: ${g.tips.join(" | ")}` : ""}`);
  }
  return out.join("\n\n");
}
