import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { getMagoData, getMagoCollection } from "@/lib/mago";
import { MAGO_MODULES } from "@/lib/mago-config";
import { PageShell } from "@/components/_primitives/page-shell";
import { Icon } from "@/components/icon";
import { MagoCommandCenter } from "@/components/mago/mago-command-center";

export const dynamic = "force-dynamic";

export default async function MagoOverview() {
  await requireSuperAdmin();
  const data = await getMagoData();
  const [hebel, kpis] = await Promise.all([getMagoCollection("magoHebel"), getMagoCollection("magoKpis")]);
  const totalStunden = (data.zeit || []).reduce((s, z) => s + (Number(z.stunden) || 0), 0);
  const offeneMs = (data.meilensteine || []).filter((m) => (String(m.status || "Geplant")) !== "Abgenommen").length;

  return (
    <PageShell icon="briefcase" title="Mago" subtitle="Mein Bereich — meine Zusammenarbeit & Arbeit für Stephan (privat, nur ich)">
      <MagoCommandCenter />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MAGO_MODULES.map((m) => (
          <Link key={m.key} href={m.route} className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
            <div className="flex items-center justify-between">
              <Icon name={m.icon} className="h-5 w-5 text-accent" />
              <span className="text-2xl font-extrabold">{(data[m.key] || []).length}</span>
            </div>
            <div className="mt-2 text-sm font-semibold">{m.label}</div>
            <div className="text-xs text-muted-2">{m.subtitle}</div>
          </Link>
        ))}
        <Link href="/mago/hebel" className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
          <div className="flex items-center justify-between">
            <Icon name="lever" className="h-5 w-5 text-accent" />
            <span className="text-2xl font-extrabold">{hebel.length}</span>
          </div>
          <div className="mt-2 text-sm font-semibold">Hebel</div>
          <div className="text-xs text-muted-2">Wirkungs-Hebel &amp; deren Aufwand</div>
        </Link>
        <Link href="/mago/kennzahlen" className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
          <div className="flex items-center justify-between">
            <Icon name="kpi" className="h-5 w-5 text-accent" />
            <span className="text-2xl font-extrabold">{kpis.length}</span>
          </div>
          <div className="mt-2 text-sm font-semibold">Kennzahlen</div>
          <div className="text-xs text-muted-2">Eigene KPIs gegen Ziele</div>
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="clock" className="h-3.5 w-3.5" /> Aufwand gesamt</div>
          <div className="mt-1 text-2xl font-extrabold">{totalStunden.toLocaleString("de-AT")} h</div>
          <div className="text-xs text-muted-2">über alle erfassten Zeiten</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="target" className="h-3.5 w-3.5" /> Offene Meilensteine</div>
          <div className="mt-1 text-2xl font-extrabold">{offeneMs}</div>
          <div className="text-xs text-muted-2">noch nicht abgenommen</div>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-2">
        <Icon name="lock" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Dieser Bereich ist nur für dich (Super-Admin) sichtbar — getrennt von der „Umsetzung".
      </p>
    </PageShell>
  );
}
