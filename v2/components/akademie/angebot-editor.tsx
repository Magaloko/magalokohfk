"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import type { Angebot } from "@/lib/akademie";
import { Icon } from "@/components/icon";

const COL = "consultingServices";
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;

export function NewAngebotButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">+ Neues Angebot</button>
      {open && <AngebotForm onClose={() => setOpen(false)} />}
    </>
  );
}

export function AngebotActions({ id, angebot }: { id: string; angebot: Angebot }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  async function del() {
    if (busy || !confirm("Dieses Angebot wirklich löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  return (
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
      {edit && <AngebotForm id={id} angebot={angebot} onClose={() => setEdit(false)} />}
    </div>
  );
}

function AngebotForm({ id, angebot, onClose }: { id?: string; angebot?: Angebot; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<Angebot>({
    name: angebot?.name || "", dauer: angebot?.dauer || "", preis: angebot?.preis || "",
    zielgruppe: angebot?.zielgruppe || "", inhalt: angebot?.inhalt || "", ergebnis: angebot?.ergebnis || "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof Angebot) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    if (!f.name?.trim()) { setErr("Name fehlt."); return; }
    setBusy(true); setErr("");
    const payload = f as Record<string, unknown>;
    const r = id ? await cockpitMutate({ collection: COL, action: "update", id, patch: payload }) : await cockpitMutate({ collection: COL, action: "create", item: payload });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Angebot bearbeiten" : "Neues Angebot"}>
      <div className="flex flex-col gap-3">
        <label className="block">{L("Name *")}<input value={f.name || ""} onChange={set("name")} className={sel} /></label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="block">{L("Dauer")}<input value={f.dauer || ""} onChange={set("dauer")} className={sel} /></label>
          <label className="block">{L("Preis")}<input value={f.preis || ""} onChange={set("preis")} className={sel} /></label>
          <label className="block">{L("Zielgruppe")}<input value={f.zielgruppe || ""} onChange={set("zielgruppe")} className={sel} /></label>
        </div>
        <label className="block">{L("Inhalt")}<textarea value={f.inhalt || ""} onChange={set("inhalt")} rows={3} className={sel} /></label>
        <label className="block">{L("Ergebnis")}<textarea value={f.ergebnis || ""} onChange={set("ergebnis")} rows={2} className={sel} /></label>
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
