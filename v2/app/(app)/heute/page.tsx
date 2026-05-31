import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, leverScore, formatEur, isTaskOpen, isLeverActive, sortedWeeks } from "@/lib/cockpit";
import { getRecentActivity } from "@/lib/history";
import { getProgress, levelInfo, emptyProgress, pathComplete } from "@/lib/progress";
import { PATHS } from "@/lib/paths";
import { PageShell } from "@/components/_primitives/page-shell";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const SKIP = new Set(["id", "weekstart", "weeklabel", "label", "notes", "note"]);
const pretty = (k: string) => k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
type Tone = "accent" | "amber" | "red" | "green" | "teal" | "muted";
const toneDot: Record<Tone, string> = { accent: "bg-accent", amber: "bg-amber", red: "bg-red", green: "bg-green", teal: "bg-teal", muted: "bg-muted-2" };
const eKind: Record<string, Tone> = { Termin: "accent", Erinnerung: "teal", Deadline: "red", Block: "muted" };
function relTime(ms: number): string {
  const diff = Date.now() - ms;
  const d = Math.floor(diff / 86400000); if (d > 0) return `vor ${d} T`;
  const h = Math.floor(diff / 3600000); if (h > 0) return `vor ${h} h`;
  const m = Math.floor(diff / 60000); return m > 0 ? `vor ${m} min` : "gerade eben";
}

export default async function HeutePage() {
  const sess = await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Date().toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const { tasks, levers, weeklyKpis, decisions, calendarEvents } = await getCockpitData();
  const activity = await getRecentActivity(6);
  const progress = (await getProgress(sess.email)) || emptyProgress(sess.email);
  const lvl = levelInfo(progress.xp);
  const pathsDone = PATHS.filter((p) => pathComplete(p.id, progress.stats)).length;

  const openTasks = tasks.filter(isTaskOpen);

  // Heute-Agenda: alles, was auf den heutigen Tag datiert ist — chronologisch.
  const agenda: { time?: string; title: string; kind: string; tone: Tone; href?: string; sort: number }[] = [];
  for (const e of calendarEvents) if (e.date === today) agenda.push({ time: e.time, title: e.title || "Termin", kind: e.kind || "Termin", tone: eKind[e.kind || ""] || "accent", sort: 0 });
  for (const t of openTasks) if (t.dueDate === today) agenda.push({ title: t.title || "Aufgabe", kind: "Aufgabe fällig", tone: "amber", href: `/cockpit/tasks/${encodeURIComponent(t.id || String(tasks.indexOf(t)))}`, sort: 1 });
  for (const d of decisions) if ((d.status || "offen") !== "entschieden" && d.status !== "verworfen" && d.frist === today) agenda.push({ title: d.titel || "Entscheidung", kind: "Entscheidungs-Frist", tone: "accent", href: `/cockpit/entscheidungen/${encodeURIComponent(d.id || String(decisions.indexOf(d)))}`, sort: 2 });
  for (const l of levers) {
    if (l.status === "Verworfen") continue;
    const href = `/cockpit/hebel/${encodeURIComponent(l.id || String(levers.indexOf(l)))}`;
    if (l.startDate === today) agenda.push({ title: `Start: ${l.title || "Hebel"}`, kind: "Hebel-Start", tone: "accent", href, sort: 3 });
    if (l.finishDate === today) agenda.push({ title: `Ziel: ${l.title || "Hebel"}`, kind: "Hebel-Ziel", tone: l.status === "Live" ? "green" : "teal", href, sort: 3 });
  }
  agenda.sort((a, b) => a.sort - b.sort || (a.time || "").localeCompare(b.time || ""));
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
    <PageShell title="Heute" icon="home" subtitle={dateLabel}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat href="/kalender" icon="calendar" label="Termine heute" value={agenda.length} sub="in der Agenda" />
          <Stat href="/cockpit/tasks" icon="alert" label="Fällig / überfällig" value={dueTasks.length} sub={`${openTasks.length} offen`} />
          <Stat href="/cockpit/entscheidungen" icon="clock" label="Anstehende Fristen" value={upcomingDecisions.length} sub="Entscheidungen" />
          <Stat href="/akademie/lernpfade" icon="compass" label="Lernpfade" value={pathsDone} sub={`von ${PATHS.length} abgeschlossen`} />
          <Stat href="/cockpit/hebel" icon="lever" label="Aktive Hebel" value={levers.filter(isLeverActive).length} sub={topLevers[0] ? `Top: ${formatEur(topLevers[0].expectedImpactEur)}/J` : "—"} />
          <Stat href="/akademie" icon="academy" label="Dein Level" value={lvl.level} sub={`${progress.xp} XP · `} subIcon="flame" subIconSuffix={String(progress.streak)} />
        </div>

        <Section titleIcon="calendar" title="Heute-Agenda" href="/kalender" linkLabel="Kalender →">
          {agenda.length ? (
            <ul className="flex flex-col">
              {agenda.map((a, i) => (
                <li key={i} className="flex items-center gap-3 border-b border-line/60 py-2 text-sm last:border-0">
                  <span className="w-14 shrink-0 text-right font-mono text-xs text-muted-2">{a.time || "—"}</span>
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", toneDot[a.tone])} />
                  <span className="min-w-0 flex-1 truncate">{a.href ? <Link href={a.href} className="font-medium hover:text-accent">{a.title}</Link> : <span className="font-medium">{a.title}</span>}</span>
                  <span className="shrink-0 text-xs text-muted-2">{a.kind}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Heute nichts geplant. „Kalender →" zum Anlegen.</Empty>}
        </Section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Section titleIcon="alert" title="Heute fällig & überfällig" href="/cockpit/tasks">
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
            ) : <Empty><Icon name="party" className="h-4 w-4 inline-block" /> Nichts fällig.</Empty>}
          </Section>

          <Section titleIcon="clock" title="Anstehende Entscheidungs-Fristen" href="/cockpit/entscheidungen">
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

          <Section titleIcon="lever" title="Top-Hebel nach ROI" href="/cockpit/hebel">
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

          <Section titleIcon="kpi" title={`KPI-Snapshot${latest ? ` · ${latest.weekLabel || latest.weekStart}` : ""}`} href="/cockpit/kpis">
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

        <Section titleIcon="clock" title="Letzte Aktivität" href="/cockpit/aktivitaet">
          {activity.length ? (
            <ul className="flex flex-col">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 border-b border-line/60 py-2 text-sm last:border-0">
                  <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted-2">{a.type}</span>
                  <Link href={a.href} className="min-w-0 flex-1 truncate font-medium hover:text-accent">{a.title}</Link>
                  <span className="shrink-0 text-xs text-muted-2">{a.kind === "created" ? "neu" : "geänd."}{a.by ? ` · ${a.by}` : ""} · {relTime(a.at)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Noch keine Aktivität erfasst.</Empty>}
        </Section>
      </div>
    </PageShell>
  );
}

function Stat({ href, icon, label, value, sub, subIcon, subIconSuffix }: { href: string; icon: string; label: string; value: number; sub?: string; subIcon?: string; subIconSuffix?: string }) {
  return (
    <Link href={href} className="rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:border-accent">
      <div className="flex items-center justify-between"><Icon name={icon} className="h-5 w-5 text-accent" /><span className="text-3xl font-extrabold">{value}</span></div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
      {sub && (
        <div className="text-xs text-muted-2">
          {sub}{subIcon && <><Icon name={subIcon} className="h-3 w-3 inline-block mx-0.5" />{subIconSuffix}</>}
        </div>
      )}
    </Link>
  );
}
function Section({ titleIcon, title, href, children, linkLabel = "Alle →" }: { titleIcon: string; title: string; href: string; children: React.ReactNode; linkLabel?: string }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
          <Icon name={titleIcon} className="h-3.5 w-3.5" />{title}
        </h2>
        <Link href={href} className="text-xs font-semibold text-accent">{linkLabel}</Link>
      </div>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-2">{children}</p>;
}
