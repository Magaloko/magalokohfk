import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

type Entry = {
  title: string;
  href: string;
  icon: string;
  purpose: string;
  when: string;
  details: string[];
};

const MODULES: Entry[] = [
  {
    title: "Heute & Steuerung",
    href: "/cockpit",
    icon: "cockpit",
    purpose: "Zentrale Arbeitsansicht für offene Punkte, Blocker, Wartet-auf-Listen, erledigte Arbeit und Stephan-Update.",
    when: "Jeden Tag zuerst öffnen, um zu sehen, was als Nächstes wichtig ist.",
    details: [
      "Zeigt offene Tasks, offene Entscheidungen, Blocker, Risiken und Punkte, die auf Rückmeldung warten.",
      "Erstellt automatisch einen kopierbaren Stephan-Update-Text.",
      "Enthält das Mago Command Center zum schnellen Erfassen neuer Aufgaben, Entscheidungen, Einkaufsfälle oder Blocker.",
    ],
  },
  {
    title: "SeBo System",
    href: "/cockpit/system",
    icon: "globe",
    purpose: "Gesamtüberblick über JTL-Sync, Einkaufsplaner, Case-Management, Treasury, Billing, VIPA und VEKTRA.",
    when: "Nutzen, wenn Stephan den Gesamtstand wissen will oder ein Modul priorisiert werden muss.",
    details: [
      "Zeigt Umsetzungsgrade, Modulstatus und Entwicklungsregeln.",
      "Dokumentiert die JTL-Produktfilter-Änderung vom 26.06.2026.",
      "Erklärt die MasterMind-Phasen P0 bis P2.",
    ],
  },
  {
    title: "Einkauf",
    href: "/cockpit/einkauf",
    icon: "bag",
    purpose: "Detailseite für den Einkaufsplaner, MasterMind-P0, offene P1/P2-Themen und technische Architektur.",
    when: "Nutzen, wenn Einkaufslogik, OOS, Brand-Budget, Safety-Buffer oder Kategorie-Regeln besprochen werden.",
    details: [
      "P0 ist produktiv: Treasury-Ampel, Brand-Budget, OOS-Schutz und Budget-Optimierung.",
      "P1 enthält Lieferzeit-Range, Kategorie-Regeln, Safety-Buffer und ML-Forecast.",
      "Zeigt technische Bezugspunkte wie Optimizer, API und Einkaufs-Cockpit.",
    ],
  },
  {
    title: "Service / SeBo",
    href: "/cockpit/sebo",
    icon: "chat",
    purpose: "Steuerungsseite für SeBo v2, Case-Management, KI-Drafts, Reminder und Service-Prozesse.",
    when: "Nutzen, wenn es um Kundenfälle, Service-Automation, v1-Abnahme oder v2-Projektumfang geht.",
    details: [
      "Trennt v1-Abschluss, v2-Neuscope und Mago-Steuerung.",
      "Zeigt Meilensteine, Risiken, offene Aufgaben und Handover-Bedarf.",
      "Hilft bei Entscheidungen zu Power Automate, Persistenz, Service-Inbox und Prozessgrenzen.",
    ],
  },
  {
    title: "Tasks",
    href: "/cockpit/tasks",
    icon: "check",
    purpose: "Liste aller Aufgaben mit Status, Priorität, Bereich, Owner und Fälligkeit.",
    when: "Nutzen, wenn konkrete Arbeit geplant, sortiert oder erledigt werden soll.",
    details: [
      "Aufgaben können nach Status und Fälligkeit geprüft werden.",
      "Jede Aufgabe kann einer Phase oder einem Modul zugeordnet werden.",
      "Erledigte Aufgaben fließen in das Stephan-Update ein.",
    ],
  },
  {
    title: "Entscheidungen",
    href: "/cockpit/entscheidungen",
    icon: "compass",
    purpose: "Alle offenen, vorbereiteten, entschiedenen oder vertagten Entscheidungen für Stephan und GF.",
    when: "Nutzen, wenn eine klare Entscheidung, Freigabe oder Priorisierung nötig ist.",
    details: [
      "Entscheidungen enthalten Kategorie, Frist und Empfehlung.",
      "Überfällige Entscheidungen werden sichtbar markiert.",
      "Einzelne Entscheidungen haben eigene Detailseiten und Gesprächskontext.",
    ],
  },
  {
    title: "Wartet auf",
    href: "/cockpit/umsetzung",
    icon: "handshake",
    purpose: "Umsetzungsliste für Zugänge, Freigaben, Abstimmungen, Blocker und Risiken.",
    when: "Nutzen, wenn etwas nicht weitergeht, weil eine Person, ein Zugang oder eine Freigabe fehlt.",
    details: [
      "Trennt Zugang, Blocker, Freigabe, Abstimmung und Risiko.",
      "Macht sichtbar, wer reagieren muss.",
      "Diese Punkte erscheinen im Cockpit und im Stephan-Update.",
    ],
  },
  {
    title: "Stephan-Update",
    href: "/cockpit/briefing",
    icon: "send",
    purpose: "Automatisch zusammengestelltes Wochen- oder Statusbriefing für Stephan.",
    when: "Nutzen, bevor Stephan eine Nachricht oder ein kurzer Projektstand geschickt wird.",
    details: [
      "Fasst erledigte Punkte, Fokus, Blocker, Entscheidungen, Zugänge und Risiken zusammen.",
      "Text kann direkt kopiert und verschickt werden.",
      "Die Inhalte kommen aus Tasks, Entscheidungen und Umsetzungsdaten.",
    ],
  },
  {
    title: "Aktivität",
    href: "/cockpit/aktivitaet",
    icon: "clock",
    purpose: "Chronologische Sicht auf Änderungen, Fortschritt und zuletzt erfasste Punkte.",
    when: "Nutzen, um nachzuvollziehen, was zuletzt passiert ist.",
    details: [
      "Hilft bei Rückfragen, wann etwas erfasst oder geändert wurde.",
      "Ergänzt Tasks und Entscheidungen um zeitlichen Kontext.",
    ],
  },
  {
    title: "Stephan-Assist",
    href: "/cockpit/stephan",
    icon: "chat",
    purpose: "Assistent für Fragen, Zusammenfassungen und Nachrichtenvorbereitung im Stephan-Kontext.",
    when: "Nutzen, wenn aus Cockpit-Daten eine formulierte Antwort oder ein Update entstehen soll.",
    details: [
      "Nutzt Strategie-, Task-, Entscheidungs- und Umsetzungsdaten als Kontext.",
      "Eignet sich für kurze Updates, Vorbereitungen und Nachfragen.",
    ],
  },
  {
    title: "Prozess-Spiel",
    href: "/prozesse",
    icon: "package",
    purpose: "Erfassung echter Einkaufs-, Service- und Unternehmensfälle als prüfbare Prozess-Spielzüge.",
    when: "Nutzen, wenn Fachwissen digitalisiert oder ein echter Fall in eine Regel/Testlogik übersetzt werden soll.",
    details: [
      "Einkaufsfälle aus Mago können hier als Prozesswissen landen.",
      "Hilft, Regeln, Risiken, Systemsignale und nächste technische Schritte festzuhalten.",
    ],
  },
  {
    title: "MasterMind",
    href: "/mastermind",
    icon: "compass",
    purpose: "Strategische Gesamtsicht auf Stephans MasterMind-Plan, Roadmap, Fragen und Werkzeug-Set.",
    when: "Nutzen, wenn es um Richtung, Architektur, offene Fragen oder langfristige Planung geht.",
    details: [
      "Zeigt Vision, Roadmap, SeBo-Gesamtsystem, Einkaufsplaner und SeBo-v2-Status.",
      "Enthält offene Fragen an Stephan pro Modul.",
    ],
  },
];

const FLOWS = [
  {
    title: "Täglicher Start",
    steps: ["Heute & Steuerung öffnen", "Blocker und Wartet-auf prüfen", "Nächste konkrete Schritte abarbeiten", "Neue Punkte direkt im Mago Command Center erfassen"],
  },
  {
    title: "Update für Stephan",
    steps: ["Stephan-Update öffnen", "Automatischen Text prüfen", "Offene Entscheidungen ergänzen", "Briefing kopieren und senden"],
  },
  {
    title: "Neuen offenen Punkt erfassen",
    steps: ["Im Mago Command Center frei notieren", "Typ wählen: Aufgabe, Entscheidung, Blocker, Status oder Einkaufsfall", "Pflichtfelder ausfüllen", "Speichern und auf der passenden Seite weiterverfolgen"],
  },
  {
    title: "Einkauf weiterentwickeln",
    steps: ["Einkauf öffnen", "P1/P2-Thema auswählen", "Echten Fall im Prozess-Spiel erfassen", "Daraus Task oder Entscheidung ableiten"],
  },
];

function ModuleCard({ entry }: { entry: Entry }) {
  return (
    <Link href={entry.href} className="rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name={entry.icon} className="h-5 w-5 text-accent" />
          <h2 className="font-bold">{entry.title}</h2>
        </div>
        <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-muted-2" />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{entry.purpose}</p>
      <p className="mt-2 text-xs font-semibold text-ink">{entry.when}</p>
      <ul className="mt-3 grid gap-1.5">
        {entry.details.map((detail) => (
          <li key={detail} className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-2">
            <Icon name="check" className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default async function DokumentationPage() {
  await requireAdmin();

  return (
    <PageShell
      icon="book"
      title="Magaloko Dokumentation"
      subtitle="Was wo ist, wofür die Module gedacht sind und wie du die App im Alltag nutzt."
      action={<Link href="/cockpit" className="rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold text-muted hover:text-ink">Zur Steuerung</Link>}
    >
      <section className="rounded-xl border border-accent/30 bg-accent/5 p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="accent">Arbeitscockpit</Pill>
          <Pill tone="teal">SeBo System</Pill>
          <Pill tone="green">Stephan-Update</Pill>
        </div>
        <h2 className="mt-3 text-xl font-extrabold tracking-tight">Kurzprinzip</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Magaloko ist deine Steuerungszentrale. Die Startseite zeigt, was offen ist, worauf gewartet wird, was erledigt ist und was Stephan wissen muss. Die Detailseiten erklären die einzelnen Module und machen Entscheidungen, Aufgaben und Blocker nachvollziehbar.
        </p>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
          <Icon name="cockpit" className="h-3.5 w-3.5" /> Module und Seiten
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {MODULES.map((entry) => <ModuleCard key={entry.href} entry={entry} />)}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
          <Icon name="repeat" className="h-3.5 w-3.5" /> Typische Arbeitsabläufe
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {FLOWS.map((flow) => (
            <div key={flow.title} className="rounded-lg border border-line bg-surface-2 p-4">
              <h2 className="font-bold">{flow.title}</h2>
              <ol className="mt-3 grid gap-2">
                {flow.steps.map((step, i) => (
                  <li key={step} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-bold text-accent">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
