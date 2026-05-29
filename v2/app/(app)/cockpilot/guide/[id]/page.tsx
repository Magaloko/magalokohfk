import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { getProgress } from "@/lib/progress";
import { getGuide, appLabel } from "@/lib/copilot-kb";
import { PageShell } from "@/components/_primitives/page-shell";
import { Icon } from "@/components/icon";
import { GuideRunner } from "@/components/cockpilot/guide-runner";

export const dynamic = "force-dynamic";

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = getGuide(id);
  if (!guide) notFound();

  const sess = await requireUser();
  const progress = await getProgress(sess.email);
  const initialDone = (progress?.stats.paths?.[`copilot:${guide.id}`] || []).filter((s) => s >= 0 && s < guide.steps.length);

  return (
    <PageShell title={guide.title} icon="sparkles" subtitle={`${appLabel(guide.app)} · ~${guide.minutes} Min · ${guide.goal}`}>
      <div className="mb-4">
        <Link href="/cockpilot" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-2 hover:text-ink">
          <Icon name="arrow-right" className="h-3.5 w-3.5 rotate-180" />Zurück zum Cockpilot
        </Link>
      </div>

      <GuideRunner guideId={guide.id} steps={guide.steps} initialDone={initialDone} />

      {guide.tips?.length ? (
        <div className="mt-5 rounded-xl border border-line bg-surface p-4 shadow-sm">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="bulb" className="h-3.5 w-3.5" />Tipps</h2>
          <ul className="flex flex-col gap-1.5 text-sm text-muted">
            {guide.tips.map((t, i) => <li key={i} className="flex gap-2"><Icon name="dot" className="mt-1.5 h-1.5 w-1.5 shrink-0 text-accent" />{t}</li>)}
          </ul>
        </div>
      ) : null}
    </PageShell>
  );
}
