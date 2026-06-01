import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, isTaskOpen, isLeverActive, sortedWeeks } from "@/lib/cockpit";
import { UMSETZUNGS_BLOECKE } from "@/lib/phases";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

export default async function CockpitOverview() {
  await requireAdmin();
  const { tasks, levers, weeklyKpis, decisions, umsetzung } = await getCockpitData();

  const openTasks = tasks.filter(isTaskOpen);
  const openDecisions = decisions.filter((d) => (d.status || "offen") === "offen" || d.status === "vorbereitet");
  const u = (typ: string) => umsetzung.filter((x) => x.typ === typ && (x.status || "offen") !== "erledigt");
  const zugaenge = u("Zugang").length, blocker = u("Blocker").length, freigaben = u("Freigabe").length;

  const blockOpen = (keys: string[]) => openTasks.filter((t) => keys.includes(String(t.phase || ""))).length;
  const focus = [...UMSETZUNGS_BLOECKE].sort((a, b) => a.step - b.step).find((b) => blockOpen(b.phaseKeys) > 0);
  const latestWeek = sortedWeeks(weeklyKpis)[0];

  return (
    <PageShell icon="cockpit" title="Umsetzung" subtitle="Stephans MasterMind-Plan kontrolliert umsetzen — Phasen · Steuerung · Briefing">
      {/* Stephan-Plan: Umsetzung */}
      <section className="rounded-xl border border-accent/30 bg-accent/5 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent"><Icon name="compass" className="h-3.5 w-3.5" /> Stephan-Plan · Umsetzung</div>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight">Reihenfolge laut Plan: Foundation → Treasury → Einkauf</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">VEKTRA (diese App) ist der erste sichtbare Baustein, aber bewusst nachrangig. Der strategische Schwerpunkt bleibt Foundation, Treasury und Einkauf.</p>
          </div>
          <Link href="/mastermind" className="shrink-0 text-xs font-semibold text-accent">Plan ansehen →</Link>
        </div>
      </section>

      {/* Phasen-Blöcke */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {UMSETZUNGS_BLOECKE.map((b) => {
          const count = blockOpen(b.phaseKeys);
          const isFocus = focus?.key === b.key;
          return (
            <Link key={b.key} href="/cockpit/tasks" className={`rounded-xl border bg-surface p-4 shadow-sm transition hover:border-accent ${isFocus ? "border-accent ring-1 ring-accent/30" : "border-line"}`}>
              <div className="flex items-center justify-between">
                <Icon name={b.icon} className="h-5 w-5 text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-2">Schritt {b.step}</span>
              </div>
              <div className="mt-2 text-sm font-bold">{b.label}</div>
              <div className="text-xs text-muted-2">{b.desc}</div>
              <div className="mt-2 flex items-center gap-2">
                {b.live ? <Pill tone="green">live</Pill> : isFocus ? <Pill tone="accent">Fokus</Pill> : <Pill tone="muted">geplant</Pill>}
                <span className="text-xs text-muted-2">{count} {count === 1 ? "Task" : "Tasks"}</span>
              </div>
              {b.note && <div className="mt-1 text-[11px] text-muted-2">{b.note}</div>}
            </Link>
          );
        })}
      </div>

      {/* Umsetzungslead */}
      <h2 className="mb-2 mt-7 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="handshake" className="h-3.5 w-3.5" /> Umsetzungslead — was Stephan von mir braucht</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Lead href="/cockpit/entscheidungen" icon="compass" label="Offene Entscheidungen" value={openDecisions.length} />
        <Lead href="/cockpit/umsetzung?typ=Zugang" icon="key" label="Offene Zugänge" value={zugaenge} />
        <Lead href="/cockpit/umsetzung?typ=Blocker" icon="alert" label="Technische Blocker" value={blocker} danger />
        <Lead href="/cockpit/umsetzung?typ=Freigabe" icon="check" label="Wartet auf Freigabe" value={freigaben} />
      </div>

      {/* Wochen-Briefing */}
      <Link href="/cockpit/briefing" className="mt-3 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 shadow-sm transition hover:border-accent">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><Icon name="send" className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">Wochen-Briefing für Stephan</span>
          <span className="block text-xs text-muted-2">Erledigt · Blocker · Entscheidungen · nächster Schritt · Risiko — als Text zum Senden</span>
        </span>
        <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-accent" />
      </Link>

      {/* Sekundär: Datenbestand */}
      <h2 className="mb-2 mt-7 text-xs font-bold uppercase tracking-wide text-muted-2">Datenbestand</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat href="/cockpit/tasks" icon="check" label="Offene Tasks" value={openTasks.length} sub={`${tasks.length} gesamt`} />
        <Stat href="/cockpit/hebel" icon="lever" label="Aktive Hebel" value={levers.filter(isLeverActive).length} sub={`${levers.length} gesamt`} />
        <Stat href="/cockpit/kpis" icon="kpi" label="KPI-Wochen" value={weeklyKpis.length} sub={latestWeek?.weekLabel || latestWeek?.weekStart || "—"} />
        <Stat href="/cockpit/entscheidungen" icon="compass" label="Offene Entsch." value={openDecisions.length} sub={`${decisions.length} gesamt`} />
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-2">
        <Icon name="lock" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>Persönliche Tools (Zeit, Bewertung) liegen bewusst nachrangig im <Link href="/mago" className="font-semibold text-accent">Mago-Bereich</Link>.</span>
      </p>
    </PageShell>
  );
}

function Lead({ href, icon, label, value, danger }: { href: string; icon: string; label: string; value: number; danger?: boolean }) {
  const hot = danger && value > 0;
  return (
    <Link href={href} className="rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
      <div className="flex items-center justify-between">
        <Icon name={icon} className={`h-5 w-5 ${hot ? "text-red" : "text-accent"}`} />
        <span className={`text-2xl font-extrabold ${hot ? "text-red" : ""}`}>{value}</span>
      </div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
    </Link>
  );
}

function Stat({ href, icon, label, value, sub }: { href: string; icon: string; label: string; value: number; sub?: string }) {
  return (
    <Link href={href} className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
      <div className="flex items-center justify-between">
        <Icon name={icon} className="h-5 w-5 text-accent" />
        <span className="text-2xl font-extrabold">{value}</span>
      </div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
      {sub && <div className="text-xs text-muted-2">{sub}</div>}
    </Link>
  );
}
