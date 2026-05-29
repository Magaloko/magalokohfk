"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "./mutate";
import { Modal } from "./task-editor";
import { Icon } from "@/components/icon";
import type { Lever } from "@/lib/cockpit";

const STATUSES = ["Backlog", "Geplant", "In Arbeit", "Live", "Verworfen"];
const LEVELS = ["", "hoch", "mittel", "niedrig"];
const COL = "levers";
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";

type Form = { title: string; area: string; status: string; expectedImpactEur: string; effortHours: string; confidence: string; risk: string; description: string; startDate: string; finishDate: string };
const toForm = (l?: Lever): Form => ({
  title: l?.title || "", area: l?.area || "", status: l?.status || "Backlog",
  expectedImpactEur: l?.expectedImpactEur != null ? String(l.expectedImpactEur) : "",
  effortHours: l?.effortHours != null ? String(l.effortHours) : "",
  confidence: l?.confidence || "", risk: l?.risk || "", description: (l as any)?.description || "",
  startDate: l?.startDate || "", finishDate: l?.finishDate || "",
});

export function NewLeverButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">+ Neuer Hebel</button>
      {open && <LeverForm onClose={() => setOpen(false)} />}
    </>
  );
}

export function LeverActions({ id, lever }: { id: string; lever: Lever }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  const [err, setErr] = useState("");

  async function setStatus(status: string) {
    if (busy || status === lever.status) return;
    setBusy(true); setErr("");
    const r = await cockpitMutate({ collection: COL, action: "update", id, patch: { status } });
    setBusy(false);
    if (r.ok) router.refresh(); else setErr(errText(r.error));
  }
  async function del() {
    if (busy || !confirm("Diesen Hebel wirklich löschen?")) return;
    setBusy(true); setErr("");
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    if (r.ok) { router.push("/cockpit/hebel"); router.refresh(); }
    else { setBusy(false); setErr(errText(r.error)); }
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">Status setzen</h2>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} disabled={busy} onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${s === lever.status ? "bg-accent text-bg" : "bg-surface-2 text-muted hover:text-ink"}`}>{s}</button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={() => setEdit(true)} className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-3.5 w-3.5" /> Bearbeiten</button>
        <button disabled={busy} onClick={del} className="flex items-center gap-1.5 rounded-lg bg-red/10 px-3 py-1.5 text-sm font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-3.5 w-3.5" /> Löschen</button>
      </div>
      {err && <p className="mt-2 text-sm text-red">{err}</p>}
      {edit && <LeverForm id={id} lever={lever} onClose={() => setEdit(false)} />}
    </section>
  );
}

function LeverForm({ id, lever, onClose }: { id?: string; lever?: Lever; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(toForm(lever));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    if (!f.title.trim()) { setErr("Titel fehlt."); return; }
    setBusy(true); setErr("");
    const payload = f as unknown as Record<string, unknown>;
    const r = id
      ? await cockpitMutate({ collection: COL, action: "update", id, patch: payload })
      : await cockpitMutate({ collection: COL, action: "create", item: payload });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  const L = (label: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{label}</span>;
  return (
    <Modal onClose={onClose} title={id ? "Hebel bearbeiten" : "Neuer Hebel"}>
      <div className="flex flex-col gap-3">
        <label className="block">{L("Titel *")}<input value={f.title} onChange={set("title")} className={sel} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">{L("Bereich")}<input value={f.area} onChange={set("area")} className={sel} /></label>
          <label className="block">{L("Status")}<select value={f.status} onChange={set("status")} className={sel}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="block">{L("Impact € / Jahr")}<input value={f.expectedImpactEur} onChange={set("expectedImpactEur")} inputMode="numeric" placeholder="50000" className={sel} /></label>
          <label className="block">{L("Aufwand (h)")}<input value={f.effortHours} onChange={set("effortHours")} inputMode="numeric" placeholder="16" className={sel} /></label>
          <label className="block">{L("Confidence")}<select value={f.confidence} onChange={set("confidence")} className={sel}>{LEVELS.map((v) => <option key={v} value={v}>{v || "—"}</option>)}</select></label>
          <label className="block">{L("Risiko")}<select value={f.risk} onChange={set("risk")} className={sel}>{LEVELS.map((v) => <option key={v} value={v}>{v || "—"}</option>)}</select></label>
          <label className="block">{L("Start")}<input type="date" value={f.startDate} onChange={set("startDate")} className={sel} /></label>
          <label className="block">{L("Ziel / Ende")}<input type="date" value={f.finishDate} onChange={set("finishDate")} className={sel} /></label>
        </div>
        <label className="block">{L("Beschreibung")}<textarea value={f.description} onChange={set("description")} rows={3} className={sel} /></label>
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
