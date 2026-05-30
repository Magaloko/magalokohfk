import Link from "next/link";
import { Icon } from "@/components/icon";
import type { ActivityItem } from "@/lib/history";

const fmtAt = (ms: number) => new Date(ms).toLocaleString("de-AT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const typeIcon: Record<string, string> = { Hebel: "lever", Task: "check", Entscheidung: "compass" };

// Org-weiter Aktivitäts-Feed (präsentational, server-renderbar).
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items.length) return <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted-2">Noch keine Aktivität erfasst. Änderungen an Hebeln, Tasks & Entscheidungen erscheinen hier.</p>;
  return (
    <ol className="ml-1 flex flex-col gap-4 border-l border-line pl-4">
      {items.map((e, i) => (
        <li key={i} className="relative">
          <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${e.kind === "created" ? "bg-green" : "bg-accent"}`} />
          <div className="text-[11px] text-muted-2"><span className="uppercase tracking-wide">{fmtAt(e.at)}</span>{e.by ? ` · von ${e.by}` : ""}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-2"><Icon name={typeIcon[e.type] || "dot"} className="h-3 w-3" />{e.type}</span>
            <Link href={e.href} className="font-semibold hover:text-accent">{e.title}</Link>
            {e.kind === "created"
              ? <span className="font-medium text-green">angelegt</span>
              : <span className="text-muted-2"><span className="font-medium text-ink">{e.changes[0].label}:</span> <span className="line-through">{e.changes[0].from}</span> → <span className="text-ink">{e.changes[0].to}</span>{e.changes.length > 1 ? ` (+${e.changes.length - 1})` : ""}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
