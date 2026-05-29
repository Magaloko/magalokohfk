import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Card } from "@/components/_primitives/card";

export const dynamic = "force-dynamic";

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="hover:border-accent">
        <div className="text-3xl font-extrabold text-accent">{value}</div>
        <div className="mt-1 text-sm text-muted">{label}</div>
      </Card>
    </Link>
  );
}

export default async function HeutePage() {
  await requireAdmin();
  const d = await getAkademieData();
  return (
    <PageShell title="Heute" subtitle="Überblick · MAGALOKO V2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Drills" value={d.drills.length} href="/akademie/drills" />
        <Stat label="Marken" value={d.marken.length} href="/akademie/marken" />
        <Stat label="Einwände" value={d.einwaende.length} href="/akademie/einwaende" />
        <Stat label="Rollenspiele" value={d.rollenspiele.length} href="/akademie/rollenspiele" />
        <Stat label="Personas" value={d.personas.length} href="/akademie/personas" />
        <Stat label="Szenarien" value={d.szenarien.length} href="/akademie/szenarien" />
        <Stat label="Angebote" value={d.angebote.length} href="/akademie/angebote" />
      </div>
      <Card className="mt-6">
        <p className="text-sm text-muted">
          MAGALOKO <strong className="text-ink">V2</strong> (Next.js · ZENA-V3-Architektur). Die Akademie ist live;
          weitere Hubs (Cockpit, Stephan, Marktanalyse) folgen.
        </p>
      </Card>
    </PageShell>
  );
}
