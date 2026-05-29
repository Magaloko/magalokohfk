import { requireArea } from "@/lib/auth-helpers";
import { getAkademieData, type Einwand } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { DataTable, type Column } from "@/components/_primitives/data-table";
import { Pill } from "@/components/_primitives/card";

export const dynamic = "force-dynamic";

export default async function EinwaendePage() {
  await requireArea("einwaende");
  const { einwaende } = await getAkademieData();
  const cols: Column<Einwand>[] = [
    { key: "e", label: "Einwand", render: (r) => <span className="font-medium italic">„{r.einwand}"</span> },
    { key: "k", label: "Kategorie", render: (r) => (r.kategorie ? <Pill>{r.kategorie}</Pill> : <span className="text-muted-2">—</span>) },
    { key: "a", label: "Antwort", hideOnMobile: true, render: (r) => <span className="text-muted">{r.antwort}</span> },
  ];
  return (
    <PageShell title="Einwände-Bibliothek" subtitle={`${einwaende.length} Einwände + Antworten`}>
      <DataTable columns={cols} rows={einwaende} getKey={(r, i) => r.id || String(i)} empty={{ title: "Noch keine Einwände" }} />
    </PageShell>
  );
}
