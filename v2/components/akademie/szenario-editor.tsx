"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import type { Szenario } from "@/lib/akademie";
import { Icon } from "@/components/icon";
import { IconButton } from "@/components/_primitives/icon-button";

const COL = "trainingScenarios";
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;
type Persona = { id?: string; name?: string };
type Opt = { text: string; feedback: string };
type Step = { prompt: string; options: Opt[]; correctIdx: number };

const blankStep = (): Step => ({ prompt: "", options: [{ text: "", feedback: "" }, { text: "", feedback: "" }], correctIdx: 0 });

export function NewSzenarioButton({ personas }: { personas: Persona[] }) {
  const [open, setOpen] = useState(false);
  return (<>
    <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:opacity-90 min-h-11">+ Neues Szenario</button>
    {open && <SzenarioForm personas={personas} onClose={() => setOpen(false)} />}
  </>);
}

export function SzenarioActions({ id, szenario, personas }: { id: string; szenario: Szenario; personas: Persona[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  async function del() {
    if (busy || !confirm("Dieses Szenario wirklich löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  return (
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-1.5 min-h-10 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="inline-flex items-center gap-1 rounded-lg bg-red/10 px-3 py-1.5 min-h-10 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4" />Löschen</button>
      {edit && <SzenarioForm id={id} szenario={szenario} personas={personas} onClose={() => setEdit(false)} />}
    </div>
  );
}

function SzenarioForm({ id, szenario, personas, onClose }: { id?: string; szenario?: Szenario; personas: Persona[]; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(szenario?.name || "");
  const [situation, setSituation] = useState(szenario?.situation || "");
  const [personaId, setPersonaId] = useState(szenario?.personaId || "");
  const [schwierigkeit, setSchwierigkeit] = useState(szenario?.schwierigkeit || "");
  const [steps, setSteps] = useState<Step[]>(() => {
    const s = (szenario?.steps || []).map((st) => ({
      prompt: st.prompt || "",
      options: (st.options || []).map((o) => ({ text: o.text || "", feedback: o.feedback || "" })),
      correctIdx: Number.isInteger(st.correctIdx) ? (st.correctIdx as number) : 0,
    }));
    return s.length ? s : [blankStep()];
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const upd = (i: number, patch: Partial<Step>) => setSteps(steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const updOpt = (i: number, j: number, patch: Partial<Opt>) => upd(i, { options: steps[i].options.map((o, k) => (k === j ? { ...o, ...patch } : o)) });

  async function save() {
    if (!name.trim()) { setErr("Name fehlt."); return; }
    setBusy(true); setErr("");
    const item = { name, situation, personaId, schwierigkeit, steps };
    const r = id ? await cockpitMutate({ collection: COL, action: "replace", id, item }) : await cockpitMutate({ collection: COL, action: "create", item });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Szenario bearbeiten" : "Neues Szenario"}>
      <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
        <label className="block">{L("Name *")}<input value={name} onChange={(e) => setName(e.target.value)} className={sel} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">{L("Persona")}<select value={personaId} onChange={(e) => setPersonaId(e.target.value)} className={sel}>
            <option value="">—</option>{personas.map((p) => <option key={p.id || p.name} value={p.id || ""}>{p.name}</option>)}
          </select></label>
          <label className="block">{L("Schwierigkeit")}<input value={schwierigkeit} onChange={(e) => setSchwierigkeit(e.target.value)} className={sel} /></label>
        </div>
        <label className="block">{L("Situation")}<textarea value={situation} onChange={(e) => setSituation(e.target.value)} rows={2} className={sel} /></label>

        <div className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <div key={i} className="rounded-lg border border-line bg-surface-2/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-2">Schritt {i + 1}</span>
                <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="text-xs text-muted-2 hover:text-red">entfernen</button>
              </div>
              <textarea value={s.prompt} onChange={(e) => upd(i, { prompt: e.target.value })} rows={2} placeholder="Ausgangslage / Situation" className={`${sel} mb-2`} />
              <div className="flex flex-col gap-2">
                {s.options.map((o, j) => (
                  <div key={j} className="flex flex-wrap items-center gap-2">
                    <input type="radio" name={`correct-${i}`} checked={s.correctIdx === j} onChange={() => upd(i, { correctIdx: j })} title="richtige Antwort" className="accent-green" />
                    <input value={o.text} onChange={(e) => updOpt(i, j, { text: e.target.value })} placeholder={`Option ${String.fromCharCode(65 + j)}`} className={`${sel} w-full sm:flex-1`} />
                    <input value={o.feedback} onChange={(e) => updOpt(i, j, { feedback: e.target.value })} placeholder="Rückmeldung" className={`${sel} w-full sm:flex-1`} />
                    <IconButton icon="x" label="Option entfernen" onClick={() => upd(i, { options: s.options.filter((_, k) => k !== j), correctIdx: Math.min(s.correctIdx, Math.max(0, s.options.length - 2)) })} />
                  </div>
                ))}
              </div>
              <button onClick={() => upd(i, { options: [...s.options, { text: "", feedback: "" }] })} className="mt-2 rounded bg-surface-2 px-2 py-1 text-xs font-semibold text-muted hover:text-ink">+ Option</button>
            </div>
          ))}
          <button onClick={() => setSteps([...steps, blankStep()])} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink">+ Schritt</button>
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
