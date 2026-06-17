import { requireUser } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { aiConfigured } from "@/lib/ai";
import { PageShell } from "@/components/_primitives/page-shell";
import { PracticeTrainer } from "@/components/werkstatt/practice-trainer";

export const dynamic = "force-dynamic";

export default async function UebenPage() {
  await requireUser();
  const { einwaende } = await getAkademieData();
  const slim = einwaende.filter((e) => e.einwand).map((e) => ({ einwand: e.einwand || "", antwort: e.antwort || "" }));
  return (
    <PageShell title="Üben & Rückmeldung" icon="target" subtitle="Formuliere deine eigene Antwort auf einen Einwand — die KI bewertet sie und schlägt Verbesserungen vor">
      <PracticeTrainer einwaende={slim} configured={aiConfigured()} />
    </PageShell>
  );
}
