"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import type { Einwand } from "@/lib/akademie";
import { IconButton } from "@/components/_primitives/icon-button";

const COL = "salesObjections";
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;

export function NewEinwandButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:opacity-90 min-h-11">+ Neuer Einwand</button>
      {open && <EinwandForm onClose={() => setOpen(false)} />}
    </>
  );
}

export function EinwandRowActions({ id, einwand }: { id: string; einwand: Einwand }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  async function del() {
    if (busy || !confirm("Diesen Einwand wirklich löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  return (
    <span className="inline-flex gap-2">
      <IconButton icon="edit" label="Bearbeiten" onClick={() => setEdit(true)} disabled={busy} />
      <IconButton icon="trash" label="Löschen" onClick={del} disabled={busy} tone="danger" />
      {edit && <EinwandForm id={id} einwand={einwand} onClose={() => setEdit(false)} />}
    </span>
  );
}

function EinwandForm({ id, einwand, onClose }: { id?: string; einwand?: Einwand; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<Einwand>({ einwand: einwand?.einwand || "", kategorie: einwand?.kategorie || "", antwort: einwand?.antwort || "", beweis: einwand?.beweis || "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof Einwand) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    if (!f.einwand?.trim()) { setErr("Einwand-Text fehlt."); return; }
    setBusy(true); setErr("");
    const payload = f as Record<string, unknown>;
    const r = id ? await cockpitMutate({ collection: COL, action: "update", id, patch: payload }) : await cockpitMutate({ collection: COL, action: "create", item: payload });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Einwand bearbeiten" : "Neuer Einwand"}>
      <div className="flex flex-col gap-3">
        <label className="block">{L("Einwand (Kundenaussage) *")}<input value={f.einwand || ""} onChange={set("einwand")} className={sel} /></label>
        <label className="block">{L("Kategorie")}<input value={f.kategorie || ""} onChange={set("kategorie")} className={sel} /></label>
        <label className="block">{L("Beste Antwort")}<textarea value={f.antwort || ""} onChange={set("antwort")} rows={3} className={sel} /></label>
        <label className="block">{L("Beweis / Argument")}<textarea value={f.beweis || ""} onChange={set("beweis")} rows={2} className={sel} /></label>
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
