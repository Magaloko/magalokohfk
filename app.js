const STORAGE_KEY = "magaloko:v1";

const seedData = {
  systems: [
    {
      id: "jtl-wawi",
      name: "JTL Wawi 1.9.4",
      category: "Zentrale",
      purpose: "Zentrale Wahrheit fuer Artikel, Kunden, Auftraege, Rechnungen, Lager und Einkauf.",
      owner: "Stephan",
      accessStatus: "angefragt",
      healthStatus: "ungeprüft",
      notes: "JTL Wawi ist nicht zu ersetzen, sondern in SeBo/MAGALOKO besser nutzbar zu machen.",
      nextAction: "Read-only Datenzugriff oder Exportweg klaeren."
    },
    {
      id: "jtl-shop",
      name: "JTL-Shop 5.4.2",
      category: "Shop",
      purpose: "Online-Verkaufskanal, der Bestellungen zur JTL Wawi uebergibt.",
      owner: "Stephan",
      accessStatus: "angefragt",
      healthStatus: "ungeprüft",
      notes: "Design update-sicher ueber Child-Template/Theme planen.",
      nextAction: "Template, Child-Template, Plugins und Staging pruefen."
    },
    {
      id: "sebo",
      name: "SeBo",
      category: "Cockpit",
      purpose: "Internes Service- und Daten-Cockpit fuer Tickets, Kunden, Produkte und KI.",
      owner: "Mago",
      accessStatus: "vorhanden",
      healthStatus: "bereit",
      notes: "MVP existiert, soll vom Service-Cockpit zum HFK-Steuerungssystem wachsen.",
      nextAction: "Support-Prozess und Roadmap mit Stephan priorisieren."
    },
    {
      id: "n8n",
      name: "N8N",
      category: "Automation",
      purpose: "Automatisierung fuer service@herrundfrauklein.com zu SeBo-Tickets.",
      owner: "Mago",
      accessStatus: "angefragt",
      healthStatus: "ungeprüft",
      notes: "IMAP/SMTP und Fehlerfaelle sauber dokumentieren.",
      nextAction: "Workflow fuer E-Mail Eingang und Eskalation skizzieren."
    },
    {
      id: "all-inkl",
      name: "All-inkl",
      category: "Hosting",
      purpose: "Domain- und Mail-Hosting fuer HFK.",
      owner: "Stephan",
      accessStatus: "angefragt",
      healthStatus: "ungeprüft",
      notes: "Relevant fuer IMAP, SMTP, SPF, DKIM und DMARC.",
      nextAction: "Mail-Zugang fuer service@herrundfrauklein.com einrichten."
    },
    {
      id: "support-mail",
      name: "service@herrundfrauklein.com",
      category: "Support",
      purpose: "Zentrale Support-Adresse fuer 50-100 E-Mails pro Tag.",
      owner: "Support Team",
      accessStatus: "angefragt",
      healthStatus: "kritisch",
      notes: "6 Mitarbeiter bearbeiten Support. WhatsApp und Chat sind spaeter geplant.",
      nextAction: "Ticketkategorien, SLA und Antwortvorlagen definieren."
    },
    {
      id: "analytics",
      name: "Google Analytics / GTM",
      category: "Tracking",
      purpose: "Shop-Verhalten, Conversion Events und Umsatztracking pruefen.",
      owner: "Stephan",
      accessStatus: "angefragt",
      healthStatus: "ungeprüft",
      notes: "Wichtig fuer Februar-2025-Bruch, Add to Cart, Checkout und Purchase Events.",
      nextAction: "GA/GTM mit JTL und Bankdaten gegenpruefen."
    },
    {
      id: "search-console",
      name: "Google Search Console",
      category: "SEO",
      purpose: "SEO-Traffic, Indexierung und moegliche Google-Probleme pruefen.",
      owner: "Stephan",
      accessStatus: "angefragt",
      healthStatus: "ungeprüft",
      notes: "Relevant bei Verdacht auf SEO-Crash oder Cloudflare-/Indexierungsprobleme.",
      nextAction: "Performance um Januar/Februar 2025 pruefen."
    },
    {
      id: "doofinder",
      name: "Doofinder",
      category: "Suche",
      purpose: "Shop-Suche, Suchbegriffe und No-result Searches auswerten.",
      owner: "Stephan",
      accessStatus: "angefragt",
      healthStatus: "ungeprüft",
      notes: "Suchdaten liefern direkte Signale fuer Einkauf, SEO und Content.",
      nextAction: "Suchbegriffe und Conversion aus Suche exportieren."
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      category: "KI",
      purpose: "KI-Funktionen in SeBo fuer Tickets, Textoptimierung und Assistent.",
      owner: "Mago",
      accessStatus: "vorhanden",
      healthStatus: "bereit",
      notes: "Prompts versionieren und Antwortqualitaet pruefen.",
      nextAction: "Prompt Library und Freigabeprozess definieren."
    },
    {
      id: "brevo",
      name: "Brevo",
      category: "Newsletter",
      purpose: "Newsletter, Kampagnen und moegliche Transaktionsmail-Strecken.",
      owner: "Stephan",
      accessStatus: "unbekannt",
      healthStatus: "ungeprüft",
      notes: "Relevant fuer Kundenreaktivierung und Sleeping Champions.",
      nextAction: "Klaeren, ob Brevo aktiv genutzt wird."
    }
  ],
  accessItems: [
    { id: "a-brevo", systemId: "brevo", accessType: "API-Key", neededFor: "Newsletter-Listen, Versand, 45.920 Abonnenten", owner: "Stephan", status: "vorhanden", priority: "hoch", notes: "AKTIV. Einziger funktionierender Datenkanal aktuell." },
    { id: "a1", systemId: "all-inkl", accessType: "IMAP/SMTP + Mail-Forwarding", neededFor: "Support-Mails -> Ticket-Auto-Erstellung in SeBo. OHNE: Mago kann eingehende Support-Mails nicht in Tickets verwandeln. Das ist der KERN von SeBo.", owner: "Stephan", status: "angefragt", priority: "hoch", notes: "Seit Wochen angefragt. Ohne das ist SeBo-Ticketing-Modul tot. MUSS heute entschieden werden." },
    { id: "a3", systemId: "jtl-wawi", accessType: "JTL-API oder DB-Read-only", neededFor: "Live-Bestellungen, Live-Lagerbestand, Live-Marge. OHNE: Mago arbeitet nur mit dem einmaligen CSV-Export. Kein Live-KPI, kein Februar-Bruch-Tracking, kein Einkaufsplaner-Live, kein Anomalie-Radar in Echtzeit.", owner: "Stephan/Markus", status: "angefragt", priority: "hoch", notes: "Seit Wochen angefragt. WICHTIGSTER offener Zugang. Read-only reicht. Markus kann das fuer Stephan einrichten." },
    { id: "a2", systemId: "jtl-shop", accessType: "Shop Admin", neededFor: "Template, Plugin und Tracking Audit. Conversion-Audit der Top-3-Kategorieseiten = EUR 36.000/Jahr Hebel.", owner: "Stephan", status: "angefragt", priority: "hoch", notes: "JTL-Shop 5.4.2." },
    { id: "a4", systemId: "analytics", accessType: "GA4 / GTM Read", neededFor: "Tracking-Validierung + Februar-2025-Bruch klaeren (Tracking-Defekt vs. echter Markteinbruch). OHNE: Anomalie kann nicht abschliessend geklaert werden.", owner: "Stephan", status: "angefragt", priority: "mittel", notes: "Purchase, Checkout, Add to Cart events." },
    { id: "a5", systemId: "doofinder", accessType: "Admin/Export", neededFor: "Such-No-Result-Hebel = EUR 24.000/Jahr Potential. Sortimentslucken sichtbar machen.", owner: "Stephan", status: "angefragt", priority: "mittel", notes: "Direkter Hebel fuer Einkauf + SEO." }
  ],
  tasks: [
    { id: "t1", title: "Gespräch mit Stephan vorbereiten", area: "SeBo", status: "Diese Woche", priority: "hoch", impact: "hoch", effort: "mittel", owner: "Mago", dueDate: "2026-05-25", notes: "Rolle als Digital Sales & Data Lead formulieren." },
    { id: "t2", title: "Zugänge strukturiert anfragen", area: "JTL", status: "Diese Woche", priority: "hoch", impact: "hoch", effort: "niedrig", owner: "Mago", dueDate: "2026-05-26", notes: "All-inkl, JTL-Shop, Wawi, GA/GTM, GSC, Doofinder." },
    { id: "t3", title: "Support-Prozess service@herrundfrauklein.com planen", area: "Support", status: "Backlog", priority: "hoch", impact: "hoch", effort: "mittel", owner: "Mago", dueDate: "2026-05-27", notes: "50-100 E-Mails/Tag, 6 Mitarbeiter, Kategorien, SLA." },
    { id: "t4", title: "SeBo-Roadmap in Module aufteilen", area: "SeBo", status: "In Arbeit", priority: "mittel", impact: "hoch", effort: "mittel", owner: "Mago", dueDate: "2026-05-28", notes: "Support, Kunden, Produkte, Lieferanten, Statistiken, KI." },
    { id: "t5", title: "Februar-2025-Datenbruch dokumentieren", area: "Analytics", status: "Backlog", priority: "hoch", impact: "hoch", effort: "hoch", owner: "Mago", dueDate: "2026-05-31", notes: "JTL, Shop, Bank, GA, GSC vergleichen." },
    { id: "t6", title: "JTL-Shop Designprozess über Child-Template dokumentieren", area: "Shop", status: "Wartet", priority: "mittel", impact: "mittel", effort: "niedrig", owner: "Mago", dueDate: "2026-05-29", notes: "Keine Parent-Template Aenderungen." },
    { id: "t7", title: "Einkaufsplaner als spaeteres Modul vorbereiten", area: "Einkauf", status: "Backlog", priority: "mittel", impact: "hoch", effort: "hoch", owner: "Mago", dueDate: "2026-06-03", notes: "Beate/Lorna Workflow, Groessen/Farben, Saisontracking." }
  ],
  briefings: [],
  meetings: [
    {
      id: "m-26-05",
      type: "Follow-up",
      date: "2026-05-26",
      goal: "REALITAETSCHECK v3: SeBo unbenutzt liegt zum grossen Teil daran dass JTL-API + Mail-Forwarding seit Wochen nicht freigegeben sind. Nur Brevo-API laeuft. Magos einzige Selbstkritik: zu wenig eskaliert. Ziel: 1) SeBo live zeigen + ZUGANGSLISTE auf den Tisch + Termine fuer Freischaltung einfordern, 2) Stephans Vorstellung/Budget verstehen, 3) Operator-Variante C anbieten (engere Taktung damit nicht mehr Wochen-Wartezeit), 4) Klarheit mit Datum-Commitments raus.",
      agenda: "Phase 1 (20-25 min): SeBo LIVE-DEMO ehrlich (was laeuft via Brevo + CSV, was nicht laeuft ohne Zugaenge) + ZUGANGSLISTE 5 Punkte auf den Tisch + 3 Termine fordern (Mail-Forwarding wann / JTL-API wann / Shop-Admin wann) + 1-Satz-Selbstkritik (nicht hart genug eskaliert)\nPhase 2 (25-30 min): Stephan zuhoeren - 7 Kernfragen + Budget - Mago redet <40%\nPhase 3 (20-25 min): OneSource-Plan + 3 Angebots-Varianten - Variante C als ehrliche Empfehlung (engere Taktung statt Wochen-Wartezeit)\nPhase 4 (5-10 min): Variante + Honorar + Datum + Mail-Forwarding-Datum + JTL-API-Datum + Briefing-Slot",
      talkingPoints: "SeBo-Teile koennen nicht laufen ohne JTL-API + Mail-Forwarding - das sind STEPHAN-Zugaenge, seit Wochen offen.\nBrevo laeuft, MAGALOKO-Stats aus CSV-Export laufen - der Rest ist limitiert.\nMagos Selbstkritik 1 Satz: 'Ich haette dich haerter dranziehen muessen' - keine Selbstgeisselung.\nVariante C = Operator-Mode = wir sitzen woechentlich zusammen, kein Warten mehr.\nWenn Stephan auch jetzt Zugaenge nicht freigibt - saubere Trennung als ehrliche Option.\nIch komme raus mit Datum-Commitments oder mit Klarheit dass es jetzt nicht passt.",
      questions: "PHASE 1 - SeBo + Zugaenge:\n1. Wer kann Mail-Forwarding diese Woche einrichten - du im All-Inkl oder gibst du mir den Zugang?\n2. JTL-API geht ueber Markus oder brauche ich von dir explizit gruenes Licht? Was hindert uns heute Abend Markus zu mailen?\n3. Wenn du diese Zugaenge in 14 Tagen freischaltest - ich bin dabei. Wenn nicht - sag mir das ehrlich, dann kein Auftrag, dann ist es nicht die Zeit.\nZukunft SeBo: aktiv weiterbauen / einfrieren als Backup / komplett aufgeben?\n\nPHASE 2 - Stephans Vorstellung:\n4. Was war fuer dich in den letzten Wochen die wichtigste Erkenntnis?\n5. In 6 Monaten zurueckblickend - was muss passiert sein damit du sagst: das war's wert?\n6. Wie stellst du dir die Zusammenarbeit vor - Stunden/Tagessatz/Pauschale/Festanstellung?\n7. Hast du ein Budget im Kopf? (Frage stellen + schweigen)\n8. Wer ist ausser dir und Markus eingebunden - wer entscheidet wenn du nicht da bist?\n9. Markus Vollzeit ab Juli - wie wirkt sich das auf meinen Bereich aus?\n10. Was waere fuer dich der wichtigste konkrete Output von mir in naechsten 30 Tagen - gesetzt den Fall die Zugaenge sind diese Woche da?",
      outcome: "",
      followUps: ""
    },
    {
      id: "m1",
      type: "Erstgespräch",
      date: "2026-05-25",
      goal: "Stephan zeigen, dass Mago JTL als Zentrale versteht und SeBo als Cockpit fuer Support, Daten und Entscheidungen aufbauen kann.",
      agenda: "Systemverstaendnis bestaetigen\nSupport als Startpunkt festlegen\nZugaenge und Verantwortlichkeiten klaeren\n30-Tage-Pilot vorschlagen",
      talkingPoints: "JTL Wawi bleibt zentrale Wahrheit. SeBo ersetzt JTL nicht, sondern macht JTL, Support und Entscheidungen schneller nutzbar.",
      questions: "Was waere nach 30 Tagen ein sichtbarer Erfolg?\nWelche Zahlen willst du woechentlich sehen?\nSoll SeBo langfristig HFK-Cockpit werden?",
      outcome: "",
      followUps: ""
    }
  ],
  jobRoles: [
    {
      id: "role-digital-lead",
      title: "Digital Sales & Data Lead",
      mission: "Umsatz, Kunden, Shop, Support, Einkauf und Daten zu einem steuerbaren HFK-System verbinden.",
      responsibilities: ["KPI-Steuerung", "Umsatzhebel priorisieren", "Stephan-Briefings", "Wochenreporting"],
      outputs: ["Wochenupdate", "Entscheidungsvorlagen", "Massnahmenplan", "Business Impact Bewertung"]
    },
    {
      id: "role-sebo-owner",
      title: "Product Owner SeBo",
      mission: "SeBo vom Service-Cockpit zum operativen HFK-Steuerungssystem entwickeln.",
      responsibilities: ["Modul-Roadmap", "Feedback aufnehmen", "Tickets in Features uebersetzen", "Abnahme organisieren"],
      outputs: ["SeBo Roadmap", "Feature-Spezifikationen", "Testprotokolle", "Release-Notizen"]
    },
    {
      id: "role-jtl-shop",
      title: "JTL-Shop & Conversion Manager",
      mission: "JTL-Shop update-sicher verbessern und jede Design-/Content-Aenderung an Umsatz, Orientierung oder Vertrauen koppeln.",
      responsibilities: ["Shop-Audit", "Child-Template Prozess", "Kategorie-/Produktseiten verbessern", "Tracking pruefen"],
      outputs: ["Shop-Audit", "Design-Hypothesen", "Staging-Checkliste", "Conversion-Auswertung"]
    },
    {
      id: "role-support-ops",
      title: "Support Operations Lead",
      mission: "50-100 Support-Mails pro Tag in einen messbaren, priorisierten und lernenden Prozess bringen.",
      responsibilities: ["Ticket-Kategorien", "SLA/Eskalation", "Antwortvorlagen", "Mitarbeiter-Auslastung"],
      outputs: ["Support-Dashboard", "Vorlagenbibliothek", "Eskalationsregeln", "Problem-Topliste"]
    },
    {
      id: "role-procurement",
      title: "Einkaufs- & Sortimentsanalyst",
      mission: "Einkauf, Bestand, Lieferanten, Groessen/Farben und Saisonentscheidungen datenbasiert vorbereiten.",
      responsibilities: ["Einkaufsplaner", "Supplier Scorecards", "Penner-Radar", "Markdown-Vorschlaege"],
      outputs: ["Bestellvorschlaege", "Tauschlisten", "Markdown-Plan", "Lieferantenbewertung"]
    },
    {
      id: "role-automation",
      title: "Automation & KI Engineer",
      mission: "N8N, DeepSeek und Datenimporte so einsetzen, dass Arbeit schneller und kontrollierter erledigt wird.",
      responsibilities: ["N8N Workflows", "Prompt Library", "Fehlerfaelle", "Freigabeprozess"],
      outputs: ["Workflow-Doku", "Prompt-Versionen", "Fallback-Regeln", "Automations-Tests"]
    }
  ],
  jobAreas: [
    {
      id: "area-stephan",
      name: "Stephan-Wuensche & Entscheidungsvorlagen",
      goal: "Jeden Wunsch von Stephan in Ziel, Aufwand, Risiko, Datenbedarf und naechsten Schritt uebersetzen.",
      tasks: ["Wunsch aufnehmen", "Problem hinter dem Wunsch klaeren", "Erfolgskriterium definieren", "Briefing erstellen", "Abnahme dokumentieren"]
    },
    {
      id: "area-development",
      name: "Entwicklung & Umsetzung",
      goal: "Features sauber von Idee bis Livegang fuehren, ohne JTL/Shop/SeBo unkontrolliert zu veraendern.",
      tasks: ["Anforderung schreiben", "UI skizzieren", "Datenmodell pruefen", "Implementieren", "Testen", "Dokumentieren", "Release vorbereiten"]
    },
    {
      id: "area-support",
      name: "Support & Service",
      goal: "Support aus E-Mail-Flut in priorisierte Tickets, Vorlagen, Eskalationen und Lernsignale verwandeln.",
      tasks: ["Kategorien pflegen", "SLA pruefen", "Antwortvorlagen verbessern", "Top-Probleme melden", "Lieferanten-/Produktprobleme markieren"]
    },
    {
      id: "area-shop",
      name: "JTL-Shop & Design",
      goal: "Shop-Aenderungen update-sicher, messbar und conversion-orientiert erledigen.",
      tasks: ["Ist-Zustand dokumentieren", "Hypothese formulieren", "Child-Template/Theme pruefen", "Staging testen", "Tracking kontrollieren", "Ergebnis messen"]
    },
    {
      id: "area-data",
      name: "Daten, Analytics & Reporting",
      goal: "JTL, Shop, GA/GTM, Search Console, Doofinder und Bank/Shop-Logs auf Widersprueche und Hebel pruefen.",
      tasks: ["Datenquelle bestimmen", "Baseline bauen", "KPI definieren", "Abweichungen erklaeren", "Report schreiben"]
    },
    {
      id: "area-procurement",
      name: "Einkauf, Sortiment & Lieferanten",
      goal: "Bestand, Einkauf und Sortimentsentscheidungen an Umsatz, Marge, Retouren, Nachfrage und Saison koppeln.",
      tasks: ["Topseller sichern", "Dogs pruefen", "Nachbestellung vorschlagen", "Supplier Scorecard bauen", "Markdown vorbereiten"]
    },
    {
      id: "area-crm",
      name: "Kundenreaktivierung & CRM",
      goal: "Einmalkaeufer, Sleeping Champions und Wiederkaufzyklen in konkrete Kampagnen uebersetzen.",
      tasks: ["Segment definieren", "Angebot formulieren", "Brevo/Newsletter vorbereiten", "Erfolg messen", "Follow-up planen"]
    }
  ],
  playbooks: [
    {
      id: "pb-stephan-request",
      title: "Stephan-Wunsch professionell bearbeiten",
      trigger: "Stephan sagt: Kannst du X bauen/aendern/pruefen?",
      steps: ["Wunsch wortwoertlich notieren", "Ziel klaeren: Umsatz, Zeitersparnis, Fehlerreduktion oder bessere Entscheidung?", "Ist-Zustand und betroffene Systeme erfassen", "Aufwand/Risiko in niedrig/mittel/hoch einschaetzen", "Briefing mit Empfehlung erstellen", "Freigabe holen", "Umsetzen oder als Roadmap-Aufgabe einplanen", "Ergebnis mit Vorher/Nachher dokumentieren"],
      done: "Stephan hat eine klare Entscheidung getroffen und Mago hat naechsten Schritt, Owner und Erfolgskriterium dokumentiert."
    },
    {
      id: "pb-feature-dev",
      title: "Feature entwickeln und sauber ausliefern",
      trigger: "Neues SeBo/MAGALOKO/Shop-Feature soll entstehen.",
      steps: ["Problem und Nutzer bestimmen", "Datenmodell und betroffene Systeme notieren", "UI als einfache Skizze/Formular definieren", "Akzeptanzkriterien schreiben", "Kleine Version bauen", "Lokal/Staging testen", "Keine echten Kundendaten oder Secrets speichern", "Doku und Release-Notiz schreiben", "Stephan oder Fachperson abnehmen lassen"],
      done: "Feature funktioniert, ist getestet, dokumentiert und hat eine fachliche Abnahme."
    },
    {
      id: "pb-shop-change",
      title: "JTL-Shop Designaenderung durchfuehren",
      trigger: "Design, Layout, Kategorie, Produktseite oder Checkout soll geaendert werden.",
      steps: ["Ziel/KPI festlegen", "Desktop und Mobile Screenshot vom Ist-Zustand machen", "Pruefen: Backend-Einstellung, Theme oder Child-Template?", "Keine Parent-Template Aenderung", "Aenderung im Staging testen", "Cache/Template-Cache beachten", "GA/GTM Events und Checkout testen", "Livegang klein halten", "Nach 7-14 Tagen Ergebnis messen"],
      done: "Aenderung ist update-sicher, getestet, live dokumentiert und mit KPI bewertet."
    },
    {
      id: "pb-support-process",
      title: "Support-Prozess in SeBo verbessern",
      trigger: "Viele E-Mails, unklare Zustaendigkeit, lange Antwortzeiten oder wiederkehrende Fragen.",
      steps: ["Volumen und Kategorien erfassen", "Ticketstatus und Prioritaeten definieren", "Mitarbeiterrollen pruefen", "Antwortvorlagen fuer Top-Fragen schreiben", "Eskalationsregeln festlegen", "Dashboard fuer offene/ueberfaellige Tickets bauen", "Woechentlich Top-Probleme an Stephan melden"],
      done: "Support ist messbar: neue Tickets, offene Tickets, Antwortzeit, Kategorie, Mitarbeiter und Eskalation sind sichtbar."
    },
    {
      id: "pb-data-check",
      title: "Datenfrage oder Umsatzbruch klaeren",
      trigger: "Zahlen wirken falsch oder Stephan fragt: Warum ist Umsatz/KPI so?",
      steps: ["Fragestellung exakt formulieren", "Primaere Wahrheit bestimmen: meistens JTL Wawi", "Vergleichsquellen listen: Shop, GA, GSC, Bank, Logs", "Zeitraum abgrenzen", "Abweichung quantifizieren", "Moegliche Ursachen trennen: Datenluecke, Tracking, echter Rueckgang", "1-seitige Entscheidungsvorlage schreiben"],
      done: "Es gibt eine klare Aussage: echte Entwicklung, Datenproblem oder noch offener Pruefpunkt."
    },
    {
      id: "pb-procurement",
      title: "Einkaufsentscheidung vorbereiten",
      trigger: "Beate/Lorna/Stephan muessen wissen, was bestellt, reduziert oder getauscht wird.",
      steps: ["Artikelgruppe und Saison bestimmen", "LYSS/Vorjahresverkauf und aktuellen Bestand pruefen", "Groessen- und Farbenmix berechnen", "Marge und Lieferant betrachten", "OOS-Risiko und Penner markieren", "Tausch-/Markdown-Option vorbereiten", "Bestellvorschlag als Tabelle exportieren"],
      done: "Einkauf bekommt konkrete Mengen, Begruendung, Risiko und naechste Lieferantenaktion."
    },
    {
      id: "pb-crm",
      title: "Kundenreaktivierung planen",
      trigger: "Sleeping Champions, Einmalkaeufer oder inaktive Kunden sollen wieder aktiviert werden.",
      steps: ["Segment definieren", "Ausschlusskriterien festlegen", "Angebot und Ton formulieren", "Kanal waehlen: Newsletter, persoenlich, Gutschein, Beratung", "Messung definieren: Oeffnung, Klick, Umsatz, Wiederkauf", "Kampagne klein testen", "Ergebnis auswerten und zweite Welle planen"],
      done: "Reaktivierung hat Segment, Angebot, Messung, Ergebnis und Folgeaktion."
    },
    {
      id: "pb-weekly-report",
      title: "Woechentliches Stephan-Update erstellen",
      trigger: "Ende der Woche oder vor Jour fixe.",
      steps: ["Erledigte Aufgaben sammeln", "Blocker und fehlende Zugaenge nennen", "3 wichtigste Zahlen/Beobachtungen notieren", "1-3 Entscheidungen von Stephan formulieren", "Naechste Woche mit Prioritaeten planen", "Kurz und geschaeftlich schreiben"],
      done: "Stephan weiss, was passiert ist, was blockiert, was entschieden werden muss und was als naechstes kommt."
    }
  ],
  quickNotes: [],
  dailyBriefings: [],
  reminders: [],
  timeEntries: [],
  monthlyReports: [],
  team: [
    { id: "p-stephan", name: "Stephan", role: "Geschäftsführer HFK", timezone: "UTC+2 Wien", contactStyle: "direkt, geschäftsfokussiert, ungeduldig bei Geplauder", lovesToHear: "konkrete Zahlen, klare Empfehlung, Vorher/Nachher", avoids: "vage Antworten, lange Tech-Erklärungen", birthday: "", lastContact: "2026-05-25", phone: "", mail: "stephan@hfk.at", notes: "GF + Steuerung. Hauptansprechpartner. Tickt 9-11 Uhr. HFK seit 2014 mit JTL Wawi 2.0." },
    { id: "p-markus", name: "Markus", role: "Digitalisierung / ETL-Owner (ab Juli FT)", timezone: "UTC+2 Wien", contactStyle: "technisch, detailliert", lovesToHear: "saubere Tech-Spezifikation, klare Schnittstellen", avoids: "halbgare Wünsche, ungeordnete Anforderungen", birthday: "", lastContact: "", phone: "", mail: "", notes: "Owner für JTL→Postgres ETL-Job. Phase 1 (Week 1). Mago QA-Partner." },
    { id: "p-bernie", name: "Bernie", role: "Data QA / Sales Export", timezone: "remote (TBD)", contactStyle: "datenpräzise, prüfend", lovesToHear: "saubere Datenstrukturen, Validierungs-Checks", avoids: "Zahlen ohne Quelle", birthday: "", lastContact: "", phone: "", mail: "", notes: "Validiert ETL gegen JTL-Rohexport. Hat VK-Daten 2025 (11.154 Zeilen, netto €3,01M). Inventur 2024/2025." },
    { id: "p-beate", name: "Beate", role: "Buyer / Requirement Owner", timezone: "UTC+2 Wien (in-store)", contactStyle: "praktisch, will Ergebnisse sehen", lovesToHear: "klare Mengen, Lieferanten-Konditionen, Tausch-Optionen", avoids: "abstrakte Strategie, Datenanalysen ohne Bestell-Konsequenz", birthday: "", lastContact: "", phone: "", mail: "", notes: "Macht Messen-Einkauf (März-April) + Saison-Bestellungen. Empfänger der Einkaufsplaner-CSV. Verhandelt Tausch-Optionen mit Suppliern." },
    { id: "p-lorna", name: "Lorna", role: "End-User Einkaufsplaner / Sortiment-Kuratorin", timezone: "UTC+3 Türkei (remote)", contactStyle: "kreativ, kommerziell, weiss was Mamas wirklich kaufen", lovesToHear: "Saisontrends, Bestseller-Feedback, Größen/Farben-Signale aus Verkäufen", avoids: "Zahlen ohne Kontext, theoretische Modelle", birthday: "", lastContact: "", phone: "", mail: "", notes: "Hauptnutzerin Module 2 (Saison-Tracking). Montag-Dashboard-Review, Freitag-Feedback. 3W Lorna-Test vor Go-Live geplant." },
    { id: "p-adnan", name: "Adnan", role: "Inventur", timezone: "UTC+2 Wien", contactStyle: "operativ", lovesToHear: "klare Listen", avoids: "Komplexität", birthday: "", lastContact: "", phone: "", mail: "", notes: "Macht Inventur 2x/Jahr — Bestandsgenauigkeit gegen Postgres validieren." }
  ],
  honorar: {
    dagessatz: 800,
    monatsZielTage: 12,
    rechnungen: []
  },
  viewUsage: {},
  dashboardPrefs: {
    compactMode: false,
    hiddenCards: []
  },
  learnings: [
    { id: "ln-1", title: "Big Book of Dashboards", author: "Wexler / Shaffer / Cotgreave", sourceType: "Buch", status: "durchgearbeitet", rating: 5, startDate: "2026-04-15", finishDate: "2026-05-20", keyTakeaways: "1) Dashboards lösen Aktion aus, nicht Information ablegen. 2) Bullet-Charts statt Pie. 3) Sparkline + Vorjahres-Linie = mächtiger Vergleich. 4) Less is more — weniger Farben, mehr Whitespace. 5) Annotations am Chart machen aus Beobachtung Story.", appliedTo: "MAGALOKO Dashboard, Hebel-Cockpit (Bullet), Anomalien-Radar (Sparkline+Vorjahr)", appliedLeverIds: "lev-feb-bruch", notes: "Pflichtlektüre für jeden der Dashboards baut." },
    { id: "ln-2", title: "Zero to One", author: "Peter Thiel", sourceType: "Buch", status: "durchgearbeitet", rating: 4, startDate: "2026-03-01", finishDate: "2026-03-22", keyTakeaways: "Monopole bauen statt Wettbewerb. Letztes-Mover-Vorteil. Frage: was ist die Wahrheit die niemand sonst sieht — exzellente Karriere-Frage.", appliedTo: "Karriere-Strategie, MAGALOKO als Nische-Tool für Mittelstand-E-Com", appliedLeverIds: "", notes: "Inspiration für MAGALOKO-SaaS-Vision." },
    { id: "ln-3", title: "JTL-Shop Best Practices Webinar", author: "JTL Software", sourceType: "Webinar", status: "in Bearbeitung", rating: 3, startDate: "2026-05-10", finishDate: "", keyTakeaways: "Child-Template Pflicht. Plugin-Architektur, Update-Strategie.", appliedTo: "HFK-Shop-Wartung", appliedLeverIds: "lev-pagespeed", notes: "Praktisch wichtig — fertig schauen." }
  ],
  energyLog: [
    { id: "en-1", date: "2026-05-25", timeSlot: "morning", energyLevel: 5, focusQuality: 5, dominantTaskType: "Strategie/Briefing", duration: 120, notes: "Tiefes Hebel-Coaching mit Stephan-Vorbereitung — Top-Zone." },
    { id: "en-2", date: "2026-05-25", timeSlot: "afternoon", energyLevel: 3, focusQuality: 3, dominantTaskType: "Admin/Support", duration: 90, notes: "Nach Mittag Energie runter. Mails + Support — anstrengend ohne Höhepunkt." },
    { id: "en-3", date: "2026-05-24", timeSlot: "morning", energyLevel: 5, focusQuality: 5, dominantTaskType: "Tech/Code", duration: 180, notes: "Tiefes MAGALOKO-Bauen — flow-state für 3h." },
    { id: "en-4", date: "2026-05-24", timeSlot: "evening", energyLevel: 2, focusQuality: 2, dominantTaskType: "Verwaltung", duration: 60, notes: "Abends Rechnungen schreiben kostet überproportional. Verschieben auf Vormittag prüfen." }
  ],
  jahresRecaps: [],
  careerVision: {
    now: { role: "Digital Sales & Data Lead bei HFK", income: "freiberuflich, Tagessatz 800€", location: "remote/Wien", strength: "Brücke zwischen JTL/Shop/SeBo und Stephan-Entscheidungen", weakness: "Single-Client-Risiko: HFK = einziger Großkunde" },
    year1: { role: "Etablierte Position bei HFK + 1-2 weitere Mandate", income: "+30% durch zweites Mandat (Diversifikation)", location: "remote", milestones: "Februar-Bruch geklärt, 3 Hebel live geschaltet, Wirkungsbilanz €100k+, MAGALOKO als Produkt vermarktet", focus: "Vom Operator zum gefragten Sparringspartner" },
    year3: { role: "Eigene Firma / kleines Team (2-3 Personen)", income: "Kombination Beratung + MAGALOKO als SaaS", location: "Wien + remote", milestones: "MAGALOKO hat 5-10 Kunden, Honorar 1500€/Tag, Stephan-Empfehlung führt zu Folge-Mandanten", focus: "Methode systematisieren, Wissen multipliziert verkaufen" },
    year5: { role: "Anerkannte Stimme für datengetriebenen E-Commerce-Mittelstand", income: "150k+/Jahr, Mix aus SaaS + Beratung + Sprecher/Buch", location: "frei wählbar", milestones: "Buch geschrieben, regelmäßige Talks, MAGALOKO 50+ Kunden", focus: "Vom Berater zum Multiplikator" }
  },
  careerGoals: [
    { id: "cg-1", title: "Februar-2025-Bruch komplett aufgeklärt + Lerneffekt dokumentiert", deadline: "2026-08-31", status: "in Arbeit", progress: 30, linkedWirkungenIds: "wk-1", notes: "Wenn aufgeklärt: Beweis für Mago's Datenkompetenz." },
    { id: "cg-2", title: "Zweites Mandat akquiriert (≠HFK)", deadline: "2026-12-31", status: "geplant", progress: 0, linkedWirkungenIds: "", notes: "Diversifikation. MAGALOKO als Case-Study nutzen." },
    { id: "cg-3", title: "MAGALOKO als Pilot bei 2. Kunde im Einsatz", deadline: "2027-03-31", status: "geplant", progress: 0, linkedWirkungenIds: "", notes: "Anonymisierte Version + Onboarding-Doku." },
    { id: "cg-4", title: "1 Vortrag oder Konferenz-Slot bekommen", deadline: "2027-06-30", status: "geplant", progress: 0, linkedWirkungenIds: "", notes: "Sichtbarkeit aufbauen. JTL-Connect oder E-Commerce-Konferenzen." }
  ],
  careerSkills: [
    { id: "cs-data", skill: "Datenanalyse (SQL, Pandas, Excel)", currentLevel: 4, targetLevel: 5, relevance: "kritisch", lastTraining: "", notes: "Stärken in Aggregation + Visualisierung. Lücke: fortgeschrittene Statistik." },
    { id: "cs-jtl", skill: "JTL Wawi / Shop Customizing", currentLevel: 3, targetLevel: 4, relevance: "hoch", lastTraining: "", notes: "Praktisch im Setup, fehlt: JTL-Plugin-Entwicklung." },
    { id: "cs-prompt", skill: "Prompt Engineering (DeepSeek/OpenAI)", currentLevel: 4, targetLevel: 5, relevance: "hoch", lastTraining: "", notes: "Solide bei Strukturierung, weiter: Multi-Step-Workflows." },
    { id: "cs-stephan", skill: "Stakeholder-Management (Geschäftsführer-Ebene)", currentLevel: 3, targetLevel: 5, relevance: "kritisch", lastTraining: "", notes: "Hauptlücke. Pre-Mortems + Briefings sind erste Schritte." },
    { id: "cs-verkauf", skill: "Verkauf eigener Beratung", currentLevel: 2, targetLevel: 4, relevance: "kritisch", lastTraining: "", notes: "Aktuell passiv (über Empfehlung). Aktive Akquise = Lücke." },
    { id: "cs-design", skill: "UX/Design für datendichte Dashboards", currentLevel: 4, targetLevel: 4, relevance: "hoch", lastTraining: "Wexler-Buch 2026", notes: "MAGALOKO selbst ist Übung." },
    { id: "cs-econ", skill: "E-Commerce-Strategie (Brand/Sortiment/CLV)", currentLevel: 3, targetLevel: 4, relevance: "hoch", lastTraining: "", notes: "Praktisches Wissen über HFK aufgebaut. Theoretischer Rahmen ausbaufähig." },
    { id: "cs-deutsch", skill: "Geschäfts-Deutsch schriftlich + mündlich", currentLevel: 4, targetLevel: 5, relevance: "hoch", lastTraining: "", notes: "Briefing-Generator hilft. Mündliche Verhandlung weiter üben." }
  ],
  portfolioCases: [
    { id: "pc-magaloko", title: "Interner Steuerungs-Cockpit für E-Commerce-Mittelstand", problem: "Geschäftsführer eines wachsenden Mittelständlers fragt täglich nach Zahlen, aber alle Antworten kommen aus Bauchgefühl. Tracking-Defekt seit 1+ Jahr ungeklärt, Marge -22%, Umsatz seit Peak schrumpfend.", approach: "In 4 Wochen: Cockpit gebaut, das (1) Hebel pro €/Stunde rankt, (2) Versprechen an GF strukturiert nachverfolgt, (3) Pre-Mortems vor jeder Maßnahme erzwingt, (4) Datenanomalien automatisch flaggt. Komplett lokal, keine Customer-Daten in der Cloud.", result: "Erste 60 Tage: 30+ Hebel klassifiziert, 17 €/h Top-Hebel identifiziert (Stephan akzeptiert), 4 kritische Risiken früh erkannt, MAGALOKO selbst hat dem GF Konfidenz zurückgegeben.", category: "Beratung + Tool-Bau", status: "public-ready", anonymized: true, sourceWirkungenIds: "wk-1", notes: "Erste Case-Study. Mit Anonymisierung: mittelständlicher Kinder-/Baby-E-Commerce, ~5 Mio Euro pro Jahr." }
  ],
  mentors: [
    { id: "mn-rumelt", name: "Richard Rumelt", role: "Strategie-Professor", domain: "Strategie", source: "Buch: Good Strategy / Bad Strategy", keyIdeas: "Kernel of Good Strategy: Diagnose → Guiding Policy → Coherent Actions. Wer keine 3 dieser hat, hat keine Strategie sondern Fluff.", framework: "Good vs Bad Strategy", whyRelevant: "Magos Strategie für HFK + eigene Karriere strikt nach diesem Rahmen aufbauen. Pre-Mortem ist Diagnose-Werkzeug.", integrationStatus: "in Anwendung", notes: "Buch ein 2. Mal lesen mit MAGALOKO-Fokus." },
    { id: "mn-wexler", name: "Steve Wexler / Jeffrey Shaffer / Andy Cotgreave", role: "Dashboard-Experten", domain: "Datenvisualisierung", source: "Buch: Big Book of Dashboards", keyIdeas: "Dashboards sollen Aktion auslösen, nicht Information ablegen. Bullet-Charts, Sparklines mit Vorjahr, Annotations, weniger Farben.", framework: "Action-First Dashboard Design", whyRelevant: "MAGALOKO ist die direkte Anwendung. Hebel-Cockpit, Anomalien-Radar nach diesen Prinzipien gebaut.", integrationStatus: "tief integriert", notes: "" },
    { id: "mn-thiel", name: "Peter Thiel", role: "Investor/Founder", domain: "Strategie/Karriere", source: "Buch: Zero to One", keyIdeas: "Konkurrenz ist für Verlierer. Monopole bauen statt Wettbewerb. Letztes-Mover-Vorteil. Was ist die Wahrheit die niemand sonst sieht?", framework: "Contrarian + Right", whyRelevant: "Mago muss seine eigene Nische finden — datengetriebener Mittelstand-E-Commerce ist nicht überlaufen.", integrationStatus: "Inspiration", notes: "1 Konzept das du nicht teilst: ?" },
    { id: "mn-andreas", name: "Andreas Antonopoulos", role: "Educator", domain: "Komplexes verständlich machen", source: "YouTube-Talks", keyIdeas: "Komplexes Wissen wird zugänglich wenn Beispiele konkret und visuell sind. Auditive Erklärung schlägt schriftliche.", framework: "Pedagogical Storytelling", whyRelevant: "Mago muss komplexe Dashboard/Daten-Themen an Stephan + Beate erklären. Stephan-Briefings könnten von Storytelling profitieren.", integrationStatus: "Konzept übernommen", notes: "Konkrete Beispiele in Briefings + Glossar." }
  ],
  messenArtikel: [
    {
      id: "ma-cooldenim",
      name: "Cool Denim Hose",
      supplier: "Demo-Supplier",
      ekPrice: 14.50,
      vkPrice: 39.90,
      messeDate: "2026-03-15",
      messeScore: 7,
      collectionFit: "Top fehlt noch",
      lyssTotalVk: 950,
      groessenMix: [
        { groesse: "104", pct: 10, pennerWarning: true, lyssQty: 95 },
        { groesse: "110", pct: 12, pennerWarning: false, lyssQty: 114 },
        { groesse: "116", pct: 28, pennerWarning: false, lyssQty: 266 },
        { groesse: "122", pct: 38, pennerWarning: false, lyssQty: 361 },
        { groesse: "128", pct: 24, pennerWarning: false, lyssQty: 228 },
        { groesse: "134", pct: 10, pennerWarning: false, lyssQty: 95 }
      ],
      farbenTop: [
        { farbe: "Rosa", anteilPct: 35, dbPct: 52, vkLyss: 332 },
        { farbe: "Blau", anteilPct: 30, dbPct: 48, vkLyss: 285 },
        { farbe: "Grün", anteilPct: 35, dbPct: 50, vkLyss: 333 }
      ],
      plannedVolume: 1200,
      tauschOptionen: [
        { id: "to-1", typ: "Größe", from: "116", to: "122", leadWeeks: 2, costEur: 0, reserveQty: 0, notes: "Saubere Reserve falls 122 schneller geht" },
        { id: "to-2", typ: "Farbe", from: "Blau", to: "Rosa", leadWeeks: 1, costEur: 50, reserveQty: 0, notes: "Bei Penner-Risk" },
        { id: "to-3", typ: "Größe", from: "110", to: "116", leadWeeks: 3, costEur: 0, reserveQty: 300, notes: "Backup für 116-Shortage. Risiko: später brauchen wir 110 selbst" }
      ],
      status: "bestellt",
      budget: 17400,
      notes: ""
    },
    {
      id: "ma-sweater",
      name: "Sweater Soft Cotton",
      supplier: "Lieferant-NRW",
      ekPrice: 9.20,
      vkPrice: 24.90,
      messeDate: "2026-03-18",
      messeScore: 8,
      collectionFit: "Passt zur Cool-Denim-Hose",
      lyssTotalVk: 720,
      groessenMix: [
        { groesse: "98", pct: 8, pennerWarning: true, lyssQty: 58 },
        { groesse: "104", pct: 14, pennerWarning: false, lyssQty: 101 },
        { groesse: "110", pct: 24, pennerWarning: false, lyssQty: 173 },
        { groesse: "116", pct: 28, pennerWarning: false, lyssQty: 202 },
        { groesse: "122", pct: 16, pennerWarning: false, lyssQty: 115 },
        { groesse: "128", pct: 10, pennerWarning: false, lyssQty: 72 }
      ],
      farbenTop: [
        { farbe: "Beige", anteilPct: 40, dbPct: 56, vkLyss: 288 },
        { farbe: "Salbei", anteilPct: 30, dbPct: 54, vkLyss: 216 },
        { farbe: "Altrosa", anteilPct: 30, dbPct: 53, vkLyss: 216 }
      ],
      plannedVolume: 900,
      tauschOptionen: [
        { id: "to-4", typ: "Farbe", from: "Salbei", to: "Beige", leadWeeks: 2, costEur: 40, reserveQty: 0, notes: "Beige ist sicherer" }
      ],
      status: "geplant",
      budget: 8280,
      notes: "Lornas Favorit. Score 8/10."
    }
  ],
  saisonTracking: [
    {
      id: "st-cooldenim",
      messenArtikelId: "ma-cooldenim",
      name: "Cool Denim Hose",
      saisonStart: "2026-05-01",
      saisonWoche: 5,
      currentVk: 84,
      lyssVkSameWeek: 56,
      groessenStatus: [
        { groesse: "116", currentVk: 26, expectedVk: 25, status: "ok" },
        { groesse: "122", currentVk: 35, expectedVk: 30, status: "schneller" },
        { groesse: "128", currentVk: 18, expectedVk: 20, status: "ok" },
        { groesse: "134", currentVk: 5, expectedVk: 10, status: "slow", markdownKandidat: false }
      ],
      farbenStatus: [
        { farbe: "Rosa", currentVk: 38, lyssVk: 24, signal: "TOP", deltaPct: 58 },
        { farbe: "Blau", currentVk: 28, lyssVk: 29, signal: "NORMAL", deltaPct: -3 },
        { farbe: "Grün", currentVk: 18, lyssVk: 26, signal: "PENNER", deltaPct: -31 }
      ],
      markdownPlanned: null,
      tauschBeantragt: [],
      notes: ""
    }
  ],
  lornaFeedback: [
    { id: "lf-1", week: 5, year: 2026, dateGiven: "2026-05-23", trendUpdate: "Rosa boomt überraschend, sehr viele Mamas fragen nach", supplierUpdate: "Nächste Charge Cool Denim Mid-Juni erwartet", groessenFeedback: "Größe 134 bleibt liegen — Mamas kaufen lieber 128 mit Spielraum", tauschBedarf: "Ja — wenn möglich Grün ↔ Rosa, Lead 1 Woche", notes: "Anruf 4pm UTC+3 — alles strukturiert nach 4 Punkten" }
  ],
  captureInbox: [],
  jtlTriggers: [
    { id: "tr-vip-oos", name: "VIP-Artikel unter 50% Soll-Bestand", source: "VIP", metric: "currentStock", thresholdPct: 50, direction: "below", priority: "hoch", enabled: true, lastChecked: "", lastFired: "", notes: "Frühwarnung vor OOS bei Top-Umsatzartikeln." },
    { id: "tr-anomaly-new", name: "Neue Datenanomalie eingetragen", source: "Anomalies", metric: "openAnomalies", thresholdPct: 1, direction: "above", priority: "mittel", enabled: true, lastChecked: "", lastFired: "", notes: "Wenn Mago oder System neue Anomalie erstellt." },
    { id: "tr-promise-overdue", name: "Versprechen überfällig", source: "Promises", metric: "overdue", thresholdPct: 1, direction: "above", priority: "hoch", enabled: true, lastChecked: "", lastFired: "", notes: "Sobald 1+ Versprechen Datum-überschritten." },
    { id: "tr-sebo-escalated", name: "SeBo-Tickets eskaliert >10", source: "SeBo", metric: "ticketsEscalated", thresholdPct: 10, direction: "above", priority: "hoch", enabled: true, lastChecked: "", lastFired: "", notes: "Wenn Support-Last kritisch wird." },
    { id: "tr-risk-high", name: "Risiko Score ≥16 (kritisch)", source: "Risks", metric: "topRiskScore", thresholdPct: 16, direction: "above", priority: "kritisch", enabled: true, lastChecked: "", lastFired: "", notes: "Risk-Radar zeigt Hoch-Risiko." },
    { id: "tr-decision-review", name: "Decision-Review heute fällig", source: "Decisions", metric: "reviewDue", thresholdPct: 1, direction: "above", priority: "mittel", enabled: true, lastChecked: "", lastFired: "", notes: "Strukturierte 30T-Review-Schleife." }
  ],
  hypotheses: [
    { id: "hyp-1", title: "Doofinder-No-Result-Fix bringt +2% Wiederfindung", area: "Shop", predictionEur: 24000, predictionPct: 2, confidence: "mittel", basis: "Annahme: 5% der Suchen ohne Treffer × 2% Recovery", linkedLeverId: "lev-doofinder", status: "offen", testDate: "2026-06-15", actualEur: null, actualPct: null, wasRight: null, reviewedAt: "", learnings: "", createdAt: "2026-05-25" },
    { id: "hyp-2", title: "Support-Cockpit spart 1 FTE-Tag/Woche", area: "Support", predictionEur: 18000, predictionPct: 20, confidence: "hoch", basis: "6 Mitarbeiter × ~20% Antwortzeit-Ersparnis", linkedLeverId: "lev-support", status: "offen", testDate: "2026-07-01", actualEur: null, actualPct: null, wasRight: null, reviewedAt: "", learnings: "", createdAt: "2026-05-25" },
    { id: "hyp-3", title: "Sleeping-Champions-Pilot konvertiert 8%", area: "CRM", predictionEur: 15000, predictionPct: 8, confidence: "mittel", basis: "Branchenwert für Re-Activation", linkedLeverId: "lev-sleeping", status: "offen", testDate: "2026-07-15", actualEur: null, actualPct: null, wasRight: null, reviewedAt: "", learnings: "", createdAt: "2026-05-25" }
  ],
  wirkungen: [
    { id: "wk-1", title: "MAGALOKO als Cockpit eingeführt", category: "Tool", date: "2026-05-25", quartal: "Q2-2026", evidence: "30+ Views live, alle 35 Datenmodelle aktiv, Stephan-Profil + Versprechen-Tracker im Einsatz", impactEur: 0, impactType: "Foundation", verifiedBy: "Mago", beforeState: "Kein zentrales Steuerungs-Tool", afterState: "Tägliches Briefing + Wirkungsbilanz + Risk-Radar laufen", notes: "Foundation für alle weiteren Hebel." }
  ],
  preMortems: [
    { id: "pm-1", linkedLeverId: "lev-feb-bruch", title: "Pre-Mortem: Februar-Bruch-Klärung scheitert", scenarioDate: "2026-05-25", failureMode: "Zugangsverweigerung zu GA4 + JTL = keine Datenbasis möglich", probability: "mittel", impact: "Stephan verliert Vertrauen in datenbasierte Klärung, kehrt zu Bauchgefühl zurück", mitigation: "1) Pre-Brief Stephan über benötigte Zugänge in Erstgespräch, 2) Alternativplan mit Bank-Eingängen als Notfall-Datenquelle, 3) Bei Verweigerung sofort kommunizieren statt schleichen lassen", earlyWarning: "Markus oder Stephan reagieren nicht innerhalb 5 Tagen auf Zugangs-Anfrage", status: "aktiv", learnings: "", createdAt: "2026-05-25" }
  ],
  saisonPlan: [],
  verhandlungen: [],
  vendors: [
    { id: "vd-shop", name: "Shop-Dienstleister (extern)", category: "Tech", contactPerson: "?", contactMail: "", contactPhone: "", website: "", role: "JTL-Shop-Wartung, Plugin-Installation, Theme-Anpassung", hourlyRate: 90, contractType: "Stundenbasis", contractEnd: "", escalationContact: "Geschäftsführung", lastContact: "", notes: "Macht Code-Änderungen am Shop. Mago sollte alle Aufgaben strukturiert übergeben.", status: "aktiv" },
    { id: "vd-allinkl", name: "All-Inkl Hosting", category: "Hosting", contactPerson: "Support-Hotline", contactMail: "info@all-inkl.com", contactPhone: "06894/9388-100", website: "https://all-inkl.com", role: "Mail-Hosting + Domain für service@herrundfrauklein.com", hourlyRate: 0, contractType: "Monatsabo", contractEnd: "laufend", escalationContact: "Support-Hotline + Backup-Hoster im Notfall", lastContact: "", notes: "Single-Point-of-Failure für Support-Mail. Mail-Backup-Plan dokumentieren.", status: "aktiv" },
    { id: "vd-brevo", name: "Brevo (Newsletter)", category: "Marketing", contactPerson: "Self-Service", contactMail: "support@brevo.com", contactPhone: "", website: "https://brevo.com", role: "Newsletter-Versand, 45.920 Abonnenten, 27 Listen", hourlyRate: 0, contractType: "Monatsabo (volumenbasiert)", contractEnd: "monatlich kündbar", escalationContact: "Support-Ticket öffnen", lastContact: "", notes: "Kritisch wenn HFK Reaktivierungs-Kampagnen fährt.", status: "aktiv" },
    { id: "vd-cloudflare", name: "Cloudflare (Tunnel + CDN)", category: "Tech", contactPerson: "Self-Service", contactMail: "", contactPhone: "", website: "https://cloudflare.com", role: "MAGALOKO-Tunnel für externe Erreichbarkeit, SSL", hourlyRate: 0, contractType: "Free-Plan", contractEnd: "laufend", escalationContact: "Status-Page checken, Backup-Tunnel via Tailscale", lastContact: "", notes: "Aktivieren wenn Phase 1 deployed wird.", status: "geplant" },
    { id: "vd-deepseek", name: "DeepSeek (KI)", category: "KI", contactPerson: "Self-Service", contactMail: "", contactPhone: "", website: "https://platform.deepseek.com", role: "KI-Backend für Assistent, Briefings, Analyse-Tools, Bundle-Gen", hourlyRate: 0, contractType: "Pay-per-Token", contractEnd: "laufend", escalationContact: "OpenAI als Fallback (gleicher API-Stil)", lastContact: "", notes: "API-Key NUR in sessionStorage. Key bereits einmal kompromittiert — rotieren.", status: "aktiv" },
    { id: "vd-anwalt", name: "Anwalt (DSGVO / Datenschutz)", category: "Recht", contactPerson: "?", contactMail: "", contactPhone: "", website: "", role: "DSGVO-Beratung, AGB, Datenschutz, Verträge mit Auftragsverarbeitern", hourlyRate: 250, contractType: "Stundenbasis", contractEnd: "fall-bezogen", escalationContact: "Stephan-Eskalation", lastContact: "", notes: "Adresse fehlt — Mago soll mit Stephan klären.", status: "fehlt" },
    { id: "vd-steuer", name: "Steuerberater", category: "Recht", contactPerson: "?", contactMail: "", contactPhone: "", website: "", role: "HFK-Buchhaltung, Lohnsteuer, Bilanz", hourlyRate: 0, contractType: "Monatsabo", contractEnd: "laufend", escalationContact: "Stephan", lastContact: "", notes: "Eigentlich nicht Magos Sache — aber wenn Honorar-Modul Rechnungen erzeugt, gut zu kennen.", status: "fehlt" }
  ],
  pitches: [
    {
      id: "pi-26-05-A",
      title: "Variante A · Smart Start (EUR 4.800-6.400/Monat, 12 Wochen) - mit Pflicht-Briefing",
      audience: "Stephan",
      problem: "Du willst klein anfangen, klare Lieferung, ueberschaubares Risiko. Aber: SeBo hat gezeigt - ein Tool alleine reicht dir nicht. Wenn wir A ohne Begleitung machen, wird's nicht genutzt.",
      evidence: "SeBo liegt da, du hast nicht reingeschaut. Lehre: du brauchst nicht NOCH ein Tool - du brauchst jemanden der dir Ergebnisse vorlegt.",
      solution: "6-8 Tage/Monat - EUR 4.800-6.400 - 12 Wochen Pilot. Lieferung: ETL-QA mit Bernie (W2) - 2 Metabase-Dashboards (Finance + Inventory) - Einkaufsplaner-MVP nur Modul 1 Messen - PFLICHT: woechentliches 30-Min-Briefing Freitag mit den max 3 wichtigsten Punkten.",
      alternatives: "Variante B (EUR 9.600/Monat, voller Plan), Variante C (Operator-Mode EUR 12k+, wenn du auch das Briefing-Reden nicht selbst willst).",
      risks: "Risiko: bei A wird wieder nur Tool gebaut. Gegenmaßnahme: Pflicht-Briefing - wenn du das auch ablehnst, ist A falsch fuer uns.",
      nextStep: "Du entscheidest Variante. Schriftliche Vereinbarung bis Donnerstag. Briefing-Slot fix in der Vereinbarung. Phase 1 Start ab Anfang Juni mit Markus.",
      expectedResult: "Phase 1+2a fertig in 4 Wochen. Phase 3 (Einkaufsplaner Modul 1) in W4-6. Du WEISST jeden Freitag was passiert ist, ohne ein Tool zu oeffnen.",
      linkedLeverId: "",
      status: "Entwurf",
      createdAt: "2026-05-25"
    },
    {
      id: "pi-26-05-B",
      title: "Variante B · Plan wie geschrieben (€9.600/Monat, 4 Monate, Default)",
      audience: "Stephan",
      problem: "Du hast im OneSource-Konzept einen klaren 13-Wochen-Plan beschrieben (Phase 1-4). Ohne kontinuierliches Commitment kriegen wir die Synergie zwischen ETL, Metabase und Einkaufsplaner nicht.",
      evidence: "Dein eigenes Konzept schätzt 12 Tage/Monat. Bei €800 Tagessatz = €9.600/Monat. €38.400 für die 4 Monate Mai-August.",
      solution: "**12 Tage/Monat · €9.600 · Mai-August.** Komplette Lieferung: ETL · 4 Metabase-Dashboards · Einkaufsplaner Modul 1+2 · ABC-Tool · Optimization · Lorna-Test-Loop. 2× monatlich Status-Call + wöchentliches schriftliches Update.",
      alternatives: "Variante A (kleiner, langsamer), Variante C (mehr operativer Hebel, höher).",
      risks: "Risiko: höheres Commitment für dich. Gegenmaßnahme: 4 Wochen Kündigungsfrist, Output pro Monat klar definiert, Anzahlung 1. Monat sichert beide Seiten.",
      nextStep: "Du sagst Ja. Vereinbarung Donnerstag. Markus-Kontakt heute Abend von dir, Start Phase 1 nächste Woche.",
      expectedResult: "Ende August: Postgres läuft live · 4 Dashboards verfügbar für dich + Beate + Lorna · Einkaufsplaner für die Messen 2027 bereit · ABC-Tool macht Bestell-Mengen automatisch · Vision-Scoring-Planung als Ausbaustufe 2 fertig.",
      linkedLeverId: "",
      status: "Entwurf",
      createdAt: "2026-05-25"
    },
    {
      id: "pi-26-05-C",
      title: "Variante C · Operator Mode (EUR 12.000-14.400/Monat) - ehrliche Empfehlung wegen Wochen-Wartezeit",
      audience: "Stephan",
      problem: "Wir haben Wochen verloren weil JTL-API + Mail-Forwarding nicht freigegeben waren und ich nicht jede Woche bei dir war um nachzuhaken. Das passiert immer wieder wenn wir 'mal anrufen wenn was ist'-Modus fahren. -21,7% Marge ist nicht durch warten zu loesen.",
      evidence: "5 Zugaenge offen seit Wochen. Nur Brevo laeuft. Jede Woche ohne ETL = Anomalien werden nicht geklaert, Hebel werden nicht umgesetzt. Hebel-Cockpit zeigt 10 Hebel mit ~EUR 228k Wirkung/Jahr Potential - aktuell 0% realisiert weil Daten-Pipe fehlt.",
      solution: "15-18 Tage/Monat - EUR 12.000-14.400 Pauschale. Variante B + Mago entscheidet 2 taktische Hebel/Monat selbst + Stephan-Briefings + Lieferanten-Verhandlungsvorbereitung + Anomalie-Klaerung. **Woechentlich neben Stephan sitzen** (Live oder Call) statt Wochen-Wartezeit auf Zugaenge/Entscheidungen. Mago wird HFKs operativer Digital-Lead.",
      alternatives: "Variante A (klein + Pflicht-Briefing) oder B (Plan wie geschrieben). C ist die ehrliche Antwort auf das was wir gerade besprochen haben.",
      risks: "Risiko: hoeheres Commitment fuer dich. Gegenmassnahme: woechentliches 30-Min-Briefing als Steering - du siehst was Mago macht. Jeder Hebel >EUR 10k Wirkung braucht deine Zustimmung. 4 Wochen Kuendigungsfrist beidseitig.",
      nextStep: "Wenn du sagst 'ja': 3-Monate-Pilot. Erste 2 Hebel definieren wir jetzt. Mail-Forwarding + JTL-API muessen aber bis Ende der Woche da sein - sonst koennen wir nicht starten.",
      expectedResult: "Nach 3 Monaten: 3-5 messbare Hebel realisiert + dokumentiert - du hast jeden Freitag Briefing - ROI pro Hebel transparent - klare Verlaengerungsentscheidung Q3.",
      linkedLeverId: "",
      status: "Entwurf",
      createdAt: "2026-05-26"
    },
    {
      id: "pi-26-05-exit",
      title: "Exit-Option · Saubere SeBo-Uebergabe an Markus (2 Wochen, fixer Abschluss)",
      audience: "Stephan",
      problem: "Wenn du heute sagst dass du den weiteren Auftrag NICHT willst - keine Variante A/B/C - dann brauchen wir einen sauberen Abschluss. Nicht offenes Ende, nicht 'bleiben in Kontakt'.",
      evidence: "SeBo existiert, ist mit echten Daten gefuettert, kann von Markus uebernommen werden. Mago dokumentiert + uebergibt.",
      solution: "2 Wochen Aufwand pauschal - SeBo komplett dokumentiert - Code in dein Git-Repo - Markus-Onboarding-Call - Abnahme. Pauschale EUR 3.200 (4 Tage x EUR 800). Danach ist Mago raus.",
      alternatives: "Komplett ohne Uebergabe (Mago archiviert sein Repo, ihr koennt SeBo nicht mehr aendern lassen) - waere die billigere aber risikoreichere Variante.",
      risks: "Bei SeBo-Code ohne Uebergabe ist HFK abhaengig von Mago. Mit Uebergabe seid ihr autonom.",
      nextStep: "Du sagst ob mit oder ohne Uebergabe. Ich schicke heute Abend die Uebergabe-Checkliste falls ja.",
      expectedResult: "Saubere Trennung. HFK weiss was sie haben + koennen es nutzen oder abschalten. Mago hat einen abgeschlossenen Job referenzierbar.",
      linkedLeverId: "",
      status: "Entwurf",
      createdAt: "2026-05-25"
    }
  ],
  glossary: [
    { id: "gl-jtl", term: "JTL Wawi", category: "System", definition: "Warenwirtschaftssystem von JTL Software. Zentrale Wahrheit für Artikel, Kunden, Aufträge, Rechnungen, Lager, Einkauf bei HFK.", synonyms: "JTL, Wawi", example: 'Schau im JTL nach dem Bestand — direkter Datenzugriff statt Schätzung.', source: "HFK Setup" },
    { id: "gl-jtl-shop", term: "JTL-Shop", category: "System", definition: "Online-Shop-Software von JTL. Kommuniziert mit der Wawi. HFK nutzt Version 5.4.2.", synonyms: "Shop, Online-Shop", example: "Designs immer über Child-Template, nie ins Parent eingreifen.", source: "JTL-Doku" },
    { id: "gl-sebo", term: "SeBo", category: "System", definition: "Service-Bot — internes operatives Cockpit von HFK. Tickets, Kunden, Produkte, Newsletter. Eigene Web-App.", synonyms: "Service Bot, Service-Cockpit", example: "Eskalierte Tickets gehen nicht in MAGALOKO, sondern in SeBo.", source: "Mago-Tool" },
    { id: "gl-magaloko", term: "MAGALOKO", category: "System", definition: "Magos Cockpit. Strategisches Tool für Hebel, Promises, Briefings, Risiko-Tracking. Komplementär zu SeBo.", synonyms: "Cockpit, Mago-Tool", example: "Strategische Entscheidungen → MAGALOKO. Operative Arbeit → SeBo.", source: "selbst" },
    { id: "gl-clv", term: "CLV (Customer Lifetime Value)", category: "Kennzahl", definition: "Gesamter Deckungsbeitrag, den ein Kunde über die ganze Beziehung mit HFK erzeugt. Bei HFK: VIP = ≥5.000€, Premium = 1.000-5.000€, Standard = 300-1.000€, Einsteiger = <300€.", synonyms: "Lifetime Value, Kundenwert", example: "753 VIPs (CLV ≥5k€) machen 68% des Umsatzes.", source: "SeBo Statistiken" },
    { id: "gl-aov", term: "AOV (Average Order Value)", category: "Kennzahl", definition: "Ø Bestellwert pro Auftrag. HFK: €95,90 kumuliert.", synonyms: "Ø Bestellwert", example: "Wenn AOV von 96 auf 105 steigt → 9,4% mehr Umsatz bei gleicher Bestellzahl.", source: "SeBo" },
    { id: "gl-cr", term: "CR (Conversion Rate)", category: "Kennzahl", definition: "Anteil der Shop-Besucher die kaufen. HFK aktuell ca. 1,5-1,6%.", synonyms: "Konversionsrate", example: "+0,5pp CR ≈ +30% Umsatz bei gleichem Traffic.", source: "Branchenstandard" },
    { id: "gl-bcg", term: "BCG-Matrix", category: "Strategie", definition: "Boston Consulting Group: Star (Wachstum+Anteil hoch), Cash Cow (Anteil hoch, Wachstum runter), Question Mark (Wachstum hoch, Anteil klein), Dog (beides klein/runter).", synonyms: "Portfolio-Matrix", example: "OLIVER FURNITURE = Cash Cow, JOOLZ = Star, LIEWOOD = Dog.", source: "Boston Consulting Group" },
    { id: "gl-doofinder", term: "Doofinder", category: "System", definition: "Externes Shop-Such-Tool. Zeigt was User suchen, welche Suchen ohne Treffer enden, was zu Käufen führt.", synonyms: "Shop-Suche", example: "No-Result-Searches sind Sortimentslücken = Geld auf dem Tisch.", source: "Doofinder" },
    { id: "gl-pareto", term: "Pareto-Prinzip (80/20)", category: "Strategie", definition: "Meist erzeugen 20% der Eingaben 80% der Wirkung. Bei HFK: 753 VIPs = 68% Umsatz, ~15% der Marken machen 70% Umsatz.", synonyms: "80/20-Regel", example: "Top-Hebel-Cockpit konzentriert sich auf die 20%.", source: "Vilfredo Pareto" },
    { id: "gl-pwa", term: "PWA (Progressive Web App)", category: "Tech", definition: "Web-App die sich als native App installieren lässt, offline funktioniert, Push bekommen kann.", synonyms: "Installierbare Web-App", example: 'MAGALOKO ist eine PWA — auf iOS/Android per "Zum Home-Bildschirm".', source: "Web-Standard" },
    { id: "gl-dsgvo", term: "DSGVO", category: "Recht", definition: "Datenschutz-Grundverordnung der EU. Regelt wie HFK mit Kundendaten umgehen darf. Verstöße = bis 4% Jahresumsatz Strafe.", synonyms: "GDPR", example: "24.885 inaktive Kunden >2 Jahre — Lösch-Frage offen.", source: "EU-Verordnung" },
    { id: "gl-penner", term: "Penner", category: "Strategie", definition: "Handels-Slang für einen Artikel der sich kaum verkauft und im Lager Geld bindet. Gegenteil von Bestseller. Penner kommt von 'pennen, schlafen' — der Artikel schläft im Lager.", synonyms: "Slow-mover, Ladenhüter, Shelfwarmer, Lagerleiche", example: "Artikel im Lager seit 6 Monaten ohne einen Verkauf = klassischer Penner.", source: "Einzelhandels-Jargon" },
    { id: "gl-markdown", term: "Markdown", category: "Strategie", definition: "Preisreduktion um Lager-Artikel loszuwerden. Bei Pennern: bewusster Verlust um Tot-Kapital wieder flüssig zu machen.", synonyms: "Preisreduktion, Abschrift, Sale", example: "Artikel EK 30€, VK normal 60€ → Markdown auf 35€ um Lager freizukriegen.", source: "Einzelhandel" },
    { id: "gl-oos", term: "OOS / Out-of-Stock", category: "Strategie", definition: "Artikel ist nicht lieferbar — vergriffen im Lager. Bei Bestsellern = direkter Umsatzverlust + Kunde wandert ab.", synonyms: "Out of Stock, vergriffen, ausverkauft", example: "WOOD Mini+ Babybett OOS für 2 Wochen = ~30.000€ Umsatz weg.", source: "E-Commerce" },
    { id: "gl-reorder", term: "Reorder-Point", category: "Strategie", definition: "Bestand-Schwelle bei der automatisch nachbestellt werden muss. Berechnet aus: Tages-Absatz × Lieferzeit + Sicherheitsbestand.", synonyms: "Meldebestand, Reorder Level", example: "Verkauf 2 Stück/Tag, Lieferzeit 21 Tage, Sicherheit 14 Tage = Reorder bei 70 Stück Bestand.", source: "Einkauf" },
    { id: "gl-bestseller", term: "Bestseller", category: "Strategie", definition: "Artikel mit überdurchschnittlich vielen Verkäufen — bei HFK üblich: ≥10.000€ Jahresumsatz. Müssen permanent verfügbar sein.", synonyms: "Top-Seller, Renner, Schnelldreher", example: "WOOD Mini+ Babybett: 1,1 Mio €/Jahr = absoluter Bestseller.", source: "HFK" },
    { id: "gl-long-tail", term: "Long-Tail", category: "Strategie", definition: "Die vielen kleinen Artikel die wenig einzeln verkaufen aber zusammen viel ausmachen. Bei HFK: 68.467 Artikel <1.000€/Jahr Umsatz = Long-Tail.", synonyms: "Schwanz, kleine Artikel", example: "HFK-Long-Tail ist groß: 60% aller Artikel verkaufen <1k€/Jahr.", source: "Chris Anderson 2004" },
    { id: "gl-sortimentstiefe", term: "Sortimentstiefe", category: "Strategie", definition: "Wie viele Varianten/Ausführungen pro Produktgruppe (z.B. 12 Babybetten in 6 Farben statt nur 3 in 2 Farben). Gegen-Begriff: Sortimentsbreite (wie viele verschiedene Produktgruppen insgesamt).", synonyms: "Tiefe", example: "WOOD-Möbel hat hohe Sortimentstiefe (viele Farben, Größen). Bücher haben breite.", source: "Handels-BWL" },
    { id: "gl-wiederkaufquote", term: "Wiederkaufquote", category: "Kennzahl", definition: "Anteil der Kunden die mehr als einmal kaufen. Bei HFK: 33% Stammkunden = Wiederkaufquote, 67% Einmalkäufer.", synonyms: "Repeat-Rate, Retention-Rate", example: "Wenn HFK Wiederkaufquote von 33% auf 38% bringt = sehr großer Hebel.", source: "CRM" },
    { id: "gl-wiederkaufzyklus", term: "Wiederkaufzyklus", category: "Kennzahl", definition: "Typischer Zeitraum zwischen zwei Käufen eines Kunden. Bei HFK ca. 134 Tage (4,5 Monate). Nach diesem Punkt = guter Trigger für Mail.", synonyms: "Reorder-Cycle, Repurchase-Window", example: 'Tag 120 nach Kauf: Trigger-Mail "Neue Auswahl" — vor dem Wiederkauf-Fenster.', source: "CRM-Analyse" },
    { id: "gl-deckungsbeitrag", term: "Deckungsbeitrag / DB", category: "Kennzahl", definition: "Verkaufspreis minus direkte Kosten (Einkauf, Versand, Verpackung). Was am Ende vom Verkauf netto übrig bleibt um Fixkosten + Gewinn zu decken.", synonyms: "DB, Marge, Contribution Margin", example: "VK 60€, EK 30€, Versand 5€ → DB 25€ (42%). HFK gesamt: -21,7% (= Problem).", source: "Kosten-/Leistungsrechnung" },
    { id: "gl-skonto", term: "Skonto", category: "Strategie", definition: "Rabatt den der Lieferant gibt wenn HFK früh zahlt. Üblich: 2-3% bei Zahlung in 10 Tagen statt 30.", synonyms: "Frühzahlerrabatt", example: "Rechnung 10.000€, 3% Skonto → 9.700€ bei Zahlung in 10 Tagen. Sehr profitabel.", source: "Einkauf" },
    { id: "gl-mindermenge", term: "Mindestbestellwert / MOQ", category: "Strategie", definition: "Lieferanten verlangen oft Minimum-Bestellwert oder Minimum-Menge (MOQ = Minimum Order Quantity). Sonst Mindermengen-Zuschlag.", synonyms: "MOQ, Minimum Order Quantity", example: "Lieferant verlangt 500€ MOQ, sonst +15% Zuschlag.", source: "Einkauf" },
    { id: "gl-sla", term: "SLA / Service Level Agreement", category: "Strategie", definition: "Vereinbarung wie schnell ein Support-Ticket beantwortet wird. Z.B. Erstantwort in 4h, Lösung in 24h.", synonyms: "Service Level", example: "HFK-Ziel: SLA Erstantwort <4h für 90% der Tickets.", source: "Support" },
    { id: "gl-lcp", term: "LCP / Largest Contentful Paint", category: "Tech", definition: "Google-Messung wie schnell die größte sichtbare Sache auf einer Seite geladen ist. Ziel: <2,5 Sekunden. Wichtigster Pagespeed-Wert.", synonyms: "Largest Contentful Paint", example: "Shop-LCP 4s → langsam → -0.3% Conversion. Auf 1,8s bringen.", source: "Google Web Vitals" },
    { id: "gl-conversion", term: "Conversion / Konversion", category: "Kennzahl", definition: "Aktion die du willst (meist: Kauf) geteilt durch Besucher. Die Conversion-Rate = Käufer ÷ Besucher × 100. HFK aktuell ~1,5-1,6%.", synonyms: "CR, Conversion-Rate, Konversionsrate", example: "100 Besucher, 2 Käufer → 2% Conversion.", source: "Web-Analytics" },
    { id: "gl-tracking", term: "Tracking", category: "Tech", definition: "Mess-System das aufzeichnet was User im Shop tun (Klicks, Käufe, Verlassen). Hauptwerkzeug: Google Analytics (GA) + Google Tag Manager (GTM).", synonyms: "Web-Tracking, Analytics", example: "Tracking-Defekt = Bestellungen passieren real, werden aber nicht in den Berichten gezählt.", source: "Web-Tech" },
    { id: "gl-funnel", term: "Funnel / Trichter", category: "Strategie", definition: "Schritte die ein Kunde geht: Shop besucht → Produkt angeklickt → Warenkorb → Checkout → bezahlt. Jeder Schritt verliert Kunden. Funnel-Analyse zeigt wo am meisten abspringen.", synonyms: "Sales-Funnel, Conversion-Funnel", example: "100 Produkt-Klicks → 30 Warenkorb → 15 Checkout → 12 Kauf. Größter Verlust: Produkt → Warenkorb.", source: "Marketing" },
    { id: "gl-aov-h", term: "AOV / Average Order Value", category: "Kennzahl", definition: "Durchschnittlicher Bestellwert pro Auftrag. Wichtige Stellschraube — wenn man AOV erhöht (Cross-Selling, Bundles), steigt Umsatz ohne mehr Besucher.", synonyms: "Ø Bestellwert, AOV", example: "HFK: €95,90 AOV kumuliert über 15 Jahre.", source: "E-Commerce" },
    { id: "gl-clv-h", term: "CLV / Customer Lifetime Value", category: "Kennzahl", definition: "Gesamter Umsatz/Deckungsbeitrag eines Kunden über die ganze Beziehung. Hilft entscheiden wie viel Marketing pro Neukunde ausgeben sinnvoll ist.", synonyms: "Lifetime Value, Kundenwert", example: "HFK-VIP: ø 39.223€ CLV — da lohnt sich viel Pflege.", source: "CRM" },
    { id: "gl-bcg-h", term: "BCG-Matrix", category: "Strategie", definition: "4-Felder-Modell der Boston Consulting Group: Stars (Wachstum + Anteil hoch), Cash Cows (Anteil hoch, Wachstum runter), Question Marks (Wachstum hoch, Anteil klein), Dogs (beides klein).", synonyms: "Portfolio-Matrix", example: "OLIVER FURNITURE = Cash Cow, JOOLZ = Star, LIEWOOD = Dog.", source: "Boston Consulting Group" },
    { id: "gl-cross-sell", term: "Cross-Selling", category: "Strategie", definition: "Zusätzliche Produkte zum eigentlichen Kauf anbieten (z.B. wer ein Bett kauft sieht auch passende Matratzen). Macht aus 60€ Warenkorb 90€.", synonyms: "Cross-Sell, Querverkauf, Verbundverkauf", example: "Kunde kauft Babybett → Cross-Sell: passende Matratze + Wickelkommode.", source: "E-Commerce" },
    { id: "gl-bundle", term: "Bundle", category: "Strategie", definition: "Mehrere Produkte als Paket mit kleinem Rabatt anbieten. Z.B. WOOD Mini+ Bett + Matratze + Wickelkommode = 1.499 statt einzeln 1.650 EUR.", synonyms: "Paket, Set, Combo", example: "Bestes HFK-Bundle: Sophie Starter-Set (Beissring + Schnuller + Geschenkset).", source: "E-Commerce" },
    { id: "gl-saisonalitaet", term: "Saisonalität", category: "Strategie", definition: "Schwankungen über das Jahr — bei HFK z.B. November/Dezember Peak (Weihnachtsgeschäft), Februar Tief. Wichtig für Lager-/Personalplanung.", synonyms: "Saisonschwankung", example: "HFK Dezember: 54.549 Bestellungen, Februar 30.453 — fast doppelt so viel zur Hochsaison.", source: "Handels-Statistik" },
    { id: "gl-yoy", term: "YoY / Year over Year", category: "Kennzahl", definition: "Vergleich Wert heute vs. derselbe Wert vor 12 Monaten. Wichtig weil eliminiert Saisonalität.", synonyms: "vs. Vorjahr, Vorjahresvergleich", example: "Februar 2025 vs Februar 2024: -23% YoY = Bruch identifizierbar.", source: "Reporting" },
    { id: "gl-roas", term: "ROAS / Return on Ad Spend", category: "Marketing", definition: "Wie viel Umsatz pro 1€ Werbe-Ausgabe. ROAS 4 = 4€ Umsatz pro 1€ Werbung. Unter 2 unrentabel, über 4 sehr gut.", synonyms: "Werbe-Effizienz", example: "Wenn HFK 10k€ Google Ads ausgibt und 35k€ daraus Umsatz macht = ROAS 3,5.", source: "Performance-Marketing" },
    { id: "gl-cac", term: "CAC / Customer Acquisition Cost", category: "Marketing", definition: "Was es kostet einen neuen Kunden zu gewinnen (Marketing-Kosten ÷ Neukunden). Muss kleiner als CLV sein, sonst Verlustgeschäft.", synonyms: "Akquisitionskosten", example: "10.000€ Marketing → 100 Neukunden = 100€ CAC. Wenn CLV 500€, sehr profitabel.", source: "Marketing" },
    { id: "gl-touchpoint", term: "Touchpoint", category: "Marketing", definition: "Jeder Kontakt zwischen Kunde und HFK — Newsletter, Werbung, Shop-Besuch, Telefonat, Verpackung beim Auspacken. Jeder ist Chance oder Risiko.", synonyms: "Berührungspunkt, Kontaktpunkt", example: "Verpackung mit handschriftlicher Karte = starker Touchpoint, kostet wenig.", source: "Customer Experience" },
    { id: "gl-childtemplate", term: "Child-Template", category: "Tech", definition: "JTL-Shop-Design-Konzept: Statt das Original-Theme (Parent) zu ändern, baut man ein abgeleitetes Kind-Theme. Updates am Parent zerstören dann keine eigenen Änderungen.", synonyms: "Child-Theme, abgeleitetes Theme", example: "HFK-Designänderungen IMMER über Child-Template — sonst sind sie beim nächsten Shop-Update weg.", source: "JTL-Doku" },
    { id: "gl-n8n", term: "N8N", category: "System", definition: "Open-Source-Tool für Automatisierung. Verbindet Apps wie Mail, JTL, SeBo per Drag-and-Drop. Visuell statt Code.", synonyms: "Automation-Tool", example: "N8N-Workflow: neue Mail in service@ → automatisch SeBo-Ticket erstellen.", source: "N8N.io" },
    { id: "gl-staging", term: "Staging", category: "Tech", definition: "Kopie des Shops zum Testen — Änderungen werden erst auf Staging gemacht und geprüft, dann auf Live übertragen. Verhindert dass kaputte Sachen direkt Kunden treffen.", synonyms: "Test-Umgebung, Preview-System", example: "Shop-Designänderung: erst auf Staging testen, dann am Wochenende live.", source: "Web-Dev" }
  ],
  vorhernachher: [],
  competitors: [
    { id: "cmp-1", name: "Baby Walz", website: "https://baby-walz.de", category: "Vollsortimenter", strength: "Sortimentstiefe, Markenbreite, Filialnetz", weakness: "Wenig Premium-Marken wie OLIVER FURNITURE", priceLevel: "mittel", priceCompare: "ähnlich bei Standard, teurer bei Premium", marketingNotes: "Aggressive Saison-Sales (Black Friday, Weihnachten), Newsletter sehr aktiv", recentMove: "", lastObserved: "2026-05-25", lessons: "Saison-Kalender klauen / lernen — wir kommunizieren zu wenig in November.", threat: "mittel", status: "beobachten" },
    { id: "cmp-2", name: "Smyths Toys", website: "https://smythstoys.com/at", category: "Spielwaren-Vollsortimenter", strength: "Preisaggression, Marketing-Budget", weakness: "Keine Möbel, Beratung dünn", priceLevel: "niedrig", priceCompare: "10-15% günstiger bei Massenware", marketingNotes: "TV-Spots, Direktmailing-Heft an Haushalte", recentMove: "", lastObserved: "2026-05-25", lessons: "Wir konkurrieren nicht über Preis — wir gewinnen über Beratung & Premium-Marken.", threat: "niedrig", status: "beobachten" },
    { id: "cmp-3", name: "Pure Nature", website: "https://www.purenature.de", category: "Nachhaltig-Premium-Babyfach", strength: "Klare Positionierung (Bio, Nachhaltigkeit), Premium-Image", weakness: "Sortimentstiefe schwächer als HFK", priceLevel: "hoch", priceCompare: "ähnlich Premium", marketingNotes: "Storytelling-Marketing, Influencer im Nachhaltigkeits-Bereich", recentMove: "", lastObserved: "2026-05-25", lessons: "HFK könnte stärker auf Nachhaltigkeit setzen — Story fehlt.", threat: "mittel", status: "beobachten" },
    { id: "cmp-4", name: "Lokale Wiener Babyfachgeschäfte", website: "", category: "Lokal", strength: "Vor-Ort-Beratung, Stammkundschaft", weakness: "Online schwach, Sortiment begrenzt", priceLevel: "hoch", priceCompare: "ähnlich, oft teurer wegen kleiner Margen", marketingNotes: "Mund-zu-Mund, lokale Empfehlungen", recentMove: "", lastObserved: "2026-05-25", lessons: "HFK punktet mit Online-Sortiment, lokale punkten mit Beziehung.", threat: "niedrig", status: "beobachten" }
  ],
  risks: [
    { id: "rk-1", title: "Februar-Bruch 2025 wiederholt sich", category: "Markt", likelihood: 4, impact: 5, signals: "Wochenumsatz <80% Vorjahr in Feb/Mär 2026", mitigation: "Februar-Analyse abschließen, Tracking validieren, Kampagnen-Kalender frühzeitig", owner: "Mago", status: "beobachten", lastReview: "2026-05-25", notes: "Umsatz schrumpft seit 2022-Peak. -28% 2025 vs 2022." },
    { id: "rk-2", title: "OLIVER FURNITURE Konditionen-Risiko", category: "Lieferant", likelihood: 3, impact: 5, signals: "Verzögerte Lieferung, Preiserhöhung, Sortimentskürzung", mitigation: "2. Lieferant für WOOD-Linie evaluieren, Verträge prüfen", owner: "Mago + Stephan", status: "beobachten", lastReview: "2026-05-25", notes: "10,6% Umsatzanteil = €4,6M/Jahr. Single-Source-Risiko." },
    { id: "rk-3", title: "JTL-/Shop-Update-Ausfall", category: "Tech", likelihood: 2, impact: 4, signals: "Shop offline, Bestellungen nicht synchronisiert, Performance-Drop", mitigation: "Staging-Setup, Backup vor jedem Update, Rollback-Plan dokumentiert", owner: "Markus + Mago", status: "beobachten", lastReview: "2026-05-25", notes: "JTL-Shop 5.4.2 — neue Major-Version wäre kritisch." },
    { id: "rk-4", title: "Support-Eskalations-Stau", category: "Operations", likelihood: 3, impact: 3, signals: "Tickets eskaliert >20, Antwortzeit >48h", mitigation: "SeBo-Workflow stabilisieren, Eskalations-Trigger automatisieren", owner: "Mago + Bernie", status: "in Arbeit", lastReview: "2026-05-25", notes: "Aktuell 17 eskaliert — knapp unter Schwelle." },
    { id: "rk-5", title: "Single-Person-Risiko Mago", category: "Personell", likelihood: 3, impact: 5, signals: "Mago krank/Urlaub und keine Übergabe", mitigation: "MAGALOKO als Doku, Playbooks pflegen, Backup auch zu HFK schicken", owner: "Mago", status: "in Arbeit", lastReview: "2026-05-25", notes: "Dokumentation in MAGALOKO ist der Hebel." },
    { id: "rk-6", title: "DSGVO-Vorfall (Kundendaten)", category: "Compliance", likelihood: 2, impact: 5, signals: "Anfrage Aufsichtsbehörde, Datenleck-Report, ungeklärte Lösch-Anfragen", mitigation: "Auftragsverarbeitungs-Verträge prüfen, Lösch-Prozess aufsetzen, Audit-Log aktiv", owner: "Stephan + Mago", status: "beobachten", lastReview: "2026-05-25", notes: "24.885 Kunden inaktiv >2 Jahre — Lösch-Frage offen." },
    { id: "rk-7", title: "Brevo-/Newsletter-Sperre", category: "Marketing", likelihood: 2, impact: 3, signals: "Spam-Rate steigt, Brevo droht Sperrung", mitigation: "Listen-Hygiene, Double-Opt-In, inaktive Adressen pruefen", owner: "Mago", status: "beobachten", lastReview: "2026-05-25", notes: "45.920 Abonnenten — Pflege-Aufwand." },
    { id: "rk-8", title: "Cloudflare-Tunnel-Ausfall (MAGALOKO mobil weg)", category: "Tech", likelihood: 2, impact: 2, signals: "magaloko.* nicht erreichbar von außen", mitigation: "Tunnel als Windows-Service, Notfallzugang über LAN-IP", owner: "Mago", status: "in Arbeit", lastReview: "2026-05-25", notes: "Hängt von Phase-1-Setup ab." }
  ],
  decisionLog: [
    { id: "dl-1", title: "MAGALOKO als zentrales Cockpit für Mago aufbauen", date: "2026-05-25", context: "Erstes Stephan-Gespräch, Bedarf an Steuerungstool", why: "Stephan braucht klare Zahlen, Mago braucht Übersicht über alle Module gleichzeitig", alternatives: "Bestehendes Tool wie Notion / Airtable nutzen — verworfen wegen JTL-Integrationsbedarf", who: "Mago", impact: "hoch", reviewAt: "2026-06-25", outcome: "", outcomeAt: "" }
  ],
  seboConfig: {
    baseUrl: "https://sebo.dadakaev.tech",
    enabled: true
  },
  seboSnapshot: {
    capturedAt: "2026-05-25",
    totals: {
      revenue15y: 44574010,
      orders15y: 466504,
      avgOrderValue: 95.90,
      avgDeliveryDays: 11.1,
      grossMarginPct: -21.7,
      grossProfit: 14966375,
      customersTotal: 32540,
      customersReturning: 10823,
      customersOnce: 21717,
      avgOrdersPerCustomer: 14.3,
      newsletterSubscribers: 45920,
      brevoLists: 27,
      returnsTotal: 1924,
      returnsOpen: 25,
      productsTotal: 22350,
      suppliersTotal: 326,
      employeesTotal: 6,
      ticketsEscalated: 17,
      ticketsOpen: 3,
      ticketsInProgress: 1,
      ticketsDone: 5
    },
    yearlyRevenue: [
      { year: 2025, orders: 27737, customers: 2526, revenue: 3669534, yoyPct: -17 },
      { year: 2024, orders: 36474, customers: 4024, revenue: 4446321, yoyPct: -12 },
      { year: 2023, orders: 46753, customers: 4751, revenue: 5034896, yoyPct: -1 },
      { year: 2022, orders: 48754, customers: 5490, revenue: 5074704, yoyPct: 2, isPeak: true },
      { year: 2021, orders: 43370, customers: 7536, revenue: 4995585, yoyPct: 17 },
      { year: 2020, orders: 36933, customers: 5753, revenue: 4266646, yoyPct: 24 },
      { year: 2019, orders: 37472, customers: 2649, revenue: 3442302, yoyPct: 12 },
      { year: 2018, orders: 34702, customers: 2217, revenue: 3075301, yoyPct: 10 },
      { year: 2017, orders: 34365, customers: 1702, revenue: 2799710, yoyPct: 14 },
      { year: 2016, orders: 31877, customers: 1384, revenue: 2454811, yoyPct: 26 },
      { year: 2015, orders: 27861, customers: 1027, revenue: 1946031, yoyPct: 25 },
      { year: 2014, orders: 23003, customers: 793, revenue: 1559286, yoyPct: 128 },
      { year: 2013, orders: 9532, customers: 425, revenue: 682530, yoyPct: 4173 },
      { year: 2012, orders: 107, customers: 99, revenue: 15974, yoyPct: 1717 },
      { year: 2011, orders: 11, customers: 11, revenue: 879, yoyPct: null }
    ],
    seasonality: {
      monthlyOrders: [30135, 30453, 37556, 34297, 37723, 37282, 37447, 37967, 42313, 43976, 41096, 54549],
      weekdayOrders: [5076, 65011, 68123, 69377, 67232, 85672, 104303],
      revenueHeatmap: [
        { year: 2025, months: [351, 302, 366, 363, 377, 333, 366, 353, 357, 394, 118, null] },
        { year: 2024, months: [316, 395, 410, 412, 401, 347, 303, 305, 353, 363, 424, 417] },
        { year: 2023, months: [370, 381, 485, 361, 388, 381, 446, 397, 467, 390, 540, 429] },
        { year: 2022, months: [339, 325, 365, 433, 421, 365, 446, 422, 494, 447, 497, 502] },
        { year: 2021, months: [194, 425, 470, 215, 486, 447, 421, 452, 435, 519, 446, 481] },
        { year: 2020, months: [332, 338, 213, 185, 429, 360, 392, 373, 443, 422, 352, 426] }
      ]
    },
    returnReasons: [
      { reason: "Widerruf", count: 2458, share: 85 },
      { reason: "Sonstiges", count: 200, share: 7 },
      { reason: "Falschlieferung", count: 102, share: 4 },
      { reason: "Defekt", count: 61, share: 2 },
      { reason: "Doppelt bestellt", count: 50, share: 2 },
      { reason: "Nicht gefallen", count: 8, share: 0 },
      { reason: "Transportschaden", count: 7, share: 0 },
      { reason: "Falsche Größe", count: 6, share: 0 }
    ],
    topMarginProducts: [
      { rank: 1, name: "Kinderwagen- & Tragetouren in Vorarlberg", supplier: "WANDAVERLAG", price: 14, marginPct: 99.9 },
      { rank: 2, name: "Barbapapas spielen Theater", supplier: "ATLANTIS VERLAG", price: 9, marginPct: 99.8 },
      { rank: 3, name: "Barbapapas spielen Theater", supplier: "ATLANTIS VERLAG", price: 9, marginPct: 99.5 },
      { rank: 4, name: "Barbapapas spielen Theater", supplier: "ATLANTIS VERLAG", price: 9, marginPct: 99.2 },
      { rank: 5, name: "Kinderwagen- & Tragetouren Linz", supplier: "WANDAVERLAG", price: 14, marginPct: 99.0 }
    ]
  },
  brands: [
    { id: "br-oliver", name: "OLIVER FURNITURE", category: "Cash Cow", growthPct: -8, revenueShare: 10.6, revenueTotal: 4599267, productsCount: 443, soldUnits: 6690, action: "Verfügbarkeit sichern, Marge optimieren — Umsatzanker #1", status: "halten", notes: "Echtdaten SeBo: €4.6M / 443 Produkte / 6.690 Stück" },
    { id: "br-hfk", name: "HERR UND FRAU KLEIN (Eigenmarke)", category: "Cash Cow", growthPct: -5, revenueShare: 6.7, revenueTotal: 2907373, productsCount: 1422, soldUnits: 111454, action: "Cash abschöpfen, Sortiment nicht ausbauen, Marge halten", status: "halten", notes: "Eigenmarke. 1422 Produkte / 111k Stück verkauft." },
    { id: "br-liewood", name: "LIEWOOD", category: "Dog", growthPct: -25, revenueShare: 6.2, revenueTotal: 2700353, productsCount: 1096, soldUnits: 130748, action: "Konditionen neu verhandeln, Lager abbauen, Sortimentstiefe reduzieren", status: "reduzieren", notes: "Größter Rückgang. 1096 Produkte, 130k Stück — extrem hoher Long-Tail." },
    { id: "br-joolz", name: "JOOLZ", category: "Star", growthPct: 72.5, revenueShare: 4.8, revenueTotal: 2078679, productsCount: 203, soldUnits: 10934, action: "Investieren, Landingpage, Sortiment ausbauen, Stephan zeigen", status: "ausbauen", notes: "Stärkster Wachstumsstar. 203 Produkte (konzentriert)." },
    { id: "br-cybex", name: "CYBEX", category: "Cash Cow", growthPct: -10, revenueShare: 4.5, revenueTotal: 1942157, productsCount: 334, soldUnits: 7470, action: "Marge prüfen (CLOUD T DB nur 27.6%)", status: "halten", notes: "DB-Problem bei CLOUD T." },
    { id: "br-bugaboo", name: "BUGABOO", category: "Cash Cow", growthPct: -7, revenueShare: 4.0, revenueTotal: 1731726, productsCount: 291, soldUnits: 8873, action: "Halten, nicht überinvestieren", status: "halten", notes: "" },
    { id: "br-stokke", name: "STOKKE", category: "Dog", growthPct: -28, revenueShare: 2.9, revenueTotal: 1276770, productsCount: 302, soldUnits: 16357, action: "Einkauf reduzieren, Lager abbauen", status: "reduzieren", notes: "Klassischer Dog." },
    { id: "br-traeumel", name: "TRÄUMELAND", category: "Cash Cow", growthPct: -6, revenueShare: 2.5, revenueTotal: 1065375, productsCount: 200, soldUnits: 6197, action: "Verfügbarkeit sichern (Bündel mit Bett)", status: "halten", notes: "Frühlingsluft-Matratze ist Bundle-Partner für WOOD-Bett." },
    { id: "br-1plus", name: "1+ IN THE FAMILY", category: "Question Mark", growthPct: 0, revenueShare: 2.0, revenueTotal: 848899, productsCount: 885, soldUnits: 33414, action: "Mit Lorna prüfen, ob Wachstum forciert werden soll", status: "beobachten", notes: "885 Produkte, sehr breit." },
    { id: "br-leander", name: "LEANDER", category: "Cash Cow", growthPct: -5, revenueShare: 1.9, revenueTotal: 835275, productsCount: 145, soldUnits: 10557, action: "Halten, Konditionen prüfen", status: "halten", notes: "" },
    { id: "br-sebra", name: "SEBRA", category: "Dog", growthPct: -18, revenueShare: 1.8, revenueTotal: 780402, productsCount: 131, soldUnits: 43467, action: "Delisting prüfen", status: "reduzieren", notes: "Hoher Stückumschlag, kleine Marge." },
    { id: "br-finkid", name: "FINKID", category: "Star", growthPct: 30, revenueShare: 1.8, revenueTotal: 766646, productsCount: 2, soldUnits: 13407, action: "Sortimentstiefe ausbauen (nur 2 Produkte!)", status: "ausbauen", notes: "Nur 2 Produkte! Aber 13k Stück verkauft — Hebel für mehr Produkte." },
    { id: "br-ergobaby", name: "ERGOBABY", category: "Cash Cow", growthPct: -5, revenueShare: 1.7, revenueTotal: 718332, productsCount: 42, soldUnits: 6934, action: "Halten, Sortiment optimieren", status: "halten", notes: "" },
    { id: "br-nobodi", name: "NOBODINOZ", category: "Dog", growthPct: -22, revenueShare: 1.6, revenueTotal: 712933, productsCount: 143, soldUnits: 22772, action: "Delisting prüfen, Konditionen verhandeln", status: "reduzieren", notes: "" },
    { id: "br-trixie", name: "TRIXIE BABY", category: "Question Mark", growthPct: 0, revenueShare: 1.5, revenueTotal: 648812, productsCount: 337, soldUnits: 49017, action: "Selektiv testen, hohe Stückzahl bei kleiner Marge", status: "beobachten", notes: "49k Stück verkauft." },
    { id: "br-babyzen", name: "BABYZEN (YOYO)", category: "Cash Cow", growthPct: -3, revenueShare: 1.3, revenueTotal: 557067, productsCount: 15, soldUnits: 3289, action: "Halten, Premium-Stroller-Sortiment", status: "halten", notes: "YOYO Gestell ist Top-Umsatz-Produkt." },
    { id: "br-koeka", name: "KOEKA", category: "Cash Cow", growthPct: 0, revenueShare: 1.2, revenueTotal: 531013, productsCount: 152, soldUnits: 15250, action: "Halten", status: "halten", notes: "" },
    { id: "br-modu", name: "MODU", category: "Star", growthPct: 102.8, revenueShare: 0.8, revenueTotal: 0, productsCount: 0, soldUnits: 0, action: "Investieren, Sortimentstiefe vergrößern", status: "ausbauen", notes: "Wachstum +102,8% — kleiner Anteil, hohes Potenzial." },
    { id: "br-stapelstein", name: "STAPELSTEIN", category: "Star", growthPct: 62.1, revenueShare: 1.1, revenueTotal: 0, productsCount: 0, soldUnits: 0, action: "Bundle-Potenzial prüfen", status: "ausbauen", notes: "" },
    { id: "br-moll", name: "MOLL", category: "Star", growthPct: 52.3, revenueShare: 1.3, revenueTotal: 0, productsCount: 0, soldUnits: 0, action: "Sichtbarkeit erhöhen", status: "ausbauen", notes: "" }
  ],
  customerSegments: [
    { id: "cs-vip", name: "VIP (≥5.000 €)", customerCount: 753, lifetimeRevenue: 29534733, share: 68, avgRevenue: 39223, avgOrders: 513.8, status: "binden", action: "Persönlich kontaktieren, Early-Access, VIP-Hotline, Direkter Stephan-/Mago-Draht", lastUpdated: "2026-05-25", source: "SeBo" },
    { id: "cs-premium", name: "Premium (1.000–5.000 €)", customerCount: 4243, lifetimeRevenue: 9225888, share: 21, avgRevenue: 2174, avgOrders: 3.7, status: "ausbauen", action: "Cross-Sell, Loyalty-Programm, Saison-Newsletter, Bundle-Angebote", lastUpdated: "2026-05-25", source: "SeBo" },
    { id: "cs-standard", name: "Standard (300–1.000 €)", customerCount: 4792, lifetimeRevenue: 2546903, share: 6, avgRevenue: 531, avgOrders: 2.2, status: "binden", action: "Trigger-Mails ab 90 Tagen, Anlass-Angebote", lastUpdated: "2026-05-25", source: "SeBo" },
    { id: "cs-einsteiger", name: "Einsteiger (<300 €)", customerCount: 21456, lifetimeRevenue: 2156987, share: 5, avgRevenue: 101, avgOrders: 1.2, status: "konvertieren", action: "Welcome-Strecke, Tag 30/60/90 Trigger, 2nd-Order-Push", lastUpdated: "2026-05-25", source: "SeBo" },
    { id: "cs-stamm", name: "Stammkunden (2+ Bestellungen)", customerCount: 10823, lifetimeRevenue: 0, share: 33, avgRevenue: 0, avgOrders: 0, status: "binden", action: "Wiederkaufquote messen, Loyalty stabilisieren", lastUpdated: "2026-05-25", source: "SeBo" },
    { id: "cs-einmal", name: "Einmalkäufer", customerCount: 21717, lifetimeRevenue: 0, share: 67, avgRevenue: 0, avgOrders: 1.0, status: "konvertieren", action: "67% der Gesamtkunden — größter Hebel für Wiederkauf-Konversion", lastUpdated: "2026-05-25", source: "SeBo" }
  ],
  reactivationCampaigns: [
    { id: "rc-1", name: "Sleeping Champions Pilot Juni 2026", segment: "cs-sleeping", size: 200, sent: 0, opened: 0, clicked: 0, ordered: 0, revenue: 0, status: "geplant", startDate: "2026-06-01", channel: "Brevo", offer: "10% Gutschein + persönlicher Brief", notes: "Erste Welle vorsichtig." }
  ],
  crossSellPairs: [
    { id: "xs-1", productA: "Beissring Sophie", productB: "Sophie Geschenkset", coOccurrences: 6000, status: "Bundle live", action: "Bestseller-Bundle, sichtbar im Shop." },
    { id: "xs-2", productA: "Beissring Sophie", productB: "Schnuller Naturkautschuk", coOccurrences: 3236, status: "Bundle prüfen", action: "Sophie Starter-Set zusammenstellen." },
    { id: "xs-3", productA: "Sophie Geschenkset", productB: "Schnuller Naturkautschuk", coOccurrences: 2392, status: "Bundle prüfen", action: "Zur Sophie Starter-Set Idee." },
    { id: "xs-4", productA: "WOOD Mini+ Babybett", productB: "Matratze Frühlingsluft", coOccurrences: 1560, status: "Bundle live", action: "Komplett-Zimmer Bundle, automatisch im Warenkorb anbieten." },
    { id: "xs-5", productA: "Wachsmalkreiden", productB: "Stoppi marine", coOccurrences: 1529, status: "Bundle idee", action: "Kleinkind Kreativ-Set zusammenstellen mit Lorna." }
  ],
  bundleIdeas: [
    { id: "bd-1", name: "Sophie Starter-Set", products: "Beissring Sophie + Schnuller + Sophie Geschenkset", status: "Idee", expectedUplift: 5, notes: "Basiert auf 6000/3236/2392 Co-Käufe." },
    { id: "bd-2", name: "WOOD Komplett-Zimmer", products: "Babybett + Wickelkommode + Matratze + Schrank", status: "Live", expectedUplift: 8, notes: "Top-Bundle, Umsatzanker." },
    { id: "bd-3", name: "Kleinkind Kreativ-Set", products: "Wachsmalkreiden + Stoppi + Spielmatte", status: "Idee", expectedUplift: 3, notes: "Lorna fragen." }
  ],
  sortimentStats: {
    totalArticles: 114676,
    activeArticles: 22350,
    inactiveArticles: 92326,
    soldEver: 73818,
    notSold24m: 41203,
    overTotal: 8,
    over10k: 340,
    over1k: 5003,
    under1k: 68467,
    lastUpdated: "2026-05-24"
  },
  sortimentRules: [
    { id: "sr-1", rule: "Keine Sales in 24 Monaten + Bestand = 0 → Shop deaktivieren", articleCount: 41203, status: "Vorschlag", priority: "hoch", notes: "Spart Pflegeaufwand, kein Cashflow-Effekt." },
    { id: "sr-2", rule: "Long-Tail (Umsatz < 1.000 €/Jahr) → Lieferanten-Konditionen prüfen", articleCount: 68467, status: "Vorschlag", priority: "mittel", notes: "Hebel bei großen Sortimentskäufen." },
    { id: "sr-3", rule: "Dogs (LIEWOOD, NOBODINOZ, STOKKE, MINI A TURE, SEBRA) → kein Nachkauf, Lager abbauen", articleCount: 2400, status: "in Arbeit", priority: "hoch", notes: "Mit Beate koordinieren." },
    { id: "sr-4", rule: "VIP-Artikel (>10.000 €/Jahr Umsatz) → Mindestbestand garantieren", articleCount: 348, status: "Vorschlag", priority: "hoch", notes: "Verbindung zu VIP-Wächter." },
    { id: "sr-5", rule: "Inaktiv + nie verkauft → vollständig löschen (DSGVO/Pflegeaufwand)", articleCount: 40858, status: "Idee", priority: "niedrig", notes: "Mit Markus sauberen Lösch-Plan." }
  ],
  vipArticles: [
    { id: "vip-1", sku: "WOOD-MINI-WEISS-EICHE", name: "WOOD Mini+ Babybett 74×126/166×87cm weiß/eiche", revenueYear: 793426, soldUnits: 717, targetStock: 60, currentStock: 42, leadTimeDays: 21, supplier: "OLIVER FURNITURE", status: "kritisch", notes: "SeBo: Top-1 Umsatz. 717 Stück verkauft." },
    { id: "vip-2", sku: "WOOD-WICKEL-6", name: "WOOD Original Wickelkommode 6 Schubladen weiß/eiche", revenueYear: 459970, soldUnits: 384, targetStock: 40, currentStock: 31, leadTimeDays: 21, supplier: "OLIVER FURNITURE", status: "warnung", notes: "SeBo: Top-2. Bundle mit Mini+ Bett." },
    { id: "vip-3", sku: "GUTSCHEIN", name: "Gutschein Geschäft & Onlineshop", revenueYear: 345942, soldUnits: 2971, targetStock: null, currentStock: null, leadTimeDays: 0, supplier: "HERR UND FRAU KLEIN", status: "ok", notes: "SeBo: Top-3. Digital, kein Bestand." },
    { id: "vip-4", sku: "YOYO-GESTELL-SCHWARZ", name: "YOYO Gestell schwarz (inkl. Regenschutz)", revenueYear: 259939, soldUnits: 917, targetStock: 25, currentStock: 28, leadTimeDays: 30, supplier: "BABYZEN", status: "ok", notes: "SeBo: Top-4." },
    { id: "vip-5", sku: "WOOD-SCHRANK-3T", name: "WOOD Original Schrank 3-Türig 168×204×58cm", revenueYear: 257224, soldUnits: 123, targetStock: 30, currentStock: 18, leadTimeDays: 28, supplier: "OLIVER FURNITURE", status: "warnung", notes: "SeBo: Top-5." },
    { id: "vip-6", sku: "WOOD-SCHRANK-2T", name: "WOOD Original Schrank 2-Türig 118×204×58cm", revenueYear: 243863, soldUnits: 158, targetStock: 25, currentStock: 14, leadTimeDays: 28, supplier: "OLIVER FURNITURE", status: "warnung", notes: "SeBo: Top-6." },
    { id: "vip-7", sku: "MAT-FRUEHLING-OF", name: "Frühlingsluft m. runden Ecken für Oliver Furniture 68×120 & 68×140", revenueYear: 237432, soldUnits: 651, targetStock: 80, currentStock: 95, leadTimeDays: 14, supplier: "TRÄUMELAND", status: "ok", notes: "SeBo: Top-7. Bundle-Partner für Mini+ Bett." },
    { id: "vip-8", sku: "YOYO-GESTELL-STOKKE", name: "YOYO Gestell schwarz STOKKE", revenueYear: 212443, soldUnits: 1015, targetStock: 20, currentStock: 22, leadTimeDays: 30, supplier: "STOKKE", status: "ok", notes: "SeBo: Top-8. 1015 Stück — Bestseller." },
    { id: "vip-9", sku: "WOOD-BETTSOFA", name: "WOOD Original Bettsofa 90×200cm weiß/eiche", revenueYear: 154189, soldUnits: 160, targetStock: 15, currentStock: 7, leadTimeDays: 35, supplier: "OLIVER FURNITURE", status: "kritisch", notes: "SeBo: Top-9. Lange Lieferzeit, OOS-Risiko hoch." },
    { id: "vip-10", sku: "WOOD-HOCHBETT", name: "WOOD Original halbhohes Hochbett mit Leiter vorne 97×207×128cm", revenueYear: 138663, soldUnits: 96, targetStock: 12, currentStock: 9, leadTimeDays: 28, supplier: "OLIVER FURNITURE", status: "warnung", notes: "SeBo: Top-10." }
  ],
  weeklyKpis: [
    { id: "wk-2025-05", weekStart: "2025-01-27", weekLabel: "KW 5 / 2025", revenue: 32500, orders: 410, sessions: 26000, conversionPct: 1.58, returnRatePct: 18, supportTickets: 280, repeatRatePct: 27, notes: "Letzte normale Woche vor dem Bruch." },
    { id: "wk-2025-06", weekStart: "2025-02-03", weekLabel: "KW 6 / 2025", revenue: 21800, orders: 290, sessions: 24500, conversionPct: 1.18, returnRatePct: 19, supportTickets: 310, repeatRatePct: 26, notes: "Einbruch beginnt." },
    { id: "wk-2025-07", weekStart: "2025-02-10", weekLabel: "KW 7 / 2025", revenue: 19200, orders: 260, sessions: 23000, conversionPct: 1.13, returnRatePct: 19, supportTickets: 295, repeatRatePct: 25, notes: "Bruch verfestigt sich." },
    { id: "wk-2026-19", weekStart: "2026-05-04", weekLabel: "KW 19 / 2026", revenue: 28400, orders: 360, sessions: 24000, conversionPct: 1.50, returnRatePct: 18, supportTickets: 320, repeatRatePct: 28, notes: "" },
    { id: "wk-2026-20", weekStart: "2026-05-11", weekLabel: "KW 20 / 2026", revenue: 29800, orders: 375, sessions: 24500, conversionPct: 1.53, returnRatePct: 17, supportTickets: 305, repeatRatePct: 29, notes: "" },
    { id: "wk-2026-21", weekStart: "2026-05-18", weekLabel: "KW 21 / 2026", revenue: 31200, orders: 395, sessions: 25200, conversionPct: 1.57, returnRatePct: 18, supportTickets: 290, repeatRatePct: 30, notes: "Aktuelle Woche." }
  ],
  anomalies: [
    { id: "an-feb25", weekStart: "2025-02-03", metric: "revenue", deltaPct: -33, vsLabel: "vs Vorwoche", hypothesis: "1) Echter Markteinbruch (Wetter, Konsumklima)\n2) Tracking-Defekt (GA4/GTM seit Februar)\n3) JTL-Datenproblem (Bestellungen nicht synchronisiert)\n4) Shop-Layout-Änderung mit Conversion-Schaden", dataSourcesChecked: "Bisher: nur Shop-Backend gesichtet. Offen: JTL-Export, GA4-Property, GSC-Klicks, Bankeingänge", status: "in Klärung", conclusion: "", createdAt: "2026-05-25T10:00:00Z" }
  ],
  aiPromptLibrary: [
    { id: "pl-seed-1", category: "Mail", title: "Mail an Stephan: Update mit Bitte um Entscheidung", prompt: "Schreibe folgende Mail an Stephan um: präzise, max. 8 Zeilen, am Schluss klare Entscheidungsfrage.", result: "", savedAt: "2026-05-25T08:00:00Z", notes: "Wenn ich Stephan um Freigabe bitten muss." },
    { id: "pl-seed-2", category: "Übersetzer", title: "Tech zu Business: JTL-Read-Only-Zugang", prompt: "Übersetze diesen technischen Begriff in 2-3 Sätze, die ein Geschäftsführer ohne IT-Hintergrund versteht: \"Read-only SQL-Zugang zur JTL Wawi Datenbank\".", result: "", savedAt: "2026-05-25T08:01:00Z", notes: "" }
  ],
  stephanProfile: {
    favoriteMetrics: "Wochenumsatz vs. Vorwoche, Top-3 Support-Themen, Bestandsrisiko in €",
    bestTime: "Vormittags zwischen 9 und 11, nach dem ersten Kaffee, vor dem Mittagessen",
    triggers: "Vage Antworten, lange Erklärungen ohne Zahl, Überraschungen in Kostenfragen, Tech-Sprache ohne Übersetzung",
    calmers: "Klare Zahlen, kurze schriftliche Vorab-Briefings, Vorher/Nachher-Belege, ehrliches \"weiß ich noch nicht\"",
    communicationStyle: "Direkt, geschäftsfokussiert, ungeduldig bei Geplauder. Bevorzugt 1-Seiten-Briefing über mündliche Erklärung.",
    noSurpriseTopics: "Compliance/DSGVO-Risiken, Kostenüberschreitungen, Lieferanten-Risiken, längere Ausfälle von Mago",
    notes: "Beobachtungen ergänzen — was triggert? was beruhigt? Was ist seine Hot-Button-Frage?"
  },
  stephanMoods: [],
  promises: [
    { id: "pr-os1", what: "Phase 1: ETL JTL→Postgres live (mit Markus)", context: "OneSource-Konzept · W1", promisedAt: "2026-05-23", dueDate: "2026-05-29", status: "in Arbeit", meetingId: "m1", outcome: "" },
    { id: "pr-os2", what: "Phase 2a: ETL-QA mit Bernie + Metabase-Basic-Setup", context: "OneSource · W2", promisedAt: "2026-05-23", dueDate: "2026-06-05", status: "offen", meetingId: "m1", outcome: "" },
    { id: "pr-os3", what: "Phase 2b: 4 Metabase-Dashboards live (Finance/Inventory/Sales/Procurement)", context: "OneSource · W3", promisedAt: "2026-05-23", dueDate: "2026-06-12", status: "offen", meetingId: "m1", outcome: "" },
    { id: "pr-os4", what: "Einkaufsplaner-MVP für Lorna+Beate (Modul 1+2)", context: "OneSource · W4-6", promisedAt: "2026-05-23", dueDate: "2026-06-26", status: "offen", meetingId: "m1", outcome: "" },
    { id: "pr-os5", what: "ABC-Tool fertig + Scenario-Refinement mit Beate", context: "OneSource · W7-8", promisedAt: "2026-05-23", dueDate: "2026-07-31", status: "offen", meetingId: "m1", outcome: "" },
    { id: "pr-os6", what: "Netstock-Entscheidung neu evaluieren + Vision-Scoring planen", context: "OneSource · W9-13 + Ausbaustufe 2", promisedAt: "2026-05-23", dueDate: "2026-08-31", status: "offen", meetingId: "m1", outcome: "" },
    { id: "pr-feb", what: "Februar-2025-Datenbruch-Hypothese (sobald ETL+Metabase live)", context: "implizit aus Daten-Lage", promisedAt: "2026-05-25", dueDate: "2026-06-15", status: "offen", meetingId: "m1", outcome: "" }
  ],
  baseline: {
    monthlyRevenueEur: 120000,
    monthlyOrders: 1500,
    conversionRatePct: 1.6,
    avgOrderValueEur: 80,
    repeatRatePct: 28,
    returnsRatePct: 18,
    grossMarginPct: 42
  },
  levers: [
    { id: "lev-support", title: "Support-Cockpit mit Vorlagen + SLA live", area: "Support", expectedImpactEur: 18000, effortHours: 60, risk: "niedrig", confidence: "hoch", status: "Geprüft", plainExplanation: "Was: Wir bauen ein einheitliches Support-Tool wo das Team E-Mails kategorisiert beantwortet, mit fertigen Antwort-Vorlagen für die häufigsten Fragen, und mit einem festen Ziel wie schnell eine Antwort raus sein muss (SLA = Service Level Agreement). Warum: Heute schreibt jeder seine Antworten neu, das kostet Zeit. Mit Vorlagen + klarem Workflow spart das Team ~20% Zeit, also ca. 1 voller Arbeitstag pro Woche frei für andere Aufgaben.", dataBasis: "6 Mitarbeiter × ~20% Antwortzeit-Ersparnis × 50 Mails/Tag = ~1 FTE-Tag/Woche frei", notes: "Quick Win, sofort messbar an Antwortzeit." },
    { id: "lev-doofinder", title: "Doofinder No-Result-Searches fixen", area: "Shop", expectedImpactEur: 24000, effortHours: 20, risk: "niedrig", confidence: "mittel", status: "Idee", plainExplanation: "Was: Doofinder ist die Such-Box im HFK-Shop. No-Result-Searches heißt: ein Kunde tippt was ein, findet aber kein Produkt — und geht weg. Wir analysieren welche Such-Begriffe das sind und fixen das (entweder den Artikel anlegen, anders verschlagworten, oder einen Alternativ-Vorschlag anzeigen). Warum: Jeder Kunde der nichts findet ist ein verlorener Kauf. Wenn wir 2% dieser Kunden retten = ~24.000€ Umsatz pro Jahr.", dataBasis: "Annahme: 5% der Suchen ohne Treffer × 1500 Bestellungen/Monat × 80€ AOV × 2% Recovery", notes: "Sofortige Sortimentsignale, doppelt nutzbar für Einkauf." },
    { id: "lev-conversion", title: "Top-3-Kategorieseiten Conversion-Audit", area: "Shop", expectedImpactEur: 36000, effortHours: 50, risk: "mittel", confidence: "mittel", status: "Idee", plainExplanation: "Was: Conversion bedeutet: wie viele Shop-Besucher tatsächlich kaufen. Wir nehmen die 3 wichtigsten Kategorieseiten (z.B. Babybetten, Kinderwagen, Möbel) und prüfen warum nicht mehr Besucher kaufen — bessere Bilder? Klarer Preis? Bewertungen sichtbar? Mobile-Fehler? Warum: Wenn von 100 Besuchern bisher 1,5 kaufen und wir auf 1,8 kommen = 20% mehr Umsatz aus genau dieser Kategorie ohne mehr Werbung.", dataBasis: "Top-3 Kategorien tragen ~50% Umsatz, +0.3% Conversion ≈ 0.5% Gesamtumsatz", notes: "Mobile First. Heatmap + 3 Hypothesen pro Seite." },
    { id: "lev-sleeping", title: "Sleeping-Champions-Reaktivierung Pilot", area: "CRM", expectedImpactEur: 15000, effortHours: 30, risk: "niedrig", confidence: "mittel", status: "Idee", plainExplanation: "Was: Sleeping Champions sind Kunden die früher viel gekauft haben (mehrere Bestellungen, gute Summen) aber seit >12 Monaten nichts mehr. Bei HFK sind das ca. 2.979 Personen mit 3,4 Mio € Lifetime-Wert. Wir machen einen Pilot mit 200 Personen: persönliches Angebot oder Gutschein per Mail/Brief, dann messen wir Öffnung, Klick, Wiederkauf. Warum: Bestandskunden zurückholen ist 5-7× günstiger als neue zu gewinnen.", dataBasis: "Annahme: 800 Sleeping Champs × 8% Reaktivierung × 150€ erstes Re-Order", notes: "Brevo-Status klären, dann 1 Welle." },
    { id: "lev-penner", title: "Penner-Bestand markdown / Tausch", area: "Einkauf", expectedImpactEur: 22000, effortHours: 25, risk: "niedrig", confidence: "hoch", status: "Idee", plainExplanation: "Was: Penner ist Handels-Slang für Artikel die sich kaum verkaufen — sie liegen im Lager, binden Geld, vergessen werden. Markdown = Preis reduzieren um sie loszuwerden. Tausch = wir tauschen sie beim Lieferanten gegen Top-Seller (manche Lieferanten machen das). Wir identifizieren systematisch alle Penner, entscheiden pro Artikel: Markdown im Shop / Verkaufs-Aktion / Lieferanten-Tausch / Spende. Warum: Tot-Kapital wird zu Cash und macht Platz für Bestseller. ~22.000€ wieder flüssig pro Jahr.", dataBasis: "Liquidiert tot-Kapital, schafft Cashflow für Topseller-Nachorder", notes: "Beate + Lorna einbinden. Saisonende = Window." },
    { id: "lev-feb-bruch", title: "Februar-2025-Datenbruch final klären", area: "Daten", expectedImpactEur: 50000, effortHours: 16, risk: "niedrig", confidence: "niedrig", status: "In Arbeit", plainExplanation: "Was: Im Februar 2025 brach der HFK-Umsatz um 23% ein (302k € vs 395k € im Vorjahr). Bis heute ist nicht klar warum — drei Möglichkeiten: 1) Echter Markteinbruch (Wetter, Konsumklima), 2) Tracking-Defekt (Bestellungen fehlen in den Berichten obwohl real passiert), 3) Datenproblem in JTL. Wir vergleichen JTL ↔ Shop ↔ Bank ↔ Google Analytics um Klarheit zu kriegen. Warum: Wenn HFK seitdem die falschen Schlüsse gezogen hat (z.B. mehr Werbe-Budget weil angeblich der Markt eingebrochen sei), kostet das Geld. Wert kommt daher, dass keine weiteren falschen Entscheidungen getroffen werden.", dataBasis: "Wenn Tracking-Defekt: rückwirkende Korrektur. Wenn echter Markt: andere Strategie nötig", notes: "Hebel: nicht falsche Entscheidungen treffen auf Basis falscher Daten." },
    { id: "lev-pagespeed", title: "Shop-Pagespeed-Audit + Top-3 Fixes", area: "Shop", expectedImpactEur: 14000, effortHours: 18, risk: "niedrig", confidence: "mittel", status: "Idee", plainExplanation: "Was: Pagespeed bedeutet: wie schnell der Shop lädt, gemessen in Sekunden. LCP (Largest Contentful Paint) ist das wichtigste Maß: wann der größte sichtbare Bereich da ist. Wir messen aktuellen Stand, identifizieren die 3 größten Bremsen (oft: zu große Bilder, zu viele Scripts, langsamer Server) und beheben sie. Warum: Studien zeigen 0,5 Sekunden schnellere Mobil-Seite = +0,3% Conversion. Bei HFK ~14.000€/Jahr.", dataBasis: "0.5s schnellerer LCP ≈ +0.3% Conversion (Google-Studien). Mobile primär.", notes: "Vor Tracking-Änderungen messen, sonst Confound." },
    { id: "lev-welcome", title: "Brevo Welcome-Strecke aufsetzen", area: "CRM", expectedImpactEur: 9000, effortHours: 12, risk: "niedrig", confidence: "mittel", status: "Idee", plainExplanation: "Was: Welcome-Strecke heißt: automatisierte Mail-Serie an Neukunden direkt nach der Anmeldung (z.B. Tag 0: Willkommen + Gutschein, Tag 3: Bestseller-Tipps, Tag 7: Marken-Geschichte). Wir bauen das in Brevo (unser Mail-Tool). Warum: Neue Newsletter-Empfänger sind am heißesten in den ersten 14 Tagen. Eine gute Welcome-Strecke macht typisch +15% Erstkäufe aus dieser Gruppe. Setup einmal, läuft dann automatisch.", dataBasis: "Welcome-Strecke ≈ +15% First-Order-Conversion auf Newsletter-Anmelder", notes: "Erst Brevo-Status klären (Hebel #lev-sleeping deckt das mit ab)." },
    { id: "lev-retouren", title: "Retouren-Top-3-Ursachen identifizieren", area: "Support", expectedImpactEur: 28000, effortHours: 24, risk: "niedrig", confidence: "mittel", status: "Idee", plainExplanation: "Was: HFK hat aktuell 1.924 Retouren, davon 85% Widerruf — das ist EU-Standardrecht aber sagt nichts über die echte Ursache. Wir gehen die letzten 100 Retouren manuell durch und finden die 3 echten Hauptgründe (z.B. Größe falsch, Bild zeigte was anderes, Produkt qualitativ enttäuscht). Dann fixen wir Bilder/Beschreibungen/Größenberater bei den Top-Artikeln. Warum: Jede vermiedene Retoure = Versandkosten gespart + Marge gerettet. -2pp Retourenquote = ca. +4% Deckungsbeitrag auf den Bereich.", dataBasis: "Mode-E-Commerce ~18-22% Retoure. -2pp = ~4% mehr Deckungsbeitrag", notes: "Größenberater oder Produktbeschreibung = oft 70% des Effekts." },
    { id: "lev-supplier", title: "Lieferanten-Scorecard + Top-2 konsolidieren", area: "Einkauf", expectedImpactEur: 12000, effortHours: 35, risk: "mittel", confidence: "niedrig", status: "Idee", plainExplanation: "Was: HFK hat 326 Lieferanten — viele liefern nur wenige Artikel. Wir bauen eine Scorecard (Bewertungsblatt) pro Lieferant: Lieferzeit, Qualität, Reklamationsquote, Marge. Bei zwei kleineren Lieferanten in der gleichen Kategorie prüfen wir ob wir das Volumen bei einem bündeln können — bessere Konditionen (Skonto, Mengen-Rabatt), weniger Aufwand. Warum: Typisch -3-5% EK-Preis bei Bündelung. Aber politisch heikel — Lieferantenbeziehungen sind wichtig, also Datenlage zuerst, dann Gespräch.", dataBasis: "Volumenbündelung typisch -3-5% EK + bessere Lieferzeit", notes: "Politisch heikel — erst Datenlage, dann Gespräch." }
  ],
  stephanQuestions: [
    { id: "q-rolle-1", topic: "Rolle", question: "Was genau machst du eigentlich bei uns — bist du Entwickler oder was anderes?", modelAnswer: "Digital Sales & Data Lead: Ich verbinde JTL, Shop, Support, Einkauf und Daten zu einem steuerbaren System. Entwicklung ist ein Werkzeug, nicht die Rolle.", talkingPoints: ["Brücke zwischen Systemen und Entscheidungen", "Nicht nur Code, sondern Wirkung", "SeBo als operatives Cockpit"], dataNeeded: "Eigene Rollendefinition, Outputs der Rolle (Wochenupdate, Briefings, KPI-Steuerung)", confidence: 0 },
    { id: "q-rolle-2", topic: "Rolle", question: "Warum sollen wir SeBo bauen statt ein fertiges Tool zu kaufen?", modelAnswer: "Fertige Tools deckten 60% ab, die letzten 40% sind HFK-spezifisch (Größen/Farben, Lieferanten, JTL-Integration). SeBo löst genau diese 40% und nutzt fertige Komponenten für den Rest.", talkingPoints: ["Lock-in vermeiden", "JTL Wawi bleibt Wahrheit, SeBo macht sie nutzbar", "Kosten pro Modul transparent"], dataNeeded: "Marktrecherche zu vergleichbaren Tools, Kostenrahmen, was wirklich HFK-spezifisch ist", confidence: 0 },
    { id: "q-gehalt-1", topic: "Gehalt", question: "Was stellst du dir vor?", modelAnswer: "Erst Klarheit über Rolle, Verantwortung und Pilotergebnis, dann Gehalt. Vorschlag: 30-Tage-Pilot mit definiertem Output, danach Vergütungsgespräch mit Marktdaten.", talkingPoints: ["Wert vor Preis", "Pilot als Beweis", "Marktvergleich Digital Lead / Product Owner mittlerer E-Commerce"], dataNeeded: "Gehaltsbenchmarks 2025/2026 E-Commerce DACH, eigene Mindestlinie, Verhandlungsspielraum", confidence: 0 },
    { id: "q-support-1", topic: "Support", question: "Was bringt mir das Support-Cockpit konkret in Euro?", modelAnswer: "Bei 50-100 Mails/Tag und 6 Leuten ersparen klare Kategorien und Vorlagen ~20% Antwortzeit = ca. 1 FTE-Tag pro Woche. Plus Lerneffekt: wiederkehrende Probleme werden zu Produktverbesserungen.", talkingPoints: ["Zeitersparnis im Team", "Top-Probleme als Signal für Shop/Einkauf", "Messbare SLA"], dataNeeded: "Aktueller Zeitaufwand pro Mail (Schätzung 6 Leute × 8h), durchschnittliches Mailvolumen, Kategorien-Verteilung", confidence: 0 },
    { id: "q-support-2", topic: "Support", question: "Warum nicht einfach Zendesk oder Freshdesk?", modelAnswer: "Möglich, aber Vendor-Lock-in, monatliche Kosten ~20-50€/User × 6, kein direkter JTL-Hook. SeBo + N8N kostet einmalig Aufbau, integriert JTL-Kundendaten und bleibt erweiterbar.", talkingPoints: ["TCO über 3 Jahre rechnen", "JTL-Integration ist Killer", "SLA-Risiko bei externem Tool"], dataNeeded: "Preisliste Zendesk/Freshdesk, Aufwandsschätzung SeBo-Modul Support", confidence: 0 },
    { id: "q-jtl-1", topic: "JTL/Shop", question: "Was machst du anders als unser Shop-Dienstleister?", modelAnswer: "Der Dienstleister setzt um, ich entscheide datenbasiert was umgesetzt wird. Plus update-sicher: Child-Template, Staging, Tracking-Test, KPI-Messung pro Änderung.", talkingPoints: ["Entscheidungsqualität vor Umsetzungsgeschwindigkeit", "Update-Sicherheit als Pflicht", "Conversion-Hypothesen, nicht Bauchgefühl"], dataNeeded: "Liste vergangener Shop-Änderungen mit/ohne KPI-Messung", confidence: 0 },
    { id: "q-jtl-2", topic: "JTL/Shop", question: "Warum brauchst du Lese-Zugriff auf die JTL Wawi?", modelAnswer: "Ohne JTL-Daten sind alle Analysen (Umsatz, Bestand, Top-Artikel, Penner) Bauchgefühl. Read-only reicht — kein Risiko für die Wahrheitsquelle, voller Hebel für Reporting und Einkauf.", talkingPoints: ["Keine Schreibrechte = kein Risiko", "JTL bleibt Wahrheit", "Alle KPIs zurückführbar auf JTL"], dataNeeded: "Welche Tabellen gebraucht werden (Artikel, Aufträge, Kunden, Bestand), DSGVO-Rolle", confidence: 0 },
    { id: "q-daten-1", topic: "Daten", question: "Warum ist im Februar 2025 unser Umsatz eingebrochen?", modelAnswer: "Noch nicht final geklärt — drei mögliche Ursachen: echter Markteinbruch, Tracking-Defekt (GA/GTM), oder Datenproblem in einer Quelle. Antwort braucht Abgleich JTL ↔ Shop ↔ Bank ↔ GA ↔ GSC.", talkingPoints: ["Saubere Hypothesen-Trennung", "JTL als Wahrheit zuerst", "1-seitige Antwort, nicht 10 Diagramme"], dataNeeded: "Zugriff auf alle 5 Quellen, Zeitraum Q1 2025 vs Q1 2024", confidence: 0 },
    { id: "q-daten-2", topic: "Daten", question: "Welche drei Zahlen willst du mir wöchentlich zeigen?", modelAnswer: "1) Umsatz vs. Plan & Vorwoche, 2) Top-3 Support-Themen + Volumen, 3) Bestandsrisiko (OOS-Topseller + Penner-Bestand in €). Drei Zahlen, eine Seite, fünf Minuten Lesezeit.", talkingPoints: ["Weniger ist mehr", "Aktion ableitbar pro Zahl", "Trend wichtiger als Absolutwert"], dataNeeded: "Klärung mit Stephan: was sind seine Lieblingsmetriken?", confidence: 0 },
    { id: "q-einkauf-1", topic: "Einkauf", question: "Was würdest du Beate und Lorna sagen?", modelAnswer: "Erst zuhören: was kostet sie aktuell am meisten Zeit, was fehlt ihnen an Daten? Dann ein Pilot-Sortimentsbereich, Bestellvorschlag mit Begründung, gemeinsame Abnahme.", talkingPoints: ["Nicht über ihren Kopf entscheiden", "Konkret an einem Bereich starten", "Sie behalten Entscheidungshoheit"], dataNeeded: "Aktueller Einkaufsprozess, welche Tools nutzen sie heute", confidence: 0 },
    { id: "q-strategie-1", topic: "Strategie", question: "Wo siehst du HFK in 3 Jahren?", modelAnswer: "Wachstum nicht über Marketing-Brute-Force, sondern über bessere Entscheidungen: Einkauf trifft die richtigen Mengen, Support löst Probleme bevor sie skalieren, Shop konvertiert besser durch datenbasierte Verbesserungen.", talkingPoints: ["Operational Excellence statt Werbe-Geld", "Daten als Wettbewerbsvorteil", "Wiederkaufquote als Nordstern"], dataNeeded: "Stephans eigene Vision abfragen, nicht aufdrücken", confidence: 0 },
    { id: "q-strategie-2", topic: "Strategie", question: "Wie misst du, ob das was du baust funktioniert?", modelAnswer: "Pro Modul ein Erfolgskriterium vorab definiert: Support = Antwortzeit ↓, Wochenbericht = Stephan trifft Entscheidungen schneller, Einkauf = OOS-Quote ↓. Vorher/Nachher dokumentiert.", talkingPoints: ["Erfolgskriterium vor Bau festlegen", "Vorher-Wert messen", "Ehrliche Auswertung, auch wenn nicht geklappt"], dataNeeded: "Baseline-Werte pro Bereich, Messintervall", confidence: 0 },
    { id: "q-technik-1", topic: "Technik", question: "Was passiert wenn du nicht mehr da bist?", modelAnswer: "Alles dokumentiert (System-Karten, Playbooks, Briefings in MAGALOKO), keine Secrets im Tool, Code in Git. Übergabe in 2 Tagen möglich. Backups als JSON.", talkingPoints: ["Doku als Pflicht, nicht Nachgedanke", "Keine Single-Person-Abhängigkeit", "MAGALOKO macht Wissen explizit"], dataNeeded: "Übergabe-Checkliste, Wo liegt was", confidence: 0 },
    { id: "q-technik-2", topic: "Technik", question: "Warum N8N und nicht selbst programmiert?", modelAnswer: "N8N ist visuell, jeder kann den Workflow lesen, Fehler sind sofort sichtbar. Custom-Code wäre schneller anfangs, aber wartungs­intensiver und nur von mir lesbar.", talkingPoints: ["Wartbarkeit über Eleganz", "Beobachtbarkeit eingebaut", "Eigene Workflows + Custom-Nodes bei Bedarf"], dataNeeded: "Vergleich Hosted N8N vs. self-hosted Kosten", confidence: 0 },
    { id: "q-strategie-3", topic: "Strategie", question: "Was ist die größte Gefahr für HFK aktuell?", modelAnswer: "Aus meiner Außensicht: Datenlücken führen zu Bauchgefühl-Entscheidungen — Einkauf, Sortiment, Marketing. Februar-2025-Bruch ist Symptom. Risiko: man optimiert das Falsche.", talkingPoints: ["Datenlücken = teure Bauchgefühl-Fehler", "Konkurrenz wird datengetriebener", "Kein FOMO-Marketing, sondern Hebel finden"], dataNeeded: "Eigene Hypothesen zu Risiken, nicht behaupten was man nicht weiß", confidence: 0 },
    { id: "q-rolle-3", topic: "Rolle", question: "Wieviele Stunden brauchst du pro Woche?", modelAnswer: "Für 30-Tage-Pilot: 20-25 h/Woche fokussiert. Danach abhängig von Modul-Roadmap. Lieber wenige Stunden mit klarem Output als viele ohne Plan.", talkingPoints: ["Output über Anwesenheit", "Klar definierte Wochenleistung", "Skalierbar nach Erfolg"], dataNeeded: "Eigene Kapazität, Konkurrierende Projekte", confidence: 0 },
    { id: "q-shop-1", topic: "JTL/Shop", question: "Können wir den Shop einfach mal neu machen?", modelAnswer: "Theoretisch ja, praktisch teuer und riskant. Erst belegen welche Conversion-Probleme der aktuelle Shop hat. Oft sind 3 gezielte Änderungen besser als ein Re-Launch.", talkingPoints: ["Re-Launch = Risiko + Kosten", "Hypothesen vor Hammer", "Child-Template-Änderungen sind reversibel"], dataNeeded: "Conversion-Funnel-Analyse, Top-Absprungseiten, Mobile vs Desktop", confidence: 0 },
    { id: "q-support-3", topic: "Support", question: "Warum dauert das so lange bis die Mails sortiert sind?", modelAnswer: "Weil heute jeder einzeln entscheidet was dringend ist. Mit Kategorien + Routing klar definiert braucht das initial 1-2 Tage Aufbau, dann läuft es.", talkingPoints: ["Ohne Regelwerk redundante Arbeit", "Einmalig Aufwand für laufenden Hebel", "Pilot mit 2 Kategorien starten"], dataNeeded: "Aktueller Workflow im Team beobachtet, nicht angenommen", confidence: 0 },
    { id: "q-daten-3", topic: "Daten", question: "Was sagt mir Doofinder eigentlich?", modelAnswer: "Drei Dinge: welche Begriffe Kunden suchen (Nachfrage-Signal), welche keine Treffer haben (Sortimentslücke), und welche zu Conversion führen (echter Wille zu kaufen). Direkter Input für Einkauf und SEO.", talkingPoints: ["No-Result-Searches = Geld auf Tisch", "Conversion aus Suche = Kaufwille", "Doofinder-Daten = Goldgrube"], dataNeeded: "Doofinder-Admin-Zugang, Export Suchbegriffe Q4 2025", confidence: 0 },
    { id: "q-crm-1", topic: "Strategie", question: "Wie reaktivieren wir alte Kunden?", modelAnswer: "Erst Segment: Sleeping Champions (>2 Käufe, >12 Monate inaktiv) sind wertvoller als Einmalkäufer. Dann persönliches Angebot, Pilot mit 200-500 Adressen, Messung Öffnung/Klick/Wiederkauf.", talkingPoints: ["Segmentierung schlägt Massenmail", "Sleeping Champions zuerst", "Pilot klein halten und messen"], dataNeeded: "Kundenhistorie aus JTL, Brevo-Status, Budget für Gutscheine", confidence: 0 },
    { id: "q-rolle-4", topic: "Rolle", question: "Bist du verfügbar wenn was brennt?", modelAnswer: "Innerhalb der Pilotphase ja, mit definiertem Eskalations-Kanal. Reaktionszeit: kritisch <2h, normal <24h. Außerhalb der Kernzeit nicht garantiert.", talkingPoints: ["Klare Eskalationsregeln statt 24/7", "Definierter Kanal (nicht jede WhatsApp)", "Vertretungsregelung dokumentiert"], dataNeeded: "Was ist 'kritisch' für Stephan", confidence: 0 },
    { id: "q-einkauf-2", topic: "Einkauf", question: "Wie verhinderst du dass wir auf Pennern sitzen bleiben?", modelAnswer: "Frühwarnung: Bestand > 90 Tage Verkaufsmenge mit fallender Abverkaufskurve → Markdown-Vorschlag oder Tausch. Plus: bessere Bestellmengen am Anfang.", talkingPoints: ["Penner früh erkennen statt spät reduzieren", "Markdown als Werkzeug, nicht Niederlage", "Lernen pro Saison für nächste Bestellung"], dataNeeded: "Bestand × Verkaufsrate aus JTL, Saisonkurven Vorjahre", confidence: 0 },
    { id: "q-strategie-4", topic: "Strategie", question: "Was wenn KI alles verändert in 2 Jahren?", modelAnswer: "Tut sie schon. MAGALOKO + SeBo nutzen KI heute schon (DeepSeek) für Textoptimierung und Klassifikation. Wichtig: Daten sauber halten — wer die hat, gewinnt mit jeder neuen KI-Welle.", talkingPoints: ["Daten als Fundament für KI", "Pragmatischer KI-Einsatz heute, nicht Wundersuche", "Prompts versionieren, Output prüfen"], dataNeeded: "Konkrete KI-Use-Cases in Planung, Risiken (Halluzination, DSGVO)", confidence: 0 },
    { id: "q-technik-3", topic: "Technik", question: "Was kostet das alles am Ende wirklich?", modelAnswer: "Pro Modul Aufwand + Hosting transparent. Hosting bleibt klein (vorhanden: All-inkl). Modulkosten als Briefing vorab, nicht nachgereicht. Pilotphase fix, danach pro Modul.", talkingPoints: ["Keine versteckten Kosten", "Modul-für-Modul abgerechnet", "Hosting nutzt Bestehendes"], dataNeeded: "Stundenrate, Modul-Aufwandsschätzungen, Hosting-Limits All-inkl", confidence: 0 },
    { id: "q-gehalt-2", topic: "Gehalt", question: "Wir sind eine kleine Firma — kannst du günstiger?", modelAnswer: "Verstanden. Drei Hebel: kleinerer Scope (weniger Module), längere Laufzeit (verteilte Kosten), Erfolgsanteil (Bonus an KPI-Ziel). Aber unter Marktwert pauschal — nein, das funktioniert für keinen von uns lange.", talkingPoints: ["Scope statt Stundensatz reduzieren", "Erfolgsanteil als Win-Win", "Nachhaltig vor billig"], dataNeeded: "Eigene Schmerzgrenze, Mindest-Tagessatz", confidence: 0 },
    { id: "q-26-1", topic: "Gehalt", question: "Was kostet das alles am Ende konkret im Monat?", modelAnswer: "Drei Varianten: A Smart Start ~€4.800-6.400 bei 6-8 Tagen, B Plan wie geschrieben €9.600 bei 12 Tagen (so wie du im Konzept geschätzt hast), C Operator Mode €12-14k bei 15-18 Tagen. Tagessatz €800. Du wählst was passt — ich kann jedes davon liefern.", talkingPoints: ["Drei klare Optionen anbieten", "Tagessatz €800 als Anker", "Du wählst was passt — nicht ich verkaufe was teuer ist"], dataNeeded: "Selbstgewählte Schmerzgrenze, Eigene Lebenshaltungskosten", confidence: 0 },
    { id: "q-26-2", topic: "Gehalt", question: "Warum so teuer? Markus kostet weniger.", modelAnswer: "Markus ist Vollzeit-Festanstellung, ich bin extern auf Tagessatz — andere Modelle. Mein Tagessatz €800 ist marktüblich für Operator-Profile im E-Com-Mittelstand. Ich liefere Strategie + Umsetzung + Stephan-Briefings, nicht nur Code. Wenn ich nicht mehr Wert schaffe als ich koste, hörst du auf. Faires Spiel.", talkingPoints: ["Klare Vergleichsbasis", "Marktüblicher Tagessatz", "Output statt Inputkosten vergleichen"], dataNeeded: "Marktbenchmark Operator/Digital-Lead E-Commerce", confidence: 0 },
    { id: "q-26-3", topic: "Strategie", question: "Was unterscheidet dich von einer Agentur?", modelAnswer: "Agentur macht was im Brief steht und geht. Ich bin operativ drin — sehe dich + Markus + Beate + Lorna jede Woche, kenne die Lieferanten, die Top-Produkte, die Stephan-Sprache. Das macht keine Agentur. Plus: ich habe das Hebel-Cockpit, ich weiß was den nächsten €X bringt.", talkingPoints: ["Operative Tiefe vs Projekt-Abarbeitung", "Kenne dein Team, deine Lieferanten, deine Sprache", "Hebel-Cockpit als Beweis dass ich €-orientiert denke"], dataNeeded: "Agentur-Tagessatz-Vergleich, Beispiele für Hebel-Mehrwert", confidence: 0 },
    { id: "q-26-4", topic: "Strategie", question: "Mit Markus zusammen, brauche ich dich überhaupt?", modelAnswer: "Markus baut die Pipes (ETL, Tech, Wartung). Ich nutze die Pipes für Entscheidungen + Tools für Beate/Lorna + Stephan-Briefings. Andere Liga, andere Stärke. Wir ergänzen uns — er = Fundament, ich = Operator. Beides braucht's wenn HFK wachsen soll.", talkingPoints: ["Klare Rollentrennung Tech vs Operator", "Markus = Fundament, Mago = Anwendung", "Kein Konkurrenz-, sondern Komplementär-Modell"], dataNeeded: "Markus' Zeit-Verfügbarkeit nach Juli (Vollzeit ja, aber für was?)", confidence: 0 },
    { id: "q-26-5", topic: "Strategie", question: "Was, wenn der Februar-Bruch sich nicht klaeren laesst?", modelAnswer: "Klaerbar oder nicht - beides ist Info. Wenn ich nach 2 Wochen sage 'Datenlage zu schlecht zum Klaeren', ist das auch Beweis: HFK braucht bessere Datenarchitektur. Das ist genau Phase 1+2 vom Plan. Eine ungeklaerte Anomalie kostet bei jeder weiteren falschen Entscheidung Geld.", talkingPoints: ["Klaerung oder Klaerbarkeits-Aussage - beides wertvoll", "Verbindung zur Phase 1+2 (Postgres + Metabase)", "Kosten einer ungeklaerten Anomalie quantifizieren"], dataNeeded: "Beispiele fuer falsche Entscheidungen die aus Tracking-Defekten kommen", confidence: 0 },
    { id: "q-26-6", topic: "Rolle", question: "Wie lange dauert es bis ich erste Ergebnisse sehe?", modelAnswer: "Phase 1 ETL = nichts sichtbar (Fundament). Phase 2 Metabase ab W3 = du siehst Live-Zahlen. Phase 3 Einkaufsplaner ab W4 = Lorna+Beate haben ein Tool. Konkret: 4 Wochen für erstes nutzbares Output, 8 Wochen für komplette Einkaufsplaner-Saison-Anbindung. Bis dahin Wochenupdates damit du den Fortschritt siehst.", talkingPoints: ["Klare Zeitstaffel Fundament → Sichtbar → Nutzbar", "Wochenupdates als Sichtbarkeit-Brücke", "Geduldsfenster benennen statt überschätzen"], dataNeeded: "Bisherige Beispiel-Lieferungen (SeBo als Beweis für Liefer-Vermögen)", confidence: 0 },
    { id: "q-26-7", topic: "Strategie", question: "Was passiert mit SeBo? Bleibt das so?", modelAnswer: "Drei Optionen: 1) Aktiv halten + begleiten (ich zeig dir woechentlich die wichtigsten Punkte), 2) Einfrieren als Backup waehrend OneSource gebaut wird, 3) Komplett aufgeben - nur OneSource. Was passt fuer dich?", talkingPoints: ["Drei klare Optionen", "Mago empfiehlt Option 1 wenn Stephan weitermacht - sonst sauberer Abschluss", "Stephan entscheidet, nicht Mago"], dataNeeded: "Stephans Bereitschaft Tools auch aktiv zu nutzen", confidence: 0 },
    { id: "q-26-8", topic: "Strategie", question: "Warum hast du SeBo gebaut wenn ich es nicht gebraucht habe?", modelAnswer: "Faire Frage. SeBo laeuft mit dem was verfuegbar war - Brevo-API + einmaliger CSV-Export. Der KERN von SeBo - automatische Tickets aus Support-Mails und Live-JTL-Daten - kann nicht laufen weil Mail-Forwarding und JTL-API seit Wochen offen sind. Meine Selbstkritik: ich haette das haerter eskalieren muessen, jede Woche nachhaken statt warten. Lehre: engere Taktung mit dir.", talkingPoints: ["Klar machen: SeBo ist limitiert weil Zugaenge fehlen - das ist Stephan-Sache", "Selbstkritik 1 Satz: nicht hart genug eskaliert - keine Selbstgeisselung", "Operator-Modus als Antwort: enge Taktung damit so was nicht mehr passiert"], dataNeeded: "Klare Zugangsliste mit Datum bis wann was offen", confidence: 0 },
    { id: "q-26-9", topic: "Rolle", question: "Ich habe halt keine Zeit, mich in solche Tools einzuarbeiten.", modelAnswer: "Verstehe ich. Deshalb mein Vorschlag: du oeffnest gar kein Tool. Ich komme woechentlich mit max 3 Punkten zu dir - was gerade brennt, was ich vorgeschlagen habe, was ich brauche. Maximal 30 Minuten dein Zeitanspruch. Wenn dir das auch zu viel ist, sind wir nicht der richtige Partner fuer dich - dann ehrlich getrennt.", talkingPoints: ["Stephans Realitaet respektieren", "Operator-Modus = 30 Min/Woche von Stephan", "Klare Trennung wenn auch das zu viel ist"], dataNeeded: "Stephans tatsaechliche woechentliche Aufmerksamkeitskapazitaet fuer HFK-Digitales", confidence: 0 },
    { id: "q-26-10", topic: "Rolle", question: "Was wuerdest du mir empfehlen?", modelAnswer: "Basierend auf was du gerade gesagt hast: [hier auf seine echte Antwort eingehen]. Wenn du wenig Zeit hast aber Wirkung willst - Operator-Modus, ich komme mit Ergebnissen statt mit Tools. Wenn du Schritt-fuer-Schritt-Kontrolle willst - Variante B Plan wie geschrieben. Wenn du erstmal klein starten willst - Variante A aber bitte mit Pflicht-Briefing damit nicht wieder ungenutzt bleibt.", talkingPoints: ["Auf Stephans tatsaechliche Antwort reagieren - nicht vorgefertigte Spruchroutine", "Empfehlung GEBEN statt 'welche willst du'", "Pflicht-Briefing als Konsequenz aus SeBo-Lehre"], dataNeeded: "Stephans Phase-2-Antworten als Basis fuer Empfehlung", confidence: 0 }
  ],
  knowledgeCards: [
    { id: "k1", topic: "JTL Wawi ist Zentrale", summary: "Alle relevanten operativen Fakten muessen gegen JTL Wawi validiert werden: Artikel, Kunden, Auftraege, Rechnungen, Lager, Einkauf.", source: "HFK Briefing", confidence: "hoch", tags: ["JTL", "System"] },
    { id: "k2", topic: "JTL-Shop 5.4.2 Design", summary: "Designaenderungen update-sicher ueber Child-Template, Theme und Staging planen. Parent-Template nicht direkt veraendern.", source: "JTL Doku", confidence: "hoch", tags: ["Shop", "Design"] },
    { id: "k3", topic: "Support-Volumen", summary: "50-100 E-Mails pro Tag und 6 Support-Mitarbeiter machen SeBo sofort operativ relevant.", source: "Stephan Angaben", confidence: "hoch", tags: ["Support", "SeBo"] },
    { id: "k4", topic: "MAGALOKO Regel", summary: "Keine Passwoerter, API-Keys oder Kundendaten speichern. Nur Status, Owner, Zweck und naechste Aktion dokumentieren.", source: "MVP Annahme", confidence: "hoch", tags: ["Sicherheit"] },
    { id: "k5", topic: "Februar 2025", summary: "Der auffaellige Bruch muss gegen JTL, Shop, Bank, Google Analytics, Search Console und Shop-Logs validiert werden.", source: "HFK Analyse", confidence: "mittel", tags: ["Analytics", "Risiko"] },
    { id: "k6", topic: "Magos Rolle", summary: "Mago ist nicht nur Entwickler, sondern baut die Bruecke zwischen JTL, Shop, SeBo, Support, Einkauf, Kunden und Stephan-Entscheidungen.", source: "Rollenprofil", confidence: "hoch", tags: ["Rolle"] },
    { id: "k7", topic: "SeBo vs. MAGALOKO", summary: "SeBo = operatives Cockpit (Tickets, Kunden, Produkte, Newsletter) mit Live-JTL-Daten. MAGALOKO = strategisches Cockpit (Hebel, Promises, Briefings, Stephan-Management). SeBo öffnen wenn arbeiten an Tickets/Kunden, MAGALOKO wenn entscheiden/planen.", source: "MAGALOKO-Doku", confidence: "hoch", tags: ["Tools", "Rolle"] },
    { id: "k8", topic: "HFK Echtdaten (SeBo)", summary: "€44,5 Mio kumuliert über 15 Jahre, 466.504 Bestellungen, €95,90 AOV, 32.540 Kunden. Aber: Marge -21,7% Gesamt, Umsatz schrumpft seit 2022-Peak (€5,07M → 2025 €3,67M = -28%). Februar 2025 -23% vs Vorjahr.", source: "SeBo Statistiken", confidence: "hoch", tags: ["Daten", "Risiko"] },
    { id: "k9", topic: "CLV-Pareto", summary: "753 VIP-Kunden (≥5.000€) erzeugen 68% des Umsatzes (€29,5 Mio). 21.717 Einmalkäufer = 67% der Gesamtkunden aber nur 5% Umsatz. Größter Hebel: VIPs halten + Einmalkäufer konvertieren.", source: "SeBo CLV-Segmente", confidence: "hoch", tags: ["Daten", "Strategie"] },
    { id: "k10", topic: "Saisonalität", summary: "Dezember Peak (54.549 Bestellungen). November 41k, Februar Tiefpunkt 30.453. Wochentag: Samstag 104k, Sonntag nur 5k (Geschäft geschlossen). Mai-Nov ist die HFK-Saison.", source: "SeBo Saisonalität", confidence: "hoch", tags: ["Daten", "Saison"] },
    { id: "k-sebo-unbenutzt", topic: "SeBo limitiert - Zugaenge fehlen seit Wochen (v3)", summary: "Stand 26.05.2026: SeBo laeuft nur mit Brevo-API + CSV-Export. Der KERN (Auto-Tickets aus Support-Mails + Live-JTL-Daten) kann nicht laufen weil 1) Mail-Forwarding vom All-Inkl fehlt und 2) JTL-API/DB-Read-only fehlt. Beides seit Wochen bei Stephan offen. Magos einzige Selbstkritik: nicht hart genug eskaliert, kein wo-stehen-wir-Briefing pro Woche. Konsequenz: in Phase 1 ZUGANGSLISTE auf den Tisch + Termine fordern + Variante C (Operator-Modus) anbieten weil engere Taktung das verhindert. Wenn Stephan auch jetzt Zugaenge nicht freigibt - saubere Trennung.", source: "Termin 26.05. v3 nach Klaerung", confidence: "hoch", tags: ["Stephan", "Lehre", "Zugaenge", "Operator"] },
    { id: "k-auftrag", topic: "Stephan's eigentlicher Auftrag (OneSource)", summary: "Mago baut: 1) ETL JTL→Postgres mit Markus (W1), 2) Metabase 4 Dashboards (W2-3), 3) Einkaufsplaner-Tool für Lorna+Beate mit Modul 1 Messen + Modul 2 Saison (W4-6), 4) ABC-Tool mit Beate (W7-8), 5) Optimization + Netstock-Entscheidung (W9-13). Deadline gesamtes Setup: August 2026. Stack: Postgres (Supabase/Railway), Metabase, React+Tailwind, Claude API. NICHT: ein eigenes Cockpit für Mago bauen — sondern KONKRET diese 4 Lieferungen für HFK.", source: "MAGO_OneSource_Konzept.md + EINKAUFSPLANER_v1.5_Messen_Saison.md", confidence: "hoch", tags: ["Auftrag", "Strategie", "OneSource"] },
    { id: "k-lyss", topic: "LYSS-Vergleich (Lessons-from-Last-Year-Season)", summary: "Kernprinzip im Einkaufsplaner: Diese-Woche-VK / Gleiche-Woche-Vorjahr. Beispiel: Cool Denim Hose Woche 5 Vorjahr 56 VK, dieses Jahr 84 VK = +50% → ACCELERATE-Signal. Größenmix kommt auch aus LYSS (z.B. 28% Gr.116, 38% Gr.122). Pflicht-Datenquelle für Modul 1 + Modul 2.", source: "EINKAUFSPLANER_v1.5", confidence: "hoch", tags: ["Einkauf", "Daten", "LYSS"] },
    { id: "k-saison", topic: "Saison-Lifecycle (Modul 2)", summary: "Artikel-Lifecycle in 13-Wochen-Saison: W1-4 NEW (ok, langsam), W5-8 PEAK (zügig), W9-11 DECLINE (erwartbar), W12-13 PENNER/OUTLET (Markdown-Prep). Trigger: Artikel in W8 unter 50% Forecast → Markdown-Kandidat. Lorna gibt jeden Freitag strukturiertes Feedback.", source: "EINKAUFSPLANER_v1.5", confidence: "hoch", tags: ["Einkauf", "Saison"] },
    { id: "k-team-onesource", topic: "OneSource-Team & Rollen", summary: "Stephan (GF, Steuerung, Wien UTC+2). Markus (Digitalisierung, ETL-Owner ab Juli FT, Wien UTC+2). Bernie (Data QA, Sales Export, remote). Beate (Buyer, in-store, Requirement Owner für Einkaufsplaner). Lorna (End-User in Türkei UTC+3, Hauptnutzerin Modul 2). Adnan (Inventur). Mago (Prompt Engineering + Dev).", source: "MAGO_OneSource_Konzept.md", confidence: "hoch", tags: ["Team", "Auftrag"] },
    { id: "k11", topic: "Top-Margen-Hebel", summary: "Bücher/Touren-Magazine vom Wandverlag & Atlantis Verlag haben 99,5-99,9% Marge. Geringer Umsatz aber Cross-Sell-Add-Ons mit nahezu null Kosten. Bundles damit prüfen.", source: "SeBo Top-Margen", confidence: "mittel", tags: ["Produkte", "Marge"] },
    { id: "k12", topic: "Dashboard-Design (Wexler-Buch)", summary: "Eine Hervorhebung pro Bild (preattentive single highlight). Länge & Position für quantitative Vergleiche. Farbe IMMER mit zweitem Indikator (Pfeil/Icon/Form) wegen Farbenblindheit. Pies/Donuts max. 3 Kategorien. Word Clouds vermeiden. Zeit als Linie, Saison als Heatmap.", source: "The Big Book of Dashboards, Wexler/Shaffer/Cotgreave", confidence: "hoch", tags: ["UX", "Design"] },
    { id: "k13", topic: "Useless-Dashboard-Check", summary: "Wenn ein KPI immer grün ist: vom Dashboard nehmen. Nutzung überwachen (wer schaut wann?). Mit Usern reden (über die Schulter). Personalisierung erlauben (eigene Filter, eigene Layouts). Monatlich Kachel-Audit machen.", source: "Wexler-Buch Kap. 32", confidence: "hoch", tags: ["UX", "Wartung"] }
  ]
};

// === Workspaces (Multi-Projekt-Setup) ===
const WORKSPACE_SCOPED_KEYS = [
  "tasks","promises","meetings","briefings","decisionLog","pitches","risks","premortems",
  "hypotheses","wirkungen","calendarEvents","captureInbox","accessItems","systems","vendors",
  "beforeafter","competitors","triggers","knowledge","jobs","playbookSteps","playbookStatus",
  "moodLog","stephanMoods","weeklyKpis","anomalies","levers","levers2025","leverWhatIfBaseline",
  "aiPromptLibrary","seboConfig","seboSnapshot","brands","champions","crossSellPairs",
  "customerSegments","reactivationCampaigns","sortimentRules","sortimentStats","vipArticles",
  "stephanProfile","bundleIdeas","jtlData","saisonplan","saisonItems","saisonEinkaufsmengen",
  "verhandlungen","captureRules","jtlManufacturers","jtlSuppliers","jtlKpis","jtlImports",
  "ordersIntake","consultingServices","salesPersonas","salesObjections","trainingScenarios","staffTraining",
  "stephanSchedule","stephanDecisions","akademieDrills","akademieMarken","akademieRoleplays","teamNotes"
];

const WORKSPACE_DEFAULTS = {
  hfk: {
    label: "HFK · Herr und Frau Klein",
    color: "#e6b450",
    enabledModules: [
      "dashboard","today","calendar","levers","anomalies","daily","week","roadmap",
      "access","briefing","meeting","assistant","aitools","purchase","brands",
      "champions","crosssell","sortiment","vip","sebo","risks","decisions","vendors",
      "pitches","beforeafter","competitors","hypotheses","premortems","wirkungen",
      "saisonplan","verhandlungen","capture","triggers","jobs","knowledge","glossary","systems",
      "orders-intake","marktanalyse","akademie","lernsystem","stephan-kalender","stephan-decisions","team-notizen",
      "produkt-lookup","kunden-lookup","abc-uebersicht","lieferant-check","kunden-detail","ma-validation"
    ]
  },
  crmKunde: {
    label: "CRM-Kunde · Platform/Website",
    color: "#2f5f96",
    enabledModules: [
      "dashboard","today","calendar","jobs","capture","knowledge","risks","decisions","pitches","glossary","briefing","meeting"
    ]
  },
  zentrale: {
    label: "Mago Zentrale",
    color: "#267274",
    isMeta: true,
    enabledModules: [
      "dashboard","today","calendar","jobs","capture","time","monthly","honorar",
      "career","portfolio","mentors","learnings","energy","graph","recap","usage","audit"
    ]
  }
};

function applyWorkspaceLayer(s) {
  if (!s || typeof s !== "object") return s;
  // Step 1: workspaces-Container sicherstellen
  s.workspaces = s.workspaces || {};
  for (const [id, def] of Object.entries(WORKSPACE_DEFAULTS)) {
    if (!s.workspaces[id]) {
      s.workspaces[id] = { ...def, data: {} };
    } else {
      // Bestehende Workspaces: Default-Properties zusammenführen, data nicht überschreiben.
      // enabledModules immer aus Code-Defaults überschreiben damit neue Module wirklich sichtbar werden.
      s.workspaces[id] = { ...def, ...s.workspaces[id], enabledModules: def.enabledModules, data: s.workspaces[id].data || {} };
    }
  }
  // Step 2: Falls HFK leer ist UND Top-Level-Daten existieren → migrieren (legacy state)
  const hfkData = s.workspaces.hfk.data;
  const hfkEmpty = !Object.values(hfkData).some((v) => Array.isArray(v) && v.length > 0);
  if (hfkEmpty) {
    for (const key of WORKSPACE_SCOPED_KEYS) {
      if (key in s) hfkData[key] = s[key];
    }
  }
  // Step 3: Workspace-Defaults korrekt typisiert initialisieren (Array vs Objekt anhand seedData)
  const seedShape = (key) => {
    const v = (typeof seedData !== "undefined") ? seedData[key] : undefined;
    if (Array.isArray(v)) return [];
    if (v && typeof v === "object") return {};
    // Neue Keys ohne Seed-Definition → Array als Default (nicht null!)
    return [];
  };
  for (const wsId of Object.keys(s.workspaces)) {
    const ws = s.workspaces[wsId];
    ws.data = ws.data || {};
    for (const key of WORKSPACE_SCOPED_KEYS) {
      const seedVal = (typeof seedData !== "undefined") ? seedData[key] : undefined;
      const expectArray = Array.isArray(seedVal);
      const expectObject = !expectArray && seedVal && typeof seedVal === "object";
      const cur = ws.data[key];
      const curIsArray = Array.isArray(cur);
      const curIsObject = !curIsArray && cur && typeof cur === "object";
      // Fall 1: gar nicht vorhanden ODER null/undefined → Default-Shape
      if (!(key in ws.data) || cur == null) {
        ws.data[key] = seedShape(key);
      }
      // Fall 2a: Array erwartet aber kein Array (Objekt o.ä.) → leeres Array
      else if (expectArray && !curIsArray) {
        ws.data[key] = [];
      }
      // Fall 2b: Objekt erwartet aber keins → Seed-Shell oder {}
      else if (expectObject && !curIsObject) {
        ws.data[key] = wsId === "hfk" ? JSON.parse(JSON.stringify(seedVal)) : {};
      }
      // Fall 2c: Unbekannter Key (kein Seed), Wert ist KEIN Array und KEIN Objekt → Array als sicherer Default
      else if (!expectArray && !expectObject && !curIsArray && !curIsObject) {
        ws.data[key] = [];
      }
      // Fall 3: neuer Workspace (nicht HFK) mit leerem Objekt → seed-Schale für Render-Sicherheit kopieren
      const final = ws.data[key];
      if (wsId !== "hfk" && expectObject && final && typeof final === "object" && !Array.isArray(final) && Object.keys(final).length === 0) {
        ws.data[key] = JSON.parse(JSON.stringify(seedVal));
      }
    }
  }
  // Step 4: currentWorkspace bestimmen
  s.currentWorkspace = s.currentWorkspace && s.workspaces[s.currentWorkspace] ? s.currentWorkspace : "hfk";
  // Step 5: Shared-References vom aktiven Workspace ins Top-Level
  const active = s.workspaces[s.currentWorkspace];
  for (const key of WORKSPACE_SCOPED_KEYS) {
    s[key] = active.data[key];
  }
  return s;
}

function getActiveWorkspace() {
  return state.workspaces?.[state.currentWorkspace] || null;
}

function getWorkspace(id) {
  return state.workspaces?.[id] || null;
}

function switchWorkspace(newId) {
  if (!state.workspaces?.[newId]) return false;
  if (state.currentWorkspace === newId) return true;
  // Aktuelle Top-Level-Daten in aktuelle Workspace-Daten persistieren (durch shared-ref bereits identisch, aber sicher ist sicher)
  const oldWs = state.workspaces[state.currentWorkspace];
  if (oldWs) {
    for (const key of WORKSPACE_SCOPED_KEYS) {
      oldWs.data[key] = state[key];
    }
  }
  // Neues Workspace laden
  state.currentWorkspace = newId;
  const newWs = state.workspaces[newId];
  for (const key of WORKSPACE_SCOPED_KEYS) {
    state[key] = newWs.data[key];
  }
  saveState();
  applyWorkspaceUI();
  render();
  return true;
}

function applyWorkspaceUI() {
  const ws = getActiveWorkspace();
  if (!ws) return;
  // Accent-Farbe pro Workspace
  document.documentElement.style.setProperty("--accent", ws.color || "#e6b450");
  // Workspace-Chip in Topbar
  const chip = byId("workspace-chip");
  if (chip) {
    chip.textContent = ws.label;
    chip.style.background = ws.color;
    chip.hidden = false;
  }
  // Modul-Sichtbarkeit (Sidebar + Bottom-Nav)
  const allowed = new Set(ws.enabledModules || []);
  ["settings","home"].forEach((v) => allowed.add(v));
  document.querySelectorAll(".sidebar .nav-item[data-view]").forEach((item) => {
    item.hidden = !allowed.has(item.dataset.view);
  });
  document.querySelectorAll(".bottom-nav-item[data-view]").forEach((item) => {
    item.hidden = !allowed.has(item.dataset.view);
  });
  // Falls aktive View nicht erlaubt → auf dashboard fallback
  if (currentView && !allowed.has(currentView) && currentView !== "settings" && currentView !== "home") {
    setView("dashboard");
  }
}

let state = applyWorkspaceLayer(loadState());
let currentView = "dashboard";

function mergeWithSeed(parsed) {
  const base = structuredClone(seedData);
  const pick = (key) => (Array.isArray(parsed[key]) ? parsed[key] : base[key]);
  return {
    ...base,
    ...parsed,
    systems: pick("systems"),
    accessItems: pick("accessItems"),
    tasks: pick("tasks"),
    briefings: pick("briefings"),
    meetings: pick("meetings"),
    jobRoles: pick("jobRoles"),
    jobAreas: pick("jobAreas"),
    playbooks: pick("playbooks"),
    knowledgeCards: pick("knowledgeCards"),
    stephanQuestions: pick("stephanQuestions"),
    levers: pick("levers"),
    baseline: (parsed.baseline && typeof parsed.baseline === "object") ? { ...base.baseline, ...parsed.baseline } : base.baseline,
    promises: pick("promises"),
    stephanMoods: pick("stephanMoods"),
    aiPromptLibrary: pick("aiPromptLibrary"),
    weeklyKpis: pick("weeklyKpis"),
    anomalies: pick("anomalies"),
    brands: pick("brands"),
    quickNotes: pick("quickNotes"),
    dailyBriefings: pick("dailyBriefings"),
    reminders: pick("reminders"),
    timeEntries: pick("timeEntries"),
    monthlyReports: pick("monthlyReports"),
    team: pick("team"),
    honorar: (parsed.honorar && typeof parsed.honorar === "object") ? { ...base.honorar, ...parsed.honorar } : base.honorar,
    seboConfig: (parsed.seboConfig && typeof parsed.seboConfig === "object") ? { ...base.seboConfig, ...parsed.seboConfig } : base.seboConfig,
    seboSnapshot: (parsed.seboSnapshot && typeof parsed.seboSnapshot === "object") ? { ...base.seboSnapshot, ...parsed.seboSnapshot } : base.seboSnapshot,
    viewUsage: (parsed.viewUsage && typeof parsed.viewUsage === "object") ? parsed.viewUsage : {},
    dashboardPrefs: (parsed.dashboardPrefs && typeof parsed.dashboardPrefs === "object") ? { ...base.dashboardPrefs, ...parsed.dashboardPrefs } : base.dashboardPrefs,
    risks: pick("risks"),
    decisionLog: pick("decisionLog"),
    vendors: pick("vendors"),
    hypotheses: pick("hypotheses"),
    wirkungen: pick("wirkungen"),
    preMortems: pick("preMortems"),
    saisonPlan: pick("saisonPlan"),
    verhandlungen: pick("verhandlungen"),
    captureInbox: pick("captureInbox"),
    messenArtikel: pick("messenArtikel"),
    saisonTracking: pick("saisonTracking"),
    lornaFeedback: pick("lornaFeedback"),
    careerVision: (parsed.careerVision && typeof parsed.careerVision === "object") ? { ...base.careerVision, ...parsed.careerVision } : base.careerVision,
    learnings: pick("learnings"),
    energyLog: pick("energyLog"),
    jahresRecaps: pick("jahresRecaps"),
    careerGoals: pick("careerGoals"),
    careerSkills: pick("careerSkills"),
    portfolioCases: pick("portfolioCases"),
    mentors: pick("mentors"),
    jtlTriggers: pick("jtlTriggers"),
    pitches: pick("pitches"),
    glossary: pick("glossary"),
    vorhernachher: pick("vorhernachher"),
    competitors: pick("competitors"),
    customerSegments: pick("customerSegments"),
    reactivationCampaigns: pick("reactivationCampaigns"),
    crossSellPairs: pick("crossSellPairs"),
    bundleIdeas: pick("bundleIdeas"),
    sortimentRules: pick("sortimentRules"),
    sortimentStats: (parsed.sortimentStats && typeof parsed.sortimentStats === "object") ? { ...base.sortimentStats, ...parsed.sortimentStats } : base.sortimentStats,
    vipArticles: pick("vipArticles"),
    stephanProfile: (parsed.stephanProfile && typeof parsed.stephanProfile === "object") ? { ...base.stephanProfile, ...parsed.stephanProfile } : base.stephanProfile
  };
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return structuredClone(seedData);
  try {
    return mergeWithSeed(JSON.parse(stored));
  } catch {
    return structuredClone(seedData);
  }
}

async function syncFromServer(force = false) {
  try {
    const response = await fetch("/api/state");
    if (!response.ok) return;
    const remote = await response.json();
    if (!remote || typeof remote !== "object" || !Object.keys(remote).length) return;
    const localUpdated = Number(state.updatedAt || 0);
    const remoteUpdated = Number(remote.updatedAt || 0);
    // Server-Disk-Stand merken (Basis für nächsten konfliktfreien Push)
    lastServerRevision = remoteUpdated;
    if (force || remoteUpdated > localUpdated) {
      state = applyWorkspaceLayer(mergeWithSeed(remote));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      applyWorkspaceUI();
      render();
    }
    // Stelle sicher, dass neue Seed-Felder im Server landen — auch wenn remote älter ist
    const seedKeys = ["brands", "customerSegments", "reactivationCampaigns", "crossSellPairs", "bundleIdeas", "sortimentRules", "vipArticles", "promises", "stephanProfile", "stephanMoods", "levers", "weeklyKpis", "anomalies", "aiPromptLibrary"];
    const missingInRemote = seedKeys.some((k) => !remote[k]);
    if (missingInRemote) saveState();
  } catch {
    /* Server unreachable — bleibe bei localStorage */
  }
}

let saveTimer = null;
let saveBusy = false;
// Optimistic-Concurrency (Audit-Finding #4): letzte bekannte Server-Revision
let lastServerRevision = Number((typeof state !== "undefined" && state.updatedAt) || 0);

function saveState() {
  state.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(pushToServer, 500);
}

const OFFLINE_QUEUE_KEY = "magaloko:offline-queue:v1";

function queuePendingSave() {
  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    queue.length = 0; // Nur die jeweils letzte Version
    queue.push({ ts: Date.now(), state: state });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

function clearPendingSave() {
  try { localStorage.removeItem(OFFLINE_QUEUE_KEY); } catch {}
}

function hasPendingSave() {
  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    return queue.length > 0;
  } catch { return false; }
}

const MAGALOKO_CLIENT_ID = Math.random().toString(36).slice(2, 10);

async function pushToServer() {
  if (saveBusy) {
    saveTimer = setTimeout(pushToServer, 500);
    return;
  }
  saveBusy = true;
  const pushedRevision = Number(state.updatedAt || 0);
  try {
    const response = await fetch("/api/state", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": MAGALOKO_CLIENT_ID,
        "X-Base-Updated-At": String(lastServerRevision)
      },
      body: JSON.stringify(state)
    });
    // Konflikt (anderes Gerät hat zwischenzeitlich gespeichert) — Audit-Finding #4
    if (response.status === 409) {
      saveBusy = false;
      await syncFromServer(true);
      showToast("⚠ Neuere Version von anderem Gerät geladen — bitte Änderung prüfen");
      return;
    }
    if (!response.ok) throw new Error("save failed");
    // Erfolg: Server hat jetzt unsere Revision
    lastServerRevision = pushedRevision;
    if (hasPendingSave()) {
      clearPendingSave();
      updateOfflineIndicator();
    }
  } catch {
    queuePendingSave();
    updateOfflineIndicator();
  } finally {
    saveBusy = false;
  }
}

async function flushOfflineQueue() {
  if (!hasPendingSave()) return;
  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    const last = queue[queue.length - 1];
    if (!last) return;
    const response = await fetch("/api/state", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": MAGALOKO_CLIENT_ID,
        // Sende die zuletzt bekannte Server-Revision als Basis (Audit-Finding #4 — Offline-Pfad)
        "X-Base-Updated-At": String(lastServerRevision)
      },
      body: JSON.stringify(last.state)
    });
    // Konflikt: anderes Gerät hat nach dem Offline-Gehen gespeichert → Serverdaten laden
    if (response.status === 409) {
      clearPendingSave();
      await syncFromServer(true);
      showToast("⚠ Neuere Version vom Server — Offline-Änderungen verworfen, bitte prüfen");
      updateOfflineIndicator();
      return;
    }
    if (response.ok) {
      clearPendingSave();
      updateOfflineIndicator();
      showToast("Offline-Änderungen synchronisiert");
    }
  } catch {}
}

function updateOfflineIndicator() {
  const banner = byId("offline-banner");
  if (!banner) return;
  const online = navigator.onLine;
  const pending = hasPendingSave();
  if (!online) {
    banner.hidden = false;
    banner.textContent = pending
      ? "Offline · Änderungen werden synchronisiert sobald du wieder online bist"
      : "Offline · letzter Stand wird angezeigt";
    banner.className = "offline-banner offline";
  } else if (pending) {
    banner.hidden = false;
    banner.textContent = "Synchronisiere ausstehende Änderungen …";
    banner.className = "offline-banner syncing";
  } else {
    banner.hidden = true;
  }
}

window.addEventListener("online", () => { updateOfflineIndicator(); flushOfflineQueue(); });
window.addEventListener("offline", updateOfflineIndicator);

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function byId(id) {
  return document.getElementById(id);
}

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

async function copyText(text, successMessage) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    showToast(successMessage);
  } catch {
    showToast("Kopieren im Browser blockiert");
  }
}

function statusPill(value, extraClass = "") {
  const className = `${value || ""}`.toLowerCase().replace(/\s+/g, "-");
  return `<span class="pill ${className} ${extraClass}">${value}</span>`;
}

function setView(view) {
  if (!byId(view)) view = "dashboard";
  currentView = view;
  // Nutzungs-Tracking (Buch Kap. 32)
  if (!state.viewUsage) state.viewUsage = {};
  if (!state.viewUsage[view]) state.viewUsage[view] = { count: 0, lastOpened: null, firstOpened: new Date().toISOString() };
  state.viewUsage[view].count += 1;
  state.viewUsage[view].lastOpened = new Date().toISOString();
  saveState();
  document.querySelectorAll(".view").forEach((el) => el.classList.toggle("active", el.id === view));
  document.querySelectorAll(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.view === view));
  byId("view-title").textContent = {
    dashboard: "Start",
    levers: "Hebel-Cockpit",
    systems: "Systeme",
    access: "Zugänge",
    roadmap: "Roadmap",
    week: "Wochenplan",
    anomalies: "Daten-Anomalie-Radar",
    daily: "Morgen-Briefing",
    briefing: "Briefing",
    meeting: "Gespräch",
    assistant: "Stephan-Assistent",
    aitools: "KI-Tools",
    purchase: "Einkaufsplaner",
    brands: "Marken-Scorecard (BCG)",
    champions: "Champions & Reaktivierung",
    crosssell: "Cross-Selling-Engine",
    sortiment: "Sortimentsbereinigung",
    vip: "VIP-Artikel-Wächter",
    sebo: "SeBo-Bridge",
    risks: "Risk-Radar",
    decisions: "Decision-Log",
    vendors: "Dienstleister",
    pitches: "Pitch-Builder",
    glossary: "Glossar",
    beforeafter: "Vorher / Nachher",
    competitors: "Wettbewerbs-Radar",
    hypotheses: "Hypothesen-Tracking",
    premortems: "Pre-Mortems",
    wirkungen: "Wirkungsnachweis",
    saisonplan: "Saison-Vorausplanung",
    verhandlungen: "Lieferanten-Verhandlungen",
    capture: "Capture-Inbox",
    triggers: "Trigger-Watcher",
    career: "Karriere-Strategie",
    portfolio: "Portfolio-Builder",
    mentors: "Mentor-Library",
    learnings: "Lese-Tracker",
    energy: "Energie & Fokus",
    graph: "Knowledge-Graph",
    recap: "Jahres-Recap",
    usage: "Nutzungs-Audit",
    audit: "Audit-Log",
    time: "Time-Tracking",
    monthly: "Monatsbericht",
    team: "Team",
    honorar: "Honorar",
    jobs: "Jobs & Aufgaben",
    knowledge: "Wissen",
    today: "Heute (Playbook)",
    calendar: "Kalender",
    settings: "Einstellungen",
    home: "Projekt wählen",
    "orders-intake": "Bestellung aufnehmen",
    marktanalyse: "Marktanalyse HFK 2026",
    akademie: "Verkaufs-Akademie",
    lernsystem: "Lernsystem 2026",
    "stephan-kalender": "Stephans Tag (PA)",
    "stephan-decisions": "Decision-Pipeline (PA)",
    "team-notizen": "Team-Notizen",
    "produkt-lookup": "Produkt-Lookup (JTL-Live)",
    "kunden-lookup": "Kunden-Lookup (JTL-Live)",
    "abc-uebersicht": "ABC-Übersicht",
    "lieferant-check": "Lieferanten-Bestand-Check",
    "kunden-detail": "Kunden-Detail",
    "ma-validation": "Marktanalyse-Validierung"
  }[view];
  if (location.hash !== `#${view}`) {
    history.replaceState(null, "", `#${view}`);
  }
  document.querySelectorAll(".bottom-nav-item[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view);
  });
  render();
  if (view === "daily") autoTriggerDailyIfMissing();
  if (view === "audit") loadAudit().then(renderAudit);
}

// OneSource-Phasen aus dem MAGO_OneSource_Konzept.md
const oneSourcePhases = [
  { id: "p1", label: "Phase 1 · ETL", weeks: "W1 (23-29.5)", start: "2026-05-23", end: "2026-05-29", deliverable: "JTL→Postgres ETL live (mit Markus)", owners: "Markus + Mago", promiseId: "pr-os1" },
  { id: "p2a", label: "Phase 2a · ETL-QA", weeks: "W2 (30.5-5.6)", start: "2026-05-30", end: "2026-06-05", deliverable: "Bernie validiert vs JTL-Rohexport + Metabase-Setup", owners: "Bernie + Mago", promiseId: "pr-os2" },
  { id: "p2b", label: "Phase 2b · Metabase", weeks: "W3 (6-12.6)", start: "2026-06-06", end: "2026-06-12", deliverable: "4 Dashboards live: Finance · Inventory · Sales · Procurement", owners: "Mago", promiseId: "pr-os3" },
  { id: "p3", label: "Phase 3 · Einkaufsplaner", weeks: "W4-6 (13-26.6)", start: "2026-06-13", end: "2026-06-26", deliverable: "Modul 1 Messen + Modul 2 Saison als React-Tool für Lorna+Beate", owners: "Mago + Lorna (Testing)", promiseId: "pr-os4" },
  { id: "p4a", label: "Phase 4a · ABC-Tool", weeks: "W7-8 (27.6-31.7)", start: "2026-06-27", end: "2026-07-31", deliverable: "ABC-Klassifizierung + Scenario-Refinement mit Beate", owners: "Mago + Beate", promiseId: "pr-os5" },
  { id: "p4b", label: "Phase 4b · Optimization", weeks: "W9-13 (1-31.8)", start: "2026-08-01", end: "2026-08-31", deliverable: "Netstock-Entscheidung neu + Vision-Scoring Ausbaustufe 2 geplant", owners: "alle", promiseId: "pr-os6" }
];

function currentOneSourcePhase() {
  const today = new Date().toISOString().slice(0, 10);
  return oneSourcePhases.find((p) => today >= p.start && today <= p.end) || (today > oneSourcePhases[oneSourcePhases.length - 1].end ? oneSourcePhases[oneSourcePhases.length - 1] : oneSourcePhases[0]);
}

function renderStephanAnker() {
  const el = byId("stephan-anker");
  if (!el) return;

  const today = new Date().toISOString().slice(0, 10);
  const todayMs = Date.now();
  const projectStart = new Date("2026-05-23").getTime();
  const projectEnd = new Date("2026-08-31").getTime();
  const projectDays = Math.round((projectEnd - projectStart) / 86400000);
  const daysSince = Math.max(0, Math.floor((todayMs - projectStart) / 86400000));
  const progressPct = Math.min(daysSince / projectDays * 100, 100).toFixed(0);

  const active = currentOneSourcePhase();

  // Status jeder Phase aus Promises
  const phaseStatus = oneSourcePhases.map((ph) => {
    const promise = (state.promises || []).find((p) => p.id === ph.promiseId);
    const status = promise?.status || "offen";
    const overdue = ph.end < today && status !== "eingelöst";
    const done = status === "eingelöst";
    const isActive = ph.id === active.id;
    const daysLeft = Math.ceil((new Date(ph.end).getTime() - todayMs) / 86400000);
    return { ...ph, status, overdue, done, isActive, daysLeft };
  });

  const openCount = phaseStatus.filter((s) => !s.done).length;
  const overdueCount = phaseStatus.filter((s) => s.overdue).length;

  el.innerHTML = `
    <div class="anker-header">
      <div class="anker-title">
        <span class="anker-badge">Stephan-Anker · OneSource</span>
        <h2>${escapeHtml(active.label)} läuft — ${escapeHtml(active.deliverable)}</h2>
        <p class="muted">JTL → Postgres → Metabase → React-Tools (Einkaufsplaner + ABC). Deadline gesamt: 31.08.2026. Stephan-Konzept aus MAGO_OneSource_Konzept.md.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
        <button class="button" id="anker-generate-pilot" type="button">📋 OneSource-Status-Briefing</button>
        <button class="button small" data-jump="purchase">→ Einkaufsplaner</button>
      </div>
    </div>

    <div class="anker-pilot-progress">
      <div class="anker-progress-row">
        <span class="muted">OneSource-Setup gesamt (Mai → August)</span>
        <strong>Tag ${daysSince} von ${projectDays}</strong>
      </div>
      <div class="career-progress"><div class="career-progress-fill ${progressPct > 70 && openCount > 1 ? "warn" : ""}" style="width:${progressPct}%"></div></div>
    </div>

    <div class="anker-phases">
      ${phaseStatus.map((ph) => `
        <article class="anker-phase ${ph.done ? "done" : ph.overdue ? "overdue" : ph.isActive ? "active" : ""}">
          <div class="anker-phase-head">
            <strong>${ph.done ? "✓" : ph.overdue ? "▲" : ph.isActive ? "▶" : "○"} ${escapeHtml(ph.label)}</strong>
            <span class="muted">${escapeHtml(ph.weeks)}</span>
          </div>
          <span class="muted">${escapeHtml(ph.deliverable)}</span>
          <span class="muted"><strong>Owner:</strong> ${escapeHtml(ph.owners)} · Status: ${escapeHtml(ph.status)}${ph.daysLeft >= 0 && !ph.done && ph.isActive ? ` · noch ${ph.daysLeft} Tage` : ""}${ph.overdue ? ` · <strong style="color:var(--red)">überfällig</strong>` : ""}</span>
        </article>
      `).join("")}
    </div>

    <div class="anker-cta">
      <span class="anker-cta-text">${openCount} Phasen offen${overdueCount ? `, ${overdueCount} überfällig` : ""}. Aktive Phase: <strong>${escapeHtml(active.label)}</strong>.</span>
      <button class="button small" data-jump="meeting">Versprechen-Tracker →</button>
      <button class="button small" data-jump="purchase">Einkaufsplaner →</button>
      <button class="button small" data-jump="briefing">Status-Briefing →</button>
    </div>
  `;

  byId("anker-generate-pilot")?.addEventListener("click", openStephanPilotBriefing);
  el.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.jump)));
}

// OneSource-Status-Briefing — konkretes Stephan-Update zum echten Auftrag
function openStephanPilotBriefing() {
  setView("briefing");
  const form = byId("briefing-form");
  if (!form) return;

  const today = new Date().toISOString().slice(0, 10);
  const active = currentOneSourcePhase();
  const phaseStatus = oneSourcePhases.map((ph) => {
    const promise = (state.promises || []).find((p) => p.id === ph.promiseId);
    return { ph, status: promise?.status || "offen", done: promise?.status === "eingelöst", overdue: ph.end < today && promise?.status !== "eingelöst" };
  });
  const openPhases = phaseStatus.filter((s) => !s.done);
  const overduePhases = phaseStatus.filter((s) => s.overdue);

  form.elements.title.value = `OneSource-Status — ${active.label} läuft`;
  form.elements.problem.value = [
    `Stand ${today}: OneSource-Setup (JTL → Postgres → Metabase → React-Tools) ist Tag ${Math.floor((Date.now() - new Date("2026-05-23").getTime()) / 86400000)} von ${Math.round((new Date("2026-08-31") - new Date("2026-05-23")) / 86400000)} (Deadline 31.08.2026).`,
    `Aktuelle Phase: ${active.label} — ${active.deliverable}. Owner: ${active.owners}.`,
    overduePhases.length ? `▲ ${overduePhases.length} Phase(n) überfällig: ${overduePhases.map((s) => s.ph.label).join(", ")}` : `Alle Phasen im Zeitplan.`
  ].join("\n");

  form.elements.dataSituation.value = [
    `**OneSource-Phasen-Status:**`,
    ...phaseStatus.map((s) => `- ${s.done ? "✓" : s.overdue ? "▲" : s.ph.id === active.id ? "▶" : "○"} ${s.ph.label} (${s.ph.weeks}): ${s.status}`),
    ``,
    `**Tech-Stack (aus dem Konzept):** Postgres (Supabase/Railway) · Metabase · React+Tailwind · Claude API`,
    `**Team-Setup:** Markus (ETL, ab Juli FT) · Bernie (Data QA, remote) · Beate (Buyer, Requirement Owner) · Lorna (End-User, Türkei UTC+3) · Adnan (Inventur)`,
    ``,
    `**HFK-Echtdaten als Grundlage:** €2,5M Umsatz (FN 392350 v) · VK-2025 mit 11.154 Zeilen netto €3,01M (Bernie hat exportiert) · 15-Jahres-JTL-Historie verfügbar.`
  ].join("\n");

  form.elements.recommendation.value = [
    `**${active.label} (jetzt):** ${active.deliverable}`,
    `Owner: ${active.owners} · Deadline: ${active.end}`,
    ``,
    `**Nächste Phasen in Reihenfolge:**`,
    ...phaseStatus.filter((s) => !s.done && s.ph.id !== active.id).slice(0, 3).map((s) => `- ${s.ph.label} (${s.ph.weeks}): ${s.ph.deliverable} → ${s.ph.owners}`),
    ``,
    `**Einkaufsplaner ist Hauptlieferung (W4-6):** Modul 1 (Messen-Einkauf mit Größen-Mix aus LYSS + Farben-Top-5 + Tausch-Optionen + CSV-Export für Beate) und Modul 2 (Saison-Tracking mit Weekly-LYSS-Vergleich + Penner-Radar W8+ + Markdown-Planer + wöchentlicher Lorna-Input).`,
    ``,
    `**Ausbaustufe 2 (Sept+):** Vision-Scoring — Foto auf der Messe → Claude Vision + Postgres-Historik → Verkaufs-Wahrscheinlichkeits-Score. Reduziert Bauchgefühl-Fehler.`
  ].join("\n");

  form.elements.decisionNeeded.value = [
    `1. **Postgres-Hosting:** Supabase (~€25/Mo, einfach) oder Railway (€5-20)? Bitte du oder Markus entscheiden.`,
    `2. **ETL-Stack:** Python (Pandas) oder Node.js (besser für JTL)? Markus-Präferenz?`,
    `3. **Metabase:** Self-hosted auf Railway (€5-10) oder Metabase Cloud (€25+)?`,
    `4. **Bernie-Zugriff:** Wann macht Bernie die ETL-QA gegen JTL-Rohexport? Slot mit ihm fix machen.`,
    `5. **Lorna-Test-Slot:** 3-Wochen-Feedback-Loop vor Go-Live — wann starten wir? Vor oder nach Beates Messe-Einsatz?`,
    `6. **Scenario-Speicherung:** Einkaufsplaner-Szenarien persistent in Postgres oder nur Session?`
  ].join("\n");

  form.elements.nextStep.value = [
    `1. **Diese Woche:** ETL-Job-Sketch von Markus + Postgres-Account anlegen (Supabase oder Railway entschieden).`,
    `2. **W2:** Bernie-Termin für ETL-QA fixen.`,
    `3. **W3:** Erste Metabase-Instanz hochziehen + 1 Dashboard-Prototyp (Finance KPIs).`,
    `4. **W4-6:** Einkaufsplaner-MVP für die Messen-Saison-Übergangsphase 2026 bereit.`,
    `5. **Briefing-Rhythmus:** Wochenupdate jeden Freitag 16:00 (kurz, max 1 Seite Markdown).`
  ].join("\n");

  renderBriefing();
  showToast("OneSource-Status-Briefing geladen — review + speichern + an Stephan senden");
}

function renderDashboard() {
  renderStephanAnker();
  // === Mini-Strip füllen (kompakt, 8 Mikro-Stats in einer Zeile) ===
  renderMiniStrip();
  // === Klassische Berechnungen für Hero / Listen ===
  const openTasks = state.tasks.filter((t) => t.status !== "Erledigt");
  const highPriority = openTasks.filter((t) => t.priority === "hoch");
  const blockedAccess = state.accessItems.filter((i) => i.status !== "geprüft" && i.status !== "vorhanden");
  const today = new Date().toISOString().slice(0, 10);
  const openPromises = (state.promises || []).filter((p) => p.status === "offen" || p.status === "in Arbeit");
  const overduePromises = openPromises.filter((p) => p.dueDate && p.dueDate < today);
  const topLevers = (state.levers || []).filter((l) => l.status !== "Live" && l.status !== "Verworfen").slice().sort((a, b) => leverScore(b) - leverScore(a))[0];
  const openAnomalies = (state.anomalies || []).filter((a) => a.status !== "geklärt" && a.status !== "verworfen").length;

  // === Hero-Focus: die EINE Sache die heute zählt (preattentive single highlight) ===
  const heroEl = byId("hero-focus");
  if (heroEl) {
    let heroPrimary = null;
    let heroSecondary = "";
    let heroVariant = "ok";
    let heroLink = null;
    let heroIcon = "✓";

    if (overduePromises.length) {
      heroVariant = "danger"; heroIcon = "▲";
      heroPrimary = `${overduePromises.length} überfälliges Versprechen${overduePromises.length === 1 ? "" : "n"}`;
      heroSecondary = `Top: "${overduePromises[0].what}" (fällig war ${overduePromises[0].dueDate})`;
      heroLink = { view: "meeting", label: "Versprechen ansehen →" };
    } else if ((state.seboSnapshot?.totals?.ticketsEscalated || 0) > 5) {
      heroVariant = "danger"; heroIcon = "▲";
      heroPrimary = `${state.seboSnapshot.totals.ticketsEscalated} eskalierte SeBo-Tickets`;
      heroSecondary = "Sofort in SeBo schauen — Eskalationen brennen.";
      heroLink = { view: "sebo", label: "SeBo-Bridge öffnen →" };
    } else if (openAnomalies) {
      heroVariant = "warn"; heroIcon = "●";
      heroPrimary = `${openAnomalies} ungeklärte Daten-Anomalie${openAnomalies === 1 ? "" : "n"}`;
      heroSecondary = "Hypothesen prüfen, bevor du falsche Entscheidungen triffst.";
      heroLink = { view: "anomalies", label: "Anomalien-Radar →" };
    } else {
      const topRisk = (state.risks || []).slice().sort((a, b) => riskScore(b) - riskScore(a)).find((r) => r.status !== "gemindert" && r.status !== "irrelevant");
      if (topRisk && riskScore(topRisk) >= 16) {
        heroVariant = "warn"; heroIcon = "▲";
        heroPrimary = `Top-Risiko: ${topRisk.title}`;
        heroSecondary = `Score ${riskScore(topRisk)} (L${topRisk.likelihood} × I${topRisk.impact}) · ${topRisk.signals?.slice(0, 80) || ""}`;
        heroLink = { view: "risks", label: "Risk-Radar →" };
      }
    }
    if (!heroPrimary && topLevers) {
      heroVariant = "focus"; heroIcon = "⚡";
      heroPrimary = topLevers.title;
      heroSecondary = `Top-Hebel: ${formatEur(topLevers.expectedImpactEur)}/Jahr bei ${topLevers.effortHours}h Aufwand · Score ${formatEur(leverScore(topLevers))}/h`;
      heroLink = { view: "levers", label: "Hebel-Cockpit →" };
    }
    if (!heroPrimary) {
      heroVariant = "ok"; heroIcon = "✓";
      heroPrimary = "Alles im Plan";
      heroSecondary = "Keine überfälligen Versprechen, keine Anomalien, keine kritischen Eskalationen.";
    }

    heroEl.className = `hero-focus hero-${heroVariant}`;
    heroEl.innerHTML = `
      <div class="hero-icon">${heroIcon}</div>
      <div class="hero-text">
        <span class="hero-eyebrow">Heute zuerst</span>
        <h2>${escapeHtml(heroPrimary)}</h2>
        <p>${escapeHtml(heroSecondary)}</p>
      </div>
      ${heroLink ? `<button class="hero-cta" data-hero-jump="${heroLink.view}">${escapeHtml(heroLink.label)}</button>` : ""}
    `;
    heroEl.querySelector("[data-hero-jump]")?.addEventListener("click", (e) => setView(e.currentTarget.dataset.heroJump));
  }

  // === Metric-Grid mit Sparklines + Trend-Indikatoren ===
  const promiseTrend = buildPromiseTrend();
  const taskTrend = buildTaskTrend();
  const promiseDelta = promiseTrend[promiseTrend.length - 1] - promiseTrend[0];
  const seboEscalated = state.seboSnapshot?.totals?.ticketsEscalated || 0;

  // === Metric-Grid wird nicht mehr verwendet (Compact-Layout nutzt mini-strip) ===

  const important = openTasks
    .slice()
    .sort((a, b) => {
      const prioRank = { hoch: 0, mittel: 1, niedrig: 2 };
      const pr = (prioRank[a.priority] ?? 3) - (prioRank[b.priority] ?? 3);
      if (pr !== 0) return pr;
      return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
    })
    .slice(0, 4);

  // === Konsolidierte "Heute zu tun"-Liste: Versprechen + Aufgaben + heute fällige Termine ===
  const todayItems = [];
  overduePromises.slice(0, 4).forEach((p) => todayItems.push({
    icon: "🤝", title: p.what, sub: `Versprechen · ${p.context || "—"} · fällig ${p.dueDate}`,
    pill: "kritisch", pillText: "überfällig", view: "meeting", sortKey: 0
  }));
  const promisesTodayDue = openPromises.filter((p) => p.dueDate === today && !overduePromises.includes(p));
  promisesTodayDue.slice(0, 3).forEach((p) => todayItems.push({
    icon: "🤝", title: p.what, sub: `Versprechen · heute fällig`,
    pill: "angefragt", pillText: "heute", view: "meeting", sortKey: 1
  }));
  important.slice(0, 5).forEach((t) => {
    const overdueTask = t.dueDate && t.dueDate < today;
    todayItems.push({
      icon: t.priority === "hoch" ? "🔴" : "📋", title: t.title, sub: `${t.area} · ${t.status} · bis ${t.dueDate || "offen"}`,
      pill: overdueTask ? "kritisch" : t.priority, pillText: overdueTask ? "überfällig" : t.priority, view: "roadmap",
      sortKey: overdueTask ? 0 : 2
    });
  });
  const todayMeetings = (state.meetings || []).filter((m) => m.date === today);
  todayMeetings.forEach((m) => todayItems.push({
    icon: "📅", title: `${m.type}: ${m.goal?.slice(0, 60) || ""}`, sub: `heute · Gespräch`,
    pill: "entscheidung", pillText: "Termin", view: "meeting", sortKey: 1
  }));
  todayItems.sort((a, b) => a.sortKey - b.sortKey);

  const todayMetaEl = byId("today-meta");
  if (todayMetaEl) todayMetaEl.textContent = todayItems.length ? `${todayItems.length} Punkte` : "alles klar";

  byId("today-list").innerHTML = todayItems.length
    ? todayItems.slice(0, 10).map((i) => `
        <article class="task-item compact" data-today-jump="${i.view}">
          <div class="item-line">
            <strong><span class="today-icon">${i.icon}</span> ${escapeHtml(i.title)}</strong>
            <span class="pill ${i.pill}">${escapeHtml(i.pillText)}</span>
          </div>
          <span class="muted">${escapeHtml(i.sub)}</span>
        </article>`).join("")
    : '<p class="muted">✓ Heute nichts überfällig, kein Termin, keine hoch-priore Aufgabe. Frei für Hebel.</p>';

  document.querySelectorAll("[data-today-jump]").forEach((el) => {
    el.addEventListener("click", () => setView(el.dataset.todayJump));
  });

  const decisionTasks = openTasks
    .filter((t) => /entscheid|freigabe|klär|zusage/i.test(t.title + " " + (t.notes || "")))
    .slice(0, 3);

  const decisions = decisionTasks.length
    ? decisionTasks.map((t) => ({
        title: t.title,
        text: t.notes || `${t.area} · bis ${t.dueDate || "offen"}`
      }))
    : [
        { title: "Support-Start freigeben", text: "All-inkl, N8N und SeBo für service@herrundfrauklein.com priorisieren." },
        { title: "JTL-Zugriff klären", text: "Read-only Export/SQL als Startpunkt für Datenarbeit festlegen." },
        { title: "30-Tage-Pilot zusagen", text: "Support-Cockpit, Zugangssetup und erstes Wochenreporting liefern." }
      ];

  byId("decision-list").innerHTML = decisions
    .map((item) => `<article class="decision-item"><div class="item-line"><strong>${escapeHtml(item.title)}</strong>${statusPill("Entscheidung", "entscheidung")}</div><span class="muted">${escapeHtml(item.text)}</span></article>`)
    .join("");

  const criticalAccess = state.accessItems
    .filter((item) => item.priority === "hoch" && item.status !== "geprüft")
    .slice(0, 4);

  byId("critical-access").innerHTML = criticalAccess.length
    ? criticalAccess.map((item) => {
        const system = state.systems.find((candidate) => candidate.id === item.systemId);
        return `<article class="compact-item"><div class="item-line"><strong>${escapeHtml(system?.name || item.systemId)}</strong>${statusPill(item.status)}</div><span class="muted">${escapeHtml(item.accessType)} · ${escapeHtml(item.neededFor)}</span></article>`;
      }).join("")
    : '<p class="muted">Keine kritischen Zugänge offen.</p>';

  // === NEUE Dashboard-Boxen (Compact-Layout) ===
  renderDashboardStephanSummary(openPromises, overduePromises);
  renderDashboardCritical();
  renderDashboardLevers();
  renderDashboardNumbers();

  // Smart Reminders
  const reminders = computeSmartReminders();
  byId("reminders-count").textContent = reminders.length ? `${reminders.length} aktiv` : "alles ruhig";
  byId("reminders-list").innerHTML = reminders.length
    ? reminders.slice(0, 6).map((r) => `<article class="reminder-item reminder-${r.priority}">
        <div class="item-line">
          <span><strong>${escapeHtml(r.text)}</strong></span>
          <button class="button small" data-reminder-jump="${r.view}">→</button>
        </div>
      </article>`).join("")
    : '<p class="muted">Keine offenen Erinnerungen. Sauberer Stand.</p>';
  document.querySelectorAll("[data-reminder-jump]").forEach((b) => {
    b.addEventListener("click", () => setView(b.dataset.reminderJump));
  });

  // VIP-Bestandsrisiko
  const vipAtRisk = (state.vipArticles || [])
    .map((v) => ({ ...v, status: vipComputedStatus(v) }))
    .filter((v) => v.status === "kritisch" || v.status === "warnung")
    .sort((a, b) => {
      const order = { kritisch: 0, warnung: 1 };
      const so = (order[a.status] ?? 3) - (order[b.status] ?? 3);
      if (so !== 0) return so;
      return (b.revenueYear || 0) - (a.revenueYear || 0);
    })
    .slice(0, 4);

  byId("dashboard-vip").innerHTML = vipAtRisk.length
    ? vipAtRisk.map((v) => {
        const ratio = (v.targetStock && v.currentStock) ? (v.currentStock / v.targetStock * 100).toFixed(0) : "?";
        return `<article class="compact-item">
          <div class="item-line"><strong>${escapeHtml(v.name)}</strong><span class="pill ${v.status === "kritisch" ? "kritisch" : "mittel"}">${escapeHtml(v.status)}</span></div>
          <span class="muted">${v.currentStock || 0}/${v.targetStock || "—"} (${ratio}%) · ${formatEur(v.revenueYear)}/Jahr · LT ${v.leadTimeDays}T</span>
        </article>`;
      }).join("")
    : '<p class="muted">Alle VIP-Artikel im grünen Bereich.</p>';

  // Cross-Selling Quickwins: bestseller pairs noch nicht als Bundle live
  const quickwins = (state.crossSellPairs || [])
    .filter((p) => p.status !== "Bundle live" && p.status !== "Verworfen")
    .sort((a, b) => (b.coOccurrences || 0) - (a.coOccurrences || 0))
    .slice(0, 4);

  byId("dashboard-crosssell").innerHTML = quickwins.length
    ? quickwins.map((p) => `<article class="compact-item">
        <div class="item-line"><strong>${escapeHtml(p.productA)} + ${escapeHtml(p.productB)}</strong><span class="pill bereit">${p.coOccurrences.toLocaleString("de-DE")}×</span></div>
        <span class="muted">${escapeHtml(p.status)} · ${escapeHtml(p.action || "")}</span>
      </article>`).join("")
    : '<p class="muted">Alle Top-Pärchen bereits als Bundle live.</p>';

  // Personalisierung anwenden
  setTimeout(applyDashboardPrefs, 0);

  const meeting = state.meetings[0];
  byId("next-meeting").innerHTML = meeting
    ? `<strong>${escapeHtml(meeting.type)} · ${meeting.date || "ohne Datum"}</strong><p>${escapeHtml(meeting.goal)}</p><span class="muted">${escapeHtml(meeting.talkingPoints || "")}</span>`
    : "Noch kein Gespräch gespeichert.";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

// === Mini-Strip: 8 Mikro-Metriken in einer Zeile ===
function renderMiniStrip() {
  const strip = byId("mini-strip");
  if (!strip) return;
  const today = new Date().toISOString().slice(0, 10);
  const openPromises = (state.promises || []).filter((p) => p.status === "offen" || p.status === "in Arbeit");
  const overdue = openPromises.filter((p) => p.dueDate && p.dueDate < today);
  const openTasks = (state.tasks || []).filter((t) => t.status !== "Erledigt");
  const openAnomalies = (state.anomalies || []).filter((a) => a.status !== "geklärt" && a.status !== "verworfen").length;
  const seboT = state.seboSnapshot?.totals || {};
  const escalated = seboT.ticketsEscalated || 0;
  const topLever = (state.levers || []).filter((l) => l.status !== "Live" && l.status !== "Verworfen").sort((a, b) => leverScore(b) - leverScore(a))[0];
  const criticalVip = (state.vipArticles || []).filter((v) => vipComputedStatus(v) === "kritisch").length;
  const topRiskScore = Math.max(...((state.risks || []).filter((r) => r.status !== "gemindert" && r.status !== "irrelevant").map((r) => (r.likelihood || 0) * (r.impact || 0))), 0);
  const lastMood = (state.stephanMoods || [])[0]?.mood || "—";

  const mini = (label, value, sub, tone) => `<div class="mini-stat tone-${tone || "neutral"}" title="${escapeHtml(sub || "")}">
    <span class="mini-label">${escapeHtml(label)}</span>
    <strong>${value}</strong>
    ${sub ? `<em>${escapeHtml(sub)}</em>` : ""}
  </div>`;

  strip.innerHTML = `
    ${mini("Versprechen", openPromises.length, overdue.length ? `▲ ${overdue.length} überfällig` : "ok", overdue.length ? "bad" : "ok")}
    ${mini("Aufgaben", openTasks.length, openTasks.filter((t) => t.priority === "hoch").length + " hoch", openTasks.filter((t) => t.priority === "hoch").length ? "warn" : "ok")}
    ${mini("Anomalien", openAnomalies, openAnomalies ? "ungeklärt" : "geklärt", openAnomalies ? "bad" : "ok")}
    ${mini("SeBo eskaliert", escalated, escalated > 5 ? "brennt" : "ok", escalated > 5 ? "bad" : escalated > 0 ? "warn" : "ok")}
    ${mini("VIP kritisch", criticalVip, criticalVip ? "Bestand prüfen" : "im Plan", criticalVip ? "bad" : "ok")}
    ${mini("Top-Risiko", topRiskScore || "—", topRiskScore >= 16 ? "kritisch" : topRiskScore >= 9 ? "hoch" : "ok", topRiskScore >= 16 ? "bad" : topRiskScore >= 9 ? "warn" : "ok")}
    ${mini("Top-Hebel €/h", topLever ? formatEur(leverScore(topLever)).replace("€", "") : "—", topLever ? topLever.title.slice(0, 18) : "keine", "good")}
    ${mini("Stephan-Mood", lastMood, (state.stephanMoods || []).length + " Einträge", "neutral")}
  `;
}

function renderDashboardStephanSummary(openPromises, overduePromises) {
  const el = byId("stephan-summary");
  if (!el) return;
  const profile = state.stephanProfile || {};
  const recentMood = (state.stephanMoods || [])[0];
  const nextMeeting = (state.meetings || []).sort((a, b) => (a.date || "").localeCompare(b.date || ""))[0];
  const reviewDue = (state.decisionLog || []).filter((d) => d.reviewAt && d.reviewAt <= new Date().toISOString().slice(0, 10) && !d.outcome).length;

  el.innerHTML = `
    <div class="stephan-summary-grid">
      <div class="stephan-line">
        <span class="muted">Mood</span>
        <strong>${recentMood ? recentMood.mood + ' ' + escapeHtml((recentMood.note || "").slice(0, 30)) : "— kein Eintrag"}</strong>
      </div>
      <div class="stephan-line">
        <span class="muted">Versprechen</span>
        <strong>${openPromises.length} offen · ${overduePromises.length ? `<span class="text-red">▲ ${overduePromises.length} überfällig</span>` : "✓"}</strong>
      </div>
      <div class="stephan-line">
        <span class="muted">Decision-Review</span>
        <strong>${reviewDue ? `<span class="text-red">▲ ${reviewDue} fällig</span>` : "✓ alle aktuell"}</strong>
      </div>
      <div class="stephan-line">
        <span class="muted">Triggert</span>
        <strong>${escapeHtml((profile.triggers || "—").slice(0, 60))}</strong>
      </div>
      <div class="stephan-line">
        <span class="muted">Beruhigt</span>
        <strong>${escapeHtml((profile.calmers || "—").slice(0, 60))}</strong>
      </div>
      ${nextMeeting ? `<div class="stephan-line">
        <span class="muted">Nächster Termin</span>
        <strong>${escapeHtml(nextMeeting.type)} · ${nextMeeting.date || "ohne Datum"}</strong>
      </div>` : ""}
    </div>
    <div class="stephan-summary-actions">
      <button class="button small" data-jump="meeting" type="button">Gespräch →</button>
      <button class="button small" data-jump="assistant" type="button">Drill →</button>
      <button class="button small" data-jump="briefing" type="button">Briefing →</button>
    </div>`;

  el.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.jump)));
}

function renderDashboardCritical() {
  const el = byId("dashboard-critical");
  if (!el) return;
  const today = new Date().toISOString().slice(0, 10);
  const items = [];
  const vipCrit = (state.vipArticles || []).map((v) => ({ ...v, _status: vipComputedStatus(v) })).filter((v) => v._status === "kritisch");
  vipCrit.slice(0, 2).forEach((v) => items.push({
    icon: "★", title: v.name.slice(0, 38),
    sub: `VIP · ${v.currentStock || 0}/${v.targetStock} · ${formatEur(v.revenueYear)}/J`,
    pillClass: "kritisch", pillText: "OOS-Risiko", view: "vip"
  }));
  const topRisks = (state.risks || []).filter((r) => r.status !== "gemindert" && r.status !== "irrelevant" && ((r.likelihood || 0) * (r.impact || 0)) >= 16);
  topRisks.slice(0, 2).forEach((r) => items.push({
    icon: "▲", title: r.title.slice(0, 50),
    sub: `Risiko · Score ${(r.likelihood || 0) * (r.impact || 0)} · ${r.category}`,
    pillClass: "kritisch", pillText: r.status, view: "risks"
  }));
  const overdueAccess = (state.accessItems || []).filter((a) => a.priority === "hoch" && a.status !== "geprüft" && a.status !== "vorhanden");
  overdueAccess.slice(0, 2).forEach((a) => {
    const sys = state.systems.find((s) => s.id === a.systemId);
    items.push({
      icon: "⚷", title: `${sys?.name || a.systemId}: ${a.accessType}`,
      sub: `Zugang · ${a.neededFor}`,
      pillClass: "angefragt", pillText: a.status, view: "access"
    });
  });

  el.innerHTML = items.length ? items.map((i) => `
    <article class="compact-item" data-jump="${i.view}">
      <div class="item-line"><strong><span class="today-icon">${i.icon}</span> ${escapeHtml(i.title)}</strong><span class="pill ${i.pillClass}">${escapeHtml(i.pillText)}</span></div>
      <span class="muted">${escapeHtml(i.sub)}</span>
    </article>`).join("") : '<p class="muted">✓ Nichts kritisch.</p>';

  el.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.jump)));
}

function renderDashboardLevers() {
  const el = byId("dashboard-levers");
  if (!el) return;
  const top3 = (state.levers || []).filter((l) => l.status !== "Live" && l.status !== "Verworfen").sort((a, b) => leverScore(b) - leverScore(a)).slice(0, 3);
  const monthRev = state.seboSnapshot?.yearlyRevenue?.[0]?.revenue || 0;
  el.innerHTML = top3.length ? `
    ${top3.map((l, i) => `<article class="compact-item">
      <div class="item-line"><strong>#${i + 1} ${injectJargonHints(escapeHtml(l.title.slice(0, 38)))}</strong><span class="pill bereit">${formatEur(leverScore(l))}/h</span></div>
      <span class="muted">${formatEur(l.expectedImpactEur)}/Jahr · ${l.effortHours}h · ${escapeHtml(l.status)}</span>
    </article>`).join("")}
    <div class="dashboard-summary-row muted">
      ${monthRev ? `Letztes Jahr: <strong>${formatEur(monthRev)}</strong>` : ""}
    </div>
  ` : '<p class="muted">Keine offenen Hebel.</p>';
}

function renderDashboardNumbers() {
  const el = byId("dashboard-numbers");
  if (!el) return;
  const t = state.seboSnapshot?.totals || {};
  const yearly = state.seboSnapshot?.yearlyRevenue || [];
  const currentYear = yearly[0];
  const lastYear = yearly[1];
  const numbers = [
    { label: "Umsatz 15J", value: t.revenue15y ? formatEur(t.revenue15y).replace(/,\d+\s/, " ") : "—" },
    { label: "Kunden", value: t.customersTotal ? t.customersTotal.toLocaleString("de-DE") : "—" },
    { label: "AOV", value: t.avgOrderValue ? formatEur(t.avgOrderValue) : "—" },
    { label: "Marge", value: t.grossMarginPct !== undefined ? `${t.grossMarginPct >= 0 ? "+" : ""}${t.grossMarginPct}%` : "—", tone: t.grossMarginPct < 0 ? "bad" : "ok" },
    { label: "Newsletter", value: t.newsletterSubscribers ? t.newsletterSubscribers.toLocaleString("de-DE") : "—" },
    { label: "Retouren offen", value: t.returnsOpen || 0, tone: (t.returnsOpen || 0) > 0 ? "warn" : "ok" },
    { label: currentYear ? "Letztes Jahr" : "—", value: currentYear ? formatEur(currentYear.revenue).replace(/,\d+\s/, " ") : "—", trend: lastYear ? Math.round((currentYear.revenue - lastYear.revenue) / lastYear.revenue * 100) : null }
  ];
  el.innerHTML = numbers.map((n) => `
    <div class="mini-stat tone-${n.tone || "neutral"}">
      <span class="mini-label">${escapeHtml(n.label)}</span>
      <strong>${escapeHtml(String(n.value))}</strong>
      ${n.trend !== null && n.trend !== undefined ? `<em class="${n.trend >= 0 ? "text-green" : "text-red"}">${n.trend >= 0 ? "▲" : "▼"}${Math.abs(n.trend)}%</em>` : ""}
    </div>`).join("");
}

// Sparkline mit zweiter Vergleichs-Linie (Vorjahr)
function sparklineCompare(currentVals, compareVals, { width = 240, height = 60, label = "" } = {}) {
  if (!currentVals?.length) return "";
  const all = [...currentVals.filter((v) => v !== null), ...(compareVals || []).filter((v) => v !== null)];
  if (!all.length) return "";
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const len = Math.max(currentVals.length, (compareVals || []).length);
  const step = width / (len - 1 || 1);

  const buildPoints = (vals) => vals.map((v, i) => {
    if (v === null || v === undefined) return null;
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 10) - 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).filter(Boolean).join(" ");

  return `<svg class="sparkline-compare" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-label="${escapeHtml(label)}">
    ${compareVals?.length ? `<polyline fill="none" stroke="var(--muted-2)" stroke-width="1.5" stroke-dasharray="3,3" points="${buildPoints(compareVals)}"/>` : ""}
    <polyline fill="none" stroke="var(--green)" stroke-width="2" points="${buildPoints(currentVals)}"/>
  </svg>`;
}

// Mini-SVG-Sparkline (Inline, kein lib)
function sparkline(values, { width = 80, height = 24, color = "currentColor" } = {}) {
  if (!values || !values.length) return "";
  const vals = values.map((v) => Number(v) || 0);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const step = width / (vals.length - 1 || 1);
  const points = vals.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const lastX = (vals.length - 1) * step;
  const lastY = height - ((vals[vals.length - 1] - min) / range) * (height - 4) - 2;
  return `<svg class="sparkline" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">
    <polyline fill="none" stroke="${color}" stroke-width="1.5" points="${points}"/>
    <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="2.5" fill="${color}"/>
  </svg>`;
}

// Bullet Chart: current vs. target
function bulletChart({ current = 0, target = 100, max = null, label = "" } = {}) {
  const maxVal = max || Math.max(target * 1.2, current * 1.1, 1);
  const targetPct = (target / maxVal * 100).toFixed(1);
  const currentPct = (current / maxVal * 100).toFixed(1);
  const reached = current >= target;
  return `<div class="bullet-chart" title="${escapeHtml(label)}">
    <div class="bullet-track">
      <div class="bullet-fill ${reached ? "good" : "warn"}" style="width:${currentPct}%"></div>
      <div class="bullet-target" style="left:${targetPct}%"></div>
    </div>
  </div>`;
}

// Auto-Trend für Dashboard-Metriken: letzte N Tage simulieren wenn keine historischen Daten
function buildPromiseTrend() {
  // letzte 7 Tage offen-Counts auf Basis status + dueDate
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const count = (state.promises || []).filter((p) => (p.status === "offen" || p.status === "in Arbeit") && (!p.promisedAt || p.promisedAt <= iso)).length;
    days.push(count);
  }
  return days;
}

function buildTaskTrend() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const count = (state.tasks || []).filter((t) => t.status !== "Erledigt").length; // grobe Linie da kein Verlauf
    days.push(count + (Math.random() * 2 - 1)); // leichtes Rauschen für Sichtbarkeit
  }
  return days;
}

function renderTaskListItem(task) {
  return `<article class="task-item">
    <div class="item-line"><strong>${task.title}</strong>${statusPill(task.priority)}</div>
    <span class="muted">${task.area} · ${task.status} · bis ${task.dueDate || "offen"}</span>
  </article>`;
}

function renderSystems(filter = document.querySelector("#system-filter .active")?.dataset.filter || "all") {
  const items = state.systems.filter((system) => {
    if (filter === "all") return true;
    if (filter === "bereit") return system.healthStatus === "bereit" || system.accessStatus === "geprüft" || system.accessStatus === "vorhanden";
    if (filter === "ungeprüft") return system.healthStatus === "ungeprüft" || system.accessStatus === "unbekannt";
    return system.healthStatus === filter || system.accessStatus === filter;
  });

  byId("system-grid").innerHTML = items.map((system) => `
    <article class="system-card">
      <div class="item-line"><h3>${escapeHtml(system.name)}</h3><span>${statusPill(system.healthStatus)} <button class="icon-button edit" data-edit="system:${system.id}" title="Bearbeiten" aria-label="Bearbeiten">✎</button></span></div>
      <p>${system.purpose}</p>
      <div class="system-meta">
        <span class="muted">Kategorie: ${system.category}</span>
        <span class="muted">Owner: ${system.owner}</span>
        <span class="muted">Zugang: ${system.accessStatus}</span>
      </div>
      <label class="muted">Status
        <select data-system-status="${system.id}">
          ${["unbekannt", "angefragt", "vorhanden", "geprüft", "blockiert"].map((status) => `<option ${system.accessStatus === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </label>
      <p><strong>Nächste Aktion:</strong> ${system.nextAction}</p>
    </article>
  `).join("");

  document.querySelectorAll("[data-system-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const system = state.systems.find((item) => item.id === event.target.dataset.systemStatus);
      system.accessStatus = event.target.value;
      if (event.target.value === "geprüft" || event.target.value === "vorhanden") system.healthStatus = "bereit";
      if (event.target.value === "blockiert") system.healthStatus = "blockiert";
      saveState();
      renderSystems(filter);
      renderAccessOptions();
      showToast("Systemstatus aktualisiert");
    });
  });
}

function renderAccessOptions() {
  const select = document.querySelector("#access-form select[name='systemId']");
  if (!select) return;
  select.innerHTML = state.systems.map((system) => `<option value="${system.id}">${system.name}</option>`).join("");
}

function renderAccess() {
  renderAccessOptions();
  byId("access-table").innerHTML = `
    <table>
      <thead><tr><th>System</th><th>Zugang</th><th>Zweck</th><th>Owner</th><th>Status</th><th>Priorität</th><th></th></tr></thead>
      <tbody>
        ${state.accessItems.map((item) => {
          const system = state.systems.find((candidate) => candidate.id === item.systemId);
          return `<tr>
            <td>${escapeHtml(system?.name || item.systemId)}</td>
            <td>${escapeHtml(item.accessType)}</td>
            <td>${escapeHtml(item.neededFor)}<br><span class="muted">${escapeHtml(item.notes || "")}</span></td>
            <td>${escapeHtml(item.owner || "-")}</td>
            <td><select data-access-status="${item.id}">${["angefragt", "vorhanden", "geprüft", "blockiert"].map((status) => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></td>
            <td>${statusPill(item.priority)}</td>
            <td><button class="icon-button edit" data-edit="access:${item.id}" title="Bearbeiten" aria-label="Bearbeiten">✎</button><button class="icon-button" data-access-delete="${item.id}" title="Zugang löschen" aria-label="Zugang löschen">×</button></td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`;

  document.querySelectorAll("[data-access-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const item = state.accessItems.find((candidate) => candidate.id === event.target.dataset.accessStatus);
      item.status = event.target.value;
      saveState();
      render();
      showToast("Zugang aktualisiert");
    });
  });

  document.querySelectorAll("[data-access-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.accessDelete;
      const item = state.accessItems.find((i) => i.id === id);
      if (!item) return;
      if (!confirm(`Zugang "${item.accessType}" wirklich löschen?`)) return;
      state.accessItems = state.accessItems.filter((i) => i.id !== id);
      saveState();
      renderAccess();
      renderDashboard();
      showToast("Zugang gelöscht");
    });
  });
}

function renderKanban() {
  const columns = ["Backlog", "Diese Woche", "In Arbeit", "Wartet", "Erledigt"];
  const search = (byId("task-search")?.value || "").trim().toLowerCase();
  const areaFilter = byId("task-area-filter")?.value || "all";

  const filtered = state.tasks.filter((task) => {
    if (areaFilter !== "all" && task.area !== areaFilter) return false;
    if (!search) return true;
    return (task.title + " " + task.area + " " + (task.notes || "")).toLowerCase().includes(search);
  });

  byId("kanban").innerHTML = columns.map((column) => {
    const tasks = filtered.filter((task) => task.status === column);
    return `<section class="kanban-column">
      <h3>${column}<span class="muted">${tasks.length}</span></h3>
      ${tasks.map((task) => `<article class="kanban-card">
        <div class="item-line"><strong>${escapeHtml(task.title)}</strong><span><button class="icon-button edit" data-edit="task:${task.id}" title="Bearbeiten" aria-label="Bearbeiten">✎</button><button class="icon-button" data-task-delete="${task.id}" title="Aufgabe löschen" aria-label="Aufgabe löschen">×</button></span></div>
        <span class="muted">${escapeHtml(task.area)} · Wirkung ${escapeHtml(task.impact)} · Aufwand ${escapeHtml(task.effort)}</span>
        ${task.notes ? `<span class="muted">${escapeHtml(task.notes)}</span>` : ""}
        <div class="item-line">${statusPill(task.priority)}<span class="muted">${task.dueDate || "ohne Datum"}</span></div>
        <select data-task-status="${task.id}">
          ${columns.map((status) => `<option ${task.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </article>`).join("")}
    </section>`;
  }).join("");

  document.querySelectorAll("[data-task-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const task = state.tasks.find((candidate) => candidate.id === event.target.dataset.taskStatus);
      task.status = event.target.value;
      saveState();
      renderKanban();
      renderDashboard();
      showToast("Aufgabe verschoben");
    });
  });

  document.querySelectorAll("[data-task-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.taskDelete;
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      if (!confirm(`Aufgabe "${task.title}" wirklich löschen?`)) return;
      state.tasks = state.tasks.filter((t) => t.id !== id);
      saveState();
      renderKanban();
      renderDashboard();
      showToast("Aufgabe gelöscht");
    });
  });
}

function getBriefingFromForm() {
  const form = byId("briefing-form");
  const data = Object.fromEntries(new FormData(form).entries());
  return {
    id: uid("b"),
    audience: "Stephan",
    createdAt: new Date().toISOString(),
    ...data
  };
}

function formatBriefing(briefing) {
  const body = `# ${briefing.title}

Stephan,

## Problem
${briefing.problem}

## Warum wichtig
${briefing.dataSituation}

## Empfehlung
${briefing.recommendation}

## Entscheidung von dir
${briefing.decisionNeeded}

## Nächster Schritt
${briefing.nextStep}`;
  // Auto-Glossar: alle Fachbegriffe die im Briefing vorkommen + Erklärungen anhängen
  const glossarySection = buildBriefingGlossarySection(body);
  return body + (glossarySection ? "\n\n" + glossarySection : "");
}

function buildBriefingGlossarySection(text) {
  if (!text || !(state.glossary || []).length) return "";
  const found = new Set();
  const allTerms = (state.glossary || []).map((g) => ({ term: g.term, synonyms: (g.synonyms || "").split(/[,;/]/).map((s) => s.trim()).filter(Boolean), entry: g }));
  for (const item of allTerms) {
    const tokens = [item.term, ...item.synonyms];
    for (const token of tokens) {
      if (token.length < 3) continue;
      const re = new RegExp(`(?<![\\wäöüÄÖÜß])${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\wäöüÄÖÜß])`, "i");
      if (re.test(text)) { found.add(item.entry.id); break; }
    }
  }
  if (!found.size) return "";
  const entries = (state.glossary || []).filter((g) => found.has(g.id)).slice(0, 8);
  return `## 📖 Glossar (für Begriffe in diesem Briefing)
${entries.map((g) => `- **${g.term}**${g.synonyms ? ` _(${g.synonyms})_` : ""}: ${g.definition}`).join("\n")}`;
}

function renderMarkdown(md) {
  const lines = String(md || "").split(/\r?\n/);
  const out = [];
  let inList = false;
  const closeList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { closeList(); continue; }
    let m;
    if ((m = /^###\s+(.*)$/.exec(line))) { closeList(); out.push(`<h4>${escapeHtml(m[1])}</h4>`); continue; }
    if ((m = /^##\s+(.*)$/.exec(line))) { closeList(); out.push(`<h3>${escapeHtml(m[1])}</h3>`); continue; }
    if ((m = /^#\s+(.*)$/.exec(line))) { closeList(); out.push(`<h2>${escapeHtml(m[1])}</h2>`); continue; }
    if ((m = /^[-*]\s+(.*)$/.exec(line))) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inlineFormat(m[1])}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inlineFormat(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}

function inlineFormat(text) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

const briefingTemplates = {
  support: {
    title: "Support-Prozess mit SeBo starten",
    problem: "50-100 Support-E-Mails pro Tag laufen ungesteuert über service@herrundfrauklein.com. 6 Mitarbeiter arbeiten parallel, ohne Kategorien, SLA oder Eskalation.",
    dataSituation: "All-inkl ist Mail-/Domainhoster. SeBo steht als Cockpit bereit. N8N kann die Verteilung in Tickets übernehmen, sobald IMAP/SMTP-Zugang da ist.",
    recommendation: "SeBo + N8N als Support-Cockpit: Kategorien, Status, Eskalation, Antwortvorlagen, Wochenreport. Erst messen, dann automatisieren.",
    decisionNeeded: "Freigabe für All-inkl-Mailzugang, N8N-Workflow und Festlegung der Support-Verantwortlichen.",
    nextStep: "Zugänge anlegen, Testmail in N8N, erste Kategorien live, Wochenreport ab KW 2."
  },
  access: {
    title: "Zugänge für JTL-/Shop-/Tracking-Audit",
    problem: "Ohne Lese-Zugänge zu JTL Wawi, JTL-Shop, GA/GTM und Search Console bleibt jede Analyse Vermutung.",
    dataSituation: "Aktueller Zugangsstand siehe MAGALOKO. Schreibrechte werden nicht gebraucht — Lesezugriff reicht für die ersten 30 Tage.",
    recommendation: "Read-only Zugänge in dieser Reihenfolge: JTL Wawi (Export/SQL), JTL-Shop Admin, GA/GTM, Search Console, Doofinder.",
    decisionNeeded: "Zustimmung Stephan, Zugänge gestaffelt durch Markus/Stephan freigeben.",
    nextStep: "Zugangs-Tickets in MAGALOKO anlegen, Owner und Frist pro Zugang setzen."
  },
  data: {
    title: "Februar-2025-Bruch klären",
    problem: "Umsatz/Conversion zeigt im Februar 2025 einen sichtbaren Bruch. Ursache offen: Datenproblem, Tracking-Defekt oder echter Rückgang.",
    dataSituation: "Vergleichsquellen: JTL Wawi (Wahrheit), Shop-Bestellungen, GA/GTM Events, Search Console, Bankauszüge.",
    recommendation: "Schrittweiser Abgleich JTL ↔ Shop ↔ Bank ↔ GA ↔ GSC. Erst Datenkonsistenz, dann Tracking, dann Marktursachen.",
    decisionNeeded: "Freigabe für 2 Tage fokussierter Datenarbeit (siehe Roadmap).",
    nextStep: "Zugriff auf alle 5 Quellen sichern, Baseline-Tabelle bauen, Abweichungen quantifizieren."
  },
  procurement: {
    title: "Einkaufsentscheidung vorbereiten",
    problem: "Bestand-/Sortimentsentscheidungen sind aktuell nicht datenbasiert und kosten Marge.",
    dataSituation: "JTL Wawi liefert Bestand und Verkaufshistorie. Größen-/Farbenmix und Saisondaten lassen sich auswerten.",
    recommendation: "Einkaufsplaner-Modul in SeBo: Topseller sichern, Penner identifizieren, Größen-/Farbenlücken sichtbar machen, Lieferanten-Scorecard.",
    decisionNeeded: "Priorisierung gegen Support-Cockpit: parallel oder sequenziell?",
    nextStep: "Mit Beate/Lorna ein Beispielszenario durchgehen, daraus Mindestfelder ableiten."
  },
  crm: {
    title: "Kundenreaktivierung Sleeping Champions",
    problem: "Einmalkäufer und langjährig inaktive Kunden werden nicht systematisch angesprochen.",
    dataSituation: "JTL Wawi enthält Kaufhistorie, Brevo ist potenziell der Versandkanal (Status unklar).",
    recommendation: "Segment definieren (Sleeping Champions: >12 Monate inaktiv, ≥2 Käufe), Pilotkampagne mit klarer Messung (Öffnung, Klick, Umsatz, Wiederkauf).",
    decisionNeeded: "Brevo-Status klären; Budget/Gutschein-Mechanik festlegen.",
    nextStep: "Segmentgröße abfragen, Angebot formulieren, 1 Test-Welle aufsetzen."
  },
  weekly: {
    title: "MAGALOKO Wochenupdate",
    problem: "",
    dataSituation: "",
    recommendation: "",
    decisionNeeded: "",
    nextStep: ""
  },
  pitch: {
    title: "Vorschlag: [Hebel-Titel]",
    problem: "[Was klemmt heute? Mit konkretem Bezug auf HFK-Zahlen]",
    dataSituation: "[Beweis: aus SeBo/JTL/Anomalien — welche Zahlen belegen das Problem?]",
    recommendation: "[Konkrete Lösung in 2-3 Sätzen]",
    decisionNeeded: "[Freigabe für Aufwand X / Budget Y / Personalentscheidung Z]",
    nextStep: "[Erste Aktion in den nächsten 7 Tagen]"
  },
  risk: {
    title: "Eskalation: [Risiko-Titel]",
    problem: "[Was ist passiert / was droht? Mit Wahrscheinlichkeit × Schaden]",
    dataSituation: "[Frühwarnsignale die gesehen wurden / fehlen]",
    recommendation: "[Sofortmaßnahme + mittelfristige Minderung]",
    decisionNeeded: "[Owner, Budget, Eskalations-Pfad]",
    nextStep: "[Was in 24h / 7T passiert]"
  },
  decision: {
    title: "Entscheidungsvorlage: [Thema]",
    problem: "[Ausgangslage / warum eine Entscheidung jetzt nötig ist]",
    dataSituation: "[Datenlage und geprüfte Alternativen]",
    recommendation: "[Empfohlene Option mit Begründung]",
    decisionNeeded: "[Konkrete Frage: Option A oder B oder C]",
    nextStep: "[Was passiert nach der Entscheidung]"
  }
};

function applyBriefingTemplate(key) {
  if (key === "weekly") {
    const active = state.tasks.filter((task) => task.status !== "Erledigt").slice(0, 8);
    const blocked = state.accessItems.filter((item) => item.status === "blockiert" || item.status === "angefragt");
    const form = byId("briefing-form");
    form.elements.title.value = "MAGALOKO Wochenupdate";
    form.elements.problem.value = active.map((t) => `${t.title} (${t.area}, ${t.status}, ${t.priority})`).join("\n");
    form.elements.dataSituation.value = blocked.map((i) => {
      const sys = state.systems.find((s) => s.id === i.systemId);
      return `${sys?.name || i.systemId}: ${i.accessType} (${i.status}, ${i.priority})`;
    }).join("\n");
    form.elements.recommendation.value = "Support mit service@herrundfrauklein.com als 30-Tage-Pilot starten. JTL Wawi bleibt zentrale Wahrheit; SeBo/MAGALOKO dienen als Cockpit.";
    form.elements.decisionNeeded.value = "Freigabe der offenen Zugänge (siehe Liste oben).";
    form.elements.nextStep.value = "Top-3 Aufgaben der kommenden Woche festlegen, Owner und Termin setzen.";
    renderBriefing();
    return;
  }
  const tpl = briefingTemplates[key];
  if (!tpl) return;
  const form = byId("briefing-form");
  Object.entries(tpl).forEach(([k, v]) => {
    if (form.elements[k]) form.elements[k].value = v;
  });
  renderBriefing();
}

let briefingMode = "md";

function renderBriefing() {
  const md = formatBriefing(getBriefingFromForm());
  byId("briefing-output").textContent = md;
  const preview = byId("briefing-preview");
  if (preview) preview.innerHTML = renderMarkdown(md);
}

function renderStephanProfile() {
  const body = byId("stephan-profile-body");
  if (!body) return;
  const p = state.stephanProfile || {};
  const items = [
    { label: "Lieblings-Metriken", key: "favoriteMetrics" },
    { label: "Beste Ansprechzeit", key: "bestTime" },
    { label: "Was triggert", key: "triggers", accent: "warn" },
    { label: "Was beruhigt", key: "calmers", accent: "good" },
    { label: "Kommunikationsstil", key: "communicationStyle" },
    { label: "No-Surprise-Themen", key: "noSurpriseTopics", accent: "warn" },
    { label: "Notizen", key: "notes" }
  ];
  body.innerHTML = items
    .filter((item) => p[item.key])
    .map((item) => `<div class="profile-row ${item.accent ? "accent-" + item.accent : ""}">
      <span class="profile-label">${escapeHtml(item.label)}</span>
      <p>${escapeHtml(p[item.key])}</p>
    </div>`).join("");
}

const profileFields = [
  { name: "favoriteMetrics", label: "Lieblings-Metriken", type: "textarea" },
  { name: "bestTime", label: "Beste Ansprechzeit", type: "textarea" },
  { name: "triggers", label: "Was triggert (vermeiden)", type: "textarea" },
  { name: "calmers", label: "Was beruhigt (häufiger nutzen)", type: "textarea" },
  { name: "communicationStyle", label: "Kommunikationsstil", type: "textarea" },
  { name: "noSurpriseTopics", label: "No-Surprise-Themen", type: "textarea" },
  { name: "notes", label: "Notizen", type: "textarea" }
];

function openProfileEdit() {
  byId("edit-modal-title").textContent = "Stephan-Profil bearbeiten";
  const fields = byId("edit-modal-fields");
  fields.innerHTML = profileFields.map((field) => {
    const value = escapeHtml(state.stephanProfile?.[field.name] || "");
    return `<label>${field.label}<textarea name="${field.name}">${value}</textarea></label>`;
  }).join("");
  const form = byId("edit-form");
  form.onsubmit = (event) => {
    event.preventDefault();
    profileFields.forEach((field) => {
      state.stephanProfile[field.name] = form.elements[field.name]?.value || "";
    });
    saveState();
    renderStephanProfile();
    byId("edit-modal").close();
    showToast("Profil gespeichert");
  };
  byId("edit-modal").showModal();
}

function renderMoodLog() {
  const log = byId("mood-log");
  if (!log) return;
  const allMoods = (state.stephanMoods || []).slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const moods = allMoods.slice(-8).reverse();

  // Trend-Chart der letzten 20 Moods
  const moodValue = { "🟢": 4, "🔵": 3, "🟡": 2, "🔴": 1 };
  const trendData = allMoods.slice(-20).map((m) => moodValue[m.mood] || 2);

  // Statistik
  const counts = { "🟢": 0, "🟡": 0, "🔴": 0, "🔵": 0 };
  allMoods.forEach((m) => { if (counts[m.mood] !== undefined) counts[m.mood]++; });
  const total = allMoods.length;

  let trendHtml = "";
  if (trendData.length >= 2) {
    // Custom-Sparkline für Mood (mit Y-Achse 1-4)
    const width = 240, height = 40;
    const step = width / (trendData.length - 1);
    const points = trendData.map((v, i) => {
      const x = i * step;
      const y = height - ((v - 1) / 3) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const avg = trendData.reduce((s, v) => s + v, 0) / trendData.length;
    const avgY = height - ((avg - 1) / 3) * (height - 8) - 4;
    const trend = trendData.length >= 4 ? (trendData.slice(-4).reduce((s, v) => s + v, 0) / 4 - trendData.slice(0, 4).reduce((s, v) => s + v, 0) / 4) : 0;
    const trendArrow = trend > 0.3 ? "▲ wird besser" : trend < -0.3 ? "▼ wird schlechter" : "● stabil";
    const trendColor = trend > 0.3 ? "var(--green)" : trend < -0.3 ? "var(--red)" : "var(--muted-2)";
    trendHtml = `<div class="mood-trend">
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="mood-trend-svg">
        <line x1="0" y1="${avgY}" x2="${width}" y2="${avgY}" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="2,3"/>
        <polyline fill="none" stroke="${trendColor}" stroke-width="2" points="${points}"/>
        ${trendData.map((v, i) => {
          const x = i * step; const y = height - ((v - 1) / 3) * (height - 8) - 4;
          const color = v >= 3.5 ? "var(--green)" : v >= 2.5 ? "var(--blue)" : v >= 1.5 ? "var(--yellow)" : "var(--red)";
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${color}"/>`;
        }).join("")}
      </svg>
      <span class="muted" style="color:${trendColor};font-weight:700;font-size:11px;">${trendArrow}</span>
    </div>
    <div class="mood-distribution">
      <span title="entspannt">🟢 ${counts["🟢"]}</span>
      <span title="angespannt">🟡 ${counts["🟡"]}</span>
      <span title="gereizt">🔴 ${counts["🔴"]}</span>
      <span title="nachdenklich">🔵 ${counts["🔵"]}</span>
      <span class="muted">${total} gesamt</span>
    </div>`;
  }

  log.innerHTML = (allMoods.length ? trendHtml : "") + (moods.length
    ? moods.map((m) => `<div class="mood-entry">
        <span class="mood-icon">${m.mood}</span>
        <div>
          <span class="muted">${new Date(m.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
          ${m.note ? `<p>${escapeHtml(m.note)}</p>` : ""}
        </div>
        <button class="icon-button" data-mood-delete="${m.id}" title="Eintrag löschen">×</button>
      </div>`).join("")
    : '<p class="muted">Noch keine Mood-Einträge.</p>');

  document.querySelectorAll("[data-mood-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.moodDelete;
      state.stephanMoods = state.stephanMoods.filter((m) => m.id !== id);
      saveState();
      renderMoodLog();
    });
  });
}

function renderPromises() {
  const list = byId("promises-list");
  if (!list) return;
  const today = new Date().toISOString().slice(0, 10);
  const promises = state.promises.slice().sort((a, b) => {
    const aOpen = a.status === "offen" || a.status === "in Arbeit" ? 0 : 1;
    const bOpen = b.status === "offen" || b.status === "in Arbeit" ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
  });

  const buckets = {
    overdue: promises.filter((p) => p.dueDate && p.dueDate < today && (p.status === "offen" || p.status === "in Arbeit")),
    upcoming: promises.filter((p) => (!p.dueDate || p.dueDate >= today) && (p.status === "offen" || p.status === "in Arbeit")),
    done: promises.filter((p) => p.status === "eingelöst" || p.status === "verschoben" || p.status === "verfehlt")
  };

  const renderItem = (p) => {
    const overdue = p.dueDate && p.dueDate < today && (p.status === "offen" || p.status === "in Arbeit");
    return `<article class="promise-item ${overdue ? "overdue" : ""}">
      <div class="item-line">
        <strong>${escapeHtml(p.what)}</strong>
        <span class="topbar-actions">
          <span class="pill ${p.status === "eingelöst" ? "bereit" : p.status === "verfehlt" ? "kritisch" : overdue ? "kritisch" : p.status === "in Arbeit" ? "angefragt" : "mittel"}">${escapeHtml(p.status)}</span>
          <button class="icon-button edit" data-edit="promise:${p.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-promise-delete="${p.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(p.context || "—")} · zugesagt ${p.promisedAt || "?"} · fällig ${p.dueDate || "ohne Datum"}${overdue ? " · <strong>überfällig</strong>" : ""}</span>
      ${p.outcome ? `<span class="muted">Ergebnis: ${escapeHtml(p.outcome)}</span>` : ""}
      <label class="lever-quick-status muted">Status
        <select data-promise-status="${p.id}">
          ${["offen", "in Arbeit", "eingelöst", "verschoben", "verfehlt"].map((s) => `<option ${p.status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </label>
    </article>`;
  };

  list.innerHTML = `
    ${buckets.overdue.length ? `<div class="promise-bucket overdue-bucket"><h4>Überfällig (${buckets.overdue.length})</h4>${buckets.overdue.map(renderItem).join("")}</div>` : ""}
    ${buckets.upcoming.length ? `<div class="promise-bucket"><h4>Offen / In Arbeit (${buckets.upcoming.length})</h4>${buckets.upcoming.map(renderItem).join("")}</div>` : ""}
    ${buckets.done.length ? `<details class="promise-bucket"><summary>Erledigt / Geschlossen (${buckets.done.length})</summary>${buckets.done.map(renderItem).join("")}</details>` : ""}
    ${!promises.length ? '<p class="muted">Noch keine Versprechen erfasst.</p>' : ""}`;

  document.querySelectorAll("[data-promise-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const p = state.promises.find((x) => x.id === event.target.dataset.promiseStatus);
      if (!p) return;
      p.status = event.target.value;
      saveState();
      renderPromises();
      renderDashboard();
      showToast("Versprechen aktualisiert");
    });
  });

  document.querySelectorAll("[data-promise-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.promiseDelete;
      const p = state.promises.find((x) => x.id === id);
      if (!p) return;
      if (!confirm(`Versprechen "${p.what}" löschen?`)) return;
      state.promises = state.promises.filter((x) => x.id !== id);
      saveState();
      renderPromises();
      renderDashboard();
      showToast("Versprechen gelöscht");
    });
  });
}

function renderMeetings() {
  byId("meeting-list").innerHTML = state.meetings.length
    ? state.meetings.map((meeting) => `
      <article class="compact-item">
        <div class="item-line"><strong>${escapeHtml(meeting.type)}</strong><span class="muted">${meeting.date || "ohne Datum"} <button class="icon-button edit" data-edit="meeting:${meeting.id}" title="Bearbeiten">✎</button><button class="icon-button" data-meeting-delete="${meeting.id}" title="Gespräch löschen" aria-label="Gespräch löschen">×</button></span></div>
        <span class="muted">${escapeHtml(meeting.goal || "")}</span>
        <details>
          <summary>Agenda</summary>
          <pre>${escapeHtml(meeting.agenda || "")}</pre>
        </details>
      </article>
    `).join("")
    : '<p class="muted">Noch keine Gespräche gespeichert.</p>';

  document.querySelectorAll("[data-meeting-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.meetingDelete;
      const m = state.meetings.find((x) => x.id === id);
      if (!m) return;
      if (!confirm(`Gespräch "${m.type}" (${m.date || "ohne Datum"}) wirklich löschen?`)) return;
      state.meetings = state.meetings.filter((x) => x.id !== id);
      saveState();
      renderMeetings();
      renderDashboard();
      showToast("Gespräch gelöscht");
    });
  });
}

function renderBriefingHistory() {
  const list = byId("briefing-history");
  const count = byId("briefing-count");
  if (!list) return;
  count.textContent = state.briefings.length ? `${state.briefings.length} gespeichert` : "";
  list.innerHTML = state.briefings.length
    ? state.briefings.map((b) => {
        const date = b.createdAt ? new Date(b.createdAt).toLocaleString("de-DE") : "";
        return `<article class="compact-item">
          <div class="item-line"><strong>${escapeHtml(b.title || "Ohne Titel")}</strong><span class="muted">${date} <button class="icon-button" data-briefing-load="${b.id}" title="Ins Formular laden">↻</button> <button class="icon-button" data-briefing-delete="${b.id}" title="Briefing löschen">×</button></span></div>
          <span class="muted">${escapeHtml((b.recommendation || "").slice(0, 160))}${(b.recommendation || "").length > 160 ? "…" : ""}</span>
        </article>`;
      }).join("")
    : '<p class="muted">Noch keine Briefings gespeichert. Formular ausfüllen und "Briefing speichern" klicken.</p>';

  document.querySelectorAll("[data-briefing-load]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.briefingLoad;
      const b = state.briefings.find((x) => x.id === id);
      if (!b) return;
      const form = byId("briefing-form");
      ["title", "problem", "dataSituation", "recommendation", "decisionNeeded", "nextStep"].forEach((field) => {
        const el = form.elements[field];
        if (el) el.value = b[field] || "";
      });
      renderBriefing();
      showToast("Briefing geladen");
    });
  });

  document.querySelectorAll("[data-briefing-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.briefingDelete;
      const b = state.briefings.find((x) => x.id === id);
      if (!b) return;
      if (!confirm(`Briefing "${b.title}" wirklich löschen?`)) return;
      state.briefings = state.briefings.filter((x) => x.id !== id);
      saveState();
      renderBriefingHistory();
      renderDashboard();
      showToast("Briefing gelöscht");
    });
  });
}

function renderJobs() {
  byId("job-role-list").innerHTML = state.jobRoles.map((role) => `
    <article class="job-card">
      <div class="item-line"><strong>${role.title}</strong>${statusPill("Rolle", "entscheidung")}</div>
      <p>${role.mission}</p>
      <div class="tag-row">${role.responsibilities.map((item) => `<span>${item}</span>`).join("")}</div>
      <div class="muted"><strong>Outputs:</strong> ${role.outputs.join(", ")}</div>
    </article>
  `).join("");

  byId("job-area-list").innerHTML = state.jobAreas.map((area) => `
    <article class="area-card">
      <strong>${area.name}</strong>
      <p>${area.goal}</p>
      <ul>${area.tasks.map((task) => `<li>${task}</li>`).join("")}</ul>
    </article>
  `).join("");

  byId("playbook-list").innerHTML = state.playbooks.map((playbook, index) => `
    <details class="playbook" ${index < 2 ? "open" : ""}>
      <summary>
        <span>${playbook.title}</span>
        <em>${playbook.trigger}</em>
      </summary>
      <ol>${playbook.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      <div class="done-box"><strong>Erledigt wenn:</strong> ${playbook.done}</div>
    </details>
  `).join("");
}

function renderKnowledge() {
  byId("knowledge-grid").innerHTML = state.knowledgeCards.map((card) => `
    <article class="knowledge-card">
      <div class="item-line"><h3>${escapeHtml(card.topic)}</h3><span>${statusPill(card.confidence)} <button class="icon-button edit" data-edit="knowledge:${card.id}" title="Bearbeiten">✎</button><button class="icon-button" data-knowledge-delete="${card.id}" title="Löschen">×</button></span></div>
      <p>${escapeHtml(card.summary)}</p>
      <span class="muted">${escapeHtml(card.source)} · ${(card.tags || []).map(escapeHtml).join(", ")}</span>
    </article>
  `).join("");

  document.querySelectorAll("[data-knowledge-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.knowledgeDelete;
      const card = state.knowledgeCards.find((x) => x.id === id);
      if (!card) return;
      if (!confirm(`Wissenskarte "${card.topic}" wirklich löschen?`)) return;
      state.knowledgeCards = state.knowledgeCards.filter((x) => x.id !== id);
      saveState();
      renderKnowledge();
      renderDashboard();
      showToast("Karte gelöscht");
    });
  });
}

function exportWeeklyUpdate() {
  const active = state.tasks.filter((task) => task.status !== "Erledigt").slice(0, 8);
  const blocked = state.accessItems.filter((item) => item.status === "blockiert" || item.status === "angefragt");
  const update = `# MAGALOKO Wochenupdate

## Fokus
${active.map((task) => `- ${task.title} (${task.area}, ${task.status}, ${task.priority})`).join("\n")}

## Offene Zugänge
${blocked.map((item) => {
  const system = state.systems.find((candidate) => candidate.id === item.systemId);
  return `- ${system?.name || item.systemId}: ${item.accessType} (${item.status}, ${item.priority})`;
}).join("\n")}

## Entscheidungsvorschlag
- Support mit service@herrundfrauklein.com als 30-Tage-Pilot starten.
- JTL Wawi bleibt zentrale Wahrheit; SeBo/MAGALOKO dienen als Cockpit.
- Zugänge zuerst lesen, dokumentieren und ohne Secrets in MAGALOKO verfolgen.`;

  copyText(update, "Wochenupdate kopiert");
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
}

function renderWeek() {
  const grid = byId("week-grid");
  if (!grid) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = startOfWeek(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const nextWeekEnd = new Date(weekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);

  const items = [];
  state.tasks
    .filter((t) => t.status !== "Erledigt" && t.dueDate)
    .forEach((t) => items.push({ kind: "task", date: new Date(t.dueDate), title: t.title, meta: `${t.area} · ${t.status}`, priority: t.priority, ref: t }));
  state.meetings
    .filter((m) => m.date)
    .forEach((m) => items.push({ kind: "meeting", date: new Date(m.date), title: m.type, meta: m.goal, priority: "Termin", ref: m }));
  state.accessItems
    .filter((a) => a.priority === "hoch" && a.status !== "geprüft" && a.status !== "vorhanden")
    .forEach((a) => {
      const sys = state.systems.find((s) => s.id === a.systemId);
      items.push({ kind: "access", date: null, title: `Zugang: ${sys?.name || a.systemId}`, meta: `${a.accessType} · ${a.neededFor}`, priority: "offen", ref: a });
    });

  const overdue = items.filter((i) => i.date && i.date < today);
  const thisWeek = items.filter((i) => i.date && i.date >= today && i.date < weekEnd);
  const nextWeek = items.filter((i) => i.date && i.date >= weekEnd && i.date < nextWeekEnd);
  const open = items.filter((i) => !i.date);

  const sortByDate = (a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
  overdue.sort(sortByDate);
  thisWeek.sort(sortByDate);
  nextWeek.sort(sortByDate);

  byId("week-summary").textContent = `${overdue.length} überfällig · ${thisWeek.length} diese Woche · ${nextWeek.length} nächste Woche`;

  const columnHtml = (title, list, emptyLabel, accentClass = "") => `
    <section class="week-column ${accentClass}">
      <h3>${title}<span class="muted">${list.length}</span></h3>
      ${list.length
        ? list.map((i) => `<article class="week-card week-${i.kind}">
            <div class="item-line"><strong>${escapeHtml(i.title)}</strong>${statusPill(i.priority)}</div>
            <span class="muted">${i.date ? i.date.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) : "ohne Datum"}${i.meta ? " · " + escapeHtml(i.meta) : ""}</span>
          </article>`).join("")
        : `<p class="muted">${emptyLabel}</p>`}
    </section>`;

  grid.innerHTML = `
    ${columnHtml("Überfällig", overdue, "Nichts überfällig — sauber.", "week-overdue")}
    ${columnHtml("Diese Woche", thisWeek, "Nichts diese Woche.")}
    ${columnHtml("Nächste Woche", nextWeek, "Nächste Woche noch frei.")}
    ${open.length ? columnHtml("Offene Zugänge (kritisch)", open, "", "week-open") : ""}`;
}

let anomalyThreshold = 10;

const kpiSpec = [
  { key: "revenue", label: "Umsatz", unit: "€", direction: "up", format: (v) => formatEur(v) },
  { key: "orders", label: "Bestellungen", unit: "", direction: "up", format: (v) => String(Math.round(v || 0)) },
  { key: "conversionPct", label: "Conversion", unit: "%", direction: "up", format: (v) => (v || 0).toFixed(2) + " %" },
  { key: "sessions", label: "Sessions", unit: "", direction: "up", format: (v) => Math.round(v || 0).toLocaleString("de-DE") },
  { key: "returnRatePct", label: "Retoure", unit: "%", direction: "down", format: (v) => (v || 0).toFixed(1) + " %" },
  { key: "supportTickets", label: "Support", unit: "", direction: "down", format: (v) => String(Math.round(v || 0)) },
  { key: "repeatRatePct", label: "Wiederkauf", unit: "%", direction: "up", format: (v) => (v || 0).toFixed(1) + " %" }
];

function sortedWeeks() {
  return state.weeklyKpis.slice().sort((a, b) => (b.weekStart || "").localeCompare(a.weekStart || ""));
}

function findWeekRelative(currentStart, weeksBack) {
  if (!currentStart) return null;
  const target = new Date(currentStart);
  target.setDate(target.getDate() - 7 * weeksBack);
  const isoTarget = target.toISOString().slice(0, 10);
  return state.weeklyKpis.find((w) => w.weekStart === isoTarget) || null;
}

function findWeekYearAgo(currentStart) {
  if (!currentStart) return null;
  const target = new Date(currentStart);
  target.setFullYear(target.getFullYear() - 1);
  const isoTarget = target.toISOString().slice(0, 10);
  let best = state.weeklyKpis.find((w) => w.weekStart === isoTarget);
  if (best) return best;
  let smallest = Infinity;
  state.weeklyKpis.forEach((w) => {
    if (!w.weekStart) return;
    const diff = Math.abs((new Date(w.weekStart) - target) / (1000 * 60 * 60 * 24));
    if (diff <= 7 && diff < smallest) {
      smallest = diff;
      best = w;
    }
  });
  return best || null;
}

function deltaPct(current, base) {
  if (base === undefined || base === null || base === 0) return null;
  if (current === undefined || current === null) return null;
  return ((current - base) / base) * 100;
}

function deltaClass(deltaValue, direction) {
  if (deltaValue === null) return "neutral";
  const absD = Math.abs(deltaValue);
  if (absD < anomalyThreshold) return "neutral";
  const isPositive = direction === "up" ? deltaValue > 0 : deltaValue < 0;
  return isPositive ? "good" : "bad";
}

function renderAnomalies() {
  if (!byId("anomaly-current")) return;
  const weeks = sortedWeeks();
  const current = weeks[0];

  const currentEl = byId("anomaly-current");
  if (!current) {
    currentEl.innerHTML = '<div class="panel"><p class="muted">Noch keine Wochendaten erfasst. Klick "+ Woche eintragen" oben.</p></div>';
  } else {
    const prev = findWeekRelative(current.weekStart, 1);
    const prev4 = findWeekRelative(current.weekStart, 4);
    const yearAgo = findWeekYearAgo(current.weekStart);

    currentEl.innerHTML = `
      <section class="panel current-week-panel">
        <div class="panel-header">
          <h3>${escapeHtml(current.weekLabel || current.weekStart)}</h3>
          <span class="muted">Aktuelle Woche · ${prev ? `Vorwoche: ${escapeHtml(prev.weekLabel)}` : "keine Vorwoche"} · ${prev4 ? "vor 4 Wo: ✓" : "vor 4 Wo: —"} · ${yearAgo ? "Vorjahr: ✓" : "Vorjahr: —"}</span>
        </div>
        <div class="kpi-grid">
          ${kpiSpec.map((spec) => {
            const value = current[spec.key];
            const dPrev = deltaPct(value, prev?.[spec.key]);
            const dPrev4 = deltaPct(value, prev4?.[spec.key]);
            const dYear = deltaPct(value, yearAgo?.[spec.key]);
            const cls = deltaClass(dPrev, spec.direction);
            // 12-Wochen-Trend dieser Metrik + Vorjahr-Vergleich
            const last12 = weeks.slice(0, 12).reverse().map((w) => w[spec.key]);
            const yearAgoStart = new Date(current.weekStart); yearAgoStart.setFullYear(yearAgoStart.getFullYear() - 1);
            const compareValsFull = [];
            for (let i = 11; i >= 0; i--) {
              const target = new Date(yearAgoStart); target.setDate(target.getDate() - 7 * i);
              const iso = target.toISOString().slice(0, 10);
              const w = weeks.find((x) => x.weekStart === iso);
              compareValsFull.push(w?.[spec.key] ?? null);
            }
            const hasCompare = compareValsFull.some((v) => v !== null);
            return `<article class="kpi-card kpi-${cls}">
              <span class="kpi-label">${escapeHtml(spec.label)}</span>
              <strong>${escapeHtml(spec.format(value))}</strong>
              <div class="kpi-spark">${sparklineCompare(last12, hasCompare ? compareValsFull : null, { width: 200, height: 36, label: spec.label })}</div>
              ${hasCompare ? `<span class="kpi-legend muted">— heute · ··· Vorjahr</span>` : `<span class="kpi-legend muted">— 12 Wochen</span>`}
              <div class="kpi-deltas">
                ${renderDelta(dPrev, "Vorwoche", spec.direction)}
                ${renderDelta(dPrev4, "vor 4 Wo", spec.direction)}
                ${renderDelta(dYear, "Vorjahr", spec.direction)}
              </div>
              ${cls === "bad" ? `<button class="button small" data-create-anomaly="${spec.key}" type="button">Bruch dokumentieren</button>` : ""}
            </article>`;
          }).join("")}
        </div>
      </section>`;

    document.querySelectorAll("[data-create-anomaly]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const metric = event.currentTarget.dataset.createAnomaly;
        const prev = findWeekRelative(current.weekStart, 1);
        const d = deltaPct(current[metric], prev?.[metric]);
        const newAnomaly = {
          id: uid("an"),
          weekStart: current.weekStart,
          metric,
          deltaPct: Math.round((d || 0) * 10) / 10,
          vsLabel: "vs Vorwoche",
          status: "offen",
          hypothesis: "",
          dataSourcesChecked: "",
          conclusion: "",
          createdAt: new Date().toISOString()
        };
        state.anomalies.unshift(newAnomaly);
        saveState();
        renderAnomalies();
        openEdit("anomaly", newAnomaly.id);
      });
    });
  }

  byId("weeks-count").textContent = `${weeks.length} Wochen erfasst`;
  byId("weeks-table").innerHTML = weeks.length ? `
    <table>
      <thead><tr><th>Woche</th><th>Umsatz</th><th>Best.</th><th>CR</th><th>Sessions</th><th>Retoure</th><th></th></tr></thead>
      <tbody>
        ${weeks.map((w) => `<tr>
          <td><strong>${escapeHtml(w.weekLabel || w.weekStart)}</strong><br><span class="muted">${w.weekStart || ""}</span></td>
          <td>${formatEur(w.revenue)}</td>
          <td>${Math.round(w.orders || 0)}</td>
          <td>${(w.conversionPct || 0).toFixed(2)}%</td>
          <td>${(w.sessions || 0).toLocaleString("de-DE")}</td>
          <td>${(w.returnRatePct || 0).toFixed(1)}%</td>
          <td>
            <button class="icon-button edit" data-edit="week-kpi:${w.id}" title="Bearbeiten">✎</button>
            <button class="icon-button" data-week-delete="${w.id}" title="Löschen">×</button>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>` : '<p class="muted">Noch keine Wochen erfasst.</p>';

  document.querySelectorAll("[data-week-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.weekDelete;
      const w = state.weeklyKpis.find((x) => x.id === id);
      if (!w) return;
      if (!confirm(`Woche "${w.weekLabel}" löschen?`)) return;
      state.weeklyKpis = state.weeklyKpis.filter((x) => x.id !== id);
      saveState();
      renderAnomalies();
      showToast("Woche gelöscht");
    });
  });

  const openAnoms = state.anomalies.filter((a) => a.status !== "geklärt" && a.status !== "verworfen");
  byId("anomalies-count").textContent = `${openAnoms.length} offen / ${state.anomalies.length} gesamt`;
  byId("anomalies-list").innerHTML = state.anomalies.length ? state.anomalies
    .slice()
    .sort((a, b) => {
      const order = { offen: 0, "in Klärung": 1, geklärt: 2, verworfen: 3 };
      return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    })
    .map((a) => {
      const spec = kpiSpec.find((s) => s.key === a.metric);
      const week = state.weeklyKpis.find((w) => w.weekStart === a.weekStart);
      const statusClass = a.status === "geklärt" ? "bereit" : a.status === "verworfen" ? "niedrig" : a.status === "in Klärung" ? "angefragt" : "kritisch";
      const arrow = a.deltaPct < 0 ? "▼" : "▲";
      const arrowClass = (a.deltaPct < 0 && spec?.direction === "up") || (a.deltaPct > 0 && spec?.direction === "down") ? "bad" : "good";
      return `<article class="anomaly-item status-${a.status.replace(/\s+/g, "-")}">
        <div class="anomaly-annotation">
          <span class="anomaly-arrow anomaly-arrow-${arrowClass}">${arrow} ${Math.abs(a.deltaPct)}%</span>
          <span class="muted">${escapeHtml(a.vsLabel || "")}</span>
        </div>
        <div class="item-line">
          <strong>${escapeHtml(week?.weekLabel || a.weekStart)} · ${escapeHtml(spec?.label || a.metric)}</strong>
          <span class="topbar-actions">
            <span class="pill ${statusClass}">${escapeHtml(a.status)}</span>
            <button class="icon-button edit" data-edit="anomaly:${a.id}" title="Bearbeiten">✎</button>
            <button class="icon-button" data-anomaly-delete="${a.id}" title="Löschen">×</button>
          </span>
        </div>
        ${a.hypothesis ? `<details><summary>Hypothesen & Quellen</summary><p><strong>Hypothesen:</strong><br>${escapeHtml(a.hypothesis).replace(/\n/g, "<br>")}</p>${a.dataSourcesChecked ? `<p class="muted"><strong>Zu prüfen:</strong> ${escapeHtml(a.dataSourcesChecked)}</p>` : ""}${a.conclusion ? `<p><strong>Befund:</strong> ${escapeHtml(a.conclusion)}</p>` : ""}</details>` : ""}
      </article>`;
    }).join("") : '<p class="muted">Keine Anomalien erfasst. Brüche in den KPI-Karten oben über "Bruch dokumentieren" anlegen.</p>';

  document.querySelectorAll("[data-anomaly-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.anomalyDelete;
      if (!confirm("Anomalie löschen?")) return;
      state.anomalies = state.anomalies.filter((a) => a.id !== id);
      saveState();
      renderAnomalies();
      showToast("Anomalie gelöscht");
    });
  });
}

function renderDelta(value, label, direction) {
  if (value === null) return `<span class="kpi-delta neutral"><em>${label}</em> —</span>`;
  const cls = deltaClass(value, direction);
  const sign = value >= 0 ? "+" : "";
  return `<span class="kpi-delta ${cls}"><em>${label}</em> ${sign}${value.toFixed(1)}%</span>`;
}

const confidenceMultiplier = { hoch: 1.0, mittel: 0.7, niedrig: 0.4 };
const riskMultiplier = { niedrig: 1.0, mittel: 0.8, hoch: 0.6 };

function leverScore(lever) {
  const hours = Math.max(Number(lever.effortHours) || 0, 1);
  const impact = Number(lever.expectedImpactEur) || 0;
  const conf = confidenceMultiplier[lever.confidence] ?? 0.7;
  const rsk = riskMultiplier[lever.risk] ?? 0.8;
  return (impact / hours) * conf * rsk;
}

function formatEur(value) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value || 0);
}

let leverArea = "all";
let leverStatus = "open";
let leverSearch = "";
let leverMode = "ranking";

function renderLevers() {
  const grid = byId("lever-ranking");
  if (!grid) return;

  const areaSel = byId("lever-area-filter");
  const areas = Array.from(new Set(state.levers.map((l) => l.area).filter(Boolean))).sort();
  const currentArea = areaSel.value || "all";
  areaSel.innerHTML = `<option value="all">Alle Bereiche</option>${areas.map((a) => `<option value="${escapeHtml(a)}" ${a === currentArea ? "selected" : ""}>${escapeHtml(a)}</option>`).join("")}`;

  const filtered = state.levers.filter((l) => {
    if (leverArea !== "all" && l.area !== leverArea) return false;
    if (leverStatus === "open" && (l.status === "Live" || l.status === "Verworfen")) return false;
    if (leverStatus !== "open" && leverStatus !== "all" && l.status !== leverStatus) return false;
    if (!leverSearch) return true;
    return (l.title + " " + (l.dataBasis || "") + " " + (l.notes || "")).toLowerCase().includes(leverSearch);
  });

  const sorted = filtered.slice().sort((a, b) => leverScore(b) - leverScore(a));

  const totalImpact = sorted.reduce((sum, l) => sum + (Number(l.expectedImpactEur) || 0), 0);
  const totalHours = sorted.reduce((sum, l) => sum + (Number(l.effortHours) || 0), 0);
  byId("lever-summary").innerHTML = `
    <div class="lever-stat"><span>${sorted.length}</span><p>aktive Hebel</p></div>
    <div class="lever-stat"><span>${formatEur(totalImpact)}</span><p>potenzieller Effekt /Jahr</p></div>
    <div class="lever-stat"><span>${totalHours} h</span><p>geschätzter Aufwand</p></div>
    <div class="lever-stat"><span>${totalHours ? formatEur(totalImpact / totalHours) : "—"}</span><p>Ø Hebel pro Stunde</p></div>
  `;

  if (leverMode === "whatif") {
    grid.hidden = true;
    byId("lever-whatif").hidden = false;
    renderWhatIf();
    return;
  }
  grid.hidden = false;
  byId("lever-whatif").hidden = true;

  if (!sorted.length) {
    grid.innerHTML = '<p class="muted">Keine Hebel passend zum Filter.</p>';
    return;
  }

  const maxScore = leverScore(sorted[0]);
  grid.innerHTML = sorted.map((l, idx) => {
    const score = leverScore(l);
    const ratio = maxScore > 0 ? Math.max(score / maxScore, 0.05) : 0.05;
    const tier = idx < 3 ? "top" : idx < Math.ceil(sorted.length * 0.66) ? "mid" : "low";
    const eurPerHour = (Number(l.expectedImpactEur) || 0) / Math.max(Number(l.effortHours) || 1, 1);
    return `
      <article class="lever-card tier-${tier}">
        <div class="lever-rank">${idx + 1}</div>
        <div class="lever-main">
          <div class="item-line">
            <strong>${injectJargonHints(escapeHtml(l.title))}</strong>
            <span class="topbar-actions">
              <span class="pill ${(l.status || "").toLowerCase().replace(/\s+/g, "-")}">${escapeHtml(l.status || "—")}</span>
              <button class="icon-button edit" data-edit="lever:${l.id}" title="Bearbeiten">✎</button>
              <button class="icon-button" data-lever-delete="${l.id}" title="Löschen">×</button>
            </span>
          </div>
          <div class="lever-meta">
            <span class="lever-tag">${escapeHtml(l.area || "—")}</span>
            <span class="muted">Wirkung ${formatEur(l.expectedImpactEur)}/Jahr · Aufwand ${l.effortHours || 0} h · Konfidenz ${escapeHtml(l.confidence || "—")} · Risiko ${escapeHtml(l.risk || "—")}</span>
          </div>
          ${l.plainExplanation ? `<div class="lever-explanation">${injectJargonHints(escapeHtml(l.plainExplanation))}</div>` : ""}
          <div class="lever-bullet">
            <div class="lever-score-bar">
              <div class="lever-score-fill" style="width:${(ratio * 100).toFixed(0)}%"></div>
            </div>
            <span class="lever-bullet-marker" style="left:100%" title="Top-Score im Portfolio: ${formatEur(maxScore)}">▼</span>
          </div>
          <div class="lever-score-row">
            <span class="lever-score-value">${formatEur(score)} <em>Score</em></span>
            <span class="muted">≈ ${formatEur(eurPerHour)} / Stunde · ${(ratio * 100).toFixed(0)}% vom Top-Hebel</span>
          </div>
          ${l.dataBasis ? `<details><summary>Grundlage & Notiz</summary><p><strong>Annahme:</strong> ${escapeHtml(l.dataBasis)}</p>${l.notes ? `<p class="muted">${escapeHtml(l.notes)}</p>` : ""}</details>` : ""}
          <label class="lever-quick-status muted">Status ändern
            <select data-lever-status="${l.id}">
              ${["Idee", "Geprüft", "In Arbeit", "Live", "Verworfen"].map((s) => `<option ${l.status === s ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </label>
        </div>
      </article>`;
  }).join("");

  document.querySelectorAll("[data-lever-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const lever = state.levers.find((l) => l.id === event.target.dataset.leverStatus);
      if (!lever) return;
      lever.status = event.target.value;
      saveState();
      renderLevers();
      showToast("Hebel-Status aktualisiert");
    });
  });

  document.querySelectorAll("[data-lever-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.leverDelete;
      const lever = state.levers.find((l) => l.id === id);
      if (!lever) return;
      if (!confirm(`Hebel "${lever.title}" wirklich löschen?`)) return;
      state.levers = state.levers.filter((l) => l.id !== id);
      saveState();
      renderLevers();
      showToast("Hebel gelöscht");
    });
  });
}

const whatIfDeltas = {
  conversionDeltaPct: 0,
  aovDeltaEur: 0,
  ordersDeltaPct: 0,
  repeatDeltaPct: 0,
  returnsDeltaPct: 0
};

function renderWhatIf() {
  const container = byId("lever-whatif");
  if (!container) return;
  const b = state.baseline;

  container.innerHTML = `
    <section class="panel whatif-panel">
      <div class="panel-header">
        <h3>Baseline (deine aktuellen Zahlen)</h3>
        <button class="button small" id="whatif-save-baseline" type="button">Baseline speichern</button>
      </div>
      <div class="whatif-baseline-grid">
        <label>Umsatz / Monat (€)<input type="number" id="bl-revenue" value="${b.monthlyRevenueEur}" step="500" /></label>
        <label>Bestellungen / Monat<input type="number" id="bl-orders" value="${b.monthlyOrders}" step="10" /></label>
        <label>Ø Bestellwert (€)<input type="number" id="bl-aov" value="${b.avgOrderValueEur}" step="1" /></label>
        <label>Conversion-Rate (%)<input type="number" id="bl-cr" value="${b.conversionRatePct}" step="0.05" /></label>
        <label>Wiederkaufquote (%)<input type="number" id="bl-repeat" value="${b.repeatRatePct}" step="0.5" /></label>
        <label>Retourenquote (%)<input type="number" id="bl-returns" value="${b.returnsRatePct}" step="0.5" /></label>
        <label>Deckungsbeitrag (%)<input type="number" id="bl-margin" value="${b.grossMarginPct}" step="0.5" /></label>
      </div>
    </section>

    <section class="panel whatif-panel">
      <div class="panel-header">
        <h3>What-if (Auswirkung in € / Jahr)</h3>
        <button class="button small" id="whatif-reset" type="button">Zurücksetzen</button>
      </div>
      <div class="whatif-deltas">
        ${whatIfRow("conversionDeltaPct", "Conversion-Rate", "+0.5 pp = …", "%", 0.1)}
        ${whatIfRow("aovDeltaEur", "Ø Bestellwert", "+5 € = …", "€", 1)}
        ${whatIfRow("ordersDeltaPct", "Bestellungen (Traffic-Hebel)", "+10% = …", "%", 1)}
        ${whatIfRow("repeatDeltaPct", "Wiederkaufquote", "+5 pp = …", "pp", 0.5)}
        ${whatIfRow("returnsDeltaPct", "Retourenquote (Reduktion)", "-2 pp = …", "pp", 0.5)}
      </div>
      <div id="whatif-results" class="whatif-results"></div>
    </section>`;

  document.querySelectorAll("[data-baseline]").forEach((input) => {
    input.addEventListener("input", () => computeWhatIf());
  });
  document.querySelectorAll("[data-delta]").forEach((input) => {
    input.addEventListener("input", () => {
      whatIfDeltas[input.dataset.delta] = Number(input.value) || 0;
      computeWhatIf();
    });
  });
  byId("whatif-save-baseline").addEventListener("click", () => {
    state.baseline = {
      monthlyRevenueEur: Number(byId("bl-revenue").value) || 0,
      monthlyOrders: Number(byId("bl-orders").value) || 0,
      avgOrderValueEur: Number(byId("bl-aov").value) || 0,
      conversionRatePct: Number(byId("bl-cr").value) || 0,
      repeatRatePct: Number(byId("bl-repeat").value) || 0,
      returnsRatePct: Number(byId("bl-returns").value) || 0,
      grossMarginPct: Number(byId("bl-margin").value) || 0
    };
    saveState();
    showToast("Baseline gespeichert");
  });
  byId("whatif-reset").addEventListener("click", () => {
    Object.keys(whatIfDeltas).forEach((k) => { whatIfDeltas[k] = 0; });
    renderLevers();
  });
  ["bl-revenue", "bl-orders", "bl-aov", "bl-cr", "bl-repeat", "bl-returns", "bl-margin"].forEach((id) => {
    byId(id).addEventListener("input", computeWhatIf);
  });
  computeWhatIf();
}

function whatIfRow(key, label, hint, unit, step) {
  return `<div class="whatif-row">
    <label><strong>${escapeHtml(label)}</strong><span class="muted">${escapeHtml(hint)}</span></label>
    <div class="whatif-input">
      <input type="number" data-delta="${key}" value="${whatIfDeltas[key]}" step="${step}" />
      <span class="muted">${escapeHtml(unit)}</span>
    </div>
    <output class="whatif-output" data-output="${key}">+0 € / Jahr</output>
  </div>`;
}

function computeWhatIf() {
  const revenue = Number(byId("bl-revenue")?.value) || 0;
  const orders = Number(byId("bl-orders")?.value) || 0;
  const aov = Number(byId("bl-aov")?.value) || 0;
  const cr = Number(byId("bl-cr")?.value) || 0;
  const repeat = Number(byId("bl-repeat")?.value) || 0;
  const returns = Number(byId("bl-returns")?.value) || 0;
  const margin = (Number(byId("bl-margin")?.value) || 0) / 100;
  const yearly = revenue * 12;

  const effects = {};

  if (cr > 0) {
    effects.conversionDeltaPct = yearly * (whatIfDeltas.conversionDeltaPct / cr);
  } else {
    effects.conversionDeltaPct = 0;
  }
  effects.aovDeltaEur = (orders * 12) * whatIfDeltas.aovDeltaEur;
  effects.ordersDeltaPct = yearly * (whatIfDeltas.ordersDeltaPct / 100);
  if (repeat > 0) {
    effects.repeatDeltaPct = yearly * (whatIfDeltas.repeatDeltaPct / 100) * 0.6;
  } else {
    effects.repeatDeltaPct = 0;
  }
  effects.returnsDeltaPct = yearly * (whatIfDeltas.returnsDeltaPct / 100) * margin;

  Object.entries(effects).forEach(([key, value]) => {
    const out = document.querySelector(`[data-output="${key}"]`);
    if (out) {
      out.textContent = `${value >= 0 ? "+" : ""}${formatEur(value)} / Jahr`;
      out.classList.toggle("positive", value > 0);
      out.classList.toggle("negative", value < 0);
    }
  });

  const total = Object.values(effects).reduce((sum, v) => sum + v, 0);
  const totalMargin = total * margin;
  byId("whatif-results").innerHTML = `
    <div class="whatif-total">
      <div><span class="muted">Zusatz-Umsatz / Jahr</span><strong>${total >= 0 ? "+" : ""}${formatEur(total)}</strong></div>
      <div><span class="muted">davon Deckungsbeitrag</span><strong>${formatEur(totalMargin)}</strong></div>
      <div><span class="muted">≈ Effekt / Monat</span><strong>${formatEur(total / 12)}</strong></div>
    </div>
    <p class="muted whatif-hint">
      Hinweise: Conversion und Bestellungen wirken multiplikativ auf Jahres-Umsatz. Wiederkaufquote-Effekt mit 0.6× gewichtet (konservativ — Wiederkäufer sind nicht reines Neuumsatz). Retoure wirkt auf Deckungsbeitrag, nicht auf Brutto-Umsatz.
    </p>`;
}

// ============================================================
// Daily Briefing — KI-generierte Tageszusammenfassung
// ============================================================

function buildDailyContext() {
  const today = new Date().toISOString().slice(0, 10);
  const openTasks = (state.tasks || []).filter((t) => t.status !== "Erledigt");
  const highPrio = openTasks.filter((t) => t.priority === "hoch").slice(0, 5);
  const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < today).slice(0, 5);
  const openPromises = (state.promises || []).filter((p) => p.status === "offen" || p.status === "in Arbeit");
  const overduePromises = openPromises.filter((p) => p.dueDate && p.dueDate < today);
  const todayPromises = openPromises.filter((p) => p.dueDate === today);
  const topLevers = (state.levers || []).filter((l) => l.status !== "Live" && l.status !== "Verworfen").sort((a, b) => leverScore(b) - leverScore(a)).slice(0, 3);
  const criticalVip = (state.vipArticles || []).map((v) => ({...v, status: vipComputedStatus(v)})).filter((v) => v.status === "kritisch").slice(0, 3);
  const openAnomalies = (state.anomalies || []).filter((a) => a.status !== "geklärt" && a.status !== "verworfen");
  const todayMeetings = (state.meetings || []).filter((m) => m.date === today);

  const lines = [];
  lines.push(`Datum: ${today}`);
  lines.push(`Offene Aufgaben gesamt: ${openTasks.length}, davon ${highPrio.length} mit hoher Priorität`);
  if (overdueTasks.length) lines.push(`Überfällige Aufgaben:\n${overdueTasks.map((t) => `- ${t.title} (${t.area}, fällig ${t.dueDate})`).join("\n")}`);
  if (highPrio.length) lines.push(`Top-Aufgaben (hohe Prio):\n${highPrio.map((t) => `- ${t.title} (${t.area}, ${t.status}, bis ${t.dueDate || "offen"})`).join("\n")}`);
  if (overduePromises.length) lines.push(`Überfällige Versprechen:\n${overduePromises.map((p) => `- ${p.what} (zugesagt ${p.promisedAt}, war fällig ${p.dueDate})`).join("\n")}`);
  if (todayPromises.length) lines.push(`Heute fällige Versprechen:\n${todayPromises.map((p) => `- ${p.what}`).join("\n")}`);
  if (todayMeetings.length) lines.push(`Heutige Gespräche:\n${todayMeetings.map((m) => `- ${m.type}: ${m.goal}`).join("\n")}`);
  if (topLevers.length) lines.push(`Top-3-Hebel offen:\n${topLevers.map((l) => `- ${l.title} (${formatEur(l.expectedImpactEur)}/Jahr, Score ${formatEur(leverScore(l))})`).join("\n")}`);
  if (criticalVip.length) lines.push(`Kritische VIP-Artikel:\n${criticalVip.map((v) => `- ${v.name}: ${v.currentStock}/${v.targetStock} (${formatEur(v.revenueYear)}/Jahr)`).join("\n")}`);
  if (openAnomalies.length) lines.push(`Offene Daten-Anomalien: ${openAnomalies.length}`);
  return lines.join("\n\n");
}

async function generateDailyBriefing(force = false) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = (state.dailyBriefings || []).find((b) => b.date === today);
  if (existing && !force) return existing;
  if (!aiConfigured()) {
    showToast("KI-Key nötig für Daily Briefing");
    return null;
  }
  const context = buildDailyContext();
  const system = "Du bist Magos persönlicher Stabsoffizier. Du bekommst täglich die aktuelle Lage. Schreibe ein kompaktes Morgen-Briefing (max 200 Wörter) mit: 1) **Heute zuerst** (1 Satz, klarer Top-Fokus), 2) **3-4 konkrete Punkte** mit Bezug auf die Zahlen, 3) **Eine Warnung** falls was kippt, 4) **Empfehlung für Stephan** falls relevant. Direkt, pragmatisch, keine Floskeln.";
  const userPrompt = `Aktueller Stand:\n${context}`;
  try {
    const text = await callAi(system, userPrompt);
    const briefing = { id: uid("db"), date: today, generatedAt: new Date().toISOString(), text, context };
    state.dailyBriefings = state.dailyBriefings || [];
    if (existing) {
      const idx = state.dailyBriefings.findIndex((b) => b.id === existing.id);
      state.dailyBriefings[idx] = briefing;
    } else {
      state.dailyBriefings.unshift(briefing);
    }
    // Nur letzte 30 Tage behalten
    state.dailyBriefings = state.dailyBriefings.slice(0, 30);
    saveState();
    renderDaily();
    return briefing;
  } catch (error) {
    showToast(error.message);
    return null;
  }
}

function renderDaily() {
  const current = byId("daily-current");
  const meta = byId("daily-meta");
  const history = byId("daily-history");
  const historyCount = byId("daily-history-count");
  if (!current) return;

  const today = new Date().toISOString().slice(0, 10);
  const todays = (state.dailyBriefings || []).find((b) => b.date === today);

  if (todays) {
    current.innerHTML = `<article class="panel daily-card">
      <div class="panel-header">
        <h3>Heute · ${today}</h3>
        <span class="muted">generiert ${new Date(todays.generatedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr</span>
      </div>
      <div class="daily-text">${renderMarkdown(todays.text)}</div>
    </article>`;
    meta.textContent = "";
  } else {
    current.innerHTML = `<article class="panel daily-card empty-state">
      <p class="muted">Für heute noch kein Briefing. ${aiConfigured() ? 'Klick "Neu generieren" oben.' : "Erst KI-Key setzen (Stephan-Assistent → ⚙ KI)."}</p>
    </article>`;
    meta.textContent = aiConfigured() ? "" : "KI-Key fehlt";
  }

  const past = (state.dailyBriefings || []).filter((b) => b.date !== today);
  historyCount.textContent = past.length ? `${past.length} ältere` : "";
  history.innerHTML = past.length ? past.map((b) => `
    <details class="daily-history-item">
      <summary><strong>${b.date}</strong> <span class="muted">${new Date(b.generatedAt).toLocaleString("de-DE")}</span></summary>
      <div class="daily-text">${renderMarkdown(b.text)}</div>
    </details>`).join("") : '<p class="muted">Noch keine alten Briefings.</p>';
}

// Auto-Generierung beim ersten Aufruf des Tages
function autoTriggerDailyIfMissing() {
  if (!aiConfigured()) return;
  const today = new Date().toISOString().slice(0, 10);
  const exists = (state.dailyBriefings || []).find((b) => b.date === today);
  if (!exists) generateDailyBriefing();
}

// ============================================================
// Smart Reminders — regelbasierte Erinnerungen
// ============================================================

function computeSmartReminders() {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const reminders = [];

  // 1. Briefings älter als 7 Tage ohne Follow-up
  (state.briefings || []).forEach((b) => {
    if (!b.createdAt) return;
    const age = (Date.now() - new Date(b.createdAt).getTime()) / 86400000;
    if (age >= 7 && age < 21) {
      reminders.push({
        id: "sr-brief-" + b.id,
        type: "briefing-followup",
        text: `Briefing "${b.title}" ist ${Math.round(age)} Tage alt — Antwort von Stephan?`,
        priority: "mittel",
        view: "briefing"
      });
    }
  });

  // 2. Hebel "In Arbeit" älter als 14 Tage ohne Update
  (state.levers || []).forEach((l) => {
    if (l.status !== "In Arbeit") return;
    reminders.push({
      id: "sr-lever-" + l.id,
      type: "lever-stalled",
      text: `Hebel "${l.title}" steht seit Tagen "In Arbeit" — Status updaten?`,
      priority: "mittel",
      view: "levers"
    });
  });

  // 3. Versprechen heute fällig
  (state.promises || []).forEach((p) => {
    if (p.status !== "offen" && p.status !== "in Arbeit") return;
    if (p.dueDate === todayIso) {
      reminders.push({
        id: "sr-promise-today-" + p.id,
        type: "promise-today",
        text: `Versprechen heute fällig: "${p.what}"`,
        priority: "hoch",
        view: "meeting"
      });
    }
  });

  // 4. Kampagnen geplant aber nicht gestartet
  (state.reactivationCampaigns || []).forEach((c) => {
    if (c.status === "geplant" && c.startDate && c.startDate <= todayIso) {
      reminders.push({
        id: "sr-camp-" + c.id,
        type: "campaign-start",
        text: `Kampagne "${c.name}" hätte starten sollen — Status auf "läuft"?`,
        priority: "mittel",
        view: "champions"
      });
    }
  });

  // 5. VIP-Artikel kritisch
  (state.vipArticles || []).forEach((v) => {
    if (vipComputedStatus(v) === "kritisch") {
      reminders.push({
        id: "sr-vip-" + v.id,
        type: "vip-critical",
        text: `${v.name}: Bestand kritisch (${v.currentStock}/${v.targetStock})`,
        priority: "hoch",
        view: "vip"
      });
    }
  });

  // 6. Wiederkaufzyklus (134 Tage) — wenn letzte Kampagne lange her
  const lastCampaign = (state.reactivationCampaigns || []).filter((c) => c.status === "ausgewertet").sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""))[0];
  if (lastCampaign?.startDate) {
    const age = (Date.now() - new Date(lastCampaign.startDate).getTime()) / 86400000;
    if (age > 90) {
      reminders.push({
        id: "sr-wiederkauf",
        type: "wiederkauf-zyklus",
        text: `Letzte Reaktivierungs-Kampagne ist ${Math.round(age)} Tage her — Zyklus 134 Tage. Neue planen?`,
        priority: "mittel",
        view: "champions"
      });
    }
  }

  return reminders.sort((a, b) => {
    const prio = { hoch: 0, mittel: 1, niedrig: 2 };
    return (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3);
  });
}

// ============================================================
// Globale Suche (Ctrl/Cmd+K)
// ============================================================

let searchSelectedIndex = 0;
let lastSearchResults = [];

function buildSearchIndex(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const out = [];
  const add = (category, label, sublabel, view, jumpHash) => {
    const score = scoreMatch(q, label + " " + (sublabel || ""));
    if (score > 0) out.push({ category, label, sublabel, view, jumpHash, score });
  };

  (state.tasks || []).forEach((t) => add("Aufgabe", t.title, `${t.area} · ${t.status}`, "roadmap"));
  (state.promises || []).forEach((p) => add("Versprechen", p.what, `${p.status} · ${p.dueDate || "ohne Datum"}`, "meeting"));
  (state.levers || []).forEach((l) => add("Hebel", l.title, `${l.area} · ${formatEur(l.expectedImpactEur)}/Jahr`, "levers"));
  (state.brands || []).forEach((b) => add("Marke", b.name, `${b.category} · ${b.status}`, "brands"));
  (state.vipArticles || []).forEach((v) => add("VIP-Artikel", v.name, `${v.sku} · ${formatEur(v.revenueYear)}/Jahr`, "vip"));
  (state.systems || []).forEach((s) => add("System", s.name, `${s.category} · ${s.accessStatus}`, "systems"));
  (state.accessItems || []).forEach((a) => {
    const sys = state.systems.find((x) => x.id === a.systemId);
    add("Zugang", `${sys?.name || a.systemId}: ${a.accessType}`, a.neededFor, "access");
  });
  (state.stephanQuestions || []).forEach((q2) => add("Stephan-Frage", q2.question, q2.topic, "assistant"));
  (state.knowledgeCards || []).forEach((k) => add("Wissen", k.topic, k.summary?.slice(0, 80), "knowledge"));
  (state.briefings || []).forEach((b) => add("Briefing", b.title || "Briefing", b.problem?.slice(0, 80), "briefing"));
  (state.meetings || []).forEach((m) => add("Gespräch", `${m.type} (${m.date || "—"})`, m.goal?.slice(0, 80), "meeting"));
  (state.crossSellPairs || []).forEach((p) => add("Cross-Sell", `${p.productA} + ${p.productB}`, `${p.coOccurrences}× · ${p.status}`, "crosssell"));
  (state.bundleIdeas || []).forEach((b) => add("Bundle", b.name, b.products?.slice(0, 80), "crosssell"));
  (state.customerSegments || []).forEach((s) => add("Segment", s.name, `${s.customerCount} Kunden · ${s.status}`, "champions"));
  (state.reactivationCampaigns || []).forEach((c) => add("Kampagne", c.name, `${c.status} · ${c.size} Empfänger`, "champions"));
  (state.sortimentRules || []).forEach((r) => add("Sortiment-Regel", r.rule, `${r.priority} · ${r.status}`, "sortiment"));
  (state.aiPromptLibrary || []).forEach((p) => add("KI-Bibliothek", p.title, p.category, "aitools"));
  (state.quickNotes || []).forEach((n) => add("Notiz", n.text, n.tag, "dashboard"));
  (state.anomalies || []).forEach((a) => {
    const week = state.weeklyKpis.find((w) => w.weekStart === a.weekStart);
    add("Anomalie", `${week?.weekLabel || a.weekStart}: ${a.metric} ${a.deltaPct}%`, a.status, "anomalies");
  });
  (state.risks || []).forEach((r) => add("Risiko", r.title, `${r.category} · Score ${(r.likelihood||0)*(r.impact||0)} · ${r.status}`, "risks"));
  (state.decisionLog || []).forEach((d) => add("Entscheidung", d.title, `${d.date || ""} · ${d.impact || ""}`, "decisions"));
  (state.vendors || []).forEach((v) => add("Dienstleister", v.name, `${v.category} · ${v.status}`, "vendors"));
  (state.pitches || []).forEach((p) => add("Pitch", p.title, `${p.audience || ""} · ${p.status}`, "pitches"));
  (state.glossary || []).forEach((g) => add("Glossar", g.term, g.definition?.slice(0, 80), "glossary"));
  (state.vorhernachher || []).forEach((x) => add("Vorher/Nachher", x.title, `${x.area || ""} · ${formatEur(x.impactEur)}/Jahr`, "beforeafter"));
  (state.competitors || []).forEach((c) => add("Wettbewerber", c.name, `${c.category || ""} · ${c.threat || ""}`, "competitors"));
  (state.team || []).forEach((p) => add("Person", p.name, `${p.role || ""} · ${p.mail || ""}`, "team"));
  (state.timeEntries || []).slice(0, 30).forEach((e) => add("Zeitbuchung", e.task, `${e.area} · ${e.date}`, "time"));

  return out.sort((a, b) => b.score - a.score).slice(0, 15);
}

function scoreMatch(query, text) {
  if (!text) return 0;
  const lc = text.toLowerCase();
  if (lc === query) return 100;
  if (lc.startsWith(query)) return 80;
  if (lc.includes(" " + query)) return 70;
  if (lc.includes(query)) return 50;
  // Fuzzy: jedes Wort im Query muss vorkommen
  const words = query.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => lc.includes(w))) return 30;
  return 0;
}

function renderSearchResults(results) {
  const list = byId("search-results");
  if (!results.length) {
    list.innerHTML = '<p class="muted search-empty">Nichts gefunden</p>';
    return;
  }
  list.innerHTML = results.map((r, i) => `
    <button type="button" class="search-result ${i === searchSelectedIndex ? "selected" : ""}" data-search-index="${i}">
      <span class="search-result-cat">${escapeHtml(r.category)}</span>
      <div class="search-result-text">
        <strong>${escapeHtml(r.label)}</strong>
        ${r.sublabel ? `<span class="muted">${escapeHtml(r.sublabel)}</span>` : ""}
      </div>
    </button>`).join("");
  list.querySelectorAll("[data-search-index]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = Number(e.currentTarget.dataset.searchIndex);
      jumpToSearchResult(results[idx]);
    });
    btn.addEventListener("mouseenter", () => {
      searchSelectedIndex = Number(btn.dataset.searchIndex);
      list.querySelectorAll(".search-result").forEach((b, i) => b.classList.toggle("selected", i === searchSelectedIndex));
    });
  });
}

function jumpToSearchResult(result) {
  if (!result) return;
  byId("search-overlay").close();
  setView(result.view);
  byId("search-input").value = "";
}

function openSearch() {
  byId("search-input").value = "";
  byId("search-results").innerHTML = '<p class="muted search-empty">Tippen um zu suchen …</p>';
  searchSelectedIndex = 0;
  lastSearchResults = [];
  byId("search-overlay").showModal();
  setTimeout(() => byId("search-input").focus(), 50);
}

// ============================================================
// Quick-Add (FAB) — schnelles Erfassen in 5 Sekunden
// ============================================================

const quickAddTypes = [
  { id: "task", label: "Aufgabe", icon: "📋", color: "#2f7d59" },
  { id: "promise", label: "Versprechen", icon: "🤝", color: "#b13b35" },
  { id: "lever", label: "Hebel", icon: "⚡", color: "#a56f16" },
  { id: "question", label: "Stephan-Frage", icon: "★", color: "#2f5f96" },
  { id: "mood", label: "Mood-Reading", icon: "🟢", color: "#267274" },
  { id: "note", label: "Notiz", icon: "📝", color: "#69645d" }
];

let quickAddStep = "chooser"; // chooser | form
let quickAddCurrentType = null;

function openQuickAdd(typeId = null) {
  quickAddStep = typeId ? "form" : "chooser";
  quickAddCurrentType = typeId;
  renderQuickAdd();
  byId("quick-add-modal").showModal();
}

function renderQuickAdd() {
  const body = byId("quick-add-body");
  const title = byId("quick-add-title");
  if (!body) return;
  if (quickAddStep === "chooser") {
    title.textContent = "Schnell erfassen";
    body.innerHTML = `<div class="quick-add-grid">
      ${quickAddTypes.map((t) => `<button type="button" class="quick-add-type" data-quick-type="${t.id}" style="--accent:${t.color}">
        <span class="quick-add-icon">${t.icon}</span>
        <em>${t.label}</em>
      </button>`).join("")}
    </div>`;
    document.querySelectorAll("[data-quick-type]").forEach((b) => {
      b.addEventListener("click", () => openQuickAdd(b.dataset.quickType));
    });
    return;
  }
  // Formular pro Typ
  const type = quickAddTypes.find((t) => t.id === quickAddCurrentType);
  title.innerHTML = `<button type="button" class="icon-button" id="quick-add-back" title="Zurück">‹</button> ${type.icon} ${type.label}`;
  body.innerHTML = quickAddFormHtml(quickAddCurrentType);
  byId("quick-add-back").addEventListener("click", () => openQuickAdd(null));
  bindQuickAddForm(quickAddCurrentType);
}

function quickAddFormHtml(typeId) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  switch (typeId) {
    case "task":
      return `<div class="quick-form">
        <label>Titel<div class="voice-input-wrap"><input type="text" name="title" required autofocus /><button type="button" class="voice-btn" data-voice="title" title="Sprache">🎤</button></div></label>
        <div class="quick-row">
          <label>Bereich<select name="area">${["Support","SeBo","JTL","Shop","Einkauf","Analytics","Kundenreaktivierung"].map((a) => `<option>${a}</option>`).join("")}</select></label>
          <label>Priorität<select name="priority"><option>hoch</option><option selected>mittel</option><option>niedrig</option></select></label>
        </div>
        <label>Fällig<div class="date-shortcuts">
          <input type="date" name="dueDate" value="${nextWeek}" />
          <button type="button" data-date-shortcut="${today}">heute</button>
          <button type="button" data-date-shortcut="${tomorrow}">morgen</button>
          <button type="button" data-date-shortcut="${nextWeek}">+7T</button>
        </div></label>
        <button type="submit" class="button primary">Aufgabe anlegen</button>
      </div>`;
    case "promise":
      return `<div class="quick-form">
        <label>Was wurde versprochen<div class="voice-input-wrap"><textarea name="what" rows="2" required autofocus></textarea><button type="button" class="voice-btn" data-voice="what" title="Sprache">🎤</button></div></label>
        <label>Kontext<input type="text" name="context" placeholder="Gespräch, Mail, Slack …" /></label>
        <label>Fällig bis<div class="date-shortcuts">
          <input type="date" name="dueDate" value="${nextWeek}" />
          <button type="button" data-date-shortcut="${today}">heute</button>
          <button type="button" data-date-shortcut="${tomorrow}">morgen</button>
          <button type="button" data-date-shortcut="${nextWeek}">+7T</button>
        </div></label>
        <button type="submit" class="button primary">Versprechen erfassen</button>
      </div>`;
    case "lever":
      return `<div class="quick-form">
        <label>Hebel-Titel<div class="voice-input-wrap"><input type="text" name="title" required autofocus /><button type="button" class="voice-btn" data-voice="title" title="Sprache">🎤</button></div></label>
        <div class="quick-row">
          <label>Bereich<select name="area">${["Support","Shop","Daten","Einkauf","CRM","Tech","Strategie"].map((a) => `<option>${a}</option>`).join("")}</select></label>
          <label>Wirkung €/Jahr<input type="number" name="expectedImpactEur" value="10000" step="1000" /></label>
        </div>
        <div class="quick-row">
          <label>Aufwand h<input type="number" name="effortHours" value="20" step="5" /></label>
          <label>Konfidenz<select name="confidence"><option>hoch</option><option selected>mittel</option><option>niedrig</option></select></label>
        </div>
        <button type="submit" class="button primary">Hebel anlegen</button>
      </div>`;
    case "question":
      return `<div class="quick-form">
        <label>Frage<div class="voice-input-wrap"><textarea name="question" rows="2" required autofocus></textarea><button type="button" class="voice-btn" data-voice="question" title="Sprache">🎤</button></div></label>
        <label>Thema<select name="topic">${["Rolle","Gehalt","Support","JTL/Shop","Daten","Einkauf","Strategie","Technik"].map((t) => `<option>${t}</option>`).join("")}</select></label>
        <button type="submit" class="button primary">Frage erfassen (Antwort später)</button>
      </div>`;
    case "mood":
      return `<div class="quick-form">
        <p class="muted" style="margin:0;">Wie war Stephan im letzten Kontakt?</p>
        <div class="mood-buttons">
          <button type="button" data-mood-choice="🟢" title="entspannt">🟢</button>
          <button type="button" data-mood-choice="🟡" title="angespannt">🟡</button>
          <button type="button" data-mood-choice="🔴" title="gereizt">🔴</button>
          <button type="button" data-mood-choice="🔵" title="nachdenklich">🔵</button>
        </div>
        <label>Beobachtung (optional)<div class="voice-input-wrap"><input type="text" name="note" /><button type="button" class="voice-btn" data-voice="note" title="Sprache">🎤</button></div></label>
      </div>`;
    case "note":
      return `<div class="quick-form">
        <label>Text<div class="voice-input-wrap"><textarea name="text" rows="4" required autofocus></textarea><button type="button" class="voice-btn" data-voice="text" title="Sprache">🎤</button></div></label>
        <label>Tag (optional)<input type="text" name="tag" placeholder="z.B. einkauf, idee, stephan …" /></label>
        <button type="submit" class="button primary">Notiz speichern</button>
      </div>`;
    default:
      return "";
  }
}

function bindQuickAddForm(typeId) {
  const form = byId("quick-add-body").querySelector(".quick-form");
  if (!form) return;

  // Date-Shortcuts
  form.querySelectorAll("[data-date-shortcut]").forEach((b) => {
    b.addEventListener("click", () => {
      form.querySelector("[name='dueDate']").value = b.dataset.dateShortcut;
    });
  });

  // Voice-Buttons
  form.querySelectorAll(".voice-btn").forEach((b) => {
    b.addEventListener("click", () => startVoiceInput(b.dataset.voice, form));
  });

  // Mood-Spezialfall
  if (typeId === "mood") {
    form.querySelectorAll("[data-mood-choice]").forEach((b) => {
      b.addEventListener("click", () => {
        const note = form.querySelector("[name='note']")?.value.trim() || "";
        state.stephanMoods.unshift({ id: uid("mo"), mood: b.dataset.moodChoice, note, date: new Date().toISOString() });
        saveState();
        renderMoodLog();
        byId("quick-add-modal").close();
        showToast("Mood erfasst");
      });
    });
    return;
  }

  // Submit
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    switch (typeId) {
      case "task":
        state.tasks.unshift({
          id: uid("t"), title: data.title, area: data.area, priority: data.priority,
          status: "Backlog", impact: data.priority === "hoch" ? "hoch" : "mittel",
          effort: "mittel", owner: "Mago", dueDate: data.dueDate || "", notes: ""
        });
        renderKanban(); renderDashboard();
        showToast("Aufgabe angelegt");
        break;
      case "promise":
        state.promises.unshift({
          id: uid("pr"), what: data.what, context: data.context || "",
          promisedAt: new Date().toISOString().slice(0, 10),
          dueDate: data.dueDate || "", status: "offen", outcome: ""
        });
        renderPromises(); renderDashboard();
        showToast("Versprechen erfasst");
        break;
      case "lever":
        state.levers.unshift({
          id: uid("lev"), title: data.title, area: data.area,
          expectedImpactEur: Number(data.expectedImpactEur) || 0,
          effortHours: Number(data.effortHours) || 1,
          confidence: data.confidence, risk: "mittel", status: "Idee",
          dataBasis: "", notes: ""
        });
        renderLevers(); renderDashboard();
        showToast("Hebel angelegt");
        break;
      case "question":
        state.stephanQuestions.unshift({
          id: uid("q"), question: data.question, topic: data.topic,
          modelAnswer: "", talkingPoints: [], dataNeeded: "", confidence: 0,
          source: "quick-add", capturedAt: new Date().toISOString()
        });
        renderAssistant();
        showToast("Frage erfasst");
        break;
      case "note":
        state.quickNotes.unshift({
          id: uid("n"), text: data.text, tag: data.tag || "",
          createdAt: new Date().toISOString()
        });
        showToast("Notiz gespeichert");
        break;
    }
    saveState();
    byId("quick-add-modal").close();
  });
}

// ============================================================
// Voice-Input via Web Speech API
// ============================================================

let activeRecognition = null;

function startVoiceInput(fieldName, formContainer) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("Spracherkennung nicht unterstützt in diesem Browser");
    return;
  }
  const field = formContainer.querySelector(`[name='${fieldName}']`);
  if (!field) return;
  if (activeRecognition) { activeRecognition.stop(); activeRecognition = null; return; }

  const recognition = new SpeechRecognition();
  recognition.lang = "de-DE";
  recognition.interimResults = true;
  recognition.continuous = false;
  activeRecognition = recognition;

  const btn = formContainer.querySelector(`.voice-btn[data-voice='${fieldName}']`);
  if (btn) btn.classList.add("recording");

  let finalTranscript = "";
  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += transcript;
      else interim += transcript;
    }
    field.value = finalTranscript + interim;
  };
  recognition.onerror = (event) => {
    showToast("Sprache-Fehler: " + event.error);
  };
  recognition.onend = () => {
    if (btn) btn.classList.remove("recording");
    activeRecognition = null;
    field.value = finalTranscript || field.value;
  };
  recognition.start();
}

// ============================================================
// JTL-Live-Daten (Hersteller + Lieferanten)
// ============================================================

const jtlCache = { manufacturers: null, suppliers: null };
const jtlSearch = { manufacturers: "", suppliers: "" };

async function loadJtlData(kind) {
  if (jtlCache[kind]) return jtlCache[kind];
  const response = await fetch(`/api/jtl/${kind}`);
  if (!response.ok) throw new Error(await response.text());
  jtlCache[kind] = await response.json();
  return jtlCache[kind];
}

function renderJtlManufacturers() {
  const content = byId("jtl-manufacturers-content");
  if (!content) return;
  const data = jtlCache.manufacturers;
  if (!data) {
    content.innerHTML = '<p class="muted">Klick "↻ Aus JTL laden" — liest <code>dbo_tHersteller.csv</code> live aus dem JTL-Export.</p>';
    return;
  }

  const mapped = new Set(state.brands.map((b) => b.name.toUpperCase()));
  const search = jtlSearch.manufacturers;
  const filtered = data.rows
    .filter((r) => r.cName && r.cName.trim())
    .filter((r) => !search || r.cName.toLowerCase().includes(search))
    .sort((a, b) => a.cName.localeCompare(b.cName));

  const mappedCount = data.rows.filter((r) => r.cName && mapped.has(r.cName.toUpperCase())).length;

  content.innerHTML = `
    <div class="jtl-stats">
      <span><strong>${data.count}</strong> Hersteller in JTL</span>
      <span><strong>${mappedCount}</strong> bereits in Marken-Scorecard</span>
      <span><strong>${data.count - mappedCount}</strong> ungemappte Marken</span>
    </div>
    <input id="jtl-manufacturers-search" type="search" class="search-input" placeholder="Hersteller suchen …" value="${escapeHtml(search)}" />
    <div class="jtl-chip-grid">
      ${filtered.slice(0, 80).map((r) => {
        const isMapped = mapped.has(r.cName.toUpperCase());
        return `<span class="jtl-chip ${isMapped ? "mapped" : ""}" title="${escapeHtml(r.cHomepage || "")}">${escapeHtml(r.cName)}${isMapped ? " ✓" : ""}<button class="jtl-chip-add" data-jtl-add-brand="${escapeHtml(r.cName)}" title="Als Marke aufnehmen">+</button></span>`;
      }).join("")}
      ${filtered.length > 80 ? `<span class="muted">… und ${filtered.length - 80} weitere (Suche eingrenzen)</span>` : ""}
    </div>`;

  byId("jtl-manufacturers-search").addEventListener("input", (e) => {
    jtlSearch.manufacturers = e.target.value.trim().toLowerCase();
    renderJtlManufacturers();
  });

  document.querySelectorAll("[data-jtl-add-brand]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const name = e.currentTarget.dataset.jtlAddBrand;
      if (state.brands.some((b) => b.name.toUpperCase() === name.toUpperCase())) {
        showToast("Marke schon erfasst");
        return;
      }
      state.brands.unshift({
        id: uid("br"),
        name,
        category: "Question Mark",
        growthPct: 0,
        revenueShare: 0,
        action: "Mit Lorna prüfen, ob diese Marke aktiv geführt wird",
        status: "beobachten",
        notes: "Aus JTL-Hersteller importiert"
      });
      saveState();
      renderBrands();
      renderJtlManufacturers();
      showToast(`"${name}" als Question Mark angelegt`);
    });
  });
}

function renderJtlSuppliers() {
  const content = byId("jtl-suppliers-content");
  if (!content) return;
  const data = jtlCache.suppliers;
  if (!data) {
    content.innerHTML = '<p class="muted">Klick "↻ Aus JTL laden" — liest <code>dbo_tlieferant.csv</code> live aus dem JTL-Export.</p>';
    return;
  }

  const search = jtlSearch.suppliers;
  const filtered = data.rows
    .filter((r) => r.cFirma && r.cFirma.trim())
    .filter((r) => r.cAktiv !== "N")
    .filter((r) => !search || (r.cFirma + " " + (r.cLand || "") + " " + (r.cOrt || "")).toLowerCase().includes(search))
    .sort((a, b) => (a.cFirma || "").localeCompare(b.cFirma || ""));

  const active = data.rows.filter((r) => r.cAktiv !== "N" && r.cFirma && r.cFirma.trim()).length;
  const dropship = data.rows.filter((r) => r.nDropshipping === "1").length;
  const avgLeadTime = (() => {
    const lts = data.rows.map((r) => Number(r.nLieferzeit) || 0).filter((n) => n > 0 && n < 365);
    return lts.length ? Math.round(lts.reduce((s, x) => s + x, 0) / lts.length) : 0;
  })();

  content.innerHTML = `
    <div class="jtl-stats">
      <span><strong>${data.count}</strong> Lieferanten in JTL</span>
      <span><strong>${active}</strong> aktiv</span>
      <span><strong>${dropship}</strong> Dropshipping</span>
      <span><strong>${avgLeadTime}</strong> Tage Ø Lieferzeit</span>
    </div>
    <input id="jtl-suppliers-search" type="search" class="search-input" placeholder="Lieferant, Ort, Land suchen …" value="${escapeHtml(search)}" />
    <div class="jtl-supplier-table">
      <table>
        <thead><tr><th>Firma</th><th>Ort / Land</th><th>Lieferzeit</th><th>Min-Bestellwert</th><th>Skonto</th><th>Kontakt</th></tr></thead>
        <tbody>
          ${filtered.slice(0, 50).map((r) => `<tr>
            <td><strong>${escapeHtml(r.cFirma)}</strong>${r.nDropshipping === "1" ? ' <span class="pill bereit">DS</span>' : ""}</td>
            <td>${escapeHtml(r.cOrt || "—")} · ${escapeHtml(r.cLand || r.cISO || "—")}</td>
            <td>${r.nLieferzeit ? Number(r.nLieferzeit) + " T" : "—"}</td>
            <td>${r.fMindestbestellwert && Number(r.fMindestbestellwert) > 0 ? formatEur(Number(r.fMindestbestellwert)) : "—"}</td>
            <td>${r.fSkonto && Number(r.fSkonto) > 0 ? Number(r.fSkonto).toFixed(1) + "%" : "—"}</td>
            <td>${escapeHtml((r.cVorname || "") + " " + (r.cNachname || "")).trim() || "—"}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      ${filtered.length > 50 ? `<p class="muted">${filtered.length - 50} weitere Lieferanten — Suche eingrenzen.</p>` : ""}
    </div>`;

  byId("jtl-suppliers-search").addEventListener("input", (e) => {
    jtlSearch.suppliers = e.target.value.trim().toLowerCase();
    renderJtlSuppliers();
  });
}

// Generischer KI-Analyse-Dialog für Strategie-Views
function openAiAnalysis({ title, context, presets, systemRole }) {
  byId("edit-modal-title").textContent = "KI-Analyse: " + title;
  const fields = byId("edit-modal-fields");
  fields.innerHTML = `
    <div class="profile-row">
      <span class="profile-label">Kontext (an DeepSeek gesendet)</span>
      <pre class="ai-context">${escapeHtml(context)}</pre>
    </div>
    <label>Vordefinierte Analysen
      <div class="ai-preset-row">
        ${presets.map((p) => `<button type="button" class="button small" data-ai-preset="${escapeHtml(p.prompt)}">${escapeHtml(p.label)}</button>`).join("")}
      </div>
    </label>
    <label>Eigene Frage
      <textarea id="ai-question" rows="3" placeholder="Was willst du wissen?"></textarea>
    </label>
    <div class="ai-actions">
      <button type="button" class="button primary" id="ai-ask">▶ DeepSeek fragen</button>
    </div>
    <div id="ai-product-result" class="aitool-result" hidden></div>`;

  const form = byId("edit-form");
  form.onsubmit = (e) => { e.preventDefault(); byId("edit-modal").close(); };

  document.querySelectorAll("[data-ai-preset]").forEach((b) => {
    b.addEventListener("click", () => { byId("ai-question").value = b.dataset.aiPreset; });
  });

  byId("ai-ask").addEventListener("click", async () => {
    if (!aiConfigured()) {
      showToast("Erst KI-Key setzen (⚙ KI)");
      openAiSettings();
      return;
    }
    const q = byId("ai-question").value.trim();
    if (!q) { showToast("Bitte Frage wählen oder eingeben"); return; }
    const out = byId("ai-product-result");
    out.hidden = false;
    out.innerHTML = '<span class="muted">DeepSeek analysiert …</span>';
    try {
      const system = systemRole || "Du bist Analyst für HFK (mittelgroßer Kinder-/Baby-E-Commerce, 32.6 Mio € Umsatz, JTL Wawi). Antworte konkret mit Bezug auf die Zahlen, geschäftsfokussiert, ohne Allgemeinplätze.";
      const user = `KONTEXT:\n${context}\n\nFRAGE:\n${q}`;
      const answer = await callAi(system, user);
      out.innerHTML = renderMarkdown(answer);
    } catch (error) {
      out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  });

  byId("edit-modal").showModal();
}

// ============================================================
// Dienstleister / Vendors
// ============================================================

let vendorSearch = "";
let vendorCategoryFilter = "all";

function renderVendors() {
  if (!byId("vendors-list")) return;
  const all = state.vendors || [];
  const select = byId("vendor-category-filter");
  const cats = Array.from(new Set(all.map((v) => v.category).filter(Boolean))).sort();
  select.innerHTML = `<option value="all">Alle Kategorien</option>${cats.map((c) => `<option value="${escapeHtml(c)}" ${c === vendorCategoryFilter ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}`;

  const filtered = all.filter((v) => {
    if (vendorCategoryFilter !== "all" && v.category !== vendorCategoryFilter) return false;
    if (!vendorSearch) return true;
    return (v.name + " " + (v.role || "") + " " + (v.notes || "")).toLowerCase().includes(vendorSearch);
  });

  byId("vendors-list").innerHTML = filtered.length ? filtered
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    .map((v) => `<article class="vendor-card vendor-status-${v.status || "aktiv"}">
      <div class="item-line">
        <strong>${escapeHtml(v.name)}</strong>
        <span class="topbar-actions">
          <span class="pill ${v.status === "aktiv" ? "bereit" : v.status === "fehlt" ? "kritisch" : v.status === "geplant" ? "angefragt" : "mittel"}">${escapeHtml(v.status)}</span>
          <button class="icon-button edit" data-edit="vendor:${v.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-vendor-delete="${v.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(v.category)} · ${escapeHtml(v.role || "—")}</span>
      <div class="vendor-meta">
        ${v.contactPerson ? `<span><strong>Kontakt:</strong> ${escapeHtml(v.contactPerson)}</span>` : ""}
        ${v.contactMail ? `<span><a href="mailto:${escapeHtml(v.contactMail)}">${escapeHtml(v.contactMail)}</a></span>` : ""}
        ${v.contactPhone ? `<span><a href="tel:${escapeHtml(v.contactPhone)}">${escapeHtml(v.contactPhone)}</a></span>` : ""}
        ${v.website ? `<span><a href="${escapeHtml(v.website)}" target="_blank" rel="noopener">${escapeHtml(v.website.replace(/^https?:\/\//, ""))} ↗</a></span>` : ""}
        ${v.hourlyRate ? `<span><strong>${formatEur(v.hourlyRate)}/h</strong></span>` : ""}
        ${v.contractType ? `<span class="muted">${escapeHtml(v.contractType)}</span>` : ""}
        ${v.contractEnd ? `<span class="muted">Vertrag bis: ${escapeHtml(v.contractEnd)}</span>` : ""}
      </div>
      ${v.escalationContact ? `<div class="vendor-section accent-warn"><span class="profile-label">Eskalation bei Ausfall</span><p>${escapeHtml(v.escalationContact)}</p></div>` : ""}
      ${v.notes ? `<span class="muted">${escapeHtml(v.notes)}</span>` : ""}
    </article>`).join("") : '<p class="muted">Kein Dienstleister passt zum Filter.</p>';

  document.querySelectorAll("[data-vendor-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.vendorDelete;
      const v = state.vendors.find((x) => x.id === id);
      if (!v || !confirm(`Dienstleister "${v.name}" löschen?`)) return;
      state.vendors = state.vendors.filter((x) => x.id !== id);
      saveState(); renderVendors(); showToast("Gelöscht");
    });
  });
}

// ============================================================
// Pitch-Builder
// ============================================================

let pitchSearch = "";

function renderPitches() {
  if (!byId("pitches-list")) return;
  const list = state.pitches || [];
  const filtered = list.filter((p) => !pitchSearch || (p.title + " " + (p.problem || "") + " " + (p.solution || "")).toLowerCase().includes(pitchSearch));
  const sorted = filtered.slice().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  byId("pitches-list").innerHTML = sorted.length ? sorted.map((p) => `
    <article class="pitch-card pitch-status-${(p.status || "").toLowerCase()}">
      <div class="item-line">
        <strong>${escapeHtml(p.title)}</strong>
        <span class="topbar-actions">
          <span class="pill ${p.status === "Angenommen" ? "bereit" : p.status === "Verworfen" ? "niedrig" : p.status === "Versendet" ? "angefragt" : "mittel"}">${escapeHtml(p.status || "Entwurf")}</span>
          <button class="icon-button" data-pitch-copy="${p.id}" title="Als Markdown kopieren">📋</button>
          <button class="icon-button edit" data-edit="pitch:${p.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-pitch-delete="${p.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${p.createdAt || "—"} · An: ${escapeHtml(p.audience || "—")}</span>
      <div class="pitch-sections">
        ${p.problem ? `<div class="pitch-section"><span class="profile-label">⚠ Problem</span><p>${escapeHtml(p.problem)}</p></div>` : ""}
        ${p.evidence ? `<div class="pitch-section"><span class="profile-label">📊 Beweis</span><p>${escapeHtml(p.evidence)}</p></div>` : ""}
        ${p.solution ? `<div class="pitch-section accent-good"><span class="profile-label">✓ Lösung</span><p>${escapeHtml(p.solution)}</p></div>` : ""}
        ${p.alternatives ? `<div class="pitch-section"><span class="profile-label">↔ Alternativen</span><p>${escapeHtml(p.alternatives)}</p></div>` : ""}
        ${p.risks ? `<div class="pitch-section accent-warn"><span class="profile-label">▲ Risiken</span><p>${escapeHtml(p.risks)}</p></div>` : ""}
        ${p.nextStep ? `<div class="pitch-section accent-good"><span class="profile-label">▶ Nächster Schritt</span><p>${escapeHtml(p.nextStep)}</p></div>` : ""}
        ${p.expectedResult ? `<div class="pitch-section accent-good"><span class="profile-label">€ Erwartetes Ergebnis</span><p>${escapeHtml(p.expectedResult)}</p></div>` : ""}
      </div>
    </article>
  `).join("") : '<p class="muted">Keine Pitches erfasst. Klick "+ Pitch" oder "⚡ Aus Top-Hebel ableiten".</p>';

  document.querySelectorAll("[data-pitch-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.pitchDelete;
      const p = state.pitches.find((x) => x.id === id);
      if (!p || !confirm(`Pitch "${p.title}" löschen?`)) return;
      state.pitches = state.pitches.filter((x) => x.id !== id);
      saveState(); renderPitches(); showToast("Gelöscht");
    });
  });
  document.querySelectorAll("[data-pitch-copy]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.pitchCopy;
      const p = state.pitches.find((x) => x.id === id);
      if (!p) return;
      const md = `# ${p.title}\n\n**An:** ${p.audience || "—"} · **Datum:** ${p.createdAt || "—"}\n\n## ⚠ Problem\n${p.problem || "—"}\n\n## 📊 Beweis\n${p.evidence || "—"}\n\n## ✓ Lösung\n${p.solution || "—"}\n\n## ↔ Geprüfte Alternativen\n${p.alternatives || "—"}\n\n## ▲ Risiken\n${p.risks || "—"}\n\n## ▶ Nächster Schritt (Entscheidung)\n${p.nextStep || "—"}\n\n## € Erwartetes Ergebnis\n${p.expectedResult || "—"}`;
      copyText(md, "Pitch als Markdown kopiert");
    });
  });
}

function pitchFromTopLever() {
  const top = (state.levers || []).filter((l) => l.status !== "Live" && l.status !== "Verworfen").slice().sort((a, b) => leverScore(b) - leverScore(a))[0];
  if (!top) { showToast("Kein passender Top-Hebel"); return; }
  const pitch = {
    id: uid("pt"),
    title: `Vorschlag: ${top.title}`,
    audience: "Stephan",
    problem: `Aktueller Stand: ${top.dataBasis || top.notes || "—"}`,
    evidence: `Erwartete Wirkung ${formatEur(top.expectedImpactEur)}/Jahr bei ${top.effortHours}h Aufwand · Score ${formatEur(leverScore(top))}/h · Konfidenz ${top.confidence}`,
    solution: top.title + ". " + (top.notes || ""),
    alternatives: "",
    risks: top.risk ? `Risiko-Stufe: ${top.risk}` : "",
    nextStep: `Freigabe für ${top.effortHours}h Aufwand`,
    expectedResult: `${formatEur(top.expectedImpactEur)}/Jahr bei erwartetem Erfolg.`,
    linkedLeverId: top.id,
    status: "Entwurf",
    createdAt: new Date().toISOString().slice(0, 10)
  };
  state.pitches.unshift(pitch);
  saveState();
  renderPitches();
  setView("pitches");
  showToast(`Pitch aus "${top.title}" abgeleitet`);
}

// ============================================================
// Vorher / Nachher
// ============================================================

function renderBeforeAfter() {
  if (!byId("beforeafter-list")) return;
  const list = state.vorhernachher || [];
  const totalEur = list.reduce((s, x) => s + (Number(x.impactEur) || 0), 0);
  const lastYear = list.filter((x) => x.date && new Date(x.date) > new Date(Date.now() - 365 * 86400000));
  const lastYearEur = lastYear.reduce((s, x) => s + (Number(x.impactEur) || 0), 0);

  byId("beforeafter-summary").innerHTML = `
    <div class="lever-stat"><span>${list.length}</span><p>Maßnahmen dokumentiert</p></div>
    <div class="lever-stat"><span>${lastYear.length}</span><p>letzte 12 Monate</p></div>
    <div class="lever-stat"><span>${formatEur(totalEur)}</span><p>Wirkung gesamt (geschätzt)</p></div>
    <div class="lever-stat"><span>${formatEur(lastYearEur)}</span><p>Wirkung letzte 12M</p></div>
  `;

  const sorted = list.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  byId("beforeafter-list").innerHTML = sorted.length ? sorted.map((x) => `
    <article class="ba-card">
      <div class="item-line">
        <strong>${escapeHtml(x.title)}</strong>
        <span class="topbar-actions">
          <span class="pill bereit">${formatEur(x.impactEur)}/Jahr</span>
          <button class="icon-button edit" data-edit="beforeafter:${x.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-ba-delete="${x.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${x.date || "—"} · ${escapeHtml(x.area || "—")}</span>
      <div class="ba-grid">
        <div class="ba-cell before"><span class="profile-label">Vorher</span><p>${escapeHtml(x.before || "—")}</p></div>
        <div class="ba-arrow">→</div>
        <div class="ba-cell after"><span class="profile-label">Nachher</span><p>${escapeHtml(x.after || "—")}</p></div>
      </div>
      ${x.evidence ? `<span class="muted">Beweis: ${escapeHtml(x.evidence)}</span>` : ""}
      ${x.notes ? `<span class="muted">${escapeHtml(x.notes)}</span>` : ""}
    </article>
  `).join("") : '<p class="muted">Noch keine Maßnahme dokumentiert. Sobald du eine Veränderung durchgeführt hast: hier festhalten — wird Beleg im Vergütungs- oder Stephan-Gespräch.</p>';

  document.querySelectorAll("[data-ba-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.baDelete;
      if (!confirm("Eintrag löschen?")) return;
      state.vorhernachher = state.vorhernachher.filter((x) => x.id !== id);
      saveState(); renderBeforeAfter(); showToast("Gelöscht");
    });
  });
}

// ============================================================
// Wettbewerbs-Radar
// ============================================================

let competitorSearch = "";
let competitorThreatFilter = "all";

// ============================================================
// Lese-/Lern-Tracker
// ============================================================

let learningStatusFilter = "all";
let learningTypeFilter = "all";

function renderLearnings() {
  if (!byId("learning-summary")) return;
  const all = state.learnings || [];
  const filtered = all.filter((l) => {
    if (learningStatusFilter !== "all" && l.status !== learningStatusFilter) return false;
    if (learningTypeFilter !== "all" && l.sourceType !== learningTypeFilter) return false;
    return true;
  });
  const done = all.filter((l) => l.status === "durchgearbeitet").length;
  const inProgress = all.filter((l) => l.status === "in Bearbeitung").length;
  const avgRating = done > 0 ? (all.filter((l) => l.status === "durchgearbeitet").reduce((s, l) => s + (l.rating || 0), 0) / done).toFixed(1) : "—";

  byId("learning-summary").innerHTML = `
    <div class="lever-stat"><span>${all.length}</span><p>Lerneinträge gesamt</p></div>
    <div class="lever-stat"><span>${done}</span><p>durchgearbeitet</p></div>
    <div class="lever-stat"><span>${inProgress}</span><p>in Bearbeitung</p></div>
    <div class="lever-stat"><span>${avgRating}</span><p>Ø Bewertung (fertig)</p></div>
  `;

  byId("learning-list").innerHTML = filtered.length ? filtered.slice().sort((a, b) => (b.finishDate || b.startDate || "").localeCompare(a.finishDate || a.startDate || "")).map((l) => {
    const stars = "★".repeat(l.rating || 0) + "☆".repeat(5 - (l.rating || 0));
    const statusClass = l.status === "durchgearbeitet" ? "bereit" : l.status === "in Bearbeitung" ? "angefragt" : l.status === "abgebrochen" ? "niedrig" : "mittel";
    return `<article class="learning-card">
      <div class="item-line">
        <strong>📚 ${escapeHtml(l.title)}</strong>
        <span class="topbar-actions">
          <span class="stars">${stars}</span>
          <span class="pill entscheidung">${escapeHtml(l.sourceType)}</span>
          <span class="pill ${statusClass}">${escapeHtml(l.status)}</span>
          <button class="icon-button edit" data-edit="learning:${l.id}">✎</button>
          <button class="icon-button" data-learning-delete="${l.id}">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(l.author || "—")} · ${l.startDate || "—"}${l.finishDate ? " bis " + l.finishDate : ""}</span>
      ${l.keyTakeaways ? `<div class="learning-section accent-good"><strong>Kernlernerträge:</strong> ${escapeHtml(l.keyTakeaways)}</div>` : ""}
      ${l.appliedTo ? `<div class="learning-section"><strong>Angewendet:</strong> ${escapeHtml(l.appliedTo)}</div>` : ""}
      ${l.appliedLeverIds ? `<span class="muted">Hebel: ${escapeHtml(l.appliedLeverIds)}</span>` : ""}
      ${l.notes ? `<span class="muted">${escapeHtml(l.notes)}</span>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Keine Lerneinträge passen zum Filter.</p>';

  document.querySelectorAll("[data-learning-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.learningDelete;
      if (!confirm("Lerneintrag löschen?")) return;
      state.learnings = state.learnings.filter((x) => x.id !== id);
      saveState(); renderLearnings();
    });
  });
}

// ============================================================
// Energie- / Fokus-Tracking
// ============================================================

function renderEnergy() {
  if (!byId("energy-summary")) return;
  const all = state.energyLog || [];
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartIso = weekStart.toISOString().slice(0, 10);
  const weekEntries = all.filter((e) => e.date && e.date >= weekStartIso);
  const avgEnergy = weekEntries.length ? (weekEntries.reduce((s, e) => s + (e.energyLevel || 0), 0) / weekEntries.length).toFixed(1) : "—";
  const avgFocus = weekEntries.length ? (weekEntries.reduce((s, e) => s + (e.focusQuality || 0), 0) / weekEntries.length).toFixed(1) : "—";
  // Top-Slot
  const slotAgg = {};
  weekEntries.forEach((e) => {
    if (!slotAgg[e.timeSlot]) slotAgg[e.timeSlot] = { total: 0, count: 0 };
    slotAgg[e.timeSlot].total += (e.energyLevel || 0) + (e.focusQuality || 0);
    slotAgg[e.timeSlot].count += 2;
  });
  const topSlot = Object.entries(slotAgg).map(([k, v]) => ({ slot: k, avg: v.total / v.count })).sort((a, b) => b.avg - a.avg)[0];

  byId("energy-summary").innerHTML = `
    <div class="lever-stat"><span>${weekEntries.length}</span><p>Einträge diese Woche</p></div>
    <div class="lever-stat"><span>${avgEnergy}/5</span><p>Ø Energie</p></div>
    <div class="lever-stat"><span>${avgFocus}/5</span><p>Ø Fokus-Qualität</p></div>
    <div class="lever-stat"><span>${topSlot ? topSlot.slot : "—"}</span><p>Beste Tageszeit</p></div>
  `;

  if (byId("energy-week-label")) {
    byId("energy-week-label").textContent = `Woche ab ${weekStartIso}`;
  }

  // Heatmap: TaskType × TimeSlot, Wert = Ø(Energie+Fokus)
  const taskTypes = ["Strategie/Briefing", "Tech/Code", "Daten-Analyse", "Verhandlung", "Admin/Support", "Verwaltung", "Lernen", "Meetings", "Kreatives"];
  const slots = ["morning", "midday", "afternoon", "evening", "late-night"];
  const cells = {};
  weekEntries.forEach((e) => {
    const key = `${e.dominantTaskType}|${e.timeSlot}`;
    if (!cells[key]) cells[key] = { sum: 0, count: 0 };
    cells[key].sum += ((e.energyLevel || 0) + (e.focusQuality || 0)) / 2;
    cells[key].count++;
  });

  byId("energy-heatmap").innerHTML = `
    <div class="energy-heat-grid">
      <div class="energy-heat-header">
        <span></span>
        ${slots.map((s) => `<span>${s}</span>`).join("")}
      </div>
      ${taskTypes.map((tt) => `<div class="energy-heat-row">
        <span class="energy-task-label">${escapeHtml(tt)}</span>
        ${slots.map((sl) => {
          const c = cells[`${tt}|${sl}`];
          if (!c) return '<span class="energy-cell empty">—</span>';
          const avg = c.sum / c.count;
          const intensity = Math.round(avg / 5 * 100);
          const color = avg >= 4 ? `rgba(47,125,89,${intensity / 100})` : avg >= 3 ? `rgba(165,111,22,${intensity / 100})` : `rgba(177,59,53,${intensity / 100})`;
          return `<span class="energy-cell" style="background:${color}" title="${tt} ${sl}: Ø ${avg.toFixed(1)} (${c.count}× erfasst)">${avg.toFixed(1)}</span>`;
        }).join("")}
      </div>`).join("")}
    </div>`;

  byId("energy-list").innerHTML = all.length ? all.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 30).map((e) => `
    <article class="energy-card">
      <div class="item-line">
        <strong>⚡ ${escapeHtml(e.dominantTaskType)} · ${escapeHtml(e.timeSlot)}</strong>
        <span class="topbar-actions">
          <span class="pill ${e.energyLevel >= 4 ? "bereit" : e.energyLevel >= 3 ? "mittel" : "kritisch"}">E ${e.energyLevel}/5</span>
          <span class="pill ${e.focusQuality >= 4 ? "bereit" : e.focusQuality >= 3 ? "mittel" : "kritisch"}">F ${e.focusQuality}/5</span>
          <button class="icon-button edit" data-edit="energyentry:${e.id}">✎</button>
          <button class="icon-button" data-energy-delete="${e.id}">×</button>
        </span>
      </div>
      <span class="muted">${e.date} · ${e.duration || 0} min${e.notes ? " · " + escapeHtml(e.notes) : ""}</span>
    </article>
  `).join("") : '<p class="muted">Noch keine Einträge.</p>';

  document.querySelectorAll("[data-energy-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.energyDelete;
      if (!confirm("Eintrag löschen?")) return;
      state.energyLog = state.energyLog.filter((x) => x.id !== id);
      saveState(); renderEnergy();
    });
  });
}

function quickAddEnergyEntry() {
  const hour = new Date().getHours();
  const slot = hour < 11 ? "morning" : hour < 14 ? "midday" : hour < 18 ? "afternoon" : hour < 22 ? "evening" : "late-night";
  const energyStr = prompt("Energie 1-5? (1=tot, 3=normal, 5=Top-Zone)", "4");
  if (!energyStr) return;
  const focusStr = prompt("Fokus 1-5? (1=zerstreut, 5=tiefer Flow)", "4");
  if (!focusStr) return;
  const taskType = prompt("Aufgabentyp? (Strategie/Tech/Daten/Verhandlung/Admin/Verwaltung/Lernen/Meetings/Kreatives)", "Strategie/Briefing");
  if (!taskType) return;
  const notes = prompt("Notiz/Kontext (optional)?", "");
  state.energyLog.unshift({
    id: uid("en"),
    date: new Date().toISOString().slice(0, 10),
    timeSlot: slot,
    energyLevel: Math.max(1, Math.min(5, Number(energyStr) || 3)),
    focusQuality: Math.max(1, Math.min(5, Number(focusStr) || 3)),
    dominantTaskType: taskType,
    duration: 60,
    notes: notes || ""
  });
  saveState(); renderEnergy(); showToast("Energie-Eintrag erfasst");
}

// ============================================================
// Knowledge-Graph (SVG-basiert, eigenes Layout)
// ============================================================

let graphFocus = "all";

function buildGraphData() {
  const nodes = [];
  const edges = [];
  const addNode = (id, label, type) => {
    if (nodes.find((n) => n.id === id)) return;
    nodes.push({ id, label: label.length > 30 ? label.slice(0, 28) + "…" : label, type, full: label });
  };
  const addEdge = (from, to, type) => {
    if (!nodes.find((n) => n.id === from) || !nodes.find((n) => n.id === to)) return;
    edges.push({ from, to, type });
  };

  (state.levers || []).slice(0, 12).forEach((l) => addNode(l.id, l.title, "lever"));
  (state.hypotheses || []).forEach((h) => {
    addNode(h.id, h.title, "hypothesis");
    if (h.linkedLeverId) addEdge(h.linkedLeverId, h.id, "test");
  });
  (state.wirkungen || []).forEach((w) => {
    addNode(w.id, w.title, "wirkung");
    // Wirkung referenziert hypothese oder lever — wir machen einfach lever-link wenn die wirkung das wort enthält
    (state.levers || []).forEach((l) => {
      if (w.title.toLowerCase().includes(l.title.toLowerCase().slice(0, 12))) addEdge(l.id, w.id, "result");
    });
  });
  (state.risks || []).slice(0, 8).forEach((r) => addNode(r.id, r.title, "risk"));
  (state.preMortems || []).forEach((pm) => {
    addNode(pm.id, pm.title, "premortem");
    if (pm.linkedLeverId) addEdge(pm.linkedLeverId, pm.id, "preMortem");
  });
  (state.learnings || []).slice(0, 8).forEach((l) => {
    addNode(l.id, l.title, "learning");
    if (l.appliedLeverIds) {
      l.appliedLeverIds.split(",").map((s) => s.trim()).forEach((leverId) => {
        if (leverId) addEdge(l.id, leverId, "applied");
      });
    }
  });
  (state.decisionLog || []).slice(0, 6).forEach((d) => addNode(d.id, d.title, "decision"));
  (state.pitches || []).slice(0, 6).forEach((p) => {
    addNode(p.id, p.title, "pitch");
    if (p.linkedLeverId) addEdge(p.linkedLeverId, p.id, "pitch");
  });
  return { nodes, edges };
}

function renderGraph() {
  if (!byId("graph-container")) return;
  const data = buildGraphData();

  // Filtere nach Focus
  let filteredNodes = data.nodes;
  let filteredEdges = data.edges;
  if (graphFocus === "levers") {
    const leverIds = new Set(filteredNodes.filter((n) => n.type === "lever").map((n) => n.id));
    const relatedIds = new Set(leverIds);
    data.edges.forEach((e) => { if (leverIds.has(e.from) || leverIds.has(e.to)) { relatedIds.add(e.from); relatedIds.add(e.to); } });
    filteredNodes = filteredNodes.filter((n) => relatedIds.has(n.id));
    filteredEdges = data.edges.filter((e) => relatedIds.has(e.from) && relatedIds.has(e.to));
  } else if (graphFocus === "risks") {
    filteredNodes = data.nodes.filter((n) => n.type === "risk" || n.type === "premortem");
    filteredEdges = data.edges.filter((e) => ["risk", "premortem"].includes(filteredNodes.find((n) => n.id === e.from)?.type) || ["risk", "premortem"].includes(filteredNodes.find((n) => n.id === e.to)?.type));
  } else if (graphFocus === "learnings") {
    filteredNodes = data.nodes.filter((n) => n.type === "learning" || data.edges.some((e) => (e.from === n.id || e.to === n.id) && data.nodes.find((x) => x.id === (e.from === n.id ? e.to : e.from))?.type === "learning"));
    filteredEdges = data.edges.filter((e) => filteredNodes.find((n) => n.id === e.from) && filteredNodes.find((n) => n.id === e.to));
  }

  byId("graph-stats").innerHTML = `
    <div class="lever-stat"><span>${filteredNodes.length}</span><p>Knoten</p></div>
    <div class="lever-stat"><span>${filteredEdges.length}</span><p>Verbindungen</p></div>
    <div class="lever-stat"><span>${Array.from(new Set(filteredNodes.map((n) => n.type))).length}</span><p>Typen</p></div>
    <div class="lever-stat"><span>${filteredEdges.length ? Math.round(filteredEdges.length / Math.max(filteredNodes.length, 1) * 10) / 10 : "0"}</span><p>Ø Verbindungen/Knoten</p></div>
  `;

  // Layout: Gruppen-Cluster
  const width = 1200, height = 700;
  const groupMap = { lever: 0, hypothesis: 1, wirkung: 2, risk: 3, premortem: 4, learning: 5, decision: 6, pitch: 7 };
  const groupCount = 8;
  const radius = Math.min(width, height) * 0.42;
  const centerX = width / 2, centerY = height / 2;

  // Positionen pro Knoten: Gruppe-Sektor + Index innerhalb Gruppe
  const grouped = {};
  filteredNodes.forEach((n) => {
    if (!grouped[n.type]) grouped[n.type] = [];
    grouped[n.type].push(n);
  });
  const positions = {};
  Object.entries(grouped).forEach(([type, ns]) => {
    const groupIdx = groupMap[type] || 0;
    const groupAngle = (groupIdx / groupCount) * Math.PI * 2;
    const innerRadius = radius * 0.85;
    ns.forEach((n, i) => {
      const subAngle = groupAngle + (i - (ns.length - 1) / 2) * 0.08;
      const r = innerRadius - (i % 2) * 30;
      positions[n.id] = {
        x: centerX + Math.cos(subAngle) * r,
        y: centerY + Math.sin(subAngle) * r
      };
    });
  });

  const typeColors = {
    lever: "#a56f16", hypothesis: "#2f5f96", wirkung: "#2f7d59",
    risk: "#b13b35", premortem: "#a56f16", learning: "#267274",
    decision: "#1f1d19", pitch: "#e6b450"
  };

  const edgesSvg = filteredEdges.map((e) => {
    const a = positions[e.from], b = positions[e.to];
    if (!a || !b) return "";
    return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#c0bbad" stroke-width="1.5" opacity="0.6"/>`;
  }).join("");

  const nodesSvg = filteredNodes.map((n) => {
    const p = positions[n.id];
    if (!p) return "";
    return `<g transform="translate(${p.x},${p.y})">
      <circle r="22" fill="${typeColors[n.type] || '#69645d'}" opacity="0.9"/>
      <text y="4" text-anchor="middle" fill="white" font-size="9" font-weight="700">${n.type[0].toUpperCase()}</text>
      <text y="40" text-anchor="middle" font-size="10" fill="#1d1d1b">${escapeHtml(n.label)}</text>
    </g>`;
  }).join("");

  // Legende
  const legend = Object.entries(typeColors).filter(([t]) => filteredNodes.some((n) => n.type === t)).map(([type, color]) => `
    <span class="graph-legend-item"><span class="graph-legend-dot" style="background:${color}"></span>${type}</span>
  `).join("");

  byId("graph-container").innerHTML = `
    <div class="graph-legend">${legend}</div>
    <svg viewBox="0 0 ${width} ${height}" class="graph-svg" xmlns="http://www.w3.org/2000/svg">
      ${edgesSvg}
      ${nodesSvg}
    </svg>
    ${filteredNodes.length === 0 ? '<p class="muted" style="text-align:center;padding:30px;">Keine Knoten. Mehr Hebel/Hypothesen anlegen + verknüpfen.</p>' : ""}
  `;
}

// ============================================================
// Jahres-Recap
// ============================================================

async function generateJahresRecap() {
  if (!aiConfigured()) { showToast("KI-Key nötig"); return; }
  const year = byId("recap-year").value;
  const out = byId("recap-output");
  out.innerHTML = '<p class="muted">KI baut Jahres-Recap aus allen Daten …</p>';
  // Aggregiere Daten aus dem Jahr
  const yearPrefix = year + "-";
  const ws = (state.wirkungen || []).filter((w) => w.date && w.date.startsWith(yearPrefix));
  const tasks = (state.tasks || []).filter((t) => t.dueDate && t.dueDate.startsWith(yearPrefix) && t.status === "Erledigt");
  const promises = (state.promises || []).filter((p) => p.promisedAt && p.promisedAt.startsWith(yearPrefix));
  const promisesKept = promises.filter((p) => p.status === "eingelöst");
  const promisesMissed = promises.filter((p) => p.status === "verfehlt");
  const briefings = (state.briefings || []).filter((b) => b.createdAt && b.createdAt.startsWith(yearPrefix));
  const meetings = (state.meetings || []).filter((m) => m.date && m.date.startsWith(yearPrefix));
  const decisions = (state.decisionLog || []).filter((d) => d.date && d.date.startsWith(yearPrefix));
  const learnings = (state.learnings || []).filter((l) => l.finishDate && l.finishDate.startsWith(yearPrefix));
  const liveLevers = (state.levers || []).filter((l) => l.status === "Live");
  const hypotheses = (state.hypotheses || []);
  const hyp_right = hypotheses.filter((h) => h.wasRight === "ja").length;
  const hyp_wrong = hypotheses.filter((h) => h.wasRight === "nein").length;
  const timeMin = (state.timeEntries || []).filter((e) => e.date && e.date.startsWith(yearPrefix)).reduce((s, e) => s + (e.minutes || 0), 0);
  const totalDays = (timeMin / (60 * 8)).toFixed(0);
  const totalImpact = ws.reduce((s, w) => s + (w.impactEur || 0), 0);

  const ctx = `JAHR: ${year}
ERLEDIGTE AUFGABEN: ${tasks.length}
WIRKUNGEN ERFASST: ${ws.length} (kumuliert ${formatEur(totalImpact)})
HEBEL LIVE: ${liveLevers.length}
VERSPRECHEN: ${promises.length} gesamt, ${promisesKept.length} eingelöst, ${promisesMissed.length} verfehlt
BRIEFINGS AN STEPHAN: ${briefings.length}
GESPRÄCHE: ${meetings.length}
ENTSCHEIDUNGEN: ${decisions.length} dokumentiert
LERNEINHEITEN DURCHGEARBEITET: ${learnings.length} (${learnings.map((l) => l.title).join(", ")})
HYPOTHESEN: ${hyp_right} bestätigt / ${hyp_wrong} widerlegt
ZEIT-INVEST: ~${totalDays} PT

TOP-3 WIRKUNGEN: ${ws.sort((a, b) => (b.impactEur || 0) - (a.impactEur || 0)).slice(0, 3).map((w) => `${w.title} (${formatEur(w.impactEur)})`).join("; ") || "—"}
KEY-LEARNINGS: ${learnings.slice(0, 3).map((l) => l.title).join("; ") || "—"}`;

  byId("recap-summary").innerHTML = `
    <div class="lever-stat"><span>${tasks.length}</span><p>Aufgaben erledigt</p></div>
    <div class="lever-stat"><span>${formatEur(totalImpact)}</span><p>Wirkungs-€ kumuliert</p></div>
    <div class="lever-stat"><span>${learnings.length}</span><p>Lerneinheiten durch</p></div>
    <div class="lever-stat"><span>${totalDays}</span><p>Personentage gearbeitet</p></div>
  `;

  try {
    const text = await callAi(
      `Du bist Magos Jahres-Recap-Verfasser. Du bekommst die aggregierten Daten aus MAGALOKO für ein Jahr. Schreibe einen ehrlichen, geschäftsfreundlichen Jahres-Recap: 1) **Was geliefert** (Wirkungen in €, Top-3 Highlights), 2) **Was gelernt** (Kernlerninhalte, was wirklich hängen blieb), 3) **Was gescheitert / nicht funktioniert** (Wahrhaftigkeit über erfolgreiche Hypothesen vs. widerlegte), 4) **Welches Pattern erkannt** (was wiederholt sich), 5) **Was nächstes Jahr anders** (3 konkrete Vorhaben). Max 500 Wörter. Direkter Ton, kein Marketing-Sprech, würde Mago an einen Coach senden.`,
      ctx
    );
    out.innerHTML = renderMarkdown(text);
    // Speichere Recap
    state.jahresRecaps = state.jahresRecaps || [];
    state.jahresRecaps = state.jahresRecaps.filter((r) => r.year !== year); // ersetze alten
    state.jahresRecaps.unshift({ id: uid("recap"), year, generatedAt: new Date().toISOString(), text, stats: { tasks: tasks.length, impact: totalImpact, learnings: learnings.length, days: totalDays } });
    saveState();
    renderRecapHistory();
  } catch (error) { out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; }
}

function renderRecapHistory() {
  if (!byId("recap-history")) return;
  const history = state.jahresRecaps || [];
  if (!history.length) { byId("recap-history").innerHTML = ""; return; }
  byId("recap-history").innerHTML = `<h3 style="margin-top:24px;">Frühere Recaps</h3>` + history.map((r) => `
    <details class="recap-history-item">
      <summary><strong>${r.year}</strong> · ${new Date(r.generatedAt).toLocaleDateString("de-DE")} · ${formatEur(r.stats?.impact || 0)} Wirkung</summary>
      <div class="aitool-result" style="margin-top:10px;">${renderMarkdown(r.text)}</div>
    </details>
  `).join("");
}

// ============================================================
// Karriere-Strategie
// ============================================================

function renderCareer() {
  if (!byId("career-vision")) return;
  const v = state.careerVision || {};
  const stage = (label, key, accent) => {
    const s = v[key] || {};
    return `<div class="career-stage career-stage-${accent}">
      <h4>${label}</h4>
      <p class="career-role"><strong>${escapeHtml(s.role || "—")}</strong></p>
      <div class="career-line"><span class="muted">Einkommen</span><span>${escapeHtml(s.income || "—")}</span></div>
      <div class="career-line"><span class="muted">Ort</span><span>${escapeHtml(s.location || "—")}</span></div>
      ${s.milestones ? `<div class="career-row accent-good"><strong>Milestones</strong><p>${escapeHtml(s.milestones)}</p></div>` : ""}
      ${s.focus ? `<div class="career-row"><strong>Fokus</strong><p>${escapeHtml(s.focus)}</p></div>` : ""}
      ${s.strength ? `<div class="career-row accent-good"><strong>Stärke</strong><p>${escapeHtml(s.strength)}</p></div>` : ""}
      ${s.weakness ? `<div class="career-row accent-warn"><strong>Schwäche</strong><p>${escapeHtml(s.weakness)}</p></div>` : ""}
    </div>`;
  };
  byId("career-vision").innerHTML = `<div class="career-vision-grid">
    ${stage("Heute", "now", "now")}
    ${stage("In 1 Jahr", "year1", "year1")}
    ${stage("In 3 Jahren", "year3", "year3")}
    ${stage("In 5 Jahren", "year5", "year5")}
  </div>`;

  // Ziele
  const goals = state.careerGoals || [];
  byId("career-goals-list").innerHTML = goals.length ? goals.slice().sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999")).map((g) => {
    const statusClass = g.status === "erreicht" ? "bereit" : g.status === "verworfen" ? "niedrig" : g.status === "in Arbeit" ? "angefragt" : "mittel";
    return `<article class="career-goal">
      <div class="item-line">
        <strong>🚀 ${escapeHtml(g.title)}</strong>
        <span class="topbar-actions">
          <span class="pill ${statusClass}">${escapeHtml(g.status)}</span>
          <button class="icon-button edit" data-edit="careergoal:${g.id}">✎</button>
          <button class="icon-button" data-careergoal-delete="${g.id}">×</button>
        </span>
      </div>
      <span class="muted">Deadline: ${g.deadline || "—"}</span>
      <div class="career-progress"><div class="career-progress-fill" style="width:${g.progress || 0}%"></div></div>
      <span class="muted">${g.progress || 0}% · ${escapeHtml(g.notes || "")}</span>
    </article>`;
  }).join("") : '<p class="muted">Noch keine Ziele.</p>';

  // Skills
  const skills = state.careerSkills || [];
  byId("career-skills-list").innerHTML = skills.length ? skills.slice().sort((a, b) => {
    const order = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };
    return (order[a.relevance] ?? 3) - (order[b.relevance] ?? 3);
  }).map((s) => {
    const gap = (s.targetLevel || 0) - (s.currentLevel || 0);
    const relevanceClass = s.relevance === "kritisch" ? "kritisch" : s.relevance === "hoch" ? "mittel" : "niedrig";
    return `<article class="career-skill">
      <div class="item-line">
        <strong>${escapeHtml(s.skill)}</strong>
        <span class="topbar-actions">
          <span class="pill ${relevanceClass}">${escapeHtml(s.relevance)}</span>
          ${gap > 0 ? `<span class="pill mittel">Gap ${gap}</span>` : '<span class="pill bereit">✓</span>'}
          <button class="icon-button edit" data-edit="careerskill:${s.id}">✎</button>
          <button class="icon-button" data-careerskill-delete="${s.id}">×</button>
        </span>
      </div>
      <div class="skill-level-bars">
        <span class="muted">IST</span>
        <div class="skill-dots">${[1,2,3,4,5].map((n) => `<span class="skill-dot ${n <= (s.currentLevel || 0) ? "filled" : ""}"></span>`).join("")}</div>
        <span class="muted">SOLL</span>
        <div class="skill-dots">${[1,2,3,4,5].map((n) => `<span class="skill-dot ${n <= (s.targetLevel || 0) ? "target" : ""}"></span>`).join("")}</div>
      </div>
      ${s.lastTraining ? `<span class="muted">Letztes Training: ${escapeHtml(s.lastTraining)}</span>` : ""}
      ${s.notes ? `<span class="muted">${escapeHtml(s.notes)}</span>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Noch keine Skills.</p>';

  document.querySelectorAll("[data-careergoal-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.careergoalDelete;
      if (!confirm("Ziel löschen?")) return;
      state.careerGoals = state.careerGoals.filter((x) => x.id !== id);
      saveState(); renderCareer();
    });
  });
  document.querySelectorAll("[data-careerskill-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.careerskillDelete;
      if (!confirm("Skill löschen?")) return;
      state.careerSkills = state.careerSkills.filter((x) => x.id !== id);
      saveState(); renderCareer();
    });
  });
}

function openCareerVisionEdit() {
  byId("edit-modal-title").textContent = "Karriere-Vision";
  const v = state.careerVision || {};
  const stageFields = (key, label) => `
    <h4 style="margin:14px 0 6px;font-size:14px;">${label}</h4>
    <label>Rolle<input type="text" name="${key}_role" value="${escapeHtml(v[key]?.role || "")}" /></label>
    <label>Einkommen<input type="text" name="${key}_income" value="${escapeHtml(v[key]?.income || "")}" /></label>
    <label>Ort<input type="text" name="${key}_location" value="${escapeHtml(v[key]?.location || "")}" /></label>
    <label>Milestones / Stärke<textarea name="${key}_milestones">${escapeHtml(v[key]?.milestones || v[key]?.strength || "")}</textarea></label>
    <label>Fokus / Schwäche<textarea name="${key}_focus">${escapeHtml(v[key]?.focus || v[key]?.weakness || "")}</textarea></label>
  `;
  byId("edit-modal-fields").innerHTML = stageFields("now", "Heute (IST)") + stageFields("year1", "In 1 Jahr") + stageFields("year3", "In 3 Jahren") + stageFields("year5", "In 5 Jahren");
  const form = byId("edit-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    ["now", "year1", "year3", "year5"].forEach((key) => {
      state.careerVision[key] = {
        role: form.elements[key + "_role"].value,
        income: form.elements[key + "_income"].value,
        location: form.elements[key + "_location"].value,
        milestones: form.elements[key + "_milestones"].value,
        focus: form.elements[key + "_focus"].value
      };
      if (key === "now") {
        state.careerVision.now.strength = form.elements["now_milestones"].value;
        state.careerVision.now.weakness = form.elements["now_focus"].value;
      }
    });
    saveState(); renderCareer();
    byId("edit-modal").close();
    showToast("Vision gespeichert");
  };
  byId("edit-modal").showModal();
}

async function generateCareerCoaching() {
  if (!aiConfigured()) { showToast("KI-Key nötig"); return; }
  const v = state.careerVision || {};
  const skills = state.careerSkills || [];
  const goals = state.careerGoals || [];
  const out = byId("career-coach-output");
  out.hidden = false;
  out.innerHTML = '<p class="muted">KI analysiert Mago-Karriere …</p>';
  const ctx = `VISION:\nJetzt: ${v.now?.role || "—"}\nIn 1 Jahr: ${v.year1?.role || "—"}\nIn 3 Jahren: ${v.year3?.role || "—"}\nIn 5 Jahren: ${v.year5?.role || "—"}\n\nSKILLS (IST/SOLL/Relevanz):\n${skills.map((s) => `${s.skill}: ${s.currentLevel}/${s.targetLevel} (${s.relevance})`).join("\n")}\n\nZIELE:\n${goals.map((g) => `${g.title} (${g.deadline}, ${g.progress}%, ${g.status})`).join("\n")}`;
  try {
    const text = await callAi(
      "Du bist Karriere-Coach für selbstständige Digital-Operatoren im E-Commerce. Du bekommst Vision, Skills, Ziele. Antworte mit: 1) **Top-3 Skill-Gaps** (welche müssen am dringendsten geschlossen werden für 1-Jahres-Ziel, warum), 2) **Top-3 nächste konkrete Schritte** (in den nächsten 4 Wochen, mit Begründung), 3) **Risiko-Check** (was kann den Plan zum Scheitern bringen). Max 250 Wörter, direkt, ohne Floskeln.",
      ctx
    );
    out.innerHTML = renderMarkdown(text);
  } catch (error) { out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; }
}

// ============================================================
// Portfolio-Builder
// ============================================================

function renderPortfolio() {
  if (!byId("portfolio-summary")) return;
  const cases = state.portfolioCases || [];
  const ready = cases.filter((c) => c.status === "public-ready" || c.status === "published").length;
  byId("portfolio-summary").innerHTML = `
    <div class="lever-stat"><span>${cases.length}</span><p>Cases gesamt</p></div>
    <div class="lever-stat"><span>${ready}</span><p>public-ready</p></div>
    <div class="lever-stat"><span>${cases.filter((c) => c.anonymized).length}</span><p>anonymisiert</p></div>
    <div class="lever-stat"><span>${cases.filter((c) => c.status === "published").length}</span><p>veröffentlicht</p></div>
  `;
  byId("portfolio-list").innerHTML = cases.length ? cases.map((c) => {
    const statusClass = c.status === "published" ? "bereit" : c.status === "public-ready" ? "angefragt" : c.status === "review" ? "mittel" : "niedrig";
    return `<article class="portfolio-card">
      <div class="item-line">
        <strong>📁 ${escapeHtml(c.title)}</strong>
        <span class="topbar-actions">
          ${c.anonymized ? '<span class="pill bereit">anonymisiert</span>' : '<span class="pill kritisch">▲ noch nicht anonymisiert</span>'}
          <span class="pill ${statusClass}">${escapeHtml(c.status)}</span>
          <button class="icon-button edit" data-edit="portfoliocase:${c.id}">✎</button>
          <button class="icon-button" data-portfolio-delete="${c.id}">×</button>
        </span>
      </div>
      <span class="muted">Kategorie: ${escapeHtml(c.category)}</span>
      <div class="portfolio-section"><strong>Problem:</strong> ${escapeHtml(c.problem || "—")}</div>
      <div class="portfolio-section accent-good"><strong>Vorgehen:</strong> ${escapeHtml(c.approach || "—")}</div>
      <div class="portfolio-section accent-good"><strong>Ergebnis:</strong> ${escapeHtml(c.result || "—")}</div>
    </article>`;
  }).join("") : '<p class="muted">Noch keine Cases. Mit „🤖 Wirkung anonymisieren" aus dem Wirkungsnachweis übernehmen.</p>';

  document.querySelectorAll("[data-portfolio-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.portfolioDelete;
      if (!confirm("Case löschen?")) return;
      state.portfolioCases = state.portfolioCases.filter((x) => x.id !== id);
      saveState(); renderPortfolio();
    });
  });
}

async function generatePortfolioAnonymization() {
  if (!aiConfigured()) { showToast("KI-Key nötig"); return; }
  const ws = state.wirkungen || [];
  if (!ws.length) { showToast("Keine Wirkungen vorhanden"); return; }
  // Letzte oder per Prompt
  const choice = prompt("Welche Wirkung anonymisieren? (Titel-Teil eintippen)", ws[0].title.slice(0, 30));
  if (!choice) return;
  const wirkung = ws.find((w) => w.title.toLowerCase().includes(choice.toLowerCase()));
  if (!wirkung) { showToast("Wirkung nicht gefunden"); return; }
  const out = byId("portfolio-ai-output");
  out.hidden = false;
  out.innerHTML = '<p class="muted">KI baut anonymisierten Case …</p>';
  const ctx = `Original-Wirkung:\nTitel: ${wirkung.title}\nKategorie: ${wirkung.category}\nVorher: ${wirkung.beforeState}\nNachher: ${wirkung.afterState}\nWirkung: ${formatEur(wirkung.impactEur)} (${wirkung.impactType})\nBeweis: ${wirkung.evidence}`;
  try {
    const text = await callAi(
      'Du baust aus einer konkreten Mago-Wirkung einen anonymisierten Portfolio-Case. Ersetze HFK, Stephan, alle Marken, alle Personen durch generische Bezeichnungen (z.B. "ein Kinder-/Baby-E-Commerce ~5 Mio Euro/Jahr", "der Geschäftsführer", "der Hauptlieferant"). Struktur: **Problem** (2-3 Sätze, generisch), **Vorgehen** (3-4 Sätze, was wurde wie gemacht), **Ergebnis** (1-2 Sätze, in Euro oder Zeit oder Quality). Max 250 Wörter, geschäftsfreundlich, glaubwürdig.',
      ctx
    );
    out.innerHTML = renderMarkdown(text) + `<button class="button primary" id="save-anonymized-case" style="margin-top:14px;">📁 Als Portfolio-Case übernehmen</button>`;
    byId("save-anonymized-case").addEventListener("click", () => {
      // Parse das KI-Result in Felder
      const fullText = text;
      const problemMatch = fullText.match(/Problem[*:\s]+([\s\S]*?)(?=Vorgehen|Ergebnis|$)/i);
      const approachMatch = fullText.match(/Vorgehen[*:\s]+([\s\S]*?)(?=Ergebnis|$)/i);
      const resultMatch = fullText.match(/Ergebnis[*:\s]+([\s\S]*)/i);
      state.portfolioCases.unshift({
        id: uid("pc"),
        title: "Anonymisiert: " + wirkung.title.slice(0, 50),
        problem: (problemMatch?.[1] || fullText.slice(0, 300)).trim(),
        approach: (approachMatch?.[1] || "").trim(),
        result: (resultMatch?.[1] || "").trim(),
        category: "Beratung + Tool-Bau",
        status: "review",
        anonymized: true,
        sourceWirkungenIds: wirkung.id,
        notes: "KI-anonymisiert aus Wirkung " + wirkung.id
      });
      saveState(); renderPortfolio(); showToast("Case angelegt — bitte reviewen");
    });
  } catch (error) { out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; }
}

function exportPortfolioPublic() {
  const ready = (state.portfolioCases || []).filter((c) => (c.status === "public-ready" || c.status === "published") && c.anonymized);
  if (!ready.length) { showToast("Keine public-ready Cases"); return; }
  const md = ready.map((c) => `# ${c.title}\n\n## Problem\n${c.problem}\n\n## Vorgehen\n${c.approach}\n\n## Ergebnis\n${c.result}\n\n---`).join("\n\n");
  copyText(md, `${ready.length} Cases als Markdown kopiert`);
}

// ============================================================
// Mentor-Library
// ============================================================

let mentorSearch = "";

function renderMentors() {
  if (!byId("mentors-summary")) return;
  const ms = state.mentors || [];
  const filtered = ms.filter((m) => !mentorSearch || (m.name + " " + m.domain + " " + m.framework + " " + m.keyIdeas).toLowerCase().includes(mentorSearch));
  const integrated = ms.filter((m) => m.integrationStatus === "tief integriert" || m.integrationStatus === "in Anwendung").length;

  byId("mentors-summary").innerHTML = `
    <div class="lever-stat"><span>${ms.length}</span><p>Mentoren gesamt</p></div>
    <div class="lever-stat"><span>${integrated}</span><p>aktiv genutzt</p></div>
    <div class="lever-stat"><span>${Array.from(new Set(ms.map((m) => m.domain).filter(Boolean))).length}</span><p>Domains abgedeckt</p></div>
    <div class="lever-stat"><span>${filtered.length}</span><p>gefiltert</p></div>
  `;

  byId("mentors-list").innerHTML = filtered.length ? filtered.map((m) => {
    const statusClass = m.integrationStatus === "tief integriert" ? "bereit" : m.integrationStatus === "in Anwendung" ? "angefragt" : m.integrationStatus === "abgelegt" ? "niedrig" : "mittel";
    return `<article class="mentor-card">
      <div class="item-line">
        <strong>🧭 ${escapeHtml(m.name)}</strong>
        <span class="topbar-actions">
          <span class="pill entscheidung">${escapeHtml(m.domain)}</span>
          <span class="pill ${statusClass}">${escapeHtml(m.integrationStatus)}</span>
          <button class="icon-button edit" data-edit="mentor:${m.id}">✎</button>
          <button class="icon-button" data-mentor-delete="${m.id}">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(m.role)} · Quelle: ${escapeHtml(m.source || "—")}</span>
      ${m.framework ? `<div class="mentor-section accent-good"><strong>Framework:</strong> ${escapeHtml(m.framework)}</div>` : ""}
      ${m.keyIdeas ? `<div class="mentor-section"><strong>Kernideen:</strong> ${escapeHtml(m.keyIdeas)}</div>` : ""}
      ${m.whyRelevant ? `<div class="mentor-section accent-good"><strong>Warum für Mago:</strong> ${escapeHtml(m.whyRelevant)}</div>` : ""}
      ${m.notes ? `<span class="muted">${escapeHtml(m.notes)}</span>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Keine Mentoren passen.</p>';

  document.querySelectorAll("[data-mentor-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.mentorDelete;
      if (!confirm("Mentor löschen?")) return;
      state.mentors = state.mentors.filter((x) => x.id !== id);
      saveState(); renderMentors();
    });
  });
}

async function generateMentorSearch() {
  if (!aiConfigured()) { showToast("KI-Key nötig"); return; }
  const topic = prompt('Zu welchem Thema suchst du Vorbild/Mentor?\n(z.B. Verhandlung, Solo-Beratung skalieren, Stephan-Style Kommunikation)');
  if (!topic) return;
  const out = byId("mentor-ai-output");
  out.hidden = false;
  out.innerHTML = '<p class="muted">KI sucht passende Vorbilder …</p>';
  const existing = (state.mentors || []).map((m) => m.name).join(", ");
  try {
    const text = await callAi(
      "Du bist ein Karriere-Coach. Mago sucht Mentor/Vorbild zu einem Thema. Schlage 3-5 konkrete Personen vor (echte Namen, lebende oder verstorbene, aus Beratung/Tech/E-Commerce/Strategie). Pro Person: **Name + Rolle**, **Hauptkonzept/Buch**, **Was Mago davon lernen sollte** (in 1-2 Sätzen). Bitte vermeide bereits genutzte: " + (existing || "—") + ".",
      `Thema: ${topic}\nMago-Kontext: Selbstständiger Digital Sales & Data Lead, baut MAGALOKO (Cockpit-Tool), arbeitet bei einem Kinder-/Baby-E-Commerce (5 Mio €/Jahr), will eigene Beratung systematisieren.`
    );
    out.innerHTML = renderMarkdown(text);
  } catch (error) { out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; }
}

// ============================================================
// Capture-Inbox — alles was unterwegs kommt landet hier
// ============================================================

let captureStatusFilter = "all";

function renderCapture() {
  if (!byId("capture-summary")) return;
  const all = state.captureInbox || [];
  const open = all.filter((c) => !c.processed);
  const filtered = captureStatusFilter === "open" ? open : captureStatusFilter === "processed" ? all.filter((c) => c.processed) : all;

  byId("capture-summary").innerHTML = `
    <div class="lever-stat ${open.length ? "alert" : ""}"><span>${open.length}</span><p>unverarbeitet</p></div>
    <div class="lever-stat"><span>${all.length}</span><p>Inbox gesamt</p></div>
    <div class="lever-stat"><span>${all.filter((c) => c.processed).length}</span><p>verarbeitet</p></div>
    <div class="lever-stat"><span>${all.filter((c) => c.source !== "manual").length}</span><p>extern (Mail/Voice)</p></div>
  `;

  byId("capture-list").innerHTML = filtered.length ? filtered.slice(0, 60).map((c) => `
    <article class="capture-card ${c.processed ? "processed" : ""}">
      <div class="item-line">
        <strong>${c.processed ? "✓" : "📥"} ${escapeHtml(c.subject || c.text.slice(0, 80))}</strong>
        <span class="topbar-actions">
          <span class="pill ${c.source === "mail" ? "entscheidung" : c.source === "voice" ? "angefragt" : "mittel"}">${escapeHtml(c.source)}</span>
          ${c.processed ? `<span class="pill bereit">${escapeHtml(c.parsedKind || "verarbeitet")}</span>` : ""}
          <button class="icon-button" data-capture-delete="${c.id}">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(c.sender || "—")} · empfangen ${new Date(c.receivedAt).toLocaleString("de-DE")}</span>
      <p class="capture-text">${escapeHtml(c.text.slice(0, 600))}${c.text.length > 600 ? "…" : ""}</p>
      ${!c.processed ? `<div class="capture-actions">
        <button class="button small primary" data-capture-parse="${c.id}">🤖 KI parsen</button>
        <button class="button small" data-capture-to-task="${c.id}">→ Aufgabe</button>
        <button class="button small" data-capture-to-promise="${c.id}">→ Versprechen</button>
        <button class="button small" data-capture-to-note="${c.id}">→ Notiz</button>
        <button class="button small ghost" data-capture-dismiss="${c.id}">verwerfen</button>
      </div>` : ""}
    </article>`).join("") : '<p class="muted">Inbox leer.</p>';

  document.querySelectorAll("[data-capture-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.captureDelete;
      state.captureInbox = state.captureInbox.filter((x) => x.id !== id);
      saveState(); renderCapture();
    });
  });
  document.querySelectorAll("[data-capture-to-task]").forEach((b) => {
    b.addEventListener("click", (e) => captureConvert(e.currentTarget.dataset.captureToTask, "task"));
  });
  document.querySelectorAll("[data-capture-to-promise]").forEach((b) => {
    b.addEventListener("click", (e) => captureConvert(e.currentTarget.dataset.captureToPromise, "promise"));
  });
  document.querySelectorAll("[data-capture-to-note]").forEach((b) => {
    b.addEventListener("click", (e) => captureConvert(e.currentTarget.dataset.captureToNote, "note"));
  });
  document.querySelectorAll("[data-capture-dismiss]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.captureDismiss;
      const entry = state.captureInbox.find((x) => x.id === id);
      if (entry) { entry.processed = true; entry.parsedKind = "verworfen"; saveState(); renderCapture(); }
    });
  });
  document.querySelectorAll("[data-capture-parse]").forEach((b) => {
    b.addEventListener("click", (e) => captureAiParse(e.currentTarget.dataset.captureParse));
  });
}

function captureConvert(id, kind) {
  const entry = state.captureInbox.find((x) => x.id === id);
  if (!entry) return;
  const text = entry.text;
  if (kind === "task") {
    state.tasks.unshift({ id: uid("t"), title: text.slice(0, 100), area: "SeBo", status: "Backlog", priority: "mittel", impact: "mittel", effort: "mittel", owner: "Mago", dueDate: "", notes: "Aus Capture-Inbox: " + (entry.subject || entry.source) });
    entry.processed = true; entry.parsedKind = "Aufgabe"; entry.parsedRefId = state.tasks[0].id;
  } else if (kind === "promise") {
    state.promises.unshift({ id: uid("pr"), what: text.slice(0, 200), context: entry.subject || "Capture", promisedAt: new Date().toISOString().slice(0, 10), dueDate: "", status: "offen", outcome: "" });
    entry.processed = true; entry.parsedKind = "Versprechen"; entry.parsedRefId = state.promises[0].id;
  } else if (kind === "note") {
    state.quickNotes.unshift({ id: uid("n"), text, tag: entry.source, createdAt: new Date().toISOString() });
    entry.processed = true; entry.parsedKind = "Notiz"; entry.parsedRefId = state.quickNotes[0].id;
  }
  saveState(); renderCapture(); showToast("In " + kind + " konvertiert");
}

async function captureAiParse(id) {
  const entry = state.captureInbox.find((x) => x.id === id);
  if (!entry) return;
  if (!aiConfigured()) { showToast("KI-Key nötig"); return; }
  showToast("KI klassifiziert …");
  try {
    const text = await callAi(
      'Du bist Magos Inbox-Klassifizierer. Lies den Eintrag und entscheide: ist das (1) eine **Aufgabe** (etwas das Mago tun muss), (2) ein **Versprechen** (an jemanden, mit Frist), (3) eine **Notiz** (zur Erinnerung), oder (4) **verwerfen** (Spam/irrelevant)? Antworte NUR im Format: KIND=task|promise|note|dismiss\\nTITLE=<kurzer Titel, max 80 Zeichen>',
      `Quelle: ${entry.source}\nSubject: ${entry.subject || "—"}\nText:\n${entry.text}`
    );
    const kindMatch = text.match(/KIND=(\w+)/i);
    const titleMatch = text.match(/TITLE=(.+)/i);
    const kind = (kindMatch?.[1] || "note").toLowerCase();
    const title = titleMatch?.[1]?.trim() || entry.text.slice(0, 80);
    entry.text = title + (entry.text.length > title.length ? "\n\nOriginal:\n" + entry.text : "");
    if (kind === "dismiss") {
      entry.processed = true; entry.parsedKind = "verworfen";
      saveState(); renderCapture(); showToast("KI: verworfen");
    } else {
      captureConvert(id, kind);
    }
  } catch (error) { showToast(error.message); }
}

// ============================================================
// JTL-Trigger-Watcher
// ============================================================

function evaluateTrigger(t) {
  const s = state;
  let actual = 0;
  let description = "";
  switch (t.source) {
    case "VIP": {
      const crit = (s.vipArticles || []).filter((v) => v.targetStock && v.currentStock && (v.currentStock / v.targetStock * 100) < t.thresholdPct);
      actual = crit.length;
      description = `${crit.length} VIP-Artikel unter ${t.thresholdPct}%: ${crit.slice(0, 3).map((v) => v.name).join(", ")}`;
      return { fired: actual >= 1, actual, description };
    }
    case "Anomalies": {
      actual = (s.anomalies || []).filter((a) => a.status !== "geklärt" && a.status !== "verworfen").length;
      description = `${actual} offene Anomalien`;
      return { fired: t.direction === "above" ? actual >= t.thresholdPct : actual <= t.thresholdPct, actual, description };
    }
    case "Promises": {
      const today = new Date().toISOString().slice(0, 10);
      actual = (s.promises || []).filter((p) => (p.status === "offen" || p.status === "in Arbeit") && p.dueDate && p.dueDate < today).length;
      description = `${actual} überfällige Versprechen`;
      return { fired: actual >= 1, actual, description };
    }
    case "SeBo": {
      actual = s.seboSnapshot?.totals?.ticketsEscalated || 0;
      description = `${actual} eskalierte SeBo-Tickets`;
      return { fired: t.direction === "above" ? actual > t.thresholdPct : actual < t.thresholdPct, actual, description };
    }
    case "Risks": {
      const scores = (s.risks || []).filter((r) => r.status !== "gemindert" && r.status !== "irrelevant").map((r) => (r.likelihood || 0) * (r.impact || 0));
      actual = Math.max(...scores, 0);
      description = `Top-Risiko-Score: ${actual}`;
      return { fired: actual >= t.thresholdPct, actual, description };
    }
    case "Decisions": {
      const today = new Date().toISOString().slice(0, 10);
      actual = (s.decisionLog || []).filter((d) => d.reviewAt && d.reviewAt <= today && !d.outcome).length;
      description = `${actual} Decision-Reviews heute fällig`;
      return { fired: actual >= 1, actual, description };
    }
    default:
      return { fired: false, actual: 0, description: "unbekannte Quelle" };
  }
}

async function runAllTriggers(manualRun = false) {
  const triggers = (state.jtlTriggers || []).filter((t) => t.enabled !== false);
  let firedCount = 0;
  const fireTime = new Date().toISOString();
  for (const t of triggers) {
    t.lastChecked = fireTime;
    const result = evaluateTrigger(t);
    // Cool-down: Trigger nicht öfter als 4h pro Tag
    const lastFired = t.lastFired ? new Date(t.lastFired) : null;
    const cooldownOk = !lastFired || (Date.now() - lastFired.getTime() > 4 * 60 * 60 * 1000);
    if (result.fired && cooldownOk) {
      t.lastFired = fireTime;
      firedCount++;
      if (Notification.permission === "granted") {
        showNotification(`MAGALOKO Trigger: ${t.name}`, result.description, "trigger-" + t.id);
      } else if (manualRun) {
        showToast(`🔔 ${t.name}: ${result.description}`);
      }
    }
  }
  saveState();
  renderTriggers();
  if (manualRun) showToast(`${firedCount} von ${triggers.length} Trigger ausgelöst`);
}

function renderTriggers() {
  if (!byId("triggers-summary")) return;
  const ts = state.jtlTriggers || [];
  const enabled = ts.filter((t) => t.enabled !== false);
  const firedToday = ts.filter((t) => t.lastFired && t.lastFired.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const lastCheck = ts.map((t) => t.lastChecked).filter(Boolean).sort().reverse()[0];

  byId("triggers-summary").innerHTML = `
    <div class="lever-stat"><span>${enabled.length}</span><p>aktive Trigger</p></div>
    <div class="lever-stat ${firedToday.length ? "alert" : ""}"><span>${firedToday.length}</span><p>heute ausgelöst</p></div>
    <div class="lever-stat"><span>${ts.length}</span><p>gesamt definiert</p></div>
    <div class="lever-stat"><span>${lastCheck ? new Date(lastCheck).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "—"}</span><p>letzte Prüfung</p></div>
  `;
  if (lastCheck) byId("trigger-last-run").textContent = "Letzte Prüfung: " + new Date(lastCheck).toLocaleString("de-DE");

  byId("triggers-list").innerHTML = ts.length ? ts.map((t) => {
    const result = evaluateTrigger(t);
    const tone = result.fired ? "kritisch" : "bereit";
    return `<article class="trigger-card ${t.enabled === false ? "disabled" : ""}">
      <div class="item-line">
        <strong>🔔 ${escapeHtml(t.name)}</strong>
        <span class="topbar-actions">
          <span class="pill ${tone}">${result.fired ? "▲ würde feuern" : "✓ ok"}</span>
          <span class="pill ${t.priority === "kritisch" ? "kritisch" : t.priority === "hoch" ? "mittel" : "niedrig"}">${escapeHtml(t.priority)}</span>
          <button class="icon-button edit" data-edit="trigger:${t.id}">✎</button>
          <button class="icon-button" data-trigger-delete="${t.id}">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(t.source)} · ${escapeHtml(t.metric)} ${t.direction === "above" ? "≥" : "≤"} ${t.thresholdPct} · Stand: <strong>${result.actual}</strong></span>
      <p class="muted">${escapeHtml(result.description)}</p>
      ${t.lastFired ? `<span class="muted">Zuletzt ausgelöst: ${new Date(t.lastFired).toLocaleString("de-DE")}</span>` : ""}
      ${t.notes ? `<p class="muted">${escapeHtml(t.notes)}</p>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Keine Trigger definiert.</p>';

  document.querySelectorAll("[data-trigger-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.triggerDelete;
      if (!confirm("Trigger löschen?")) return;
      state.jtlTriggers = state.jtlTriggers.filter((x) => x.id !== id);
      saveState(); renderTriggers();
    });
  });
}

// Periodische Trigger-Prüfung (alle 4h)
setInterval(() => runAllTriggers(false), 4 * 60 * 60 * 1000);

// ============================================================
// Hypothesen-Tracking
// ============================================================

let hypothesisStatusFilter = "all";

function renderHypotheses() {
  if (!byId("hypotheses-summary")) return;
  const hs = state.hypotheses || [];
  const filtered = hypothesisStatusFilter === "all" ? hs : hs.filter((h) => h.status === hypothesisStatusFilter);
  const verified = hs.filter((h) => h.wasRight === "ja").length;
  const wrong = hs.filter((h) => h.wasRight === "nein").length;
  const partial = hs.filter((h) => h.wasRight === "teilweise").length;
  const accuracy = (verified + wrong + partial) > 0 ? Math.round(verified / (verified + wrong + partial) * 100) : 0;

  byId("hypotheses-summary").innerHTML = `
    <div class="lever-stat"><span>${hs.length}</span><p>Hypothesen gesamt</p></div>
    <div class="lever-stat"><span>${verified}</span><p>bestätigt</p></div>
    <div class="lever-stat ${wrong ? "alert" : ""}"><span>${wrong}</span><p>widerlegt</p></div>
    <div class="lever-stat"><span>${accuracy}%</span><p>Trefferquote</p></div>
  `;

  byId("hypotheses-list").innerHTML = filtered.length ? filtered.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).map((h) => {
    const statusClass = h.status === "bestätigt" ? "bereit" : h.status === "widerlegt" ? "kritisch" : h.status === "teilweise" ? "mittel" : "angefragt";
    const accuracyBadge = h.wasRight === "ja" ? '<span class="pill bereit">✓ Vorhersage korrekt</span>' : h.wasRight === "nein" ? '<span class="pill kritisch">✗ Vorhersage falsch</span>' : h.wasRight === "teilweise" ? '<span class="pill mittel">~ teilweise</span>' : "";
    return `<article class="hypothesis-card">
      <div class="item-line">
        <strong>${escapeHtml(h.title)}</strong>
        <span class="topbar-actions">
          ${accuracyBadge}
          <span class="pill ${statusClass}">${escapeHtml(h.status)}</span>
          <button class="icon-button edit" data-edit="hypothesis:${h.id}">✎</button>
          <button class="icon-button" data-hypothesis-delete="${h.id}">×</button>
        </span>
      </div>
      <div class="hypothesis-prediction">
        <span class="muted">Vorhergesagt:</span> <strong>${formatEur(h.predictionEur)}/Jahr</strong> · <strong>${h.predictionPct}%</strong> · Konfidenz ${escapeHtml(h.confidence || "—")}
        ${h.actualEur !== null && h.actualEur !== undefined ? `<br><span class="muted">Tatsächlich:</span> <strong>${formatEur(h.actualEur)}</strong> · <strong>${h.actualPct}%</strong>` : ""}
      </div>
      ${h.basis ? `<p class="muted"><strong>Basis:</strong> ${escapeHtml(h.basis)}</p>` : ""}
      <span class="muted">${escapeHtml(h.area)} · Test am ${h.testDate || "—"}${h.linkedLeverId ? " · Hebel " + escapeHtml(h.linkedLeverId) : ""}</span>
      ${h.learnings ? `<div class="lever-explanation"><strong>Lernerträge:</strong> ${escapeHtml(h.learnings)}</div>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Keine Hypothesen im Filter.</p>';

  document.querySelectorAll("[data-hypothesis-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.hypothesisDelete;
      if (!confirm("Hypothese löschen?")) return;
      state.hypotheses = state.hypotheses.filter((x) => x.id !== id);
      saveState(); renderHypotheses();
    });
  });
}

// ============================================================
// Pre-Mortems
// ============================================================

function renderPreMortems() {
  if (!byId("premortems-list")) return;
  const pms = state.preMortems || [];
  byId("premortems-list").innerHTML = pms.length ? pms.slice().sort((a, b) => (b.scenarioDate || "").localeCompare(a.scenarioDate || "")).map((pm) => {
    const statusClass = pm.status === "eingetreten" ? "kritisch" : pm.status === "neutralisiert" ? "bereit" : pm.status === "irrelevant" ? "niedrig" : "angefragt";
    const probTone = pm.probability === "hoch" ? "kritisch" : pm.probability === "mittel" ? "mittel" : "bereit";
    return `<article class="premortem-card">
      <div class="item-line">
        <strong>⚠ ${escapeHtml(pm.title)}</strong>
        <span class="topbar-actions">
          <span class="pill ${probTone}">Wahrscheinlichkeit ${escapeHtml(pm.probability)}</span>
          <span class="pill ${statusClass}">${escapeHtml(pm.status)}</span>
          <button class="icon-button edit" data-edit="premortem:${pm.id}">✎</button>
          <button class="icon-button" data-premortem-delete="${pm.id}">×</button>
        </span>
      </div>
      <span class="muted">${pm.scenarioDate || "—"}${pm.linkedLeverId ? " · Hebel " + escapeHtml(pm.linkedLeverId) : ""}</span>
      <div class="premortem-section accent-warn"><span class="profile-label">Wie es scheitert</span><p>${escapeHtml(pm.failureMode || "—")}</p></div>
      <div class="premortem-section accent-warn"><span class="profile-label">Folge</span><p>${escapeHtml(pm.impact || "—")}</p></div>
      <div class="premortem-section accent-good"><span class="profile-label">Gegenmaßnahme JETZT</span><p>${escapeHtml(pm.mitigation || "—")}</p></div>
      ${pm.earlyWarning ? `<div class="premortem-section"><span class="profile-label">Frühwarnsignal</span><p>${escapeHtml(pm.earlyWarning)}</p></div>` : ""}
      ${pm.learnings ? `<div class="lever-explanation"><strong>Lernerträge:</strong> ${escapeHtml(pm.learnings)}</div>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Noch keine Pre-Mortems. Vor jedem wichtigen Hebel einen anlegen.</p>';

  document.querySelectorAll("[data-premortem-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.premortemDelete;
      if (!confirm("Pre-Mortem löschen?")) return;
      state.preMortems = state.preMortems.filter((x) => x.id !== id);
      saveState(); renderPreMortems();
    });
  });
}

// ============================================================
// Wirkungsnachweis
// ============================================================

let wirkungQuartalFilter = "all";

function renderWirkungen() {
  if (!byId("wirkungen-summary")) return;
  const ws = state.wirkungen || [];

  const quartale = Array.from(new Set(ws.map((w) => w.quartal).filter(Boolean))).sort().reverse();
  const picker = byId("wirkung-quartal-filter");
  if (picker) {
    const current = picker.value || "all";
    picker.innerHTML = '<option value="all">Alle Quartale</option>' + quartale.map((q) => `<option value="${escapeHtml(q)}" ${q === current ? "selected" : ""}>${escapeHtml(q)}</option>`).join("");
  }

  const filtered = wirkungQuartalFilter === "all" ? ws : ws.filter((w) => w.quartal === wirkungQuartalFilter);
  const totalEur = filtered.reduce((s, w) => s + (Number(w.impactEur) || 0), 0);
  const byType = {};
  filtered.forEach((w) => { byType[w.impactType] = (byType[w.impactType] || 0) + (Number(w.impactEur) || 0); });
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];

  byId("wirkungen-summary").innerHTML = `
    <div class="lever-stat"><span>${filtered.length}</span><p>Wirkungen erfasst</p></div>
    <div class="lever-stat"><span>${formatEur(totalEur)}</span><p>kumulierte Wirkung</p></div>
    <div class="lever-stat"><span>${topType ? escapeHtml(topType[0]) : "—"}</span><p>Top-Wirkungs-Typ</p></div>
    <div class="lever-stat"><span>${quartale.length}</span><p>Quartale aktiv</p></div>
  `;

  byId("wirkungen-list").innerHTML = filtered.length ? filtered.sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((w) => `
    <article class="wirkung-card">
      <div class="item-line">
        <strong>★ ${escapeHtml(w.title)}</strong>
        <span class="topbar-actions">
          ${w.impactEur ? `<span class="pill bereit">${formatEur(w.impactEur)}</span>` : ""}
          <span class="pill entscheidung">${escapeHtml(w.impactType)}</span>
          <button class="icon-button edit" data-edit="wirkung:${w.id}">✎</button>
          <button class="icon-button" data-wirkung-delete="${w.id}">×</button>
        </span>
      </div>
      <span class="muted">${w.date || "—"} · ${escapeHtml(w.quartal)} · ${escapeHtml(w.category)}${w.verifiedBy ? " · verifiziert durch " + escapeHtml(w.verifiedBy) : ""}</span>
      ${w.beforeState ? `<div class="wirkung-row"><strong>Vorher:</strong> ${escapeHtml(w.beforeState)}</div>` : ""}
      ${w.afterState ? `<div class="wirkung-row accent-good"><strong>Nachher:</strong> ${escapeHtml(w.afterState)}</div>` : ""}
      ${w.evidence ? `<span class="muted"><strong>Beweis:</strong> ${escapeHtml(w.evidence)}</span>` : ""}
    </article>
  `).join("") : '<p class="muted">Noch keine Wirkungen erfasst.</p>';

  document.querySelectorAll("[data-wirkung-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.wirkungDelete;
      if (!confirm("Wirkung löschen?")) return;
      state.wirkungen = state.wirkungen.filter((x) => x.id !== id);
      saveState(); renderWirkungen();
    });
  });
}

async function generateWirkungenReport() {
  if (!aiConfigured()) { showToast("KI-Key nötig"); return; }
  const ws = wirkungQuartalFilter === "all" ? (state.wirkungen || []) : (state.wirkungen || []).filter((w) => w.quartal === wirkungQuartalFilter);
  if (!ws.length) { showToast("Keine Wirkungen erfasst"); return; }
  const out = byId("wirkungen-report");
  out.hidden = false;
  out.innerHTML = '<p class="muted">KI baut Quartals-Bilanz …</p>';
  const ctx = ws.map((w) => `${w.title} (${w.date}, ${w.impactType}, ${formatEur(w.impactEur)}): ${w.beforeState} → ${w.afterState}`).join("\n");
  try {
    const text = await callAi(
      "Du bist Magos Reports-Generator. Bau aus den erfassten Wirkungen eine 1-Seiten-Quartals-Bilanz für Stephan: Was wurde geliefert (in €), was sind die 3 Highlights, was ist die nächste große Sache. Max 200 Wörter, geschäftsfreundlich, keine Floskeln.",
      `Wirkungen ${wirkungQuartalFilter}:\n${ctx}`
    );
    out.innerHTML = renderMarkdown(text);
  } catch (error) {
    out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

// ============================================================
// Saisonplan
// ============================================================

let saisonFilter = "all";

function renderSaisonplan() {
  if (!byId("saison-summary")) return;
  const items = state.saisonPlan || [];
  const filtered = saisonFilter === "all" ? items : items.filter((i) => i.season === saisonFilter);
  const today = new Date();
  const dueIn30 = filtered.filter((i) => i.orderByDate && new Date(i.orderByDate) <= new Date(today.getTime() + 30 * 86400000));
  const overdue = filtered.filter((i) => i.orderByDate && i.orderByDate < today.toISOString().slice(0, 10) && i.status !== "Bestellt" && i.status !== "Geliefert");

  byId("saison-summary").innerHTML = `
    <div class="lever-stat"><span>${items.length}</span><p>Plan-Einträge</p></div>
    <div class="lever-stat ${dueIn30.length ? "alert" : ""}"><span>${dueIn30.length}</span><p>fällig in 30T</p></div>
    <div class="lever-stat ${overdue.length ? "alert" : ""}"><span>${overdue.length}</span><p>überfällig</p></div>
    <div class="lever-stat"><span>${items.filter((i) => i.status === "Bestellt").length}</span><p>bereits bestellt</p></div>
  `;

  byId("saison-list").innerHTML = filtered.length ? filtered.sort((a, b) => (a.orderByDate || "9999").localeCompare(b.orderByDate || "9999")).map((i) => {
    const isOverdue = i.orderByDate && i.orderByDate < today.toISOString().slice(0, 10) && i.status !== "Bestellt" && i.status !== "Geliefert";
    const statusClass = i.status === "Geliefert" ? "bereit" : i.status === "Bestellt" ? "angefragt" : isOverdue ? "kritisch" : "mittel";
    return `<article class="saison-card ${isOverdue ? "overdue" : ""}">
      <div class="item-line">
        <strong>❅ ${escapeHtml(i.productName)}</strong>
        <span class="topbar-actions">
          ${isOverdue ? '<span class="pill kritisch">▲ Überfällig</span>' : ""}
          <span class="pill ${statusClass}">${escapeHtml(i.status)}</span>
          <button class="icon-button edit" data-edit="saisonitem:${i.id}">✎</button>
          <button class="icon-button" data-saison-delete="${i.id}">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(i.season)} · Ziel: ${escapeHtml(i.targetMonth)} · Lieferzeit ${i.leadTimeDays}T · bestellen bis <strong>${i.orderByDate || "—"}</strong></span>
      <span class="muted">Vorjahres-Absatz: <strong>${i.historicalSales}</strong> · geplante Menge: <strong>${i.plannedOrder}</strong> · ${escapeHtml(i.supplier || "—")}</span>
      ${i.notes ? `<p class="muted">${escapeHtml(i.notes)}</p>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Noch keine Saisonplan-Einträge.</p>';

  document.querySelectorAll("[data-saison-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.saisonDelete;
      if (!confirm("Plan-Eintrag löschen?")) return;
      state.saisonPlan = state.saisonPlan.filter((x) => x.id !== id);
      saveState(); renderSaisonplan();
    });
  });
}

async function generateSaisonAiVorschlag() {
  if (!aiConfigured()) { showToast("KI-Key nötig"); return; }
  const out = byId("saison-ai-output");
  out.hidden = false;
  out.innerHTML = '<p class="muted">KI sucht Saison-Hebel aus SeBo-Historie …</p>';
  const snap = state.seboSnapshot || {};
  const seas = snap.seasonality || {};
  const yearly = snap.yearlyRevenue || [];
  const topVip = (state.vipArticles || []).slice(0, 8).map((v) => `${v.name}: ${v.soldUnits || 0} Stück / ${formatEur(v.revenueYear)}, Lieferzeit ${v.leadTimeDays}T, ${v.supplier}`).join("\n");
  const heat = (seas.revenueHeatmap || []).slice(0, 3).map((r) => `${r.year}: Jan ${r.months[0]}k, Feb ${r.months[1]}k, Mai ${r.months[4]}k, Sep ${r.months[8]}k, Nov ${r.months[10]}k, Dez ${r.months[11]}k`).join("\n");
  const ctx = `Heute: ${new Date().toISOString().slice(0, 10)}\n\nMonats-Bestellungen kumuliert: ${(seas.monthlyOrders || []).join(", ")}\n\nUmsatz-Heatmap (Tsd €):\n${heat}\n\nTop-VIP-Produkte:\n${topVip}`;
  try {
    const text = await callAi(
      "Du bist HFK-Saison-Planer. Sieh dir die historischen Monatsdaten + Lieferzeiten der VIP-Produkte an. Sag mir: Was muss Mago JETZT bestellen (90-180T Vorlauf) damit es zum Peak-Monat verfügbar ist? Format: 1) **In 30 Tagen bestellen** (Liste mit Begründung), 2) **In 60 Tagen bestellen**, 3) **Was zu beobachten** (Saisonalitäts-Signale). Konkret, in € und Stück.",
      ctx
    );
    out.innerHTML = renderMarkdown(text);
  } catch (error) {
    out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

// ============================================================
// Lieferanten-Verhandlungen
// ============================================================

let verhandlungStatusFilter = "all";

function renderVerhandlungen() {
  if (!byId("verhandlungen-summary")) return;
  const vs = state.verhandlungen || [];
  const filtered = verhandlungStatusFilter === "all" ? vs : vs.filter((v) => v.status === verhandlungStatusFilter);
  const won = vs.filter((v) => v.status === "gewonnen").length;
  const lost = vs.filter((v) => v.status === "verloren").length;
  const upcoming = vs.filter((v) => v.scheduledDate && v.scheduledDate >= new Date().toISOString().slice(0, 10) && (v.status === "geplant" || v.status === "vorbereitet"));

  byId("verhandlungen-summary").innerHTML = `
    <div class="lever-stat"><span>${vs.length}</span><p>Verhandlungen gesamt</p></div>
    <div class="lever-stat"><span>${won}</span><p>gewonnen</p></div>
    <div class="lever-stat ${lost ? "alert" : ""}"><span>${lost}</span><p>verloren</p></div>
    <div class="lever-stat ${upcoming.length ? "alert" : ""}"><span>${upcoming.length}</span><p>anstehend</p></div>
  `;

  byId("verhandlungen-list").innerHTML = filtered.length ? filtered.sort((a, b) => (b.scheduledDate || "").localeCompare(a.scheduledDate || "")).map((v) => {
    const statusClass = v.status === "gewonnen" ? "bereit" : v.status === "verloren" ? "kritisch" : v.status === "vorbereitet" ? "angefragt" : "mittel";
    return `<article class="verhandlung-card">
      <div class="item-line">
        <strong>⚖ ${escapeHtml(v.supplierName)}: ${escapeHtml(v.topic)}</strong>
        <span class="topbar-actions">
          <span class="pill ${statusClass}">${escapeHtml(v.status)}</span>
          <button class="icon-button edit" data-edit="verhandlung:${v.id}">✎</button>
          <button class="icon-button" data-verhandlung-delete="${v.id}">×</button>
        </span>
      </div>
      <span class="muted">Termin: ${v.scheduledDate || "—"}</span>
      ${v.magoGoal ? `<div class="verhandlung-row accent-good"><strong>Ziel:</strong> ${escapeHtml(v.magoGoal)}</div>` : ""}
      ${v.magoBatna ? `<div class="verhandlung-row accent-warn"><strong>BATNA:</strong> ${escapeHtml(v.magoBatna)}</div>` : ""}
      ${v.facts ? `<p class="muted"><strong>Faktenstack:</strong> ${escapeHtml(v.facts)}</p>` : ""}
      ${v.result ? `<div class="lever-explanation"><strong>Ergebnis:</strong> ${escapeHtml(v.result)}</div>` : ""}
      ${v.learnings ? `<div class="lever-explanation"><strong>Lernerträge:</strong> ${escapeHtml(v.learnings)}</div>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Noch keine Verhandlungen.</p>';

  document.querySelectorAll("[data-verhandlung-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.verhandlungDelete;
      if (!confirm("Verhandlung löschen?")) return;
      state.verhandlungen = state.verhandlungen.filter((x) => x.id !== id);
      saveState(); renderVerhandlungen();
    });
  });
}

async function generateVerhandlungArgumente() {
  if (!aiConfigured()) { showToast("KI-Key nötig"); return; }
  const upcoming = (state.verhandlungen || []).filter((v) => v.status === "geplant" || v.status === "vorbereitet").sort((a, b) => (a.scheduledDate || "").localeCompare(b.scheduledDate || ""))[0];
  if (!upcoming) { showToast("Keine geplante Verhandlung gefunden"); return; }
  const out = byId("verhandlung-ai-output");
  out.hidden = false;
  out.innerHTML = `<p class="muted">KI baut Argumentations-Stack für „${escapeHtml(upcoming.supplierName)}" …</p>`;
  // Suche passende Brand-Daten
  const brand = (state.brands || []).find((b) => b.name.toLowerCase().includes(upcoming.supplierName.toLowerCase()) || upcoming.supplierName.toLowerCase().includes(b.name.toLowerCase()));
  const brandCtx = brand ? `Marken-Daten: Umsatz ${formatEur(brand.revenueTotal)}, ${brand.productsCount} Produkte, ${brand.soldUnits} Stück verkauft, Kategorie ${brand.category}, Wachstum ${brand.growthPct}%, Anteil ${brand.revenueShare}%` : "Keine Marken-Daten im System";
  const ctx = `Verhandlungs-Thema: ${upcoming.topic}\nZiel: ${upcoming.magoGoal}\nBATNA: ${upcoming.magoBatna || "—"}\nBereits gesammelte Fakten: ${upcoming.facts || "—"}\nErwartete Gegen-Argumente: ${upcoming.supplierArguments || "—"}\n\n${brandCtx}`;
  try {
    const text = await callAi(
      "Du bist Magos Verhandlungs-Coach. Bau für die anstehende Lieferanten-Verhandlung einen scharfen Argumentations-Stack. Format: 1) **3 stärkste Argumente** (mit Daten), 2) **Antworten auf 3 wahrscheinlichste Lieferanten-Einwände**, 3) **Eröffnungs-Satz** für das Gespräch, 4) **Roter Faden** (3 Stationen wenn er versucht abzuweichen). Konkret, prägnant, geschäftsfokussiert.",
      ctx
    );
    out.innerHTML = renderMarkdown(text);
  } catch (error) {
    out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

function renderCompetitors() {
  if (!byId("competitors-list")) return;
  const all = state.competitors || [];
  const filtered = all.filter((c) => {
    if (competitorThreatFilter !== "all" && c.threat !== competitorThreatFilter) return false;
    if (!competitorSearch) return true;
    return (c.name + " " + (c.category || "") + " " + (c.strength || "") + " " + (c.lessons || "")).toLowerCase().includes(competitorSearch);
  });
  const threatOrder = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };
  const sorted = filtered.slice().sort((a, b) => (threatOrder[a.threat] ?? 4) - (threatOrder[b.threat] ?? 4));

  byId("competitors-list").innerHTML = sorted.length ? sorted.map((c) => {
    const lastDays = c.lastObserved ? ageInDays(c.lastObserved) : null;
    const stale = lastDays !== null && lastDays > 90;
    return `<article class="competitor-card threat-${c.threat || "niedrig"}">
      <div class="item-line">
        <strong>${escapeHtml(c.name)}</strong>
        <span class="topbar-actions">
          ${c.website ? `<a href="${escapeHtml(c.website)}" target="_blank" rel="noopener" class="button small" title="Website öffnen">↗</a>` : ""}
          <span class="pill ${c.threat === "kritisch" || c.threat === "hoch" ? "kritisch" : c.threat === "mittel" ? "mittel" : "niedrig"}">${escapeHtml(c.threat || "niedrig")}</span>
          <span class="pill entscheidung">${escapeHtml(c.priceLevel || "—")}</span>
          ${stale ? `<span class="pill kritisch">▲ ${lastDays}T alt</span>` : ""}
          <button class="icon-button edit" data-edit="competitor:${c.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-competitor-delete="${c.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(c.category || "—")} · zuletzt geprüft: ${c.lastObserved || "—"}</span>
      <div class="competitor-grid">
        ${c.strength ? `<div class="competitor-cell accent-good"><span class="profile-label">+ Stärken</span><p>${escapeHtml(c.strength)}</p></div>` : ""}
        ${c.weakness ? `<div class="competitor-cell accent-warn"><span class="profile-label">− Schwächen</span><p>${escapeHtml(c.weakness)}</p></div>` : ""}
      </div>
      ${c.priceCompare ? `<span class="muted"><strong>Preis vs. HFK:</strong> ${escapeHtml(c.priceCompare)}</span>` : ""}
      ${c.marketingNotes ? `<span class="muted"><strong>Marketing:</strong> ${escapeHtml(c.marketingNotes)}</span>` : ""}
      ${c.recentMove ? `<div class="competitor-cell accent-warn"><span class="profile-label">▲ Letzter Schritt</span><p>${escapeHtml(c.recentMove)}</p></div>` : ""}
      ${c.lessons ? `<div class="competitor-cell" style="background:#fffdf8;border-left:3px solid var(--accent);"><span class="profile-label">⚡ Lessons für HFK</span><p>${escapeHtml(c.lessons)}</p></div>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Kein Wettbewerber passt zum Filter.</p>';

  document.querySelectorAll("[data-competitor-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.competitorDelete;
      const c = state.competitors.find((x) => x.id === id);
      if (!c || !confirm(`Wettbewerber "${c.name}" löschen?`)) return;
      state.competitors = state.competitors.filter((x) => x.id !== id);
      saveState(); renderCompetitors(); showToast("Gelöscht");
    });
  });
}

// ============================================================
// Glossar
// ============================================================

let glossarySearch = "";
let glossaryCategoryFilter = "all";

function renderGlossary() {
  if (!byId("glossary-list")) return;
  const all = state.glossary || [];
  const select = byId("glossary-category-filter");
  const cats = Array.from(new Set(all.map((g) => g.category).filter(Boolean))).sort();
  select.innerHTML = `<option value="all">Alle Kategorien</option>${cats.map((c) => `<option value="${escapeHtml(c)}" ${c === glossaryCategoryFilter ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}`;

  const filtered = all.filter((g) => {
    if (glossaryCategoryFilter !== "all" && g.category !== glossaryCategoryFilter) return false;
    if (!glossarySearch) return true;
    return (g.term + " " + (g.definition || "") + " " + (g.synonyms || "")).toLowerCase().includes(glossarySearch);
  });

  byId("glossary-list").innerHTML = filtered.length ? `<div class="glossary-grid">
    ${filtered.sort((a, b) => a.term.localeCompare(b.term)).map((g) => `
      <article class="glossary-card">
        <div class="item-line">
          <strong>${escapeHtml(g.term)}</strong>
          <span class="topbar-actions">
            <span class="pill entscheidung">${escapeHtml(g.category)}</span>
            <button class="icon-button edit" data-edit="glossaryEntry:${g.id}" title="Bearbeiten">✎</button>
            <button class="icon-button" data-glossary-delete="${g.id}" title="Löschen">×</button>
          </span>
        </div>
        ${g.synonyms ? `<span class="muted">Auch: ${escapeHtml(g.synonyms)}</span>` : ""}
        <p>${escapeHtml(g.definition)}</p>
        ${g.example ? `<div class="glossary-example"><strong>Beispiel:</strong> ${escapeHtml(g.example)}</div>` : ""}
        ${g.source ? `<span class="muted">Quelle: ${escapeHtml(g.source)}</span>` : ""}
      </article>
    `).join("")}
  </div>` : '<p class="muted">Kein Eintrag passt zum Filter.</p>';

  document.querySelectorAll("[data-glossary-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.glossaryDelete;
      if (!confirm("Glossar-Eintrag löschen?")) return;
      state.glossary = state.glossary.filter((x) => x.id !== id);
      saveState(); renderGlossary(); showToast("Gelöscht");
    });
  });
}

// ============================================================
// Risk-Radar
// ============================================================

let riskStatusFilter = "all";

function riskScore(r) {
  return (Number(r.likelihood) || 0) * (Number(r.impact) || 0);
}

function renderRisks() {
  if (!byId("risks-matrix")) return;
  const risks = state.risks || [];
  const filtered = risks.filter((r) => riskStatusFilter === "all" || r.status === riskStatusFilter);
  const sorted = filtered.slice().sort((a, b) => riskScore(b) - riskScore(a));

  // 5x5-Matrix
  const cells = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []));
  sorted.forEach((r) => {
    const l = Math.max(1, Math.min(5, r.likelihood)) - 1;
    const i = Math.max(1, Math.min(5, r.impact)) - 1;
    cells[i][l].push(r);
  });

  const cellClass = (l, i) => {
    const s = (l + 1) * (i + 1);
    if (s >= 16) return "critical";
    if (s >= 9) return "high";
    if (s >= 4) return "medium";
    return "low";
  };

  byId("risks-matrix").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <h3>Risiko-Matrix (Wahrscheinlichkeit × Schaden)</h3>
        <span class="muted">${filtered.length} sichtbar / ${risks.length} gesamt</span>
      </div>
      <div class="risk-matrix">
        <div class="risk-matrix-yaxis">
          <span>Schaden</span>
        </div>
        <div class="risk-matrix-grid">
          <div class="risk-matrix-header">
            <span class="risk-axis-label">Schaden →</span>
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
          </div>
          ${[4, 3, 2, 1, 0].map((iIdx) => `
            <div class="risk-matrix-row">
              <span class="risk-axis-y">${iIdx + 1}</span>
              ${[0, 1, 2, 3, 4].map((lIdx) => {
                const items = cells[iIdx][lIdx];
                return `<div class="risk-cell risk-tone-${cellClass(lIdx, iIdx)}" title="L${lIdx+1} × I${iIdx+1}">
                  ${items.slice(0, 3).map((r) => `<span class="risk-dot" title="${escapeHtml(r.title)}">●</span>`).join("")}
                  ${items.length > 3 ? `<span class="risk-dot-more">+${items.length - 3}</span>` : ""}
                </div>`;
              }).join("")}
            </div>
          `).join("")}
          <div class="risk-matrix-footer">
            <span class="risk-axis-label">↑ Wahrscheinlichkeit ←</span>
          </div>
        </div>
      </div>
    </section>
  `;

  byId("risks-list").innerHTML = sorted.length ? `<div class="risk-cards">
    ${sorted.map((r) => {
      const score = riskScore(r);
      const tone = score >= 16 ? "critical" : score >= 9 ? "high" : score >= 4 ? "medium" : "low";
      const lastDays = r.lastReview ? ageInDays(r.lastReview) : null;
      const reviewStale = lastDays !== null && lastDays > 30;
      return `<article class="risk-card risk-tone-${tone}">
        <div class="item-line">
          <strong>${escapeHtml(r.title)}</strong>
          <span class="topbar-actions">
            <span class="pill ${r.status === "eingetreten" ? "kritisch" : r.status === "in Arbeit" ? "angefragt" : r.status === "gemindert" ? "bereit" : "mittel"}">${escapeHtml(r.status)}</span>
            <button class="icon-button edit" data-edit="risk:${r.id}" title="Bearbeiten">✎</button>
            <button class="icon-button" data-risk-delete="${r.id}" title="Löschen">×</button>
          </span>
        </div>
        <div class="risk-meta">
          <span class="risk-score-pill tone-${tone}">Score ${score}</span>
          <span class="muted">L${r.likelihood} × I${r.impact}</span>
          <span class="muted">${escapeHtml(r.category)}</span>
          <span class="muted">Owner: ${escapeHtml(r.owner || "—")}</span>
          ${reviewStale ? `<span class="pill kritisch">▲ Review-fällig (${lastDays}T)</span>` : ""}
        </div>
        ${r.signals ? `<div class="risk-section accent-warn"><span class="profile-label">Frühwarnsignale</span><p>${escapeHtml(r.signals)}</p></div>` : ""}
        ${r.mitigation ? `<div class="risk-section accent-good"><span class="profile-label">Gegenmaßnahme</span><p>${escapeHtml(r.mitigation)}</p></div>` : ""}
        ${r.notes ? `<span class="muted">${escapeHtml(r.notes)}</span>` : ""}
      </article>`;
    }).join("")}
  </div>` : '<p class="muted">Keine Risiken im Filter.</p>';

  document.querySelectorAll("[data-risk-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.riskDelete;
      const r = state.risks.find((x) => x.id === id);
      if (!r || !confirm(`Risiko "${r.title}" löschen?`)) return;
      state.risks = state.risks.filter((x) => x.id !== id);
      saveState(); renderRisks(); showToast("Gelöscht");
    });
  });
}

// ============================================================
// Decision-Log
// ============================================================

let decisionSearch = "";

function renderDecisions() {
  if (!byId("decisions-list")) return;
  const list = state.decisionLog || [];
  const filtered = list.filter((d) => {
    if (!decisionSearch) return true;
    return (d.title + " " + (d.why || "") + " " + (d.context || "")).toLowerCase().includes(decisionSearch);
  });

  const todayIso = new Date().toISOString().slice(0, 10);
  const reviewDue = list.filter((d) => d.reviewAt && d.reviewAt <= todayIso && !d.outcome);
  const reviewed = list.filter((d) => d.outcome).length;
  const total = list.length;

  byId("decisions-summary").innerHTML = `
    <div class="lever-stat"><span>${total}</span><p>Entscheidungen gesamt</p></div>
    <div class="lever-stat"><span>${reviewed}</span><p>mit Ergebnis dokumentiert</p></div>
    <div class="lever-stat ${reviewDue.length ? "alert" : ""}"><span>${reviewDue.length}</span><p>Review heute fällig</p></div>
    <div class="lever-stat"><span>${total ? Math.round(reviewed / total * 100) : 0}%</span><p>Review-Rate</p></div>
  `;

  const sorted = filtered.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  byId("decisions-list").innerHTML = sorted.length ? sorted.map((d) => {
    const reviewDueNow = d.reviewAt && d.reviewAt <= todayIso && !d.outcome;
    return `<article class="decision-log-card ${reviewDueNow ? "review-due" : ""} ${d.outcome ? "reviewed" : ""}">
      <div class="item-line">
        <strong>${escapeHtml(d.title)}</strong>
        <span class="topbar-actions">
          ${reviewDueNow ? `<span class="pill kritisch">▲ Review fällig</span>` : ""}
          ${d.outcome ? `<span class="pill bereit">✓ Reviewed</span>` : ""}
          <span class="pill ${d.impact === "hoch" ? "kritisch" : d.impact === "mittel" ? "mittel" : "niedrig"}">${escapeHtml(d.impact)}</span>
          <button class="icon-button edit" data-edit="decision:${d.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-decision-delete="${d.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${d.date || "—"} · ${escapeHtml(d.who || "—")} · Review am ${d.reviewAt || "—"}</span>
      ${d.context ? `<p><strong>Kontext:</strong> ${escapeHtml(d.context)}</p>` : ""}
      ${d.why ? `<p><strong>Warum:</strong> ${escapeHtml(d.why)}</p>` : ""}
      ${d.alternatives ? `<p class="muted"><strong>Alternativen:</strong> ${escapeHtml(d.alternatives)}</p>` : ""}
      ${d.outcome ? `<div class="decision-outcome"><strong>Ergebnis (${d.outcomeAt || "—"}):</strong> ${escapeHtml(d.outcome)}</div>` : reviewDueNow ? `<button class="button small" data-decision-review="${d.id}" type="button">▶ Ergebnis erfassen</button>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Keine Entscheidungen erfasst.</p>';

  document.querySelectorAll("[data-decision-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.decisionDelete;
      const d = state.decisionLog.find((x) => x.id === id);
      if (!d || !confirm(`Entscheidung "${d.title}" löschen?`)) return;
      state.decisionLog = state.decisionLog.filter((x) => x.id !== id);
      saveState(); renderDecisions(); showToast("Gelöscht");
    });
  });

  document.querySelectorAll("[data-decision-review]").forEach((b) => {
    b.addEventListener("click", (e) => openEdit("decision", e.currentTarget.dataset.decisionReview));
  });
}

// ============================================================
// Nutzungs-Audit — welche Views sind tot? (Wexler-Buch Kap. 32)
// ============================================================

const viewMeta = {
  dashboard: "Start", levers: "Hebel-Cockpit", anomalies: "Anomalien-Radar",
  daily: "Morgen-Briefing", week: "Wochenplan", roadmap: "Roadmap", access: "Zugänge",
  briefing: "Briefing", meeting: "Gespräch + Stephan-Profil", assistant: "Stephan-Assistent",
  aitools: "KI-Tools", purchase: "Einkaufsplaner", brands: "Marken (BCG)",
  champions: "Champions", crosssell: "Cross-Selling", sortiment: "Sortiment",
  vip: "VIP-Wächter", sebo: "SeBo-Bridge", time: "Time-Tracking",
  monthly: "Monatsbericht", team: "Team", honorar: "Honorar",
  systems: "Systeme", jobs: "Jobs & Aufgaben", knowledge: "Wissen", usage: "Nutzungs-Audit"
};

function renderUsage() {
  if (!byId("usage-list")) return;
  const usage = state.viewUsage || {};
  const allViews = Object.keys(viewMeta);
  const totalOpens = Object.values(usage).reduce((s, u) => s + (u.count || 0), 0);
  const tracked = allViews.filter((v) => usage[v]?.count).length;
  const dead = allViews.filter((v) => !usage[v]?.count || ageInDays(usage[v]?.lastOpened) > 30).length;
  const hot = allViews.filter((v) => (usage[v]?.count || 0) >= 5).length;

  byId("usage-summary").innerHTML = `
    <div class="lever-stat"><span>${tracked}</span><p>genutzte Views</p></div>
    <div class="lever-stat"><span>${hot}</span><p>Hot (≥5 Aufrufe)</p></div>
    <div class="lever-stat ${dead ? "alert" : ""}"><span>${dead}</span><p>Tot / Selten genutzt</p></div>
    <div class="lever-stat"><span>${totalOpens}</span><p>Aufrufe gesamt</p></div>
  `;

  const rows = allViews
    .map((v) => ({ key: v, label: viewMeta[v], count: usage[v]?.count || 0, lastOpened: usage[v]?.lastOpened || null }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  byId("usage-list").innerHTML = `<div class="usage-rows">
    ${rows.map((r) => {
      const widthPct = (r.count / maxCount * 100).toFixed(0);
      const lastDays = r.lastOpened ? ageInDays(r.lastOpened) : null;
      const tone = r.count === 0 ? "dead" : lastDays !== null && lastDays > 30 ? "stale" : r.count >= 5 ? "hot" : "ok";
      const lastLabel = r.lastOpened ? `vor ${lastDays}T` : "nie";
      return `<div class="usage-row tone-${tone}">
        <span class="usage-label">${escapeHtml(r.label)}</span>
        <div class="usage-bar"><div class="usage-bar-fill tone-${tone}" style="width:${widthPct}%"></div></div>
        <span class="usage-count">${r.count}</span>
        <span class="usage-last muted">${lastLabel}</span>
        <button class="button small" data-usage-jump="${r.key}" type="button">öffnen</button>
      </div>`;
    }).join("")}
  </div>`;

  document.querySelectorAll("[data-usage-jump]").forEach((b) => {
    b.addEventListener("click", () => setView(b.dataset.usageJump));
  });
}

function ageInDays(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

// Häufige Jargon-Wörter automatisch zu klickbaren Hints machen
// (case-insensitive, ganze Wörter, ein Match pro Begriff pro Text)
const JARGON_TERMS_TO_HINT = [
  "Penner", "Markdown", "OOS", "Out-of-Stock", "Reorder", "Bestseller", "Long-Tail",
  "Wiederkaufquote", "Wiederkaufzyklus", "Deckungsbeitrag", "Skonto", "MOQ", "SLA",
  "LCP", "Pagespeed", "Conversion", "Tracking", "Funnel", "AOV", "CLV", "BCG",
  "Cross-Selling", "Cross-Sell", "Bundle", "Saisonalität", "YoY", "ROAS", "CAC",
  "Touchpoint", "Child-Template", "Staging", "Doofinder", "Sleeping Champions",
  "Stammkunden", "Einmalkäufer", "DSGVO", "Brevo", "SeBo", "JTL Wawi", "JTL-Shop", "N8N", "Pareto"
];

// Container-Selectors die durch-jargonifiziert werden nach jedem render()
const JARGON_CONTAINERS = [
  "#brands-list", "#vip-list", "#dashboard-vip", "#segments-grid", "#campaigns-list",
  "#crosspairs-list", "#bundles-list", "#sortiment-rules-list", "#risks-list",
  "#vendors-list", "#decisions-list", "#pitches-list", "#beforeafter-list",
  "#competitors-list", "#today-list", "#dashboard-critical", "#dashboard-levers",
  "#reminders-list", "#stephan-summary"
];

function applyJargonHintsToContainers() {
  for (const selector of JARGON_CONTAINERS) {
    const root = document.querySelector(selector);
    if (!root) continue;
    const targets = root.querySelectorAll("strong, .muted, p");
    targets.forEach((el) => {
      if (el.querySelector(".jargon-hint")) return;
      const txt = el.textContent.trim();
      if (txt.length < 4) return;
      if (el.querySelector("button, input, select, .pill, .icon-button")) return;
      if (/^[\d\s.,:€%/▲▼●✓★⚡↗→\-]+$/.test(txt)) return;
      const escaped = el.innerHTML;
      const hinted = injectJargonHints(escaped);
      if (hinted !== escaped) el.innerHTML = hinted;
    });
  }
}

function injectJargonHints(html) {
  let result = String(html || "");
  const used = new Set();
  for (const term of JARGON_TERMS_TO_HINT.sort((a, b) => b.length - a.length)) {
    if (used.has(term.toLowerCase())) continue;
    // \b nicht-greedy für Hyphens/Umlaute — case-insensitive
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?<![\\w<>=\\-])(${escaped})(?![\\w<>])`, "i");
    const m = re.exec(result);
    if (m) {
      const start = m.index;
      const end = start + m[0].length;
      // Skip wenn innerhalb eines HTML-Tags
      const before = result.slice(0, start);
      const openTags = (before.match(/</g) || []).length;
      const closeTags = (before.match(/>/g) || []).length;
      if (openTags > closeTags) continue;
      const replacement = `<span class="jargon-hint" data-jargon="${escapeHtml(term)}" title="Klicken für Erklärung">${m[0]}<span class="jargon-marker">ⓘ</span></span>`;
      result = result.slice(0, start) + replacement + result.slice(end);
      used.add(term.toLowerCase());
    }
  }
  return result;
}

// === Jargon-Helper: hovern oder klicken auf bekannte Begriffe → Definition ===
function jargonLookup(query) {
  const q = String(query || "").toLowerCase().trim();
  return (state.glossary || []).find((g) => {
    if (g.term.toLowerCase() === q) return true;
    const syns = (g.synonyms || "").toLowerCase().split(/[,;/]/).map((s) => s.trim()).filter(Boolean);
    return syns.includes(q);
  });
}

// Global delegated click: zeigt Glossar-Definition wenn auf jargon-hint geklickt
document.addEventListener("click", (event) => {
  const hint = event.target.closest("[data-jargon]");
  if (!hint) return;
  event.preventDefault();
  const term = hint.dataset.jargon;
  const entry = jargonLookup(term);
  if (!entry) {
    showToast(`"${term}" nicht im Glossar`);
    return;
  }
  showJargonPopup(entry);
});

function showJargonPopup(entry) {
  let existing = byId("jargon-popup");
  if (existing) existing.remove();
  const popup = document.createElement("div");
  popup.id = "jargon-popup";
  popup.className = "jargon-popup";
  popup.innerHTML = `
    <div class="jargon-popup-header">
      <strong>${escapeHtml(entry.term)}</strong>
      <span class="pill entscheidung">${escapeHtml(entry.category)}</span>
      <button type="button" class="icon-button" id="jargon-close">×</button>
    </div>
    ${entry.synonyms ? `<span class="muted">Auch: ${escapeHtml(entry.synonyms)}</span>` : ""}
    <p>${escapeHtml(entry.definition)}</p>
    ${entry.example ? `<div class="jargon-example"><strong>Beispiel:</strong> ${escapeHtml(entry.example)}</div>` : ""}
    <button type="button" class="button small" id="jargon-jump-glossary">Im Glossar öffnen →</button>
  `;
  document.body.appendChild(popup);
  byId("jargon-close").addEventListener("click", () => popup.remove());
  byId("jargon-jump-glossary").addEventListener("click", () => { popup.remove(); setView("glossary"); });
  setTimeout(() => {
    const closeOnOutside = (e) => {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener("click", closeOnOutside);
      }
    };
    document.addEventListener("click", closeOnOutside);
  }, 100);
}

// ============================================================
// Audit-Log-Viewer (Server-side audit.jsonl)
// ============================================================

let auditEventFilter = "all";
let auditCache = null;

async function loadAudit() {
  try {
    const response = await fetch("/api/audit/log?limit=500");
    if (!response.ok) throw new Error("HTTP " + response.status);
    auditCache = await response.json();
    return auditCache;
  } catch (error) {
    return { total: 0, events: [], error: error.message };
  }
}

function renderAudit() {
  if (!byId("audit-list")) return;
  const data = auditCache;
  if (!data) {
    byId("audit-list").innerHTML = '<p class="muted">Wird geladen …</p>';
    loadAudit().then(renderAudit);
    return;
  }
  if (data.error) {
    byId("audit-list").innerHTML = `<p class="muted">Fehler: ${escapeHtml(data.error)}</p>`;
    return;
  }
  const events = data.events || [];
  const eventTypes = Array.from(new Set(events.map((e) => e.event))).sort();
  const select = byId("audit-event-filter");
  const cur = select.value || "all";
  select.innerHTML = `<option value="all">Alle Events</option>${eventTypes.map((t) => `<option ${t === cur ? "selected" : ""}>${escapeHtml(t)}</option>`).join("")}`;

  const filtered = auditEventFilter === "all" ? events : events.filter((e) => e.event === auditEventFilter);

  // Summary
  const last24h = events.filter((e) => new Date(e.ts).getTime() > Date.now() - 86400000).length;
  const last7d = events.filter((e) => new Date(e.ts).getTime() > Date.now() - 7 * 86400000).length;
  const counts = {};
  events.forEach((e) => { counts[e.event] = (counts[e.event] || 0) + 1; });
  const topEvent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  byId("audit-summary").innerHTML = `
    <div class="lever-stat"><span>${events.length}</span><p>Events gesamt (last 500)</p></div>
    <div class="lever-stat"><span>${last24h}</span><p>letzte 24h</p></div>
    <div class="lever-stat"><span>${last7d}</span><p>letzte 7T</p></div>
    <div class="lever-stat"><span>${topEvent ? topEvent[0] : "—"}</span><p>häufigstes Event (${topEvent ? topEvent[1] : 0}×)</p></div>
  `;

  byId("audit-list").innerHTML = filtered.length ? `<div class="audit-rows">
    ${filtered.slice(0, 200).map((e) => {
      const cls = e.event.startsWith("auth.") ? "auth" :
                  e.event.startsWith("mail.") || e.event.startsWith("slack.") ? "comm" :
                  e.event.startsWith("backup.") ? "backup" :
                  e.event.startsWith("attachment.") ? "attach" : "other";
      const detailKeys = Object.keys(e).filter((k) => k !== "ts" && k !== "event");
      const details = detailKeys.map((k) => `<span class="audit-detail"><em>${escapeHtml(k)}</em>: ${escapeHtml(String(e[k]).slice(0, 80))}</span>`).join("");
      return `<div class="audit-row audit-${cls}">
        <span class="audit-ts">${new Date(e.ts).toLocaleString("de-DE")}</span>
        <span class="audit-event">${escapeHtml(e.event)}</span>
        <div class="audit-details">${details}</div>
      </div>`;
    }).join("")}
    ${filtered.length > 200 ? `<p class="muted">${filtered.length - 200} weitere — filtere ein.</p>` : ""}
  </div>` : '<p class="muted">Keine Events für diesen Filter.</p>';
}

// ============================================================
// SeBo-Bridge — Live-Daten + Direkt-Sprünge ins operative Cockpit
// ============================================================

const seboJumpTargets = [
  { label: "Heute (Operations)", path: "/dashboard", icon: "◆", description: "Tagesdashboard mit Eskalationen & Live-Bestellungen" },
  { label: "Posteingang", path: "/dashboard/tickets", icon: "✉", description: "Neue & eskalierte Tickets" },
  { label: "Alle Tickets", path: "/dashboard/tickets", icon: "📋", description: "Alle Status-Filter, KI-Beantwortet-Tag, Zuweisung" },
  { label: "Kunden", path: "/dashboard/kunden", icon: "👤", description: "32.540 Kundenkarteien mit Umsatz/Bestellhistorie" },
  { label: "Produkte", path: "/dashboard/produkte", icon: "📦", description: "22.350 Artikel mit Marken, Lieferanten, EK/VK, Lager" },
  { label: "Lieferanten", path: "/dashboard/lieferanten", icon: "🚚", description: "326 Lieferanten mit Umsatz, Reklamationen" },
  { label: "Retouren", path: "/dashboard/retouren", icon: "↩", description: "1.924 Retouren mit Top-Gründen" },
  { label: "Newsletter", path: "/dashboard/newsletter", icon: "✉", description: "45.920 Brevo-Abonnenten in 27 Listen" },
  { label: "Mitarbeiter", path: "/dashboard/mitarbeiter", icon: "👥", description: "Team-Übersicht mit Ticket-Counts" },
  { label: "Statistiken", path: "/dashboard/statistiken", icon: "📊", description: "Echte 15-Jahres-Historie · Umsatz/Kunden/Produkte/Saisonalität" },
  { label: "KI-Assistent", path: "/dashboard/assistent", icon: "🤖", description: "Chat mit Tool-Zugriff auf Tickets/Kunden/Bestellungen" },
  { label: "Suche", path: "/dashboard/suche", icon: "🔍", description: "Globale SeBo-Suche" }
];

function renderSebo() {
  if (!byId("sebo-snapshot-grid")) return;
  const snap = state.seboSnapshot || {};
  const baseUrl = state.seboConfig?.baseUrl || "https://sebo.dadakaev.tech";

  // Update Main-Open-Button
  byId("sebo-open-main").href = baseUrl + "/dashboard";

  // Snapshot-Meta
  byId("sebo-snapshot-meta").textContent = snap.capturedAt ? `letzter Stand ${snap.capturedAt}` : "kein Snapshot";

  // Snapshot-Karten
  const t = snap.totals || {};
  byId("sebo-snapshot-grid").innerHTML = `
    <div class="lever-stat"><span>${formatEur(t.revenue15y)}</span><p>Umsatz 15 Jahre</p></div>
    <div class="lever-stat"><span>${(t.orders15y || 0).toLocaleString("de-DE")}</span><p>Bestellungen</p></div>
    <div class="lever-stat"><span>${formatEur(t.avgOrderValue)}</span><p>Ø Bestellwert</p></div>
    <div class="lever-stat alert"><span>${t.grossMarginPct >= 0 ? "+" : ""}${t.grossMarginPct}%</span><p>Gesamt-Marge</p></div>
    <div class="lever-stat"><span>${(t.customersTotal || 0).toLocaleString("de-DE")}</span><p>Kunden gesamt</p></div>
    <div class="lever-stat"><span>${t.avgOrdersPerCustomer}x</span><p>Ø Bestellungen/Kunde</p></div>
    <div class="lever-stat ${t.ticketsEscalated > 5 ? "alert" : ""}"><span>${t.ticketsEscalated}</span><p>Tickets eskaliert</p></div>
    <div class="lever-stat"><span>${(t.newsletterSubscribers || 0).toLocaleString("de-DE")}</span><p>Newsletter-Abonnenten</p></div>
    <div class="lever-stat"><span>${(t.productsTotal || 0).toLocaleString("de-DE")}</span><p>Produkte</p></div>
    <div class="lever-stat"><span>${(t.suppliersTotal || 0).toLocaleString("de-DE")}</span><p>Lieferanten</p></div>
    <div class="lever-stat"><span>${t.returnsTotal}</span><p>Retouren gesamt</p></div>
    <div class="lever-stat ${t.returnsOpen > 0 ? "alert" : ""}"><span>${t.returnsOpen}</span><p>Retouren offen</p></div>
  `;

  // Direkt-Sprünge
  byId("sebo-jumps").innerHTML = seboJumpTargets.map((j) => `
    <a class="sebo-jump-card" href="${baseUrl}${j.path}" target="_blank" rel="noopener">
      <span class="sebo-jump-icon">${j.icon}</span>
      <strong>${escapeHtml(j.label)}</strong>
      <span class="muted">${escapeHtml(j.description)}</span>
    </a>
  `).join("");

  // Yearly Umsatz
  const years = snap.yearlyRevenue || [];
  const maxRev = Math.max(...years.map((y) => y.revenue || 0), 1);
  byId("sebo-yearly").innerHTML = years.length ? `
    <div class="sebo-year-table">
      ${years.map((y) => {
        const widthPct = (y.revenue / maxRev * 100).toFixed(0);
        const yoyClass = y.yoyPct === null ? "neutral" : y.yoyPct > 0 ? "good" : "bad";
        const yoyArrow = y.yoyPct === null ? "—" : y.yoyPct > 0 ? "▲" : "▼";
        return `<div class="sebo-year-row ${y.isPeak ? "peak" : ""}">
          <span class="sebo-year-label">${y.year}${y.isPeak ? " ★" : ""}</span>
          <div class="sebo-year-bar"><div class="sebo-year-fill ${yoyClass}" style="width:${widthPct}%"></div></div>
          <span class="sebo-year-value">${formatEur(y.revenue)}</span>
          <span class="sebo-year-yoy ${yoyClass}">${yoyArrow} ${y.yoyPct === null ? "—" : Math.abs(y.yoyPct) + "%"}</span>
        </div>`;
      }).join("")}
    </div>` : '<p class="muted">Noch kein Snapshot.</p>';

  // Returns
  const returns = snap.returnReasons || [];
  byId("sebo-returns").innerHTML = returns.length ? `
    <div class="sebo-returns-list">
      ${returns.map((r) => `
        <div class="sebo-return-row">
          <span>${escapeHtml(r.reason)}</span>
          <div class="sebo-return-bar"><div style="width:${r.share}%"></div></div>
          <span class="muted">${r.count}× (${r.share}%)</span>
        </div>
      `).join("")}
    </div>` : '<p class="muted">—</p>';

  // Heatmap mit Anomalie-Annotations
  const heat = snap.seasonality?.revenueHeatmap || [];
  const allValues = heat.flatMap((row) => row.months.filter((v) => v !== null));
  const minV = Math.min(...allValues, 0);
  const maxV = Math.max(...allValues, 1);
  const monthNames = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

  // Pro Zelle prüfen: gibt es eine MAGALOKO-Anomalie aus dieser Woche?
  const anomalyByYearMonth = {};
  (state.anomalies || []).forEach((a) => {
    if (!a.weekStart) return;
    const d = new Date(a.weekStart);
    const y = d.getFullYear(); const m = d.getMonth();
    if (!anomalyByYearMonth[`${y}-${m}`]) anomalyByYearMonth[`${y}-${m}`] = [];
    anomalyByYearMonth[`${y}-${m}`].push(a);
  });

  byId("sebo-heatmap").innerHTML = heat.length ? `
    <div class="sebo-heatmap-table">
      <div class="sebo-heatmap-header">
        <span></span>
        ${monthNames.map((m) => `<span>${m}</span>`).join("")}
      </div>
      ${heat.map((row) => `
        <div class="sebo-heatmap-row">
          <span class="sebo-heatmap-year">${row.year}</span>
          ${row.months.map((v, idx) => {
            if (v === null) return `<span class="sebo-heat-cell empty">—</span>`;
            const intensity = ((v - minV) / (maxV - minV) * 100).toFixed(0);
            const anomList = anomalyByYearMonth[`${row.year}-${idx}`];
            // YoY-Vergleich: gleicher Monat Vorjahr
            const prevRow = heat.find((r) => r.year === row.year - 1);
            const prevV = prevRow?.months[idx];
            const yoyPct = prevV ? Math.round(((v - prevV) / prevV) * 100) : null;
            const isBreak = yoyPct !== null && yoyPct <= -15;
            return `<span class="sebo-heat-cell ${isBreak ? "heat-break" : ""} ${anomList ? "has-anomaly" : ""}" style="background:rgba(47,125,89,${intensity / 100})" title="${row.year} ${monthNames[idx]}: ${v}k €${yoyPct !== null ? ` (${yoyPct >= 0 ? "+" : ""}${yoyPct}% vs Vorjahr)` : ""}${anomList ? ` · ${anomList.length} Anomalie` : ""}">
              ${v}
              ${isBreak ? `<span class="heat-break-marker">▼${Math.abs(yoyPct)}%</span>` : ""}
              ${anomList ? `<span class="heat-anomaly-marker" title="MAGALOKO-Anomalie">◉</span>` : ""}
            </span>`;
          }).join("")}
        </div>
      `).join("")}
    </div>
    <div class="heatmap-legend muted">
      <span><span class="heat-legend-swatch"></span> Umsatz (dunkler = mehr)</span>
      <span><span class="heat-break-marker inline">▼15+%</span> Vorjahres-Bruch ≥15%</span>
      <span><span class="heat-anomaly-marker inline">◉</span> MAGALOKO-Anomalie dokumentiert</span>
    </div>` : '<p class="muted">—</p>';

  // Margin
  const marg = snap.topMarginProducts || [];
  byId("sebo-margin").innerHTML = marg.length ? `
    <div class="sebo-margin-list">
      ${marg.map((m) => `
        <article class="compact-item">
          <div class="item-line">
            <strong>#${m.rank} ${escapeHtml(m.name)}</strong>
            <span class="pill bereit">${m.marginPct}% DB</span>
          </div>
          <span class="muted">${escapeHtml(m.supplier)} · VK ${formatEur(m.price)}</span>
        </article>
      `).join("")}
    </div>` : '<p class="muted">—</p>';
}

function openSeboConfigEdit() {
  byId("edit-modal-title").textContent = "SeBo-Konfiguration";
  byId("edit-modal-fields").innerHTML = `
    <label>SeBo Base-URL<input type="text" name="baseUrl" value="${escapeHtml(state.seboConfig?.baseUrl || "https://sebo.dadakaev.tech")}" /></label>
    <label>Hinweis<p class="muted" style="margin:0;font-weight:400;text-transform:none;letter-spacing:0;">SeBo-Daten werden manuell aus den SeBo-Statistiken übernommen. Echte API-Anbindung kommt in Phase 7 (wenn SeBo eine REST-API exponiert).</p></label>
  `;
  const form = byId("edit-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    state.seboConfig.baseUrl = form.elements.baseUrl.value.trim() || "https://sebo.dadakaev.tech";
    saveState(); renderSebo();
    byId("edit-modal").close();
    showToast("SeBo-Config gespeichert");
  };
  byId("edit-modal").showModal();
}

// ============================================================
// Time-Tracking + Pomodoro
// ============================================================

let pomodoroTimer = null;
let pomodoroStart = null;
let pomodoroDurationMin = 25;

function formatMinutes(min) {
  const m = Math.floor(min);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

function pomodoroTick() {
  const elapsed = Math.floor((Date.now() - pomodoroStart) / 1000);
  const totalSec = pomodoroDurationMin * 60;
  const remaining = Math.max(totalSec - elapsed, 0);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const tEl = byId("pomodoro-time");
  if (tEl) tEl.textContent = `${mm}:${ss}`;
  if (remaining <= 0) {
    pomodoroStop(true);
    if (Notification.permission === "granted") {
      showNotification("Pomodoro fertig", "25 Minuten durch — Pause oder neuer Block?", "pomodoro");
    }
  }
}

function pomodoroStart_() {
  pomodoroStart = Date.now();
  pomodoroTimer = setInterval(pomodoroTick, 1000);
  byId("pomodoro-status").textContent = "läuft …";
  byId("pomodoro-start").hidden = true;
  byId("pomodoro-stop").hidden = false;
  pomodoroTick();
}

function pomodoroStop(autoCompleted = false) {
  if (!pomodoroStart) return;
  clearInterval(pomodoroTimer);
  pomodoroTimer = null;
  const elapsedMin = Math.max(1, Math.round((Date.now() - pomodoroStart) / 60000));
  const task = byId("pomodoro-task").value.trim();
  const area = byId("pomodoro-area").value;
  if (task) {
    state.timeEntries.unshift({
      id: uid("te"),
      date: new Date().toISOString().slice(0, 10),
      area, task,
      minutes: autoCompleted ? pomodoroDurationMin : elapsedMin,
      notes: ""
    });
    saveState();
    showToast(`${elapsedMin}m erfasst für "${task}"`);
  }
  pomodoroStart = null;
  byId("pomodoro-status").textContent = "Bereit";
  byId("pomodoro-time").textContent = "25:00";
  byId("pomodoro-start").hidden = false;
  byId("pomodoro-stop").hidden = true;
  byId("pomodoro-task").value = "";
  renderTime();
}

function renderTime() {
  if (!byId("time-week-summary")) return;
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartIso = weekStart.toISOString().slice(0, 10);

  const thisWeek = (state.timeEntries || []).filter((e) => e.date && e.date >= weekStartIso);
  const byArea = {};
  thisWeek.forEach((e) => {
    byArea[e.area] = (byArea[e.area] || 0) + (e.minutes || 0);
  });
  const totalMin = Object.values(byArea).reduce((s, m) => s + m, 0);

  byId("time-week-summary").innerHTML = `
    <div class="lever-stat"><span>${formatMinutes(totalMin)}</span><p>diese Woche gesamt</p></div>
    ${Object.entries(byArea).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([area, min]) => `
      <div class="lever-stat"><span>${formatMinutes(min)}</span><p>${escapeHtml(area)}</p></div>
    `).join("")}
  `;

  const recent = (state.timeEntries || []).slice(0, 20);
  byId("time-entries-list").innerHTML = recent.length ? recent.map((e) => `
    <article class="compact-item">
      <div class="item-line">
        <strong>${escapeHtml(e.task)}</strong>
        <span class="topbar-actions">
          <span class="pill entscheidung">${escapeHtml(e.area)}</span>
          <span class="pill bereit">${formatMinutes(e.minutes)}</span>
          <button class="icon-button edit" data-edit="time-entry:${e.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-time-delete="${e.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${e.date}${e.notes ? " · " + escapeHtml(e.notes) : ""}</span>
    </article>
  `).join("") : '<p class="muted">Noch keine Zeitbuchungen. Starte den Pomodoro oben.</p>';

  document.querySelectorAll("[data-time-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.timeDelete;
      if (!confirm("Zeitbuchung löschen?")) return;
      state.timeEntries = state.timeEntries.filter((x) => x.id !== id);
      saveState(); renderTime();
    });
  });
}

// ============================================================
// Team-Modul
// ============================================================

let teamSearch = "";

function renderTeam() {
  if (!byId("team-grid")) return;
  const filtered = state.team.filter((p) => !teamSearch || (p.name + " " + (p.role || "") + " " + (p.notes || "")).toLowerCase().includes(teamSearch));
  byId("team-grid").innerHTML = filtered.length ? filtered.map((p) => `
    <article class="person-card">
      <div class="item-line">
        <strong>${escapeHtml(p.name)}</strong>
        <span class="topbar-actions">
          <button class="icon-button edit" data-edit="person:${p.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-person-delete="${p.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(p.role || "—")}</span>
      ${p.contactStyle ? `<div class="person-section"><span class="profile-label">Stil</span><p>${escapeHtml(p.contactStyle)}</p></div>` : ""}
      ${p.lovesToHear ? `<div class="person-section accent-good"><span class="profile-label">Reagiert positiv auf</span><p>${escapeHtml(p.lovesToHear)}</p></div>` : ""}
      ${p.avoids ? `<div class="person-section accent-warn"><span class="profile-label">Vermeidet</span><p>${escapeHtml(p.avoids)}</p></div>` : ""}
      ${p.lastContact ? `<span class="muted">Letzter Kontakt: ${p.lastContact}</span>` : ""}
      ${p.mail || p.phone ? `<span class="muted">${escapeHtml(p.mail || "")} ${p.phone ? "· " + escapeHtml(p.phone) : ""}</span>` : ""}
    </article>`).join("") : '<p class="muted">Keine Person passt zum Filter.</p>';

  document.querySelectorAll("[data-person-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.personDelete;
      const p = state.team.find((x) => x.id === id);
      if (!p || !confirm(`Person "${p.name}" löschen?`)) return;
      state.team = state.team.filter((x) => x.id !== id);
      saveState(); renderTeam(); showToast("Person gelöscht");
    });
  });
}

// ============================================================
// Monatsbericht-Generator
// ============================================================

function monthLabel(date) {
  return date.toLocaleDateString("de-DE", { year: "numeric", month: "long" });
}

function getMonthRange(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59);
  return { start, end, startIso: start.toISOString().slice(0, 10), endIso: end.toISOString().slice(0, 10) };
}

let monthlySelectedMonth = new Date().toISOString().slice(0, 7);

function renderMonthly() {
  if (!byId("monthly-report")) return;

  // Picker mit letzten 12 Monaten
  const picker = byId("monthly-month-picker");
  if (picker && !picker.options.length) {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const v = d.toISOString().slice(0, 7);
      months.push({ value: v, label: monthLabel(d) });
    }
    picker.innerHTML = months.map((m) => `<option value="${m.value}">${m.label}</option>`).join("");
    picker.value = monthlySelectedMonth;
  }

  const { startIso, endIso } = getMonthRange(monthlySelectedMonth);
  const monthDate = new Date(monthlySelectedMonth + "-01");

  // Aggregationen für den Monat
  const doneTasks = (state.tasks || []).filter((t) => t.status === "Erledigt");
  const promisesKept = (state.promises || []).filter((p) => p.status === "eingelöst" && p.dueDate >= startIso && p.dueDate <= endIso);
  const promisesMissed = (state.promises || []).filter((p) => p.status === "verfehlt" && p.dueDate >= startIso && p.dueDate <= endIso);
  const liveLevers = (state.levers || []).filter((l) => l.status === "Live");
  const briefings = (state.briefings || []).filter((b) => b.createdAt >= startIso && b.createdAt <= endIso + "T23:59:59");
  const timeEntries = (state.timeEntries || []).filter((e) => e.date >= startIso && e.date <= endIso);
  const timeByArea = {};
  timeEntries.forEach((e) => { timeByArea[e.area] = (timeByArea[e.area] || 0) + (e.minutes || 0); });
  const totalMinutes = Object.values(timeByArea).reduce((s, m) => s + m, 0);
  const totalDays = totalMinutes / (60 * 8);

  const meetings = (state.meetings || []).filter((m) => m.date >= startIso && m.date <= endIso);
  const campaigns = (state.reactivationCampaigns || []).filter((c) => c.startDate >= startIso && c.startDate <= endIso);
  const anomaliesResolved = (state.anomalies || []).filter((a) => a.status === "geklärt");

  byId("monthly-report").innerHTML = `
    <article class="panel monthly-card">
      <header class="monthly-header">
        <h2>Monatsbericht · ${monthLabel(monthDate)}</h2>
        <span class="muted">${startIso} – ${endIso}</span>
      </header>

      <section class="monthly-section">
        <h3>🎯 Geliefert</h3>
        <ul>
          <li><strong>${doneTasks.length}</strong> Aufgaben abgeschlossen</li>
          <li><strong>${promisesKept.length}</strong> Versprechen eingelöst, <strong>${promisesMissed.length}</strong> verfehlt</li>
          <li><strong>${briefings.length}</strong> Stephan-Briefings versendet</li>
          <li><strong>${meetings.length}</strong> Gespräche dokumentiert</li>
          <li><strong>${liveLevers.length}</strong> Hebel live geschaltet (kumuliert)</li>
          <li><strong>${anomaliesResolved.length}</strong> Daten-Anomalien geklärt</li>
        </ul>
      </section>

      <section class="monthly-section">
        <h3>⏱ Zeit-Aufteilung (${totalDays.toFixed(1)} PT / ${formatMinutes(totalMinutes)})</h3>
        ${totalMinutes > 0 ? `<div class="monthly-bars">
          ${Object.entries(timeByArea).sort((a, b) => b[1] - a[1]).map(([area, min]) => {
            const pct = (min / totalMinutes * 100).toFixed(0);
            return `<div class="monthly-bar-row">
              <span>${escapeHtml(area)}</span>
              <div class="monthly-bar"><div style="width:${pct}%"></div></div>
              <span class="muted">${formatMinutes(min)} (${pct}%)</span>
            </div>`;
          }).join("")}
        </div>` : '<p class="muted">Keine Zeit erfasst.</p>'}
      </section>

      <section class="monthly-section">
        <h3>📨 Kampagnen</h3>
        ${campaigns.length ? `<ul>${campaigns.map((c) => `<li><strong>${escapeHtml(c.name)}</strong> · ${c.sent} versendet, ${c.opened} geöffnet, ${c.ordered} bestellt, ${formatEur(c.revenue)} Umsatz</li>`).join("")}</ul>` : '<p class="muted">Keine Kampagnen.</p>'}
      </section>

      <section class="monthly-section">
        <h3>⚡ Top-3 offene Hebel zum Monatsende</h3>
        <ol>
          ${(state.levers || []).filter((l) => l.status !== "Live" && l.status !== "Verworfen").slice().sort((a, b) => leverScore(b) - leverScore(a)).slice(0, 3).map((l) => `<li><strong>${escapeHtml(l.title)}</strong> — ${formatEur(l.expectedImpactEur)}/Jahr bei ${l.effortHours}h Aufwand</li>`).join("")}
        </ol>
      </section>

      <section class="monthly-section">
        <h3>📝 KI-Zusammenfassung</h3>
        <div id="monthly-ai-summary"><button class="button primary" id="monthly-ai-btn" type="button">🤖 KI-Zusammenfassung generieren</button></div>
      </section>
    </article>`;

  byId("monthly-ai-btn")?.addEventListener("click", async () => {
    if (!aiConfigured()) { showToast("KI-Key fehlt"); return; }
    const out = byId("monthly-ai-summary");
    out.innerHTML = '<span class="muted">KI denkt …</span>';
    const context = `Monat: ${monthLabel(monthDate)}\nGeliefert: ${doneTasks.length} Aufgaben, ${promisesKept.length} Versprechen eingelöst, ${promisesMissed.length} verfehlt, ${briefings.length} Briefings, ${meetings.length} Gespräche\nZeit gesamt: ${totalDays.toFixed(1)} PT\nTop-Bereich: ${Object.entries(timeByArea).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}\nKampagnen: ${campaigns.length}\nGelöste Anomalien: ${anomaliesResolved.length}`;
    try {
      const text = await callAi(
        "Du bist Magos Berichts-Verfasser. Erstelle eine geschäftsfreundliche 1-Seiten-Zusammenfassung des Monats für Stephan. Struktur: Was wurde geliefert, was sind die wichtigsten Erkenntnisse, was kommt nächsten Monat. Max 250 Wörter, konkret, ohne Floskeln.",
        context
      );
      out.innerHTML = renderMarkdown(text);
    } catch (error) {
      out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  });
}

// ============================================================
// Honorar-Modul
// ============================================================

function renderHonorar() {
  if (!byId("honorar-conditions")) return;
  const h = state.honorar;
  byId("honorar-conditions").innerHTML = `
    <div class="honorar-row"><span class="muted">Tagessatz</span><strong>${formatEur(h.dagessatz)}</strong></div>
    <div class="honorar-row"><span class="muted">Monats-Ziel</span><strong>${h.monatsZielTage} Tage = ${formatEur(h.dagessatz * h.monatsZielTage)}</strong></div>
  `;

  // Aktueller Monat
  const now = new Date();
  const yyyymm = now.toISOString().slice(0, 7);
  const { startIso, endIso } = getMonthRange(yyyymm);
  const monthEntries = (state.timeEntries || []).filter((e) => e.date >= startIso && e.date <= endIso);
  const monthMinutes = monthEntries.reduce((s, e) => s + (e.minutes || 0), 0);
  const monthDays = monthMinutes / (60 * 8);
  const monthAmount = monthDays * h.dagessatz;
  const targetPct = Math.min(monthDays / h.monatsZielTage * 100, 100).toFixed(0);

  const reached = monthDays >= h.monatsZielTage;
  byId("honorar-current-month").innerHTML = `
    <div class="honorar-row"><span class="muted">${monthLabel(now)} bisher</span><strong>${monthDays.toFixed(1)} Tage ${reached ? "✓" : ""}</strong></div>
    <div class="honorar-row"><span class="muted">Voraussichtlicher Umsatz</span><strong>${formatEur(monthAmount)}</strong></div>
    ${bulletChart({ current: monthDays, target: h.monatsZielTage, max: h.monatsZielTage * 1.5, label: `${monthDays.toFixed(1)} von ${h.monatsZielTage} Tagen` })}
    <span class="muted">${reached ? "✓" : "●"} ${targetPct}% des Monats-Ziels (Ziel: ${h.monatsZielTage} Tage)</span>
  `;

  const invoices = (h.rechnungen || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  byId("honorar-history-count").textContent = invoices.length ? `${invoices.length} gesamt · ${formatEur(invoices.reduce((s, i) => s + (i.amount || 0), 0))}` : "";
  byId("honorar-history").innerHTML = invoices.length ? invoices.map((inv) => `
    <article class="compact-item">
      <div class="item-line">
        <strong>${escapeHtml(inv.invoiceNr || "Rechnung")}</strong>
        <span class="topbar-actions">
          <span class="pill ${inv.status === "bezahlt" ? "bereit" : inv.status === "überfällig" ? "kritisch" : "mittel"}">${escapeHtml(inv.status || "offen")}</span>
          <button class="icon-button" data-invoice-delete="${inv.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${inv.date || "—"} · ${inv.days || 0} Tage · ${formatEur(inv.amount)}${inv.paidAt ? " · bezahlt am " + inv.paidAt : ""}</span>
    </article>
  `).join("") : '<p class="muted">Noch keine Rechnungen.</p>';

  document.querySelectorAll("[data-invoice-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.invoiceDelete;
      if (!confirm("Rechnung löschen?")) return;
      state.honorar.rechnungen = state.honorar.rechnungen.filter((x) => x.id !== id);
      saveState(); renderHonorar();
    });
  });
}

function openHonorarConditionsEdit() {
  byId("edit-modal-title").textContent = "Honorar-Konditionen";
  byId("edit-modal-fields").innerHTML = `
    <label>Tagessatz (€)<input type="number" name="dagessatz" value="${state.honorar.dagessatz}" step="50" /></label>
    <label>Monats-Ziel (Tage)<input type="number" name="monatsZielTage" value="${state.honorar.monatsZielTage}" step="1" /></label>
  `;
  const form = byId("edit-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    state.honorar.dagessatz = Number(form.elements.dagessatz.value) || 800;
    state.honorar.monatsZielTage = Number(form.elements.monatsZielTage.value) || 12;
    saveState(); renderHonorar();
    byId("edit-modal").close();
    showToast("Konditionen gespeichert");
  };
  byId("edit-modal").showModal();
}

function openInvoiceCreate() {
  const now = new Date();
  const yyyymm = now.toISOString().slice(0, 7);
  const { startIso, endIso } = getMonthRange(yyyymm);
  const monthEntries = (state.timeEntries || []).filter((e) => e.date >= startIso && e.date <= endIso);
  const monthMinutes = monthEntries.reduce((s, e) => s + (e.minutes || 0), 0);
  const monthDays = Math.round(monthMinutes / (60 * 8) * 10) / 10;
  const amount = monthDays * state.honorar.dagessatz;

  byId("edit-modal-title").textContent = "Rechnung erfassen";
  byId("edit-modal-fields").innerHTML = `
    <label>Rechnungsnummer<input type="text" name="invoiceNr" value="HFK-${yyyymm.replace("-", "")}" /></label>
    <label>Datum<input type="date" name="date" value="${now.toISOString().slice(0, 10)}" /></label>
    <label>Tage<input type="number" name="days" value="${monthDays}" step="0.1" /></label>
    <label>Betrag (€)<input type="number" name="amount" value="${amount}" step="0.01" /></label>
    <label>Status<select name="status"><option>offen</option><option>versendet</option><option>bezahlt</option><option>überfällig</option></select></label>
    <label>Bezahlt am<input type="date" name="paidAt" /></label>
    <label>Notiz<textarea name="notes"></textarea></label>
  `;
  const form = byId("edit-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    state.honorar.rechnungen.unshift({
      id: uid("inv"),
      invoiceNr: data.invoiceNr,
      date: data.date,
      days: Number(data.days) || 0,
      amount: Number(data.amount) || 0,
      status: data.status,
      paidAt: data.paidAt || "",
      notes: data.notes || ""
    });
    saveState(); renderHonorar();
    byId("edit-modal").close();
    showToast("Rechnung erfasst");
  };
  byId("edit-modal").showModal();
}

// ============================================================
// Strategie-Module: Marken (BCG), Champions, Cross-Selling, Sortiment, VIP
// Daten basieren auf HFK_ANALYSE_AUSWERTUNG_MAGO_ROLLE.md
// ============================================================

let brandCategoryFilter = "all";
let brandSearch = "";

const bcgQuadrants = [
  { key: "Star", title: "Stars", desc: "Hohes Wachstum, hoher Anteil — investieren", color: "good" },
  { key: "Question Mark", title: "Question Marks", desc: "Wachstum, kleiner Anteil — selektiv testen", color: "warn" },
  { key: "Cash Cow", title: "Cash Cows", desc: "Rückläufig, hoher Anteil — Marge ernten", color: "info" },
  { key: "Dog", title: "Dogs", desc: "Rückläufig, kleiner Anteil — reduzieren", color: "bad" }
];

function renderBrands() {
  if (!byId("bcg-matrix")) return;

  const filtered = state.brands.filter((b) => {
    if (brandCategoryFilter !== "all" && b.category !== brandCategoryFilter) return false;
    if (!brandSearch) return true;
    return (b.name + " " + (b.action || "") + " " + (b.notes || "")).toLowerCase().includes(brandSearch);
  });

  byId("bcg-matrix").innerHTML = bcgQuadrants.map((q) => {
    const items = state.brands.filter((b) => b.category === q.key);
    const sumShare = items.reduce((s, b) => s + (Number(b.revenueShare) || 0), 0);
    return `<div class="bcg-quadrant bcg-${q.color}">
      <div class="bcg-header">
        <strong>${q.title}</strong>
        <span class="muted">${items.length} Marken · ${sumShare.toFixed(1)}% Umsatzanteil</span>
      </div>
      <p class="muted bcg-desc">${q.desc}</p>
      <div class="bcg-brand-chips">
        ${items.sort((a, b) => (b.revenueShare || 0) - (a.revenueShare || 0)).map((b) => `<span class="bcg-chip" title="${escapeHtml(b.action || "")}">${escapeHtml(b.name)} <em>${b.revenueShare ? b.revenueShare.toFixed(1) + "%" : ""}</em></span>`).join("")}
      </div>
    </div>`;
  }).join("");

  byId("brands-list").innerHTML = filtered.length ? filtered
    .sort((a, b) => (b.revenueShare || 0) - (a.revenueShare || 0))
    .map((b) => {
      const growthClass = b.growthPct > 20 ? "good" : b.growthPct < -10 ? "bad" : "neutral";
      return `<article class="brand-card brand-cat-${b.category.replace(/\s+/g, "-").toLowerCase()}">
        <div class="item-line">
          <strong>${escapeHtml(b.name)}</strong>
          <span class="topbar-actions">
            <span class="pill ${b.status === "ausbauen" ? "bereit" : b.status === "halten" ? "entscheidung" : b.status === "reduzieren" ? "kritisch" : "mittel"}">${escapeHtml(b.status)}</span>
            <button class="icon-button edit" data-edit="brand:${b.id}" title="Bearbeiten">✎</button>
            <button class="icon-button" data-brand-delete="${b.id}" title="Löschen">×</button>
          </span>
        </div>
        <div class="brand-metrics">
          <span class="muted">Kategorie: <strong>${escapeHtml(b.category)}</strong></span>
          <span class="growth-${growthClass}">Wachstum: <strong>${b.growthPct >= 0 ? "+" : ""}${b.growthPct}%</strong></span>
          <span class="muted">Anteil: <strong>${(b.revenueShare || 0).toFixed(2)}%</strong></span>
        </div>
        ${b.action ? `<p class="brand-action">${escapeHtml(b.action)}</p>` : ""}
        ${b.notes ? `<p class="muted">${escapeHtml(b.notes)}</p>` : ""}
      </article>`;
    }).join("") : '<p class="muted">Keine Marken passend zum Filter.</p>';

  document.querySelectorAll("[data-brand-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.brandDelete;
      const b = state.brands.find((x) => x.id === id);
      if (!b || !confirm(`Marke "${b.name}" löschen?`)) return;
      state.brands = state.brands.filter((x) => x.id !== id);
      saveState(); renderBrands(); showToast("Marke gelöscht");
    });
  });
}

function renderChampions() {
  if (!byId("segments-grid")) return;
  byId("segments-grid").innerHTML = state.customerSegments.map((s) => {
    const statusClass = s.status === "binden" ? "bereit" : s.status === "reaktivieren" ? "angefragt" : s.status === "konvertieren" ? "entscheidung" : s.status === "ausbauen" ? "bereit" : "mittel";
    return `<article class="segment-card">
      <div class="item-line">
        <strong>${escapeHtml(s.name)}</strong>
        <span class="pill ${statusClass}">${escapeHtml(s.status)}</span>
      </div>
      <div class="segment-numbers">
        <div><span>${s.customerCount.toLocaleString("de-DE")}</span><p>Kunden</p></div>
        <div><span>${formatEur(s.lifetimeRevenue)}</span><p>Lifetime-Umsatz</p></div>
        <div><span>${s.share}%</span><p>Anteil</p></div>
      </div>
      <p class="brand-action">${escapeHtml(s.action || "")}</p>
    </article>`;
  }).join("");

  byId("campaigns-list").innerHTML = state.reactivationCampaigns.length ? state.reactivationCampaigns.map((c) => {
    const openRate = c.sent ? (c.opened / c.sent * 100).toFixed(1) : "—";
    const clickRate = c.opened ? (c.clicked / c.opened * 100).toFixed(1) : "—";
    const orderRate = c.sent ? (c.ordered / c.sent * 100).toFixed(2) : "—";
    const cac = c.ordered ? formatEur(0) : "—";
    return `<article class="campaign-card">
      <div class="item-line">
        <strong>${escapeHtml(c.name)}</strong>
        <span class="topbar-actions">
          <span class="pill ${c.status === "läuft" ? "angefragt" : c.status === "ausgewertet" ? "bereit" : c.status === "abgebrochen" ? "kritisch" : "mittel"}">${escapeHtml(c.status)}</span>
          <button class="icon-button edit" data-edit="campaign:${c.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-campaign-delete="${c.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">Start ${c.startDate || "—"} · ${escapeHtml(c.channel || "—")} · Angebot: ${escapeHtml(c.offer || "—")}</span>
      <div class="campaign-funnel">
        <div><span>${c.size}</span><p>Segment</p></div>
        <div><span>${c.sent}</span><p>Versendet</p></div>
        <div><span>${c.opened}</span><p>Open ${openRate !== "—" ? openRate + "%" : ""}</p></div>
        <div><span>${c.clicked}</span><p>Click ${clickRate !== "—" ? clickRate + "%" : ""}</p></div>
        <div><span>${c.ordered}</span><p>Order ${orderRate !== "—" ? orderRate + "%" : ""}</p></div>
        <div><span>${formatEur(c.revenue)}</span><p>Umsatz</p></div>
      </div>
      ${c.notes ? `<p class="muted">${escapeHtml(c.notes)}</p>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Noch keine Kampagne. "+ Kampagne" oben anlegen.</p>';

  document.querySelectorAll("[data-campaign-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.campaignDelete;
      const c = state.reactivationCampaigns.find((x) => x.id === id);
      if (!c || !confirm(`Kampagne "${c.name}" löschen?`)) return;
      state.reactivationCampaigns = state.reactivationCampaigns.filter((x) => x.id !== id);
      saveState(); renderChampions(); showToast("Kampagne gelöscht");
    });
  });
}

function renderCrossSell() {
  if (!byId("crosspairs-list")) return;
  const pairs = state.crossSellPairs.slice().sort((a, b) => (b.coOccurrences || 0) - (a.coOccurrences || 0));
  byId("crosspairs-count").textContent = `${pairs.length} Paare`;
  byId("crosspairs-list").innerHTML = pairs.length ? pairs.map((p) => {
    const statusClass = p.status === "Bundle live" ? "bereit" : p.status === "Bundle prüfen" ? "angefragt" : p.status === "Verworfen" ? "niedrig" : "mittel";
    return `<article class="crosspair-item">
      <div class="item-line">
        <strong>${escapeHtml(p.productA)} + ${escapeHtml(p.productB)}</strong>
        <span class="topbar-actions">
          <span class="pill ${statusClass}">${escapeHtml(p.status)}</span>
          <button class="icon-button edit" data-edit="crosspair:${p.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-crosspair-delete="${p.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted"><strong>${p.coOccurrences.toLocaleString("de-DE")}×</strong> gemeinsam gekauft · ${escapeHtml(p.action || "—")}</span>
    </article>`;
  }).join("") : '<p class="muted">Noch keine Warenkorb-Paare erfasst.</p>';

  byId("bundles-count").textContent = `${state.bundleIdeas.length} Bundles`;
  byId("bundles-list").innerHTML = state.bundleIdeas.length ? state.bundleIdeas.map((b) => {
    const statusClass = b.status === "Live" ? "bereit" : b.status === "In Arbeit" ? "angefragt" : b.status === "Verworfen" ? "niedrig" : "mittel";
    return `<article class="bundle-item">
      <div class="item-line">
        <strong>${escapeHtml(b.name)}</strong>
        <span class="topbar-actions">
          <span class="pill ${statusClass}">${escapeHtml(b.status)}</span>
          <button class="icon-button edit" data-edit="bundle:${b.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-bundle-delete="${b.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(b.products || "")}</span>
      <span class="muted">Erwartetes Uplift: <strong>+${b.expectedUplift || 0}%</strong>${b.notes ? " · " + escapeHtml(b.notes) : ""}</span>
    </article>`;
  }).join("") : '<p class="muted">Noch keine Bundle-Idee.</p>';

  document.querySelectorAll("[data-crosspair-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.crosspairDelete;
      if (!confirm("Paar löschen?")) return;
      state.crossSellPairs = state.crossSellPairs.filter((x) => x.id !== id);
      saveState(); renderCrossSell(); showToast("Gelöscht");
    });
  });
  document.querySelectorAll("[data-bundle-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.bundleDelete;
      if (!confirm("Bundle löschen?")) return;
      state.bundleIdeas = state.bundleIdeas.filter((x) => x.id !== id);
      saveState(); renderCrossSell(); showToast("Gelöscht");
    });
  });
}

async function generateBundleIdeasAi() {
  if (!aiConfigured()) {
    showToast("Erst KI-Key setzen");
    openAiSettings();
    return;
  }
  const out = byId("bundle-ai-output");
  out.hidden = false;
  out.innerHTML = '<span class="muted">DeepSeek denkt sich neue Bundles aus …</span>';
  try {
    const pairs = state.crossSellPairs.slice(0, 10).map((p) => `${p.productA} + ${p.productB} (${p.coOccurrences}× zusammen)`).join("\n");
    const existing = state.bundleIdeas.map((b) => b.name).join(", ") || "keine";
    const system = "Du bist Cross-Selling-Stratege im Kinder-/Baby-E-Commerce. Du bekommst echte Warenkorb-Pärchen aus 14 Jahren JTL-Historie und vorhandene Bundle-Ideen. Generiere 5 NEUE Bundle-Vorschläge (keine die schon existieren). Pro Bundle: **Name** · enthaltene Produkte · Zielgruppe · geschätztes Uplift · warum genau das funktioniert. Kurz, konkret, geschäftsfokussiert.";
    const user = `Top Warenkorb-Paare:\n${pairs}\n\nBereits vorhandene Bundles: ${existing}`;
    const answer = await callAi(system, user);
    out.innerHTML = renderMarkdown(answer);
  } catch (error) {
    out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

function renderSortiment() {
  if (!byId("sortiment-stats")) return;
  const s = state.sortimentStats;
  byId("sortiment-stats").innerHTML = `
    <div class="lever-stat"><span>${s.totalArticles.toLocaleString("de-DE")}</span><p>Artikel gesamt</p></div>
    <div class="lever-stat alert"><span>${s.inactiveArticles.toLocaleString("de-DE")}</span><p>inaktiv</p></div>
    <div class="lever-stat"><span>${s.activeArticles.toLocaleString("de-DE")}</span><p>aktiv</p></div>
    <div class="lever-stat alert"><span>${s.notSold24m.toLocaleString("de-DE")}</span><p>nicht verkauft 24M</p></div>
    <div class="lever-stat"><span>${s.under1k.toLocaleString("de-DE")}</span><p>unter 1.000 €/Jahr</p></div>
    <div class="lever-stat"><span>${(s.over10k + s.overTotal).toLocaleString("de-DE")}</span><p>über 10.000 €/Jahr</p></div>
  `;

  byId("sortiment-rules-list").innerHTML = state.sortimentRules.length ? state.sortimentRules
    .slice()
    .sort((a, b) => {
      const order = { hoch: 0, mittel: 1, niedrig: 2 };
      return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
    })
    .map((r) => {
      const statusClass = r.status === "Umgesetzt" ? "bereit" : r.status === "in Arbeit" ? "angefragt" : r.status === "Verworfen" ? "niedrig" : "mittel";
      return `<article class="sortiment-rule">
        <div class="item-line">
          <strong>${escapeHtml(r.rule)}</strong>
          <span class="topbar-actions">
            <span class="pill ${r.priority === "hoch" ? "kritisch" : r.priority === "mittel" ? "mittel" : "niedrig"}">${escapeHtml(r.priority)}</span>
            <span class="pill ${statusClass}">${escapeHtml(r.status)}</span>
            <button class="icon-button edit" data-edit="sortimentrule:${r.id}" title="Bearbeiten">✎</button>
            <button class="icon-button" data-sortimentrule-delete="${r.id}" title="Löschen">×</button>
          </span>
        </div>
        <span class="muted">Betrifft <strong>${(r.articleCount || 0).toLocaleString("de-DE")}</strong> Artikel${r.notes ? " · " + escapeHtml(r.notes) : ""}</span>
      </article>`;
    }).join("") : '<p class="muted">Noch keine Regel.</p>';

  document.querySelectorAll("[data-sortimentrule-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.sortimentruleDelete;
      if (!confirm("Regel löschen?")) return;
      state.sortimentRules = state.sortimentRules.filter((x) => x.id !== id);
      saveState(); renderSortiment(); showToast("Gelöscht");
    });
  });
}

let vipStatusFilter = "all";

function vipComputedStatus(v) {
  if (v.targetStock === null || v.targetStock === 0 || v.currentStock === null) return v.status || "ok";
  const ratio = v.currentStock / v.targetStock;
  if (ratio < 0.5) return "kritisch";
  if (ratio < 0.85) return "warnung";
  return "ok";
}

function renderVip() {
  if (!byId("vip-list")) return;
  state.vipArticles.forEach((v) => { v.status = vipComputedStatus(v); });

  const filtered = state.vipArticles.filter((v) => {
    if (vipStatusFilter === "all") return true;
    if (vipStatusFilter === "kritisch") return v.status === "kritisch";
    if (vipStatusFilter === "warnung") return v.status === "kritisch" || v.status === "warnung";
    if (vipStatusFilter === "ok") return v.status === "ok";
    return true;
  });

  const totalRev = state.vipArticles.reduce((s, v) => s + (v.revenueYear || 0), 0);
  const critCount = state.vipArticles.filter((v) => v.status === "kritisch").length;
  const warnCount = state.vipArticles.filter((v) => v.status === "warnung").length;
  const atRiskRev = state.vipArticles.filter((v) => v.status === "kritisch" || v.status === "warnung").reduce((s, v) => s + (v.revenueYear || 0), 0);

  byId("vip-summary").innerHTML = `
    <div class="lever-stat"><span>${state.vipArticles.length}</span><p>VIP-Artikel</p></div>
    <div class="lever-stat"><span>${formatEur(totalRev)}</span><p>Umsatz / Jahr</p></div>
    <div class="lever-stat ${critCount ? "alert" : ""}"><span>${critCount}</span><p>kritisch (OOS-Risiko)</p></div>
    <div class="lever-stat ${warnCount ? "alert" : ""}"><span>${warnCount}</span><p>Warnung</p></div>
    <div class="lever-stat ${atRiskRev ? "alert" : ""}"><span>${formatEur(atRiskRev)}</span><p>Umsatz unter Risiko</p></div>
  `;

  const sorted = filtered.slice().sort((a, b) => {
    const order = { kritisch: 0, warnung: 1, ok: 2 };
    const so = (order[a.status] ?? 3) - (order[b.status] ?? 3);
    if (so !== 0) return so;
    return (b.revenueYear || 0) - (a.revenueYear || 0);
  });

  byId("vip-list").innerHTML = sorted.length ? sorted.map((v) => {
    const ratio = (v.targetStock && v.currentStock) ? v.currentStock / v.targetStock : null;
    const ratioPct = ratio !== null ? Math.round(ratio * 100) : null;
    const fillClass = v.status === "kritisch" ? "bad" : v.status === "warnung" ? "warn" : "good";
    return `<article class="vip-card vip-${v.status}">
      <div class="item-line">
        <strong>${escapeHtml(v.name)}</strong>
        <span class="topbar-actions">
          <span class="pill ${v.status === "kritisch" ? "kritisch" : v.status === "warnung" ? "mittel" : "bereit"}">${escapeHtml(v.status)}</span>
          <button class="icon-button edit" data-edit="vip:${v.id}" title="Bearbeiten">✎</button>
          <button class="icon-button" data-vip-delete="${v.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(v.sku)} · ${escapeHtml(v.supplier || "—")} · Lieferzeit ${v.leadTimeDays || 0} Tage · ${formatEur(v.revenueYear)} / Jahr</span>
      ${v.targetStock ? `
        <div class="vip-stock-row">
          <div class="vip-stock-bar"><div class="vip-stock-fill vip-fill-${fillClass}" style="width:${Math.min((ratio || 0) * 100, 100).toFixed(0)}%"></div></div>
          <span class="muted">${v.currentStock || 0} / ${v.targetStock} (${ratioPct}%)</span>
        </div>` : ""}
      ${v.notes ? `<span class="muted">${escapeHtml(v.notes)}</span>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Keine Artikel passend zum Filter.</p>';

  document.querySelectorAll("[data-vip-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.vipDelete;
      const v = state.vipArticles.find((x) => x.id === id);
      if (!v || !confirm(`VIP-Artikel "${v.name}" löschen?`)) return;
      state.vipArticles = state.vipArticles.filter((x) => x.id !== id);
      saveState(); renderVip(); showToast("Gelöscht");
    });
  });
}

// ============================================================
// Einkaufsplaner — echte HFK-Daten via /api/hfk/products
// ============================================================

let purchaseData = null;
let purchaseSort = "revenue";
let purchaseSignal = "all";
let purchaseSupplier = "all";
let purchaseSearch = "";

function parseDistribution(text) {
  if (!text) return [];
  return text.split(",").map((s) => s.trim()).filter(Boolean).map((seg) => {
    const m = seg.match(/^(.*?)\s*\((\d+(?:\.\d+)?)\)$/);
    if (m) return { label: m[1].trim(), qty: Number(m[2]) };
    return { label: seg, qty: 0 };
  }).filter((x) => x.label);
}

function distributionShares(items) {
  const total = items.reduce((s, x) => s + (x.qty || 0), 0);
  if (!total) return items.map((x) => ({ ...x, share: items.length ? 1 / items.length : 0 }));
  return items.map((x) => ({ ...x, share: (x.qty || 0) / total }));
}

function normalizeProduct(row) {
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const sold = num(row.qty_sold_12m);
  const stockAvail = num(row.stock_available);
  const inbound = num(row.stock_inbound);
  const margin = num(row.margin_pct_est);
  const revenue = num(row.revenue_12m_net_est);
  const cogs = num(row.cogs_12m_est);
  const weekly = sold / 52;
  const stockDays = weekly > 0 ? (stockAvail + inbound) / (sold / 365) : null;
  const signalLower = (row.planner_signal || "").toLowerCase();
  return {
    id: row.parent_article_id,
    name: row.product_name,
    sku: row.example_top_sku,
    supplier: row.supplier_name,
    supplierId: row.supplier_id,
    variantCount: num(row.variant_count_with_sales),
    qty12m: sold,
    qtyWeekly: weekly,
    qtyLyss: num(row.qty_sold_lyss_may_jul_2025),
    stockAvail,
    stockOnHand: num(row.stock_on_hand),
    stockInbound: inbound,
    reserved: num(row.reserved_in_orders),
    stockDays,
    avgCost: num(row.avg_unit_cost_net),
    avgPrice: num(row.avg_sales_price_net),
    margin,
    marginEur: num(row.avg_sales_price_net) - num(row.avg_unit_cost_net),
    revenue,
    cogs,
    profitEur: revenue - cogs,
    colors: parseDistribution(row.colors_top),
    sizes: parseDistribution(row.sizes_top),
    topSkus: (row.top_skus || "").split(",").map((s) => s.trim()).filter(Boolean),
    signal: row.planner_signal || "",
    openIssue: row.planner_open_issue || "",
    flags: {
      oos: signalLower.includes("oos"),
      dbLow: signalLower.includes("db unter"),
      lyssMissing: signalLower.includes("lyss fehlt"),
      lyssPresent: signalLower.includes("lyss vorhanden"),
      dataOpen: Boolean(row.planner_open_issue && row.planner_open_issue.trim())
    }
  };
}

async function loadPurchaseData(force = false) {
  if (purchaseData && !force) return purchaseData;
  try {
    const response = await fetch("/api/hfk/products");
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    purchaseData = {
      source: data.source,
      loadedAt: new Date().toISOString(),
      products: data.rows.map(normalizeProduct)
    };
    return purchaseData;
  } catch (error) {
    showToast("CSV-Lesefehler: " + error.message.slice(0, 80));
    purchaseData = { source: "—", loadedAt: null, products: [] };
    return purchaseData;
  }
}

function purchaseRiskScore(p) {
  let score = 0;
  if (p.flags.oos) score += 4;
  if (p.flags.dbLow) score += 2;
  if (p.stockDays !== null && p.stockDays < 30) score += 3;
  if (p.flags.dataOpen) score += 1;
  if (p.flags.lyssMissing) score += 1;
  return score;
}

// ============================================================
// Einkaufsplaner v1.5 — Modul 1 (Messen) + Modul 2 (Saison)
// ============================================================

let purchaseActiveTab = "messen";
let saisonSelectedWoche = 5;

function switchPurchaseTab(tab) {
  purchaseActiveTab = tab;
  document.querySelectorAll("#purchase-tabs button").forEach((b) => b.classList.toggle("active", b.dataset.purchaseTab === tab));
  document.querySelectorAll(".purchase-pane").forEach((p) => {
    p.hidden = !p.id.endsWith(`-${tab}-pane`);
  });
  renderEinkaufsplaner();
}

function renderEinkaufsplaner() {
  if (purchaseActiveTab === "messen") renderMessenModul();
  if (purchaseActiveTab === "saison") renderSaisonModul();
  if (purchaseActiveTab === "jtl") renderPurchase();
}

// ===== MODUL 1: MESSEN-EINKAUF =====
function renderMessenModul() {
  if (!byId("messen-list")) return;
  const list = state.messenArtikel || [];

  const totalBudget = list.reduce((s, a) => s + (a.budget || 0), 0);
  const totalVolume = list.reduce((s, a) => s + (a.plannedVolume || 0), 0);
  const avgScore = list.length ? (list.reduce((s, a) => s + (a.messeScore || 0), 0) / list.length).toFixed(1) : "—";
  const avgMargin = list.length ? list.reduce((s, a) => {
    if (!a.ekPrice || !a.vkPrice) return s;
    return s + ((a.vkPrice - a.ekPrice) / a.vkPrice * 100);
  }, 0) / list.length : 0;

  byId("messen-summary").innerHTML = `
    <div class="lever-stat"><span>${list.length}</span><p>Messe-Artikel</p></div>
    <div class="lever-stat"><span>${totalVolume.toLocaleString("de-DE")}</span><p>geplantes Volumen Stk</p></div>
    <div class="lever-stat"><span>${formatEur(totalBudget)}</span><p>kumuliertes Budget</p></div>
    <div class="lever-stat ${avgMargin < 45 ? "alert" : ""}"><span>${avgMargin.toFixed(1)}%</span><p>Ø DB (Ziel ≥45%)</p></div>
    <div class="lever-stat"><span>${avgScore}/10</span><p>Ø Messe-Score</p></div>
  `;

  byId("messen-summary-pill").textContent = `${list.filter((a) => a.status === "bestellt").length} bestellt · ${list.filter((a) => a.status === "geplant").length} geplant`;

  byId("messen-list").innerHTML = list.length ? list.map((a) => {
    const margin = a.vkPrice ? ((a.vkPrice - a.ekPrice) / a.vkPrice * 100).toFixed(1) : "—";
    const marginOk = margin !== "—" && Number(margin) >= 45;
    const totalCost = (a.ekPrice || 0) * (a.plannedVolume || 0);
    const budgetOk = a.budget && totalCost <= a.budget;
    const scoreOk = (a.messeScore || 0) >= 6;
    const statusClass = a.status === "bestellt" ? "bereit" : a.status === "geplant" ? "angefragt" : a.status === "abgelehnt" ? "kritisch" : "mittel";
    return `<article class="messen-artikel">
      <div class="item-line">
        <strong>📅 ${escapeHtml(a.name)}</strong>
        <span class="topbar-actions">
          <span class="pill ${scoreOk ? "bereit" : "kritisch"}">Score ${a.messeScore || 0}/10${scoreOk ? " ✓" : " ✗"}</span>
          <span class="pill ${marginOk ? "bereit" : "kritisch"}">DB ${margin}%${marginOk ? " ✓" : " ✗"}</span>
          <span class="pill ${statusClass}">${escapeHtml(a.status)}</span>
          <button class="icon-button edit" data-edit="messenartikel:${a.id}">✎</button>
          <button class="icon-button" data-messen-delete="${a.id}">×</button>
        </span>
      </div>
      <span class="muted">${escapeHtml(a.supplier || "—")} · EK ${formatEur(a.ekPrice)} / VK ${formatEur(a.vkPrice)} · LYSS Vorjahr ${a.lyssTotalVk || 0} Stk · Messe ${a.messeDate || "—"}</span>
      ${a.collectionFit ? `<span class="muted"><strong>Kollektion:</strong> ${escapeHtml(a.collectionFit)}</span>` : ""}

      <details open>
        <summary><strong>Step 1+3 · Größen-Mix von LYSS</strong> (auto-apply auf ${a.plannedVolume} Stück)</summary>
        <div class="size-mix-grid">
          ${(a.groessenMix || []).map((g) => `
            <div class="size-cell ${g.pennerWarning ? "penner" : ""}">
              <span class="size-label">${escapeHtml(g.groesse)}</span>
              <span class="size-pct">${g.pct}%</span>
              <span class="size-bar"><span style="width:${g.pct * 2.5}%"></span></span>
              <span class="size-qty">${Math.round(a.plannedVolume * g.pct / 100)} Stk</span>
              ${g.pennerWarning ? '<span class="penner-warning" title="Letztes Jahr Penner">⚠ Penner</span>' : ""}
            </div>
          `).join("")}
        </div>
      </details>

      <details>
        <summary><strong>Step 1 · Farben-Top (DB%-Ranking)</strong></summary>
        <div class="color-rank-grid">
          ${(a.farbenTop || []).map((c, i) => `
            <div class="color-rank-row">
              <span class="color-rank">#${i + 1}</span>
              <span class="color-name">${escapeHtml(c.farbe)}</span>
              <span class="color-share">${c.anteilPct}% Anteil</span>
              <span class="color-db ${c.dbPct >= 50 ? "good" : "warn"}">DB ${c.dbPct}%</span>
              <span class="color-vol">${Math.round(a.plannedVolume * c.anteilPct / 100)} Stk</span>
            </div>
          `).join("")}
        </div>
      </details>

      <details>
        <summary><strong>Step 3 · Volumen-Matrix (Größe × Farbe)</strong></summary>
        <div class="volume-matrix">
          <table>
            <thead><tr><th>Größe</th>${(a.farbenTop || []).map((c) => `<th>${escapeHtml(c.farbe)}</th>`).join("")}<th>Σ</th></tr></thead>
            <tbody>
              ${(a.groessenMix || []).map((g) => {
                const rowSum = (a.farbenTop || []).reduce((s, c) => s + Math.round(a.plannedVolume * g.pct / 100 * c.anteilPct / 100), 0);
                return `<tr>
                  <td><strong>${escapeHtml(g.groesse)}</strong></td>
                  ${(a.farbenTop || []).map((c) => `<td>${Math.round(a.plannedVolume * g.pct / 100 * c.anteilPct / 100)}</td>`).join("")}
                  <td><strong>${rowSum}</strong></td>
                </tr>`;
              }).join("")}
              <tr class="matrix-total"><td><strong>Σ</strong></td>${(a.farbenTop || []).map((c) => `<td><strong>${Math.round(a.plannedVolume * c.anteilPct / 100)}</strong></td>`).join("")}<td><strong>${a.plannedVolume}</strong></td></tr>
            </tbody>
          </table>
        </div>
      </details>

      <details>
        <summary><strong>Step 4 · Tausch-Optionen mit Supplier</strong> (${(a.tauschOptionen || []).length})</summary>
        <div class="tausch-list">
          ${(a.tauschOptionen || []).length ? (a.tauschOptionen || []).map((t) => `
            <div class="tausch-row">
              <span class="pill entscheidung">${escapeHtml(t.typ)}</span>
              <span><strong>${escapeHtml(t.from)}</strong> ↔ <strong>${escapeHtml(t.to)}</strong></span>
              <span class="muted">Lead ${t.leadWeeks}W · ${t.costEur ? formatEur(t.costEur) : "kostenlos"}${t.reserveQty ? ` · Reserve ${t.reserveQty} Stk` : ""}</span>
              ${t.notes ? `<span class="muted">${escapeHtml(t.notes)}</span>` : ""}
            </div>
          `).join("") : '<p class="muted">Noch keine Tausch-Optionen eingetragen.</p>'}
        </div>
      </details>

      <div class="messen-validation">
        <strong>Step 5 · Budget-Check:</strong>
        <span class="${budgetOk ? "text-green" : "text-red"}">Geplant ${formatEur(totalCost)} / Budget ${formatEur(a.budget)} ${budgetOk ? "✓" : "▲ über Budget"}</span>
      </div>
      ${a.notes ? `<span class="muted"><strong>Notiz:</strong> ${escapeHtml(a.notes)}</span>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Noch keine Messe-Artikel. "+ Messe-Artikel" oben anlegen.</p>';

  document.querySelectorAll("[data-messen-delete]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.messenDelete;
      if (!confirm("Messe-Artikel löschen?")) return;
      state.messenArtikel = state.messenArtikel.filter((x) => x.id !== id);
      saveState(); renderMessenModul();
    });
  });
}

function exportMessenCsv() {
  const list = state.messenArtikel || [];
  if (!list.length) { showToast("Keine Messe-Artikel"); return; }
  const rows = [["SKU", "Artikel", "Farbe", "Größe", "Qty", "Unit-Cost", "Total-Cost", "Supplier", "ETA", "Messe-Score", "DB%"]];
  list.forEach((a) => {
    const margin = a.vkPrice ? ((a.vkPrice - a.ekPrice) / a.vkPrice * 100).toFixed(1) : "";
    (a.groessenMix || []).forEach((g) => {
      (a.farbenTop || []).forEach((c) => {
        const qty = Math.round((a.plannedVolume || 0) * g.pct / 100 * c.anteilPct / 100);
        if (qty < 1) return;
        const totalCost = qty * (a.ekPrice || 0);
        rows.push([
          a.id + "-" + g.groesse + "-" + c.farbe.toLowerCase(),
          a.name,
          c.farbe,
          g.groesse,
          qty,
          (a.ekPrice || 0).toFixed(2),
          totalCost.toFixed(2),
          a.supplier || "",
          a.messeDate || "",
          a.messeScore || 0,
          margin
        ]);
      });
    });
  });
  const csv = rows.map((r) => r.map((c) => {
    const s = String(c == null ? "" : c);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `messen-bestellung-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(`CSV mit ${rows.length - 1} Zeilen exportiert — für Beate`);
}

async function aiSuggestGroessenMix() {
  if (!aiConfigured()) { showToast("KI-Key fehlt"); return; }
  const out = byId("messen-ai-output");
  out.hidden = false;
  out.innerHTML = '<p class="muted">KI generiert Größen/Farb-Mix aus LYSS-Daten …</p>';
  const list = state.messenArtikel || [];
  const ctx = list.map((a) => `${a.name} (${a.supplier}, EK ${formatEur(a.ekPrice)}, geplant ${a.plannedVolume} Stk):\nGrößenmix LYSS: ${(a.groessenMix || []).map((g) => `${g.groesse}=${g.pct}%`).join(", ")}\nFarbenTop LYSS: ${(a.farbenTop || []).map((c) => `${c.farbe} (DB ${c.dbPct}%, Anteil ${c.anteilPct}%)`).join(", ")}`).join("\n\n");
  try {
    const text = await callAi(
      "Du bist Einkaufs-Stratege bei HFK (Kinder-Concept-Store Wien). Sieh dir die Messe-Artikel mit Größenmix und Farbenrang aus LYSS-Vorjahres-Daten an. Generiere für jeden Artikel: 1) **Vorschlag** ob Mix passt oder anzupassen, 2) **Risiko** (welche Größe/Farbe wackelig), 3) **Tausch-Reserve-Empfehlung** für riskante Größen, 4) **Volumen-Begründung**. Format: pro Artikel ein klarer Absatz. Konkret, in Stück + €.",
      ctx
    );
    out.innerHTML = renderMarkdown(text);
  } catch (error) { out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; }
}

// ===== MODUL 2: SAISON-TRACKING =====
function lifecyclePhase(woche) {
  if (woche <= 4) return { phase: "NEW", desc: "ok, langsam starten", color: "blue" };
  if (woche <= 8) return { phase: "PEAK", desc: "sollte zügig laufen", color: "green" };
  if (woche <= 11) return { phase: "DECLINE", desc: "erwartbar langsamer", color: "yellow" };
  return { phase: "PENNER/OUTLET", desc: "Markdown-Prep", color: "red" };
}

function renderSaisonModul() {
  if (!byId("saison-tracking-list")) return;
  const list = state.saisonTracking || [];
  const woche = saisonSelectedWoche;
  const lc = lifecyclePhase(woche);
  byId("saison-lifecycle-info").innerHTML = `Lifecycle: <strong class="text-${lc.color}">${lc.phase}</strong> — ${lc.desc}`;

  const trackedArtikel = list.length;
  const top = list.filter((t) => (t.currentVk / Math.max(t.lyssVkSameWeek, 1)) >= 1.2).length;
  const slow = list.filter((t) => (t.currentVk / Math.max(t.lyssVkSameWeek, 1)) < 0.7).length;
  const markdownK = list.filter((t) => woche >= 8 && (t.currentVk / Math.max(t.lyssVkSameWeek, 1)) < 0.5).length;

  byId("saison-summary").innerHTML = `
    <div class="lever-stat"><span>${trackedArtikel}</span><p>getrackt</p></div>
    <div class="lever-stat ${top ? "" : ""}"><span>${top}</span><p>ACCELERATE (>+20% vs LYSS)</p></div>
    <div class="lever-stat ${slow ? "alert" : ""}"><span>${slow}</span><p>SLOW (<-30%)</p></div>
    <div class="lever-stat ${markdownK ? "alert" : ""}"><span>${markdownK}</span><p>Markdown-Kandidaten W8+</p></div>
  `;

  byId("saison-tracking-list").innerHTML = list.length ? list.map((t) => {
    const ratio = t.lyssVkSameWeek ? t.currentVk / t.lyssVkSameWeek : 1;
    const delta = Math.round((ratio - 1) * 100);
    const trend = delta >= 20 ? { sym: "↑↑↑", text: "ACCELERATE", cls: "good" } : delta >= 0 ? { sym: "↑", text: "OK", cls: "ok" } : delta >= -30 ? { sym: "↓", text: "SLOW", cls: "warn" } : { sym: "↓↓↓", text: "PENNER-RISK", cls: "bad" };
    const isMarkdownKandidat = woche >= 8 && ratio < 0.5;

    return `<article class="saison-card-tracking">
      <div class="item-line">
        <strong>🌞 ${escapeHtml(t.name)}</strong>
        <span class="topbar-actions">
          <span class="pill ${trend.cls === "good" ? "bereit" : trend.cls === "warn" ? "mittel" : trend.cls === "bad" ? "kritisch" : "entscheidung"}">${trend.sym} ${trend.text} ${delta >= 0 ? "+" : ""}${delta}%</span>
          ${isMarkdownKandidat ? '<span class="pill kritisch">⚠ Markdown-Kandidat</span>' : ""}
          <button class="icon-button" data-saisontrack-edit="${t.id}">✎</button>
        </span>
      </div>
      <div class="saison-vk-row">
        <div><span class="muted">Diese Woche W${t.saisonWoche}</span><strong>${t.currentVk} VK</strong></div>
        <div><span class="muted">Gleiche Woche Vorjahr</span><strong>${t.lyssVkSameWeek} VK</strong></div>
        <div><span class="muted">Δ vs LYSS</span><strong class="text-${trend.cls === "good" ? "green" : trend.cls === "bad" ? "red" : "ink"}">${delta >= 0 ? "+" : ""}${delta}%</strong></div>
      </div>

      <details open>
        <summary><strong>Größen-Status</strong></summary>
        <div class="status-grid">
          ${(t.groessenStatus || []).map((g) => `
            <div class="status-row">
              <span class="size-label">${escapeHtml(g.groesse)}</span>
              <span class="muted">${g.currentVk} VK / Soll ${g.expectedVk}</span>
              <span class="pill ${g.status === "schneller" ? "bereit" : g.status === "slow" ? "kritisch" : "mittel"}">${escapeHtml(g.status)}</span>
            </div>
          `).join("")}
        </div>
      </details>

      <details open>
        <summary><strong>Farben-Signal (vs LYSS)</strong></summary>
        <div class="status-grid">
          ${(t.farbenStatus || []).map((c) => {
            const cls = c.signal === "TOP" ? "bereit" : c.signal === "PENNER" ? "kritisch" : "mittel";
            return `<div class="status-row">
              <span class="color-name">${escapeHtml(c.farbe)}</span>
              <span class="muted">${c.currentVk} VK / LYSS ${c.lyssVk}</span>
              <span class="pill ${cls}">${escapeHtml(c.signal)} ${c.deltaPct >= 0 ? "+" : ""}${c.deltaPct}%</span>
            </div>`;
          }).join("")}
        </div>
      </details>

      ${isMarkdownKandidat ? `<div class="markdown-banner">⚠ <strong>Markdown-Kandidat:</strong> Artikel in W${woche} mit nur ${Math.round(ratio * 100)}% Forecast. Stephan-Briefing für Markdown-Plan?</div>` : ""}
    </article>`;
  }).join("") : '<p class="muted">Noch keine Saison-Artikel im Tracking.</p>';

  // Lorna-Feedback
  byId("lorna-feedback-list").innerHTML = (state.lornaFeedback || []).length ? (state.lornaFeedback || []).slice().sort((a, b) => (b.dateGiven || "").localeCompare(a.dateGiven || "")).map((f) => `
    <article class="lorna-feedback">
      <div class="item-line">
        <strong>📞 Lorna · W${f.week}/${f.year}</strong>
        <span class="muted">${f.dateGiven || "—"}</span>
        <button class="icon-button edit" data-edit="lornafeedback:${f.id}">✎</button>
      </div>
      ${f.trendUpdate ? `<div class="feedback-row"><strong>Trend:</strong> ${escapeHtml(f.trendUpdate)}</div>` : ""}
      ${f.supplierUpdate ? `<div class="feedback-row"><strong>Supplier:</strong> ${escapeHtml(f.supplierUpdate)}</div>` : ""}
      ${f.groessenFeedback ? `<div class="feedback-row"><strong>Größen:</strong> ${escapeHtml(f.groessenFeedback)}</div>` : ""}
      ${f.tauschBedarf ? `<div class="feedback-row accent-warn"><strong>Tausch:</strong> ${escapeHtml(f.tauschBedarf)}</div>` : ""}
    </article>
  `).join("") : '<p class="muted">Noch kein Lorna-Feedback. Jeden Freitag 4pm UTC+3 erfassen.</p>';
}

async function aiSuggestMarkdownPlan() {
  if (!aiConfigured()) { showToast("KI-Key fehlt"); return; }
  const out = byId("saison-ai-output-md");
  out.hidden = false;
  out.innerHTML = '<p class="muted">KI plant Markdown für Penner …</p>';
  const woche = saisonSelectedWoche;
  const list = state.saisonTracking || [];
  const ctx = list.map((t) => {
    const ratio = t.lyssVkSameWeek ? (t.currentVk / t.lyssVkSameWeek).toFixed(2) : "1.0";
    return `${t.name} (W${t.saisonWoche}): ${t.currentVk} VK aktuell vs ${t.lyssVkSameWeek} LYSS = ${(Number(ratio) * 100).toFixed(0)}% Forecast\nGrößen: ${(t.groessenStatus || []).map((g) => `${g.groesse}=${g.currentVk}/${g.expectedVk}(${g.status})`).join(", ")}\nFarben: ${(t.farbenStatus || []).map((c) => `${c.farbe}=${c.signal} ${c.deltaPct >= 0 ? "+" : ""}${c.deltaPct}%`).join(", ")}`;
  }).join("\n\n");
  try {
    const text = await callAi(
      `Du bist HFK-Markdown-Planer. Saison-Woche ${woche} von 13. Lifecycle: ${lifecyclePhase(woche).phase}. Sieh dir die getrackten Artikel an. Für jeden Markdown-Kandidaten (W8+ & unter 50% Forecast): 1) **Wann Markdown** (Wochennummer), 2) **Wieviel %** Reduktion (-10/-20/-30%), 3) **Welche Größen/Farben zuerst**, 4) **Begründung in 1 Satz**. Halte es konkret und in der Sprache von Beate/Lorna.`,
      ctx
    );
    out.innerHTML = renderMarkdown(text);
  } catch (error) { out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; }
}

function renderPurchase() {
  const grid = byId("purchase-grid");
  if (!grid) return;
  const kpis = byId("purchase-kpis");
  const info = byId("purchase-source-info");

  if (!purchaseData) {
    info.textContent = 'Klick "↻ JTL-Daten laden", um die HFK-Produktgruppen aus der Sample-CSV zu importieren.';
    kpis.innerHTML = "";
    grid.innerHTML = '<div class="empty-state"><p class="muted">Noch keine Produktdaten geladen.</p></div>';
    return;
  }

  const products = purchaseData.products;

  const supplierSel = byId("purchase-supplier");
  const suppliers = Array.from(new Set(products.map((p) => p.supplier).filter(Boolean))).sort();
  const currentSup = supplierSel.value || "all";
  supplierSel.innerHTML = `<option value="all">Alle Lieferanten</option>${suppliers.map((s) => `<option ${s === currentSup ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}`;

  const filtered = products.filter((p) => {
    if (purchaseSupplier !== "all" && p.supplier !== purchaseSupplier) return false;
    if (purchaseSignal === "oos" && !p.flags.oos) return false;
    if (purchaseSignal === "db" && !p.flags.dbLow) return false;
    if (purchaseSignal === "lyss" && !p.flags.lyssPresent) return false;
    if (purchaseSignal === "data" && !p.flags.dataOpen) return false;
    if (purchaseSearch) {
      const hay = (p.name + " " + p.sku + " " + p.supplier + " " + p.colors.map((c) => c.label).join(" ") + " " + p.sizes.map((s) => s.label).join(" ")).toLowerCase();
      if (!hay.includes(purchaseSearch)) return false;
    }
    return true;
  });

  const sorted = filtered.slice().sort((a, b) => {
    switch (purchaseSort) {
      case "qty": return b.qty12m - a.qty12m;
      case "margin": return b.margin - a.margin;
      case "stock_days": return (a.stockDays ?? 1e9) - (b.stockDays ?? 1e9);
      case "risk": return purchaseRiskScore(b) - purchaseRiskScore(a);
      default: return b.revenue - a.revenue;
    }
  });

  const totalRev = products.reduce((s, p) => s + p.revenue, 0);
  const totalProfit = products.reduce((s, p) => s + p.profitEur, 0);
  const oosCount = products.filter((p) => p.flags.oos).length;
  const dbLowCount = products.filter((p) => p.flags.dbLow).length;
  const avgMargin = products.length ? products.reduce((s, p) => s + p.margin, 0) / products.length : 0;

  kpis.innerHTML = `
    <div class="lever-stat"><span>${products.length}</span><p>Produktgruppen</p></div>
    <div class="lever-stat"><span>${formatEur(totalRev)}</span><p>Umsatz 12 Monate (Netto)</p></div>
    <div class="lever-stat"><span>${formatEur(totalProfit)}</span><p>Roh-DB 12 Monate</p></div>
    <div class="lever-stat"><span>${avgMargin.toFixed(1)} %</span><p>Ø Marge</p></div>
    <div class="lever-stat ${oosCount ? "alert" : ""}"><span>${oosCount}</span><p>OOS-Risiko</p></div>
    <div class="lever-stat ${dbLowCount ? "alert" : ""}"><span>${dbLowCount}</span><p>DB unter Ziel</p></div>
  `;

  info.innerHTML = `Quelle: <code>${escapeHtml((purchaseData.source || "").replace(/\\/g, "/"))}</code> · zuletzt geladen ${new Date(purchaseData.loadedAt).toLocaleString("de-DE")}`;

  grid.innerHTML = sorted.length ? sorted.map((p) => {
    const risk = purchaseRiskScore(p);
    const tier = risk >= 5 ? "high" : risk >= 2 ? "mid" : "low";
    const stockTxt = p.stockDays === null ? "—" : p.stockDays < 30 ? `${Math.round(p.stockDays)} Tage ⚠` : `${Math.round(p.stockDays)} Tage`;
    return `<article class="product-card risk-${tier}">
      <div class="product-head">
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          <span class="muted">${escapeHtml(p.supplier || "—")} · ${p.variantCount} Varianten</span>
        </div>
        <div class="product-flags">
          ${p.flags.oos ? '<span class="pill kritisch">OOS</span>' : ""}
          ${p.flags.dbLow ? '<span class="pill mittel">DB &lt; 45%</span>' : ""}
          ${p.flags.lyssPresent ? '<span class="pill bereit">LYSS</span>' : ""}
          ${p.flags.dataOpen ? '<span class="pill angefragt">Daten offen</span>' : ""}
        </div>
      </div>
      <div class="product-metrics">
        <div><span>${formatEur(p.revenue)}</span><p>Umsatz 12M</p></div>
        <div><span>${Math.round(p.qty12m)}</span><p>Stück 12M</p></div>
        <div><span>${p.margin.toFixed(1)} %</span><p>DB</p></div>
        <div><span>${Math.round(p.stockAvail)}</span><p>Bestand</p></div>
        <div><span>${stockTxt}</span><p>Reichweite</p></div>
      </div>
      <div class="product-actions">
        <button class="button primary small" data-purchase-detail="${p.id}" type="button">Bestellmatrix</button>
        <button class="button small" data-purchase-ai="${p.id}" type="button">🤖 KI-Analyse</button>
      </div>
    </article>`;
  }).join("") : '<p class="muted">Keine Produkte passend zum Filter.</p>';

  document.querySelectorAll("[data-purchase-detail]").forEach((b) => b.addEventListener("click", (e) => openPurchaseDetail(e.currentTarget.dataset.purchaseDetail)));
  document.querySelectorAll("[data-purchase-ai]").forEach((b) => b.addEventListener("click", (e) => openPurchaseAi(e.currentTarget.dataset.purchaseAi)));
}

function openPurchaseDetail(id) {
  const p = purchaseData?.products.find((x) => x.id === id);
  if (!p) return;
  byId("edit-modal-title").textContent = "Bestellmatrix: " + p.name;
  const fields = byId("edit-modal-fields");
  const colors = distributionShares(p.colors);
  const sizes = distributionShares(p.sizes);
  const defaultTarget = Math.max(Math.round(p.qty12m * 0.5 / 10) * 10, 20);

  fields.innerHTML = `
    <div class="matrix-summary">
      <div><strong>${escapeHtml(p.supplier)}</strong><span class="muted">Lieferant</span></div>
      <div><strong>${formatEur(p.avgCost)}</strong><span class="muted">Ø EK netto</span></div>
      <div><strong>${formatEur(p.avgPrice)}</strong><span class="muted">Ø VK netto</span></div>
      <div><strong>${p.margin.toFixed(1)} %</strong><span class="muted">DB %</span></div>
    </div>
    <label>Zielmenge (Stück) — Default: 50 % des 12M-Absatzes
      <input type="number" id="matrix-target" value="${defaultTarget}" step="10" min="0" />
    </label>
    <label>Budget-Limit (€, optional)
      <input type="number" id="matrix-budget" placeholder="z.B. 8000" step="100" min="0" />
    </label>
    <div id="matrix-output" class="matrix-output"></div>
    <div class="matrix-actions">
      <button type="button" class="button" id="matrix-export-csv">CSV exportieren</button>
      <button type="button" class="button primary" id="matrix-export-clip">Matrix kopieren</button>
    </div>`;

  const form = byId("edit-form");
  form.onsubmit = (e) => { e.preventDefault(); byId("edit-modal").close(); };

  function recompute() {
    const target = Number(byId("matrix-target").value) || 0;
    const budget = Number(byId("matrix-budget").value) || 0;
    const hasColors = colors.length > 0 && colors.some((c) => c.qty > 0);
    const hasSizes = sizes.length > 0 && sizes.some((s) => s.qty > 0);

    let matrix;
    if (hasColors && hasSizes) {
      matrix = colors.map((c) => sizes.map((s) => ({
        color: c.label, size: s.label, qty: Math.round(target * c.share * s.share)
      }))).flat();
    } else if (hasSizes) {
      matrix = sizes.map((s) => ({ color: "—", size: s.label, qty: Math.round(target * s.share) }));
    } else if (hasColors) {
      matrix = colors.map((c) => ({ color: c.label, size: "—", qty: Math.round(target * c.share) }));
    } else {
      matrix = [{ color: "—", size: "—", qty: target }];
    }
    matrix = matrix.filter((m) => m.qty > 0);

    const sumQty = matrix.reduce((s, m) => s + m.qty, 0);
    const totalCost = sumQty * p.avgCost;
    const totalRevenue = sumQty * p.avgPrice;
    const totalDb = totalRevenue - totalCost;
    const budgetOk = !budget || totalCost <= budget;
    const marginOk = p.margin >= 45;

    const matrixHtml = `
      <div class="matrix-meta">
        <div><strong>${sumQty}</strong><span class="muted">Summe Stück</span></div>
        <div class="${budgetOk ? "" : "bad"}"><strong>${formatEur(totalCost)}</strong><span class="muted">Gesamt-EK${budget ? " / " + formatEur(budget) : ""}</span></div>
        <div><strong>${formatEur(totalRevenue)}</strong><span class="muted">Potenzieller Umsatz</span></div>
        <div class="${marginOk ? "" : "warn"}"><strong>${formatEur(totalDb)}</strong><span class="muted">Roh-DB</span></div>
      </div>
      ${!marginOk ? '<p class="muted warn-text">⚠ DB unter 45 % — Marge vor Bestellung mit Stephan klären.</p>' : ""}
      ${!budgetOk ? '<p class="muted warn-text">⚠ Bestellsumme über Budget-Limit.</p>' : ""}
      ${hasColors && hasSizes ? renderMatrixTable(matrix, colors, sizes) : `<table class="matrix-flat"><thead><tr><th>${hasColors ? "Farbe" : "Größe"}</th><th>Menge</th></tr></thead><tbody>${matrix.map((m) => `<tr><td>${escapeHtml(hasColors ? m.color : m.size)}</td><td>${m.qty}</td></tr>`).join("")}</tbody></table>`}
    `;
    byId("matrix-output").innerHTML = matrixHtml;

    byId("matrix-export-csv").onclick = () => {
      const csv = "color;size;qty;ek;sum_ek\n" + matrix.map((m) => `${m.color};${m.size};${m.qty};${p.avgCost.toFixed(2)};${(m.qty * p.avgCost).toFixed(2)}`).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bestellmatrix-${p.id}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      showToast("CSV heruntergeladen");
    };
    byId("matrix-export-clip").onclick = () => {
      const txt = `Bestellmatrix: ${p.name} (${p.supplier})\nZielmenge: ${sumQty} · Gesamt-EK: ${formatEur(totalCost)} · DB%: ${p.margin.toFixed(1)}%\n\n` +
        matrix.map((m) => `${m.color} / ${m.size}: ${m.qty}`).join("\n");
      copyText(txt, "Matrix kopiert");
    };
  }

  byId("matrix-target").addEventListener("input", recompute);
  byId("matrix-budget").addEventListener("input", recompute);
  recompute();
  byId("edit-modal").showModal();
}

function renderMatrixTable(matrix, colors, sizes) {
  const grid = {};
  matrix.forEach((m) => {
    if (!grid[m.color]) grid[m.color] = {};
    grid[m.color][m.size] = m.qty;
  });
  return `<table class="matrix-table">
    <thead><tr><th>Farbe / Größe</th>${sizes.map((s) => `<th>${escapeHtml(s.label)}</th>`).join("")}<th>Σ</th></tr></thead>
    <tbody>
      ${colors.map((c) => {
        const rowSum = sizes.reduce((sum, s) => sum + (grid[c.label]?.[s.label] || 0), 0);
        return `<tr><th>${escapeHtml(c.label)}</th>${sizes.map((s) => `<td>${grid[c.label]?.[s.label] || 0}</td>`).join("")}<td><strong>${rowSum}</strong></td></tr>`;
      }).join("")}
      <tr><th>Σ</th>${sizes.map((s) => `<td><strong>${colors.reduce((sum, c) => sum + (grid[c.label]?.[s.label] || 0), 0)}</strong></td>`).join("")}<td><strong>${matrix.reduce((sum, m) => sum + m.qty, 0)}</strong></td></tr>
    </tbody>
  </table>`;
}

function buildProductContext(p) {
  return `Produkt: ${p.name}
Lieferant: ${p.supplier}
Top-SKU: ${p.sku}
Varianten: ${p.variantCount}
12-Monats-Absatz: ${Math.round(p.qty12m)} Stück
LYSS-Absatz (Mai-Juli 2025): ${Math.round(p.qtyLyss)} Stück
12-Monats-Umsatz Netto: ${formatEur(p.revenue)}
Bestand verfügbar: ${Math.round(p.stockAvail)} · Zulauf: ${Math.round(p.stockInbound)} · Reserviert: ${Math.round(p.reserved)}
Reichweite: ${p.stockDays === null ? "n/v" : Math.round(p.stockDays) + " Tage"}
Ø EK netto: ${formatEur(p.avgCost)} · Ø VK netto: ${formatEur(p.avgPrice)} · DB: ${p.margin.toFixed(1)} %
Farbenmix: ${p.colors.map((c) => c.label + " (" + c.qty + ")").join(", ") || "—"}
Größenmix: ${p.sizes.map((s) => s.label + " (" + s.qty + ")").join(", ") || "—"}
Signal: ${p.signal || "—"}
Offene Datenpunkte: ${p.openIssue || "—"}`;
}

function openPurchaseAi(id) {
  const p = purchaseData?.products.find((x) => x.id === id);
  if (!p) return;
  byId("edit-modal-title").textContent = "KI-Analyse: " + p.name;
  const fields = byId("edit-modal-fields");
  fields.innerHTML = `
    <div class="profile-row">
      <span class="profile-label">Produktkontext (an KI gesendet)</span>
      <pre class="ai-context">${escapeHtml(buildProductContext(p))}</pre>
    </div>
    <label>Vordefinierte Analysen
      <div class="ai-preset-row">
        <button type="button" class="button small" data-preset="nachbestellung">Nachbestellung sinnvoll?</button>
        <button type="button" class="button small" data-preset="risiken">Größte Risiken</button>
        <button type="button" class="button small" data-preset="chancen">Größte Chancen</button>
        <button type="button" class="button small" data-preset="tausch">Tauschoptionen</button>
        <button type="button" class="button small" data-preset="stephan">Briefing-Empfehlung an Stephan</button>
      </div>
    </label>
    <label>Eigene Frage an die KI
      <textarea id="ai-question" rows="3" placeholder="z.B. Was bedeutet die geringe LYSS-Zahl für die Sommer-Bestellung?"></textarea>
    </label>
    <div class="ai-actions">
      <button type="button" class="button primary" id="ai-ask">▶ DeepSeek fragen</button>
    </div>
    <div id="ai-product-result" class="aitool-result" hidden></div>`;

  const form = byId("edit-form");
  form.onsubmit = (e) => { e.preventDefault(); byId("edit-modal").close(); };

  const presetPrompts = {
    nachbestellung: "Würdest du dieses Produkt nachbestellen? Begründe mit den Zahlen (Reichweite, DB, LYSS, Bestand, Sortimentsklasse). Antworte mit klarem JA / NEIN / SCHRITTWEISE und maximal 6 Sätzen.",
    risiken: "Liste die 3 größten Risiken dieses Produkts. Berücksichtige Marge, Bestand, Saisonalität, Datenlücken. Pro Risiko 1 konkrete Gegenmaßnahme.",
    chancen: "Liste die 3 größten Hebel/Chancen dieses Produkts. Quantifiziere wenn möglich in € oder Stück. Pro Chance 1 konkrete erste Aktion.",
    tausch: "Welche Tauschoptionen oder Sortimentsbereinigungen siehst du? Welche Farben/Größen kannibalisieren sich, was sollte raus, was rein? Maximal 5 konkrete Punkte.",
    stephan: "Schreibe ein 8-zeiliges Briefing an Stephan (Geschäftsführer): aktuelle Lage des Produkts, 2 Risiken, 1 Empfehlung, klare Entscheidungsfrage am Ende. Direkt, geschäftsfokussiert."
  };

  document.querySelectorAll("[data-preset]").forEach((b) => {
    b.addEventListener("click", () => { byId("ai-question").value = presetPrompts[b.dataset.preset]; });
  });

  byId("ai-ask").addEventListener("click", async () => {
    if (!aiConfigured()) {
      showToast("Erst KI-Key setzen (⚙ KI im Stephan-Assistent oder KI-Tools)");
      openAiSettings();
      return;
    }
    const q = byId("ai-question").value.trim();
    if (!q) { showToast("Bitte Frage eingeben oder Preset wählen"); return; }
    const result = byId("ai-product-result");
    result.hidden = false;
    result.innerHTML = '<span class="muted">DeepSeek analysiert …</span>';
    try {
      const system = "Du bist Einkaufs-/Sortimentsanalyst für einen mittelgroßen Kinder-/Baby-E-Commerce (HFK). Du bekommst echte Produktkennzahlen und eine Frage. Antworte konkret, mit Bezug auf die Zahlen, geschäftsfokussiert, ohne Allgemeinplätze. Wenn Daten fehlen, sag es. Format: kurze Sätze, ggf. Aufzählung.";
      const user = `PRODUKTKONTEXT:\n${buildProductContext(p)}\n\nFRAGE:\n${q}`;
      const answer = await callAi(system, user);
      result.innerHTML = renderMarkdown(answer);
    } catch (error) {
      result.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  });

  byId("edit-modal").showModal();
}

const aiToolDefs = {
  devils: {
    title: "Devils Advocate",
    intro: "Trag deinen Plan / deine Idee ein. Die KI argumentiert dagegen — Schwachstellen, Risiken, Gegenpositionen. Wenn du das überstehst, übersteht es auch Stephan.",
    inputs: [
      { name: "idea", label: "Idee / Plan / Vorschlag", type: "textarea", placeholder: "z.B. Wir sollten den Shop komplett neu bauen, weil …", rows: 6 },
      { name: "intensity", label: "Schärfe", type: "select", options: ["sachlich", "scharf", "stephan-style"] }
    ],
    run: ({ idea, intensity }) => ({
      system: "Du bist ein erfahrener Devils Advocate für Geschäftsentscheidungen im E-Commerce. Du argumentierst KONSEQUENT GEGEN den vorgelegten Plan. Du suchst Schwachstellen, Risiken, Annahmen, die kippen können, blinde Flecken. Du loberst NICHT. Format: 1) Top-3 Gegenargumente mit jeweils 1-2 Sätzen, 2) 1 unbequeme Frage, die der Vortragende beantworten muss, 3) 1 Szenario, wo der Plan scheitert. Tonalität: " + (intensity || "sachlich") + ".",
      user: `Plan/Idee:\n${idea}`
    })
  },
  translate: {
    title: "Stephan-Sprache-Übersetzer",
    intro: "Tech-Text in Geschäftsführer-Sprache (oder umgekehrt). Stephan liest 2 Sätze, keine 2 Absätze.",
    inputs: [
      { name: "direction", label: "Richtung", type: "select", options: ["Tech → Stephan", "Stephan → Tech"] },
      { name: "text", label: "Originaltext", type: "textarea", placeholder: "Text rein …", rows: 6 }
    ],
    run: ({ direction, text }) => ({
      system: direction === "Stephan → Tech"
        ? "Du übersetzt Geschäftsführer-Anfragen in präzise technische Anforderungen für Entwicklung/Setup. Ergebnis: 1) Was Stephan wirklich will (1 Satz), 2) Konkrete technische Anforderungen als Liste, 3) Was zu klären ist."
        : "Du übersetzt technische/IT-Sprache in geschäftsfreundliche Sprache für einen Inhaber eines mittelgroßen E-Commerce. Max 3-4 Sätze, keine Fachbegriffe, fokus auf Wirkung/Risiko/Zeit/Kosten. Wenn Begriff unvermeidbar: in Klammern erklären.",
      user: text
    })
  },
  mail: {
    title: "Mail-Optimierer",
    intro: "Rohe Mail rein, polierte Version raus. Wähle den Ton — meist 'präzise'.",
    inputs: [
      { name: "tone", label: "Ton", type: "select", options: ["präzise (Standard)", "höflich-warm", "hart-fordernd", "Stephan-Style (kurz + Entscheidungsfrage)"] },
      { name: "text", label: "Rohe Mail", type: "textarea", placeholder: "Was ich eigentlich sagen will …", rows: 8 }
    ],
    run: ({ tone, text }) => ({
      system: "Du optimierst Geschäfts-Mails. Behalte den Sinn, kürze auf das Wesentliche, entferne Füllwörter, mach die Bitte/Frage am Ende explizit. Tonalität: " + (tone || "präzise") + ". Schreibe nur die finale Mail, keine Vorrede.",
      user: `Rohe Mail:\n${text}`
    })
  },
  ideas: {
    title: "10-Ideen-Generator",
    intro: "Thema rein, 10 Ansätze raus — mit Bewertung pro Idee. Gut für Brainstorming vor Stephan-Gespräch.",
    inputs: [
      { name: "topic", label: "Thema / Problem", type: "textarea", placeholder: "z.B. Wiederkaufquote bei HFK steigern …", rows: 4 },
      { name: "context", label: "Kontext (optional)", type: "textarea", placeholder: "Was du schon weißt / probiert hast", rows: 3 }
    ],
    run: ({ topic, context }) => ({
      system: "Du generierst 10 konkrete, unterschiedliche Ideen zu einem E-Commerce-Geschäftsthema (HFK: Mode-Shop mit JTL Wawi). Format pro Idee: **Idee N**: Titel + 1 Satz Beschreibung + Aufwand-Tag (klein/mittel/groß) + Wirkungs-Tag (klein/mittel/groß). Vermeide Allgemeinplätze. Mische sicher/innovativ.",
      user: `Thema: ${topic}${context ? "\n\nKontext: " + context : ""}`
    })
  },
  data: {
    title: "Daten-Erklärer",
    intro: "Zahlen / Tabelle / Abschnitt rein. KI sagt, was auffällt, was zu klären ist, welche Hypothesen folgen.",
    inputs: [
      { name: "data", label: "Daten / Zahlen / Beobachtung", type: "textarea", placeholder: "z.B. Umsatz Jan: 110k, Feb: 75k, Mär: 95k …", rows: 8 },
      { name: "question", label: "Was willst du wissen? (optional)", type: "text", placeholder: "z.B. Warum der Einbruch im Februar?" }
    ],
    run: ({ data, question }) => ({
      system: "Du bist Datenanalyst für E-Commerce. Du erhältst Zahlen oder eine Beobachtung. Ergebnis: 1) **Was auffällt** (3 Punkte, mit konkretem Bezug auf die Zahlen), 2) **Was zu klären ist** (3 Fragen, deren Antwort die Hypothese kippen oder bestätigen würde), 3) **Hypothesen** (max. 3, geordnet nach Wahrscheinlichkeit). Kurz, sachlich, keine Übertreibungen.",
      user: `Daten:\n${data}${question ? "\n\nFrage: " + question : ""}`
    })
  },
  explain: {
    title: "Begriff erklären (HFK-Kontext)",
    intro: "Branchen-Jargon oder Tech-Begriff den du verstehen willst. KI erklärt mit konkretem HFK-Bezug, gibt Beispiel und sagt was Mago daraus für seine Arbeit ziehen sollte. Vorhandene Glossar-Einträge werden mitgegeben.",
    inputs: [
      { name: "term", label: "Begriff", type: "text", placeholder: "z.B. Penner, CLV, Reorder-Point, A/B-Test, Funnel …" },
      { name: "context", label: "Kontext (optional, woher der Begriff kommt)", type: "textarea", placeholder: "z.B. kam in Stephans Mail vor / im Hebel-Cockpit gesehen / Beate hat das gesagt", rows: 3 }
    ],
    run: ({ term, context }) => {
      const existing = jargonLookup(term);
      const known = existing ? `\n\nBereits im MAGALOKO-Glossar:\n- ${existing.term} (${existing.category}): ${existing.definition}${existing.example ? "\nBeispiel: " + existing.example : ""}` : "";
      return {
        system: "Du bist Erklärer für HFK (mittelgroßer Kinder-/Baby-E-Commerce mit JTL Wawi, 32k Kunden, 32 Mio € Lifetime-Umsatz, schrumpft seit 2022). Erkläre den Begriff strukturiert: 1) **Was ist das in einem Satz**, 2) **Konkretes HFK-Beispiel** (echtes Beispiel mit Bezug auf HFK-Daten/-Marken/-Themen), 3) **Was Mago daraus für seine Arbeit ziehen sollte** (1-2 Aktions-Sätze). Max 200 Wörter. Wenn der Begriff schon im Glossar war: ergänze nur was fehlt, wiederhole nicht.",
        user: `Begriff: ${term}${context ? "\n\nKontext: " + context : ""}${known}`
      };
    }
  },
  stephanReply: {
    title: "Stephan-Antwort (3 Tonarten)",
    intro: "Eingehende Mail von Stephan rein, KI schlägt 3 Antwort-Varianten vor — angepasst an Stephans Profil (was triggert, was beruhigt), letzter Mood + offene Versprechen werden mitgegeben. Du wählst die richtige Tonart.",
    inputs: [
      { name: "stephanMail", label: "Stephans Mail/Nachricht (kopiert)", type: "textarea", placeholder: "Mago, bitte sag mir bis morgen…", rows: 6 },
      { name: "context", label: "Worum geht's wirklich? (optional)", type: "textarea", placeholder: "Geht um Februar-Bruch-Klärung. Stephan war beim letzten Gespräch gereizt.", rows: 3 },
      { name: "preferredTone", label: "Bevorzugter Ton", type: "select", options: ["KI entscheidet", "präzise + kurz", "wärmer + erklärend", "hart + Grenze ziehen", "Stephan-Style: 5 Zeilen + Entscheidungsfrage"] }
    ],
    run: ({ stephanMail, context, preferredTone }) => {
      const profile = state.stephanProfile || {};
      const lastMood = (state.stephanMoods || [])[0];
      const moodLine = lastMood ? `Letzter Mood: ${lastMood.mood}${lastMood.note ? " (" + lastMood.note + ")" : ""}, ${lastMood.date}.` : "Kein Mood-Eintrag.";
      const openPromises = (state.promises || []).filter((p) => p.status === "offen" || p.status === "in Arbeit").slice(0, 5);
      const promiseLine = openPromises.length ? "Offene Versprechen an Stephan:\n" + openPromises.map((p) => `- ${p.what} (fällig ${p.dueDate})`).join("\n") : "Keine offenen Versprechen.";
      const profileLines = `Stephan-Profil:\n- Triggert: ${profile.triggers || "—"}\n- Beruhigt: ${profile.calmers || "—"}\n- Stil: ${profile.communicationStyle || "—"}\n- No-Surprise: ${profile.noSurpriseTopics || "—"}`;
      return {
        system: "Du bist Magos persönlicher Mail-Verfasser für Stephan-Kommunikation. Du kennst Stephans Profil und den aktuellen Mood. Generiere 3 Antwort-Varianten (Variante A: präzise+kurz, B: wärmer+erklärend, C: Stephan-Style mit klarer Entscheidungsfrage am Ende) — außer der User hat eine Tonart vorgegeben, dann generiere 1 Variante in dieser Tonart + 1 Alternative. Format: pro Variante **Subject-Vorschlag** + Mail-Text. Max 150 Wörter pro Variante.",
        user: `Stephans Mail:\n${stephanMail}\n\n${context ? "Kontext: " + context + "\n\n" : ""}Bevorzugter Ton: ${preferredTone || "KI entscheidet"}\n\n${profileLines}\n\n${moodLine}\n\n${promiseLine}`
      };
    }
  }
};

let activeAiTool = "devils";
let lastAiResult = null;
let lastAiInputs = null;

function renderAiTools() {
  const intro = byId("aitool-intro");
  const ws = byId("aitool-workspace");
  if (!ws) return;

  if (activeAiTool === "library") {
    intro.textContent = "Gespeicherte Prompts mit ihren Ergebnissen. Klicke auf einen Eintrag um den Prompt in das passende Tool zu laden.";
    renderAiLibrary();
    return;
  }

  const def = aiToolDefs[activeAiTool];
  if (!def) return;
  intro.textContent = def.intro;

  ws.innerHTML = `
    <section class="panel aitool-panel">
      <div class="aitool-inputs">
        ${def.inputs.map((input) => {
          if (input.type === "textarea") {
            return `<label>${escapeHtml(input.label)}<textarea name="${input.name}" rows="${input.rows || 4}" placeholder="${escapeHtml(input.placeholder || "")}"></textarea></label>`;
          }
          if (input.type === "select") {
            return `<label>${escapeHtml(input.label)}<select name="${input.name}">${input.options.map((o) => `<option>${escapeHtml(o)}</option>`).join("")}</select></label>`;
          }
          return `<label>${escapeHtml(input.label)}<input type="text" name="${input.name}" placeholder="${escapeHtml(input.placeholder || "")}" /></label>`;
        }).join("")}
      </div>
      <div class="aitool-actions">
        <button class="button primary" id="aitool-run" type="button">▶ KI starten</button>
        <button class="button" id="aitool-save" type="button" disabled>📚 In Bibliothek speichern</button>
        <button class="button ghost" id="aitool-copy" type="button" disabled>Kopieren</button>
      </div>
    </section>
    <section class="panel aitool-result-panel" id="aitool-result-panel" hidden>
      <div class="panel-header">
        <h3>Ergebnis</h3>
        <span class="muted" id="aitool-result-meta"></span>
      </div>
      <div id="aitool-result" class="aitool-result"></div>
    </section>`;

  byId("aitool-run").addEventListener("click", () => runAiTool(def));
  byId("aitool-save").addEventListener("click", () => saveLastAiToLibrary(def));
  byId("aitool-copy").addEventListener("click", () => {
    if (lastAiResult) copyText(lastAiResult, "Ergebnis kopiert");
  });
}

async function runAiTool(def) {
  if (!aiConfigured()) {
    showToast("Erst KI-Key setzen (⚙ KI)");
    openAiSettings();
    return;
  }
  const inputs = {};
  document.querySelectorAll("#aitool-workspace [name]").forEach((el) => {
    inputs[el.name] = el.value.trim();
  });
  const hasContent = Object.values(inputs).some((v) => v && v.length > 2);
  if (!hasContent) {
    showToast("Bitte Eingabe ausfüllen");
    return;
  }
  const { system, user } = def.run(inputs);
  const panel = byId("aitool-result-panel");
  const out = byId("aitool-result");
  panel.hidden = false;
  out.innerHTML = '<span class="muted">KI denkt …</span>';
  byId("aitool-result-meta").textContent = "läuft …";
  const start = Date.now();
  try {
    const result = await callAi(system, user);
    lastAiResult = result;
    lastAiInputs = inputs;
    out.innerHTML = renderMarkdown(result);
    // Spezial: bei "explain"-Tool → Button zum direkten Speichern ins Glossar
    if (activeAiTool === "explain" && inputs.term) {
      const term = inputs.term;
      out.innerHTML += `<div style="margin-top:14px;display:flex;gap:8px;"><button type="button" class="button primary small" id="explain-to-glossary">📖 Als Glossar-Eintrag speichern</button></div>`;
      setTimeout(() => {
        const btn = byId("explain-to-glossary");
        if (!btn) return;
        btn.addEventListener("click", () => {
          if (jargonLookup(term)) {
            if (!confirm(`„${term}" ist schon im Glossar — trotzdem hinzufügen?`)) return;
          }
          // Definition aus dem KI-Text rauskochen (erste 200 Zeichen ohne Markdown)
          const plain = result.replace(/[#*_`]/g, "").trim();
          const firstParagraph = plain.split(/\n\n/)[0].slice(0, 280);
          state.glossary.unshift({
            id: uid("gl"),
            term,
            category: "Sonstiges",
            definition: firstParagraph,
            synonyms: "",
            example: "Aus KI-Erklärer übernommen — bei Bedarf editieren.",
            source: "KI-generiert (DeepSeek/MAGALOKO)"
          });
          saveState();
          renderGlossary();
          showToast(`„${term}" ins Glossar übernommen`);
          btn.disabled = true;
          btn.textContent = "✓ Im Glossar gespeichert";
        });
      }, 0);
    }
    byId("aitool-result-meta").textContent = `fertig in ${Math.round((Date.now() - start) / 100) / 10}s · ${loadAiConfig().model}`;
    byId("aitool-save").disabled = false;
    byId("aitool-copy").disabled = false;
  } catch (error) {
    out.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    byId("aitool-result-meta").textContent = "Fehler";
  }
}

function saveLastAiToLibrary(def) {
  if (!lastAiResult) return;
  const title = prompt("Titel für Bibliothek:", def.title + " — " + new Date().toLocaleString("de-DE"));
  if (!title) return;
  state.aiPromptLibrary.unshift({
    id: uid("pl"),
    category: def.title,
    title,
    prompt: JSON.stringify(lastAiInputs, null, 2),
    result: lastAiResult,
    savedAt: new Date().toISOString(),
    notes: ""
  });
  saveState();
  showToast("In Bibliothek gespeichert");
}

function renderAiLibrary() {
  const ws = byId("aitool-workspace");
  const lib = state.aiPromptLibrary || [];
  if (!lib.length) {
    ws.innerHTML = '<p class="muted">Bibliothek ist leer. Speichere gute Prompts aus den anderen Tools, um sie hier wiederzufinden.</p>';
    return;
  }
  ws.innerHTML = `<div class="aitool-library">${lib.map((entry) => `
    <article class="library-entry">
      <div class="item-line">
        <strong>${escapeHtml(entry.title)}</strong>
        <span class="topbar-actions">
          <span class="pill entscheidung">${escapeHtml(entry.category)}</span>
          <button class="icon-button" data-library-delete="${entry.id}" title="Löschen">×</button>
        </span>
      </div>
      <span class="muted">${new Date(entry.savedAt).toLocaleString("de-DE")}</span>
      <details>
        <summary>Prompt & Ergebnis</summary>
        <p class="muted"><strong>Eingabe:</strong></p>
        <pre>${escapeHtml(entry.prompt)}</pre>
        <p class="muted"><strong>Ergebnis:</strong></p>
        <div class="library-result">${renderMarkdown(entry.result || "—")}</div>
      </details>
    </article>`).join("")}</div>`;

  document.querySelectorAll("[data-library-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.libraryDelete;
      if (!confirm("Eintrag löschen?")) return;
      state.aiPromptLibrary = state.aiPromptLibrary.filter((e) => e.id !== id);
      saveState();
      renderAiLibrary();
      showToast("Gelöscht");
    });
  });
}

let assistantMode = "catalog";
let assistantTopic = "all";
let assistantSearch = "";
let drillQueue = [];
let drillIndex = 0;
let drillRevealed = false;
let drillFilter = null;

function confidenceLabel(value) {
  return ["nie", "wackelig", "gut", "sitzt"][Number(value) || 0];
}

function confidenceClass(value) {
  const map = ["hoch", "mittel", "mittel", "bereit"];
  return map[Number(value) || 0];
}

function renderAssistant() {
  const select = byId("assistant-topic");
  if (!select) return;
  const topics = Array.from(new Set(state.stephanQuestions.map((q) => q.topic).filter(Boolean))).sort();
  const currentValue = select.value || "all";
  select.innerHTML = `<option value="all">Alle Themen</option>${topics.map((t) => `<option value="${escapeHtml(t)}" ${t === currentValue ? "selected" : ""}>${escapeHtml(t)}</option>`).join("")}`;

  const filtered = state.stephanQuestions.filter((q) => {
    if (assistantTopic !== "all" && q.topic !== assistantTopic) return false;
    if (!assistantSearch) return true;
    const hay = (q.question + " " + (q.modelAnswer || "") + " " + (q.topic || "")).toLowerCase();
    return hay.includes(assistantSearch);
  });

  const total = state.stephanQuestions.length;
  const sits = state.stephanQuestions.filter((q) => Number(q.confidence) >= 3).length;
  const open = state.stephanQuestions.filter((q) => Number(q.confidence) <= 1).length;
  byId("assistant-stats").innerHTML = `<span class="muted">${total} Fragen · ${sits} sitzen · <strong>${open} brauchen Übung</strong> · gefiltert: ${filtered.length}</span>`;

  if (assistantMode === "catalog") {
    byId("assistant-catalog").hidden = false;
    byId("assistant-drill").hidden = true;
    const sorted = filtered.slice().sort((a, b) => (Number(a.confidence) || 0) - (Number(b.confidence) || 0));
    byId("assistant-catalog").innerHTML = sorted.length
      ? sorted.map((q) => `
        <article class="question-card">
          <div class="item-line">
            <strong>${escapeHtml(q.question)}</strong>
            <span class="topbar-actions">
              <span class="pill ${confidenceClass(q.confidence)}">${confidenceLabel(q.confidence)}</span>
              <button class="icon-button edit" data-edit="question:${q.id}" title="Bearbeiten">✎</button>
              <button class="icon-button" data-question-delete="${q.id}" title="Löschen">×</button>
            </span>
          </div>
          <span class="muted">${escapeHtml(q.topic || "—")}</span>
          <details>
            <summary>Musterantwort & Stichpunkte</summary>
            <p><strong>Antwort:</strong> ${escapeHtml(q.modelAnswer || "—")}</p>
            ${(q.talkingPoints || []).length ? `<ul>${q.talkingPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>` : ""}
            ${q.dataNeeded ? `<p class="muted"><strong>Brauche:</strong> ${escapeHtml(q.dataNeeded)}</p>` : ""}
          </details>
        </article>`).join("")
      : '<p class="muted">Keine Fragen passend zum Filter.</p>';

    document.querySelectorAll("[data-question-delete]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const id = event.currentTarget.dataset.questionDelete;
        const q = state.stephanQuestions.find((x) => x.id === id);
        if (!q) return;
        if (!confirm(`Frage "${q.question.slice(0, 80)}…" löschen?`)) return;
        state.stephanQuestions = state.stephanQuestions.filter((x) => x.id !== id);
        saveState();
        renderAssistant();
        showToast("Frage gelöscht");
      });
    });
  } else {
    byId("assistant-catalog").hidden = true;
    byId("assistant-drill").hidden = false;
    renderDrill();
  }
}

function startDrill(topicFilter = null) {
  const pool = state.stephanQuestions.filter((q) => !topicFilter || q.topic === topicFilter);
  if (!pool.length) {
    showToast("Keine Fragen für diesen Filter");
    return;
  }
  drillQueue = pool
    .slice()
    .sort((a, b) => (Number(a.confidence) || 0) - (Number(b.confidence) || 0))
    .slice(0, 12)
    .sort(() => Math.random() - 0.5);
  drillIndex = 0;
  drillRevealed = false;
  drillFilter = topicFilter;
  assistantMode = "drill";
  document.querySelectorAll("#assistant-mode button").forEach((b) => b.classList.toggle("active", b.dataset.mode === "drill"));
  setView("assistant");
}

function renderDrill() {
  const container = byId("assistant-drill");
  if (!container) return;
  if (!drillQueue.length) {
    container.innerHTML = `<div class="drill-empty">
      <p class="muted">Drill nicht gestartet.</p>
      <button class="button primary" id="drill-start-all" type="button">Drill mit allen Fragen starten</button>
      ${assistantTopic !== "all" ? `<button class="button" id="drill-start-topic" type="button">Nur Thema "${escapeHtml(assistantTopic)}"</button>` : ""}
    </div>`;
    byId("drill-start-all")?.addEventListener("click", () => startDrill(null));
    byId("drill-start-topic")?.addEventListener("click", () => startDrill(assistantTopic));
    return;
  }

  if (drillIndex >= drillQueue.length) {
    container.innerHTML = `<div class="drill-empty">
      <p><strong>Durch.</strong> ${drillQueue.length} Fragen geübt${drillFilter ? ` (Thema: ${escapeHtml(drillFilter)})` : ""}.</p>
      <button class="button primary" id="drill-restart" type="button">Neuer Durchlauf</button>
      <button class="button" id="drill-exit" type="button">Zum Katalog</button>
    </div>`;
    byId("drill-restart").addEventListener("click", () => startDrill(drillFilter));
    byId("drill-exit").addEventListener("click", () => {
      assistantMode = "catalog";
      document.querySelectorAll("#assistant-mode button").forEach((b) => b.classList.toggle("active", b.dataset.mode === "catalog"));
      drillQueue = [];
      renderAssistant();
    });
    return;
  }

  const q = drillQueue[drillIndex];
  container.innerHTML = `
    <div class="drill-progress muted">Karte ${drillIndex + 1} von ${drillQueue.length}${drillFilter ? ` · ${escapeHtml(drillFilter)}` : ""}</div>
    <article class="drill-card">
      <span class="pill entscheidung">${escapeHtml(q.topic || "—")}</span>
      <h3>${escapeHtml(q.question)}</h3>
      <label class="drill-user-answer muted">Deine Antwort (optional, für KI-Feedback)
        <textarea id="drill-user-input" rows="3" placeholder="Hier tippst du wie du Stephan antworten würdest …"></textarea>
      </label>
      ${aiConfigured() ? `<div class="drill-actions"><button class="button" id="drill-critique" type="button">KI-Feedback holen</button></div><div id="drill-critique-out" class="drill-critique" hidden></div>` : ""}
      ${drillRevealed ? `
        <div class="drill-answer">
          <p><strong>Musterantwort:</strong> ${escapeHtml(q.modelAnswer || "—")}</p>
          ${(q.talkingPoints || []).length ? `<ul>${q.talkingPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>` : ""}
          ${q.dataNeeded ? `<p class="muted"><strong>Brauche:</strong> ${escapeHtml(q.dataNeeded)}</p>` : ""}
        </div>
        <div class="drill-actions">
          <button class="button" data-confidence="0" type="button">Keine Ahnung</button>
          <button class="button" data-confidence="1" type="button">Wackelig</button>
          <button class="button" data-confidence="2" type="button">Gut</button>
          <button class="button primary" data-confidence="3" type="button">Sitzt</button>
        </div>` : `
        <div class="drill-actions">
          <button class="button primary" id="drill-reveal" type="button">Antwort zeigen</button>
          <button class="button ghost" id="drill-skip" type="button">Überspringen</button>
        </div>`}
    </article>`;

  byId("drill-reveal")?.addEventListener("click", () => { drillRevealed = true; renderDrill(); });
  byId("drill-skip")?.addEventListener("click", () => { drillIndex += 1; drillRevealed = false; renderDrill(); });
  byId("drill-critique")?.addEventListener("click", async () => {
    const answer = byId("drill-user-input")?.value.trim();
    if (!answer) { showToast("Erst eigene Antwort eintippen"); return; }
    const out = byId("drill-critique-out");
    out.hidden = false;
    out.textContent = "KI denkt …";
    try {
      const feedback = await aiCritiqueAnswer(q.question, q.modelAnswer, answer);
      out.textContent = feedback;
    } catch (error) {
      out.textContent = error.message;
    }
  });
  document.querySelectorAll("[data-confidence]").forEach((button) => {
    button.addEventListener("click", (event) => {
      q.confidence = Number(event.currentTarget.dataset.confidence);
      q.lastDrilled = new Date().toISOString();
      saveState();
      drillIndex += 1;
      drillRevealed = false;
      renderDrill();
    });
  });
}

// === Tages-Playbook ===
const PLAYBOOK_STEPS = [
  { id: "pb-anom", time: "09:00", icon: "⚠", title: "Anomalien-Check", desc: "Was hat sich seit gestern bewegt? Wochenzahlen + Abweichungen über Schwelle.", view: "anomalies" },
  { id: "pb-brief", time: "09:30", icon: "☀", title: "Morgen-Briefing", desc: "KI-Briefing lesen oder neu generieren. Top-3 für heute fixieren.", view: "daily" },
  { id: "pb-prom", time: "10:00", icon: "★", title: "Stephan-Versprechen-Review", desc: "Offene Versprechen, überfällige eskalieren. Was kommuniziere ich heute?", view: "assistant" },
  { id: "pb-hebel", time: "11:00", icon: "⚡", title: "Hebel-Cockpit", desc: "Welche Top-Hebel bewegen sich? Was blockiert? Wo lohnt heute Energie?", view: "levers" },
  { id: "pb-jobs", time: "14:00", icon: "▣", title: "Jobs & Aufgaben", desc: "Operatives wegarbeiten. Diese-Woche-Stapel reduzieren.", view: "jobs" },
  { id: "pb-capture", time: "17:00", icon: "📥", title: "Capture-Inbox leeren", desc: "Gedanken vom Tag sortieren — was wird Task, Notiz, Risiko, Hebel?", view: "capture" },
  { id: "pb-week", time: "18:00", icon: "▤", title: "Tag schließen", desc: "Wochenplan-View, Wochenupdate-Kopie für Stephan vorbereiten.", view: "week" }
];

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ensurePlaybookState() {
  if (!state.playbookStatus) state.playbookStatus = {};
  const key = todayIso();
  if (!state.playbookStatus[key]) state.playbookStatus[key] = {};
  return state.playbookStatus[key];
}

function setPlaybookStatus(stepId, status) {
  const day = ensurePlaybookState();
  if (status === null) delete day[stepId];
  else day[stepId] = status;
  saveState();
  renderToday();
}

function currentPlaybookStep() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  let current = null;
  for (const step of getPlaybookSteps()) {
    const [h, m] = step.time.split(":").map(Number);
    if (mins >= h * 60 + m) current = step;
  }
  return current?.id;
}

function renderToday() {
  const list = byId("playbook-list");
  if (!list) return;
  const status = ensurePlaybookState();
  const nowId = currentPlaybookStep();
  const steps = getPlaybookSteps();
  const done = steps.filter((s) => status[s.id] === "done").length;
  const progress = byId("playbook-progress");
  if (progress) progress.textContent = `${done} / ${steps.length} erledigt`;
  const subtitle = byId("today-subtitle");
  if (subtitle) {
    const d = new Date();
    const weekday = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][d.getDay()];
    subtitle.textContent = `${weekday} · ${d.toLocaleDateString("de-DE")}`;
  }
  list.innerHTML = steps.map((step) => {
    const st = status[step.id] || (step.id === nowId ? "now" : "pending");
    const stClass = st === "done" ? "status-done" : st === "skipped" ? "status-skipped" : st === "now" ? "status-now" : "";
    return `<li class="playbook-step ${stClass}" data-step="${step.id}">
      <div class="playbook-time"><span class="playbook-icon">${step.icon}</span>${step.time}</div>
      <div class="playbook-text">
        <h4>${escapeHtml(step.title)}</h4>
        <p>${escapeHtml(step.desc)}</p>
      </div>
      <div class="playbook-actions">
        <button type="button" class="open" data-playbook-action="open" data-view="${step.view}">→ Öffnen</button>
        <button type="button" class="done" data-playbook-action="done">✓ Erledigt</button>
        <button type="button" class="skip" data-playbook-action="skip">⏭ Skip</button>
      </div>
    </li>`;
  }).join("");
  list.querySelectorAll(".playbook-step").forEach((li) => {
    const id = li.dataset.step;
    li.querySelectorAll("button[data-playbook-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.playbookAction;
        if (action === "open") {
          setPlaybookStatus(id, "done");
          setView(btn.dataset.view);
        } else if (action === "done") {
          const day = ensurePlaybookState();
          setPlaybookStatus(id, day[id] === "done" ? null : "done");
        } else if (action === "skip") {
          const day = ensurePlaybookState();
          setPlaybookStatus(id, day[id] === "skipped" ? null : "skipped");
        }
      });
    });
  });
  renderTodayStrip();
}


function collectDatedEvents(fromIso, toIso) {
  const events = [];
  (state.tasks || []).forEach((t) => {
    if (t.dueDate && t.dueDate >= fromIso && t.dueDate <= toIso) {
      events.push({ date: t.dueDate, time: "", type: "task", title: t.title, meta: t.area || "", view: "jobs", id: t.id });
    }
  });
  (state.promises || []).forEach((p) => {
    const due = p.dueDate || p.due;
    if (due && due >= fromIso && due <= toIso) {
      events.push({ date: due, time: "", type: "promise", title: p.title || p.text || "Versprechen", meta: p.owner || "", view: "assistant", id: p.id });
    }
  });
  (state.meetings || []).forEach((m) => {
    if (m.date && m.date >= fromIso && m.date <= toIso) {
      events.push({ date: m.date, time: m.time || "", type: "meeting", title: m.type || "Gespräch", meta: m.goal?.slice(0, 80) || "", view: "meeting", id: m.id });
    }
  });
  (oneSourcePhases || []).forEach((p) => {
    if (p.start >= fromIso && p.start <= toIso) {
      events.push({ date: p.start, time: "", type: "phase", title: `${p.label} startet`, meta: p.deliverable, view: "roadmap", id: p.id });
    }
    if (p.end >= fromIso && p.end <= toIso) {
      events.push({ date: p.end, time: "", type: "phase", title: `${p.label} endet`, meta: p.deliverable, view: "roadmap", id: p.id + "-end" });
    }
  });
  (state.calendarEvents || []).forEach((e) => {
    if (e.date && e.date >= fromIso && e.date <= toIso) {
      events.push({ date: e.date, time: e.time || "", type: "event", title: e.title, meta: e.notes || "", view: "calendar", id: e.id, editable: true });
    }
  });
  events.sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
  return events;
}

function renderTodayStrip() {
  const strip = byId("today-strip");
  if (!strip) return;
  const today = todayIso();
  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);
  const toIso = in7.toISOString().slice(0, 10);
  const events = collectDatedEvents(today, toIso);
  const overdue = collectDatedEvents("1970-01-01", today).filter((e) => e.date < today && e.type !== "phase");
  const byDay = {};
  overdue.forEach((e) => { byDay.overdue = byDay.overdue || []; byDay.overdue.push(e); });
  events.forEach((e) => { byDay[e.date] = byDay[e.date] || []; byDay[e.date].push(e); });
  const dayLabels = (iso) => {
    const d = new Date(iso);
    const wk = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()];
    return `${wk} ${d.getDate()}.${d.getMonth() + 1}.`;
  };
  const blocks = [];
  if (byDay.overdue?.length) {
    blocks.push(`<div class="today-strip-day is-overdue">
      <h4>⚠ Überfällig <span class="muted">(${byDay.overdue.length})</span></h4>
      <div class="today-strip-items">${byDay.overdue.map(stripItem).join("")}</div>
    </div>`);
  }
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const items = byDay[iso] || [];
    if (!items.length && i > 0) continue;
    const cls = i === 0 ? "is-today" : "";
    const heading = i === 0 ? `Heute <span class="muted">${dayLabels(iso)}</span>` : dayLabels(iso);
    blocks.push(`<div class="today-strip-day ${cls}">
      <h4>${heading}${items.length ? ` <span class="muted">(${items.length})</span>` : ""}</h4>
      <div class="today-strip-items">${items.length ? items.map(stripItem).join("") : '<span class="muted">— nichts</span>'}</div>
    </div>`);
  }
  strip.innerHTML = blocks.join("");
  strip.querySelectorAll("[data-jump-view]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      setView(a.dataset.jumpView);
    });
  });
}

function stripItem(e) {
  const time = e.time ? `${escapeHtml(e.time)} · ` : "";
  return `<a href="#${e.view}" data-jump-view="${e.view}"><span class="tag ${e.type}">${e.type}</span>${time}${escapeHtml(e.title)}</a>`;
}

// === Kalender ===
let calendarMonth = (() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; })();
let calendarSelectedDate = null;

function renderCalendar() {
  const grid = byId("calendar-grid");
  if (!grid) return;
  const title = byId("calendar-title");
  if (title) title.textContent = new Date(calendarMonth.y, calendarMonth.m, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const firstDay = new Date(calendarMonth.y, calendarMonth.m, 1);
  const lastDay = new Date(calendarMonth.y, calendarMonth.m + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mo=0
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;
  const today = todayIso();
  const dowLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const cells = [dowLabels.map((d) => `<div class="calendar-dow">${d}</div>`).join("")];
  const monthStart = `${calendarMonth.y}-${String(calendarMonth.m + 1).padStart(2, "0")}-01`;
  const monthEndDate = new Date(calendarMonth.y, calendarMonth.m + 1, 0);
  const monthEnd = monthEndDate.toISOString().slice(0, 10);
  const padStart = new Date(calendarMonth.y, calendarMonth.m, 1 - startDow).toISOString().slice(0, 10);
  const padEnd = new Date(calendarMonth.y, calendarMonth.m + 1, totalCells - startDow - lastDay.getDate()).toISOString().slice(0, 10);
  const events = collectDatedEvents(padStart, padEnd);
  const byDate = {};
  events.forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(calendarMonth.y, calendarMonth.m, i - startDow + 1);
    const iso = d.toISOString().slice(0, 10);
    const inMonth = d.getMonth() === calendarMonth.m;
    const items = byDate[iso] || [];
    const types = [...new Set(items.map((e) => e.type))];
    const dots = types.map((t) => `<span class="day-dot ${t}"></span>`).join("");
    const cls = [
      "calendar-cell",
      !inMonth ? "other-month" : "",
      iso === today ? "is-today" : "",
      iso === calendarSelectedDate ? "is-selected" : ""
    ].filter(Boolean).join(" ");
    cells.push(`<button type="button" class="${cls}" data-date="${iso}">
      <span class="day-num">${d.getDate()}</span>
      ${dots ? `<span class="day-dots">${dots}</span>` : ""}
      ${items.length ? `<span class="day-count">${items.length}</span>` : ""}
    </button>`);
  }
  grid.innerHTML = cells.join("");
  grid.querySelectorAll(".calendar-cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      calendarSelectedDate = cell.dataset.date;
      renderCalendar();
      renderCalendarDay();
    });
  });
  renderCalendarDay();
}

function renderCalendarDay() {
  const panel = byId("calendar-day-panel");
  if (!panel) return;
  if (!calendarSelectedDate) { panel.hidden = true; return; }
  panel.hidden = false;
  const title = byId("calendar-day-title");
  const events = collectDatedEvents(calendarSelectedDate, calendarSelectedDate);
  const d = new Date(calendarSelectedDate);
  if (title) title.textContent = d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const list = byId("calendar-day-events");
  if (!list) return;
  if (!events.length) {
    list.innerHTML = '<p class="muted">Keine Termine an diesem Tag. Über "+ Termin" anlegen.</p>';
  } else {
    list.innerHTML = events.map((e) => `<div class="calendar-event type-${e.type}">
      <span class="event-time">${e.time ? escapeHtml(e.time) : ({ task: "Aufg.", promise: "Verspr.", meeting: "Termin", phase: "Phase", event: "Termin" }[e.type] || e.type)}</span>
      <div>
        <div class="event-title">${escapeHtml(e.title)}</div>
        ${e.meta ? `<div class="event-meta">${escapeHtml(e.meta)}</div>` : ""}
      </div>
      <div>
        ${e.editable
          ? `<button type="button" data-edit="event:${e.id}" title="Bearbeiten">✎</button>
             <button type="button" class="event-delete" data-delete-event="${e.id}" title="Löschen">🗑</button>`
          : `<button type="button" data-jump-event="${e.view}" title="Im Modul öffnen">→</button>`}
      </div>
    </div>`).join("");
    list.querySelectorAll("[data-jump-event]").forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.dataset.jumpEvent));
    });
    list.querySelectorAll("[data-delete-event]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.deleteEvent;
        const ev = (state.calendarEvents || []).find((x) => x.id === id);
        if (!ev) return;
        if (!confirm(`Termin "${ev.title}" wirklich löschen?`)) return;
        state.calendarEvents = state.calendarEvents.filter((x) => x.id !== id);
        saveState();
        renderCalendar();
        renderToday();
        showToast("Termin gelöscht");
      });
    });
  }
}

// === Playbook konfigurierbar ===
function sortByTime(steps) {
  return [...steps].sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));
}

function getPlaybookSteps() {
  if (Array.isArray(state.playbookSteps) && state.playbookSteps.length) return sortByTime(state.playbookSteps);
  return sortByTime(PLAYBOOK_STEPS);
}

// === Settings ===
const VIEW_OPTIONS_FOR_PLAYBOOK = [
  "dashboard","today","calendar","levers","anomalies","daily","week","roadmap","access","briefing","meeting","assistant","aitools","purchase","brands","champions","crosssell","sortiment","vip","sebo","risks","decisions","vendors","pitches","glossary","beforeafter","competitors","hypotheses","premortems","wirkungen","saisonplan","verhandlungen","capture","triggers","career","portfolio","mentors","learnings","energy","graph","recap","usage","audit","time","monthly","team","honorar","jobs","knowledge","systems","settings"
];

function renderSettings() {
  if (!byId("settings")) return;
  // KI-Section
  const cfg = loadAiConfig();
  if (byId("settings-ai-provider")) byId("settings-ai-provider").value = cfg.provider || "deepseek";
  if (byId("settings-ai-model")) byId("settings-ai-model").value = cfg.model || (cfg.provider === "openai" ? "gpt-4o-mini" : "deepseek-chat");
  if (byId("settings-ai-key")) byId("settings-ai-key").value = cfg.apiKey || "";
  if (byId("settings-ai-persist")) byId("settings-ai-persist").value = cfg._storage === "local" ? "local" : "session";
  const status = byId("settings-ai-status");
  if (status) {
    if (cfg.apiKey && cfg._storage === "local") status.textContent = "✓ Key dauerhaft auf diesem Gerät gespeichert.";
    else if (cfg.apiKey) status.textContent = "✓ Key in dieser Session aktiv (wird beim Tab-Schließen gelöscht).";
    else status.textContent = "✗ Kein Key vorhanden.";
  }
  // Anzeige-Section
  const denseToggle = byId("settings-density-toggle");
  const sidebarToggle = byId("settings-sidebar-toggle");
  if (denseToggle) denseToggle.checked = document.body.classList.contains("density-dense");
  if (sidebarToggle) sidebarToggle.checked = document.body.classList.contains("sidebar-collapsed");
  // Playbook-Section
  renderPlaybookEditor();
}

function renderPlaybookEditor() {
  const list = byId("settings-playbook-list");
  if (!list) return;
  const steps = getPlaybookSteps();
  list.innerHTML = steps.map((s, idx) => `
    <div class="settings-playbook-row" data-idx="${idx}">
      <input class="row-time" type="text" value="${escapeHtml(s.time)}" placeholder="HH:MM" />
      <input class="row-icon" type="text" value="${escapeHtml(s.icon)}" placeholder="⚡" />
      <div class="row-cell-stack">
        <input class="row-title" type="text" value="${escapeHtml(s.title)}" placeholder="Schritt-Titel" />
        <textarea class="row-desc" placeholder="Kurze Beschreibung">${escapeHtml(s.desc || "")}</textarea>
      </div>
      <select class="row-view">${VIEW_OPTIONS_FOR_PLAYBOOK.map((v) => `<option value="${v}" ${v === s.view ? "selected" : ""}>${v}</option>`).join("")}</select>
      <button class="remove-btn" type="button" title="Schritt entfernen">×</button>
    </div>
  `).join("");
  list.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".settings-playbook-row")?.remove();
    });
  });
}

function collectPlaybookFromEditor() {
  const rows = byId("settings-playbook-list")?.querySelectorAll(".settings-playbook-row") || [];
  const steps = [];
  rows.forEach((row, idx) => {
    const time = row.querySelector(".row-time")?.value.trim();
    const icon = row.querySelector(".row-icon")?.value.trim();
    const title = row.querySelector(".row-title")?.value.trim();
    const desc = row.querySelector(".row-desc")?.value.trim();
    const view = row.querySelector(".row-view")?.value;
    if (!title) return;
    steps.push({ id: `pb-c${idx + 1}`, time: time || "12:00", icon: icon || "•", title, desc: desc || "", view: view || "dashboard" });
  });
  return steps;
}

// === Phase 3: ABC-Übersicht + Bestand-Check + Kunden-Detail + MA-Validation ===
let abcCurrentCls = "A";

async function renderAbcUebersicht() {
  if (!byId("abc-uebersicht")) return;
  // Tab-Buttons
  document.querySelectorAll("#abc-tabs button").forEach((b) => {
    if (b.dataset.wired) return;
    b.dataset.wired = "1";
    b.addEventListener("click", () => {
      document.querySelectorAll("#abc-tabs button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      abcCurrentCls = b.dataset.abcCls;
      loadAbcView();
    });
  });
  if (!byId("abc-results").dataset.loaded) {
    byId("abc-results").dataset.loaded = "1";
    loadAbcView();
  }
}

async function loadAbcView() {
  const host = byId("abc-results");
  const status = byId("abc-status");
  if (!host) return;
  host.innerHTML = '<p class="muted">Lade …</p>';
  if (status) status.textContent = "Lade …";
  try {
    const r = await fetch(`/api/jtl/articles/top?cls=${abcCurrentCls}&limit=80`);
    const data = await r.json();
    if (status) status.textContent = `${data.rows.length} Top-${abcCurrentCls}-Artikel`;
    host.innerHTML = data.rows.map((r, i) => {
      const margin = r.vk > 0 && r.ek > 0 ? Math.round(((r.vk - r.ek) / r.vk) * 100) : null;
      const stockClass = r.bestand > 5 ? "in-stock" : r.bestand > 0 ? "low-stock" : "out-stock";
      return `<div class="pl-item ${stockClass}">
        <div>
          <div class="pl-name"><span class="pl-abc-badge ${r.abc}">${r.abc}</span>#${r.rank} ${escapeHtml(r.name || r.a)}</div>
          <div class="pl-meta">
            ${r.herstName ? `<span class="pl-herst">${escapeHtml(r.herstName)}</span>` : ""}
            <span><strong>Bestand:</strong> ${r.bestand}</span>
          </div>
          <div class="pl-sold">📊 <strong>${r.soldQty}</strong> Stück · Lifetime <strong>${escMoney(r.soldRevenue)}</strong> · ${r.orderLines} Order-Lines</div>
        </div>
        <div class="pl-price-block">
          <span class="pl-price">${escMoney(r.vk)}</span>
          ${margin !== null ? `<span class="pl-margin">${margin}% Marge</span>` : ""}
        </div>
      </div>`;
    }).join("");
  } catch (e) {
    host.innerHTML = `<p class="muted" style="color:var(--red);">Fehler: ${e.message}</p>`;
  }
}

async function renderLieferantCheck() {
  const sel = byId("lc-manufacturer");
  if (!sel || sel.dataset.wired) return;
  sel.dataset.wired = "1";
  // Manufacturers list
  try {
    const r = await fetch("/api/jtl/manufacturers/list");
    const data = await r.json();
    const opts = ['<option value="0">Wähle Hersteller …</option>'];
    for (const m of data.rows) {
      if (!m.name || m.name === " ") continue;
      opts.push(`<option value="${m.k}">${escapeHtml(m.name)}</option>`);
    }
    sel.innerHTML = opts.join("");
  } catch {}
  sel.addEventListener("change", () => loadLieferantCheck(parseInt(sel.value, 10) || 0));
}

async function loadLieferantCheck(manufacturerId) {
  const host = byId("lc-results");
  const summary = byId("lc-summary");
  const status = byId("lc-status");
  if (!manufacturerId) {
    host.innerHTML = '<p class="muted">Erst Hersteller wählen.</p>';
    summary.innerHTML = "";
    if (status) status.textContent = "Bereit";
    return;
  }
  host.innerHTML = '<p class="muted">Lade …</p>';
  if (status) status.textContent = "Lade …";
  try {
    const r = await fetch(`/api/jtl/articles/stock-check?manufacturer=${manufacturerId}&cls=AB&limit=80`);
    const data = await r.json();
    if (status) status.textContent = `${data.total} A/B-Artikel · ${data.oosCount} OOS · ${data.niedrigCount} niedrig`;
    summary.innerHTML = `
      <div class="lc-stat tone-bad"><strong>${data.oosCount}</strong><span>OOS — sofort handeln</span></div>
      <div class="lc-stat tone-warn"><strong>${data.niedrigCount}</strong><span>Niedrig (&lt;5)</span></div>
      <div class="lc-stat tone-ok"><strong>${data.total - data.oosCount - data.niedrigCount}</strong><span>Bestand OK</span></div>
    `;
    host.innerHTML = data.rows.map((r) => {
      const stockClass = r.stockStatus === "OOS" ? "out-stock" : r.stockStatus === "Niedrig" ? "low-stock" : "in-stock";
      const stockBadge = r.stockStatus === "OOS" ? "🔴 OOS" : r.stockStatus === "Niedrig" ? "🟡 " + r.bestand : "🟢 " + r.bestand;
      return `<div class="pl-item ${stockClass}">
        <div>
          <div class="pl-name"><span class="pl-abc-badge ${r.abc}">${r.abc}</span>${escapeHtml(r.name || r.a)}</div>
          <div class="pl-meta">
            <span><strong>SKU:</strong> ${escapeHtml(r.a)}</span>
            <span><strong>Bestand:</strong> ${stockBadge}</span>
          </div>
          <div class="pl-sold">📊 ${r.soldQty} Stück verkauft · Lifetime ${escMoney(r.soldRevenue)}</div>
        </div>
        <div class="pl-price-block">
          <span class="pl-price">${escMoney(r.vk)}</span>
        </div>
      </div>`;
    }).join("");
  } catch (e) {
    host.innerHTML = `<p class="muted" style="color:var(--red);">Fehler: ${e.message}</p>`;
  }
}

async function loadKundenDetail(kKunde) {
  const host = byId("kd-content");
  if (!host) return;
  host.innerHTML = '<p class="muted" style="padding:20px;">Lade Kunden-Detail (kann 2-5s dauern wegen Marken-Aggregation)…</p>';
  try {
    const r = await fetch(`/api/jtl/customers/${kKunde}/detail`);
    const d = await r.json();
    const p = d.profile;
    const fullName = p ? [p.vn, p.nn].filter(Boolean).join(" ") || p.firma || "(ohne Name)" : "—";
    const initials = p ? (((p.vn || "")[0] || "") + ((p.nn || "")[0] || "")).toUpperCase() : "?";
    const addr = p ? [p.str, (p.plz || "") + " " + (p.ort || ""), p.land].filter(Boolean).join(" · ") : "";
    host.innerHTML = `
      <div class="kd-header">
        <div class="kd-avatar ${d.isVip ? "vip" : ""}">${d.isVip ? "👑" : escapeHtml(initials || "?")}</div>
        <div>
          ${d.isVip ? '<div class="kd-vip-line">★ VIP-KUNDE</div>' : ""}
          <h2 class="kd-name">${escapeHtml(fullName)}</h2>
          <div class="muted">Kunde #${d.kKunde} · ${escapeHtml(addr)}</div>
          ${p?.mail ? `<div class="muted">📧 <a href="mailto:${encodeURIComponent(p.mail)}">${escapeHtml(p.mail)}</a></div>` : ""}
          ${p?.tel || p?.mob ? `<div class="muted">☎ ${escapeHtml(p.tel || p.mob)}</div>` : ""}
        </div>
        <div class="kd-stats">
          <div><strong>${d.stats.orderCount || 0}</strong>Bestellungen</div>
          <div><strong>${escMoney(d.stats.totalRevenue || 0)}</strong>Lifetime</div>
          <div><strong>${escMoney(d.stats.aov || 0)}</strong>AOV</div>
          ${d.stats.lastDate ? `<div>zuletzt <strong>${escapeHtml(d.stats.lastDate)}</strong></div>` : ""}
        </div>
      </div>
      <section class="panel kd-section">
        <h3>👑 Lieblings-Marken (nach Lifetime-Umsatz)</h3>
        <div class="kd-brands">
          ${d.favoriteBrands.length ? d.favoriteBrands.map((b, i) => `<div class="kd-brand">
            <span class="kd-brand-rank">#${i+1}</span>
            <span class="kd-brand-name">${escapeHtml(b.name)}</span>
            <span class="kd-brand-qty">${b.qty} Stück</span>
            <span class="kd-brand-rev">${escMoney(b.revenue)}</span>
          </div>`).join("") : '<p class="muted">Keine Marken-Aggregation möglich (keine Positions mit kArtikel).</p>'}
        </div>
      </section>
      <section class="panel kd-section">
        <h3>📦 Letzte Bestellungen</h3>
        <div class="kl-orders" style="border:1px solid var(--line);border-radius:6px;">
          <div class="kl-orders-list">
            ${d.orders.map((o) => `<div class="kl-order">
              <span class="kl-order-date">${escapeHtml(o.date)}</span>
              <span class="kl-order-nr">${escapeHtml(o.nr || "—")}</span>
              <span class="kl-order-amount">${escMoney(o.brutto)}</span>
            </div>`).join("")}
          </div>
        </div>
      </section>
    `;
  } catch (e) {
    host.innerHTML = `<p class="muted" style="padding:20px;color:var(--red);">Fehler: ${e.message}</p>`;
  }
}

async function renderMaValidation() {
  const host = byId("mav-results");
  const status = byId("mav-status");
  if (!host || host.dataset.loaded) return;
  host.dataset.loaded = "1";
  host.innerHTML = '<p class="muted">Lade Validierung …</p>';
  try {
    const r = await fetch("/api/jtl/marktanalyse/validation");
    const data = await r.json();
    if (status) status.textContent = `${data.rows.length} MA-Empfehlungen validiert`;
    const statusLabels = {
      A_PERFORMER: { txt: "🏆 BEREITS A-PERFORMER", help: "Marke ist Top-Verkäufer — Empfehlung bereits umgesetzt, Sortimentstiefe halten" },
      STARK: { txt: "✅ STARK", help: "Hat A-Artikel — gute Performance" },
      AUSBAUFAEHIG: { txt: "📈 AUSBAUFÄHIG", help: "Wenige Artikel im Sortiment, Empfehlung Ausbau bestätigt" },
      C_TAIL: { txt: "⚠ C-TAIL", help: "Viele Artikel aber wenig Umsatz — Bereinigung oder Strategie ändern" },
      FEHLT: { txt: "❌ FEHLT KOMPLETT", help: "Sortimentslücke bestätigt — Marktanalyse korrekt" },
      PRUEFEN: { txt: "🔍 PRÜFEN", help: "Unklar — manuell prüfen" }
    };
    host.innerHTML = data.rows.map((r) => {
      const lab = statusLabels[r.status] || { txt: r.status, help: "" };
      const abcBar = r.articleCount ? `<div class="mav-abc-bar">
        ${r.aCount ? `<span class="pa">${r.aCount} A</span>` : ""}
        ${r.bCount ? `<span class="pb">${r.bCount} B</span>` : ""}
        ${r.cCount ? `<span class="pc">${r.cCount} C</span>` : ""}
      </div>` : "";
      return `<div class="mav-card status-${r.status}">
        <div class="mav-badge">${escapeHtml(lab.txt)}</div>
        <div>
          <h4 class="mav-title">${escapeHtml(r.kandidat)}${r.herstellerName && r.herstellerName !== r.kandidat ? ` <span class="muted" style="font-weight:500;">→ ${escapeHtml(r.herstellerName)}</span>` : ""}</h4>
          <div class="mav-meta">${escapeHtml(r.quelle)} · MA-Priorität <strong>${escapeHtml(r.priority)}</strong> · ${r.articleCount} Artikel im Sortiment</div>
          <div class="mav-meta" style="margin-top:4px;">${escapeHtml(lab.help)}</div>
          ${abcBar}
        </div>
        <div class="mav-revenue">
          ${escMoney(r.soldRevenue)}
          <small>${r.soldQty || 0} Stück</small>
        </div>
      </div>`;
    }).join("");
  } catch (e) {
    host.innerHTML = `<p class="muted" style="color:var(--red);">Fehler: ${e.message}</p>`;
  }
}

// === JTL Live-Lookups (Phase 2) ===
let plDebounce = null;
let klDebounce = null;

function escMoney(n) {
  const v = Number(n) || 0;
  return "€ " + v.toFixed(2).replace(".", ",");
}

let plManufacturer = 0;
let plAbcFilter = "all";

async function loadManufacturerDropdown() {
  const sel = byId("pl-manufacturer");
  if (!sel || sel.dataset.loaded) return;
  sel.dataset.loaded = "1";
  try {
    const r = await fetch("/api/jtl/manufacturers/list");
    const data = await r.json();
    const opts = ['<option value="0">Alle Hersteller</option>'];
    for (const m of data.rows) {
      if (!m.name || m.name === " ") continue;
      opts.push(`<option value="${m.k}">${escapeHtml(m.name)}</option>`);
    }
    sel.innerHTML = opts.join("");
  } catch {}
}

function triggerPlSearch() {
  const input = byId("pl-search");
  const status = byId("pl-status");
  if (!input) return;
  clearTimeout(plDebounce);
  const q = input.value.trim();
  if (q.length < 2 && !plManufacturer) {
    byId("pl-results").innerHTML = '<p class="muted">Tippe mind. 2 Zeichen oder wähle einen Hersteller.</p>';
    if (status) status.textContent = "Bereit";
    return;
  }
  if (status) status.textContent = "Suche …";
  plDebounce = setTimeout(async () => {
    try {
      const params = new URLSearchParams({ q, limit: "40" });
      if (plManufacturer) params.set("manufacturer", String(plManufacturer));
      const r = await fetch(`/api/jtl/articles/search?${params}`);
      const data = await r.json();
      let rows = data.rows;
      if (plAbcFilter !== "all") rows = rows.filter((x) => x.abc === plAbcFilter);
      if (status) {
        const abcNote = data.abcReady ? " · ABC ✓" : " · ABC lädt …";
        status.textContent = `${rows.length} / ${data.total} Treffer${abcNote}`;
      }
      renderProduktResults(rows);
    } catch (e) {
      if (status) status.textContent = "Fehler: " + e.message;
    }
  }, 220);
}

function renderProduktLookup() {
  const input = byId("pl-search");
  if (!input || input.dataset.wired) return;
  input.dataset.wired = "1";
  loadManufacturerDropdown();
  input.addEventListener("input", triggerPlSearch);
  byId("pl-manufacturer")?.addEventListener("change", (e) => {
    plManufacturer = parseInt(e.target.value, 10) || 0;
    triggerPlSearch();
  });
  byId("pl-abc-filter")?.addEventListener("change", (e) => {
    plAbcFilter = e.target.value;
    triggerPlSearch();
  });
}

function renderProduktResults(rows) {
  const host = byId("pl-results");
  if (!host) return;
  if (!rows.length) {
    host.innerHTML = '<p class="muted">Keine Treffer. Andere Schreibweise probieren — z.B. "tripp" statt "tripp trapp".</p>';
    return;
  }
  host.innerHTML = rows.map((r) => {
    const stockClass = r.bestand > 5 ? "in-stock" : r.bestand > 0 ? "low-stock" : "out-stock";
    const margin = r.vk > 0 && r.ek > 0 ? Math.round(((r.vk - r.ek) / r.vk) * 100) : null;
    const marginClass = margin !== null && margin < 30 ? "low" : "";
    const abcBadge = r.abc ? `<span class="pl-abc-badge ${r.abc}" title="ABC-Klasse ${r.abc}">${r.abc}</span>` : "";
    const herstBadge = r.herstName ? `<span class="pl-herst">${escapeHtml(r.herstName)}</span>` : "";
    const soldLine = r.soldQty
      ? `<div class="pl-sold">📊 <strong>${r.soldQty}</strong> Stück verkauft · Lifetime <strong>${escMoney(r.soldRevenue)}</strong></div>`
      : "";
    return `<div class="pl-item ${stockClass}" data-art-id="${r.k}">
      <div>
        <div class="pl-name">${abcBadge}${escapeHtml(r.name || r.a)}</div>
        <div class="pl-meta">
          ${herstBadge}
          <span><strong>SKU:</strong> ${escapeHtml(r.a)}</span>
          ${r.han ? `<span><strong>HAN:</strong> ${escapeHtml(r.han)}</span>` : ""}
          <span><strong>Bestand:</strong> ${r.bestand}</span>
          ${r.akt ? "" : '<span style="color:var(--red);font-weight:700;">⚠ inaktiv</span>'}
        </div>
        ${soldLine}
      </div>
      <div class="pl-price-block">
        <span class="pl-price">${escMoney(r.vk)}</span>
        ${r.ek ? `<span class="pl-ek">EK ${escMoney(r.ek)}</span>` : ""}
        ${margin !== null ? `<span class="pl-margin ${marginClass}">${margin}% Marge</span>` : ""}
      </div>
    </div>`;
  }).join("");
}

function renderKundenLookup() {
  const input = byId("kl-search");
  if (!input || input.dataset.wired) return;
  input.dataset.wired = "1";
  input.addEventListener("input", () => {
    clearTimeout(klDebounce);
    const q = input.value.trim();
    const status = byId("kl-status");
    if (q.length < 2) {
      byId("kl-results").innerHTML = '<p class="muted">Tippe mindestens 2 Zeichen.</p>';
      if (status) status.textContent = "Bereit";
      return;
    }
    if (status) status.textContent = "Suche …";
    klDebounce = setTimeout(async () => {
      try {
        const r = await fetch(`/api/jtl/customers/search?q=${encodeURIComponent(q)}&limit=40`);
        const data = await r.json();
        if (status) {
          const vipNote = data.vipStatsReady ? " · 👑 VIPs markiert" : " · VIP-Index lädt …";
          status.textContent = `${data.rows.length} / ${data.total} Treffer · Index ${data.indexSize}${vipNote}`;
        }
        renderKundenResults(data.rows);
      } catch (e) {
        if (status) status.textContent = "Fehler: " + e.message;
      }
    }, 220);
  });
}

function renderKundenResults(rows) {
  const host = byId("kl-results");
  if (!host) return;
  if (!rows.length) {
    host.innerHTML = '<p class="muted">Keine Treffer.</p>';
    return;
  }
  host.innerHTML = rows.map((c) => {
    const initials = ((c.vn || "")[0] || "") + ((c.nn || "")[0] || "");
    const fullName = [c.vn, c.nn].filter(Boolean).join(" ") || c.firma || "(ohne Name)";
    const addr = [c.str, c.plz + " " + c.ort].filter(Boolean).join(" · ");
    const isVip = c.vip === true;
    const hasStats = c.orderCount !== undefined;
    return `<div class="kl-card ${isVip ? "is-vip" : ""}" data-kkunde="${c.kKunde}">
      <div class="kl-item">
        <div class="kl-avatar ${isVip ? "vip" : ""}">${isVip ? "👑" : escapeHtml(initials.toUpperCase() || "?")}</div>
        <div>
          <div class="kl-name">
            ${isVip ? '<span class="kl-vip-badge">VIP</span>' : ""}
            ${escapeHtml(fullName)}${c.firma && fullName !== c.firma ? ` <span class="muted">· ${escapeHtml(c.firma)}</span>` : ""}
          </div>
          <div class="kl-meta">${escapeHtml(addr)} · ${escapeHtml(c.iso || c.land || "")} · Kunde #${c.kKunde}</div>
          ${c.mail ? `<div class="kl-meta">📧 ${escapeHtml(c.mail)}</div>` : ""}
          ${(c.tel || c.mob) ? `<div class="kl-meta">☎ ${escapeHtml(c.tel || c.mob)}</div>` : ""}
          ${hasStats ? `<div class="kl-stats">
            <span><strong>${c.orderCount}</strong> Best.</span>
            <span>LTV <strong>${escMoney(c.revenue)}</strong></span>
            <span class="muted">AOV ${escMoney(c.aov)}</span>
            ${c.lastDate ? `<span class="muted">zuletzt ${escapeHtml(c.lastDate)}</span>` : ""}
          </div>` : ""}
        </div>
        <div class="kl-actions">
          ${c.mail ? `<a href="mailto:${encodeURIComponent(c.mail)}" onclick="event.stopPropagation()">Mail</a>` : ""}
          ${(c.tel || c.mob) ? `<a href="tel:${encodeURIComponent((c.tel || c.mob).replace(/\s/g,''))}" onclick="event.stopPropagation()">Tel</a>` : ""}
          <button type="button" class="kl-show-orders" data-kkunde="${c.kKunde}">📦 Bestellungen</button>
          <button type="button" class="kl-show-detail" data-kkunde="${c.kKunde}">👤 Detail</button>
        </div>
      </div>
      <div class="kl-orders" id="kl-orders-${c.kKunde}" hidden></div>
    </div>`;
  }).join("");
  host.querySelectorAll(".kl-show-orders").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const k = btn.dataset.kkunde;
      loadKundenOrders(k);
    });
  });
  host.querySelectorAll(".kl-show-detail").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const k = btn.dataset.kkunde;
      setView("kunden-detail");
      loadKundenDetail(k);
    });
  });
}

async function loadKundenOrders(kKunde) {
  const host = byId("kl-orders-" + kKunde);
  if (!host) return;
  if (!host.hidden && host.dataset.loaded) {
    host.hidden = true;
    return;
  }
  host.hidden = false;
  host.innerHTML = '<p class="muted" style="padding:8px;">Lade Bestellungen …</p>';
  try {
    const r = await fetch(`/api/jtl/customers/${kKunde}/orders?limit=20`);
    const data = await r.json();
    host.dataset.loaded = "1";
    if (!data.rows.length) {
      host.innerHTML = '<p class="muted" style="padding:8px;">Keine Bestellungen für diesen Kunden.</p>';
      return;
    }
    const totalRev = data.totalRevenue || 0;
    host.innerHTML = `
      <div class="kl-orders-header">
        <strong>${data.total} Bestellungen</strong>
        <span>Lifetime-Umsatz: <strong>${escMoney(totalRev)}</strong></span>
        <span class="muted">AOV ${escMoney(totalRev / data.total)}</span>
      </div>
      <div class="kl-orders-list">
        ${data.rows.map((o) => `<div class="kl-order">
          <span class="kl-order-date">${escapeHtml(o.date)}</span>
          <span class="kl-order-nr">${escapeHtml(o.nr || "—")}</span>
          <span class="kl-order-amount">${escMoney(o.brutto)}</span>
        </div>`).join("")}
      </div>
      ${data.total > data.rows.length ? `<p class="muted" style="padding:8px;font-size:11px;">Zeige letzte ${data.rows.length} von ${data.total}.</p>` : ""}
    `;
  } catch (e) {
    host.innerHTML = `<p class="muted" style="padding:8px;color:var(--red);">Fehler: ${escapeHtml(e.message)}</p>`;
  }
}

// === Lernsystem 2026 Lese-View ===
let lsCurrentSection = "00";
const lsSectionCache = {};

async function loadLsSection(secId) {
  lsCurrentSection = secId;
  const contentEl = byId("ls-content");
  if (!contentEl) return;
  document.querySelectorAll(".ma-section-btn[data-ls-sec]").forEach((b) => b.classList.toggle("active", b.dataset.lsSec === secId));
  contentEl.innerHTML = '<p class="muted ma-loading-state">Lade Sektion …</p>';
  try {
    let md = lsSectionCache[secId];
    if (!md) {
      const r = await fetch(`/lernsystem-2026/HFK_Lernsystem_2026_sec${secId}.md`, { cache: "force-cache" });
      if (!r.ok) throw new Error("nicht gefunden");
      md = await r.text();
      lsSectionCache[secId] = md;
    }
    contentEl.innerHTML = mdToHtml(md);
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (e) {
    contentEl.innerHTML = `<p class="muted ma-loading-state">Fehler: ${escapeHtml(e.message)}</p>`;
  }
}

function renderLernsystem() {
  const contentEl = byId("ls-content");
  if (!contentEl) return;
  if (!contentEl.dataset.loaded) {
    contentEl.dataset.loaded = "1";
    loadLsSection(lsCurrentSection);
  }
}

// === Team-Notizen (Schnellnotiz an Team) ===
let tnFilter = "all";
let tnShowDone = false;

function renderTeamNotizen() {
  const list = byId("tn-list");
  if (!list) return;
  const all = state.teamNotes || [];
  let filtered = tnFilter === "all" ? all : all.filter((n) => n.an === tnFilter);
  if (!tnShowDone) filtered = filtered.filter((n) => !n.erledigt);
  const cnt = byId("tn-count");
  const offen = all.filter((n) => !n.erledigt).length;
  if (cnt) cnt.textContent = `${offen} offen · ${all.length} gesamt`;
  if (!filtered.length) {
    list.innerHTML = '<p class="muted">Keine Notizen. Oben eine schreiben.</p>';
    return;
  }
  const farbe = { Stephan: "var(--accent)", Markus: "var(--blue)", Lorna: "var(--teal)", Beate: "var(--green)", Team: "var(--muted-2)" };
  const sorted = [...filtered].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  list.innerHTML = sorted.map((n) => `<div class="tn-card ${n.erledigt ? "done" : ""}" data-tn-id="${n.id}">
    <span class="tn-an-badge" style="background:${farbe[n.an] || "var(--muted-2)"}">${escapeHtml(n.an)}</span>
    <div class="tn-body">
      <div class="tn-text">${escapeHtml(n.text)}</div>
      <div class="tn-meta">${escapeHtml((n.createdAt || "").replace("T", " ").slice(0, 16))}${n.von ? " · von " + escapeHtml(n.von) : ""}</div>
    </div>
    <div class="tn-actions">
      <button type="button" class="tn-done" data-tn-done="${n.id}" title="${n.erledigt ? "Wieder öffnen" : "Erledigt"}">${n.erledigt ? "↺" : "✓"}</button>
      <button type="button" class="tn-del" data-tn-del="${n.id}" title="Löschen">×</button>
    </div>
  </div>`).join("");
  list.querySelectorAll("[data-tn-done]").forEach((b) => b.addEventListener("click", () => {
    const n = (state.teamNotes || []).find((x) => x.id === b.dataset.tnDone);
    if (n) { n.erledigt = !n.erledigt; n.erledigtAt = n.erledigt ? new Date().toISOString() : null; saveState(); renderTeamNotizen(); }
  }));
  list.querySelectorAll("[data-tn-del]").forEach((b) => b.addEventListener("click", () => {
    if (!confirm("Notiz löschen?")) return;
    state.teamNotes = (state.teamNotes || []).filter((x) => x.id !== b.dataset.tnDel);
    saveState(); renderTeamNotizen();
  }));
}

function addTeamNote() {
  const an = byId("tn-an")?.value || "Team";
  const textEl = byId("tn-text");
  const text = (textEl?.value || "").trim();
  if (!text) { showToast("Notiz-Text fehlt"); return; }
  state.teamNotes = state.teamNotes || [];
  state.teamNotes.unshift({ id: uid("tn"), an, text, von: "Mago", createdAt: new Date().toISOString(), erledigt: false });
  saveState();
  if (textEl) textEl.value = "";
  renderTeamNotizen();
  showToast(`Notiz an ${an} gespeichert`);
}

// === Stephan-Kalender + Decision-Pipeline (PA-Mode) ===
let sdFilter = "all";

function renderStephanKalender() {
  const todayList = byId("sk-today-list");
  const weekList = byId("sk-week-list");
  if (!todayList || !weekList) return;
  const today = todayIso();
  const subtitle = byId("sk-subtitle");
  if (subtitle) {
    const d = new Date();
    subtitle.textContent = `${["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"][d.getDay()]} · ${d.toLocaleDateString("de-DE")} · Du als PA siehst alles`;
  }
  const slots = state.stephanSchedule || [];
  const todaySlots = slots.filter((s) => s.date === today).sort((a,b) => (a.time||"").localeCompare(b.time||""));
  const countEl = byId("sk-today-count");
  if (countEl) countEl.textContent = `${todaySlots.length} Slots`;
  todayList.innerHTML = todaySlots.length
    ? todaySlots.map(slotHtml).join("")
    : '<p class="muted">Keine Slots heute. „+ Slot" oben rechts.</p>';

  // 7-Tage-Ausblick
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const wk = ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()];
    const label = `${wk} ${d.getDate()}.${d.getMonth()+1}.`;
    const daySlots = slots.filter((s) => s.date === iso).sort((a,b) => (a.time||"").localeCompare(b.time||""));
    if (!daySlots.length && i > 0) continue;
    days.push(`<div class="sk-week-day">
      <h4>${label}<span class="muted">(${daySlots.length})</span></h4>
      <div class="sk-slot-list">${daySlots.map(slotHtml).join("")}</div>
    </div>`);
  }
  weekList.innerHTML = days.length ? days.join("") : '<p class="muted">Keine Slots in den nächsten 7 Tagen geplant.</p>';
  // Click → Edit
  document.querySelectorAll("#stephan-kalender .sk-slot").forEach((el) => {
    el.addEventListener("click", () => openEdit("stephanSlot", el.dataset.slotId));
  });
}

function slotHtml(s) {
  const typeKey = (s.type || "Termin").toLowerCase().replace("ü","ue");
  return `<div class="sk-slot type-${typeKey}" data-slot-id="${s.id}">
    <span class="sk-slot-time">${escapeHtml(s.time || "—")}</span>
    <div class="sk-slot-content">
      <h4>${escapeHtml(s.title || "(ohne Titel)")}</h4>
      ${s.notes ? `<p>${escapeHtml(s.notes)}</p>` : ""}
    </div>
  </div>`;
}

function renderStephanDecisions() {
  const kanban = byId("sd-kanban");
  if (!kanban) return;
  const all = state.stephanDecisions || [];
  const filtered = sdFilter === "all" ? all : all.filter((d) => d.status === sdFilter);
  const cnt = byId("sd-count");
  if (cnt) cnt.textContent = `${filtered.length} / ${all.length}`;
  const cols = ["offen", "vorbereitet", "entschieden", "verworfen"];
  const colHtml = cols.map((status) => {
    const items = filtered.filter((d) => (d.status || "offen") === status);
    return `<div class="sd-kanban-col col-${status}">
      <h3>${status.toUpperCase()}<span class="count">${items.length}</span></h3>
      <div class="sd-decision-cards">
        ${items.map(decisionCardHtml).join("") || '<p class="muted" style="font-size:11px;">—</p>'}
      </div>
    </div>`;
  });
  kanban.innerHTML = colHtml.join("");
  kanban.querySelectorAll(".sd-decision-card").forEach((el) => {
    el.addEventListener("click", () => openEdit("stephanDecision", el.dataset.decisionId));
  });
}

function decisionCardHtml(d) {
  const today = todayIso();
  const overdue = d.frist && d.frist < today && d.status !== "entschieden" && d.status !== "verworfen";
  const fristClass = overdue ? "is-overdue" : "";
  return `<div class="sd-decision-card ${fristClass}" data-decision-id="${d.id}">
    <div class="sd-decision-title">${escapeHtml(d.titel || "(ohne Titel)")}</div>
    <div class="sd-decision-meta">
      ${d.frist ? `<span class="${overdue ? "frist-warn" : ""}">⏰ ${escapeHtml(d.frist)}</span>` : ""}
      ${d.kategorie ? `<span>📁 ${escapeHtml(d.kategorie)}</span>` : ""}
    </div>
    ${d.empfehlung ? `<div class="sd-decision-empfehlung"><strong>Empfehlung:</strong> ${escapeHtml(d.empfehlung.slice(0, 80))}${d.empfehlung.length > 80 ? "…" : ""}</div>` : ""}
  </div>`;
}

// === Verkaufs-Akademie ===
let akCurrentTab = "angebote";
let akObjectionFilter = "all";

function akSwitchTab(tab) {
  akCurrentTab = tab;
  document.querySelectorAll(".ak-tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.akTab === tab));
  document.querySelectorAll(".ak-tab-content").forEach((el) => el.classList.toggle("active", el.id === "ak-tab-" + tab));
  renderAkademie();
}

function renderAkademie() {
  if (!byId("akademie")) return;
  renderAkServices();
  renderAkPersonas();
  renderAkObjections();
  renderAkScenarios();
  renderAkDrills();
  renderAkRoleplays();
  renderAkMarken();
  renderAkStaff();
}

let akRpSchwierigkeit = "all";

function renderAkRoleplays() {
  const list = byId("ak-rp-list");
  if (!list) return;
  const rps = state.akademieRoleplays || [];
  const filtered = akRpSchwierigkeit === "all" ? rps : rps.filter((r) => r.schwierigkeit === akRpSchwierigkeit);
  const cnt = byId("ak-rp-count");
  if (cnt) cnt.textContent = `${filtered.length} / ${rps.length} Rollenspiele`;
  if (!rps.length) {
    list.innerHTML = '<p class="muted">Noch keine Rollenspiele importiert.</p>';
    return;
  }
  const diffClass = (s) => s === "leicht" ? "anfaenger" : s === "mittel" ? "fortgeschritten" : "profi";
  list.innerHTML = filtered.map((r) => `<div class="ak-rp-card" data-rp-id="${r.id}">
    <div class="ak-rp-head">
      <h3>${escapeHtml(r.titel || "")}</h3>
      <span class="ak-scenario-difficulty ${diffClass(r.schwierigkeit)}">${escapeHtml(r.schwierigkeit || "")}</span>
    </div>
    <div class="ak-rp-meta">
      <span>👤 ${escapeHtml((r.persona || "").split("(")[0].trim())}</span>
      <span>🛠 ${escapeHtml(r.verkaufstechnik || "")}</span>
      <span>🎯 AOV €${r.ziel_aov || "—"}</span>
      <span>📝 ${(r.ablauf || []).length} Schritte · ${(r.einwaende || []).length} Einwände</span>
    </div>
    <p style="font-size:12px;color:var(--ink-soft);margin:0;">${escapeHtml((r.setting || "").slice(0, 140))}</p>
    <div class="ak-rp-actions">
      <button type="button" class="button small primary ak-rp-start" data-rp-id="${r.id}">▶ Rollenspiel starten</button>
    </div>
  </div>`).join("");
  list.querySelectorAll(".ak-rp-start").forEach((b) => b.addEventListener("click", () => startAkRoleplay(b.dataset.rpId)));
}

let akRpState = null;

function startAkRoleplay(rpId) {
  const rp = (state.akademieRoleplays || []).find((r) => r.id === rpId);
  if (!rp) return;
  akRpState = { rp, phase: "intro", stepIdx: 0, einwandIdx: 0, scores: {}, revealed: {} };
  byId("ak-rp-title").textContent = rp.titel || "Rollenspiel";
  renderAkRpPhase();
  byId("ak-rp-runner").showModal();
}

function renderAkRpPhase() {
  if (!akRpState) return;
  const { rp, phase } = akRpState;
  const body = byId("ak-rp-body");
  const back = byId("ak-rp-back");
  const next = byId("ak-rp-next");
  back.hidden = false;
  next.textContent = "Weiter →";

  if (phase === "intro") {
    back.hidden = true;
    body.innerHTML = `
      <div class="ak-rp-briefing">
        <div class="ak-rp-briefing-row"><strong>👤 Persona:</strong> ${escapeHtml(rp.persona || "")}</div>
        <div class="ak-rp-briefing-row"><strong>📍 Setting:</strong> ${escapeHtml(rp.setting || "")}</div>
        <div class="ak-rp-briefing-row"><strong>🛠 Verkaufstechnik:</strong> ${escapeHtml(rp.verkaufstechnik || "")}</div>
        <div class="ak-rp-briefing-row"><strong>🏷 Marke/Produkt:</strong> ${escapeHtml(rp.produkt || rp.marke || "")}</div>
        <div class="ak-rp-briefing-row"><strong>🎯 Ziel-AOV:</strong> €${rp.ziel_aov || "—"} · max ${rp.gesamtpunkte_max || "?"} Punkte</div>
        <p class="muted" style="margin-top:10px;">Du spielst den/die VerkäuferIn. Lies die Schritte, übe sie laut oder im Kopf, meistere die Einwände — und bewerte dich am Ende ehrlich selbst.</p>
      </div>`;
    next.textContent = "Los geht's →";
    return;
  }

  if (phase === "ablauf") {
    const steps = rp.ablauf || [];
    const step = steps[akRpState.stepIdx];
    const progress = ((akRpState.stepIdx) / steps.length) * 100;
    body.innerHTML = `
      <div class="ak-runner-progress"><div class="ak-runner-progress-bar" style="width:${progress}%"></div></div>
      <div class="muted" style="font-size:11px;font-weight:800;text-transform:uppercase;">Ablauf-Schritt ${akRpState.stepIdx+1} / ${steps.length}</div>
      <div class="ak-rp-step-name">${step.schritt ? step.schritt + ". " : ""}${escapeHtml(step.name || "")}</div>
      <div class="ak-runner-prompt">${escapeHtml(step.beschreibung || "")}</div>
      <p class="muted" style="font-size:12px;">💬 Sprich diesen Schritt laut durch, als stündest du vor dem Kunden. Dann „Weiter".</p>`;
    next.textContent = akRpState.stepIdx === steps.length - 1 ? "Einwände →" : "Weiter →";
    return;
  }

  if (phase === "einwaende") {
    const einw = rp.einwaende || [];
    if (!einw.length) { akRpState.phase = "bewertung"; renderAkRpPhase(); return; }
    const e = einw[akRpState.einwandIdx];
    const revealed = akRpState.revealed[akRpState.einwandIdx];
    body.innerHTML = `
      <div class="muted" style="font-size:11px;font-weight:800;text-transform:uppercase;">Einwand ${akRpState.einwandIdx+1} / ${einw.length}</div>
      <div class="ak-rp-einwand-quote">"${escapeHtml(e.einwand || "")}"</div>
      <p class="muted" style="font-size:12px;">Wie reagierst du? Formuliere deine Antwort laut — DANN aufdecken.</p>
      ${revealed ? `
        <div class="ak-runner-feedback correct">
          <strong>Psychologie:</strong> ${escapeHtml(e.psychologie || "")}<br>
          <strong>Erwartete Technik:</strong> ${escapeHtml(e.erwartete_technik || "")}
        </div>` : `<button type="button" class="button" id="ak-rp-reveal">🔓 Muster-Antwort aufdecken</button>`}`;
    if (!revealed) {
      byId("ak-rp-reveal")?.addEventListener("click", () => { akRpState.revealed[akRpState.einwandIdx] = true; renderAkRpPhase(); });
    }
    next.textContent = akRpState.einwandIdx === einw.length - 1 ? "Bewertung →" : "Nächster Einwand →";
    return;
  }

  if (phase === "bewertung") {
    const krit = rp.bewertungskriterien || [];
    body.innerHTML = `
      <p style="font-weight:700;">Selbst-Bewertung — sei ehrlich:</p>
      <div class="ak-rp-bewertung">
        ${krit.map((k, i) => `<div class="ak-rp-krit">
          <div class="ak-rp-krit-head">
            <strong>${escapeHtml(k.kriterium || "")}</strong>
            <span class="muted">max ${k.punkte_max}</span>
          </div>
          <div class="ak-rp-krit-desc">${escapeHtml(k.beschreibung || "")}</div>
          <div class="ak-rp-krit-buttons" data-krit="${i}">
            ${Array.from({length: (k.punkte_max||0)+1}, (_, p) => `<button type="button" class="ak-rp-pt ${akRpState.scores[i]===p?"sel":""}" data-pt="${p}">${p}</button>`).join("")}
          </div>
        </div>`).join("")}
      </div>`;
    body.querySelectorAll(".ak-rp-krit-buttons").forEach((row) => {
      const ki = Number(row.dataset.krit);
      row.querySelectorAll(".ak-rp-pt").forEach((btn) => {
        btn.addEventListener("click", () => {
          akRpState.scores[ki] = Number(btn.dataset.pt);
          row.querySelectorAll(".ak-rp-pt").forEach((b) => b.classList.remove("sel"));
          btn.classList.add("sel");
        });
      });
    });
    next.textContent = "Auswerten →";
    return;
  }

  if (phase === "result") {
    const krit = rp.bewertungskriterien || [];
    const got = krit.reduce((s, k, i) => s + (akRpState.scores[i] || 0), 0);
    const max = rp.gesamtpunkte_max || krit.reduce((s, k) => s + (k.punkte_max || 0), 0);
    const pct = max ? Math.round((got / max) * 100) : 0;
    const erf = rp.erfolgskriterien || [];
    body.innerHTML = `
      <div class="ak-runner-result">
        <h3>Ergebnis</h3>
        <div class="ak-runner-score">${got} / ${max}</div>
        <div style="font-size:18px;color:var(--muted);">${pct}%</div>
        <p style="margin-top:12px;">${pct>=80?"🌟 Hervorragend! Du beherrschst dieses Szenario.":pct>=60?"👍 Solide. Schwächste Kriterien nochmal üben.":"📚 Mehr Übung nötig — geh die Marken-Bibel + Einwände durch und wiederhole."}</p>
        ${erf.length?`<div style="text-align:left;margin-top:16px;"><strong>Erfolgskriterien dieses Szenarios:</strong><ul style="font-size:13px;">${erf.map((e)=>`<li>${escapeHtml(e)}</li>`).join("")}</ul></div>`:""}
        <div style="margin-top:12px;"><input type="text" id="ak-rp-staffname" placeholder="Dein Name (für Tracking)" style="padding:8px 12px;border:1px solid var(--line);border-radius:6px;min-height:40px;width:100%;font-size:16px;" /></div>
      </div>`;
    back.hidden = false;
    next.textContent = "✓ Speichern & Schließen";
    return;
  }
}

function akRpAdvance() {
  if (!akRpState) return;
  const { rp, phase } = akRpState;
  if (phase === "intro") { akRpState.phase = "ablauf"; akRpState.stepIdx = 0; }
  else if (phase === "ablauf") {
    if (akRpState.stepIdx < (rp.ablauf||[]).length - 1) akRpState.stepIdx++;
    else { akRpState.phase = "einwaende"; akRpState.einwandIdx = 0; }
  }
  else if (phase === "einwaende") {
    if (akRpState.einwandIdx < (rp.einwaende||[]).length - 1) akRpState.einwandIdx++;
    else akRpState.phase = "bewertung";
  }
  else if (phase === "bewertung") { akRpState.phase = "result"; }
  else if (phase === "result") { akRpSaveResult(); return; }
  renderAkRpPhase();
}

function akRpBack() {
  if (!akRpState) return;
  const { phase } = akRpState;
  if (phase === "ablauf") {
    if (akRpState.stepIdx > 0) akRpState.stepIdx--;
    else akRpState.phase = "intro";
  } else if (phase === "einwaende") {
    if (akRpState.einwandIdx > 0) akRpState.einwandIdx--;
    else { akRpState.phase = "ablauf"; akRpState.stepIdx = (akRpState.rp.ablauf||[]).length - 1; }
  } else if (phase === "bewertung") { akRpState.phase = "einwaende"; akRpState.einwandIdx = (akRpState.rp.einwaende||[]).length - 1; }
  else if (phase === "result") { akRpState.phase = "bewertung"; }
  renderAkRpPhase();
}

function akRpSaveResult() {
  const { rp, scores } = akRpState;
  const krit = rp.bewertungskriterien || [];
  const got = krit.reduce((s, k, i) => s + (scores[i] || 0), 0);
  const max = rp.gesamtpunkte_max || krit.reduce((s, k) => s + (k.punkte_max || 0), 0);
  const pct = max ? Math.round((got / max) * 100) : 0;
  const name = (byId("ak-rp-staffname")?.value || "").trim();
  if (name) {
    state.staffTraining = state.staffTraining || [];
    let st = state.staffTraining.find((s) => s.name === name);
    if (!st) { st = { name, completedScenarios: [], strengths: "", weaknesses: "" }; state.staffTraining.unshift(st); }
    st.completedScenarios = st.completedScenarios || [];
    st.completedScenarios.push({ scenarioId: rp.id, titel: rp.titel, score: pct, completedAt: todayIso() });
    saveState();
    showToast(`Rollenspiel gespeichert für ${name}: ${pct}%`);
  }
  byId("ak-rp-runner").close();
  akRpState = null;
  renderAkStaff();
}



let akDrillMarkeFilter = "all";

function renderAkDrills() {
  const list = byId("ak-drills-list");
  if (!list) return;
  const drills = state.akademieDrills || [];
  // Marken-Filter-Dropdown befüllen
  const sel = byId("ak-drill-marke-filter");
  if (sel && !sel.dataset.filled && drills.length) {
    sel.dataset.filled = "1";
    const marken = [...new Set(drills.map((d) => d.marke).filter(Boolean))].sort();
    sel.innerHTML = '<option value="all">Alle Marken</option>' + marken.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join("");
  }
  const filtered = akDrillMarkeFilter === "all" ? drills : drills.filter((d) => d.marke === akDrillMarkeFilter);
  const cnt = byId("ak-drill-count");
  if (cnt) cnt.textContent = `${filtered.length} / ${drills.length} Drills`;
  if (!drills.length) {
    list.innerHTML = '<p class="muted">Noch keine Drills importiert. Sag „Lernsystem importieren".</p>';
    return;
  }
  list.innerHTML = filtered.map((d) => `<div class="ak-drill-card" data-drill-id="${d.id}">
    <div class="ak-drill-head">
      <span class="ak-drill-marke">${escapeHtml(d.marke || "allgemein")}</span>
      <span class="ak-scenario-difficulty ${(d.schwierigkeit||"").replace("leicht","anfaenger").replace("mittel","fortgeschritten").replace("schwer","profi")}">${escapeHtml(d.schwierigkeit || "")}</span>
    </div>
    <div class="ak-drill-frage">${escapeHtml(d.frage || "")}</div>
    <div class="ak-drill-tags">${(d.lerntyp||[]).map((l) => `<span>${escapeHtml(l)}</span>`).join("")} ${d.verkaufstechnik ? `<span class="tech">${escapeHtml(d.verkaufstechnik)}</span>` : ""}</div>
    <button type="button" class="button small primary ak-drill-start" data-drill-id="${d.id}">▶ Drill starten</button>
  </div>`).join("");
  list.querySelectorAll(".ak-drill-start").forEach((b) => {
    b.addEventListener("click", () => startAkDrill(b.dataset.drillId));
  });
}

function startAkDrill(drillId) {
  const d = (state.akademieDrills || []).find((x) => x.id === drillId);
  if (!d) return;
  // Reuse scenario-runner modal as single-step quiz
  const runner = byId("ak-scenario-runner");
  byId("ak-runner-title").textContent = "Drill: " + (d.marke || "") + (d.produkt ? " · " + d.produkt : "");
  const body = byId("ak-runner-body");
  const opts = d.optionen || [];
  body.innerHTML = `
    <div class="ak-runner-prompt">${escapeHtml(d.frage || "")}</div>
    <div class="ak-runner-options">
      ${opts.map((o, i) => `<button type="button" class="ak-runner-option" data-opt="${i}">${String.fromCharCode(65+i)}) ${escapeHtml(o.text)}</button>`).join("")}
    </div>
    <div id="ak-drill-feedback-host"></div>
  `;
  let answered = false;
  body.querySelectorAll(".ak-runner-option").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const correct = opts[i].ist_richtig === true || opts[i].punkte > 0;
      body.querySelectorAll(".ak-runner-option").forEach((o, j) => {
        if (opts[j].ist_richtig === true || opts[j].punkte > 0) o.classList.add("correct");
        if (j === i && !correct) o.classList.add("wrong");
        o.style.pointerEvents = "none";
      });
      const fb = opts[i].feedback || (correct ? "Richtig!" : "Leider falsch.");
      byId("ak-drill-feedback-host").innerHTML = `<div class="ak-runner-feedback ${correct ? "correct" : "wrong"}">${correct ? "✓" : "✗"} ${escapeHtml(fb)}</div>${d.musterantwort ? `<div class="ak-runner-feedback correct" style="margin-top:6px;"><strong>Musterantwort:</strong> ${escapeHtml(d.musterantwort)}</div>` : ""}`;
    });
  });
  byId("ak-runner-back").hidden = true;
  byId("ak-runner-next").textContent = "Schließen";
  byId("ak-runner-next").onclick = () => runner.close();
  runner.showModal();
}

function renderAkMarken() {
  const list = byId("ak-marken-list");
  if (!list) return;
  const marken = state.akademieMarken || [];
  const cnt = byId("ak-marken-count");
  if (cnt) cnt.textContent = `${marken.length} Marken`;
  if (!marken.length) {
    list.innerHTML = '<p class="muted">Noch keine Marken-Bibel importiert. Sag „Lernsystem importieren".</p>';
    return;
  }
  list.innerHTML = marken.map((m) => {
    const herk = m.herkunft || {};
    const heroes = (m.hero_produkte || m.heroProdukte || m.top_produkte || []).slice(0, 3);
    const args = (m.verkaufsargumente || m.usps || []).slice(0, 4);
    return `<div class="ak-marke-card">
      <div class="ak-marke-head">
        <h3>${escapeHtml(m.name || "")}</h3>
        <span class="ak-marke-herkunft">${escapeHtml([herk.land, herk.stadt, herk.gruendung].filter(Boolean).join(" · "))}</span>
      </div>
      ${m.philosophie ? `<div class="ak-marke-philo">"${escapeHtml(m.philosophie)}"</div>` : ""}
      ${(m.kategorien||[]).length ? `<div class="ak-marke-kat">${m.kategorien.slice(0,6).map((k) => `<span>${escapeHtml(typeof k === "string" ? k : k.name || "")}</span>`).join("")}</div>` : ""}
      ${heroes.length ? `<div class="ak-marke-section"><strong>Hero-Produkte:</strong> ${heroes.map((h) => escapeHtml(typeof h === "string" ? h : (h.name || h.produkt || ""))).join(" · ")}</div>` : ""}
      ${args.length ? `<div class="ak-marke-section"><strong>Verkaufsargumente:</strong><ul>${args.map((a) => `<li>${escapeHtml(typeof a === "string" ? a : (a.argument || a.text || ""))}</li>`).join("")}</ul></div>` : ""}
    </div>`;
  }).join("");
}

function renderAkServices() {
  const list = byId("ak-services-list");
  if (!list) return;
  const services = state.consultingServices || [];
  if (!services.length) {
    list.innerHTML = '<p class="muted">Noch keine Beratungsangebote. „+ Neues Beratungsangebot" oben.</p>';
    return;
  }
  list.innerHTML = services.map((s) => `<div class="ak-service-card" data-edit="consultingService:${s.id}">
    <h3>${escapeHtml(s.name)}</h3>
    <div class="ak-service-meta">
      <span>${escapeHtml(s.dauer || "—")}</span>
      <span class="${(s.preis === "gratis" || s.preis === "0" || s.preis === "kostenlos") ? "badge-gratis" : ""}">${escapeHtml(s.preis || "—")}</span>
      <span>${escapeHtml(s.zielgruppe || "")}</span>
    </div>
    <div class="ak-service-body">${escapeHtml(s.inhalt || "")}</div>
    ${s.ergebnis ? `<div class="ak-service-body" style="color:var(--muted);font-style:italic;">→ ${escapeHtml(s.ergebnis)}</div>` : ""}
  </div>`).join("");
}

function renderAkPersonas() {
  const list = byId("ak-personas-list");
  if (!list) return;
  const personas = state.salesPersonas || [];
  if (!personas.length) {
    list.innerHTML = '<p class="muted">Noch keine Personas.</p>';
    return;
  }
  list.innerHTML = personas.map((p) => `<div class="ak-persona-card" data-edit="salesPersona:${p.id}">
    <div class="ak-persona-head">
      <div class="ak-persona-avatar">${escapeHtml(p.avatar || "👤")}</div>
      <div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="ak-persona-tag">${escapeHtml(p.alter || "")} · ${escapeHtml(p.kontext || "")}</div>
      </div>
    </div>
    ${p.zitat ? `<div class="ak-persona-quote">"${escapeHtml(p.zitat)}"</div>` : ""}
    <div class="ak-persona-fields">
      ${p.schmerzpunkte ? `<div><strong>Schmerz:</strong> ${escapeHtml(p.schmerzpunkte)}</div>` : ""}
      ${p.werte ? `<div><strong>Werte:</strong> ${escapeHtml(p.werte)}</div>` : ""}
      ${p.einwaendeTypisch ? `<div><strong>Typ. Einwand:</strong> ${escapeHtml(p.einwaendeTypisch)}</div>` : ""}
      ${p.budget ? `<div><strong>Budget:</strong> ${escapeHtml(p.budget)}</div>` : ""}
    </div>
  </div>`).join("");
}

function renderAkObjections() {
  const list = byId("ak-objections-list");
  if (!list) return;
  const objs = state.salesObjections || [];
  const filtered = akObjectionFilter === "all" ? objs : objs.filter((o) => o.kategorie === akObjectionFilter);
  const countEl = byId("ak-objection-count");
  if (countEl) countEl.textContent = `${filtered.length} / ${objs.length}`;
  if (!filtered.length) {
    list.innerHTML = '<p class="muted">Keine Einwände in dieser Kategorie.</p>';
    return;
  }
  list.innerHTML = filtered.map((o) => {
    const catKey = (o.kategorie || "").toLowerCase().replace("ä", "ae").replace(/[^a-z]/g, "");
    return `<div class="ak-objection-card cat-${catKey}" data-edit="salesObjection:${o.id}">
      <div class="ak-objection-head">
        <div class="ak-objection-quote">"${escapeHtml(o.einwand)}"</div>
        <span class="ak-objection-cat-badge">${escapeHtml(o.kategorie || "—")}</span>
      </div>
      <div class="ak-objection-answer"><strong>Antwort:</strong> ${escapeHtml(o.antwort || "")}</div>
      ${o.beweis ? `<div class="ak-objection-evidence">📊 Beweis: ${escapeHtml(o.beweis)}</div>` : ""}
    </div>`;
  }).join("");
}

function renderAkScenarios() {
  const list = byId("ak-scenarios-list");
  if (!list) return;
  const scenarios = state.trainingScenarios || [];
  if (!scenarios.length) {
    list.innerHTML = '<p class="muted">Noch keine Szenarien.</p>';
    return;
  }
  list.innerHTML = scenarios.map((s) => {
    const persona = (state.salesPersonas || []).find((p) => p.id === s.personaId);
    const stepCount = (s.steps || []).length;
    return `<div class="ak-scenario-card" data-scenario-id="${s.id}">
      <div class="ak-scenario-head">
        <h3>${escapeHtml(s.name)}</h3>
        <span class="ak-scenario-difficulty ${s.schwierigkeit || "anfaenger"}">${escapeHtml(s.schwierigkeit || "anfänger")}</span>
      </div>
      <div class="ak-scenario-meta">
        ${persona ? `<span>👤 ${escapeHtml(persona.name)}</span>` : ""}
        <span>📝 ${stepCount} Schritte</span>
      </div>
      <p style="font-size:13px;color:var(--ink-soft);margin:0;">${escapeHtml(s.situation || "")}</p>
      <div class="ak-scenario-actions">
        <button type="button" class="button small" data-edit="trainingScenario:${s.id}" title="Szenario bearbeiten">✎ Bearbeiten</button>
        <button type="button" class="button small primary ak-scenario-run" data-run-scenario="${s.id}" title="Szenario starten">▶ Starten</button>
      </div>
    </div>`;
  }).join("");
  list.querySelectorAll("[data-run-scenario]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      startAkScenario(btn.dataset.runScenario);
    });
  });
}

let akRunnerState = null;
function startAkScenario(scenarioId) {
  const sc = (state.trainingScenarios || []).find((s) => s.id === scenarioId);
  if (!sc) return;
  akRunnerState = { scenario: sc, stepIdx: 0, answers: [], score: 0 };
  byId("ak-runner-title").textContent = sc.name;
  renderAkRunnerStep();
  byId("ak-scenario-runner").showModal();
}

function renderAkRunnerStep() {
  if (!akRunnerState) return;
  const { scenario, stepIdx, answers } = akRunnerState;
  const body = byId("ak-runner-body");
  const steps = scenario.steps || [];
  const total = steps.length;
  if (stepIdx >= total) {
    const max = total;
    const got = akRunnerState.score;
    const pct = Math.round((got / max) * 100);
    body.innerHTML = `<div class="ak-runner-result">
      <h3>Ergebnis</h3>
      <div class="ak-runner-score">${got} / ${max}</div>
      <div style="font-size:18px;color:var(--muted);">${pct}%</div>
      <p style="margin-top:16px;">${pct >= 80 ? "🌟 Hervorragend!" : pct >= 60 ? "👍 Solide. Schwerpunkte nochmal anschauen." : "📚 Vertiefe nochmal die Einwände & Personas und versuche es nochmal."}</p>
    </div>`;
    byId("ak-runner-next").textContent = "Fertig";
    byId("ak-runner-back").hidden = true;
    return;
  }
  byId("ak-runner-back").hidden = false;
  byId("ak-runner-next").textContent = stepIdx === total - 1 ? "Auswerten" : "Weiter →";
  const step = steps[stepIdx];
  const progress = ((stepIdx) / total) * 100;
  const persona = (state.salesPersonas || []).find((p) => p.id === scenario.personaId);
  body.innerHTML = `
    <div class="ak-runner-progress"><div class="ak-runner-progress-bar" style="width:${progress}%"></div></div>
    <div class="muted" style="font-size:11px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;">Schritt ${stepIdx+1} / ${total}${persona ? " · " + escapeHtml(persona.name) : ""}</div>
    <div class="ak-runner-prompt">${escapeHtml(step.prompt || "")}</div>
    <div class="ak-runner-options">
      ${(step.options || []).map((o, i) => `<button type="button" class="ak-runner-option" data-opt="${i}">${String.fromCharCode(65+i)}) ${escapeHtml(o.text)}</button>`).join("")}
    </div>
    <div id="ak-runner-feedback-host"></div>
  `;
  body.querySelectorAll(".ak-runner-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const idx = Number(opt.dataset.opt);
      const chosen = step.options[idx];
      if (akRunnerState.answers[stepIdx] !== undefined) return; // bereits beantwortet
      akRunnerState.answers[stepIdx] = idx;
      body.querySelectorAll(".ak-runner-option").forEach((o, i) => {
        if (i === step.correctIdx) o.classList.add("correct");
        if (i === idx && i !== step.correctIdx) o.classList.add("wrong");
        o.style.pointerEvents = "none";
      });
      const correct = idx === step.correctIdx;
      if (correct) akRunnerState.score++;
      const feedback = chosen?.feedback || (correct ? "Richtig." : "Falsch.");
      const host = byId("ak-runner-feedback-host");
      host.innerHTML = `<div class="ak-runner-feedback ${correct ? "correct" : "wrong"}">${correct ? "✓" : "✗"} ${escapeHtml(feedback)}</div>`;
    });
  });
}

async function loadBotScores() {
  const host = byId("ak-bot-scores");
  if (!host) return;
  try {
    const r = await fetch("/api/bot/scores");
    const data = await r.json();
    if (!data.users || !data.users.length) {
      host.innerHTML = '<p class="muted">Noch keine Bot-Aktivität. Mitarbeiter starten Drills via Telegram-Bot (/drill).</p>';
      return;
    }
    host.innerHTML = `<div class="ak-bot-summary">🤖 <strong>${data.totalDrills}</strong> Bot-Drills von <strong>${data.totalUsers}</strong> Mitarbeitern</div>` +
      data.users.map((u, i) => {
        const topMarken = Object.entries(u.byMarke || {}).sort((a,b)=>b[1].total-a[1].total).slice(0,4)
          .map(([m,s]) => `${escapeHtml(m)} ${s.correct}/${s.total}`).join(" · ");
        return `<div class="ak-bot-user">
          <div class="ak-bot-user-head">
            <strong>${i===0?"🏆 ":""}${escapeHtml(u.name)}</strong>
            <span class="ak-bot-pct ${u.pct>=80?"good":u.pct>=60?"ok":"low"}">${u.pct}%</span>
          </div>
          <div class="ak-bot-user-meta">${u.correct}/${u.total} richtig · zuletzt ${escapeHtml((u.lastTs||"").slice(0,10))}</div>
          ${topMarken ? `<div class="ak-bot-user-marken">${topMarken}</div>` : ""}
        </div>`;
      }).join("");
  } catch (e) {
    host.innerHTML = `<p class="muted">Bot-Scores nicht ladbar (${escapeHtml(e.message)}). Läuft der Server?</p>`;
  }
}

function renderAkStaff() {
  const list = byId("ak-staff-list");
  if (!list) return;
  loadBotScores();
  const staffData = state.staffTraining || [];
  // Hole Team-Members aus team-Modul
  const teamMembers = state.team?.map(t => t.name) || [];
  const allNames = new Set([...staffData.map(s => s.name), ...teamMembers]);
  if (!allNames.size) {
    list.innerHTML = '<p class="muted">Keine Mitarbeiter erfasst. Team-Modul nutzen oder hier ergänzen.</p>';
    return;
  }
  const rows = [...allNames].map((name) => {
    const st = staffData.find((s) => s.name === name) || { name, completedScenarios: [], strengths: "", weaknesses: "" };
    const completed = st.completedScenarios || [];
    const avgScore = completed.length ? Math.round(completed.reduce((s,c) => s + (c.score||0), 0) / completed.length) : 0;
    const lastDate = completed[completed.length-1]?.completedAt || "—";
    return `<div class="ak-staff-card">
      <div class="ak-staff-head">
        <h3>🎓 ${escapeHtml(name)}</h3>
      </div>
      <div class="ak-staff-stats">
        <span><strong>${completed.length}</strong> Szenarien</span>
        <span>Ø Score <strong>${avgScore}%</strong></span>
      </div>
      <div class="ak-staff-recent">Letztes Training: ${escapeHtml(lastDate)}</div>
      ${st.strengths ? `<div class="ak-staff-recent">💪 Stärken: ${escapeHtml(st.strengths)}</div>` : ""}
      ${st.weaknesses ? `<div class="ak-staff-recent">⚠️ Fokus-Themen: ${escapeHtml(st.weaknesses)}</div>` : ""}
    </div>`;
  });
  list.innerHTML = rows.join("");
}

// === Marktanalyse 2026 ===
let maCurrentSection = "00";
const maSectionCache = {};

function mdToHtml(md) {
  let text = md;
  // Escape HTML zuerst
  text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Code blocks ```
  text = text.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c}</code></pre>`);
  // Inline code
  text = text.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  // URL-Sanitizer (Audit-Finding #12): nur http(s) + relativ erlauben, sonst neutralisieren
  const safeUrl = (u) => {
    const t = String(u || "").trim();
    if (/^https?:\/\//i.test(t) || t.startsWith("/") || t.startsWith("#") || t.startsWith("./")) return t;
    return "#blocked"; // blockt javascript:, data:, vbscript: etc.
  };
  // Bilder ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => `<img alt="${alt}" src="${safeUrl(url)}" loading="lazy" />`);
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener">${label}</a>`);
  // Footnote refs [^1^] oder [^1]
  text = text.replace(/\[\^(\d+)\^?\]/g, '<sup>[$1]</sup>');
  // Bold **text**
  text = text.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  // Italic *text*
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");

  const lines = text.split("\n");
  const out = [];
  let inTable = false;
  let inList = false;
  let listType = "ul";
  let pBuffer = [];

  const flushP = () => {
    if (pBuffer.length) {
      const p = pBuffer.join(" ").trim();
      if (p) out.push(`<p>${p}</p>`);
      pBuffer = [];
    }
  };
  const closeList = () => { if (inList) { out.push(`</${listType}>`); inList = false; } };
  const closeTable = () => { if (inTable) { out.push("</table>"); inTable = false; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Tabellen-Erkennung
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed.slice(1, -1).split("|").map((c) => c.trim());
      const isSeparator = cells.every((c) => /^:?-+:?$/.test(c));
      if (isSeparator) continue;
      flushP();
      closeList();
      if (!inTable) {
        out.push("<table>");
        inTable = true;
        // Erste Zeile = Header
        out.push("<thead><tr>" + cells.map((c) => `<th>${c}</th>`).join("") + "</tr></thead><tbody>");
      } else {
        out.push("<tr>" + cells.map((c) => `<td>${c}</td>`).join("") + "</tr>");
      }
      continue;
    } else if (inTable) {
      out.push("</tbody>");
      closeTable();
    }

    // Headings
    const h = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      flushP();
      closeList();
      const level = h[1].length;
      out.push(`<h${level}>${h[2]}</h${level}>`);
      continue;
    }

    // Listen
    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      flushP();
      const newType = ulMatch ? "ul" : "ol";
      if (!inList || listType !== newType) {
        closeList();
        out.push(`<${newType}>`);
        inList = true;
        listType = newType;
      }
      out.push(`<li>${(ulMatch || olMatch)[1]}</li>`);
      continue;
    } else if (inList && !trimmed) {
      closeList();
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushP();
      closeList();
      out.push(`<blockquote>${trimmed.slice(2)}</blockquote>`);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      flushP();
      closeList();
      out.push("<hr/>");
      continue;
    }

    // Leerzeile = neuer Paragraph
    if (!trimmed) {
      flushP();
      closeList();
      continue;
    }

    // Normale Textzeile → Paragraph-Buffer
    pBuffer.push(trimmed);
  }
  flushP();
  closeList();
  if (inTable) { out.push("</tbody></table>"); }
  return out.join("\n");
}

async function loadMaSection(secId) {
  maCurrentSection = secId;
  const contentEl = byId("ma-content");
  if (!contentEl) return;
  document.querySelectorAll(".ma-section-btn").forEach((b) => b.classList.toggle("active", b.dataset.maSec === secId));
  contentEl.innerHTML = '<p class="muted ma-loading-state">Lade Sektion …</p>';
  try {
    let md = maSectionCache[secId];
    if (!md) {
      const response = await fetch(`/marktanalyse-2026/HFK_Analyse_2026_sec${secId}.md`, { cache: "force-cache" });
      if (!response.ok) throw new Error("Datei nicht gefunden");
      md = await response.text();
      maSectionCache[secId] = md;
    }
    const html = mdToHtml(md);
    // Spezial-Inject für sec03 (Preisvergleich) → chart-Bild
    const chartInject = secId === "03" ? '<img src="/marktanalyse-2026/HFK_preispositionierung_chart.png" alt="HFK Preispositionierung" />' : "";
    contentEl.innerHTML = html + chartInject;
    contentEl.scrollTo?.({ top: 0, behavior: "instant" });
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (e) {
    contentEl.innerHTML = `<p class="muted ma-loading-state">Fehler beim Laden: ${escapeHtml(e.message)}</p>`;
  }
}

function renderMarktanalyse() {
  // Nur initial load, danach via Klicks
  const contentEl = byId("ma-content");
  if (!contentEl) return;
  if (!contentEl.dataset.loaded) {
    contentEl.dataset.loaded = "1";
    loadMaSection(maCurrentSection);
  }
}

// === Onsite: Bestell-Aufnahme ===
let orderIntakeFilter = "all";
let orderIntakeEditing = null;

function renderOrdersIntake() {
  const list = byId("order-intake-list");
  if (!list) return;
  const orders = state.ordersIntake || [];
  const filtered = orderIntakeFilter === "all" ? orders : orders.filter((o) => o.status === orderIntakeFilter);
  const countEl = byId("order-intake-count");
  if (countEl) countEl.textContent = `${filtered.length} / ${orders.length}`;
  if (!filtered.length) {
    list.innerHTML = '<p class="muted">Noch keine Bestellungen erfasst. „+ Neue Bestellung aufnehmen" rechts oben.</p>';
    return;
  }
  // Neueste zuerst
  const sorted = [...filtered].sort((a, b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || ""));
  list.innerHTML = sorted.map((o) => {
    const itemsText = (o.items || []).map((it) => `${it.qty || 1}× ${escapeHtml(it.name || "")}`).join(" · ") || "—";
    const total = (o.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const statusKey = (o.status || "Entwurf").toLowerCase().replace(/\s+/g, "-").replace("ü", "u");
    return `<div class="order-card status-${statusKey}" data-order-id="${o.id}">
      <div>
        <div class="order-card-head">
          <span class="order-card-customer">${escapeHtml(o.customerName || "(unbekannt)")}</span>
          <span class="order-card-channel">${escapeHtml(o.channel || "Walk-in")}</span>
          <span class="order-card-status status-${statusKey}">${escapeHtml(o.status || "Entwurf")}</span>
        </div>
        <div class="order-card-meta">${escapeHtml(o.date || "—")}${o.customerPhone ? " · ☎ " + escapeHtml(o.customerPhone) : ""}${o.wawiRef ? " · Wawi: " + escapeHtml(o.wawiRef) : ""}</div>
        <div class="order-card-items">${itemsText}</div>
        ${o.notes ? `<div class="order-card-meta">📝 ${escapeHtml(o.notes)}</div>` : ""}
      </div>
      <div class="order-card-right">
        <span class="order-card-total">€ ${total.toFixed(2).replace(".", ",")}</span>
        <span>${(o.items || []).length} Posten</span>
      </div>
    </div>`;
  }).join("");
  list.querySelectorAll(".order-card").forEach((card) => {
    card.addEventListener("click", () => openOrderIntakeModal(card.dataset.orderId));
  });
}

function openOrderIntakeModal(orderId) {
  orderIntakeEditing = orderId || null;
  const modal = byId("order-intake-modal");
  const form = byId("order-intake-form");
  if (!modal || !form) return;
  const order = orderId ? (state.ordersIntake || []).find((o) => o.id === orderId) : null;
  byId("order-intake-modal-title").textContent = order ? "Bestellung bearbeiten" : "Bestellung aufnehmen";
  byId("order-intake-delete").hidden = !order;
  form.elements["date"].value = order?.date || todayIso();
  form.elements["status"].value = order?.status || "Entwurf";
  form.elements["channel"].value = order?.channel || "Walk-in";
  form.elements["customerName"].value = order?.customerName || "";
  form.elements["customerPhone"].value = order?.customerPhone || "";
  form.elements["customerEmail"].value = order?.customerEmail || "";
  form.elements["customerAddress"].value = order?.customerAddress || "";
  form.elements["notes"].value = order?.notes || "";
  form.elements["wawiRef"].value = order?.wawiRef || "";
  const rowsEl = byId("order-item-rows");
  rowsEl.innerHTML = "";
  const items = order?.items?.length ? order.items : [{ qty: 1, name: "", price: 0 }];
  items.forEach((it) => addOrderItemRow(it));
  recalcOrderTotal();
  modal.showModal();
}

function addOrderItemRow(presetItem) {
  const rowsEl = byId("order-item-rows");
  if (!rowsEl) return;
  const row = document.createElement("div");
  row.className = "order-item-row";
  row.innerHTML = `
    <input type="number" class="item-qty" min="0" step="1" value="${presetItem?.qty ?? 1}" />
    <input type="text" class="item-name" placeholder="Artikelbezeichnung" value="${escapeHtml(presetItem?.name || "")}" />
    <input type="number" class="item-price" min="0" step="0.01" value="${presetItem?.price ?? ""}" placeholder="€ Preis" />
    <button type="button" class="remove-item" title="Zeile entfernen">×</button>
  `;
  rowsEl.appendChild(row);
  row.querySelector(".remove-item").addEventListener("click", () => { row.remove(); recalcOrderTotal(); });
  row.querySelectorAll("input").forEach((inp) => inp.addEventListener("input", recalcOrderTotal));
}

function recalcOrderTotal() {
  const rows = document.querySelectorAll("#order-item-rows .order-item-row");
  let total = 0;
  rows.forEach((r) => {
    const qty = Number(r.querySelector(".item-qty")?.value) || 0;
    const price = Number(r.querySelector(".item-price")?.value) || 0;
    total += qty * price;
  });
  const display = byId("order-total-display");
  if (display) display.textContent = "€ " + total.toFixed(2).replace(".", ",");
}

function saveOrderIntakeFromForm() {
  const form = byId("order-intake-form");
  if (!form) return;
  const items = [...document.querySelectorAll("#order-item-rows .order-item-row")].map((r) => ({
    qty: Number(r.querySelector(".item-qty").value) || 0,
    name: r.querySelector(".item-name").value.trim(),
    price: Number(r.querySelector(".item-price").value) || 0
  })).filter((it) => it.name || it.qty);
  const data = {
    date: form.elements["date"].value,
    status: form.elements["status"].value,
    channel: form.elements["channel"].value,
    customerName: form.elements["customerName"].value.trim(),
    customerPhone: form.elements["customerPhone"].value.trim(),
    customerEmail: form.elements["customerEmail"].value.trim(),
    customerAddress: form.elements["customerAddress"].value.trim(),
    notes: form.elements["notes"].value.trim(),
    wawiRef: form.elements["wawiRef"].value.trim(),
    items
  };
  if (!data.customerName) { showToast("Kundenname fehlt"); return; }
  state.ordersIntake = state.ordersIntake || [];
  if (orderIntakeEditing) {
    const ord = state.ordersIntake.find((o) => o.id === orderIntakeEditing);
    if (ord) Object.assign(ord, data);
  } else {
    state.ordersIntake.unshift({ id: uid("ord"), createdAt: new Date().toISOString(), ...data });
  }
  saveState();
  renderOrdersIntake();
  byId("order-intake-modal").close();
  showToast(orderIntakeEditing ? "Bestellung aktualisiert" : "Bestellung aufgenommen");
  orderIntakeEditing = null;
}

function deleteOrderIntake() {
  if (!orderIntakeEditing) return;
  if (!confirm("Bestellung wirklich löschen?")) return;
  state.ordersIntake = (state.ordersIntake || []).filter((o) => o.id !== orderIntakeEditing);
  saveState();
  renderOrdersIntake();
  byId("order-intake-modal").close();
  showToast("Bestellung gelöscht");
  orderIntakeEditing = null;
}

// === Home (Projekt-Picker) + Cross-Projekt-Feed ===
function renderHome() {
  const grid = byId("home-workspace-grid");
  if (!grid) return;
  const wsEntries = Object.entries(state.workspaces || {});
  grid.innerHTML = wsEntries.map(([id, ws]) => {
    const data = ws.data || {};
    const tasksOpen = (data.tasks || []).filter((t) => t.status && t.status !== "Erledigt").length;
    const promisesOpen = (data.promises || []).filter((p) => !p.kept && !p.broken).length;
    const upcomingEvents = (data.calendarEvents || []).filter((e) => e.date && e.date >= todayIso()).length;
    const isActive = id === state.currentWorkspace ? "active" : "";
    return `<button type="button" class="workspace-card ${isActive}" data-ws-id="${id}" style="border-left-color:${ws.color}">
      <div class="workspace-card-header">
        <span class="workspace-card-dot" style="background:${ws.color}"></span>
        <h3>${escapeHtml(ws.label)}</h3>
      </div>
      <div class="workspace-card-meta">${ws.isMeta ? "Übergreifend · Privat · Mago-Selbst" : ws.enabledModules.length + " Module"}</div>
      <div class="workspace-card-stats">
        <div class="workspace-card-stat"><span class="num">${tasksOpen}</span><span class="lab">Aufgaben offen</span></div>
        <div class="workspace-card-stat"><span class="num">${promisesOpen}</span><span class="lab">Versprechen</span></div>
        <div class="workspace-card-stat"><span class="num">${upcomingEvents}</span><span class="lab">Termine ab heute</span></div>
      </div>
      <span class="workspace-card-cta">→ ${isActive ? "Aktiv" : "Einsteigen"}</span>
    </button>`;
  }).join("");
  grid.querySelectorAll("[data-ws-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.wsId;
      if (id !== state.currentWorkspace) {
        switchWorkspace(id);
      }
      setView("dashboard");
    });
  });
}

function renderCrossProjectFeed() {
  // Nur in Zentrale-Workspace einblenden
  if (state.currentWorkspace !== "zentrale") return;
  const dashboardSection = byId("dashboard");
  if (!dashboardSection) return;
  let host = byId("cross-project-feed-host");
  if (!host) {
    host = document.createElement("section");
    host.id = "cross-project-feed-host";
    host.className = "panel";
    host.innerHTML = `
      <div class="panel-header">
        <h3>Was brennt wo? — projektübergreifend</h3>
        <span class="muted" id="cross-project-count"></span>
      </div>
      <div id="cross-project-feed" class="cross-project-feed"></div>
    `;
    dashboardSection.insertBefore(host, dashboardSection.firstChild);
  }
  const items = [];
  const today = todayIso();
  for (const [wsId, ws] of Object.entries(state.workspaces || {})) {
    if (wsId === "zentrale") continue;
    (ws.data?.tasks || []).forEach((t) => {
      if (!t.dueDate) return;
      if (t.status === "Erledigt") return;
      items.push({
        ws: wsId, wsLabel: ws.label, wsColor: ws.color,
        type: "Aufgabe", title: t.title, meta: t.area || "", date: t.dueDate, view: "jobs"
      });
    });
    (ws.data?.promises || []).forEach((p) => {
      const due = p.dueDate || p.due;
      if (!due) return;
      if (p.kept || p.broken) return;
      items.push({
        ws: wsId, wsLabel: ws.label, wsColor: ws.color,
        type: "Versprechen", title: p.title || p.text, meta: p.owner || "", date: due, view: "assistant"
      });
    });
    (ws.data?.meetings || []).forEach((m) => {
      if (!m.date || m.date < today) return;
      items.push({
        ws: wsId, wsLabel: ws.label, wsColor: ws.color,
        type: "Termin", title: m.type || "Gespräch", meta: (m.goal || "").slice(0, 60), date: m.date, view: "meeting"
      });
    });
  }
  items.sort((a, b) => a.date.localeCompare(b.date));
  const feedEl = byId("cross-project-feed");
  const countEl = byId("cross-project-count");
  if (countEl) countEl.textContent = `${items.length} Einträge`;
  if (!feedEl) return;
  if (!items.length) {
    feedEl.innerHTML = '<p class="muted">Keine offenen Posten in den anderen Projekten. Sauber.</p>';
    return;
  }
  feedEl.innerHTML = items.map((it) => {
    const overdue = it.date < today;
    const isToday = it.date === today;
    const cls = overdue ? "is-overdue" : isToday ? "is-today" : "";
    return `<div class="cross-project-item ${cls}" data-target-ws="${it.ws}" data-target-view="${it.view}">
      <span class="cp-ws" style="background:${it.wsColor}">${escapeHtml((it.wsLabel || "").split(" · ")[0])}</span>
      <div>
        <div class="cp-title">${escapeHtml(it.type)}: ${escapeHtml(it.title || "")}</div>
        <div class="cp-meta">${escapeHtml(it.meta || "")}</div>
      </div>
      <div class="cp-date">${escapeHtml(it.date)}</div>
    </div>`;
  }).join("");
  feedEl.querySelectorAll("[data-target-ws]").forEach((el) => {
    el.addEventListener("click", () => {
      switchWorkspace(el.dataset.targetWs);
      setView(el.dataset.targetView);
    });
  });
}

function render() {
  renderDashboard();
  renderHome();
  renderSettings();
  renderCrossProjectFeed();
  renderSystems();
  renderAccess();
  renderKanban();
  renderWeek();
  renderLevers();
  renderAnomalies();
  renderBriefing();
  renderBriefingHistory();
  renderStephanProfile();
  renderMoodLog();
  renderPromises();
  renderMeetings();
  renderAssistant();
  renderAiTools();
  renderEinkaufsplaner();
  renderBrands();
  renderJtlManufacturers();
  renderJtlSuppliers();
  renderChampions();
  renderDaily();
  renderTime();
  renderTeam();
  renderMonthly();
  renderHonorar();
  renderSebo();
  renderRisks();
  renderDecisions();
  renderVendors();
  renderPitches();
  renderBeforeAfter();
  renderCompetitors();
  renderHypotheses();
  renderPreMortems();
  renderWirkungen();
  renderSaisonplan();
  renderVerhandlungen();
  renderCapture();
  renderTriggers();
  renderCareer();
  renderPortfolio();
  renderMentors();
  renderLearnings();
  renderEnergy();
  renderGraph();
  renderRecapHistory();
  renderGlossary();
  renderUsage();
  renderCrossSell();
  renderSortiment();
  renderVip();
  renderJobs();
  renderKnowledge();
  renderToday();
  renderCalendar();
  renderOrdersIntake();
  renderMarktanalyse();
  renderAkademie();
  renderStephanKalender();
  renderStephanDecisions();
  renderTeamNotizen();
  renderLernsystem();
  renderProduktLookup();
  renderKundenLookup();
  renderAbcUebersicht();
  renderLieferantCheck();
  renderMaValidation();
  // Nach allen Renders: Jargon-Hints auf alle Strategie-Karten
  setTimeout(applyJargonHintsToContainers, 0);
}

// Calendar-Events Collection beim Start sicherstellen
if (!state.calendarEvents) state.calendarEvents = [];

const editConfig = {
  stephanSlot: {
    title: "Stephan-Slot bearbeiten",
    collection: "stephanSchedule",
    fields: [
      { name: "date", label: "Datum", type: "date", required: true },
      { name: "time", label: "Uhrzeit (HH:MM)", type: "text" },
      { name: "title", label: "Titel", type: "text", required: true },
      { name: "type", label: "Typ", type: "select", options: ["Termin","Block","Reserviert","Verfügbar"] },
      { name: "notes", label: "Notiz / Vorbereitung", type: "textarea" }
    ]
  },
  stephanDecision: {
    title: "Entscheidung bearbeiten",
    collection: "stephanDecisions",
    fields: [
      { name: "titel", label: "Titel / Was ist zu entscheiden?", type: "text", required: true },
      { name: "frage", label: "Konkrete Frage an Stephan", type: "textarea" },
      { name: "kategorie", label: "Kategorie", type: "select", options: ["Sortiment","Einkauf","Preisstrategie","Personal","Marketing","Lieferanten","Sonstiges"] },
      { name: "status", label: "Status", type: "select", options: ["offen","vorbereitet","entschieden","verworfen"] },
      { name: "frist", label: "Frist (Datum)", type: "date" },
      { name: "optionen", label: "Optionen (1 pro Zeile, z.B. A: … / B: …)", type: "textarea" },
      { name: "empfehlung", label: "Deine Empfehlung", type: "textarea" },
      { name: "risiken", label: "Risiken / Trade-offs", type: "textarea" },
      { name: "ergebnis", label: "Ergebnis (nach Entscheidung)", type: "textarea" }
    ]
  },
  consultingService: {
    title: "Beratungsangebot bearbeiten",
    collection: "consultingServices",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "dauer", label: "Dauer (z.B. 60 min)", type: "text" },
      { name: "preis", label: "Preis (z.B. gratis / €30)", type: "text" },
      { name: "zielgruppe", label: "Zielgruppe", type: "text" },
      { name: "inhalt", label: "Inhalt / Ablauf", type: "textarea" },
      { name: "ergebnis", label: "Erwartetes Ergebnis", type: "textarea" }
    ]
  },
  salesPersona: {
    title: "Persona bearbeiten",
    collection: "salesPersonas",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "avatar", label: "Avatar-Emoji", type: "text" },
      { name: "alter", label: "Alter / Lebensphase", type: "text" },
      { name: "kontext", label: "Kontext (Beruf, Wohnort)", type: "text" },
      { name: "zitat", label: "Beispiel-Zitat im Verkaufsgespräch", type: "textarea" },
      { name: "schmerzpunkte", label: "Schmerzpunkte", type: "textarea" },
      { name: "werte", label: "Werte / Was wichtig ist", type: "textarea" },
      { name: "einwaendeTypisch", label: "Typische Einwände", type: "textarea" },
      { name: "kaufentscheidung", label: "Wie entscheidet sie/er", type: "textarea" },
      { name: "budget", label: "Budget-Range", type: "text" }
    ]
  },
  salesObjection: {
    title: "Einwand bearbeiten",
    collection: "salesObjections",
    fields: [
      { name: "einwand", label: "Einwand (Kunden-O-Ton)", type: "textarea", required: true },
      { name: "kategorie", label: "Kategorie", type: "select", options: ["Preis","Qualität","Marke","Service","Lieferzeit","Auswahl"] },
      { name: "antwort", label: "Antwort-Empfehlung", type: "textarea" },
      { name: "beweis", label: "Beweis / Daten (z.B. MA-2026-Sec)", type: "textarea" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  trainingScenario: {
    title: "Trainings-Szenario bearbeiten",
    collection: "trainingScenarios",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "personaId", label: "Persona-ID (z.B. pers-anna)", type: "text" },
      { name: "situation", label: "Ausgangssituation", type: "textarea" },
      { name: "schwierigkeit", label: "Schwierigkeit", type: "select", options: ["anfaenger","fortgeschritten","profi"] },
      { name: "steps", label: "Schritte (JSON-Array, jeweils {prompt,options:[{text,feedback}],correctIdx})", type: "textarea",
        transformIn: (v) => Array.isArray(v) ? JSON.stringify(v, null, 2) : (v || "[]"),
        transformOut: (v) => { try { return JSON.parse(v); } catch { return []; } }
      },
      { name: "erfolgsKriterien", label: "Erfolgs-Kriterien", type: "textarea" }
    ]
  },
  staffTrainingEntry: {
    title: "Mitarbeiter-Training erfassen",
    collection: "staffTraining",
    fields: [
      { name: "name", label: "Mitarbeiter-Name", type: "text", required: true },
      { name: "strengths", label: "Stärken (Beobachtungen)", type: "textarea" },
      { name: "weaknesses", label: "Fokus-Themen (Schwächen)", type: "textarea" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  event: {
    title: "Termin bearbeiten",
    collection: "calendarEvents",
    fields: [
      { name: "title", label: "Titel", type: "text", required: true },
      { name: "date", label: "Datum", type: "date", required: true },
      { name: "time", label: "Uhrzeit (optional)", type: "text" },
      { name: "kind", label: "Art", type: "select", options: ["Termin", "Erinnerung", "Deadline", "Block"] },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  task: {
    title: "Aufgabe bearbeiten",
    collection: "tasks",
    fields: [
      { name: "title", label: "Titel", type: "text", required: true },
      { name: "area", label: "Bereich", type: "select", options: ["Support", "SeBo", "JTL", "Shop", "Einkauf", "Analytics", "Kundenreaktivierung"] },
      { name: "status", label: "Status", type: "select", options: ["Backlog", "Diese Woche", "In Arbeit", "Wartet", "Erledigt"] },
      { name: "priority", label: "Priorität", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { name: "impact", label: "Wirkung", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { name: "effort", label: "Aufwand", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { name: "owner", label: "Owner", type: "text" },
      { name: "dueDate", label: "Fällig am", type: "date" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  access: {
    title: "Zugang bearbeiten",
    collection: "accessItems",
    fields: [
      { name: "systemId", label: "System", type: "system" },
      { name: "accessType", label: "Zugangstyp", type: "text", required: true },
      { name: "neededFor", label: "Benötigt für", type: "text", required: true },
      { name: "owner", label: "Owner", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["angefragt", "vorhanden", "geprüft", "blockiert"] },
      { name: "priority", label: "Priorität", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  system: {
    title: "System bearbeiten",
    collection: "systems",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "category", label: "Kategorie", type: "text" },
      { name: "purpose", label: "Zweck", type: "textarea" },
      { name: "owner", label: "Owner", type: "text" },
      { name: "accessStatus", label: "Zugangs-Status", type: "select", options: ["unbekannt", "angefragt", "vorhanden", "geprüft", "blockiert"] },
      { name: "healthStatus", label: "Health-Status", type: "select", options: ["bereit", "ungeprüft", "blockiert", "kritisch"] },
      { name: "notes", label: "Notiz", type: "textarea" },
      { name: "nextAction", label: "Nächste Aktion", type: "textarea" }
    ]
  },
  meeting: {
    title: "Gespräch bearbeiten",
    collection: "meetings",
    fields: [
      { name: "type", label: "Typ", type: "select", options: ["Erstgespräch", "Follow-up", "Gehalt", "Technik", "Support", "Einkauf"] },
      { name: "date", label: "Datum", type: "date" },
      { name: "goal", label: "Ziel", type: "textarea" },
      { name: "agenda", label: "Agenda", type: "textarea" },
      { name: "talkingPoints", label: "Aussagen", type: "textarea" },
      { name: "questions", label: "Fragen", type: "textarea" },
      { name: "outcome", label: "Ergebnis", type: "textarea" },
      { name: "followUps", label: "Follow-ups", type: "textarea" }
    ]
  },
  knowledge: {
    title: "Wissenskarte bearbeiten",
    collection: "knowledgeCards",
    fields: [
      { name: "topic", label: "Thema", type: "text", required: true },
      { name: "summary", label: "Zusammenfassung", type: "textarea" },
      { name: "source", label: "Quelle", type: "text" },
      { name: "confidence", label: "Vertrauen", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { name: "tags", label: "Tags (kommagetrennt)", type: "text", transformIn: (v) => (Array.isArray(v) ? v.join(", ") : v || ""), transformOut: (v) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean) }
    ]
  },
  competitor: {
    title: "Wettbewerber bearbeiten",
    collection: "competitors",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "website", label: "Website", type: "text" },
      { name: "category", label: "Kategorie / Segment", type: "text" },
      { name: "threat", label: "Bedrohungslevel", type: "select", options: ["niedrig", "mittel", "hoch", "kritisch"] },
      { name: "status", label: "Status", type: "select", options: ["beobachten", "intensiv beobachten", "irrelevant"] },
      { name: "strength", label: "Stärken", type: "textarea" },
      { name: "weakness", label: "Schwächen", type: "textarea" },
      { name: "priceLevel", label: "Preisniveau", type: "select", options: ["niedrig", "mittel", "hoch", "premium"] },
      { name: "priceCompare", label: "Preisvergleich zu HFK", type: "text" },
      { name: "marketingNotes", label: "Marketing-Beobachtungen", type: "textarea" },
      { name: "recentMove", label: "Letzte beobachtete Aktion", type: "textarea" },
      { name: "lessons", label: "Lessons für HFK", type: "textarea" },
      { name: "lastObserved", label: "Zuletzt geprüft", type: "date" }
    ]
  },
  learning: {
    title: "Lerneintrag bearbeiten",
    collection: "learnings",
    fields: [
      { name: "title", label: "Titel", type: "text", required: true },
      { name: "author", label: "Autor / Quelle", type: "text" },
      { name: "sourceType", label: "Typ", type: "select", options: ["Buch", "Artikel", "Podcast", "Video", "Kurs", "Webinar", "Talk/Konferenz", "Sonstiges"] },
      { name: "status", label: "Status", type: "select", options: ["geplant", "in Bearbeitung", "durchgearbeitet", "abgebrochen", "wiederlesen"] },
      { name: "rating", label: "Bewertung (1-5)", type: "number", transformIn: (v) => String(v ?? 3), transformOut: (v) => Math.max(1, Math.min(5, Number(v) || 3)) },
      { name: "startDate", label: "Begonnen", type: "date" },
      { name: "finishDate", label: "Fertig", type: "date" },
      { name: "keyTakeaways", label: "Kernlernerträge (Was hängen bleibt)", type: "textarea" },
      { name: "appliedTo", label: "Angewendet auf (was im echten Leben)", type: "textarea" },
      { name: "appliedLeverIds", label: "Verknüpfte Hebel-IDs (kommagetrennt)", type: "text" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  energyentry: {
    title: "Energie-Eintrag bearbeiten",
    collection: "energyLog",
    fields: [
      { name: "date", label: "Datum", type: "date", required: true },
      { name: "timeSlot", label: "Tageszeit", type: "select", options: ["morning", "midday", "afternoon", "evening", "late-night"] },
      { name: "energyLevel", label: "Energie (1-5)", type: "number", transformIn: (v) => String(v ?? 3), transformOut: (v) => Math.max(1, Math.min(5, Number(v) || 3)) },
      { name: "focusQuality", label: "Fokus-Qualität (1-5)", type: "number", transformIn: (v) => String(v ?? 3), transformOut: (v) => Math.max(1, Math.min(5, Number(v) || 3)) },
      { name: "dominantTaskType", label: "Haupt-Aufgabentyp", type: "select", options: ["Strategie/Briefing", "Tech/Code", "Daten-Analyse", "Verhandlung", "Admin/Support", "Verwaltung", "Lernen", "Meetings", "Kreatives"] },
      { name: "duration", label: "Dauer (Minuten)", type: "number", transformIn: (v) => String(v ?? 60), transformOut: (v) => Number(v) || 0 },
      { name: "notes", label: "Notiz / Kontext", type: "textarea" }
    ]
  },
  careergoal: {
    title: "Karriere-Ziel bearbeiten",
    collection: "careerGoals",
    fields: [
      { name: "title", label: "Ziel (in 1 Satz)", type: "text", required: true },
      { name: "deadline", label: "Deadline", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["geplant", "in Arbeit", "erreicht", "verworfen", "verschoben"] },
      { name: "progress", label: "Fortschritt (0-100%)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Math.max(0, Math.min(100, Number(v) || 0)) },
      { name: "linkedWirkungenIds", label: "Verknüpfte Wirkungen (IDs, kommagetrennt)", type: "text" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  careerskill: {
    title: "Skill bearbeiten",
    collection: "careerSkills",
    fields: [
      { name: "skill", label: "Skill", type: "text", required: true },
      { name: "currentLevel", label: "IST-Level (1-5)", type: "number", transformIn: (v) => String(v ?? 1), transformOut: (v) => Math.max(1, Math.min(5, Number(v) || 1)) },
      { name: "targetLevel", label: "SOLL-Level (1-5)", type: "number", transformIn: (v) => String(v ?? 5), transformOut: (v) => Math.max(1, Math.min(5, Number(v) || 5)) },
      { name: "relevance", label: "Relevanz", type: "select", options: ["kritisch", "hoch", "mittel", "niedrig"] },
      { name: "lastTraining", label: "Letztes Training/Buch/Kurs", type: "text" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  portfoliocase: {
    title: "Portfolio-Case bearbeiten",
    collection: "portfolioCases",
    fields: [
      { name: "title", label: "Case-Titel (anonymisiert)", type: "text", required: true },
      { name: "problem", label: "Problem", type: "textarea" },
      { name: "approach", label: "Vorgehen", type: "textarea" },
      { name: "result", label: "Ergebnis (in €/Zeit/Quality)", type: "textarea" },
      { name: "category", label: "Kategorie", type: "select", options: ["Beratung", "Tool-Bau", "Beratung + Tool-Bau", "Strategie", "Datenanalyse", "Verhandlung", "Sonstiges"] },
      { name: "status", label: "Status", type: "select", options: ["draft", "review", "public-ready", "published"] },
      { name: "anonymized", label: "Anonymisiert?", type: "select", options: ["true", "false"], transformIn: (v) => String(v ?? "true"), transformOut: (v) => v === "true" },
      { name: "sourceWirkungenIds", label: "Quell-Wirkungen (IDs)", type: "text" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  mentor: {
    title: "Mentor / Vorbild bearbeiten",
    collection: "mentors",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Rolle", type: "text" },
      { name: "domain", label: "Domain / Fachgebiet", type: "text" },
      { name: "source", label: "Quelle (Buch/Podcast/Talk/X)", type: "text" },
      { name: "keyIdeas", label: "Kernideen / wichtigste Aussagen", type: "textarea" },
      { name: "framework", label: "Framework / Konzept-Name", type: "text" },
      { name: "whyRelevant", label: "Warum relevant für Mago?", type: "textarea" },
      { name: "integrationStatus", label: "Status", type: "select", options: ["entdeckt", "Inspiration", "Konzept übernommen", "in Anwendung", "tief integriert", "abgelegt"] },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  trigger: {
    title: "Trigger bearbeiten",
    collection: "jtlTriggers",
    fields: [
      { name: "name", label: "Trigger-Name", type: "text", required: true },
      { name: "source", label: "Quelle", type: "select", options: ["VIP", "Anomalies", "Promises", "SeBo", "Risks", "Decisions", "Tasks", "Manual"] },
      { name: "metric", label: "Metrik (intern)", type: "text" },
      { name: "thresholdPct", label: "Schwelle", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "direction", label: "Richtung", type: "select", options: ["above", "below"] },
      { name: "priority", label: "Priorität", type: "select", options: ["kritisch", "hoch", "mittel", "niedrig"] },
      { name: "enabled", label: "Aktiv", type: "select", options: ["true", "false"], transformIn: (v) => String(v ?? "true"), transformOut: (v) => v === "true" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  messenartikel: {
    title: "Messen-Artikel bearbeiten",
    collection: "messenArtikel",
    fields: [
      { name: "name", label: "Artikelname (z.B. Cool Denim Hose)", type: "text", required: true },
      { name: "supplier", label: "Lieferant", type: "text" },
      { name: "ekPrice", label: "EK-Preis (€/Stück)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "vkPrice", label: "VK-Preis (€/Stück)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "messeDate", label: "Messe-Datum", type: "date" },
      { name: "messeScore", label: "Artikel-Score 0-10 (6+ = bestellen)", type: "number", transformIn: (v) => String(v ?? 5), transformOut: (v) => Math.max(0, Math.min(10, Number(v) || 5)) },
      { name: "collectionFit", label: "Kollektions-Fit (Notizen)", type: "textarea" },
      { name: "lyssTotalVk", label: "LYSS Gesamtabsatz Vorjahr", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "plannedVolume", label: "Geplantes Volumen (Gesamt-Stück)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "budget", label: "Budget (€)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "status", label: "Status", type: "select", options: ["Idee", "geplant", "in Verhandlung", "bestellt", "geliefert", "abgelehnt"] },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  lornafeedback: {
    title: "Lorna-Feedback bearbeiten",
    collection: "lornaFeedback",
    fields: [
      { name: "week", label: "Saison-Woche (1-13)", type: "number", transformIn: (v) => String(v ?? 1), transformOut: (v) => Number(v) || 1 },
      { name: "year", label: "Jahr", type: "number", transformIn: (v) => String(v ?? 2026), transformOut: (v) => Number(v) || 2026 },
      { name: "dateGiven", label: "Datum Feedback", type: "date" },
      { name: "trendUpdate", label: "Trend-Update (welche Farbe boomt überraschend?)", type: "textarea" },
      { name: "supplierUpdate", label: "Supplier-Update (nächste Charge wann?)", type: "textarea" },
      { name: "groessenFeedback", label: "Größen-Feedback (welche Größe überraschend?)", type: "textarea" },
      { name: "tauschBedarf", label: "Tausch-Bedarf (Ja/Nein + welcher?)", type: "textarea" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  hypothesis: {
    title: "Hypothese bearbeiten",
    collection: "hypotheses",
    fields: [
      { name: "title", label: "Hypothese (Vorhersage in 1 Satz)", type: "text", required: true },
      { name: "area", label: "Bereich", type: "select", options: ["Support", "Shop", "Daten", "Einkauf", "CRM", "Tech", "Strategie"] },
      { name: "predictionEur", label: "Vorhergesagte Wirkung (€/Jahr)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "predictionPct", label: "Vorhergesagte Wirkung (%)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "confidence", label: "Anfangs-Konfidenz", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { name: "basis", label: "Begründung / Datenbasis", type: "textarea" },
      { name: "linkedLeverId", label: "Verknüpfter Hebel (lev-ID, optional)", type: "text" },
      { name: "testDate", label: "Test-Datum (wann Ergebnis messbar)", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["offen", "in Test", "bestätigt", "widerlegt", "teilweise", "abgebrochen"] },
      { name: "actualEur", label: "Tatsächliche Wirkung (€)", type: "number", transformIn: (v) => String(v ?? ""), transformOut: (v) => v === "" ? null : Number(v) },
      { name: "actualPct", label: "Tatsächliche Wirkung (%)", type: "number", transformIn: (v) => String(v ?? ""), transformOut: (v) => v === "" ? null : Number(v) },
      { name: "wasRight", label: "Vorhersage korrekt?", type: "select", options: ["", "ja", "nein", "teilweise"] },
      { name: "reviewedAt", label: "Reviewed am", type: "date" },
      { name: "learnings", label: "Lernerträge", type: "textarea" }
    ]
  },
  wirkung: {
    title: "Wirkung / Leistung bearbeiten",
    collection: "wirkungen",
    fields: [
      { name: "title", label: "Was wurde geliefert", type: "text", required: true },
      { name: "category", label: "Kategorie", type: "select", options: ["Tool", "Prozess", "Analyse", "Briefing", "Verhandlung", "Schulung", "Foundation"] },
      { name: "date", label: "Datum", type: "date" },
      { name: "quartal", label: "Quartal", type: "select", options: ["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026", "Q1-2027", "Q2-2027", "Q3-2027", "Q4-2027"] },
      { name: "beforeState", label: "Vorher (Zustand)", type: "textarea" },
      { name: "afterState", label: "Nachher (Zustand)", type: "textarea" },
      { name: "evidence", label: "Beweis (Link, Zahl, Doku-Hinweis)", type: "textarea" },
      { name: "impactEur", label: "Wirkung in € (geschätzt)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "impactType", label: "Wirkungs-Typ", type: "select", options: ["Umsatz", "Kosten gespart", "Zeit gespart", "Risiko reduziert", "Foundation", "Wissen aufgebaut"] },
      { name: "verifiedBy", label: "Verifiziert durch", type: "text" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  premortem: {
    title: "Pre-Mortem bearbeiten",
    collection: "preMortems",
    fields: [
      { name: "title", label: "Szenario (in 1 Satz: was ist gescheitert)", type: "text", required: true },
      { name: "linkedLeverId", label: "Verknüpfter Hebel (lev-ID, optional)", type: "text" },
      { name: "scenarioDate", label: "Datum der Analyse", type: "date" },
      { name: "failureMode", label: "Wie ist es gescheitert", type: "textarea" },
      { name: "probability", label: "Eintritts-Wahrscheinlichkeit", type: "select", options: ["niedrig", "mittel", "hoch"] },
      { name: "impact", label: "Folge wenn es passiert", type: "textarea" },
      { name: "mitigation", label: "Gegenmaßnahme JETZT (vor Start)", type: "textarea" },
      { name: "earlyWarning", label: "Frühwarnsignal", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["aktiv", "neutralisiert", "eingetreten", "irrelevant"] },
      { name: "learnings", label: "Lernerträge", type: "textarea" }
    ]
  },
  saisonitem: {
    title: "Saison-Plan-Eintrag",
    collection: "saisonPlan",
    fields: [
      { name: "productName", label: "Produkt / Kategorie", type: "text", required: true },
      { name: "season", label: "Saison", type: "select", options: ["Winter (Dez-Feb)", "Frühling (Mär-Mai)", "Sommer (Jun-Aug)", "Herbst (Sep-Nov)", "Weihnachten", "Schulanfang", "Ostern"] },
      { name: "targetMonth", label: "Ziel-Monat", type: "select", options: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"] },
      { name: "historicalSales", label: "Historischer Absatz (Stück Vorjahr)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "plannedOrder", label: "Geplante Bestellmenge", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "leadTimeDays", label: "Lieferzeit (Tage)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "orderByDate", label: "Spätestes Bestelldatum", type: "date" },
      { name: "supplier", label: "Lieferant", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["Idee", "Geplant", "Bestellt", "Geliefert", "Verworfen"] },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  verhandlung: {
    title: "Lieferanten-Verhandlung",
    collection: "verhandlungen",
    fields: [
      { name: "supplierName", label: "Lieferant", type: "text", required: true },
      { name: "topic", label: "Verhandlungs-Thema", type: "select", options: ["Konditionen jährlich", "Preiserhöhung verhindern", "Mengen-Rabatt", "Skonto erhöhen", "Lieferzeit reduzieren", "Reklamation klären", "Markdown / Tausch", "Neue Produkte einlisten"] },
      { name: "scheduledDate", label: "Termin", type: "date" },
      { name: "magoGoal", label: "Magos Ziel (was er erreichen will)", type: "textarea" },
      { name: "magoBatna", label: "BATNA (was, wenn Verhandlung scheitert)", type: "textarea" },
      { name: "facts", label: "Daten-Faktenstack (Umsatz, Reklamation, Lieferzeit, …)", type: "textarea" },
      { name: "supplierArguments", label: "Erwartete Lieferanten-Argumente", type: "textarea" },
      { name: "magoCounters", label: "Magos Gegen-Argumente", type: "textarea" },
      { name: "result", label: "Ergebnis", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["geplant", "vorbereitet", "verhandelt", "gewonnen", "verloren", "vertagt"] },
      { name: "learnings", label: "Lernerträge (für nächste Verhandlung)", type: "textarea" }
    ]
  },
  vendor: {
    title: "Dienstleister bearbeiten",
    collection: "vendors",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "category", label: "Kategorie", type: "select", options: ["Tech", "Hosting", "Marketing", "KI", "Recht", "Logistik", "Lieferant", "Beratung", "Sonstiges"] },
      { name: "role", label: "Rolle / Was machen die für HFK", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["aktiv", "geplant", "pausiert", "fehlt", "gekündigt"] },
      { name: "contactPerson", label: "Ansprechpartner", type: "text" },
      { name: "contactMail", label: "Mail", type: "text" },
      { name: "contactPhone", label: "Telefon", type: "text" },
      { name: "website", label: "Website", type: "text" },
      { name: "hourlyRate", label: "Stundensatz (€)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "contractType", label: "Vertragsart", type: "text" },
      { name: "contractEnd", label: "Vertragsende / Kündigungsfrist", type: "text" },
      { name: "escalationContact", label: "Eskalation bei Ausfall", type: "textarea" },
      { name: "lastContact", label: "Letzter Kontakt", type: "date" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  pitch: {
    title: "Pitch / Vorschlag bearbeiten",
    collection: "pitches",
    fields: [
      { name: "title", label: "Pitch-Titel (was du Stephan vorschlägst)", type: "text", required: true },
      { name: "audience", label: "Adressat", type: "text" },
      { name: "problem", label: "Problem (was klemmt heute?)", type: "textarea" },
      { name: "evidence", label: "Beweis (mit Zahlen / Beobachtung)", type: "textarea" },
      { name: "solution", label: "Lösung (konkreter Plan)", type: "textarea" },
      { name: "alternatives", label: "Geprüfte Alternativen + warum verworfen", type: "textarea" },
      { name: "risks", label: "Risiken + Gegenmaßnahmen", type: "textarea" },
      { name: "nextStep", label: "Nächster Schritt (was Stephan entscheiden soll)", type: "textarea" },
      { name: "expectedResult", label: "Erwartetes Ergebnis (in €/Zeit/Risiko)", type: "textarea" },
      { name: "linkedLeverId", label: "Verknüpfter Hebel (ID, optional)", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["Entwurf", "Versendet", "Angenommen", "Verworfen", "Aufgeschoben"] },
      { name: "createdAt", label: "Erstellt", type: "date" }
    ]
  },
  glossaryEntry: {
    title: "Glossar-Eintrag bearbeiten",
    collection: "glossary",
    fields: [
      { name: "term", label: "Begriff", type: "text", required: true },
      { name: "category", label: "Kategorie", type: "select", options: ["System", "Kennzahl", "Strategie", "Tech", "Recht", "Marketing", "Sonstiges"] },
      { name: "definition", label: "Definition (in 1-2 Sätzen)", type: "textarea", required: true },
      { name: "synonyms", label: "Synonyme / Abkürzungen", type: "text" },
      { name: "example", label: "Beispiel aus HFK-Kontext", type: "textarea" },
      { name: "source", label: "Quelle", type: "text" }
    ]
  },
  beforeafter: {
    title: "Vorher/Nachher-Eintrag",
    collection: "vorhernachher",
    fields: [
      { name: "title", label: "Maßnahme (was wurde verändert?)", type: "text", required: true },
      { name: "area", label: "Bereich", type: "select", options: ["Shop", "Support", "Einkauf", "Daten", "Newsletter", "Sonstiges"] },
      { name: "date", label: "Umsetzungs-Datum", type: "date" },
      { name: "before", label: "Vorher (Beobachtung / Zahl)", type: "textarea" },
      { name: "after", label: "Nachher (Beobachtung / Zahl)", type: "textarea" },
      { name: "impactEur", label: "Wirkung in € (geschätzt)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "evidence", label: "Beweis (Link, Screenshot-Hinweis, Datenquelle)", type: "textarea" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  risk: {
    title: "Risiko bearbeiten",
    collection: "risks",
    fields: [
      { name: "title", label: "Risiko (1-Satz)", type: "text", required: true },
      { name: "category", label: "Kategorie", type: "select", options: ["Markt", "Lieferant", "Tech", "Operations", "Personell", "Compliance", "Marketing", "Finanzen"] },
      { name: "likelihood", label: "Wahrscheinlichkeit (1-5)", type: "number", transformIn: (v) => String(v ?? 3), transformOut: (v) => Math.max(1, Math.min(5, Number(v) || 3)) },
      { name: "impact", label: "Schaden (1-5)", type: "number", transformIn: (v) => String(v ?? 3), transformOut: (v) => Math.max(1, Math.min(5, Number(v) || 3)) },
      { name: "signals", label: "Frühwarnsignale (Was sehe ich wenn es eintritt?)", type: "textarea" },
      { name: "mitigation", label: "Gegenmaßnahme", type: "textarea" },
      { name: "owner", label: "Owner", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["beobachten", "in Arbeit", "gemindert", "eingetreten", "irrelevant"] },
      { name: "lastReview", label: "Letzte Bewertung", type: "date" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  decision: {
    title: "Entscheidung bearbeiten",
    collection: "decisionLog",
    fields: [
      { name: "title", label: "Entscheidung (1-Satz)", type: "text", required: true },
      { name: "date", label: "Datum", type: "date", required: true },
      { name: "context", label: "Kontext (was war die Lage?)", type: "textarea" },
      { name: "why", label: "Begründung", type: "textarea" },
      { name: "alternatives", label: "Geprüfte Alternativen", type: "textarea" },
      { name: "who", label: "Wer hat entschieden", type: "text" },
      { name: "impact", label: "Erwartete Wirkung", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { name: "reviewAt", label: "Review-Datum (+30T empfohlen)", type: "date" },
      { name: "outcome", label: "Tatsächliches Ergebnis (nach Review)", type: "textarea" },
      { name: "outcomeAt", label: "Ergebnis erfasst am", type: "date" }
    ]
  },
  "time-entry": {
    title: "Zeitbuchung bearbeiten",
    collection: "timeEntries",
    fields: [
      { name: "date", label: "Datum", type: "date", required: true },
      { name: "area", label: "Bereich", type: "select", options: ["Support", "Shop", "JTL", "Daten", "Einkauf", "Stephan-Management", "SeBo-Dev", "Lernen", "Sonstiges"] },
      { name: "task", label: "Worauf", type: "text", required: true },
      { name: "minutes", label: "Minuten", type: "number", transformIn: (v) => String(v ?? 25), transformOut: (v) => Number(v) || 0 },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  person: {
    title: "Person bearbeiten",
    collection: "team",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Rolle", type: "text" },
      { name: "mail", label: "Mail", type: "text" },
      { name: "phone", label: "Telefon", type: "text" },
      { name: "birthday", label: "Geburtstag", type: "date" },
      { name: "lastContact", label: "Letzter Kontakt", type: "date" },
      { name: "contactStyle", label: "Kommunikationsstil", type: "textarea" },
      { name: "lovesToHear", label: "Reagiert positiv auf", type: "textarea" },
      { name: "avoids", label: "Vermeidet / triggert", type: "textarea" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  brand: {
    title: "Marke bearbeiten",
    collection: "brands",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "category", label: "BCG-Kategorie", type: "select", options: ["Star", "Question Mark", "Cash Cow", "Dog"] },
      { name: "growthPct", label: "Wachstum (%)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "revenueShare", label: "Umsatzanteil (%)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "status", label: "Handlung", type: "select", options: ["ausbauen", "halten", "beobachten", "reduzieren"] },
      { name: "action", label: "Konkrete Aktion", type: "textarea" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  campaign: {
    title: "Kampagne bearbeiten",
    collection: "reactivationCampaigns",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "segment", label: "Segment-ID", type: "text" },
      { name: "size", label: "Empfänger", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "sent", label: "Versendet", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "opened", label: "Geöffnet", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "clicked", label: "Geklickt", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "ordered", label: "Bestellt", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "revenue", label: "Umsatz (€)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "status", label: "Status", type: "select", options: ["geplant", "läuft", "ausgewertet", "abgebrochen"] },
      { name: "startDate", label: "Start", type: "date" },
      { name: "channel", label: "Kanal", type: "text" },
      { name: "offer", label: "Angebot", type: "textarea" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  crosspair: {
    title: "Warenkorb-Paar bearbeiten",
    collection: "crossSellPairs",
    fields: [
      { name: "productA", label: "Produkt A", type: "text", required: true },
      { name: "productB", label: "Produkt B", type: "text", required: true },
      { name: "coOccurrences", label: "Gemeinsam gekauft", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "status", label: "Status", type: "select", options: ["Bundle idee", "Bundle prüfen", "Bundle live", "Verworfen"] },
      { name: "action", label: "Nächste Aktion", type: "textarea" }
    ]
  },
  bundle: {
    title: "Bundle-Idee bearbeiten",
    collection: "bundleIdeas",
    fields: [
      { name: "name", label: "Bundle-Name", type: "text", required: true },
      { name: "products", label: "Enthaltene Produkte", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["Idee", "In Arbeit", "Live", "Verworfen"] },
      { name: "expectedUplift", label: "Erwartetes Uplift (%)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  sortimentrule: {
    title: "Sortiments-Regel bearbeiten",
    collection: "sortimentRules",
    fields: [
      { name: "rule", label: "Regel", type: "textarea", required: true },
      { name: "articleCount", label: "Betroffene Artikel", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "priority", label: "Priorität", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { name: "status", label: "Status", type: "select", options: ["Idee", "Vorschlag", "in Arbeit", "Umgesetzt", "Verworfen"] },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  vip: {
    title: "VIP-Artikel bearbeiten",
    collection: "vipArticles",
    fields: [
      { name: "sku", label: "SKU", type: "text", required: true },
      { name: "name", label: "Artikelname", type: "text", required: true },
      { name: "revenueYear", label: "Jahresumsatz (€)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "targetStock", label: "Soll-Bestand", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "currentStock", label: "Ist-Bestand", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "leadTimeDays", label: "Lieferzeit (Tage)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "supplier", label: "Lieferant", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["ok", "warnung", "kritisch"] },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  "week-kpi": {
    title: "KPI-Woche bearbeiten",
    collection: "weeklyKpis",
    fields: [
      { name: "weekStart", label: "Wochenstart (Montag)", type: "date", required: true },
      { name: "weekLabel", label: "Label (z.B. KW 21 / 2026)", type: "text", required: true },
      { name: "revenue", label: "Umsatz (€)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "orders", label: "Bestellungen", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "sessions", label: "Sessions", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "conversionPct", label: "Conversion (%)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "returnRatePct", label: "Retourenquote (%)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "supportTickets", label: "Support-Tickets", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "repeatRatePct", label: "Wiederkaufquote (%)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  anomaly: {
    title: "Anomalie bearbeiten",
    collection: "anomalies",
    fields: [
      { name: "weekStart", label: "Betroffene Woche (Montag)", type: "date", required: true },
      { name: "metric", label: "Metrik", type: "select", options: ["revenue", "orders", "conversionPct", "sessions", "returnRatePct", "supportTickets", "repeatRatePct"] },
      { name: "deltaPct", label: "Abweichung (%)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "vsLabel", label: "Vergleichsbasis", type: "select", options: ["vs Vorwoche", "vs vor 4 Wochen", "vs Vorjahr", "manuell"] },
      { name: "status", label: "Status", type: "select", options: ["offen", "in Klärung", "geklärt", "verworfen"] },
      { name: "hypothesis", label: "Hypothesen (eine pro Zeile)", type: "textarea" },
      { name: "dataSourcesChecked", label: "Quellen die zu prüfen sind", type: "textarea" },
      { name: "conclusion", label: "Befund", type: "textarea" }
    ]
  },
  promise: {
    title: "Versprechen bearbeiten",
    collection: "promises",
    fields: [
      { name: "what", label: "Was wurde versprochen", type: "textarea", required: true },
      { name: "context", label: "Kontext (Gespräch / Mail / Slack)", type: "text" },
      { name: "promisedAt", label: "Zugesagt am", type: "date" },
      { name: "dueDate", label: "Fällig bis", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["offen", "in Arbeit", "eingelöst", "verschoben", "verfehlt"] },
      { name: "outcome", label: "Ergebnis / Reaktion", type: "textarea" }
    ]
  },
  lever: {
    title: "Hebel bearbeiten",
    collection: "levers",
    fields: [
      { name: "title", label: "Hebel (kurz, in einem Satz)", type: "text", required: true },
      { name: "plainExplanation", label: "Klartext-Erklärung (Was ist gemeint? Warum?)", type: "textarea" },
      { name: "area", label: "Bereich", type: "select", options: ["Support", "Shop", "Daten", "Einkauf", "CRM", "Tech", "Strategie"] },
      { name: "expectedImpactEur", label: "Erwartete Wirkung (€/Jahr)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "effortHours", label: "Aufwand (Stunden)", type: "number", transformIn: (v) => String(v ?? 0), transformOut: (v) => Number(v) || 0 },
      { name: "confidence", label: "Konfidenz", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { name: "risk", label: "Risiko", type: "select", options: ["niedrig", "mittel", "hoch"] },
      { name: "status", label: "Status", type: "select", options: ["Idee", "Geprüft", "In Arbeit", "Live", "Verworfen"] },
      { name: "dataBasis", label: "Datengrundlage / Annahme", type: "textarea" },
      { name: "notes", label: "Notiz", type: "textarea" }
    ]
  },
  question: {
    title: "Stephan-Frage bearbeiten",
    collection: "stephanQuestions",
    fields: [
      { name: "question", label: "Frage (so wie Stephan sie stellen würde)", type: "textarea", required: true },
      { name: "topic", label: "Thema", type: "select", options: ["Rolle", "Gehalt", "Support", "JTL/Shop", "Daten", "Einkauf", "Strategie", "Technik"] },
      { name: "modelAnswer", label: "Musterantwort (Kern in 2-3 Sätzen)", type: "textarea" },
      { name: "talkingPoints", label: "Stichpunkte (eine pro Zeile)", type: "textarea", transformIn: (v) => (Array.isArray(v) ? v.join("\n") : v || ""), transformOut: (v) => String(v || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean) },
      { name: "dataNeeded", label: "Daten / Argumente die ich brauche", type: "textarea" },
      { name: "confidence", label: "Wie sicher (0=nie geübt, 3=sitzt)", type: "select", options: ["0", "1", "2", "3"], transformIn: (v) => String(v ?? "0"), transformOut: (v) => Number(v) || 0 }
    ]
  }
};

function openEdit(type, id) {
  const config = editConfig[type];
  if (!config) return;
  const isNew = !id;
  const entity = isNew ? {} : state[config.collection].find((x) => x.id === id);
  if (!isNew && !entity) return;

  byId("edit-modal-title").textContent = isNew ? `Neu: ${config.title.replace(" bearbeiten", "")}` : config.title;
  const fields = byId("edit-modal-fields");
  fields.innerHTML = config.fields.map((field) => {
    const raw = entity[field.name];
    const value = field.transformIn ? field.transformIn(raw) : (raw ?? "");
    const safeValue = escapeHtml(value);
    const required = field.required ? "required" : "";
    if (field.type === "textarea") {
      return `<label>${field.label}<textarea name="${field.name}" ${required}>${safeValue}</textarea></label>`;
    }
    if (field.type === "select") {
      return `<label>${field.label}<select name="${field.name}" ${required}>${field.options.map((opt) => `<option ${opt === value ? "selected" : ""}>${escapeHtml(opt)}</option>`).join("")}</select></label>`;
    }
    if (field.type === "system") {
      return `<label>${field.label}<select name="${field.name}" ${required}>${state.systems.map((sys) => `<option value="${escapeHtml(sys.id)}" ${sys.id === value ? "selected" : ""}>${escapeHtml(sys.name)}</option>`).join("")}</select></label>`;
    }
    return `<label>${field.label}<input type="${field.type}" name="${field.name}" value="${safeValue}" ${required} /></label>`;
  }).join("");

  const form = byId("edit-form");
  form.onsubmit = (event) => {
    event.preventDefault();
    const data = {};
    config.fields.forEach((field) => {
      const raw = form.elements[field.name]?.value ?? "";
      data[field.name] = field.transformOut ? field.transformOut(raw) : raw;
    });
    if (isNew) {
      const prefix = type[0];
      const created = { id: uid(prefix), ...data };
      state[config.collection].unshift(created);
    } else {
      Object.assign(entity, data);
    }
    saveState();
    render();
    byId("edit-modal").close();
    showToast(isNew ? "Angelegt" : "Gespeichert");
  };

  // Delete-Button nur bei bestehenden Items zeigen
  const deleteBtn = byId("edit-modal-delete");
  if (deleteBtn) {
    deleteBtn.hidden = isNew;
    if (!isNew) {
      deleteBtn.onclick = () => {
        const label = config.title.replace(" bearbeiten", "");
        if (!confirm(`${label} "${entity.title || entity.name || entity.einwand || entity.text || entity.id}" wirklich löschen?`)) return;
        state[config.collection] = state[config.collection].filter((x) => x.id !== id);
        saveState();
        render();
        byId("edit-modal").close();
        showToast("Gelöscht");
      };
    }
  }
  byId("edit-modal").showModal();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-edit]");
  if (!target) return;
  const [type, id] = target.dataset.edit.split(":");
  openEdit(type, id || null);
});

byId("edit-modal-close").addEventListener("click", () => byId("edit-modal").close());
byId("edit-modal-cancel").addEventListener("click", () => byId("edit-modal").close());

function exportBackup() {
  const payload = { version: 1, exportedAt: new Date().toISOString(), data: state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `magaloko-backup-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Backup heruntergeladen");
}

async function importBackup(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const incoming = parsed?.data || parsed;
    if (!incoming || typeof incoming !== "object" || !Array.isArray(incoming.systems)) {
      showToast("Datei nicht erkannt");
      return;
    }
    if (!confirm("Bestehende MAGALOKO-Daten überschreiben?")) return;
    state = mergeWithSeed(incoming);
    saveState();
    render();
    showToast("Backup wiederhergestellt");
  } catch {
    showToast("Backup ungültig");
  }
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelectorAll(".bottom-nav-item[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    setView(button.dataset.view);
    updateBottomNavActive();
  });
});

function updateBottomNavActive() {
  document.querySelectorAll(".bottom-nav-item[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === currentView);
  });
}

function setMobileDrawer(open) {
  const sidebar = document.querySelector(".sidebar");
  const backdrop = byId("mobile-backdrop");
  if (!sidebar) return;
  sidebar.classList.toggle("mobile-open", open);
  if (backdrop) {
    backdrop.classList.toggle("visible", open);
    backdrop.hidden = !open;
  }
  document.body.classList.toggle("drawer-open", open);
  const trigger = byId("mobile-menu-trigger");
  trigger?.setAttribute("aria-expanded", open ? "true" : "false");
}

function toggleMobileDrawer() {
  const sidebar = document.querySelector(".sidebar");
  setMobileDrawer(!sidebar?.classList.contains("mobile-open"));
}

const moreBtn = byId("bottom-nav-more");
if (moreBtn) {
  moreBtn.addEventListener("click", toggleMobileDrawer);
}

const menuTrigger = byId("mobile-menu-trigger");
if (menuTrigger) {
  menuTrigger.addEventListener("click", toggleMobileDrawer);
}

const mobileBackdrop = byId("mobile-backdrop");
if (mobileBackdrop) {
  mobileBackdrop.addEventListener("click", () => setMobileDrawer(false));
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.querySelector(".sidebar.mobile-open")) {
    setMobileDrawer(false);
  }
});

document.querySelectorAll(".sidebar .nav-item").forEach((b) => {
  b.addEventListener("click", () => {
    setMobileDrawer(false);
    updateBottomNavActive();
  });
});

const navSearchInput = byId("nav-search");
if (navSearchInput) {
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const filterNav = () => {
    const q = norm(navSearchInput.value.trim());
    const items = document.querySelectorAll(".sidebar .nav-item");
    items.forEach((item) => {
      const text = norm(item.textContent);
      const match = !q || text.includes(q);
      item.classList.toggle("nav-filter-hidden", !match);
    });
    document.querySelectorAll(".sidebar .nav-group").forEach((group) => {
      const visible = group.querySelectorAll(".nav-item:not(.nav-filter-hidden)").length;
      group.classList.toggle("nav-filter-empty", visible === 0);
    });
  };
  navSearchInput.addEventListener("input", filterNav);
  navSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (navSearchInput.value) {
        navSearchInput.value = "";
        filterNav();
        e.stopPropagation();
      }
    } else if (e.key === "Enter") {
      const first = document.querySelector(".sidebar .nav-item:not(.nav-filter-hidden)");
      if (first) {
        e.preventDefault();
        first.click();
      }
    }
  });
  document.querySelectorAll(".sidebar .nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (navSearchInput.value) {
        navSearchInput.value = "";
        filterNav();
      }
    });
  });
}

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.jump));
});

document.querySelectorAll("#system-filter button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#system-filter button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderSystems(button.dataset.filter);
  });
});

byId("access-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  state.accessItems.unshift({ id: uid("a"), notes: "Keine Secrets speichern.", ...data });
  saveState();
  event.currentTarget.reset();
  renderAccess();
  showToast("Zugang hinzugefügt");
});

byId("task-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  state.tasks.unshift({
    id: uid("t"),
    status: "Backlog",
    impact: data.priority === "hoch" ? "hoch" : "mittel",
    effort: "mittel",
    owner: "Mago",
    notes: "",
    ...data
  });
  saveState();
  event.currentTarget.reset();
  renderKanban();
  renderDashboard();
  showToast("Aufgabe angelegt");
});

byId("briefing-form").addEventListener("input", renderBriefing);
byId("briefing-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.briefings.unshift(getBriefingFromForm());
  saveState();
  showToast("Briefing gespeichert");
});

byId("copy-briefing").addEventListener("click", () => {
  copyText(byId("briefing-output").textContent, "Briefing kopiert");
});

byId("briefing-template").addEventListener("change", (event) => {
  const key = event.target.value;
  if (!key) return;
  applyBriefingTemplate(key);
  event.target.value = "";
});

document.querySelectorAll("#briefing-mode button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#briefing-mode button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    briefingMode = button.dataset.mode;
    const showPreview = briefingMode === "preview";
    byId("briefing-output").hidden = showPreview;
    byId("briefing-preview").hidden = !showPreview;
  });
});

byId("print-briefing").addEventListener("click", () => {
  document.body.classList.add("print-briefing");
  window.print();
  setTimeout(() => document.body.classList.remove("print-briefing"), 500);
});

byId("edit-profile").addEventListener("click", openProfileEdit);

document.querySelectorAll("#aitool-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#aitool-tabs button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    activeAiTool = button.dataset.tool;
    renderAiTools();
  });
});
byId("aitools-settings").addEventListener("click", openAiSettings);

byId("brand-category-filter").addEventListener("change", (e) => { brandCategoryFilter = e.target.value; renderBrands(); });
byId("brand-search").addEventListener("input", (e) => { brandSearch = e.target.value.trim().toLowerCase(); renderBrands(); });
byId("vip-status-filter").addEventListener("change", (e) => { vipStatusFilter = e.target.value; renderVip(); });
byId("bundle-ai").addEventListener("click", generateBundleIdeasAi);

byId("jtl-manufacturers-load").addEventListener("click", async () => {
  byId("jtl-manufacturers-content").innerHTML = '<p class="muted">Lade Hersteller aus JTL …</p>';
  try {
    await loadJtlData("manufacturers");
    renderJtlManufacturers();
    showToast(`${jtlCache.manufacturers.count} Hersteller geladen`);
  } catch (error) {
    byId("jtl-manufacturers-content").innerHTML = `<p class="muted">Fehler: ${escapeHtml(error.message)}</p>`;
  }
});

byId("jtl-suppliers-load").addEventListener("click", async () => {
  byId("jtl-suppliers-content").innerHTML = '<p class="muted">Lade Lieferanten aus JTL …</p>';
  try {
    await loadJtlData("suppliers");
    renderJtlSuppliers();
    showToast(`${jtlCache.suppliers.count} Lieferanten geladen`);
  } catch (error) {
    byId("jtl-suppliers-content").innerHTML = `<p class="muted">Fehler: ${escapeHtml(error.message)}</p>`;
  }
});

byId("brands-ai").addEventListener("click", () => {
  const ctx = bcgQuadrants.map((q) => {
    const items = state.brands.filter((b) => b.category === q.key);
    const sum = items.reduce((s, b) => s + (b.revenueShare || 0), 0);
    return `${q.title} (${items.length} Marken, ${sum.toFixed(1)}% Umsatzanteil):\n  ${items.map((b) => `${b.name}: Wachstum ${b.growthPct >= 0 ? "+" : ""}${b.growthPct}%, Anteil ${(b.revenueShare || 0).toFixed(2)}% — ${b.action || ""}`).join("\n  ")}`;
  }).join("\n\n");
  openAiAnalysis({
    title: "HFK Marken-Portfolio (BCG)",
    context: ctx,
    systemRole: "Du bist Markenstratege im Kinder-/Baby-E-Commerce. Du bekommst das BCG-Portfolio von HFK. Antworte konkret mit Bezug auf einzelne Marken, geschäftsfokussiert.",
    presets: [
      { label: "Top-3 Hebel im Portfolio", prompt: "Welche 3 Marken haben jetzt den größten Hebel — Stars die wir verschlafen, Dogs die zu viel Kapital binden, Cash Cows die kippen? Pro Marke 1 konkrete Aktion." },
      { label: "Question Marks bewerten", prompt: "Welche unserer Question Marks sollten wir konsequent fördern, welche eher fallenlassen? Begründe pro Marke." },
      { label: "Dog-Exit-Plan", prompt: "Wie würdest du LIEWOOD, NOBODINOZ, STOKKE, MINI A TURE, SEBRA über 6 Monate sauber abbauen ohne Umsatzsturz? Reihenfolge und Schritte." },
      { label: "Cash-Cow-Marge schützen", prompt: "OLIVER FURNITURE, HFK Eigenmarke, CYBEX, BUGABOO, TRÄUMELAND: Was sind die 3 größten Margenrisiken und wie sichern wir sie?" },
      { label: "Briefing an Stephan", prompt: "Schreibe ein 10-zeiliges Markenstrategie-Briefing an Stephan: aktuelle Lage, 3 Hebel, 1 Hauptempfehlung, Entscheidungsfrage am Ende." }
    ]
  });
});

byId("champions-ai").addEventListener("click", () => {
  const segCtx = state.customerSegments.map((s) => `${s.name}: ${s.customerCount.toLocaleString("de-DE")} Kunden, Lifetime-Umsatz ${formatEur(s.lifetimeRevenue)}, Anteil ${s.share}%, Status ${s.status}, Aktion: ${s.action}`).join("\n");
  const campCtx = state.reactivationCampaigns.length ? "\n\nLAUFENDE/GEPLANTE KAMPAGNEN:\n" + state.reactivationCampaigns.map((c) => `${c.name} (${c.status}): ${c.size} Empfänger, ${c.sent} versendet, ${c.opened} geöffnet, ${c.clicked} geklickt, ${c.ordered} bestellt, ${formatEur(c.revenue)} Umsatz`).join("\n") : "";
  openAiAnalysis({
    title: "Champions & Reaktivierung",
    context: "KUNDENSEGMENTE:\n" + segCtx + campCtx,
    systemRole: "Du bist CRM-/Reaktivierungsstratege. HFK hat 67% Einmalkäufer und 2.979 schlafende Champions (früher 3,4 Mio € Lifetime). Wiederkaufzyklus 134 Tage. Antworte konkret und umsetzbar.",
    presets: [
      { label: "Sleeping-Champions-Kampagne planen", prompt: "Entwirf eine Reaktivierungskampagne für die 2.979 Sleeping Champions: Segmentierung, Angebot, Kanalmix, Messpunkte, erwartete Conversion. Konkret und umsetzbar in 2 Wochen." },
      { label: "Einmalkäufer-Welcome-Strecke", prompt: "21.533 Einmalkäufer mit 0 Wiederkauf. Welche Welcome-/Trigger-Sequenz würde diese in Wiederkäufer konvertieren? Tag-Trigger und Inhalte." },
      { label: "ROI-Schätzung", prompt: "Schätze auf Basis 2.979 Sleeping Champions und 3,4 Mio Lifetime: Was wäre realistisch erzielbar bei einer guten Reaktivierungskampagne? Mit Annahmen." },
      { label: "DSGVO-Reduktion 24.885", prompt: "24.885 Kunden inaktiv >2 Jahre. Wie würdest du DSGVO-konform reduzieren ohne Reaktivierungspotenzial zu verlieren?" },
      { label: "Briefing an Stephan", prompt: "Schreibe 8 Zeilen an Stephan: was bedeuten die Segmentzahlen, was ist der Plan für die nächsten 30 Tage, welche Entscheidung brauchst du?" }
    ]
  });
});

byId("sortiment-ai").addEventListener("click", () => {
  const s = state.sortimentStats;
  const ctx = `SORTIMENTSSTATISTIK:
Artikel gesamt: ${s.totalArticles.toLocaleString("de-DE")}
Aktiv: ${s.activeArticles.toLocaleString("de-DE")} · Inaktiv: ${s.inactiveArticles.toLocaleString("de-DE")}
Je verkauft: ${s.soldEver.toLocaleString("de-DE")} · Nicht verkauft 24M: ${s.notSold24m.toLocaleString("de-DE")}
Umsatzklassen: über 100k€ (${s.overTotal}), 10-100k€ (${s.over10k}), 1-10k€ (${s.over1k}), unter 1k€ (${s.under1k.toLocaleString("de-DE")})

AKTUELLE BEREINIGUNGS-REGELN:
${state.sortimentRules.map((r) => `- "${r.rule}" (${r.priority}, ${r.status}): ${r.articleCount.toLocaleString("de-DE")} Artikel betroffen`).join("\n")}`;
  openAiAnalysis({
    title: "Sortimentsbereinigung",
    context: ctx,
    systemRole: "Du bist Sortimentsstratege. HFK hat extremen Long-Tail und Pflegeaufwand. Antworte mit konkreten Mengen, Aufwand und Risiko.",
    presets: [
      { label: "Reihenfolge der Bereinigung", prompt: "Welche Bereinigungs-Regel sollte HFK ZUERST umsetzen? Begründe mit Aufwand, Wirkung, Risiko. Konkreter Plan für die nächsten 4 Wochen." },
      { label: "Risiken der Bereinigung", prompt: "Was sind die 3 größten Risiken bei harter Sortimentsbereinigung (SEO, Long-Tail-Käufer, Lieferantenbeziehungen)? Gegenmaßnahmen?" },
      { label: "Long-Tail trotzdem nutzen", prompt: "Welche Long-Tail-Artikel sollte HFK trotzdem behalten? Print-on-Demand, Bundle-Komponenten, Frequenz-Treiber. Konkrete Filterregeln." },
      { label: "Lieferanten-Verhandlung", prompt: "Wie würdest du die 68.467 Artikel unter 1.000 €/Jahr für Lieferanten-Konditionsverhandlungen nutzen? Argumentation + Vorgehen." },
      { label: "Briefing an Stephan", prompt: "Schreibe 8 Zeilen an Stephan: Sortimentslage, Hauptproblem, 1 erste Maßnahme, Entscheidungsfrage." }
    ]
  });
});

byId("vip-ai").addEventListener("click", () => {
  const ctx = state.vipArticles.map((v) => {
    const ratio = (v.targetStock && v.currentStock) ? (v.currentStock / v.targetStock * 100).toFixed(0) + "%" : "—";
    return `${v.name} (${v.sku}): ${formatEur(v.revenueYear)}/Jahr · Soll ${v.targetStock || "—"} / Ist ${v.currentStock || "—"} (${ratio}) · Lieferzeit ${v.leadTimeDays}T · ${v.supplier} · ${v.status}${v.notes ? " · " + v.notes : ""}`;
  }).join("\n");
  openAiAnalysis({
    title: "VIP-Artikel-Wächter",
    context: "VIP-ARTIKEL (Top-Umsatzträger):\n" + ctx,
    systemRole: "Du bist Bestandsoptimierer für Top-Umsatzartikel. OOS bei VIP = direkter Umsatzverlust. Antworte mit konkreten Mengen und Aktionen.",
    presets: [
      { label: "Sofortmaßnahmen kritische Artikel", prompt: "Welche VIP-Artikel müssen SOFORT nachbestellt werden und welche Menge? Berücksichtige Lieferzeit, Soll-Bestand, Jahresumsatz." },
      { label: "Bundle-Risiken", prompt: "WOOD Mini+ Babybett und Matratze Frühlingsluft sind ein Top-Bundle. Welche kritischen Abhängigkeiten siehst du im VIP-Bestand?" },
      { label: "Lieferanten-Konzentration", prompt: "Wie konzentriert ist unser VIP-Umsatz auf einzelne Lieferanten? Welche Diversifikation wäre sinnvoll?" },
      { label: "Soll-Bestand neu berechnen", prompt: "Wie würdest du den Soll-Bestand pro VIP-Artikel methodisch berechnen (Sicherheitsbestand, Lieferzeit, Saisonalität)? Vorgehen + Formel." },
      { label: "Briefing an Beate/Stephan", prompt: "Schreibe 8 Zeilen an Beate und Stephan: aktuelle VIP-Lage, dringendste Nachbestellungen, Begründung in Euro, Entscheidungsfrage." }
    ]
  });
});

byId("purchase-reload").addEventListener("click", async () => {
  showToast("Lade JTL-Daten …");
  await loadPurchaseData(true);
  renderPurchase();
  showToast(`${purchaseData?.products.length || 0} Produkte geladen`);
});
byId("purchase-sort").addEventListener("change", (e) => { purchaseSort = e.target.value; renderPurchase(); });
byId("purchase-signal").addEventListener("change", (e) => { purchaseSignal = e.target.value; renderPurchase(); });
byId("purchase-supplier").addEventListener("change", (e) => { purchaseSupplier = e.target.value; renderPurchase(); });
byId("purchase-search").addEventListener("input", (e) => { purchaseSearch = e.target.value.trim().toLowerCase(); renderPurchase(); });

// Einkaufsplaner Tab-Switching + Modul-Events
document.querySelectorAll("#purchase-tabs button").forEach((b) => {
  b.addEventListener("click", () => switchPurchaseTab(b.dataset.purchaseTab));
});
byId("messen-export-csv").addEventListener("click", exportMessenCsv);
byId("messen-ai-mix").addEventListener("click", aiSuggestGroessenMix);
byId("saison-woche-select").addEventListener("change", (e) => { saisonSelectedWoche = Number(e.target.value); renderSaisonModul(); });
byId("saison-ai-markdown").addEventListener("click", aiSuggestMarkdownPlan);
loadPurchaseData().then(() => renderPurchase());

document.querySelectorAll("#mood-form [data-mood]").forEach((button) => {
  button.addEventListener("click", (event) => {
    const mood = event.currentTarget.dataset.mood;
    const noteInput = document.querySelector("#mood-form input[name='note']");
    state.stephanMoods.unshift({
      id: uid("mo"),
      mood,
      note: noteInput.value.trim(),
      date: new Date().toISOString()
    });
    saveState();
    noteInput.value = "";
    renderMoodLog();
    showToast("Mood erfasst");
  });
});

byId("meeting-drill-all").addEventListener("click", () => startDrill(null));
document.querySelectorAll("[data-meeting-drill]").forEach((button) => {
  button.addEventListener("click", (event) => startDrill(event.currentTarget.dataset.meetingDrill));
});

byId("capture-question-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  if (!data.question?.trim()) return;
  state.stephanQuestions.unshift({
    id: uid("q"),
    question: data.question.trim(),
    topic: data.topic || "Strategie",
    modelAnswer: "",
    talkingPoints: [],
    dataNeeded: "",
    confidence: 0,
    source: "meeting",
    capturedAt: new Date().toISOString()
  });
  saveState();
  event.currentTarget.reset();
  renderAssistant();
  showToast("Frage erfasst — Antwort im Assistent ergänzen");
});

byId("meeting-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  state.meetings.unshift({ id: uid("m"), outcome: "", followUps: "", ...data });
  saveState();
  renderMeetings();
  renderDashboard();
  showToast("Gespräch gespeichert");
});

byId("reset-seed").addEventListener("click", () => {
  state = structuredClone(seedData);
  saveState();
  render();
  showToast("Seed-Daten neu geladen");
});

byId("export-update").addEventListener("click", exportWeeklyUpdate);

const actionsMenu = byId("actions-menu");
const actionsTrigger = byId("actions-menu-trigger");
actionsTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  const open = !actionsMenu.hidden;
  actionsMenu.hidden = open;
  actionsTrigger.setAttribute("aria-expanded", String(!open));
});
document.addEventListener("click", (event) => {
  if (!actionsMenu.hidden && !actionsMenu.contains(event.target) && event.target !== actionsTrigger) {
    actionsMenu.hidden = true;
    actionsTrigger.setAttribute("aria-expanded", "false");
  }
});
actionsMenu.addEventListener("click", () => {
  actionsMenu.hidden = true;
  actionsTrigger.setAttribute("aria-expanded", "false");
});

byId("export-json").addEventListener("click", exportBackup);
byId("import-json").addEventListener("click", () => byId("import-file").click());
byId("import-file").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importBackup(file);
  event.target.value = "";
});

byId("task-search").addEventListener("input", renderKanban);
byId("task-area-filter").addEventListener("change", renderKanban);

document.querySelectorAll("#lever-mode button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#lever-mode button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    leverMode = button.dataset.mode;
    renderLevers();
  });
});
byId("lever-area-filter").addEventListener("change", (event) => { leverArea = event.target.value; renderLevers(); });
byId("lever-status-filter").addEventListener("change", (event) => { leverStatus = event.target.value; renderLevers(); });
byId("lever-search").addEventListener("input", (event) => { leverSearch = event.target.value.trim().toLowerCase(); renderLevers(); });

byId("anomaly-threshold").addEventListener("input", (event) => {
  anomalyThreshold = Number(event.target.value) || 10;
  renderAnomalies();
});

byId("jtl-kpi-import").addEventListener("click", async () => {
  showToast("Lade JTL-Wochen-KPIs (kann 5-15s dauern)…");
  try {
    const since = new Date(); since.setFullYear(since.getFullYear() - 2);
    const response = await fetch(`/api/jtl/kpis/weekly?since=${since.toISOString().slice(0, 10)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Fehler");
    // Überschreibe / ergänze weeklyKpis aus JTL
    let imported = 0, updated = 0;
    data.weeks.forEach((w) => {
      const existing = state.weeklyKpis.find((x) => x.weekStart === w.weekStart);
      if (existing) {
        existing.orders = w.invoices;
        existing.notes = (existing.notes || "") + (existing.notes ? " · " : "") + `JTL: ${w.uniqueCustomers} unique`;
        updated++;
      } else {
        state.weeklyKpis.push({
          id: uid("wk-jtl"),
          weekStart: w.weekStart,
          weekLabel: w.weekLabel,
          revenue: 0, // Brauchen Position-Daten für Umsatz
          orders: w.invoices,
          sessions: 0, conversionPct: 0,
          returnRatePct: 0, supportTickets: 0, repeatRatePct: 0,
          notes: `Aus JTL importiert · ${w.uniqueCustomers} unique Kunden`
        });
        imported++;
      }
    });
    saveState();
    renderAnomalies();
    showToast(`${imported} neue Wochen, ${updated} aktualisiert (${data.parsedRows} Rechnungen geparst)`);
  } catch (error) {
    showToast("JTL-Import-Fehler: " + error.message);
  }
});

// Briefing per Mail
byId("send-briefing-mail").addEventListener("click", async () => {
  const stephanMail = state.team.find((p) => p.id === "p-stephan")?.mail || "";
  const to = prompt("An welche Mail?", stephanMail);
  if (!to) return;
  const md = byId("briefing-output").textContent;
  const html = `<pre style="font-family:Inter,sans-serif;white-space:pre-wrap;">${escapeHtml(md)}</pre>`;
  try {
    const response = await fetch("/api/mail/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject: "Briefing", text: md, html, source: "briefing" })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    showToast("Briefing versendet");
  } catch (error) {
    showToast(error.message);
  }
});

byId("send-briefing-slack").addEventListener("click", async () => {
  const md = byId("briefing-output").textContent;
  try {
    const response = await fetch("/api/slack/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: md, source: "briefing" })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    showToast("An Slack gesendet");
  } catch (error) {
    showToast(error.message);
  }
});

const AI_SESSION_KEY = "magaloko:ai:v1";
const AI_LOCAL_KEY = "magaloko:ai:persistent:v1";

function loadAiConfig() {
  try {
    // localStorage hat Vorrang wenn vorhanden (dauerhaft)
    const local = localStorage.getItem(AI_LOCAL_KEY);
    if (local) return { ...JSON.parse(local), _storage: "local" };
    const sess = sessionStorage.getItem(AI_SESSION_KEY);
    if (sess) return { ...JSON.parse(sess), _storage: "session" };
    return {};
  } catch {
    return {};
  }
}

function saveAiConfig(cfg, storage = "session") {
  const persistable = { provider: cfg.provider, model: cfg.model, apiKey: cfg.apiKey };
  if (storage === "local") {
    localStorage.setItem(AI_LOCAL_KEY, JSON.stringify(persistable));
    sessionStorage.removeItem(AI_SESSION_KEY);
  } else {
    sessionStorage.setItem(AI_SESSION_KEY, JSON.stringify(persistable));
    localStorage.removeItem(AI_LOCAL_KEY);
  }
}

function clearAiConfig() {
  sessionStorage.removeItem(AI_SESSION_KEY);
  localStorage.removeItem(AI_LOCAL_KEY);
}

function aiConfigured() {
  const cfg = loadAiConfig();
  return Boolean(cfg.apiKey && cfg.provider);
}

function openAiSettings() {
  const cfg = loadAiConfig();
  byId("ai-provider").value = cfg.provider || "deepseek";
  byId("ai-model").value = cfg.model || (cfg.provider === "openai" ? "gpt-4o-mini" : "deepseek-chat");
  byId("ai-key").value = cfg.apiKey || "";
  byId("ai-status").textContent = cfg.apiKey ? "Key in Session aktiv" : "Kein Key geladen";
  byId("ai-modal").showModal();
}

byId("assistant-settings").addEventListener("click", openAiSettings);
byId("assistant-ai-live").addEventListener("click", handleAiSpontan);
byId("ai-modal-close").addEventListener("click", () => byId("ai-modal").close());
byId("ai-modal-clear").addEventListener("click", () => {
  clearAiConfig();
  byId("ai-key").value = "";
  byId("ai-status").textContent = "Key gelöscht";
  showToast("KI-Key entfernt");
});
byId("ai-modal-save").addEventListener("click", () => {
  const cfg = {
    provider: byId("ai-provider").value,
    model: byId("ai-model").value.trim() || "deepseek-chat",
    apiKey: byId("ai-key").value.trim()
  };
  if (!cfg.apiKey) {
    showToast("Key fehlt");
    return;
  }
  // Legacy-Modal speichert in Session (Sicherheits-Default). Für dauerhaftes Speichern → Einstellungen-View.
  saveAiConfig(cfg, "session");
  byId("ai-status").textContent = "Key in Session aktiv (für dauerhaft → ⚙ Einstellungen)";
  showToast("KI gespeichert (Session)");
  byId("ai-modal").close();
});

async function callAi(systemPrompt, userPrompt) {
  const cfg = loadAiConfig();
  if (!cfg.apiKey) throw new Error("Kein KI-Key. ⚙ KI klicken.");
  const url = cfg.provider === "openai"
    ? "https://api.openai.com/v1/chat/completions"
    : "https://api.deepseek.com/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`KI-Fehler ${response.status}: ${text.slice(0, 200)}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "(leere Antwort)";
}

async function aiSimulateStephan(topic) {
  const systemPrompt = `Du spielst Stephan, Inhaber von HFK (Herr und Frau Klein), einem mittelgroßen E-Commerce mit JTL Wawi und JTL-Shop. Du bist pragmatisch, geschäftsfokussiert, manchmal skeptisch. Du stellst Mago (Digital Sales & Data Lead) genau EINE Frage, die du als Geschäftsführer wirklich stellen würdest. Nur die Frage, keine Einleitung, kein Kontext, kein Drumherum. Maximal 2 Sätze.`;
  const userPrompt = topic
    ? `Stelle eine Frage zum Thema: ${topic}.`
    : `Stelle eine spontane Frage aus dem HFK-Geschäftsalltag.`;
  return callAi(systemPrompt, userPrompt);
}

async function aiCritiqueAnswer(question, modelAnswer, userAnswer) {
  const systemPrompt = `Du bist ein erfahrener Coach für Geschäftsführer-Gespräche. Bewerte kurz (max 80 Wörter), ob Magos Antwort auf Stephans Frage stark genug ist. Vergleiche mit der Musterantwort. Sag konkret was fehlt oder gut ist. Kein Lob ohne Substanz.`;
  const userPrompt = `Frage: ${question}\n\nMusterantwort: ${modelAnswer || "(keine)"}\n\nMagos Antwort: ${userAnswer}`;
  return callAi(systemPrompt, userPrompt);
}

async function handleAiSpontan() {
  if (!aiConfigured()) {
    showToast("Erst KI-Key setzen (⚙ KI)");
    openAiSettings();
    return;
  }
  showToast("Stephan denkt nach…");
  try {
    const topic = assistantTopic !== "all" ? assistantTopic : null;
    const question = await aiSimulateStephan(topic);
    drillQueue = [{
      id: "ai-live-" + Date.now(),
      question,
      topic: topic || "Live",
      modelAnswer: "(KI-generiert — eigene Antwort formulieren)",
      talkingPoints: [],
      confidence: 0,
      source: "ai"
    }];
    drillIndex = 0;
    drillRevealed = false;
    drillFilter = topic;
    assistantMode = "drill";
    document.querySelectorAll("#assistant-mode button").forEach((b) => b.classList.toggle("active", b.dataset.mode === "drill"));
    setView("assistant");
  } catch (error) {
    showToast(error.message);
  }
}

document.querySelectorAll("#assistant-mode button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#assistant-mode button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    assistantMode = button.dataset.mode;
    if (assistantMode === "drill" && !drillQueue.length) {
      drillQueue = [];
    }
    renderAssistant();
  });
});

byId("assistant-topic").addEventListener("change", (event) => {
  assistantTopic = event.target.value;
  renderAssistant();
});

byId("assistant-search").addEventListener("input", (event) => {
  assistantSearch = event.target.value.trim().toLowerCase();
  renderAssistant();
});

byId("print-week").addEventListener("click", () => {
  document.body.classList.add("print-week");
  window.print();
  setTimeout(() => document.body.classList.remove("print-week"), 500);
});

// Boot: ERST von Server pullen (force=true), DANN setView - vermeidet Race wo
// setView->saveState localStorage-Stale-Daten auf Disk schreibt bevor sync laeuft.
(async () => {
  await syncFromServer(true);
  setView(location.hash?.slice(1) || "dashboard");
})();

window.addEventListener("hashchange", () => {
  setView(location.hash?.slice(1) || "dashboard");
});

updateOfflineIndicator();

// Realtime-Sync via Server-Sent Events
let sseConnection = null;
function startSseSync() {
  if (typeof EventSource === "undefined") return;
  try {
    sseConnection = new EventSource("/api/state/stream");
    sseConnection.addEventListener("state-updated", (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Eigene Updates ignorieren
        if (payload.clientId === MAGALOKO_CLIENT_ID) return;
        // Anderes Gerät / anderer Tab hat State geändert — re-sync
        const localUpdated = Number(state.updatedAt || 0);
        if (payload.updatedAt > localUpdated) {
          syncFromServer().then(() => showToast("Update aus anderem Gerät"));
        }
      } catch {}
    });
    sseConnection.onerror = () => {
      // Browser reconnected automatisch — kein Handling nötig
    };
  } catch (error) {
    console.warn("SSE-Verbindung fehlgeschlagen:", error);
  }
}
startSseSync();
if (hasPendingSave() && navigator.onLine) flushOfflineQueue();

// Service Worker registrieren
let deferredInstallPrompt = null;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then((reg) => {
    reg.addEventListener("updatefound", () => {
      const newSW = reg.installing;
      if (!newSW) return;
      newSW.addEventListener("statechange", () => {
        if (newSW.state === "installed" && navigator.serviceWorker.controller) {
          showToast("Update verfügbar — beim nächsten Reload aktiv");
        }
      });
    });
  }).catch((err) => console.warn("SW-Registrierung fehlgeschlagen:", err));
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  const btn = byId("install-app-btn");
  if (btn) btn.hidden = false;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  const btn = byId("install-app-btn");
  if (btn) btn.hidden = true;
  showToast("MAGALOKO als App installiert");
});

// Auth-Status laden und UI entsprechend setzen
fetch("/auth/status").then((r) => r.json()).then((s) => {
  if (s.authenticated) {
    byId("auth-status-label").textContent = `Eingeloggt als ${s.email}`;
    byId("logout-btn").hidden = false;
  } else if (s.requireAuth) {
    byId("auth-status-label").textContent = "Nicht eingeloggt";
  } else {
    byId("auth-status-label").textContent = "Lokal · ohne Auth";
  }
}).catch(() => {});

byId("quick-add-fab").addEventListener("click", () => openQuickAdd(null));
byId("daily-generate").addEventListener("click", () => generateDailyBriefing(true));

// Time-Tracking
byId("pomodoro-start").addEventListener("click", () => {
  if (!byId("pomodoro-task").value.trim()) { showToast("Bitte Aufgabe eintragen"); return; }
  pomodoroStart_();
});
byId("pomodoro-stop").addEventListener("click", () => pomodoroStop(false));

// Team
byId("team-search").addEventListener("input", (e) => { teamSearch = e.target.value.trim().toLowerCase(); renderTeam(); });

// Monatsbericht
byId("monthly-month-picker").addEventListener("change", (e) => { monthlySelectedMonth = e.target.value; renderMonthly(); });
byId("monthly-generate").addEventListener("click", () => renderMonthly());
byId("monthly-print").addEventListener("click", () => {
  document.body.classList.add("print-monthly");
  window.print();
  setTimeout(() => document.body.classList.remove("print-monthly"), 500);
});
byId("monthly-send-mail").addEventListener("click", async () => {
  const stephanMail = state.team.find((p) => p.id === "p-stephan")?.mail || "";
  const to = prompt("An welche Mail senden?", stephanMail);
  if (!to) return;
  const subject = `MAGALOKO Monatsbericht ${monthlySelectedMonth}`;
  const html = byId("monthly-report").outerHTML;
  try {
    const response = await fetch("/api/mail/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html, source: "monthly-report" })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Mail-Fehler");
    showToast("Monatsbericht versendet");
  } catch (error) {
    showToast(error.message);
  }
});

// Honorar
byId("honorar-edit").addEventListener("click", openHonorarConditionsEdit);
byId("honorar-create-invoice").addEventListener("click", openInvoiceCreate);
byId("sebo-edit-config").addEventListener("click", openSeboConfigEdit);
const DASHBOARD_CARDS = [
  { id: "hero", label: "Hero-Focus (Heute zuerst)" },
  { id: "metrics", label: "4 Metrik-Karten oben" },
  { id: "reminders", label: "Smart Reminders" },
  { id: "vip", label: "VIP-Bestandsrisiko" },
  { id: "crosssell", label: "Cross-Selling Quickwins" },
  { id: "access", label: "Kritische Zugänge" },
  { id: "meeting", label: "Nächster Gesprächspunkt" },
  { id: "today", label: "Heute wichtig" },
  { id: "decisions", label: "Stephan-Entscheidungen" }
];

function applyDashboardPrefs() {
  const prefs = state.dashboardPrefs || { compactMode: false, hiddenCards: [] };
  const dash = byId("dashboard");
  if (!dash) return;
  dash.classList.toggle("compact-mode", prefs.compactMode);
  byId("dashboard-compact-toggle").classList.toggle("active", prefs.compactMode);

  const cardMap = {
    hero: byId("hero-focus"),
    metrics: dash.querySelector(".metric-grid"),
    reminders: byId("reminders-panel"),
    vip: byId("dashboard-vip")?.closest(".panel"),
    crosssell: byId("dashboard-crosssell")?.closest(".panel"),
    access: byId("critical-access")?.closest(".panel"),
    meeting: byId("next-meeting")?.closest(".panel"),
    today: byId("today-list")?.closest(".panel"),
    decisions: byId("decision-list")?.closest(".panel")
  };
  Object.entries(cardMap).forEach(([id, el]) => {
    if (el) el.style.display = prefs.hiddenCards.includes(id) ? "none" : "";
  });
}

function openDashboardPersonalize() {
  const prefs = state.dashboardPrefs;
  byId("edit-modal-title").textContent = "Dashboard anpassen";
  byId("edit-modal-fields").innerHTML = `
    <p class="muted" style="margin:0;">Buch-Prinzip Wexler Kap. 32: wenn etwas immer grün ist oder nie angeschaut wird → ausblenden.</p>
    <label style="display:flex;align-items:center;gap:10px;text-transform:none;letter-spacing:0;font-weight:600;">
      <input type="checkbox" id="pref-compact" ${prefs.compactMode ? "checked" : ""} />
      Compact-Mode (alle Karten ohne Warnung werden gedimmt)
    </label>
    <p class="muted" style="margin:14px 0 6px;font-weight:800;font-size:11px;letter-spacing:0.04em;text-transform:uppercase;">Karten ausblenden</p>
    <div style="display:grid;gap:6px;">
      ${DASHBOARD_CARDS.map((c) => `
        <label style="display:flex;align-items:center;gap:10px;font-weight:500;text-transform:none;letter-spacing:0;">
          <input type="checkbox" data-hide-card="${c.id}" ${prefs.hiddenCards.includes(c.id) ? "checked" : ""} />
          ${escapeHtml(c.label)} ausblenden
        </label>
      `).join("")}
    </div>
  `;
  const form = byId("edit-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    prefs.compactMode = byId("pref-compact").checked;
    prefs.hiddenCards = Array.from(document.querySelectorAll("[data-hide-card]"))
      .filter((c) => c.checked)
      .map((c) => c.dataset.hideCard);
    saveState();
    applyDashboardPrefs();
    byId("edit-modal").close();
    showToast("Dashboard angepasst");
  };
  byId("edit-modal").showModal();
}

byId("dashboard-compact-toggle").addEventListener("click", () => {
  state.dashboardPrefs.compactMode = !state.dashboardPrefs.compactMode;
  saveState();
  applyDashboardPrefs();
});
byId("dashboard-personalize").addEventListener("click", openDashboardPersonalize);

// Sidebar-Collapse (persistiert)
function applySidebarCollapse(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  try { localStorage.setItem("magaloko:sidebar-collapsed", collapsed ? "1" : "0"); } catch {}
  const btn = byId("sidebar-collapse-toggle");
  if (btn) btn.textContent = collapsed ? "›" : "‹";
}
const collapsedInit = (() => { try { return localStorage.getItem("magaloko:sidebar-collapsed") === "1"; } catch { return false; } })();
applySidebarCollapse(collapsedInit);
byId("sidebar-collapse-toggle").addEventListener("click", () => {
  applySidebarCollapse(!document.body.classList.contains("sidebar-collapsed"));
});

// Density-Toggle (persistiert)
function applyDensity(dense) {
  document.body.classList.toggle("density-dense", dense);
  try { localStorage.setItem("magaloko:density", dense ? "dense" : "cozy"); } catch {}
  const btn = byId("dashboard-density-toggle");
  if (btn) btn.classList.toggle("active", dense);
}
const denseInit = (() => { try { return localStorage.getItem("magaloko:density") === "dense"; } catch { return false; } })();
applyDensity(denseInit);
byId("dashboard-density-toggle")?.addEventListener("click", () => {
  applyDensity(!document.body.classList.contains("density-dense"));
});

byId("risk-status-filter").addEventListener("change", (e) => { riskStatusFilter = e.target.value; renderRisks(); });
byId("decision-search").addEventListener("input", (e) => { decisionSearch = e.target.value.trim().toLowerCase(); renderDecisions(); });

byId("vendor-search").addEventListener("input", (e) => { vendorSearch = e.target.value.trim().toLowerCase(); renderVendors(); });
byId("vendor-category-filter").addEventListener("change", (e) => { vendorCategoryFilter = e.target.value; renderVendors(); });
byId("pitch-search").addEventListener("input", (e) => { pitchSearch = e.target.value.trim().toLowerCase(); renderPitches(); });
byId("pitch-from-lever").addEventListener("click", pitchFromTopLever);
byId("glossary-search").addEventListener("input", (e) => { glossarySearch = e.target.value.trim().toLowerCase(); renderGlossary(); });
byId("competitor-search").addEventListener("input", (e) => { competitorSearch = e.target.value.trim().toLowerCase(); renderCompetitors(); });
byId("competitor-threat-filter").addEventListener("change", (e) => { competitorThreatFilter = e.target.value; renderCompetitors(); });
byId("hypothesis-status-filter").addEventListener("change", (e) => { hypothesisStatusFilter = e.target.value; renderHypotheses(); });
byId("wirkung-quartal-filter").addEventListener("change", (e) => { wirkungQuartalFilter = e.target.value; renderWirkungen(); });
byId("wirkung-generate-report").addEventListener("click", generateWirkungenReport);
byId("saison-filter").addEventListener("change", (e) => { saisonFilter = e.target.value; renderSaisonplan(); });
byId("saison-ai").addEventListener("click", generateSaisonAiVorschlag);
byId("verhandlung-status-filter").addEventListener("change", (e) => { verhandlungStatusFilter = e.target.value; renderVerhandlungen(); });
byId("verhandlung-ai").addEventListener("click", generateVerhandlungArgumente);
byId("capture-status-filter").addEventListener("change", (e) => { captureStatusFilter = e.target.value; renderCapture(); });
byId("capture-add").addEventListener("click", () => {
  const text = prompt("Inhalt (Notiz, Mail-Auszug, Sprach-Transkript):");
  if (!text || !text.trim()) return;
  state.captureInbox.unshift({
    id: uid("cap"), source: "manual", subject: text.slice(0, 60), text: text.trim(),
    sender: "", sentAt: new Date().toISOString(), receivedAt: new Date().toISOString(),
    processed: false, parsedKind: null, parsedRefId: null
  });
  saveState(); renderCapture(); showToast("In Inbox");
});
byId("capture-voice").addEventListener("click", () => byId("capture-voice-file").click());
byId("capture-voice-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 15 * 1024 * 1024) { showToast("Datei zu groß (max 15 MB)"); return; }
  if (!aiConfigured()) {
    showToast("Datei lokal hinzugefügt — Transkription bräuchte KI-Setup");
    const arrayBuffer = await file.arrayBuffer();
    const sizeMb = (arrayBuffer.byteLength / 1024 / 1024).toFixed(1);
    state.captureInbox.unshift({
      id: uid("cap"), source: "voice", subject: file.name, text: `(Sprachdatei: ${file.name}, ${sizeMb} MB — Transkription ausstehend. KI-Key setzen + Web-Speech nutzen, oder externes Whisper-Tool.)`,
      sender: "", sentAt: new Date().toISOString(), receivedAt: new Date().toISOString(),
      processed: false, parsedKind: null, parsedRefId: null
    });
    saveState(); renderCapture();
    event.target.value = "";
    return;
  }
  showToast("Sprache-Transkription via Browser-Whisper-API noch nicht integriert — bitte transkribieren und manuell einfügen, oder Web-Speech im Quick-Add nutzen");
  event.target.value = "";
});

byId("trigger-run-now").addEventListener("click", () => runAllTriggers(true));

// Karriere
byId("career-edit-vision").addEventListener("click", openCareerVisionEdit);
byId("career-coach-ai").addEventListener("click", generateCareerCoaching);

// Portfolio
byId("portfolio-anonymize-ai").addEventListener("click", generatePortfolioAnonymization);
byId("portfolio-export").addEventListener("click", exportPortfolioPublic);

// Mentor
byId("mentor-search").addEventListener("input", (e) => { mentorSearch = e.target.value.trim().toLowerCase(); renderMentors(); });
byId("mentor-search-ai").addEventListener("click", generateMentorSearch);

// Lerneinträge
byId("learning-status-filter").addEventListener("change", (e) => { learningStatusFilter = e.target.value; renderLearnings(); });
byId("learning-type-filter").addEventListener("change", (e) => { learningTypeFilter = e.target.value; renderLearnings(); });

// Energie
byId("energy-quick-add").addEventListener("click", quickAddEnergyEntry);

// Graph
byId("graph-focus").addEventListener("change", (e) => { graphFocus = e.target.value; renderGraph(); });
byId("graph-refresh").addEventListener("click", () => renderGraph());

// Recap
byId("recap-generate").addEventListener("click", generateJahresRecap);
byId("recap-print").addEventListener("click", () => {
  document.body.classList.add("print-monthly"); // reuse Print-CSS
  window.print();
  setTimeout(() => document.body.classList.remove("print-monthly"), 500);
});
byId("recap-send-mail").addEventListener("click", async () => {
  const mailEl = state.team?.find((p) => p.id === "p-stephan")?.mail || prompt("Mail-Adresse?");
  if (!mailEl) return;
  const text = byId("recap-output").textContent;
  if (!text || text.length < 50) { showToast("Erst Recap generieren"); return; }
  try {
    const response = await fetch("/api/mail/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: mailEl, subject: `MAGALOKO Jahres-Recap ${byId("recap-year").value}`, text, source: "year-recap" })
    });
    if (!response.ok) throw new Error("Mail-Fehler");
    showToast("Recap versendet");
  } catch (error) { showToast(error.message); }
});

// Trigger automatisch beim ersten Render einmal evaluieren (ohne zu feuern)
setTimeout(() => renderTriggers(), 1500);
byId("glossary-category-filter").addEventListener("change", (e) => { glossaryCategoryFilter = e.target.value; renderGlossary(); });

byId("audit-event-filter").addEventListener("change", (e) => { auditEventFilter = e.target.value; renderAudit(); });
byId("audit-reload").addEventListener("click", async () => { await loadAudit(); renderAudit(); });

byId("usage-reset").addEventListener("click", () => {
  if (!confirm("Alle Nutzungs-Zähler zurücksetzen?")) return;
  state.viewUsage = {};
  saveState(); renderUsage();
  showToast("Zähler zurückgesetzt");
});
byId("quick-add-close").addEventListener("click", () => byId("quick-add-modal").close());

// Globale Suche
const searchInput = byId("search-input");
searchInput.addEventListener("input", (event) => {
  searchSelectedIndex = 0;
  lastSearchResults = buildSearchIndex(event.target.value);
  renderSearchResults(lastSearchResults);
});
byId("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (lastSearchResults[searchSelectedIndex]) jumpToSearchResult(lastSearchResults[searchSelectedIndex]);
});
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    searchSelectedIndex = Math.min(searchSelectedIndex + 1, lastSearchResults.length - 1);
    renderSearchResults(lastSearchResults);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    searchSelectedIndex = Math.max(searchSelectedIndex - 1, 0);
    renderSearchResults(lastSearchResults);
  }
});

// Globale Shortcuts
window.addEventListener("keydown", (event) => {
  // Ignoriere Shortcuts in Input-Feldern (außer Suche selbst)
  const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
  const isSearchInput = event.target.id === "search-input";
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
    return;
  }
  if (event.key === "q" && !inField && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    openQuickAdd(null);
    return;
  }
  if (event.key === "Escape") {
    if (byId("search-overlay").open) byId("search-overlay").close();
  }
});

// ============================================================
// Lokale Notifications (via Service Worker)
// ============================================================

const NOTIFIED_KEY = "magaloko:notified:v1";

function getNotifiedSet() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "[]")); }
  catch { return new Set(); }
}

function saveNotifiedSet(set) {
  try {
    const arr = Array.from(set).slice(-100); // max 100 IDs behalten
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
  } catch {}
}

async function showNotification(title, body, tag) {
  if (Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag,
      vibrate: [200, 100, 200],
      data: { url: "/" }
    });
  } catch (error) {
    new Notification(title, { body, icon: "/icon.svg" });
  }
}

async function checkRemindersAndNotify() {
  if (Notification.permission !== "granted") return;
  const highPrio = computeSmartReminders().filter((r) => r.priority === "hoch");
  if (!highPrio.length) return;
  const notified = getNotifiedSet();
  for (const r of highPrio.slice(0, 3)) {
    if (notified.has(r.id)) continue;
    await showNotification("MAGALOKO", r.text, r.id);
    notified.add(r.id);
  }
  saveNotifiedSet(notified);
}

function updateNotifyButton() {
  const toggleBtn = byId("notify-toggle-btn");
  const testBtn = byId("notify-test-btn");
  if (!toggleBtn) return;
  const perm = Notification.permission;
  if (perm === "granted") {
    toggleBtn.textContent = "🔔 Notifications aktiv (klicke zum Test)";
    testBtn.hidden = false;
  } else if (perm === "denied") {
    toggleBtn.textContent = "🔕 Im Browser blockiert";
    toggleBtn.disabled = true;
    testBtn.hidden = true;
  } else {
    toggleBtn.textContent = "🔔 Notifications aktivieren";
    testBtn.hidden = true;
  }
}

byId("notify-toggle-btn").addEventListener("click", async () => {
  if (!("Notification" in window)) {
    showToast("Notifications nicht unterstützt");
    return;
  }
  if (Notification.permission === "granted") {
    await showNotification("MAGALOKO", "Notifications funktionieren ✓", "test");
    return;
  }
  const permission = await Notification.requestPermission();
  updateNotifyButton();
  if (permission === "granted") {
    showToast("Notifications aktiviert — du bekommst Erinnerungen für hochpriore Themen");
    await showNotification("MAGALOKO", "Du bekommst jetzt Erinnerungen für überfällige Versprechen und VIP-Risiken.", "welcome");
    checkRemindersAndNotify();
  } else {
    showToast("Erlaubnis abgelehnt");
  }
});

byId("notify-test-btn").addEventListener("click", async () => {
  const reminders = computeSmartReminders();
  if (!reminders.length) {
    await showNotification("MAGALOKO", "Test-Notification: alles ruhig im System ✓", "test");
  } else {
    const top = reminders[0];
    await showNotification("MAGALOKO · " + top.priority.toUpperCase(), top.text, "test-" + Date.now());
  }
  showToast("Test-Notification gesendet");
});

// Beim Start + alle 5 Min checken
if ("Notification" in window) {
  updateNotifyButton();
  setTimeout(checkRemindersAndNotify, 3000);
  setInterval(checkRemindersAndNotify, 5 * 60 * 1000);
}

byId("stephan-link-copy").addEventListener("click", async () => {
  try {
    const response = await fetch("/api/stephan-link");
    const data = await response.json();
    if (!data.url) { showToast("Kein Stephan-Link verfügbar"); return; }
    await copyText(data.url, "Stephan-Link kopiert");
  } catch (error) {
    showToast("Link-Fehler: " + error.message);
  }
});

byId("install-app-btn").addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    showToast("Install bereits genutzt oder via Browser-Menü möglich");
    return;
  }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === "accepted") deferredInstallPrompt = null;
});

byId("logout-btn").addEventListener("click", async () => {
  if (!confirm("Wirklich abmelden?")) return;
  try {
    await fetch("/auth/logout", { method: "POST" });
  } catch {}
  location.href = "/login.html";
});

// === Workspace-Chip wiring ===
byId("workspace-chip")?.addEventListener("click", () => setView("home"));

// Beim Boot: Workspace-UI anwenden + auf Home starten falls noch nie ein Workspace gewählt
(function workspaceBoot() {
  applyWorkspaceUI();
  // Wenn URL keinen Hash hat → Home zeigen (Projekt-Picker), sonst Hash respektieren
  if (!location.hash || location.hash === "#" || location.hash === "#dashboard") {
    // Default-Verhalten beibehalten: dashboard (nur User der das schon kennt sieht direkt seinen Kontext)
    // Aber: wenn currentWorkspace noch nicht explizit gespeichert wurde, lieber zur Home leiten
    if (!localStorage.getItem("magaloko:workspace-picked")) {
      setTimeout(() => setView("home"), 0);
    }
  }
})();

// Sobald jemand einen Workspace via Card wählt → merken dass er das schon mal gemacht hat
const _origSwitchWorkspace = switchWorkspace;
window.switchWorkspace = function(id) {
  const ok = _origSwitchWorkspace(id);
  if (ok) localStorage.setItem("magaloko:workspace-picked", "1");
  return ok;
};

// === Team-Notizen Wiring ===
byId("tn-add")?.addEventListener("click", addTeamNote);
byId("tn-text")?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addTeamNote(); } });
byId("tn-filter")?.addEventListener("change", (e) => { tnFilter = e.target.value; renderTeamNotizen(); });
byId("tn-show-done")?.addEventListener("change", (e) => { tnShowDone = e.target.checked; renderTeamNotizen(); });

// === Stephan-PA Wiring ===
byId("sk-add-slot")?.addEventListener("click", () => openEdit("stephanSlot", null));
byId("sd-add")?.addEventListener("click", () => openEdit("stephanDecision", null));
byId("sd-filter")?.addEventListener("change", (e) => { sdFilter = e.target.value; renderStephanDecisions(); });

// === Akademie Wiring ===
document.querySelectorAll(".ak-tab-btn").forEach((b) => {
  b.addEventListener("click", () => akSwitchTab(b.dataset.akTab));
});
byId("ak-add-service")?.addEventListener("click", () => openEdit("consultingService", null));
byId("ak-add-persona")?.addEventListener("click", () => openEdit("salesPersona", null));
byId("ak-add-objection")?.addEventListener("click", () => openEdit("salesObjection", null));
byId("ak-add-scenario")?.addEventListener("click", () => openEdit("trainingScenario", null));
byId("ak-add-staff-training")?.addEventListener("click", () => openEdit("staffTrainingEntry", null));
byId("ak-objection-filter")?.addEventListener("change", (e) => { akObjectionFilter = e.target.value; renderAkObjections(); });
byId("ak-drill-marke-filter")?.addEventListener("change", (e) => { akDrillMarkeFilter = e.target.value; renderAkDrills(); });
byId("ak-rp-schwierigkeit")?.addEventListener("change", (e) => { akRpSchwierigkeit = e.target.value; renderAkRoleplays(); });
byId("ak-rp-close")?.addEventListener("click", () => { byId("ak-rp-runner").close(); akRpState = null; });
byId("ak-rp-next")?.addEventListener("click", akRpAdvance);
byId("ak-rp-back")?.addEventListener("click", akRpBack);
byId("ak-drill-random")?.addEventListener("click", () => {
  const drills = state.akademieDrills || [];
  if (!drills.length) { showToast("Keine Drills"); return; }
  const pool = akDrillMarkeFilter === "all" ? drills : drills.filter((d) => d.marke === akDrillMarkeFilter);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick) startAkDrill(pick.id);
});
byId("ak-runner-close")?.addEventListener("click", () => byId("ak-scenario-runner").close());
byId("ak-runner-back")?.addEventListener("click", () => {
  if (!akRunnerState) return;
  if (akRunnerState.stepIdx > 0) {
    akRunnerState.stepIdx--;
    akRunnerState.answers.pop();
    renderAkRunnerStep();
  }
});
byId("ak-runner-next")?.addEventListener("click", () => {
  if (!akRunnerState) return;
  const total = (akRunnerState.scenario.steps || []).length;
  if (akRunnerState.stepIdx >= total) {
    byId("ak-scenario-runner").close();
    akRunnerState = null;
    return;
  }
  if (akRunnerState.answers[akRunnerState.stepIdx] === undefined) {
    showToast("Bitte Antwort wählen");
    return;
  }
  akRunnerState.stepIdx++;
  renderAkRunnerStep();
});

// === Marktanalyse Wiring ===
document.querySelectorAll(".ma-section-btn[data-ma-sec]").forEach((btn) => {
  btn.addEventListener("click", () => loadMaSection(btn.dataset.maSec));
});

// === Lernsystem Wiring ===
document.querySelectorAll(".ma-section-btn[data-ls-sec]").forEach((btn) => {
  btn.addEventListener("click", () => loadLsSection(btn.dataset.lsSec));
});

// === Order-Intake Wiring ===
byId("order-intake-new")?.addEventListener("click", () => openOrderIntakeModal(null));
byId("order-intake-close")?.addEventListener("click", () => byId("order-intake-modal").close());
byId("order-intake-cancel")?.addEventListener("click", () => byId("order-intake-modal").close());
byId("order-intake-save")?.addEventListener("click", saveOrderIntakeFromForm);
byId("order-intake-delete")?.addEventListener("click", deleteOrderIntake);
byId("order-add-row")?.addEventListener("click", () => addOrderItemRow({ qty: 1, name: "", price: 0 }));
byId("order-intake-filter")?.addEventListener("change", (e) => { orderIntakeFilter = e.target.value; renderOrdersIntake(); });

// === Settings Wiring ===
byId("settings-ai-save")?.addEventListener("click", () => {
  const cfg = {
    provider: byId("settings-ai-provider").value,
    model: byId("settings-ai-model").value.trim() || (byId("settings-ai-provider").value === "openai" ? "gpt-4o-mini" : "deepseek-chat"),
    apiKey: byId("settings-ai-key").value.trim()
  };
  if (!cfg.apiKey) { showToast("Key fehlt"); return; }
  const storage = byId("settings-ai-persist").value === "local" ? "local" : "session";
  saveAiConfig(cfg, storage);
  renderSettings();
  showToast(storage === "local" ? "KI-Key dauerhaft auf diesem Gerät gespeichert" : "KI-Key in Session gespeichert");
});

byId("settings-ai-clear")?.addEventListener("click", () => {
  if (!confirm("KI-Key wirklich löschen (Session + Gerät)?")) return;
  clearAiConfig();
  if (byId("settings-ai-key")) byId("settings-ai-key").value = "";
  renderSettings();
  showToast("KI-Key entfernt");
});

byId("settings-density-toggle")?.addEventListener("change", (e) => {
  const on = e.target.checked;
  document.body.classList.toggle("density-dense", on);
  try { localStorage.setItem("magaloko:density", on ? "dense" : "cozy"); } catch {}
});

byId("settings-sidebar-toggle")?.addEventListener("change", (e) => {
  const on = e.target.checked;
  document.body.classList.toggle("sidebar-collapsed", on);
  try { localStorage.setItem("magaloko:sidebar-collapsed", on ? "1" : "0"); } catch {}
});

byId("settings-playbook-add")?.addEventListener("click", () => {
  const list = byId("settings-playbook-list");
  if (!list) return;
  const idx = list.querySelectorAll(".settings-playbook-row").length;
  const row = document.createElement("div");
  row.className = "settings-playbook-row";
  row.dataset.idx = String(idx);
  row.innerHTML = `
    <input class="row-time" type="text" value="12:00" placeholder="HH:MM" />
    <input class="row-icon" type="text" value="•" placeholder="⚡" />
    <div class="row-cell-stack">
      <input class="row-title" type="text" value="" placeholder="Schritt-Titel" />
      <textarea class="row-desc" placeholder="Kurze Beschreibung"></textarea>
    </div>
    <select class="row-view">${VIEW_OPTIONS_FOR_PLAYBOOK.map((v) => `<option value="${v}" ${v === "dashboard" ? "selected" : ""}>${v}</option>`).join("")}</select>
    <button class="remove-btn" type="button" title="Schritt entfernen">×</button>
  `;
  row.querySelector(".remove-btn").addEventListener("click", () => row.remove());
  list.appendChild(row);
  row.querySelector(".row-title")?.focus();
});

byId("settings-playbook-save")?.addEventListener("click", () => {
  const steps = collectPlaybookFromEditor();
  if (!steps.length) { showToast("Keine Schritte"); return; }
  state.playbookSteps = steps;
  saveState();
  renderToday();
  showToast(`${steps.length} Schritte gespeichert`);
});

byId("settings-playbook-reset-default")?.addEventListener("click", () => {
  if (!confirm("Playbook auf die 7 Default-Schritte zurücksetzen?")) return;
  delete state.playbookSteps;
  saveState();
  renderPlaybookEditor();
  renderToday();
  showToast("Default-Playbook wiederhergestellt");
});

byId("settings-backup-download")?.addEventListener("click", () => byId("export-json")?.click());
byId("settings-backup-import")?.addEventListener("click", () => byId("import-json")?.click());
byId("settings-seed-reset")?.addEventListener("click", () => byId("reset-seed")?.click());

// === Heute + Kalender Toolbar-Wiring ===
byId("today-reset")?.addEventListener("click", () => {
  if (!confirm("Playbook-Status für heute zurücksetzen?")) return;
  if (state.playbookStatus) delete state.playbookStatus[todayIso()];
  saveState();
  renderToday();
});

byId("calendar-prev")?.addEventListener("click", () => {
  calendarMonth.m -= 1;
  if (calendarMonth.m < 0) { calendarMonth.m = 11; calendarMonth.y -= 1; }
  renderCalendar();
});

byId("calendar-next")?.addEventListener("click", () => {
  calendarMonth.m += 1;
  if (calendarMonth.m > 11) { calendarMonth.m = 0; calendarMonth.y += 1; }
  renderCalendar();
});

byId("calendar-today")?.addEventListener("click", () => {
  const d = new Date();
  calendarMonth = { y: d.getFullYear(), m: d.getMonth() };
  calendarSelectedDate = todayIso();
  renderCalendar();
});

byId("calendar-add")?.addEventListener("click", () => {
  const presetDate = calendarSelectedDate || todayIso();
  openEdit("event", null);
  setTimeout(() => {
    const dateInput = byId("edit-modal")?.querySelector('input[name="date"]');
    if (dateInput && !dateInput.value) dateInput.value = presetDate;
  }, 50);
});

byId("calendar-day-add")?.addEventListener("click", () => {
  const presetDate = calendarSelectedDate || todayIso();
  openEdit("event", null);
  setTimeout(() => {
    const dateInput = byId("edit-modal")?.querySelector('input[name="date"]');
    if (dateInput && !dateInput.value) dateInput.value = presetDate;
  }, 50);
});

// 401-Auto-Redirect: wenn API-Aufruf wegen abgelaufener Session 401 zurückkommt → Login
const originalFetch = window.fetch;
window.fetch = async function(input, init) {
  const response = await originalFetch(input, init);
  const url = typeof input === "string" ? input : input.url;
  if (response.status === 401 && url.startsWith("/api/")) {
    showToast("Session abgelaufen — Login erneut nötig");
    setTimeout(() => { location.href = "/login.html"; }, 1500);
  }
  return response;
};
