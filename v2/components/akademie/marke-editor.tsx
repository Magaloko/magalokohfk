"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import { StrList } from "./str-list";
import type { Marke } from "@/lib/akademie";
import { Icon } from "@/components/icon";

const COL = "akademieMarken";
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;
const txt = (x: unknown) => (typeof x === "string" ? x : (x as any)?.name || (x as any)?.argument || (x as any)?.text || "");

export function NewMarkeButton() {
  const [open, setOpen] = useState(false);
  return (<>
    <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">+ Neue Marke</button>
    {open && <MarkeForm onClose={() => setOpen(false)} />}
  </>);
}

export function MarkeActions({ id, marke }: { id: string; marke: Marke }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  async function del() {
    if (busy || !confirm("Diese Marke wirklich löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  return (
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4 inline-block mr-1" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4 inline-block mr-1" />Löschen</button>
      {edit && <MarkeForm id={id} marke={marke} onClose={() => setEdit(false)} />}
    </div>
  );
}

function MarkeForm({ id, marke, onClose }: { id?: string; marke?: Marke; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(marke?.name || "");
  const [philosophie, setPhilosophie] = useState(marke?.philosophie || "");
  const [land, setLand] = useState(marke?.herkunft?.land || "");
  const [stadt, setStadt] = useState(marke?.herkunft?.stadt || "");
  const [gruendung, setGruendung] = useState(marke?.herkunft?.gruendung != null ? String(marke.herkunft.gruendung) : "");
  const [kategorien, setKategorien] = useState<string[]>((marke?.kategorien || []).map(txt).filter(Boolean));
  const [hero, setHero] = useState<string[]>((marke?.hero_produkte || []).map(txt).filter(Boolean));
  const [argumente, setArgumente] = useState<string[]>((marke?.verkaufsargumente || []).map(txt).filter(Boolean));
  const [usps, setUsps] = useState<string[]>((marke?.usps || []).filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    if (!name.trim()) { setErr("Name fehlt."); return; }
    setBusy(true); setErr("");
    const item = {
      name, philosophie, herkunft: { land, stadt, gruendung },
      kategorien: kategorien.filter((x) => x.trim()), hero_produkte: hero.filter((x) => x.trim()),
      verkaufsargumente: argumente.filter((x) => x.trim()), usps: usps.filter((x) => x.trim()),
    };
    const r = id ? await cockpitMutate({ collection: COL, action: "replace", id, item }) : await cockpitMutate({ collection: COL, action: "create", item });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Marke bearbeiten" : "Neue Marke"}>
      <div className="flex max-h-[72vh] flex-col gap-3 overflow-y-auto pr-1">
        <label className="block">{L("Name *")}<input value={name} onChange={(e) => setName(e.target.value)} className={sel} /></label>
        <label className="block">{L("Philosophie")}<textarea value={philosophie} onChange={(e) => setPhilosophie(e.target.value)} rows={2} className={sel} /></label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="block">{L("Land")}<input value={land} onChange={(e) => setLand(e.target.value)} className={sel} /></label>
          <label className="block">{L("Stadt")}<input value={stadt} onChange={(e) => setStadt(e.target.value)} className={sel} /></label>
          <label className="block">{L("Gründung")}<input value={gruendung} onChange={(e) => setGruendung(e.target.value)} className={sel} /></label>
        </div>
        <StrList label="Kategorien" items={kategorien} setItems={setKategorien} placeholder="z. B. Kinderwagen" />
        <StrList label="Hero-Produkte" items={hero} setItems={setHero} placeholder="Produktname" />
        <StrList label="Verkaufsargumente" items={argumente} setItems={setArgumente} placeholder="Argument" />
        <StrList label="USPs" items={usps} setItems={setUsps} placeholder="USP" />
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2 border-t border-line/60 pt-3">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
