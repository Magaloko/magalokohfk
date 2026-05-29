import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, type Decision } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { EmptyState } from "@/components/_primitives/empty-state";
import { NewDecisionButton } from "@/components/cockpit/decision-editor";

export const dynamic = "force-dynamic";

const COLS: { key: string; label: string; tone: string }[] = [
  { key: "offen", label: "Offen", tone: "border-amber/40" },
  { key: "vorbereitet", label: "Vorbereitet", tone: "border-accent/40" },
  { key: "entschieden", label: "Entschieden", tone: "border-green/40" },
  { key: "verworfen", label: "Verworfen", tone: "border-line" },
];

const today = () => new Date().toISOString().slice(0, 10);

export default async function EntscheidungenPage() {
  await requireAdmin();
  const { decisions } = await getCockpitData();
  if (!decisions.length) return <PageShell title="🧭 Entscheidungen" action={<NewDecisionButton />}><EmptyState title="Noch keine Entscheidungen" hint="Stephan-Entscheidungen vorbereiten." /></PageShell>;

  const byStatus = (s: string) => decisions.filter((d) => (d.status || "offen") === s);

  return (
    <PageShell title="🧭 Entscheidungen" subtitle={`${decisions.length} gesamt · Stephan-Meetings`} action={<NewDecisionButton />}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COLS.map((c) => {
          const items = byStatus(c.key);
          return (
            <div key={c.key} className="flex flex-col gap-2">
              <h2 className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-muted-2">
                {c.label}<span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono">{items.length}</span>
              </h2>
              {items.length ? items.map((d, i) => (
                <Link key={d.id || i} href={`/cockpit/entscheidungen/${encodeURIComponent(d.id || String(decisions.indexOf(d)))}`} className="block">
                  <DecisionCard d={d} tone={c.tone} live={c.key !== "entschieden" && c.key !== "verworfen"} />
                </Link>
              )) : <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-xs text-muted-2">—</p>}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

function DecisionCard({ d, tone, live }: { d: Decision; tone: string; live: boolean }) {
  const overdue = live && d.frist && d.frist < today();
  return (
    <div className={`rounded-lg border-l-4 ${overdue ? "border-red" : tone} border-y border-r border-line bg-surface p-3 shadow-sm`}>
      <div className="text-sm font-semibold">{d.titel || "(ohne Titel)"}</div>
      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-2">
        {d.frist && <span className={overdue ? "font-semibold text-red" : ""}>⏰ {d.frist}</span>}
        {d.kategorie && <span>📁 {d.kategorie}</span>}
      </div>
      {d.empfehlung && <p className="mt-2 line-clamp-3 text-xs text-muted"><span className="font-semibold text-ink">Empfehlung:</span> {d.empfehlung}</p>}
    </div>
  );
}
