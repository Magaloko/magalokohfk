import { requireAdmin } from "@/lib/auth-helpers";
import { MASTERMIND } from "@/lib/strategy";
import { getMastermindAntworten, getMastermindVorgaenge, getMastermindToolStatus } from "@/lib/mastermind";
import { PageShell } from "@/components/_primitives/page-shell";
import { PlanView } from "@/components/mastermind/plan-view";

export const dynamic = "force-dynamic";

// MasterMind — Stephans Strategie & Roadmap. Admin-Heim (Root-Redirect zeigt hierher).
// Render-Body liegt in components/mastermind/plan-view.tsx (Single Source: lib/strategy.ts).
export default async function MasterMindPage() {
  await requireAdmin();
  const m = MASTERMIND;
  const [antworten, vorgaenge, toolStatus] = await Promise.all([
    getMastermindAntworten(), getMastermindVorgaenge(), getMastermindToolStatus(),
  ]);

  return (
    <PageShell icon="compass" title="Strategie & Roadmap" subtitle={`MasterMind — der Plan von Stephan · ${m.version}`}>
      <PlanView antworten={antworten} vorgaenge={vorgaenge} toolStatus={toolStatus} />
    </PageShell>
  );
}
