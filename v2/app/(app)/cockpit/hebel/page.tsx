import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, leverScore, formatEur, isLeverActive, type Lever } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { DataTable, type Column } from "@/components/_primitives/data-table";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { NewLeverButton } from "@/components/cockpit/lever-editor";

export const dynamic = "force-dynamic";

const statusTone = (s?: string): "green" | "muted" | "accent" => {
  if (s === "Live") return "green";
  if (s === "Verworfen") return "muted";
  return "accent";
};

export default async function HebelPage() {
  await requireAdmin();
  const { levers } = await getCockpitData();
  const rows = [...levers].sort((a, b) => leverScore(b) - leverScore(a));

  const href = (r: Lever) => `/cockpit/hebel/${encodeURIComponent(r.id || String(levers.indexOf(r)))}`;
  const cols: Column<Lever>[] = [
    { key: "title", label: "Hebel", render: (r) => <Link href={href(r)} className="font-medium text-ink hover:text-accent">{r.title}</Link> },
    { key: "area", label: "Bereich", hideOnMobile: true, render: (r) => <span className="text-muted">{r.area || "—"}</span> },
    { key: "impact", label: "Impact/J", align: "right", render: (r) => <span className="font-mono font-semibold text-green">{formatEur(r.expectedImpactEur)}</span> },
    { key: "effort", label: "Aufwand", align: "right", hideOnMobile: true, render: (r) => <span className="font-mono text-muted-2">{r.effortHours ? `${r.effortHours}h` : "—"}</span> },
    { key: "roi", label: "ROI-Score", align: "right", hideOnMobile: true, render: (r) => <span className="font-mono text-muted">{Math.round(leverScore(r)).toLocaleString("de-AT")}</span> },
    { key: "status", label: "Status", align: "right", render: (r) => <Pill tone={statusTone(r.status)}>{r.status || "—"}</Pill> },
  ];

  return (
    <PageShell icon="lever" title="Hebel" subtitle={`${levers.filter(isLeverActive).length} aktiv · sortiert nach ROI`}
      action={<div className="flex gap-2">
        <Link href="/cockpit/hebel/board" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink"><Icon name="cockpit" className="h-4 w-4" />Board</Link>
        <NewLeverButton />
      </div>}>
      <DataTable columns={cols} rows={rows} getKey={(r, i) => r.id || String(i)} empty={{ title: "Keine Hebel" }} />
    </PageShell>
  );
}
