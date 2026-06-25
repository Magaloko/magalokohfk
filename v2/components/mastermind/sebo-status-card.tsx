import { Card, Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { SEBO_STATUS } from "@/lib/sebo-status";

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 grid gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-2">
          <Icon name="check" className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function SeboStatusCard() {
  const s = SEBO_STATUS;
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="cockpit" className="h-3.5 w-3.5" /> SeBo-Dokumentationsstand
          </div>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight">SeBo v2: Steuerung, Abnahme und neues Projekt</h2>
          <p className="mt-1 text-xs text-muted-2">{s.updatedLabel} · Quelle: {s.source}</p>
        </div>
        <Pill tone="amber">Mago-Aufgabe</Pill>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {s.summary.map((item) => (
          <div key={item.label} className="rounded-lg border border-line bg-surface-2 p-3">
            <div className="text-xs font-bold text-ink">{item.label}</div>
            <div className="mt-1"><Pill tone={item.tone}>{item.status}</Pill></div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold"><Icon name="bolt" className="h-4 w-4 text-accent" />Was bereits läuft</h3>
          <List items={s.running} />
        </Card>
        <Card className="p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold"><Icon name="target" className="h-4 w-4 text-amber" />Empfohlene nächste Schritte</h3>
          <List items={s.nextSteps} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-sm font-bold">P1 offen · wichtig</h3>
          <List items={s.openP1} />
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-bold">P2 offen · strategisch</h3>
          <List items={s.openP2} />
        </Card>
      </div>
    </section>
  );
}
