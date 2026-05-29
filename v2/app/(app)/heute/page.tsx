import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, leverScore, formatEur, isTaskOpen, isLeverActive, sortedWeeks } from "@/lib/cockpit";
import { getProgress, levelInfo, emptyProgress } from "@/lib/progress";
import { PATHS } from "@/lib/paths";
import { PageShell } from "@/components/_primitives/page-shell";

export const dynamic = "force-dynamic";

const SKIP = new Set(["id", "weekstart", "weeklabel", "label", "notes", "note"]);
const pretty = (k: string) => k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

export default async function HeutePage() {
  const sess = await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Date().toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const { tasks, levers, weeklyKpis, decisions } = await getCockpitData();
  const progress = (await getProgress(sess.email)) || emptyProgress(sess.email);
  const lvl = levelInfo(progress.xp);
  const pathsDone = PATHS.filter((p) => (progress.stats.paths?.[p.id]?.length || 0) >= p.steps.length).length;

  const openTasks = tasks.filter(isTaskOpen);
  const dueTasks = openTasks
    .filter((t) => !!t.dueDate && t.dueDate <= today)
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
  const upcomingDecisions = decisions
    .filter((d) => (d.status || "offen") !== "entschieden" && d.status !== "verworfen" && d.frist)
    .sort((a, b) => String(a.frist).localeCompare(String(b.frist)))
    .slice(0, 6);
  const topLevers = levers.filter(isLeverActive).sort((a, b) => leverScore(b) - leverScore(a)).slice(0, 3);
  const latest = sortedWeeks(weeklyKpis)[0];
  const latestMetrics = latest
    ? Object.entries(latest).filter(([k, v]) => !SKIP.has(k.toLowerCase()) && (typeof v === "number" || (typeof v === "string" && v.trim() !== ""))).slice(0, 4)
    : [];

  return (
    <PageShell title="🏠 Heute" subtitle={dateLabel}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat href="/cockpit/tasks" icon="🔴" label="Fällig / überfällig" value={dueTasks.length} sub={`${openTasks.length} offen`} />
          <Stat href="/cockpit/entscheidungen" icon="⏰" label="Anstehende Fristen" value={upcomingDecisions.length} sub="Entscheidungen" />
          <Stat href="/akademie/lernpfade" icon="🧭" label="Lernpfade" value={pathsDone} sub={`von ${PATHS.length} abgeschlossen`} />
          <Stat href="/cockpit/hebel" icon="🎚" label="Aktive Hebel" value={levers.filter(isLeverActive).length} sub={topLevers[0] ? `Top: ${formatEur(topLevers[0].expectedImpactEur)}/J` : "—"} />
          <Stat href="/akademie" icon="🎓" label="Dein Level" value={lvl.level} sub={`${progress.xp} XP · 🔥 ${progress.streak}`} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="🔴 Heute fällig & überfällig" href="/cockpit/tasks">
            {dueTasks.length ? (
              <ul className="flex flex-col gap-2">
                {dueTasks.slice(0, 8).map((t, i) => {
                  const over = t.dueDate! < today;
                  return (
                    <li key={t.id || i} className="flex items-center justify-between gap-3 text-sm">
                      <Link href={`/cockpit/tasks/${encodeURIComponent(t.id || String(tasks.indexOf(t)))}`} className="min-w-0 truncate hover:text-accent">{t.title}</Link>
                      <span className={`shrink-0 font-mono text-xs ${over ? "font-bold text-red" : "text-muted-2"}`}>{t.dueDate}</span>
                    </li>
                  );
                })}
              </ul>
            ) : <Empty>Nichts fällig. 🎉</Empty>}
          </Section>

          <Section title="⏰ Anstehende Entscheidungs-Fristen" href="/cockpit/entscheidungen">
            {upcomingDecisions.length ? (
              <ul className="flex flex-col gap-2">
                {upcomingDecisions.map((d, i) => {
                  const over = d.frist! < today;
                  return (
                    <li key={d.id || i} className="flex items-center justify-between gap-3 text-sm">
                      <Link href={`/cockpit/entscheidungen/${encodeURIComponent(d.id || String(decisions.indexOf(d)))}`} className="min-w-0 truncate hover:text-accent">{d.titel}</Link>
                      <span className={`shrink-0 font-mono text-xs ${over ? "font-bold text-red" : "text-muted-2"}`}>{d.frist}</span>
                    </li>
                  );
                })}
              </ul>
            ) : <Empty>Keine offenen Fristen.</Empty>}
          </Section>

          <Section title="🎚 Top-Hebel nach ROI" href="/cockpit/hebel">
            {topLevers.length ? (
              <ul className="flex flex-col gap-2">
                {topLevers.map((l, i) => (
                  <li key={l.id || i} className="flex items-center justify-between gap-3 text-sm">
                    <Link href={`/cockpit/hebel/${encodeURIComponent(l.id || String(levers.indexOf(l)))}`} className="min-w-0 truncate hover:text-accent">{l.title}</Link>
                    <span className="shrink-0 font-mono text-xs font-bold text-green">{formatEur(l.expectedImpactEur)}/J</span>
                  </li>
                ))}
              </ul>
            ) : <Empty>Keine aktiven Hebel.</Empty>}
          </Section>

          <Section title={`📈 KPI-Snapshot${latest ? ` · ${latest.weekLabel || latest.weekStart}` : ""}`} href="/cockpit/kpis">
            {latestMetrics.length ? (
              <div className="grid grid-cols-2 gap-2">
                {latestMetrics.map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-muted-2">{pretty(k)}</div>
                    <div className="font-mono text-sm font-semibold">{typeof v === "number" ? v.toLocaleString("de-AT") : String(v)}</div>
                  </div>
                ))}
              </div>
            ) : <Empty>Noch keine KPIs.</Empty>}
          </Section>
        </div>
      </div>
    </PageShell>
  );
}

function Stat({ href, icon, label, value, sub }: { href: string; icon: string; label: string; value: number; sub?: string }) {
  return (
    <Link href={href} className="rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
      <div className="flex items-center justify-between"><span className="text-lg">{icon}</span><span className="text-2xl font-extrabold">{value}</span></div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
      {sub && <div className="text-xs text-muted-2">{sub}</div>}
    </Link>
  );
}
function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-2">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-accent">Alle →</Link>
      </div>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-2">{children}</p>;
}
