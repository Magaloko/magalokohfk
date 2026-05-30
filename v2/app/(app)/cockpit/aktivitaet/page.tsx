import { requireAdmin } from "@/lib/auth-helpers";
import { getRecentActivity } from "@/lib/history";
import { PageShell } from "@/components/_primitives/page-shell";
import { ActivityFeed } from "@/components/cockpit/activity-feed";

export const dynamic = "force-dynamic";

export default async function AktivitaetPage() {
  await requireAdmin();
  const items = await getRecentActivity(50);
  return (
    <PageShell icon="clock" title="Aktivität" subtitle="Letzte Änderungen an Hebeln, Tasks & Entscheidungen — wer, wann, was">
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <ActivityFeed items={items} />
      </div>
    </PageShell>
  );
}
