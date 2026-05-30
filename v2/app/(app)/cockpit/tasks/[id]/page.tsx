import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, isTaskOpen, type Task } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { TaskActions } from "@/components/cockpit/task-editor";
import { RecordTimeline } from "@/components/cockpit/record-timeline";
import { getRecordHistory, TASK_FIELDS } from "@/lib/history";

export const dynamic = "force-dynamic";

const Back = <Link href="/cockpit/tasks" className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink">← Tasks</Link>;

export default async function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const key = decodeURIComponent(id);
  const { tasks } = await getCockpitData();
  let t: Task | undefined = tasks.find((x) => x.id && x.id === key);
  if (!t && /^\d+$/.test(key)) t = tasks[Number(key)];
  if (!t) notFound();
  const history = await getRecordHistory("tasks", t.id || key, TASK_FIELDS);

  return (
    <PageShell title={t.title || "Aufgabe"} subtitle={t.area || undefined} action={Back}>
      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Pill tone={isTaskOpen(t) ? "amber" : "green"}>{t.status || "offen"}</Pill>
            {t.priority && <Pill tone="red">Prio: {t.priority}</Pill>}
            {t.impact && <Pill tone="accent">Impact: {t.impact}</Pill>}
            {t.effort && <Pill>Aufwand: {t.effort}</Pill>}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Field label="Bereich" value={t.area} />
            <Field label="Owner" value={t.owner} />
            <Field label="Fällig" value={t.dueDate} mono />
          </dl>
        </section>
        {t.notes && (
          <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">Notizen</h2>
            <p className="whitespace-pre-wrap text-sm text-muted">{t.notes}</p>
          </section>
        )}
        <TaskActions id={t.id || key} task={t} />
        <RecordTimeline events={history} />
      </div>
    </PageShell>
  );
}

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-2">{label}</dt>
      <dd className={mono ? "font-mono text-sm" : "text-sm"}>{value || "—"}</dd>
    </div>
  );
}
