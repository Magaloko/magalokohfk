import Link from "next/link";
import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Card, CardGrid } from "@/components/_primitives/card";
import { EmptyState } from "@/components/_primitives/empty-state";
import { NewPersonaButton } from "@/components/akademie/persona-editor";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";
const s = (v: unknown) => (typeof v === "string" ? v : v ? JSON.stringify(v) : "");

export default async function PersonasPage() {
  const sess = await requireArea("personas");
  const admin = isAdmin(sess);
  const { personas } = await getAkademieData();
  if (!personas.length) return <PageShell title="Personas" icon="users" action={admin ? <NewPersonaButton /> : undefined}><EmptyState title="Noch keine Personas" /></PageShell>;
  return (
    <PageShell title="Kunden-Personas" icon="users" subtitle={`${personas.length} Typen`} action={admin ? <NewPersonaButton /> : undefined}>
      <CardGrid>
        {personas.map((p, i) => (
          <Link key={p.id || i} href={`/akademie/personas/${encodeURIComponent(p.id || String(i))}`} className="group block">
            <Card className="h-full group-hover:border-accent">
              <div className="flex items-center gap-2">
                <Icon name="user" className="h-5 w-5 text-muted-2 shrink-0" />
                <h3 className="font-bold">{p.name}</h3>
              </div>
              {(p.alter || p.kontext) && <p className="mt-1 text-xs text-muted-2">{[p.alter, p.kontext].filter(Boolean).join(" · ")}</p>}
              {p.zitat && <p className="mt-2 line-clamp-2 text-sm italic text-muted">„{p.zitat}"</p>}
              {!!p.schmerzpunkte && <p className="mt-2 line-clamp-2 text-sm"><span className="text-muted-2">Schmerz:</span> {s(p.schmerzpunkte)}</p>}
              <span className="mt-3 inline-block text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">Details →</span>
            </Card>
          </Link>
        ))}
      </CardGrid>
    </PageShell>
  );
}
