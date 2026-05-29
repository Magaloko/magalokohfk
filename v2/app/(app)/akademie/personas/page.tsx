import { requireArea } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Card, CardGrid } from "@/components/_primitives/card";
import { EmptyState } from "@/components/_primitives/empty-state";

export const dynamic = "force-dynamic";
const s = (v: unknown) => (typeof v === "string" ? v : v ? JSON.stringify(v) : "");

export default async function PersonasPage() {
  await requireArea("personas");
  const { personas } = await getAkademieData();
  if (!personas.length) return <PageShell title="Personas"><EmptyState title="Noch keine Personas" /></PageShell>;
  return (
    <PageShell title="Kunden-Personas" subtitle={`${personas.length} Typen`}>
      <CardGrid>
        {personas.map((p, i) => (
          <Card key={p.id || i}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{p.avatar || "👤"}</span>
              <h3 className="font-bold">{p.name}</h3>
            </div>
            {(p.alter || p.kontext) && <p className="mt-1 text-xs text-muted-2">{[p.alter, p.kontext].filter(Boolean).join(" · ")}</p>}
            {p.zitat && <p className="mt-2 text-sm italic text-muted">„{p.zitat}"</p>}
            {p.schmerzpunkte && <p className="mt-2 text-sm"><span className="text-muted-2">Schmerz:</span> {s(p.schmerzpunkte)}</p>}
            {p.budget && <p className="mt-1 text-sm"><span className="text-muted-2">Budget:</span> {s(p.budget)}</p>}
          </Card>
        ))}
      </CardGrid>
    </PageShell>
  );
}
