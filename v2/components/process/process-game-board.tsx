"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Card, Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { PROCESS_MISSIONS, scoreRun, type ProcessMission, type ProcessRun, type ProcessRunStatus } from "@/lib/process-game-core";

const AREAS = ["Einkauf", "Sortiment", "Kundenservice", "Marketing", "Finanzen", "Daten"];
const STATUS: ProcessRunStatus[] = ["Entwurf", "Geprüft", "Umgesetzt", "Gelernt"];
const NEXT_STATUS: Record<ProcessRunStatus, ProcessRunStatus | null> = {
  Entwurf: "Geprüft",
  Geprüft: "Umgesetzt",
  Umgesetzt: "Gelernt",
  Gelernt: null,
};
const today = () => new Date().toISOString().slice(0, 10);

const input = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent";
const label = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-2";

function blank(m?: ProcessMission): ProcessRun {
  return {
    datum: today(),
    bereich: m?.bereich || "Einkauf",
    prozess: m?.titel || "",
    entscheidung: "",
    einsatz: m?.einsatz || "",
    nachweis: "",
    risiko: "",
    status: "Entwurf",
    punkte: m?.punkte || 25,
    systemSignal: "",
    naechsterSchritt: "",
  };
}

const toneFor = (s?: string): "muted" | "accent" | "green" | "amber" | "teal" =>
  s === "Gelernt" ? "teal" : s === "Umgesetzt" ? "green" : s === "Geprüft" ? "accent" : s === "Entwurf" ? "amber" : "muted";

export function ProcessGameBoard({ initial }: { initial: ProcessRun[] }) {
  const router = useRouter();
  const [runs, setRuns] = useState(initial);
  const [form, setForm] = useState<ProcessRun>(() => blank(PROCESS_MISSIONS[0]));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const recent = useMemo(() => [...runs].sort((a, b) => String(b.datum || "").localeCompare(String(a.datum || ""))).slice(0, 12), [runs]);

  const set = (k: keyof ProcessRun) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: k === "punkte" ? Number(e.target.value) : e.target.value }));

  function useMission(m: ProcessMission) {
    setForm(blank(m));
    setMsg(`${m.bereich}: ${m.ziel}`);
  }

  async function save() {
    if (busy) return;
    if (!String(form.prozess || "").trim() || !String(form.entscheidung || "").trim()) {
      setMsg("Prozess und Entscheidung sind Pflicht.");
      return;
    }
    setBusy(true);
    setMsg("");
    const r = await cockpitMutate({ collection: "processRuns", action: "create", item: form as Record<string, unknown> });
    setBusy(false);
    if (!r.ok) { setMsg(errText(r.error)); return; }
    const next = { id: r.id || `local-${Date.now()}`, ...form };
    setRuns((cur) => [next, ...cur]);
    setForm(blank(PROCESS_MISSIONS[0]));
    setMsg("Spielzug protokolliert.");
    router.refresh();
  }

  async function advance(run: ProcessRun, status: ProcessRunStatus) {
    if (!run.id || run.id.startsWith("local-")) return;
    const previous = runs;
    setRuns((cur) => cur.map((r) => r.id === run.id ? { ...r, status } : r));
    const res = await cockpitMutate({ collection: "processRuns", action: "update", id: run.id, patch: { status } });
    if (!res.ok) { setRuns(previous); setMsg(errText(res.error)); return; }
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PROCESS_MISSIONS.map((m) => (
            <button key={m.id} type="button" onClick={() => useMission(m)}
              className="rounded-lg border border-line bg-surface p-4 text-left transition hover:border-accent hover:bg-accent/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-muted-2">{m.bereich}</div>
                  <div className="mt-1 font-extrabold">{m.titel}</div>
                </div>
                <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">{m.punkte} P</span>
              </div>
              <p className="mt-2 text-sm text-muted">{m.ziel}</p>
              <p className="mt-3 text-xs text-muted-2">{m.beispiel}</p>
            </button>
          ))}
        </section>

        <section className="space-y-3">
          {recent.length ? recent.map((r) => (
            <Card key={r.id || `${r.datum}-${r.prozess}-${r.entscheidung}`} className="rounded-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={toneFor(r.status)}>{r.status || "Entwurf"}</Pill>
                    <span className="text-xs font-semibold text-muted-2">{r.datum || "ohne Datum"} · {r.bereich || "Prozess"}</span>
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">{scoreRun(r)} P</span>
                  </div>
                  <h2 className="mt-2 text-base font-extrabold">{r.prozess || "Unbenannter Prozess"}</h2>
                  <p className="mt-1 text-sm text-ink">{r.entscheidung}</p>
                  {(r.systemSignal || r.nachweis) && (
                    <p className="mt-2 text-xs text-muted">
                      {r.systemSignal ? `Signal: ${r.systemSignal}` : ""}{r.systemSignal && r.nachweis ? " · " : ""}{r.nachweis ? `Nachweis: ${r.nachweis}` : ""}
                    </p>
                  )}
                  {r.naechsterSchritt && <p className="mt-2 text-xs font-medium text-accent">Nächster Schritt: {r.naechsterSchritt}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {NEXT_STATUS[(r.status as ProcessRunStatus) || "Entwurf"] ? (
                    <button type="button" onClick={() => advance(r, NEXT_STATUS[(r.status as ProcessRunStatus) || "Entwurf"]!)}
                      className={cn("rounded-lg px-3 py-2 text-xs font-semibold", NEXT_STATUS[(r.status as ProcessRunStatus) || "Entwurf"] === "Gelernt" ? "bg-teal/15 text-teal" : "bg-surface-2 text-muted hover:text-ink")}>
                      Weiter zu {NEXT_STATUS[(r.status as ProcessRunStatus) || "Entwurf"]}
                    </button>
                  ) : (
                    <span className="rounded-lg bg-green/10 px-3 py-2 text-xs font-semibold text-green">Abgeschlossen</span>
                  )}
                </div>
              </div>
            </Card>
          )) : (
            <Card className="rounded-lg">
              <div className="flex items-center gap-3 text-muted">
                <Icon name="package" className="h-5 w-5" />
                <p className="text-sm">Noch kein Prozess-Spielzug protokolliert.</p>
              </div>
            </Card>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card className="rounded-lg">
          <h2 className="flex items-center gap-2 text-lg font-extrabold"><Icon name="edit" className="h-5 w-5 text-accent" />Spielzug protokollieren</h2>
          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label><span className={label}>Datum</span><input value={form.datum || ""} onChange={set("datum")} type="date" className={input} /></label>
              <label><span className={label}>Bereich</span><select value={form.bereich || ""} onChange={set("bereich")} className={input}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></label>
            </div>
            <label><span className={label}>Prozess</span><input value={form.prozess || ""} onChange={set("prozess")} className={input} placeholder="z. B. Renner nachbestellen" /></label>
            <label><span className={label}>Entscheidung</span><textarea value={form.entscheidung || ""} onChange={set("entscheidung")} rows={3} className={input} placeholder="Was wurde entschieden?" /></label>
            <label><span className={label}>Einsatz</span><textarea value={form.einsatz || ""} onChange={set("einsatz")} rows={2} className={input} placeholder="Welche Daten, Regeln oder Personen waren beteiligt?" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className={label}>Nachweis</span><input value={form.nachweis || ""} onChange={set("nachweis")} className={input} placeholder="Export, Link, Screenshot, Zahl" /></label>
              <label><span className={label}>Systemsignal</span><input value={form.systemSignal || ""} onChange={set("systemSignal")} className={input} placeholder="Bestand, Marge, SLA, Suche" /></label>
            </div>
            <label><span className={label}>Risiko</span><input value={form.risiko || ""} onChange={set("risiko")} className={input} placeholder="Was kann schiefgehen?" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className={label}>Status</span><select value={form.status || "Entwurf"} onChange={set("status")} className={input}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label><span className={label}>Basispunkte</span><input value={form.punkte ?? 25} onChange={set("punkte")} type="number" min={0} max={100} className={input} /></label>
            </div>
            <label><span className={label}>Nächster Schritt</span><input value={form.naechsterSchritt || ""} onChange={set("naechsterSchritt")} className={input} placeholder="Wer macht was als Nächstes?" /></label>
            {msg && <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">{msg}</p>}
            <button type="button" disabled={busy} onClick={save}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-bg disabled:opacity-50">
              <Icon name="check" className="h-4 w-4" />{busy ? "Speichert..." : "Spielzug speichern"}
            </button>
          </div>
        </Card>
      </aside>
    </div>
  );
}
