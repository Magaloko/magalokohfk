import { Card, Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { EINKAUFSPLANER_STATUS } from "@/lib/einkaufsplaner-status";

function List({ items, icon = "check" }: { items: string[]; icon?: string }) {
  return (
    <ul className="mt-2 grid gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-2">
          <Icon name={icon} className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function EinkaufsplanerStatusCard() {
  const s = EINKAUFSPLANER_STATUS;
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="bag" className="h-3.5 w-3.5" /> Einkaufsplaner
          </div>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight">{s.mission.title}</h2>
          <p className="mt-1 text-xs text-muted-2">{s.updatedLabel} · Quelle: {s.source}</p>
        </div>
        <Pill tone="green">P0 produktiv</Pill>
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
          <h3 className="flex items-center gap-1.5 text-sm font-bold"><Icon name="check" className="h-4 w-4 text-green" />P0 umgesetzt</h3>
          <List items={s.implementedP0} />
        </Card>
        <Card className="p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold"><Icon name="target" className="h-4 w-4 text-amber" />Naechste Aufgaben</h3>
          <List items={s.nextTasks.map((t) => `${t.title}: ${t.reason}`)} icon="target" />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-sm font-bold">P1 offen</h3>
          <List items={s.openP1} />
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-bold">P2 offen</h3>
          <List items={s.openP2} />
        </Card>
      </div>
    </section>
  );
}
