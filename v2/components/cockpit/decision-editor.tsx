"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "./mutate";
import { Modal } from "./task-editor";
import type { Decision } from "@/lib/cockpit";

const STATUSES = ["offen", "vorbereitet", "entschieden", "verworfen"];
const COL = "stephanDecisions";
const selCls = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";

export function NewDecisionButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">+ Neue Entscheidung</button>
      {open && <DecisionForm onClose={() => setOpen(false)} />}
    </>
  );
}

export function DecisionActions({ id, decision }: { id: string; decision: Decision }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  const [err, setErr] = useState("");

  async function setStatus(status: string) {
    if (busy || status === decision.status) return;
    setBusy(true); setErr("");
    const r = await cockpitMutate({ collection: COL, action: "update", id, patch: { status } });
    setBusy(false);
    if (r.ok) router.refresh(); else setErr(errText(r.error));
  }
  async function del() {
    if (busy || !confirm("Diese Entscheidung wirklich löschen?")) return;
    setBusy(true); setErr("");
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    if (r.ok) { router.push("/cockpit/entscheidungen"); router.refresh(); }
    else { setBusy(false); setErr(errText(r.error)); }
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">Status setzen</h2>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} disabled={busy} onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition disabled:opacity-50 ${s === (decision.status || "offen") ? "bg-accent text-bg" : "bg-surface-2 text-muted hover:text-ink"}`}>{s}</button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold hover:text-ink disabled:opacity-50">✎ Bearbeiten</button>
        <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-1.5 text-sm font-semibold text-red hover:bg-red/20 disabled:opacity-50">🗑 Löschen</button>
      </div>
      {err && <p className="mt-2 text-sm text-red">{err}</p>}
      {edit && <DecisionForm id={id} decision={decision} onClose={() => setEdit(false)} />}
    </section>
  );
}

function DecisionForm({ id, decision, onClose }: { id?: string; decision?: Decision; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<Decision>({
    titel: decision?.titel || "", status: decision?.status || "offen",
    kategorie: decision?.kategorie || "", frist: decision?.frist || "", empfehlung: decision?.empfehlung || "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof Decision) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    if (!f.titel?.trim()) { setErr("Titel fehlt."); return; }
    setBusy(true); setErr("");
    const r = id
      ? await cockpitMutate({ collection: COL, action: "update", id, patch: f as Record<string, unknown> })
      : await cockpitMutate({ collection: COL, action: "create", item: f as Record<string, unknown> });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Entscheidung bearbeiten" : "Neue Entscheidung"}>
      <div className="flex flex-col gap-3">
        <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Titel *</span>
          <input value={f.titel || ""} onChange={set("titel")} className={selCls} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Status</span>
            <select value={f.status} onChange={set("status")} className={`${selCls} capitalize`}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Kategorie</span>
            <input value={f.kategorie || ""} onChange={set("kategorie")} className={selCls} /></label>
        </div>
        <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Frist (YYYY-MM-DD)</span>
          <input value={f.frist || ""} onChange={set("frist")} placeholder="2026-06-15" className={selCls} /></label>
        <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Empfehlung</span>
          <textarea value={f.empfehlung || ""} onChange={set("empfehlung")} rows={4} className={selCls} /></label>
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
