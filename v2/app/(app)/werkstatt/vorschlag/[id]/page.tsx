import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, isAdmin } from "@/lib/auth-helpers";
import { getProposal, toPublic } from "@/lib/proposals";
import { PageShell } from "@/components/_primitives/page-shell";
import { Icon } from "@/components/icon";
import { ProposalDetail } from "@/components/werkstatt/proposal-detail";

export const dynamic = "force-dynamic";

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sess = await requireUser();
  const raw = await getProposal(id);
  if (!raw) notFound();
  const proposal = toPublic(raw, sess.email);

  return (
    <PageShell title="Vorschlag" icon="bulb">
      <div className="mb-4">
        <Link href="/werkstatt" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-2 hover:text-ink">
          <Icon name="arrow-right" className="h-3.5 w-3.5 rotate-180" />Zurück zur Werkstatt
        </Link>
      </div>
      <ProposalDetail initial={proposal} admin={isAdmin(sess)} />
    </PageShell>
  );
}
