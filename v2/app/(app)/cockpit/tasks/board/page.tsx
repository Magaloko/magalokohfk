import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { Icon } from "@/components/icon";
import { NewTaskButton } from "@/components/cockpit/task-editor";
import { KanbanBoard, type KanbanCard } from "@/components/cockpit/kanban-board";

export const dynamic = "force-dynamic";

const TASK_STATUSES = ["Backlog", "In Arbeit", "Warte", "Erledigt"];

export default async function TasksBoardPage() {
  await requireAdmin();
  const { tasks } = await getCockpitData();
  const cards: KanbanCard[] = tasks.map((t, i) => ({
    id: t.id || String(i),
    title: t.title || "Aufgabe",
    status: t.status || "Backlog",
    href: `/cockpit/tasks/${encodeURIComponent(t.id || String(i))}`,
    primary: t.priority ? `Prio: ${t.priority}` : "",
    badges: [t.owner || "", t.dueDate ? `fällig ${t.dueDate}` : "", t.area || ""].filter(Boolean),
  }));

  return (
    <PageShell icon="check" title="Task-Board" subtitle="Aufgaben nach Status — Karten per Drag & Drop verschieben"
      action={<div className="flex gap-2">
        <Link href="/cockpit/tasks" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink"><Icon name="kpi" className="h-4 w-4" />Liste</Link>
        <NewTaskButton />
      </div>}>
      <KanbanBoard collection="tasks" statuses={TASK_STATUSES} cards={cards} />
    </PageShell>
  );
}
