import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, leverScore, formatEur, isTaskOpen, isLeverActive, sortedWeeks } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";

export const dynamic = "force-dynamic";

export default async function CockpitOverview() {
  await requireAdmin();
  const { tasks, levers, weeklyKpis, decisions } = await getCockpitData();

  const openTasks = tasks.filter(isTaskOpen);
  const topLevers = levers.filter(isLeverActive).sort((a, b) => leverScore(b) - leverScore(a)).slice(0, 3);
  const openDecisions = decisions.filter((d) => (d.status || "offen") === "offen" || d.status === "vorbereitet");
  const latestWeek = sortedWeeks(weeklyKpis)[0];

  return (
    <PageShell title="📊 Cockpit" subtitle="Tasks · Hebel · KPIs · Entscheidungen — dein Steuerstand">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat href="/cockpit/tasks" icon="✅" label="Offene Tasks" value={openTasks.length} sub={`${tasks.length} gesamt`} />
        <Stat href="/cockpit/hebel" icon="🎚" label="Aktive Hebel" value={levers.filter(isLeverActive).length} sub={`${levers.length} gesamt`} />
        <Stat href="/cockpit/kpis" icon="📈" label="KPI-Wochen" value={weeklyKpis.length} sub={latestWeek?.weekLabel || latestWeek?.weekStart || "—"} />
        <Stat href="/cockpit/entscheidungen" icon="🧭" label="Offene Entsch." value={openDecisions.length} sub={`${decisions.length} gesamt`} />
      </div>

      <section className="mt-5 rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-2">🎚 Top-Hebel nach ROI</h2>
          <Link href="/cockpit/hebel" className="text-xs font-semibold text-accent">Alle →</Link>
        </div>
        {topLevers.length ? (
          <ul className="flex flex-col gap-2">
            {topLevers.map((l, i) => (
              <li key={l.id || i} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{l.title}</span>
                  <span className="text-xs text-muted-2">{l.area || "—"}{l.effortHours ? ` · ${l.effortHours}h` : ""}</span>
                </span>
                <span className="shrink-0 font-mono text-sm font-bold text-green">{formatEur(l.expectedImpactEur)}/J</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-2">Keine aktiven Hebel.</p>}
      </section>

      <section className="mt-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-2">✅ Nächste offene Tasks</h2>
          <Link href="/cockpit/tasks" className="text-xs font-semibold text-accent">Alle →</Link>
        </div>
        {openTasks.length ? (
          <ul className="flex flex-col gap-2">
            {openTasks.slice(0, 6).map((t, i) => (
              <li key={t.id || i} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{t.title}</span>
                <span className="shrink-0 text-xs text-muted-2">{t.area || ""}{t.dueDate ? ` · ${t.dueDate}` : ""}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-2">Keine offenen Tasks. 🎉</p>}
      </section>
    </PageShell>
  );
}

function Stat({ href, icon, label, value, sub }: { href: string; icon: string; label: string; value: number; sub?: string }) {
  return (
    <Link href={href} className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span className="text-2xl font-extrabold">{value}</span>
      </div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
      {sub && <div className="text-xs text-muted-2">{sub}</div>}
    </Link>
  );
}
