import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, type Decision } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { DecisionActions } from "@/components/cockpit/decision-editor";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { RecordTimeline } from "@/components/cockpit/record-timeline";
import { getRecordHistory, DECISION_FIELDS } from "@/lib/history";
import { getStephanMessagesForRef } from "@/lib/stephan-thread";

export const dynamic = "force-dynamic";

const Back = <Link href="/cockpit/entscheidungen" className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink">← Entscheidungen</Link>;

const KNOWN = new Set(["id", "titel", "title", "status", "frist", "kategorie", "empfehlung"]);
const statusTone = (s?: string): "amber" | "accent" | "green" | "muted" =>
  s === "entschieden" ? "green" : s === "verworfen" ? "muted" : s === "vorbereitet" ? "accent" : "amber";

export default async function DecisionDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const key = decodeURIComponent(id);
  const { decisions } = await getCockpitData();
  let d: Decision | undefined = decisions.find((x) => x.id && x.id === key);
  if (!d && /^\d+$/.test(key)) d = decisions[Number(key)];
  if (!d) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const overdue = d.frist && d.frist < today && d.status !== "entschieden" && d.status !== "verworfen";
  const history = await getRecordHistory("stephanDecisions", d.id || key, DECISION_FIELDS);
  const convo = await getStephanMessagesForRef("stephanDecisions", d.id || key);
  const extra = Object.entries(d as Record<string, unknown>).filter(
    ([k, v]) => !KNOWN.has(k.toLowerCase()) && typeof v === "string" && v.trim() !== "",
  );

  return (
    <PageShell title={d.titel || "Entscheidung"} subtitle={d.kategorie || undefined} action={Back}>
      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Pill tone={statusTone(d.status)}>{d.status || "offen"}</Pill>
            {d.frist && (
              <Pill tone={overdue ? "red" : "muted"}>
                <span className="flex items-center gap-1"><Icon name="clock" className="h-3 w-3" /> {d.frist}{overdue ? " (überfällig)" : ""}</span>
              </Pill>
            )}
            {d.kategorie && (
              <Pill tone="teal">
                <span className="flex items-center gap-1"><Icon name="folder" className="h-3 w-3" /> {d.kategorie}</span>
              </Pill>
            )}
          </div>
        </section>
        {d.empfehlung && (
          <section className="rounded-xl border-l-4 border-accent bg-surface p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">Empfehlung</h2>
            <p className="whitespace-pre-wrap text-sm text-muted">{d.empfehlung}</p>
          </section>
        )}
        {extra.map(([k, v]) => (
          <section key={k} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">{k.replace(/([a-z])([A-Z])/g, "$1 $2")}</h2>
            <p className="whitespace-pre-wrap text-sm text-muted">{String(v)}</p>
          </section>
        ))}
        <DecisionActions id={d.id || key} decision={d} />
        {convo.length > 0 && (
          <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="chat" className="h-3.5 w-3.5" />Gespräch mit Stephan ({convo.length})</h2>
              <Link href="/cockpit/stephan" className="text-xs font-semibold text-accent hover:underline">→ Stephan-Assistent</Link>
            </div>
            <ul className="flex flex-col gap-2.5">
              {convo.map((m) => {
                const mine = m.direction === "outgoing";
                return (
                  <li key={m.id} className={cn("max-w-[88%] rounded-xl border p-3", mine ? "ml-auto border-accent/30 bg-accent/5" : "mr-auto border-line bg-surface-2/50")}>
                    <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-2">
                      <span className="font-semibold">{mine ? "Du" : "Stephan"}</span>
                      <span>{new Date(m.occurred_at || m.created_at).toLocaleString("de-AT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        <RecordTimeline events={history} />
      </div>
    </PageShell>
  );
}
