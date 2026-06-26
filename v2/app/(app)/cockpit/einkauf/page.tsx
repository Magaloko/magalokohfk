import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth-helpers";
import { EINKAUFSPLANER_STATUS, type EinkaufTone } from "@/lib/einkaufsplaner-status";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

function TonePill({ children, tone = "muted" }: { children: ReactNode; tone?: EinkaufTone }) {
  return <Pill tone={tone}>{children}</Pill>;
}

function List({ items, icon = "check" }: { items: string[]; icon?: string }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
          <Icon name={icon} className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function EinkaufPage() {
  await requireAdmin();
  const s = EINKAUFSPLANER_STATUS;

  return (
    <PageShell
      icon="bag"
      title="Einkaufsplaner"
      subtitle="P0 produktiv, P1-Regeln und Datenreife kontrolliert nachziehen"
      action={
        <>
          <Link href="/prozesse" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink">
            <Icon name="package" className="h-4 w-4" /> Prozess-Spiel
          </Link>
          <Link href="/cockpit/tasks" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink">
            <Icon name="check" className="h-4 w-4" /> Tasks
          </Link>
        </>
      }
    >
      <section className="rounded-xl border border-green/40 bg-green/10 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-green">
              <Icon name="check" className="h-3.5 w-3.5" /> Produktiver Kern
            </div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">{s.mission.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{s.mission.summary}</p>
          </div>
          <TonePill tone="green">P0 live</TonePill>
        </div>
        <p className="mt-4 rounded-lg border border-green/30 bg-bg/40 p-3 text-sm font-semibold leading-relaxed text-ink">
          {s.mission.guardrail}
        </p>
      </section>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {s.summary.map((item) => (
          <section key={item.label} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="text-xs font-bold text-muted-2">{item.label}</div>
            <div className="mt-2"><TonePill tone={item.tone}>{item.status}</TonePill></div>
          </section>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="check" className="h-3.5 w-3.5" /> P0 umgesetzt
          </div>
          <div className="mt-4">
            <List items={s.implementedP0} />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="alert" className="h-3.5 w-3.5" /> Teilweise umgesetzt
          </div>
          <div className="mt-4">
            <List items={s.partial} icon="alert" />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
              <Icon name="target" className="h-3.5 w-3.5" /> P1 Backlog
            </div>
            <h2 className="mt-1 text-lg font-extrabold">Was jetzt aktiv passieren muss</h2>
          </div>
          <TonePill tone="amber">naechster Fokus</TonePill>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {s.nextTasks.map((task) => (
            <div key={task.title} className="rounded-lg border border-line bg-surface-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="min-w-0 flex-1 font-bold">{task.title}</h3>
                <TonePill tone={task.priority === "hoch" ? "red" : "amber"}>{task.priority}</TonePill>
              </div>
              <div className="mt-1 text-xs text-muted-2">Owner: {task.owner}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{task.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="bolt" className="h-3.5 w-3.5" /> P1 offen
          </div>
          <div className="mt-4">
            <List items={s.openP1} icon="target" />
          </div>
        </section>
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="rocket" className="h-3.5 w-3.5" /> P2 strategisch
          </div>
          <div className="mt-4">
            <List items={s.openP2} icon="rocket" />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
          <Icon name="cockpit" className="h-3.5 w-3.5" /> Technische Architektur
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {s.architecture.map((a) => (
            <div key={a.label} className="rounded-lg border border-line bg-surface-2 p-4">
              <h3 className="font-mono text-xs font-bold text-ink">{a.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="folder" className="h-3.5 w-3.5" /> Datenquellen
          </div>
          <div className="mt-4">
            <List items={s.dataSources} icon="folder" />
          </div>
        </section>
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="repeat" className="h-3.5 w-3.5" /> {s.syncChange.title}
          </div>
          <div className="mt-4">
            <List items={s.syncChange.points} icon="check" />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
          <Icon name="chat" className="h-3.5 w-3.5" /> Fragen fuer Stephan
        </div>
        <div className="mt-4">
          <List items={s.stephanQuestions} icon="compass" />
        </div>
      </section>
    </PageShell>
  );
}
