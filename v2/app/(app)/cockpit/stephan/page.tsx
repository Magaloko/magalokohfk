import { requireAdmin } from "@/lib/auth-helpers";
import { aiConfigured } from "@/lib/ai";
import { getCockpitData } from "@/lib/cockpit";
import { getStephanThread } from "@/lib/stephan-thread";
import { PageShell } from "@/components/_primitives/page-shell";
import { StephanAssist } from "@/components/cockpit/stephan-assist";

export const dynamic = "force-dynamic";

export default async function StephanPage() {
  await requireAdmin();
  const [thread, { decisions }] = await Promise.all([getStephanThread(), getCockpitData()]);
  const openDecisions = decisions
    .filter((d) => (d.status || "offen") !== "entschieden" && d.status !== "verworfen")
    .map((d) => ({ id: String(d.id || ""), titel: d.titel || "Entscheidung" }))
    .filter((d) => d.id);
  return (
    <PageShell title="Stephan-Assistent" icon="chat" subtitle="Antwort entwerfen · Gespräch festhalten · auf Basis der MAGALOKO-Daten">
      <StephanAssist configured={aiConfigured()} thread={thread} openDecisions={openDecisions} />
    </PageShell>
  );
}
