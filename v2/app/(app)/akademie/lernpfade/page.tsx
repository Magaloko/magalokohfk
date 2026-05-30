import { requireUser, allowedAreas, AKADEMIE_AREAS } from "@/lib/auth-helpers";
import { getProgress } from "@/lib/progress";
import { PATHS } from "@/lib/paths";
import { PageShell } from "@/components/_primitives/page-shell";
import { PathCard } from "@/components/akademie/path-card";

export const dynamic = "force-dynamic";

export default async function LernpfadePage() {
  const sess = await requireUser();
  const progress = await getProgress(sess.email);
  const paths = progress?.stats.paths || {};
  const byType = progress?.stats.byType || {};
  // Nur Pfade zeigen, deren Akademie-Bereiche alle freigeschaltet sind (Cockpilot-Schritte zählen nicht als Bereich).
  const allowed = allowedAreas(sess) as string[];
  const visible = PATHS.filter((p) => p.steps.every((s) => {
    const a = /\/akademie\/([a-z]+)/.exec(s.href)?.[1];
    return !a || !(AKADEMIE_AREAS as readonly string[]).includes(a) || allowed.includes(a);
  }));
  return (
    <PageShell title="Lernpfade" icon="compass" subtitle="Geführte Kurse — Schritt für Schritt zum Verkaufs-Profi · +60 XP pro Abschluss">
      {visible.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((p) => <PathCard key={p.id} path={p} initial={paths[p.id] || []} autoDone={p.steps.map((s, i) => (s.auto?.some((t) => (byType[t] || 0) >= 1) ? i : -1)).filter((i) => i >= 0)} />)}
        </div>
      ) : <p className="text-sm text-muted-2">Für deine freigeschalteten Bereiche sind aktuell keine Lernpfade verfügbar.</p>}
    </PageShell>
  );
}
