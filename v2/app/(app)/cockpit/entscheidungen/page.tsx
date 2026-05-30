import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { EmptyState } from "@/components/_primitives/empty-state";
import { NewDecisionButton } from "@/components/cockpit/decision-editor";
import { KanbanBoard, type KanbanCard } from "@/components/cockpit/kanban-board";

export const dynamic = "force-dynamic";

const STATUSES = ["offen", "vorbereitet", "entschieden", "verworfen"];
const today = () => new Date().toISOString().slice(0, 10);

export default async function EntscheidungenPage() {
  await requireAdmin();
  const { decisions } = await getCockpitData();
  if (!decisions.length) return <PageShell icon="compass" title="Entscheidungen" action={<NewDecisionButton />}><EmptyState title="Noch keine Entscheidungen" hint="Stephan-Entscheidungen vorbereiten." /></PageShell>;

  const t = today();
  const cards: KanbanCard[] = decisions.map((d, i) => {
    const status = d.status || "offen";
    const overdue = d.frist && d.frist < t && status !== "entschieden" && status !== "verworfen";
    return {
      id: d.id || String(i),
      title: d.titel || "(ohne Titel)",
      status,
      href: `/cockpit/entscheidungen/${encodeURIComponent(d.id || String(i))}`,
      badges: [d.frist ? `Frist ${d.frist}${overdue ? " · überfällig" : ""}` : "", d.kategorie || ""].filter(Boolean),
    };
  });

  return (
    <PageShell icon="compass" title="Entscheidungen" subtitle={`${decisions.length} gesamt · Karten per Drag & Drop verschieben`} action={<NewDecisionButton />}>
      <KanbanBoard collection="stephanDecisions" statuses={STATUSES} cards={cards} />
    </PageShell>
  );
}
