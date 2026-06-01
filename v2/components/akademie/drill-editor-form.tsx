"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import { StrList } from "./str-list";
import type { Drill } from "@/lib/akademie";
import { IconButton } from "@/components/_primitives/icon-button";

const COL = "akademieDrills";
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;
type Opt = { text: string; ist_richtig: boolean; punkte: string; feedback: string };
const blankOpt = (): Opt => ({ text: "", ist_richtig: false, punkte: "", feedback: "" });

export function NewDrillButton() {
  const [open, setOpen] = useState(false);
  return (<>
    <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:opacity-90 min-h-11">+ Neuer Drill</button>
    {open && <DrillForm onClose={() => setOpen(false)} />}
  </>);
}

export function DrillRowActions({ id, drill }: { id: string; drill: Drill }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  async function del() {
    if (busy || !confirm("Diesen Drill wirklich löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  return (
    <span className="inline-flex gap-2">
      <IconButton disabled={busy} icon="edit" label="Bearbeiten" onClick={() => setEdit(true)} tone="default" />
      <IconButton disabled={busy} icon="trash" label="Löschen" onClick={del} tone="danger" />
      {edit && <DrillForm id={id} drill={drill} onClose={() => setEdit(false)} />}
    </span>
  );
}

function DrillForm({ id, drill, onClose }: { id?: string; drill?: Drill; onClose: () => void }) {
  const router = useRouter();
  const [b, setB] = useState({ marke: drill?.marke || "", frage: drill?.frage || "", schwierigkeit: drill?.schwierigkeit || "", verkaufstechnik: drill?.verkaufstechnik || "", musterantwort: drill?.musterantwort || "" });
  const [lerntyp, setLerntyp] = useState<string[]>((drill?.lerntyp || []).map(String));
  const [opts, setOpts] = useState<Opt[]>(() => {
    const o = (drill?.optionen || []).map((x) => ({ text: x.text || "", ist_richtig: x.ist_richtig === true || (x.punkte || 0) > 0, punkte: x.punkte != null ? String(x.punkte) : "", feedback: x.feedback || "" }));
    return o.length ? o : [blankOpt(), blankOpt()];
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof b) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setB({ ...b, [k]: e.target.value });
  const updOpt = (i: number, p: Partial<Opt>) => setOpts(opts.map((o, j) => (j === i ? { ...o, ...p } : o)));

  async function save() {
    if (!b.frage.trim()) { setErr("Frage fehlt."); return; }
    if (!opts.some((o) => o.ist_richtig)) { setErr("Mindestens eine richtige Option markieren."); return; }
    setBusy(true); setErr("");
    const item = { ...b, lerntyp: lerntyp.filter((x) => x.trim()), optionen: opts.filter((o) => o.text.trim()).map((o) => ({ text: o.text, ist_richtig: o.ist_richtig, punkte: o.punkte, feedback: o.feedback })) };
    const r = id ? await cockpitMutate({ collection: COL, action: "replace", id, item }) : await cockpitMutate({ collection: COL, action: "create", item });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Drill bearbeiten" : "Neuer Drill"}>
      <div className="flex max-h-[72vh] flex-col gap-3 overflow-y-auto pr-1">
        <label className="block">{L("Frage *")}<textarea value={b.frage} onChange={set("frage")} rows={2} className={sel} /></label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="block">{L("Marke")}<input value={b.marke} onChange={set("marke")} className={sel} /></label>
          <label className="block">{L("Schwierigkeit")}<input value={b.schwierigkeit} onChange={set("schwierigkeit")} className={sel} /></label>
          <label className="block">{L("Technik")}<input value={b.verkaufstechnik} onChange={set("verkaufstechnik")} className={sel} /></label>
        </div>
        <div>{L("Antwort-Optionen")}
          <div className="flex flex-col gap-2">
            {opts.map((o, i) => (
              <div key={i} className="rounded-lg border border-line bg-surface-2/40 p-2">
                <div className="flex flex-col gap-2 sm:flex-wrap sm:items-center">
                  <label className="flex shrink-0 items-center gap-1 text-xs text-muted" title="richtig">
                    <input type="checkbox" checked={o.ist_richtig} onChange={(e) => updOpt(i, { ist_richtig: e.target.checked })} className="accent-green h-5 w-5" />richtig
                  </label>
                  <input value={o.text} onChange={(e) => updOpt(i, { text: e.target.value })} placeholder={`Option ${String.fromCharCode(65 + i)}`} className={`${sel} w-full sm:flex-1`} />
                  <input value={o.punkte} onChange={(e) => updOpt(i, { punkte: e.target.value })} placeholder="Pkt" inputMode="numeric" className={`${sel} w-16`} />
                  <IconButton icon="x" label="entfernen" onClick={() => setOpts(opts.filter((_, j) => j !== i))} tone="danger" />
                </div>
                <input value={o.feedback} onChange={(e) => updOpt(i, { feedback: e.target.value })} placeholder="Feedback" className={`${sel} mt-2`} />
              </div>
            ))}
          </div>
          <button onClick={() => setOpts([...opts, blankOpt()])} className="mt-2 rounded bg-surface-2 px-3 py-2 text-sm font-semibold text-muted hover:text-ink min-h-10">+ Option</button>
        </div>
        <label className="block">{L("Musterantwort")}<textarea value={b.musterantwort} onChange={set("musterantwort")} rows={2} className={sel} /></label>
        <StrList label="Lerntyp(en)" items={lerntyp} setItems={setLerntyp} placeholder="z. B. visuell" />
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2 border-t border-line/60 pt-3">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
