import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, sortedWeeks } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { EmptyState } from "@/components/_primitives/empty-state";
import { NewKpiButton, KpiActions } from "@/components/cockpit/kpi-editor";

export const dynamic = "force-dynamic";

const SKIP = new Set(["id", "weekstart", "weeklabel", "label", "notes", "note"]);

// Lesbares Label aus camelCase/snake_case.
function pretty(k: string): string {
  return k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}
function fmt(v: unknown): string {
  if (typeof v === "number") return v.toLocaleString("de-AT", { maximumFractionDigits: 2 });
  return String(v);
}

export default async function KpisPage() {
  await requireAdmin();
  const { weeklyKpis } = await getCockpitData();
  const weeks = sortedWeeks(weeklyKpis).slice(0, 12);

  if (!weeks.length) return <PageShell icon="kpi" title="KPIs" action={<NewKpiButton />}><EmptyState title="Noch keine KPI-Wochen" hint="Wöchentliche Kennzahlen erfassen." /></PageShell>;

  return (
    <PageShell icon="kpi" title="KPIs" subtitle={`${weeklyKpis.length} erfasste Wochen`} action={<NewKpiButton />}>
      <div className="flex flex-col gap-3">
        {weeks.map((w, i) => {
          const metrics = Object.entries(w).filter(([k, v]) =>
            !SKIP.has(k.toLowerCase()) && (typeof v === "number" || (typeof v === "string" && v.trim() !== "")),
          );
          return (
            <section key={w.id || i} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
              <h3 className="mb-3 font-bold">{w.weekLabel || w.weekStart || `Woche ${i + 1}`}</h3>
              {metrics.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {metrics.map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                      <div className="text-[11px] uppercase tracking-wide text-muted-2">{pretty(k)}</div>
                      <div className="font-mono text-sm font-semibold">{fmt(v)}</div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-2">Keine Kennzahlen erfasst.</p>}
              <KpiActions id={w.id || String(weeklyKpis.indexOf(w))} week={w} />
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
