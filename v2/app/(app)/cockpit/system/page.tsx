import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth-helpers";
import { SEBO_SYSTEM_STATUS, type SystemTone } from "@/lib/sebo-system-status";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

function TonePill({ children, tone = "muted" }: { children: ReactNode; tone?: SystemTone }) {
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

export default async function SystemPage() {
  await requireAdmin();
  const s = SEBO_SYSTEM_STATUS;

  return (
    <PageShell
      icon="globe"
      title="SeBo Gesamtsystem"
      subtitle="Alle Module, MasterMind-Stand und Entwicklungsregeln auf einen Blick"
      action={
        <>
          <Link href="/cockpit/einkauf" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink">
            <Icon name="bag" className="h-4 w-4" /> Einkauf
          </Link>
          <Link href="/cockpit/sebo" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink">
            <Icon name="chat" className="h-4 w-4" /> Case-Management
          </Link>
        </>
      }
    >
      <section className="rounded-xl border border-teal/40 bg-teal/10 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal">
              <Icon name="globe" className="h-3.5 w-3.5" /> Gesamtkontext
            </div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">{s.mission.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{s.mission.summary}</p>
          </div>
          <TonePill tone="teal">Stand 26.06.2026</TonePill>
        </div>
        <p className="mt-4 rounded-lg border border-teal/30 bg-bg/40 p-3 text-sm font-semibold leading-relaxed text-ink">
          {s.mission.guardrail}
        </p>
      </section>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {s.summary.map((item) => (
          <section key={item.label} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-muted-2">{item.label}</div>
              <TonePill tone={item.tone}>{item.value}</TonePill>
            </div>
            <div className="mt-2 text-sm text-muted">{item.note}</div>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
          <Icon name="cockpit" className="h-3.5 w-3.5" /> Module
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {s.modules.map((m) => (
            <div key={m.key} className="rounded-lg border border-line bg-surface-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="min-w-0 flex-1 font-bold">{m.name}</h3>
                <TonePill tone={m.tone}>{m.status}</TonePill>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.purpose}</p>
              <div className="mt-3">
                <List items={m.details} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
          <Icon name="target" className="h-3.5 w-3.5" /> MasterMind-Phasen
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {s.mastermind.map((p) => (
            <div key={`${p.phase}-${p.topic}`} className="rounded-lg border border-line bg-surface-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <TonePill tone="muted">{p.phase}</TonePill>
                <h3 className="min-w-0 flex-1 text-sm font-bold">{p.topic}</h3>
                <TonePill tone={p.tone}>{p.status}</TonePill>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="repeat" className="h-3.5 w-3.5" /> {s.syncChange.title}
          </div>
          <div className="mt-4">
            <List items={s.syncChange.points} icon="repeat" />
          </div>
        </section>
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name="lock" className="h-3.5 w-3.5" /> Entwicklungsregeln
          </div>
          <div className="mt-4">
            <List items={s.rules} icon="lock" />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
