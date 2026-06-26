import { Card, Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { SEBO_SYSTEM_STATUS } from "@/lib/sebo-system-status";

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

export function SeboSystemStatusCard() {
  const s = SEBO_SYSTEM_STATUS;
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="globe" className="h-3.5 w-3.5" /> SeBo Gesamtsystem
          </div>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight">{s.mission.title}</h2>
          <p className="mt-1 text-xs text-muted-2">{s.updatedLabel} · Quelle: {s.source}</p>
        </div>
        <Pill tone="teal">alle Module</Pill>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {s.summary.map((item) => (
          <div key={item.label} className="rounded-lg border border-line bg-surface-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-ink">{item.label}</div>
              <Pill tone={item.tone}>{item.value}</Pill>
            </div>
            <div className="mt-1 text-xs text-muted-2">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold"><Icon name="cockpit" className="h-4 w-4 text-accent" />Module</h3>
          <List items={s.modules.map((m) => `${m.name}: ${m.status} - ${m.purpose}`)} />
        </Card>
        <Card className="p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold"><Icon name="lock" className="h-4 w-4 text-amber" />Entwicklungsregeln</h3>
          <List items={s.rules.slice(0, 4)} />
        </Card>
      </div>
    </section>
  );
}
