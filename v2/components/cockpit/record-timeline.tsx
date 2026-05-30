import { Icon } from "@/components/icon";
import type { HistoryEvent } from "@/lib/history";

const fmtAt = (ms: number) => new Date(ms).toLocaleString("de-AT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Präsentations-Timeline (server-renderbar): chronologische Änderungs-Historie eines Datensatzes.
export function RecordTimeline({ events }: { events: HistoryEvent[] }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="clock" className="h-3.5 w-3.5" />Verlauf</h2>
      {!events.length ? (
        <p className="text-sm text-muted-2">Noch keine Änderungen erfasst. Künftige Bearbeitungen erscheinen hier.</p>
      ) : (
        <ol className="ml-1 flex flex-col gap-4 border-l border-line pl-4">
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${e.kind === "created" ? "bg-green" : "bg-accent"}`} />
              <div className="text-[11px] uppercase tracking-wide text-muted-2">{fmtAt(e.at)}{e.by ? <span className="normal-case"> · von {e.by}</span> : null}</div>
              {e.kind === "created" ? (
                <div className="mt-0.5 text-sm font-semibold text-green">Angelegt</div>
              ) : (
                <ul className="mt-0.5 flex flex-col gap-1 text-sm">
                  {e.changes.map((c, j) => (
                    <li key={j} className="flex flex-wrap items-center gap-x-1.5">
                      <span className="font-semibold">{c.label}:</span>
                      <span className="text-muted-2 line-through">{c.from}</span>
                      <Icon name="arrow-right" className="h-3 w-3 text-muted-2" />
                      <span className="text-ink">{c.to}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
