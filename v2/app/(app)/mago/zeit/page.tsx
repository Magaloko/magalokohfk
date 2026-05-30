import { getMagoData } from "@/lib/mago";
import { magoModule } from "@/lib/mago-config";
import { PageShell } from "@/components/_primitives/page-shell";
import { MagoCrud } from "@/components/mago/mago-crud";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";
const mod = magoModule("zeit");

export default async function ZeitPage() {
  const data = await getMagoData();
  const zeit = data.zeit || [];
  const totalStunden = zeit.reduce((s, z) => s + (Number(z.stunden) || 0), 0);
  const totalWert = zeit.reduce((s, z) => s + (Number(z.stunden) || 0) * (Number(z.satz) || 0), 0);

  return (
    <PageShell icon={mod.icon} title={mod.label} subtitle={mod.subtitle}>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="clock" className="h-3.5 w-3.5" /> Summe Aufwand</div>
          <div className="mt-1 text-2xl font-extrabold">{totalStunden.toLocaleString("de-AT")} h</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="money" className="h-3.5 w-3.5" /> Wert (wo Satz erfasst)</div>
          <div className="mt-1 text-2xl font-extrabold">{totalWert ? "€" + Math.round(totalWert).toLocaleString("de-AT") : "—"}</div>
        </div>
      </div>
      <MagoCrud module={mod} items={zeit} />
    </PageShell>
  );
}
