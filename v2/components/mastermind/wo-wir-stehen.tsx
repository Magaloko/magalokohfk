"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { MASTERMIND } from "@/lib/strategy";
import type { MasterMindVorgang, MasterMindToolStatus } from "@/lib/mastermind";

const TOOLS: { key: string; label: string }[] = [
  { key: "foundation", label: "Foundation" },
  ...MASTERMIND.werkzeuge.map((w) => ({ key: w.key, label: w.name })),
];
const TOOL_LABEL: Record<string, string> = Object.fromEntries(TOOLS.map((t) => [t.key, t.label]));
const TOOL_STATI = ["Plan", "In Bau", "Live", "Blockiert"];
const VORGANG_STATI = ["Offen", "Wartet", "In Arbeit", "Erledigt"];

const dotClass = (s?: string) =>
  s === "Live" ? "bg-green" : s === "In Bau" ? "bg-amber" : s === "Blockiert" ? "bg-red" : "bg-muted-2";
const vBadge = (s: string): "amber" | "accent" | "green" | "muted" =>
  s === "Wartet" ? "amber" : s === "In Arbeit" ? "accent" : s === "Erledigt" ? "green" : "muted";

async function mutate(body: Record<string, unknown>) {
  const res = await fetch("/api/cockpit/mutate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return res.ok;
}

export function WoWirStehen({ vorgaenge, toolStatus }:
  { vorgaenge: MasterMindVorgang[]; toolStatus: Record<string, MasterMindToolStatus> }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [adding, setAdding] = useState(false);
  const offen = vorgaenge.filter((v) => v.status !== "Erledigt");
  const waitCount = (key: string) => offen.filter((v) => v.werkzeug === key && v.status === "Wartet").length;

  return (
    <section className="rounded-xl border border-accent/30 bg-accent/5 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent">
        <Icon name="compass" className="h-3.5 w-3.5" /> Aktueller Stand
      </div>
      <h2 className="mt-1 text-lg font-extrabold tracking-tight">Wo wir gerade stehen</h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {TOOLS.map((t) => <ToolChip key={t.key} tool={t} status={toolStatus[t.key]} wait={waitCount(t.key)} onSaved={refresh} />)}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-2">Offene Vorgänge ({offen.length})</h3>
        <button type="button" onClick={() => setAdding(!adding)}
          className="inline-flex min-h-9 items-center rounded-lg bg-accent px-3 text-xs font-semibold text-bg">{adding ? "Abbrechen" : "+ Vorgang"}</button>
      </div>
      {adding && <div className="mt-2"><VorgangForm onClose={() => setAdding(false)} onSaved={refresh} /></div>}
      <div className="mt-2 flex flex-col gap-2">
        {offen.length ? offen.map((v) => <VorgangRow key={v.id} v={v} onSaved={refresh} />)
          : <p className="text-sm text-muted-2">Keine offenen Vorgänge.</p>}
      </div>
    </section>
  );
}

function ToolChip({ tool, status, wait, onSaved }:
  { tool: { key: string; label: string }; status?: MasterMindToolStatus; wait: number; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  useEffect(() => { setBusy(false); }, [status?.id, status?.status]);
  const cur = status?.status || "Plan";
  async function set(newStatus: string) {
    if (busy || newStatus === cur) return;
    setBusy(true);
    const ok = status?.id
      ? await mutate({ collection: "mastermindToolStatus", action: "update", id: status.id, patch: { status: newStatus } })
      : await mutate({ collection: "mastermindToolStatus", action: "create", item: { werkzeug: tool.key, status: newStatus } });
    if (ok) onSaved(); else setBusy(false);
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass(cur))} />
      {tool.label}
      <select value={cur} onChange={(e) => set(e.target.value)} disabled={busy}
        className="ml-0.5 rounded bg-surface-2 px-1 py-0.5 text-[11px] outline-none">
        {TOOL_STATI.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {wait > 0 && <span className="text-amber">· wartet {wait}</span>}
    </span>
  );
}

function VorgangRow({ v, onSaved }: { v: MasterMindVorgang; onSaved: () => void }) {
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  async function erledigt() {
    setBusy(true);
    const ok = await mutate({ collection: "mastermindVorgaenge", action: "update", id: v.id, patch: { status: "Erledigt" } });
    if (ok) onSaved(); else setBusy(false);
  }
  if (edit) return <VorgangForm v={v} onClose={() => setEdit(false)} onSaved={onSaved} />;
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase text-muted-2">{TOOL_LABEL[v.werkzeug] || v.werkzeug}</span>
        <Pill tone={vBadge(v.status)}>{v.status}{v.status === "Wartet" && v.wartetAuf ? `: ${v.wartetAuf}` : ""}</Pill>
        <span className="text-sm font-semibold">{v.titel}</span>
      </div>
      {v.naechsterSchritt && <p className="mt-1 text-xs text-muted">Nächster Schritt: {v.naechsterSchritt}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => setEdit(true)} className="inline-flex min-h-9 items-center rounded-lg bg-surface-2 px-3 text-xs font-semibold text-accent">Bearbeiten</button>
        <button type="button" onClick={erledigt} disabled={busy} className="inline-flex min-h-9 items-center rounded-lg bg-green/10 px-3 text-xs font-semibold text-green disabled:opacity-50">{busy ? "…" : "Erledigt"}</button>
      </div>
    </div>
  );
}

function VorgangForm({ v, onClose, onSaved }: { v?: MasterMindVorgang; onClose: () => void; onSaved: () => void }) {
  const [titel, setTitel] = useState(v?.titel || "");
  const [werkzeug, setWerkzeug] = useState(v?.werkzeug || "sebo");
  const [status, setStatus] = useState(v?.status || "Offen");
  const [wartetAuf, setWartetAuf] = useState(v?.wartetAuf || "");
  const [naechsterSchritt, setNaechsterSchritt] = useState(v?.naechsterSchritt || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inp = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
  async function save() {
    if (!titel.trim()) { setErr("Titel fehlt."); return; }
    setBusy(true); setErr("");
    const item = { titel, werkzeug, status, wartetAuf, naechsterSchritt };
    const ok = v
      ? await mutate({ collection: "mastermindVorgaenge", action: "update", id: v.id, patch: item })
      : await mutate({ collection: "mastermindVorgaenge", action: "create", item });
    if (ok) { onClose(); onSaved(); } else { setErr("Speichern fehlgeschlagen."); setBusy(false); }
  }
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="flex flex-col gap-2">
        <input value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="Titel des Vorgangs" className={inp} />
        <div className="flex flex-wrap gap-2">
          <select value={werkzeug} onChange={(e) => setWerkzeug(e.target.value)} className={cn(inp, "w-auto")}>
            {TOOLS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={cn(inp, "w-auto")}>
            {VORGANG_STATI.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={wartetAuf} onChange={(e) => setWartetAuf(e.target.value)} placeholder="wartet auf … (z. B. HFK-IT)" className={cn(inp, "min-w-40 flex-1")} />
        </div>
        <input value={naechsterSchritt} onChange={(e) => setNaechsterSchritt(e.target.value)} placeholder="nächster Schritt" className={inp} />
        {err && <p className="text-xs text-red">{err}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={save} disabled={busy} className="min-h-10 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "Speichert …" : "Speichern"}</button>
          <button type="button" onClick={onClose} disabled={busy} className="min-h-10 rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
        </div>
      </div>
    </div>
  );
}
