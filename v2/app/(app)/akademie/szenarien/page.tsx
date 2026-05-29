import { requireArea } from "@/lib/auth-helpers";
import { getAkademieData, type Szenario } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { DataTable, type Column } from "@/components/_primitives/data-table";
import { Pill } from "@/components/_primitives/card";

export const dynamic = "force-dynamic";

export default async function SzenarienPage() {
  await requireArea("szenarien");
  const { szenarien } = await getAkademieData();
  const cols: Column<Szenario>[] = [
    { key: "n", label: "Szenario", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "schw", label: "Niveau", render: (r) => (r.schwierigkeit ? <Pill tone="amber">{r.schwierigkeit}</Pill> : <span className="text-muted-2">—</span>) },
    { key: "steps", label: "Schritte", align: "right", hideOnMobile: true, render: (r) => <span className="font-mono text-muted">{(r.steps || []).length}</span> },
  ];
  return (
    <PageShell title="Trainings-Szenarien" subtitle={`${szenarien.length} mehrstufige Übungen`}>
      <DataTable columns={cols} rows={szenarien} getKey={(r, i) => r.id || String(i)} empty={{ title: "Noch keine Szenarien" }} />
    </PageShell>
  );
}
