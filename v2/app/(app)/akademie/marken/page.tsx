import Link from "next/link";
import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Card, CardGrid, Pill } from "@/components/_primitives/card";
import { EmptyState } from "@/components/_primitives/empty-state";
import { NewMarkeButton } from "@/components/akademie/marke-editor";

export const dynamic = "force-dynamic";
const txt = (v: unknown) => (typeof v === "string" ? v : (v as any)?.name || (v as any)?.argument || (v as any)?.text || "");

export default async function MarkenPage() {
  const sess = await requireArea("marken");
  const admin = isAdmin(sess);
  const { marken } = await getAkademieData();
  if (!marken.length) return <PageShell title="Marken-Bibel" action={admin ? <NewMarkeButton /> : undefined}><EmptyState title="Noch keine Marken" /></PageShell>;
  return (
    <PageShell title="Marken-Bibel" subtitle={`${marken.length} Marken · Herkunft, USPs, Hero-Produkte`} action={admin ? <NewMarkeButton /> : undefined}>
      <CardGrid>
        {marken.map((m, i) => (
          <Link key={m.id || i} href={`/akademie/marken/${encodeURIComponent(m.id || String(i))}`} className="group block">
            <Card className="h-full group-hover:border-accent">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold">{m.name}</h3>
                {m.herkunft?.land && <Pill tone="teal">{m.herkunft.land}</Pill>}
              </div>
              {m.philosophie && <p className="mt-2 line-clamp-2 text-sm italic text-muted">„{m.philosophie}"</p>}
              {!!(m.verkaufsargumente || m.usps || []).length && (
                <ul className="mt-3 space-y-1 text-sm">
                  {(m.verkaufsargumente || m.usps || []).slice(0, 3).map((a, j) => <li key={j}>✓ {txt(a)}</li>)}
                </ul>
              )}
              <span className="mt-3 inline-block text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">Details →</span>
            </Card>
          </Link>
        ))}
      </CardGrid>
    </PageShell>
  );
}
