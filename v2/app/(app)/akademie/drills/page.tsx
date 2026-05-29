import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData, type Drill } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { DataTable, type Column } from "@/components/_primitives/data-table";
import { Pill } from "@/components/_primitives/card";
import { QuizLauncher } from "@/components/akademie/quiz-launcher";
import { DrillLauncher } from "@/components/akademie/drill-launcher";
import { NewDrillButton, DrillRowActions } from "@/components/akademie/drill-editor-form";

export const dynamic = "force-dynamic";

export default async function DrillsPage() {
  const sess = await requireArea("drills");
  const admin = isAdmin(sess);
  const d = await getAkademieData();
  const cols: Column<Drill>[] = [
    { key: "marke", label: "Marke", render: (r) => <Pill tone="teal">{r.marke || "allgemein"}</Pill> },
    { key: "frage", label: "Frage", render: (r) => <span className="font-medium">{r.frage}</span> },
    { key: "tech", label: "Technik", hideOnMobile: true, render: (r) => <span className="text-muted">{r.verkaufstechnik || "—"}</span> },
    { key: "schw", label: "Niveau", align: "right", hideOnMobile: true, render: (r) => <span className="text-muted-2">{r.schwierigkeit || "—"}</span> },
  ];
  if (admin) cols.push({ key: "act", label: "", align: "right", render: (r) => <DrillRowActions id={r.id || String(d.drills.indexOf(r))} drill={r} /> });
  return (
    <PageShell title="Daily-Drills" subtitle={`${d.drills.length} Drills · tägliches Mikro-Training`} action={admin ? <NewDrillButton /> : undefined}>
      <DrillLauncher drills={d.drills} />
      <QuizLauncher drills={d.drills} einwaende={d.einwaende} marken={d.marken} />
      <DataTable columns={cols} rows={d.drills} getKey={(r, i) => r.id || String(i)} empty={{ title: "Noch keine Drills", hint: "Lernsystem importieren." }} />
    </PageShell>
  );
}
