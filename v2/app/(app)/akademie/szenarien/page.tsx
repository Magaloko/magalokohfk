import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Card, CardGrid, Pill } from "@/components/_primitives/card";
import { EmptyState } from "@/components/_primitives/empty-state";
import { SzenarioLauncher } from "@/components/akademie/szenario-launcher";
import { NewSzenarioButton, SzenarioActions } from "@/components/akademie/szenario-editor";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

export default async function SzenarienPage() {
  const sess = await requireArea("szenarien");
  const admin = isAdmin(sess);
  const { szenarien, personas } = await getAkademieData();
  const slimPersonas = personas.map((p) => ({ id: p.id, name: p.name }));
  if (!szenarien.length) return <PageShell title="Trainings-Szenarien" icon="scenario" action={admin ? <NewSzenarioButton personas={slimPersonas} /> : undefined}><EmptyState title="Noch keine Szenarien" /></PageShell>;
  const personaName = (id?: string) => personas.find((p) => p.id === id)?.name;

  return (
    <PageShell title="Trainings-Szenarien" icon="scenario" subtitle={`${szenarien.length} mehrstufige Übungen`} action={admin ? <NewSzenarioButton personas={slimPersonas} /> : undefined}>
      <CardGrid>
        {szenarien.map((s, i) => {
          const steps = (s.steps || []).length;
          const pName = personaName(s.personaId);
          return (
            <Card key={s.id || i}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold">{s.name || "Szenario"}</h3>
                {s.schwierigkeit && <Pill tone="amber">{s.schwierigkeit}</Pill>}
              </div>
              {pName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-2">
                  <Icon name="user" className="h-3.5 w-3.5 shrink-0" /> {pName}
                </p>
              )}
              {s.situation && <p className="mt-2 line-clamp-3 text-sm text-muted">{s.situation}</p>}
              <div className="mt-3 flex gap-3 text-xs text-muted-2">
                <span>{steps} {steps === 1 ? "Schritt" : "Schritte"}</span>
              </div>
              <SzenarioLauncher sc={s} personaName={pName} />
              {admin && <SzenarioActions id={s.id || String(szenarien.indexOf(s))} szenario={s} personas={slimPersonas} />}
            </Card>
          );
        })}
      </CardGrid>
    </PageShell>
  );
}
