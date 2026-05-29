import { requireArea } from "@/lib/auth-helpers";
import { getAkademieData, type Drill } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { DataTable, type Column } from "@/components/_primitives/data-table";
import { Pill } from "@/components/_primitives/card";
import { QuizLauncher } from "@/components/akademie/quiz-launcher";

export const dynamic = "force-dynamic";

export default async function DrillsPage() {
  await requireArea("drills");
  const d = await getAkademieData();
  const cols: Column<Drill>[] = [
    { key: "marke", label: "Marke", render: (r) => <Pill tone="teal">{r.marke || "allgemein"}</Pill> },
    { key: "frage", label: "Frage", render: (r) => <span className="font-medium">{r.frage}</span> },
    { key: "tech", label: "Technik", hideOnMobile: true, render: (r) => <span className="text-muted">{r.verkaufstechnik || "—"}</span> },
    { key: "schw", label: "Niveau", align: "right", hideOnMobile: true, render: (r) => <span className="text-muted-2">{r.schwierigkeit || "—"}</span> },
  ];
  return (
    <PageShell title="Daily-Drills" subtitle={`${d.drills.length} Drills · tägliches Mikro-Training`}>
      <QuizLauncher drills={d.drills} einwaende={d.einwaende} marken={d.marken} />
      <DataTable columns={cols} rows={d.drills} getKey={(r, i) => r.id || String(i)} empty={{ title: "Noch keine Drills", hint: "Lernsystem importieren." }} />
    </PageShell>
  );
}
