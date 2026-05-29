import { requireUser } from "@/lib/auth-helpers";
import { getProgress } from "@/lib/progress";
import { PATHS } from "@/lib/paths";
import { PageShell } from "@/components/_primitives/page-shell";
import { PathCard } from "@/components/akademie/path-card";

export const dynamic = "force-dynamic";

export default async function LernpfadePage() {
  const sess = await requireUser();
  const progress = await getProgress(sess.email);
  const paths = progress?.stats.paths || {};
  return (
    <PageShell title="Lernpfade" icon="compass" subtitle="Geführte Kurse — Schritt für Schritt zum Verkaufs-Profi · +60 XP pro Abschluss">
      <div className="grid gap-4 lg:grid-cols-2">
        {PATHS.map((p) => <PathCard key={p.id} path={p} initial={paths[p.id] || []} />)}
      </div>
    </PageShell>
  );
}
