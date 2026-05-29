import { requireUser } from "@/lib/auth-helpers";
import { listProposals, toPublic } from "@/lib/proposals";
import { PageShell } from "@/components/_primitives/page-shell";
import { ProposalBoard } from "@/components/werkstatt/proposal-board";

export const dynamic = "force-dynamic";

export default async function WerkstattPage() {
  const sess = await requireUser();
  const proposals = (await listProposals()).map((p) => toPublic(p, sess.email));
  return (
    <PageShell title="Werkstatt" icon="bulb" subtitle="Ideen, Einwand-Antworten & Lösungen einreichen, gemeinsam bewerten und diskutieren">
      <ProposalBoard initial={proposals} />
    </PageShell>
  );
}
