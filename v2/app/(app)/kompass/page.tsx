import { requireAdmin } from "@/lib/auth-helpers";
import { getKompassProdukte } from "@/lib/kompass";
import { PageShell } from "@/components/_primitives/page-shell";
import { Finder } from "@/components/kompass/finder";

export const dynamic = "force-dynamic";

// Baby-Kompass (POC) — interner Beratungs-Assistent: Kinderwagen-Finder fürs HFK-Team.
export default async function KompassPage() {
  await requireAdmin();
  const produkte = await getKompassProdukte();
  return (
    <PageShell icon="compass" title="Baby-Kompass" subtitle="Kinderwagen-Finder — Entscheidungs-Assistent fürs Beratungsgespräch">
      <Finder produkte={produkte} />
    </PageShell>
  );
}
