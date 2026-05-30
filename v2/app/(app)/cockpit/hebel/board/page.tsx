import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, leverScore, formatEur } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { Icon } from "@/components/icon";
import { NewLeverButton } from "@/components/cockpit/lever-editor";
import { LeverBoard, type BoardLever } from "@/components/cockpit/lever-board";

export const dynamic = "force-dynamic";

export default async function HebelBoardPage() {
  await requireAdmin();
  const { levers } = await getCockpitData();
  const items: BoardLever[] = levers.map((l, i) => ({
    id: l.id || String(i),
    title: l.title || "Hebel",
    area: l.area || "",
    status: l.status || "Backlog",
    impact: formatEur(l.expectedImpactEur),
    roi: Math.round(leverScore(l)),
    confidence: l.confidence || "",
    risk: l.risk || "",
  }));

  return (
    <PageShell icon="lever" title="Hebel-Board" subtitle="Pipeline nach Status — Karten per Drag & Drop verschieben"
      action={<div className="flex gap-2">
        <Link href="/cockpit/hebel" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink"><Icon name="kpi" className="h-4 w-4" />Liste</Link>
        <NewLeverButton />
      </div>}>
      <LeverBoard initial={items} />
    </PageShell>
  );
}
