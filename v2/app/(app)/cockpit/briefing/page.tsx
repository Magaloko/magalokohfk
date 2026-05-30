import Link from "next/link";
import { getCockpitData, isTaskOpen } from "@/lib/cockpit";
import { getMagoData } from "@/lib/mago";
import { UMSETZUNGS_BLOECKE } from "@/lib/phases";
import { PageShell } from "@/components/_primitives/page-shell";
import { Icon } from "@/components/icon";
import { BriefingCopy } from "@/components/cockpit/briefing-copy";

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
function thisWeek(d?: unknown): boolean {
  const t = Date.parse(String(d || ""));
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  return now - t <= WEEK_MS && t <= now + 24 * 60 * 60 * 1000;
}

export default async function BriefingPage() {
  const [c, m] = await Promise.all([getCockpitData(), getMagoData()]);
  const today = new Date().toISOString().slice(0, 10);

  const erledigt = (m.protokoll || [])
    .filter((p) => ["Geliefert", "Abgenommen"].includes(String(p.status || "")) && thisWeek(p.datum))
    .map((p) => String(p.titel || "")).filter(Boolean);

  const byTyp = (typ: string) => (c.umsetzung || []).filter((x) => x.typ === typ && (x.status || "offen") !== "erledigt");
  const blocker = byTyp("Blocker"), zugaenge = byTyp("Zugang"), freigaben = byTyp("Freigabe"), abstimmung = byTyp("Abstimmung"), risiko = byTyp("Risiko");
  const entsch = (c.decisions || []).filter((d) => ["offen", "vorbereitet"].includes(String(d.status || "offen")));

  const openTasks = (c.tasks || []).filter(isTaskOpen);
  const focus = [...UMSETZUNGS_BLOECKE].sort((a, b) => a.step - b.step).find((b) => openTasks.some((t) => b.phaseKeys.includes(String(t.phase || ""))));
  const naechste = focus ? openTasks.filter((t) => focus.phaseKeys.includes(String(t.phase || ""))).map((t) => String(t.title || "")).filter(Boolean).slice(0, 4) : [];

  const sections: { icon: string; title: string; items: string[]; empty: string }[] = [
    { icon: "check", title: "Erledigt diese Woche", items: erledigt, empty: "Diese Woche noch nichts protokolliert." },
    { icon: "target", title: "Aktueller Fokus / nächster Schritt", items: focus ? [`${focus.label} (Schritt ${focus.step})`, ...naechste] : [], empty: "Kein Fokus — Tasks einer Phase zuordnen." },
    { icon: "alert", title: "Blocker", items: blocker.map((b) => `${b.titel}${b.wer ? ` (${b.wer})` : ""}`), empty: "Keine Blocker." },
    { icon: "compass", title: "Entscheidung von dir nötig", items: [...entsch.map((d) => String(d.titel || "")), ...freigaben.map((f) => `Freigabe: ${f.titel}`)].filter(Boolean), empty: "Keine offenen Entscheidungen." },
    { icon: "key", title: "Offene Zugänge", items: zugaenge.map((z) => `${z.titel}${z.wer ? ` (${z.wer})` : ""}`), empty: "Keine offenen Zugänge." },
    { icon: "handshake", title: "Abstimmung", items: abstimmung.map((a) => `${a.titel}${a.wer ? ` — ${a.wer}` : ""}`), empty: "Keine Abstimmungen offen." },
    { icon: "alert", title: "Risiko, wenn nichts passiert", items: [...risiko.map((r) => `${r.titel}${r.wer ? ` (${r.wer})` : ""}`), ...blocker.map((b) => `Blockiert: ${b.titel}`), ...entsch.filter((d) => d.frist && String(d.frist) < today).map((d) => `Überfällige Entscheidung: ${d.titel}`)], empty: "Kein akutes Risiko erfasst." },
  ];

  // Klartext-Briefing (zum Kopieren / Senden) — ohne Emojis.
  const lines: string[] = ["Wochen-Briefing — Umsetzung MasterMind-Plan", `Stand: ${today}`, ""];
  for (const s of sections) {
    lines.push(`${s.title.toUpperCase()}:`);
    if (s.items.length) for (const it of s.items) lines.push(`- ${it}`);
    else lines.push(`- ${s.empty}`);
    lines.push("");
  }
  const text = lines.join("\n").trim();

  return (
    <PageShell icon="send" title="Wochen-Briefing für Stephan" subtitle={`Stand: ${today} · automatisch aus den Umsetzungs-Daten zusammengestellt`}
      action={<BriefingCopy text={text} />}>
      <div className="grid gap-3 lg:grid-cols-2">
        {sections.map((s) => (
          <div key={s.title} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><Icon name={s.icon} className="h-4 w-4 text-accent" /> {s.title}</h2>
            {s.items.length ? (
              <ul className="flex flex-col gap-1">
                {s.items.map((it, i) => <li key={i} className="flex items-start gap-1.5 text-sm text-muted"><Icon name="dot" className="mt-1 h-2.5 w-2.5 shrink-0 text-accent" /><span>{it}</span></li>)}
              </ul>
            ) : <p className="text-sm text-muted-2">{s.empty}</p>}
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-2">
        <Icon name="chat" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>Tipp: Der <Link href="/cockpit/stephan" className="font-semibold text-accent">Stephan-Assistent</Link> nutzt dieselben Daten, um daraus eine ausformulierte Nachricht in deinem Stil zu entwerfen.</span>
      </p>
    </PageShell>
  );
}
