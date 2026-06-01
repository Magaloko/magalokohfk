"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { MasterMindFrage } from "@/lib/mastermind-fragen";
import type { MasterMindAntwort } from "@/lib/mastermind";

const prioTone = (p: string): "red" | "amber" | "accent" | "muted" =>
  p === "P0" ? "red" : p === "P1" ? "amber" : p === "P2" ? "accent" : "muted";

export function FragenBlock({ fragen, antworten, titel = "Offene Fragen" }:
  { fragen: MasterMindFrage[]; antworten: Record<string, MasterMindAntwort>; titel?: string }) {
  const [open, setOpen] = useState(false);
  if (!fragen.length) return null;
  const beantwortet = fragen.filter((f) => antworten[f.id]?.status === "beantwortet").length;
  const offen = fragen.length - beantwortet;
  return (
    <div className="mt-3 rounded-lg border border-line bg-surface-2/40">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-xs font-bold uppercase tracking-wide text-muted-2">
        <span className="inline-flex items-center gap-1.5"><Icon name="chat" className="h-3.5 w-3.5" /> {titel} · {offen} offen{beantwortet ? ` · ${beantwortet} beantwortet` : ""}</span>
        <Icon name="arrow-right" className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <ul className="flex flex-col gap-2 px-3 pb-3">
          {fragen.map((f) => <FrageRow key={f.id} frage={f} record={antworten[f.id]} />)}
        </ul>
      )}
    </div>
  );
}

function FrageRow({ frage, record }: { frage: MasterMindFrage; record?: MasterMindAntwort }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [antwort, setAntwort] = useState(record?.antwort || "");
  const [done, setDone] = useState(record?.status === "beantwortet");
  const [err, setErr] = useState("");

  // Frische Server-Daten (nach router.refresh) → Sperren lösen + Felder synchronisieren.
  useEffect(() => {
    setBusy(false); setPendingCreate(false);
    setAntwort(record?.antwort || ""); setDone(record?.status === "beantwortet");
  }, [record?.id, record?.status, record?.antwort]);

  async function save() {
    if (busy || pendingCreate) return;
    setBusy(true); setErr("");
    const status = done ? "beantwortet" : "offen";
    const body = record
      ? { collection: "mastermindAntworten", action: "update", id: record.id, patch: { status, antwort } }
      : { collection: "mastermindAntworten", action: "create", item: { frageId: frage.id, status, antwort } };
    try {
      const res = await fetch("/api/cockpit/mutate", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) { setErr(res.status === 409 ? "Konflikt — bitte neu laden." : "Speichern fehlgeschlagen."); setBusy(false); return; }
      setEdit(false);
      if (record) setBusy(false);        // Update: id bekannt, kein Doppel-Risiko
      else setPendingCreate(true);       // Create: bis Refresh gegen Doppel-Record gesperrt
      router.refresh();
    } catch { setErr("Netzwerkfehler."); setBusy(false); }
  }

  const isDone = record?.status === "beantwortet";
  return (
    <li className="rounded-lg border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill tone={prioTone(frage.prio)}>{frage.prio}</Pill>
        {frage.ebene && <span className="text-[10px] font-bold uppercase tracking-wide text-muted-2">{frage.ebene}</span>}
        {isDone && <Pill tone="green">beantwortet</Pill>}
      </div>
      <p className="mt-1.5 text-sm font-medium leading-snug">{frage.frage}</p>
      {isDone && !edit && record?.antwort && (
        <p className="mt-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm leading-relaxed text-muted">{record.antwort}</p>
      )}
      {edit ? (
        <div className="mt-2 flex flex-col gap-2">
          <textarea value={antwort} onChange={(e) => setAntwort(e.target.value)} rows={3} placeholder="Stephans Antwort …"
            className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} className="h-5 w-5 accent-green" /> als beantwortet markieren
          </label>
          {err && <p className="text-xs text-red">{err}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} disabled={busy}
              className="min-h-11 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50">
              {busy ? "Speichert …" : "Speichern"}</button>
            <button type="button" onClick={() => { setEdit(false); setErr(""); setAntwort(record?.antwort || ""); setDone(record?.status === "beantwortet"); }} disabled={busy}
              className="min-h-11 rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-semibold">Abbrechen</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setEdit(true)} disabled={busy || pendingCreate}
          className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold text-accent disabled:opacity-50">
          {pendingCreate ? "Gespeichert …" : isDone ? "Antwort bearbeiten" : "Antwort erfassen"}</button>
      )}
    </li>
  );
}
