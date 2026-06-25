export type Tone = "muted" | "accent" | "green" | "amber" | "red" | "teal";

export const SEBO_V2 = {
  documents: [
    {
      title: "SeBo Service Bot Konzept v2.0",
      path: "C:/Users/Mo/Downloads/Telegram Desktop/HFK_SEBO_Konzept_v2.pdf",
      date: "24.06.2026 14:32",
      pages: 10,
    },
    {
      title: "SeBo Technischer Anhang fuer Mago v2.0",
      path: "C:/Users/Mo/Downloads/Telegram Desktop/HFK_SEBO_Anhang_Mago_v2.pdf",
      date: "24.06.2026 16:49",
      pages: 8,
    },
  ],
  mission: {
    title: "SeBo v2 sauber uebernehmen, v1 fuer 5k abschliessen, neues Projekt kontrolliert starten",
    summary:
      "SeBo v2 ist kein weiterer Mail-Prompt, sondern ein persistentes Case-Management-System fuer Kundenkommunikation. Mago muss den bestehenden v1-Auftrag sauber abgrenzen, die Lieferfaehigkeit pruefen und mit Stephan den neuen Scope als eigenes Projekt planen.",
    guardrail:
      "Der 5k-Auftrag fuer SeBo v1 darf nicht still in v2 aufgehen. Erst Abnahme-/Restumfang klaeren, dann v2 als neuen Auftrag mit eigener Architektur, Meilensteinen und Verantwortlichkeiten starten.",
  },
  pillars: [
    {
      title: "v1-Abschluss sichern",
      tone: "amber" as Tone,
      points: [
        "Ist-Stand von Dadakaev Labs einholen: Code, Flows, Deployments, offene Punkte, bekannte Bugs.",
        "Gegen den bezahlten 5k-Scope pruefen: Was ist geliefert, was fehlt, was ist Change Request.",
        "Abnahme-Kriterien fuer v1 formulieren und mit Stephan bestaetigen.",
      ],
    },
    {
      title: "v2 als neues Projekt rahmen",
      tone: "accent" as Tone,
      points: [
        "v2 bedeutet stateless zu stateful: cases, contacts, reminders, Statusmigration, Tages-Summary.",
        "DB-Entscheidung vorbereiten: Postgres One-Source vs. getrennte Supabase-Instanz.",
        "Scope, Budget, Meilensteine und Rollen nicht aus v1 ableiten, sondern neu festlegen.",
      ],
    },
    {
      title: "Mago-Rolle klaeren",
      tone: "teal" as Tone,
      points: [
        "Mago uebernimmt fachliche Steuerung, Architektur-Review, Uebergabe und Qualitaetssicherung.",
        "Dadakaev Labs bleibt naheliegender Umsetzungspartner, weil v1 dort gebaut wurde.",
        "Mago muss Stephan entscheidungsfaehig machen: Optionen, Risiken, naechster sinnvoller Schritt.",
      ],
    },
  ],
  architecture: [
    { label: "KI-Layer", detail: "classify_email und generate_response mit case_history, Statusvorschlag, Fallbezug und Follow-up." },
    { label: "Case-Management", detail: "Persistenz fuer cases, contacts, reminders, Status-Tracking, Thread-Verknuepfung und Eskalation." },
    { label: "Kanal-Layer", detail: "Outlook per Power Automate, Telefonnotizen manuell, WhatsApp manuell oder Business API in Phase 2." },
  ],
  statusModel: [
    "01_Offen",
    "02_Rueckfrage",
    "03_Wartet_auf_Hersteller",
    "04_Ersatzteil_bestellt",
    "05_Kunde_informiert",
    "90_Erledigt",
  ],
  v1Collisions: [
    "v1 ist stateless, v2 braucht Persistenz und Fallgedaechtnis.",
    "v1-Status 03_Wartet_auf_Kunde kollidiert mit v2-Status 03_Wartet_auf_Hersteller.",
    "Power-Automate-Flows muessen strikt mit SEBO_ prefix getrennt werden, keine geteilten VIPA-Flows.",
    "JTL darf nicht direkt an den SeBo-Kern gekoppelt werden; JTL-Daten nur ueber One-Source/Postgres.",
    "Rollout auf weitere Nutzer erst nach Kanal- und Persistenz-Architektur.",
  ],
  milestones: [
    {
      id: "M0",
      title: "v1 Due Diligence und 5k-Abschluss",
      owner: "Mago",
      deliverables: ["Ist-Stand", "Scope-Abgleich", "Abnahmeliste", "Rest-/Change-Request-Liste"],
    },
    {
      id: "M1",
      title: "Persistenz-Schicht",
      owner: "Dadakaev Labs + Mago Review",
      deliverables: ["DB-Schema", "Migration v1 zu v2", "README", "Snapshot offener Faelle"],
    },
    {
      id: "M2",
      title: "KI-Layer v2",
      owner: "Dadakaev Labs",
      deliverables: ["classify_email", "generate_response", "case_history-Support", "Test-Cases"],
    },
    {
      id: "M3",
      title: "Power Automate Flows",
      owner: "Dadakaev Labs + HFK IT",
      deliverables: ["SEBO_MailTrigger", "SEBO_ReminderEngine", "Flow-Export", "Test-Protokoll"],
    },
    {
      id: "M4",
      title: "Vorerfassung Phase 1",
      owner: "Mago",
      deliverables: ["Outlook-Templates pro Kategorie", "Pflichtfelder", "Service-Inbox-Test"],
    },
    {
      id: "M5",
      title: "Web-Formular Phase 2",
      owner: "Neuer v2-Projektscope",
      deliverables: ["React PWA", "Foto-Upload", "SEBO_ManualCapture", "Kategorie-Routing"],
    },
  ],
  nextTasks: [
    {
      title: "SeBo v1 Stand von Dadakaev Labs anfordern",
      owner: "Mago",
      priority: "hoch",
      reason: "Ohne Ist-Stand kann der 5k-Auftrag nicht sauber abgenommen oder abgegrenzt werden.",
    },
    {
      title: "Stephan-Planungscall vorbereiten",
      owner: "Mago",
      priority: "hoch",
      reason: "Stephan braucht Entscheidungen zu DB, Scope, Abnahme v1, v2-Budget und Rollen.",
    },
    {
      title: "v2 Architekturentscheidung vorbereiten",
      owner: "Mago",
      priority: "hoch",
      reason: "Postgres One-Source vs. getrennte Supabase-Instanz ist die zentrale Weichenstellung.",
    },
    {
      title: "Outlook-Templates fuer Vorerfassung entwerfen",
      owner: "Mago",
      priority: "mittel",
      reason: "Kann sofort Wert liefern, bevor PWA und WhatsApp-Automation fertig sind.",
    },
  ],
  stephanQuestions: [
    "Was war exakt im 5k-SeBo-v1-Auftrag enthalten und was gilt als abnahmereif?",
    "Soll v2 bewusst als neues Projekt mit eigenem Budget und eigener Abnahme gestartet werden?",
    "Welche DB-Variante bevorzugt HFK: One-Source Postgres oder getrennte Supabase-SeBo-DB?",
    "Wer besitzt Power Automate, Service Inbox und Testzugang im HFK-Tenant?",
    "Welche drei Hersteller/Falltypen sind fuer Phase 3 spaeter am wichtigsten?",
    "Welche Reminder-Schwellenwerte gelten: X Tage Hersteller, Y Tage Kunde ohne Update?",
    "Welche Antworten darf SeBo nur vorbereiten, und was darf nach Freigabe automatisch raus?",
  ],
  handoverNeeds: [
    "Repo-Zugang oder ZIP fuer bestehenden SeBo-v1-Code",
    "Power-Automate-Flow-Exports von v1",
    "Service-Inbox-Testzugang oder Testdaten",
    "5-10 anonymisierte echte Kundenfaelle aus 2025",
    "Liste bekannter Bugs, offener TODOs und nicht umgesetzter v1-Anforderungen",
    "Claude/API-Konfiguration ohne Secrets in Code oder Dokumenten",
    "Onboarding-Call mit Stephan, Mago und Dadakaev Labs vor erstem v2-Commit",
  ],
};
