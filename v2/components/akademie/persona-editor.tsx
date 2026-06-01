"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import type { Persona } from "@/lib/akademie";
import { Icon } from "@/components/icon";

const COL = "salesPersonas";
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;
const s = (v: unknown) => (typeof v === "string" ? v : v ? JSON.stringify(v) : "");

type Form = { name: string; avatar: string; alter: string; kontext: string; zitat: string; einwaendeTypisch: string; schmerzpunkte: string; werte: string; budget: string };
const toForm = (p?: Persona): Form => ({
  name: p?.name || "", avatar: p?.avatar || "", alter: p?.alter || "", kontext: p?.kontext || "", zitat: p?.zitat || "",
  einwaendeTypisch: p?.einwaendeTypisch || "", schmerzpunkte: s(p?.schmerzpunkte), werte: s(p?.werte), budget: s(p?.budget),
});

export function NewPersonaButton() {
  const [open, setOpen] = useState(false);
  return (<>
    <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:opacity-90 min-h-11">+ Neue Persona</button>
    {open && <PersonaForm onClose={() => setOpen(false)} />}
  </>);
}

export function PersonaActions({ id, persona }: { id: string; persona: Persona }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  async function del() {
    if (busy || !confirm("Diese Persona wirklich löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  return (
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-2.5 text-xs font-semibold min-h-10 inline-flex items-center hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-2.5 text-xs font-semibold min-h-10 inline-flex items-center text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
      {edit && <PersonaForm id={id} persona={persona} onClose={() => setEdit(false)} />}
    </div>
  );
}

function PersonaForm({ id, persona, onClose }: { id?: string; persona?: Persona; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(toForm(persona));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    if (!f.name.trim()) { setErr("Name fehlt."); return; }
    setBusy(true); setErr("");
    const payload = f as unknown as Record<string, unknown>;
    const r = id ? await cockpitMutate({ collection: COL, action: "update", id, patch: payload }) : await cockpitMutate({ collection: COL, action: "create", item: payload });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Persona bearbeiten" : "Neue Persona"}>
      <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
        <div className="grid grid-cols-[80px_1fr] gap-3">
          <label className="block">{L("Avatar")}<input value={f.avatar} onChange={set("avatar")} placeholder="Avatar" className={`${sel} text-center`} /></label>
          <label className="block">{L("Name *")}<input value={f.name} onChange={set("name")} className={sel} /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">{L("Alter")}<input value={f.alter} onChange={set("alter")} className={sel} /></label>
          <label className="block">{L("Budget")}<input value={f.budget} onChange={set("budget")} className={sel} /></label>
        </div>
        <label className="block">{L("Kontext")}<input value={f.kontext} onChange={set("kontext")} className={sel} /></label>
        <label className="block">{L("Zitat")}<input value={f.zitat} onChange={set("zitat")} className={sel} /></label>
        <label className="block">{L("Schmerzpunkte")}<textarea value={f.schmerzpunkte} onChange={set("schmerzpunkte")} rows={2} className={sel} /></label>
        <label className="block">{L("Werte")}<textarea value={f.werte} onChange={set("werte")} rows={2} className={sel} /></label>
        <label className="block">{L("Typische Einwände")}<input value={f.einwaendeTypisch} onChange={set("einwaendeTypisch")} className={sel} /></label>
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
