import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Card, CardGrid, Pill } from "@/components/_primitives/card";
import { EmptyState } from "@/components/_primitives/empty-state";
import { RoleplayLauncher } from "@/components/akademie/roleplay-launcher";
import { NewRollenspielButton, RollenspielActions } from "@/components/akademie/rollenspiel-editor";

export const dynamic = "force-dynamic";

export default async function RollenspielePage() {
  const sess = await requireArea("rollenspiele");
  const admin = isAdmin(sess);
  const { rollenspiele } = await getAkademieData();
  if (!rollenspiele.length) return <PageShell title="Rollenspiele" action={admin ? <NewRollenspielButton /> : undefined}><EmptyState title="Noch keine Rollenspiele" /></PageShell>;
  return (
    <PageShell title="Rollenspiele" subtitle={`${rollenspiele.length} trainer-geführte Szenarien`} action={admin ? <NewRollenspielButton /> : undefined}>
      <CardGrid>
        {rollenspiele.map((r, i) => (
          <Card key={r.id || i}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold">{r.titel || "Rollenspiel"}</h3>
              {r.verkaufstechnik && <Pill tone="accent">{r.verkaufstechnik}</Pill>}
            </div>
            {r.persona && <p className="mt-1 text-xs text-muted-2">👤 {r.persona.split("(")[0].trim()}</p>}
            {r.setting && <p className="mt-2 line-clamp-3 text-sm text-muted">{r.setting}</p>}
            <div className="mt-3 flex gap-3 text-xs text-muted-2">
              <span>🎯 €{r.ziel_aov || "—"}</span>
              <span>🛠 {(r.ablauf || []).length} Schritte</span>
              <span>💬 {(r.einwaende || []).length} Einwände</span>
            </div>
            <RoleplayLauncher rp={r} />
            {admin && <RollenspielActions id={r.id || String(rollenspiele.indexOf(r))} rp={r} />}
          </Card>
        ))}
      </CardGrid>
    </PageShell>
  );
}
