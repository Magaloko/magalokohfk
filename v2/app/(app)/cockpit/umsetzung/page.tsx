import Link from "next/link";
import { getCockpitData } from "@/lib/cockpit";
import { UMSETZUNG } from "@/lib/umsetzung-config";
import type { MagoItem } from "@/lib/mago-config";
import { PageShell } from "@/components/_primitives/page-shell";
import { MagoCrud } from "@/components/mago/mago-crud";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const TYPES = ["Zugang", "Blocker", "Freigabe", "Abstimmung", "Risiko"];

export default async function UmsetzungPage({ searchParams }: { searchParams: Promise<{ typ?: string }> }) {
  const { umsetzung } = await getCockpitData();
  const sp = await searchParams;
  const typ = typeof sp?.typ === "string" && TYPES.includes(sp.typ) ? sp.typ : "";
  const items = (typ ? umsetzung.filter((x) => x.typ === typ) : umsetzung) as MagoItem[];

  const chip = (label: string, href: string, active: boolean) => (
    <Link href={href} className={cn("rounded-full px-3 py-1 text-xs font-semibold transition", active ? "bg-accent text-bg" : "bg-surface-2 text-muted hover:text-ink")}>{label}</Link>
  );

  return (
    <PageShell icon={UMSETZUNG.icon} title={UMSETZUNG.label} subtitle={UMSETZUNG.subtitle}>
      <div className="mb-3 flex flex-wrap gap-2">
        {chip(`Alle (${umsetzung.length})`, "/cockpit/umsetzung", !typ)}
        {TYPES.map((t) => chip(t, `/cockpit/umsetzung?typ=${encodeURIComponent(t)}`, typ === t))}
      </div>
      <MagoCrud module={UMSETZUNG} items={items} />
    </PageShell>
  );
}
