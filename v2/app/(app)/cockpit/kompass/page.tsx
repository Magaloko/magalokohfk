import { requireAdmin } from "@/lib/auth-helpers";
import { getProdukteFuerPflege } from "@/lib/kompass";
import { PageShell } from "@/components/_primitives/page-shell";
import { KompassPflege } from "@/components/kompass/pflege";

export const dynamic = "force-dynamic";

// Cockpit-Pflege: Team bewertet die Eignung einzelner Kinderwagen (Overlay für den Finder).
export default async function KompassPflegePage() {
  await requireAdmin();
  const { produkte, eignung } = await getProdukteFuerPflege();
  return (
    <PageShell icon="compass" title="Kompass-Pflege" subtitle="Eignung der Kinderwagen bewerten — Basis für den Baby-Kompass-Finder">
      {!produkte.length ? (
        <div className="rounded-xl border border-line bg-surface p-6 text-sm text-muted shadow-sm">
          Noch keine Produkte importiert. Bitte Migration <code>0013_produkte.sql</code> einspielen und
          das Import-Skript <code>v2/scripts/import-kinderwagen.mjs</code> ausführen.
        </div>
      ) : (
        <KompassPflege produkte={produkte} eignung={eignung} />
      )}
    </PageShell>
  );
}
