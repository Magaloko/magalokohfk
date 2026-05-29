import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData, type Einwand } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { DataTable, type Column } from "@/components/_primitives/data-table";
import { Pill } from "@/components/_primitives/card";
import { NewEinwandButton, EinwandRowActions } from "@/components/akademie/einwand-editor";

export const dynamic = "force-dynamic";

export default async function EinwaendePage() {
  const sess = await requireArea("einwaende");
  const admin = isAdmin(sess);
  const { einwaende } = await getAkademieData();
  const cols: Column<Einwand>[] = [
    { key: "e", label: "Einwand", render: (r) => <span className="font-medium italic">„{r.einwand}"</span> },
    { key: "k", label: "Kategorie", render: (r) => (r.kategorie ? <Pill>{r.kategorie}</Pill> : <span className="text-muted-2">—</span>) },
    { key: "a", label: "Antwort", hideOnMobile: true, render: (r) => <span className="text-muted">{r.antwort}</span> },
  ];
  if (admin) cols.push({ key: "act", label: "", align: "right", render: (r) => <EinwandRowActions id={r.id || String(einwaende.indexOf(r))} einwand={r} /> });
  return (
    <PageShell title="Einwände-Bibliothek" subtitle={`${einwaende.length} Einwände + Antworten`} action={admin ? <NewEinwandButton /> : undefined}>
      <DataTable columns={cols} rows={einwaende} getKey={(r, i) => r.id || String(i)} empty={{ title: "Noch keine Einwände" }} />
    </PageShell>
  );
}
