import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, leverScore, formatEur, type Lever } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { LeverActions } from "@/components/cockpit/lever-editor";
import { RecordTimeline } from "@/components/cockpit/record-timeline";
import { getRecordHistory, LEVER_FIELDS } from "@/lib/history";

export const dynamic = "force-dynamic";

const Back = <Link href="/cockpit/hebel" className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink">← Hebel</Link>;

// Zusatzfelder generisch anzeigen (z. B. Beschreibung/Notizen), ohne die bekannten doppelt zu listen.
const KNOWN = new Set(["id", "title", "area", "status", "expectedimpacteur", "efforthours", "confidence", "risk"]);

export default async function HebelDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const key = decodeURIComponent(id);
  const { levers } = await getCockpitData();
  let l: Lever | undefined = levers.find((x) => x.id && x.id === key);
  if (!l && /^\d+$/.test(key)) l = levers[Number(key)];
  if (!l) notFound();

  const score = Math.round(leverScore(l));
  const history = await getRecordHistory("levers", l.id || key, LEVER_FIELDS);
  const extra = Object.entries(l as Record<string, unknown>).filter(
    ([k, v]) => !KNOWN.has(k.toLowerCase()) && typeof v === "string" && v.trim() !== "",
  );

  return (
    <PageShell title={l.title || "Hebel"} subtitle={l.area || undefined} action={Back}>
      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Pill tone={l.status === "Live" ? "green" : l.status === "Verworfen" ? "muted" : "accent"}>{l.status || "—"}</Pill>
            {l.confidence && <Pill tone="teal">Confidence: {l.confidence}</Pill>}
            {l.risk && <Pill tone="amber">Risiko: {l.risk}</Pill>}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Field label="Impact / Jahr" value={formatEur(l.expectedImpactEur)} mono accent />
            <Field label="Aufwand" value={l.effortHours ? `${l.effortHours} h` : "—"} mono />
            <Field label="ROI-Score" value={score.toLocaleString("de-AT")} mono />
            <Field label="Bereich" value={l.area} />
          </dl>
        </section>
        {extra.map(([k, v]) => (
          <section key={k} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">{k.replace(/([a-z])([A-Z])/g, "$1 $2")}</h2>
            <p className="whitespace-pre-wrap text-sm text-muted">{String(v)}</p>
          </section>
        ))}
        <LeverActions id={l.id || key} lever={l} />
        <RecordTimeline events={history} />
      </div>
    </PageShell>
  );
}

function Field({ label, value, mono, accent }: { label: string; value?: string; mono?: boolean; accent?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-2">{label}</dt>
      <dd className={`${mono ? "font-mono " : ""}${accent ? "font-bold text-green " : ""}text-sm`}>{value || "—"}</dd>
    </div>
  );
}
