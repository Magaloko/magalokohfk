import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Card, CardGrid, Pill } from "@/components/_primitives/card";
import { EmptyState } from "@/components/_primitives/empty-state";
import { NewAngebotButton, AngebotActions } from "@/components/akademie/angebot-editor";

export const dynamic = "force-dynamic";

export default async function AngebotePage() {
  const sess = await requireArea("angebote");
  const admin = isAdmin(sess);
  const { angebote } = await getAkademieData();
  if (!angebote.length) return <PageShell title="Beratungsangebote" icon="package" action={admin ? <NewAngebotButton /> : undefined}><EmptyState title="Noch keine Angebote" /></PageShell>;
  return (
    <PageShell title="Beratungsangebote" icon="package" subtitle={`${angebote.length} Angebote`} action={admin ? <NewAngebotButton /> : undefined}>
      <CardGrid>
        {angebote.map((a, i) => (
          <Card key={a.id || i}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold">{a.name}</h3>
              {a.preis && <Pill tone="green">{a.preis}</Pill>}
            </div>
            {a.dauer && <p className="mt-1 text-xs text-muted-2">{a.dauer}{a.zielgruppe ? ` · ${a.zielgruppe}` : ""}</p>}
            {a.inhalt && <p className="mt-2 text-sm text-muted">{a.inhalt}</p>}
            {a.ergebnis && <p className="mt-2 text-sm"><span className="text-muted-2">Ergebnis:</span> {a.ergebnis}</p>}
            {admin && <AngebotActions id={a.id || String(angebote.indexOf(a))} angebot={a} />}
          </Card>
        ))}
      </CardGrid>
    </PageShell>
  );
}
