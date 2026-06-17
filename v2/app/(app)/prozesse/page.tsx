import { PageShell } from "@/components/_primitives/page-shell";
import { Card, Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { ProcessGameBoard } from "@/components/process/process-game-board";
import { requireAdmin } from "@/lib/auth-helpers";
import { getProcessRuns, processStats } from "@/lib/process-game";

export const dynamic = "force-dynamic";

export default async function ProzessePage() {
  await requireAdmin();
  const runs = await getProcessRuns();
  const stats = processStats(runs);
  const level = Math.max(1, Math.floor(stats.points / 250) + 1);
  const next = level * 250;
  const progress = Math.min(100, Math.round((stats.points / next) * 100));

  return (
    <PageShell title="Prozess-Spiel" icon="package" subtitle="Einkaufslogik, Systemsignale und Unternehmensentscheidungen als prüfbare Spielzüge.">
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <Card className="rounded-lg">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-2">Level</div>
          <div className="mt-1 flex items-end gap-2">
            <div className="text-3xl font-extrabold">{level}</div>
            <Pill tone="accent">{stats.points} Punkte</Pill>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        </Card>
        <Metric icon="check" label="Spielzüge" value={stats.total} />
        <Metric icon="rocket" label="Umgesetzt" value={stats.implemented} />
        <Card className="rounded-lg md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-2">Stärkster Bereich</div>
          <div className="mt-2 text-xl font-extrabold">{stats.byArea[0]?.area || "Noch offen"}</div>
          <p className="mt-1 text-sm text-muted">{stats.byArea[0] ? `${stats.byArea[0].points} Punkte aus ${stats.byArea[0].count} Spielzügen` : "Erster Prozess wartet."}</p>
        </Card>
      </div>
      <ProcessGameBoard initial={runs} />
    </PageShell>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <Card className="rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-muted-2">{label}</div>
          <div className="mt-1 text-3xl font-extrabold">{value}</div>
        </div>
        <Icon name={icon} className="h-7 w-7 text-accent" />
      </div>
    </Card>
  );
}
