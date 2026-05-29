import { requireAdmin } from "@/lib/auth-helpers";
import { PageShell } from "@/components/_primitives/page-shell";
import { EmptyState } from "@/components/_primitives/empty-state";

export const dynamic = "force-dynamic";

export default async function CockpitPage() {
  await requireAdmin();
  return (
    <PageShell title="Cockpit" subtitle="Tasks · Entscheidungen · Hebel · KPIs · Stephan">
      <EmptyState icon="🚧" title="Cockpit-Hub folgt" hint="Wird in der nächsten Phase aus der Live-App portiert (ZENA-V3-Stil)." />
    </PageShell>
  );
}
