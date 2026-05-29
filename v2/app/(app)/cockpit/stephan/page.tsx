import { requireAdmin } from "@/lib/auth-helpers";
import { aiConfigured } from "@/lib/ai";
import { PageShell } from "@/components/_primitives/page-shell";
import { StephanAssist } from "@/components/cockpit/stephan-assist";

export const dynamic = "force-dynamic";

export default async function StephanPage() {
  await requireAdmin();
  return (
    <PageShell title="Stephan-Assistent" icon="chat" subtitle="Nachricht einfügen → Antwortvorschlag, ausschließlich auf Basis der MAGALOKO-Daten">
      <StephanAssist configured={aiConfigured()} />
    </PageShell>
  );
}
