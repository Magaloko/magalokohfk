import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, leverScore, formatEur } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { Icon } from "@/components/icon";
import { NewLeverButton } from "@/components/cockpit/lever-editor";
import { KanbanBoard, type KanbanCard } from "@/components/cockpit/kanban-board";

export const dynamic = "force-dynamic";

const LEVER_STATUSES = ["Backlog", "Geplant", "In Arbeit", "Live", "Verworfen"];

export default async function HebelBoardPage() {
  await requireAdmin();
  const { levers } = await getCockpitData();
  const cards: KanbanCard[] = levers.map((l, i) => ({
    id: l.id || String(i),
    title: l.title || "Hebel",
    status: l.status || "Backlog",
    href: `/cockpit/hebel/${encodeURIComponent(l.id || String(i))}`,
    primary: formatEur(l.expectedImpactEur),
    badges: [`ROI ${Math.round(leverScore(l)).toLocaleString("de-AT")}`, l.area || "", l.confidence ? `Conf: ${l.confidence}` : "", l.risk ? `Risk: ${l.risk}` : ""].filter(Boolean),
  }));

  return (
    <PageShell icon="lever" title="Hebel-Board" subtitle="Pipeline nach Status — Karten per Drag & Drop verschieben"
      action={<div className="flex gap-2">
        <Link href="/cockpit/hebel" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink"><Icon name="kpi" className="h-4 w-4" />Liste</Link>
        <NewLeverButton />
      </div>}>
      <KanbanBoard collection="levers" statuses={LEVER_STATUSES} cards={cards} />
    </PageShell>
  );
}
