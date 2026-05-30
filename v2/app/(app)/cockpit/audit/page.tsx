import { requireAdmin } from "@/lib/auth-helpers";
import { aiConfigured } from "@/lib/ai";
import { collectQA } from "@/lib/qa-audit";
import { PageShell } from "@/components/_primitives/page-shell";
import { QaAuditClient } from "@/components/cockpit/qa-audit-client";

export const dynamic = "force-dynamic";

export default async function QaAuditPage() {
  await requireAdmin();
  const items = await collectQA();
  return (
    <PageShell title="Q&A-Audit" icon="check" subtitle="Alle Lern-Inhalte auf Deutsch & Sprachqualität prüfen — Heuristik markiert Verdächtige, KI prüft & korrigiert">
      <QaAuditClient items={items} configured={aiConfigured()} />
    </PageShell>
  );
}
