"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import type { Rollenspiel } from "@/lib/akademie";

const COL = "akademieRoleplays";
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;

type Ablauf = { schritt?: number; name: string; beschreibung: string };
type Einwand = { einwand: string; psychologie: string; erwartete_technik: string };
type Krit = { kriterium: string; punkte_max: string; beschreibung: string };

export function NewRollenspielButton() {
  const [open, setOpen] = useState(false);
  return (<>
    <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">+ Neues Rollenspiel</button>
    {open && <RpForm onClose={() => setOpen(false)} />}
  </>);
}

export function RollenspielActions({ id, rp }: { id: string; rp: Rollenspiel }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  async function del() {
    if (busy || !confirm("Dieses Rollenspiel wirklich löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  return (
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50">✎ Bearbeiten</button>
      <button disabled={busy} onClick={del} className="rounded-lg bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50">🗑 Löschen</button>
      {edit && <RpForm id={id} rp={rp} onClose={() => setEdit(false)} />}
    </div>
  );
}

function RowList<T>({ items, setItems, blank, render }: { items: T[]; setItems: (x: T[]) => void; blank: () => T; render: (it: T, set: (p: Partial<T>) => void) => ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-line bg-surface-2/40 p-2">
          <div className="flex-1">{render(it, (p) => setItems(items.map((x, j) => (j === i ? { ...x, ...p } : x))))}</div>
          <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="mt-1 text-muted-2 hover:text-red" aria-label="entfernen">✕</button>
        </div>
      ))}
      <button onClick={() => setItems([...items, blank()])} className="self-start rounded bg-surface-2 px-2 py-1 text-xs font-semibold text-muted hover:text-ink">+ hinzufügen</button>
    </div>
  );
}

function RpForm({ id, rp, onClose }: { id?: string; rp?: Rollenspiel; onClose: () => void }) {
  const router = useRouter();
  const [b, setB] = useState({
    titel: rp?.titel || "", persona: rp?.persona || "", setting: rp?.setting || "", verkaufstechnik: rp?.verkaufstechnik || "",
    produkt: rp?.produkt || "", marke: rp?.marke || "", ziel_aov: rp?.ziel_aov != null ? String(rp.ziel_aov) : "",
  });
  const [ablauf, setAblauf] = useState<Ablauf[]>((rp?.ablauf || []).map((a) => ({ schritt: a.schritt, name: a.name || "", beschreibung: a.beschreibung || "" })));
  const [einw, setEinw] = useState<Einwand[]>((rp?.einwaende || []).map((e) => ({ einwand: e.einwand || "", psychologie: e.psychologie || "", erwartete_technik: e.erwartete_technik || "" })));
  const [krit, setKrit] = useState<Krit[]>((rp?.bewertungskriterien || []).map((k) => ({ kriterium: k.kriterium || "", punkte_max: k.punkte_max != null ? String(k.punkte_max) : "", beschreibung: k.beschreibung || "" })));
  const [erfolg, setErfolg] = useState<string[]>((rp?.erfolgskriterien || []).map(String));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof b) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setB({ ...b, [k]: e.target.value });

  async function save() {
    if (!b.titel.trim()) { setErr("Titel fehlt."); return; }
    setBusy(true); setErr("");
    const item = {
      ...b,
      ziel_aov: b.ziel_aov,
      ablauf: ablauf.map((a, i) => ({ schritt: a.schritt ?? i + 1, name: a.name, beschreibung: a.beschreibung })),
      einwaende: einw,
      bewertungskriterien: krit.map((k) => ({ kriterium: k.kriterium, punkte_max: k.punkte_max, beschreibung: k.beschreibung })),
      erfolgskriterien: erfolg.filter((x) => x.trim()),
    };
    const r = id ? await cockpitMutate({ collection: COL, action: "replace", id, item }) : await cockpitMutate({ collection: COL, action: "create", item });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Rollenspiel bearbeiten" : "Neues Rollenspiel"}>
      <div className="flex max-h-[72vh] flex-col gap-3 overflow-y-auto pr-1">
        <label className="block">{L("Titel *")}<input value={b.titel} onChange={set("titel")} className={sel} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">{L("Verkaufstechnik")}<input value={b.verkaufstechnik} onChange={set("verkaufstechnik")} className={sel} /></label>
          <label className="block">{L("Ziel-AOV (€)")}<input value={b.ziel_aov} onChange={set("ziel_aov")} inputMode="numeric" className={sel} /></label>
          <label className="block">{L("Produkt")}<input value={b.produkt} onChange={set("produkt")} className={sel} /></label>
          <label className="block">{L("Marke")}<input value={b.marke} onChange={set("marke")} className={sel} /></label>
        </div>
        <label className="block">{L("Persona")}<input value={b.persona} onChange={set("persona")} className={sel} /></label>
        <label className="block">{L("Setting")}<textarea value={b.setting} onChange={set("setting")} rows={2} className={sel} /></label>

        <div>{L("Ablauf (Schritte)")}
          <RowList items={ablauf} setItems={setAblauf} blank={() => ({ name: "", beschreibung: "" })}
            render={(a, s) => (<div className="flex flex-col gap-1">
              <input value={a.name} onChange={(e) => s({ name: e.target.value })} placeholder="Name" className={sel} />
              <input value={a.beschreibung} onChange={(e) => s({ beschreibung: e.target.value })} placeholder="Beschreibung" className={sel} />
            </div>)} />
        </div>

        <div>{L("Einwände")}
          <RowList items={einw} setItems={setEinw} blank={() => ({ einwand: "", psychologie: "", erwartete_technik: "" })}
            render={(e, s) => (<div className="flex flex-col gap-1">
              <input value={e.einwand} onChange={(ev) => s({ einwand: ev.target.value })} placeholder="Einwand" className={sel} />
              <input value={e.psychologie} onChange={(ev) => s({ psychologie: ev.target.value })} placeholder="Psychologie" className={sel} />
              <input value={e.erwartete_technik} onChange={(ev) => s({ erwartete_technik: ev.target.value })} placeholder="Erwartete Technik" className={sel} />
            </div>)} />
        </div>

        <div>{L("Bewertungskriterien")}
          <RowList items={krit} setItems={setKrit} blank={() => ({ kriterium: "", punkte_max: "", beschreibung: "" })}
            render={(k, s) => (<div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <input value={k.kriterium} onChange={(e) => s({ kriterium: e.target.value })} placeholder="Kriterium" className={`${sel} flex-1`} />
                <input value={k.punkte_max} onChange={(e) => s({ punkte_max: e.target.value })} placeholder="max" inputMode="numeric" className={`${sel} w-20`} />
              </div>
              <input value={k.beschreibung} onChange={(e) => s({ beschreibung: e.target.value })} placeholder="Beschreibung" className={sel} />
            </div>)} />
        </div>

        <div>{L("Erfolgskriterien")}
          <RowList items={erfolg.map((v) => ({ v }))} setItems={(x) => setErfolg(x.map((o) => o.v))} blank={() => ({ v: "" })}
            render={(o, s) => <input value={o.v} onChange={(e) => s({ v: e.target.value })} placeholder="Erfolgskriterium" className={sel} />} />
        </div>

        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2 border-t border-line/60 pt-3">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
