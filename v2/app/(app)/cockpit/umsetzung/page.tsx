import { getCockpitData } from "@/lib/cockpit";
import { UMSETZUNG } from "@/lib/umsetzung-config";
import type { MagoItem } from "@/lib/mago-config";
import { PageShell } from "@/components/_primitives/page-shell";
import { MagoCrud } from "@/components/mago/mago-crud";

export const dynamic = "force-dynamic";

export default async function UmsetzungPage() {
  const { umsetzung } = await getCockpitData();
  return (
    <PageShell icon={UMSETZUNG.icon} title={UMSETZUNG.label} subtitle={UMSETZUNG.subtitle}>
      <MagoCrud module={UMSETZUNG} items={umsetzung as MagoItem[]} />
    </PageShell>
  );
}
