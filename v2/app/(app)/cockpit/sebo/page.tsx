import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth-helpers";
import { SEBO_V2, type Tone } from "@/lib/sebo-v2";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

function TonePill({ children, tone = "muted" }: { children: ReactNode; tone?: Tone }) {
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

export default async function SeboPage() {
  await requireAdmin();
  const s = SEBO_V2;

  return (
    <PageShell
      icon="chat"
      title="SeBo v2 Steuerung"
      subtitle="Auftragsschutz, Stephan-Vorbereitung und Übergabe an Dadakaev Labs"
      action={
        <>
          <Link href="/cockpit/tasks" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink">
            <Icon name="check" className="h-4 w-4" /> Tasks
          </Link>
          <Link href="/cockpit/entscheidungen" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink">
            <Icon name="compass" className="h-4 w-4" /> Entscheidungen
          </Link>
        </>
      }
    >
      <section className="rounded-xl border border-amber/40 bg-amber/10 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber">
              <Icon name="lock" className="h-3.5 w-3.5" /> Kritische Leitplanke
            </div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">{s.mission.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{s.mission.summary}</p>
          </div>
          <TonePill tone="amber">5k v1 schützen</TonePill>
        </div>
        <p className="mt-4 rounded-lg border border-amber/30 bg-bg/40 p-3 text-sm font-semibold leading-relaxed text-ink">
          {s.mission.guardrail}
        </p>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {s.pillars.map((p) => (
          <section key={p.title} className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-extrabold">{p.title}</h3>
              <TonePill tone={p.tone}>Fokus</TonePill>
            </div>
            <div className="mt-3">
              <List items={p.points} />
            </div>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
              <Icon name="kpi" className="h-3.5 w-3.5" /> Aktueller Entwicklungsstand
            </div>
            <h2 className="mt-1 text-lg font-extrabold">Was laut Ist-Stand wirklich fertig ist</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{s.currentStatus.summary}</p>
          </div>
          <TonePill tone="accent">{s.currentStatus.source}</TonePill>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.currentStatus.modules.map((m) => (
            <div key={m.name} className="rounded-lg border border-line bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold">{m.name}</h3>
                <TonePill tone={m.tone}>{m.status}</TonePill>
              </div>
              <div className="mt-1 text-xs text-muted-2">Reifegrad: {m.maturity}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-line bg-surface-2 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold"><Icon name="repeat" className="h-4 w-4 text-accent" /> JTL-Sync Status</h3>
          <div className="mt-3">
            <List items={s.currentStatus.jtlSync} icon="check" />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
              <Icon name="target" className="h-3.5 w-3.5" /> Nächste Aufgaben für Mago
            </div>
            <h2 className="mt-1 text-lg font-extrabold">Was jetzt aktiv passieren muss</h2>
          </div>
          <TonePill tone="red">nicht treiben lassen</TonePill>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {s.nextTasks.map((task) => (
            <div key={task.title} className="rounded-lg border border-line bg-surface-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="min-w-0 flex-1 font-bold">{task.title}</h3>
                <TonePill tone={task.priority === "hoch" ? "red" : "amber"}>{task.priority}</TonePill>
              </div>
              <div className="mt-1 text-xs text-muted-2">Owner: {task.owner}{task.effort ? ` · Aufwand: ${task.effort}` : ""}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{task.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="calendar" className="h-3.5 w-3.5" /> 4-6 Wochen Plan
          </div>
          <h2 className="mt-1 text-lg font-extrabold">Kurzfristige Reihenfolge</h2>
          <div className="mt-4">
            <List items={s.nearTermPlan} icon="target" />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="alert" className="h-3.5 w-3.5" /> Risiken
          </div>
          <h2 className="mt-1 text-lg font-extrabold">Was du aktiv kontrollieren musst</h2>
          <div className="mt-4 grid gap-3">
            {s.risks.map((r) => (
              <div key={r.title} className="rounded-lg border border-line bg-surface-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="min-w-0 flex-1 text-sm font-bold">{r.title}</h3>
                  <TonePill tone={r.tone}>{r.severity}</TonePill>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.mitigation}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="cockpit" className="h-3.5 w-3.5" /> Zielarchitektur
          </div>
          <div className="mt-4 grid gap-3">
            {s.architecture.map((a) => (
              <div key={a.label} className="rounded-lg border border-line bg-surface-2 p-4">
                <h3 className="font-bold">{a.label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{a.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="alert" className="h-3.5 w-3.5" /> Kollisionen mit v1
          </div>
          <div className="mt-4">
            <List items={s.v1Collisions} icon="alert" />
          </div>
          <div className="mt-4 rounded-lg border border-line bg-surface-2 p-4">
            <h3 className="text-sm font-bold">v2 Statusmodell</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {s.statusModel.map((status) => (
                <TonePill key={status} tone={status === "90_Erledigt" ? "green" : status.includes("03") || status.includes("04") ? "amber" : "muted"}>{status}</TonePill>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
          <Icon name="rocket" className="h-3.5 w-3.5" /> Meilenstein-Plan
        </div>
        <div className="mt-4 grid gap-3">
          {s.milestones.map((m) => (
            <div key={m.id} className="grid gap-3 rounded-lg border border-line bg-surface-2 p-4 md:grid-cols-[120px_1fr]">
              <div>
                <TonePill tone={m.id === "M0" ? "red" : "accent"}>{m.id}</TonePill>
                <div className="mt-2 text-xs text-muted-2">{m.owner}</div>
              </div>
              <div>
                <h3 className="font-bold">{m.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.deliverables.map((d) => <TonePill key={d}>{d}</TonePill>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="chat" className="h-3.5 w-3.5" /> Fragen für Stephan
          </div>
          <div className="mt-4">
            <List items={s.stephanQuestions} icon="compass" />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="briefcase" className="h-3.5 w-3.5" /> Handover von Dadakaev Labs
          </div>
          <div className="mt-4">
            <List items={s.handoverNeeds} icon="key" />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
          <Icon name="folder" className="h-3.5 w-3.5" /> Quellenstand
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {s.documents.map((doc) => (
            <div key={doc.title} className="rounded-lg border border-line bg-surface-2 p-4">
              <h3 className="font-bold">{doc.title}</h3>
              <p className="mt-1 text-xs text-muted-2">{doc.date} · {doc.pages} Seiten</p>
              <p className="mt-2 break-all font-mono text-[11px] text-muted-2">{doc.path}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
