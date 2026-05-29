import { requireUser } from "@/lib/auth-helpers";
import { listProposals } from "@/lib/proposals";
import { PageShell } from "@/components/_primitives/page-shell";
import { ProposalBoard } from "@/components/werkstatt/proposal-board";

export const dynamic = "force-dynamic";

export default async function WerkstattPage() {
  await requireUser();
  const proposals = await listProposals();
  return (
    <PageShell title="Werkstatt" icon="bulb" subtitle="Ideen, Einwand-Antworten & Lösungen einreichen, gemeinsam bewerten und diskutieren">
      <ProposalBoard initial={proposals} />
    </PageShell>
  );
}
