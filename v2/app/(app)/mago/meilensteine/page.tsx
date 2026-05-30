import { getMagoData } from "@/lib/mago";
import { magoModule } from "@/lib/mago-config";
import { PageShell } from "@/components/_primitives/page-shell";
import { MagoCrud } from "@/components/mago/mago-crud";

export const dynamic = "force-dynamic";
const mod = magoModule("meilensteine");

export default async function MeilensteinePage() {
  const data = await getMagoData();
  return (
    <PageShell icon={mod.icon} title={mod.label} subtitle={mod.subtitle}>
      <MagoCrud module={mod} items={data.meilensteine || []} />
    </PageShell>
  );
}
