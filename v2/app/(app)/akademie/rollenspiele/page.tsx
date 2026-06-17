import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Card, CardGrid, Pill } from "@/components/_primitives/card";
import { EmptyState } from "@/components/_primitives/empty-state";
import { RoleplayLauncher } from "@/components/akademie/roleplay-launcher";
import { NewRollenspielButton, RollenspielActions } from "@/components/akademie/rollenspiel-editor";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

export default async function RollenspielePage() {
  const sess = await requireArea("rollenspiele");
  const admin = isAdmin(sess);
  const { rollenspiele } = await getAkademieData();
  if (!rollenspiele.length) return <PageShell title="Rollenspiele" icon="mic" action={admin ? <NewRollenspielButton /> : undefined}><EmptyState title="Noch keine Rollenspiele" /></PageShell>;
  return (
    <PageShell title="Rollenspiele" icon="mic" subtitle={`${rollenspiele.length} Kundengespräche und Beratungsfälle`} action={admin ? <NewRollenspielButton /> : undefined}>
      <CardGrid>
        {rollenspiele.map((r, i) => (
          <Card key={r.id || i}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold">{r.titel || "Rollenspiel"}</h3>
              {r.verkaufstechnik && <Pill tone="accent">{r.verkaufstechnik}</Pill>}
            </div>
            {r.persona && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-2">
                <Icon name="user" className="h-3.5 w-3.5 shrink-0" /> {r.persona.split("(")[0].trim()}
              </p>
            )}
            {r.setting && <p className="mt-2 line-clamp-3 text-sm text-muted">{r.setting}</p>}
            <div className="mt-3 flex gap-3 text-xs text-muted-2">
              <span className="inline-flex items-center gap-1"><Icon name="target" className="h-3.5 w-3.5" /> €{r.ziel_aov || "—"}</span>
              <span>{(r.ablauf || []).length} Schritte</span>
              <span className="inline-flex items-center gap-1"><Icon name="chat" className="h-3.5 w-3.5" /> {(r.einwaende || []).length} Einwände</span>
            </div>
            <RoleplayLauncher rp={r} />
            {admin && <RollenspielActions id={r.id || String(rollenspiele.indexOf(r))} rp={r} />}
          </Card>
        ))}
      </CardGrid>
    </PageShell>
  );
}
