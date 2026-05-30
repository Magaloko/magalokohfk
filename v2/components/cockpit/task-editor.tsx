"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "./mutate";
import { Icon } from "@/components/icon";
import type { Task } from "@/lib/cockpit";
import { PHASE_KEYS } from "@/lib/phases";

const STATUSES = ["Backlog", "In Arbeit", "Warte", "Erledigt"];
const PRIOS = ["", "hoch", "mittel", "niedrig"];
const COL = "tasks";

export function NewTaskButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">+ Neue Aufgabe</button>
      {open && <TaskForm onClose={() => setOpen(false)} />}
    </>
  );
}

export function TaskActions({ id, task }: { id: string; task: Task }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  const [err, setErr] = useState("");

  async function setStatus(status: string) {
    if (busy || status === task.status) return;
    setBusy(true); setErr("");
    const r = await cockpitMutate({ collection: COL, action: "update", id, patch: { status } });
    setBusy(false);
    if (r.ok) router.refresh(); else setErr(errText(r.error));
  }
  async function del() {
    if (busy || !confirm("Diese Aufgabe wirklich löschen?")) return;
    setBusy(true); setErr("");
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    if (r.ok) { router.push("/cockpit/tasks"); router.refresh(); }
    else { setBusy(false); setErr(errText(r.error)); }
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">Status setzen</h2>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} disabled={busy} onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${s === task.status ? "bg-accent text-bg" : "bg-surface-2 text-muted hover:text-ink"}`}>{s}</button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={() => setEdit(true)} className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-3.5 w-3.5" /> Bearbeiten</button>
        <button disabled={busy} onClick={del} className="flex items-center gap-1.5 rounded-lg bg-red/10 px-3 py-1.5 text-sm font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-3.5 w-3.5" /> Löschen</button>
      </div>
      {err && <p className="mt-2 text-sm text-red">{err}</p>}
      {edit && <TaskForm id={id} task={task} onClose={() => setEdit(false)} />}
    </section>
  );
}

function TaskForm({ id, task, onClose }: { id?: string; task?: Task; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<Task>({
    title: task?.title || "", area: task?.area || "", phase: task?.phase || "", status: task?.status || "Backlog",
    priority: task?.priority || "", owner: task?.owner || "", dueDate: task?.dueDate || "", notes: task?.notes || "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof Task) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    if (!f.title?.trim()) { setErr("Titel fehlt."); return; }
    setBusy(true); setErr("");
    const r = id
      ? await cockpitMutate({ collection: COL, action: "update", id, patch: f as Record<string, unknown> })
      : await cockpitMutate({ collection: COL, action: "create", item: f as Record<string, unknown> });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Aufgabe bearbeiten" : "Neue Aufgabe"}>
      <div className="flex flex-col gap-3">
        <Input label="Titel *" value={f.title || ""} onChange={set("title")} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Bereich" value={f.area || ""} onChange={set("area")} />
          <Field label="Phase (Stephan-Plan)"><select value={f.phase} onChange={set("phase")} className={selCls}><option value="">—</option>{PHASE_KEYS.map((p) => <option key={p}>{p}</option>)}</select></Field>
          <Field label="Status"><select value={f.status} onChange={set("status")} className={selCls}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Priorität"><select value={f.priority} onChange={set("priority")} className={selCls}>{PRIOS.map((p) => <option key={p} value={p}>{p || "—"}</option>)}</select></Field>
          <Input label="Owner" value={f.owner || ""} onChange={set("owner")} />
        </div>
        <Input label="Fällig (YYYY-MM-DD)" value={f.dueDate || ""} onChange={set("dueDate")} placeholder="2026-05-31" />
        <Field label="Notizen"><textarea value={f.notes || ""} onChange={set("notes")} rows={3} className={selCls} /></Field>
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}

const selCls = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{label}</span>{children}</label>;
}
function Input({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <Field label={label}><input {...p} className={selCls} /></Field>;
}
export function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-4 shadow-2xl sm:p-5">
        <h3 className="mb-3 text-base font-bold">{title}</h3>
        {children}
      </div>
    </div>
  );
}
