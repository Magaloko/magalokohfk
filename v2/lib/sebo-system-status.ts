export type SystemTone = "muted" | "accent" | "green" | "amber" | "red" | "teal";

export const SEBO_SYSTEM_STATUS = {
  source: "Amok AI Gesamtdokumentation SeBo & MasterMind, Stand 26.06.2026",
  updatedLabel: "Stand: 26.06.2026",
  mission: {
    title: "SeBo ist das operative Gesamtsystem fuer HFK",
    summary:
      "SeBo buendelt JTL-Analytics-Sync, Einkaufsplaner, v2.0 Case-Management, Treasury/Cashflow und weitere Module wie Billing, VIPA und VEKTRA. Ziel ist ein datengetriebenes Dashboard, das Stephan konsistente Entscheidungen ueber Einkauf, Service, Liquiditaet und operative Steuerung ermoeglicht.",
    guardrail:
      "Keine Container-Restarts oder Deploys waehrend laufendem JTL-Sync ohne explizites Go. Additiv arbeiten, Feature-Flags fuer v2.0-Funktionen nutzen und vor Commit npx tsc --noEmit ausfuehren.",
  },
  modules: [
    {
      key: "jtl-sync",
      name: "JTL-Analytics-Sync",
      status: "80-85 %",
      tone: "amber" as SystemTone,
      purpose: "Datengrundlage aus JTL-Wawi in sebo.analytics_*-Tabellen synchronisieren.",
      details: [
        "In-Memory Poller lib/jtl-poller.ts laeuft alle 5 Minuten.",
        "Produkte-Sync hat Prioritaet, Stand laut Dokumentation: Seite ca. 1521/9755.",
        "Wichtige Tabellen: analytics_products, analytics_sales, analytics_inventory_snapshots, analytics_customers, analytics_addresses, analytics_brands, analytics_suppliers.",
      ],
    },
    {
      key: "einkauf",
      name: "Einkaufsplaner",
      status: "P0 100 %",
      tone: "green" as SystemTone,
      purpose: "Bestellvorschlaege unter Budget-, DB1-, Marken- und OOS-Gesichtspunkten generieren.",
      details: [
        "Treasury-Order-Ampel, Brand-Budget nach DB1 und OOS-Schutz sind produktiv.",
        "P1/P2: Lieferzeit-Range offen, Kategorie-Regeln und Safety-Buffer teilweise, ML nur Python-POC.",
        "Optimizer-Aenderungen immer zusammen mit API und UI anfassen.",
      ],
    },
    {
      key: "case-management",
      name: "v2.0 Case-Management",
      status: "ca. 60 %",
      tone: "amber" as SystemTone,
      purpose: "Ticket- und Fall-Management mit KI-Unterstuetzung fuer E-Mail, WhatsApp und Telefon.",
      details: [
        "Neue Tabellen: sebo.messages, sebo.reminders, sebo.manufacturer_mappings, sebo.case_status_mapping.",
        "KI-Routen: /api/assistant/classify und /api/assistant/draft.",
        "Channel-Notizen, JTL-Kunden-Mapping und Feature-Flag-Admin sind als Immediate Features vorhanden.",
      ],
    },
    {
      key: "treasury",
      name: "Treasury / Cashflow",
      status: "Produktiv",
      tone: "green" as SystemTone,
      purpose: "Liquiditaet ueberwachen und grosse Bestellungen gegen Cashflow-Risiken pruefen.",
      details: [
        "Treasury-Order-Ampel ist als P0 im Einkaufsplaner integriert.",
        "Orders ab 2.000 EUR werden gegen Cashflow-Forecast/Ampel bewertet.",
      ],
    },
    {
      key: "more",
      name: "Weitere Module",
      status: "Teilweise",
      tone: "accent" as SystemTone,
      purpose: "Billing, VIPA, VEKTRA und Reminder-Engine als angrenzende operative Module.",
      details: [
        "Billing-Modul fuer Rechnungs- und Zahlungsfaelle ist in Entwicklung.",
        "VIPA und VEKTRA haben Basisfunktionen in der Magaloko-App.",
        "Reminder-Engine laeuft ueber /api/cron/reminders.",
      ],
    },
  ],
  mastermind: [
    { phase: "P0", topic: "Treasury-Order-Ampel", status: "Produktiv", tone: "green" as SystemTone, detail: "Orders >= 2.000 EUR gegen Cashflow-Forecast pruefen." },
    { phase: "P0", topic: "Brand-Budget nach DB1EUR", status: "Produktiv", tone: "green" as SystemTone, detail: "Budget pro Marke nach DB1-Beitrag der letzten 365 Tage." },
    { phase: "P0", topic: "OOS-Schutz", status: "Produktiv", tone: "green" as SystemTone, detail: "Priorisierung bei Unterschreitung des Sicherheitsbestands." },
    { phase: "P1.1", topic: "Historische Lieferzeit-Range", status: "Offen", tone: "red" as SystemTone, detail: "Min/Avg/Max Lieferzeit aus 12 Monaten." },
    { phase: "P1.2", topic: "Kategorie-Regeln", status: "Teilweise", tone: "amber" as SystemTone, detail: "KiWa/Moebel kein Autopilot, Saisonmode +30 %, Spielzeug Q4 +20 %." },
    { phase: "P1.3", topic: "Safety-Buffer", status: "Teilweise", tone: "amber" as SystemTone, detail: "Artikel-spezifischer Puffer." },
    { phase: "P1.4", topic: "ML-Forecast", status: "Python-POC", tone: "accent" as SystemTone, detail: "Machine-Learning-Modell statt reiner Heuristik." },
    { phase: "P2", topic: "Event-Kalender", status: "Offen", tone: "red" as SystemTone, detail: "Black Friday, Weihnachten, Schulanfang und weitere Events." },
    { phase: "P2", topic: "Rhythm-Break Detection", status: "Offen", tone: "red" as SystemTone, detail: "Ploetzliche Nachfrage-Brueche erkennen." },
    { phase: "P2", topic: "Top-20 / Markdown-Steuerung", status: "Offen", tone: "red" as SystemTone, detail: "Manuelle Steuerung fuer strategische Artikel." },
  ],
  syncChange: {
    title: "JTL-Produktfilter seit 26.06.2026",
    points: [
      "Vorher wurden Artikel mit EK <= 0 ausgeschlossen.",
      "Vorher wurden Artikel ausgeschlossen, die aelter als 3 Jahre sind.",
      "Jetzt werden alle aktiven Artikel mit IsActive === true synchronisiert.",
      "Artikel ohne EK und aeltere Artikel landen dadurch ebenfalls in analytics_products.",
      "Auswirkung: laengerer Sync, aber vollstaendigere Datengrundlage.",
    ],
  },
  rules: [
    "Immer additiv arbeiten; keine bestehenden Tabellen oder Spalten loeschen.",
    "Feature-Flags fuer v2.0-Funktionen nutzen.",
    "Keine Container-Restarts oder Deploys waehrend laufendem JTL-Sync ohne explizites Go.",
    "Vor jedem Commit npx tsc --noEmit ausfuehren.",
    "Bei Einkaufs-Optimizer-Aenderungen immer UI und API-Route mitanpassen.",
    "chatComplete() gibt { message: { content } } zurueck, nicht direkt result.content.",
  ],
  summary: [
    { label: "JTL-Analytics-Sync", value: "80-85 %", tone: "amber" as SystemTone, note: "Produkte laufen noch" },
    { label: "Einkaufsplaner P0", value: "100 %", tone: "green" as SystemTone, note: "Treasury, Brand-Budget, OOS produktiv" },
    { label: "Einkauf P1/P2", value: "30-35 %", tone: "amber" as SystemTone, note: "Safety/Kategorien teilweise, Rest offen" },
    { label: "Case-Management", value: "60 %", tone: "amber" as SystemTone, note: "Grundgeruest + Immediate Features" },
    { label: "ML-Forecast", value: "20 %", tone: "accent" as SystemTone, note: "Nur Python-POC" },
    { label: "Event/Rhythm", value: "0 %", tone: "red" as SystemTone, note: "Noch nicht begonnen" },
  ],
};
