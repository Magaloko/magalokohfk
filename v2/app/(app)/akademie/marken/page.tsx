import { requireArea } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Card, CardGrid, Pill } from "@/components/_primitives/card";
import { EmptyState } from "@/components/_primitives/empty-state";

export const dynamic = "force-dynamic";
const txt = (v: unknown) => (typeof v === "string" ? v : (v as any)?.name || (v as any)?.argument || (v as any)?.text || "");

export default async function MarkenPage() {
  await requireArea("marken");
  const { marken } = await getAkademieData();
  if (!marken.length) return <PageShell title="Marken-Bibel"><EmptyState title="Noch keine Marken" /></PageShell>;
  return (
    <PageShell title="Marken-Bibel" subtitle={`${marken.length} Marken · Herkunft, USPs, Hero-Produkte`}>
      <CardGrid>
        {marken.map((m, i) => (
          <Card key={m.id || i}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold">{m.name}</h3>
              {m.herkunft?.land && <Pill tone="teal">{m.herkunft.land}</Pill>}
            </div>
            {m.philosophie && <p className="mt-2 text-sm italic text-muted">„{m.philosophie}"</p>}
            {!!(m.verkaufsargumente || m.usps || []).length && (
              <ul className="mt-3 space-y-1 text-sm">
                {(m.verkaufsargumente || m.usps || []).slice(0, 4).map((a, j) => <li key={j}>✓ {txt(a)}</li>)}
              </ul>
            )}
          </Card>
        ))}
      </CardGrid>
    </PageShell>
  );
}
