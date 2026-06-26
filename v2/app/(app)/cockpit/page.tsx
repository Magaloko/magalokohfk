import Link from "next/link";
import { requireAdmin, isSuperAdmin } from "@/lib/auth-helpers";
import { getCockpitData, isTaskOpen, type Task, type Decision, type UmsetzungItem } from "@/lib/cockpit";
import { getMagoData } from "@/lib/mago";
import { UMSETZUNGS_BLOECKE } from "@/lib/phases";
import { SEBO_SYSTEM_STATUS } from "@/lib/sebo-system-status";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { BriefingCopy } from "@/components/cockpit/briefing-copy";
import { MagoCommandCenter } from "@/components/mago/mago-command-center";

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const openDecision = (d: Decision) => ["offen", "vorbereitet", "Offen", "Empfohlen"].includes(String(d.status || "offen"));
const doneTask = (t: Task) => String(t.status || "") === "Erledigt";
const blockedTask = (t: Task) => /warte|block/i.test(String(t.status || "") + " " + String(t.notes || ""));
const priorityRank = (t: Task) => String(t.priority || "").toLowerCase() === "hoch" ? 0 : String(t.priority || "").toLowerCase() === "mittel" ? 1 : 2;
const itemOpen = (x: UmsetzungItem) => String(x.status || "offen").toLowerCase() !== "erledigt";

function recent(d?: unknown) {
  const t = Date.parse(String(d || ""));
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  return now - t <= WEEK_MS && t <= now + 24 * 60 * 60 * 1000;
}

function taskLabel(t: Task) {
  return [t.title, t.area || t.phase, t.owner ? `Owner: ${t.owner}` : "", t.dueDate ? `bis ${t.dueDate}` : ""].filter(Boolean).join(" · ");
}

function umsetzungLabel(x: UmsetzungItem) {
  return [x.titel, x.wer ? `bei ${x.wer}` : "", x.phase || "", x.datum || ""].filter(Boolean).join(" · ");
}

function MiniStat({ href, icon, label, value, tone = "accent", sub }: { href: string; icon: string; label: string; value: number | string; tone?: "muted" | "accent" | "green" | "amber" | "red" | "teal"; sub?: string }) {
  return (
    <Link href={href} className="rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
      <div className="flex items-center justify-between gap-3">
        <Icon name={icon} className={`h-5 w-5 ${tone === "red" ? "text-red" : tone === "green" ? "text-green" : tone === "amber" ? "text-amber" : tone === "teal" ? "text-teal" : "text-accent"}`} />
        <span className={`text-2xl font-extrabold ${tone === "red" ? "text-red" : ""}`}>{value}</span>
      </div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-2">{sub}</div>}
    </Link>
  );
}

function WorkList({ title, icon, items, empty, tone = "accent" }: { title: string; icon: string; items: string[]; empty: string; tone?: "accent" | "green" | "amber" | "red" | "teal" }) {
  const color = tone === "red" ? "text-red" : tone === "green" ? "text-green" : tone === "amber" ? "text-amber" : tone === "teal" ? "text-teal" : "text-accent";
  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-bold"><Icon name={icon} className={`h-4 w-4 ${color}`} />{title}</h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted-2">{items.length}</span>
      </div>
      {items.length ? (
        <ul className="mt-3 grid gap-2">
          {items.map((item, i) => (
            <li key={`${item}-${i}`} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
              <Icon name="dot" className={`mt-1 h-2.5 w-2.5 shrink-0 ${color}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : <p className="mt-3 text-sm text-muted-2">{empty}</p>}
    </section>
  );
}

export default async function CockpitOverview() {
  const sess = await requireAdmin();
  const [c, m] = await Promise.all([getCockpitData(), isSuperAdmin(sess) ? getMagoData() : Promise.resolve(null)]);
  const today = new Date().toISOString().slice(0, 10);

  const openTasks = c.tasks.filter(isTaskOpen);
  const taskDone = c.tasks.filter(doneTask);
  const decisions = c.decisions.filter(openDecision);
  const waiting = c.umsetzung.filter((x) => itemOpen(x) && ["Zugang", "Freigabe", "Abstimmung"].includes(String(x.typ || "")));
  const blockers = [
    ...c.umsetzung.filter((x) => itemOpen(x) && ["Blocker", "Risiko"].includes(String(x.typ || ""))).map(umsetzungLabel),
    ...openTasks.filter(blockedTask).map(taskLabel),
  ].slice(0, 8);
  const doneThisWeek = [
    ...taskDone.map(taskLabel),
    ...c.umsetzung.filter((x) => !itemOpen(x) && recent(x.datum)).map(umsetzungLabel),
    ...((m?.protokoll || []).filter((p) => ["Geliefert", "Abgenommen"].includes(String(p.status || "")) && recent(p.datum)).map((p) => String(p.titel || "")).filter(Boolean)),
  ].slice(0, 8);

  const focus = [...UMSETZUNGS_BLOECKE].sort((a, b) => a.step - b.step).find((b) => openTasks.some((t) => b.phaseKeys.includes(String(t.phase || ""))));
  const nextTasks = [...openTasks]
    .sort((a, b) => priorityRank(a) - priorityRank(b) || String(a.dueDate || "9999").localeCompare(String(b.dueDate || "9999")))
    .slice(0, 8)
    .map(taskLabel);
  const waitingItems = waiting.map(umsetzungLabel).slice(0, 8);
  const decisionItems = decisions.map((d) => [d.titel, d.kategorie, d.frist ? `Frist: ${d.frist}` : ""].filter(Boolean).join(" · ")).slice(0, 8);

  const statusTone = blockers.length ? "red" : waiting.length || decisions.length ? "amber" : "green";
  const systemHealth = blockers.length ? "Kritisch prüfen" : waiting.length || decisions.length ? "Auf Antworten warten" : "Arbeitsfähig";

  const briefingSections = [
    { title: "Systemstatus", items: [`${systemHealth}`, `Fokus: ${focus ? `${focus.label} (Schritt ${focus.step})` : "keine Phase aktiv"}`] },
    { title: "Nächste Schritte", items: nextTasks.length ? nextTasks.slice(0, 5) : ["Keine offenen Tasks erfasst."] },
    { title: "Wartet auf", items: waitingItems.length ? waitingItems.slice(0, 5) : ["Keine offenen Zugänge, Freigaben oder Abstimmungen."] },
    { title: "Blocker / Risiken", items: blockers.length ? blockers.slice(0, 5) : ["Keine Blocker erfasst."] },
    { title: "Entscheidungen von Stephan", items: decisionItems.length ? decisionItems.slice(0, 5) : ["Keine offenen Entscheidungen erfasst."] },
    { title: "Erledigt", items: doneThisWeek.length ? doneThisWeek.slice(0, 5) : ["Diese Woche noch nichts als erledigt erfasst."] },
  ];
  const briefingText = [`Stephan-Update — ${today}`, ""]
    .concat(briefingSections.flatMap((s) => [s.title.toUpperCase() + ":", ...s.items.map((x) => `- ${x}`), ""]))
    .join("\n").trim();

  return (
    <PageShell
      icon="cockpit"
      title="Heute & Steuerung"
      subtitle="Was offen ist, worauf gewartet wird, was erledigt ist und was Stephan wissen muss."
      action={
        <>
          <BriefingCopy text={briefingText} />
          <Link href="/cockpit/briefing" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink">
            <Icon name="send" className="h-4 w-4" /> Briefing
          </Link>
        </>
      }
    >
      <section className={`rounded-xl border p-5 shadow-sm ${statusTone === "red" ? "border-red/40 bg-red/10" : statusTone === "amber" ? "border-amber/40 bg-amber/10" : "border-green/40 bg-green/10"}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${statusTone === "red" ? "text-red" : statusTone === "amber" ? "text-amber" : "text-green"}`}>
              <Icon name={statusTone === "red" ? "alert" : statusTone === "amber" ? "clock" : "check"} className="h-3.5 w-3.5" /> Arbeitslage
            </div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">{systemHealth}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              {focus ? `Aktueller Fokus ist ${focus.label}. ` : "Aktuell ist keine Roadmap-Phase als Fokus erkennbar. "}
              {blockers.length ? "Es gibt Blocker oder Risiken, die zuerst geklärt werden müssen." : waiting.length ? "Mehrere Punkte warten auf Rückmeldung, Zugang oder Freigabe." : "Keine akuten Blocker in den Cockpit-Daten."}
            </p>
          </div>
          <Pill tone={statusTone}>{focus ? `Schritt ${focus.step}` : "kein Fokus"}</Pill>
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MiniStat href="/cockpit/tasks" icon="check" label="Offene Tasks" value={openTasks.length} tone={openTasks.length ? "amber" : "green"} sub={`${taskDone.length} erledigt`} />
        <MiniStat href="/cockpit/entscheidungen" icon="compass" label="Entscheidungen" value={decisions.length} tone={decisions.length ? "red" : "green"} sub="von Stephan / GF" />
        <MiniStat href="/cockpit/umsetzung?typ=Blocker" icon="alert" label="Blocker/Risiken" value={blockers.length} tone={blockers.length ? "red" : "green"} sub="zuerst klären" />
        <MiniStat href="/cockpit/umsetzung" icon="clock" label="Wartet auf" value={waiting.length} tone={waiting.length ? "amber" : "green"} sub="Zugang, Freigabe, Abstimmung" />
        <MiniStat href="/cockpit/system" icon="globe" label="Systemmodule" value={SEBO_SYSTEM_STATUS.summary.length} tone="teal" sub="SeBo Gesamtstand" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="grid gap-4">
          <WorkList title="Nächste konkrete Schritte" icon="target" items={nextTasks} empty="Keine offenen Aufgaben erfasst." tone="accent" />
          <div className="grid gap-4 lg:grid-cols-2">
            <WorkList title="Wartet auf" icon="clock" items={waitingItems} empty="Nichts wartet auf Rückmeldung." tone="amber" />
            <WorkList title="Blocker & Risiken" icon="alert" items={blockers} empty="Keine Blocker oder Risiken erfasst." tone={blockers.length ? "red" : "green"} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <WorkList title="Offene Entscheidungen" icon="compass" items={decisionItems} empty="Keine offenen Entscheidungen." tone="red" />
            <WorkList title="Erledigt / geliefert" icon="check" items={doneThisWeek} empty="Noch nichts als erledigt erfasst." tone="green" />
          </div>
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-1.5 text-sm font-bold"><Icon name="send" className="h-4 w-4 text-accent" />Stephan-Update</h2>
              <BriefingCopy text={briefingText} />
            </div>
            <pre className="mt-3 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-bg p-3 text-xs leading-relaxed text-muted">{briefingText}</pre>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <h2 className="flex items-center gap-1.5 text-sm font-bold"><Icon name="globe" className="h-4 w-4 text-teal" />Modulstatus</h2>
            <div className="mt-3 grid gap-2">
              {SEBO_SYSTEM_STATUS.summary.map((s) => (
                <Link key={s.label} href="/cockpit/system" className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2 transition hover:border-accent">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{s.label}</span>
                    <span className="block truncate text-xs text-muted-2">{s.note}</span>
                  </span>
                  <Pill tone={s.tone}>{s.value}</Pill>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-6">
        <MagoCommandCenter />
      </div>
    </PageShell>
  );
}
