"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "./mutate";
import { Modal } from "./task-editor";
import { Icon } from "@/components/icon";
import type { WeeklyKpi } from "@/lib/cockpit";

const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const SKIP = new Set(["id", "weekStart", "weekLabel"]);

type Row = { key: string; value: string };

export function NewKpiButton({ collection = "weeklyKpis" }: { collection?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">+ Neue Woche</button>
      {open && <KpiForm collection={collection} onClose={() => setOpen(false)} />}
    </>
  );
}

export function KpiActions({ id, week, collection = "weeklyKpis" }: { id: string; week: WeeklyKpi; collection?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  const [err, setErr] = useState("");

  async function del() {
    if (busy || !confirm("Diese KPI-Woche wirklich löschen?")) return;
    setBusy(true); setErr("");
    const r = await cockpitMutate({ collection, action: "delete", id });
    setBusy(false);
    if (r.ok) router.refresh(); else setErr(errText(r.error));
  }

  return (
    <div className="mt-3 flex items-center gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-3 w-3" /> Bearbeiten</button>
      <button disabled={busy} onClick={del} className="flex items-center gap-1.5 rounded-lg bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-3 w-3" /> Löschen</button>
      {err && <span className="text-xs text-red">{err}</span>}
      {edit && <KpiForm id={id} week={week} collection={collection} onClose={() => setEdit(false)} />}
    </div>
  );
}

function KpiForm({ id, week, collection = "weeklyKpis", onClose }: { id?: string; week?: WeeklyKpi; collection?: string; onClose: () => void }) {
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(String(week?.weekStart || ""));
  const [weekLabel, setWeekLabel] = useState(String(week?.weekLabel || ""));
  const initRows: Row[] = week
    ? Object.entries(week).filter(([k]) => !SKIP.has(k)).map(([k, v]) => ({ key: k, value: String(v) }))
    : [{ key: "", value: "" }, { key: "", value: "" }];
  const [rows, setRows] = useState<Row[]>(initRows.length ? initRows : [{ key: "", value: "" }]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const setRow = (i: number, k: keyof Row, v: string) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows([...rows, { key: "", value: "" }]);
  const delRow = (i: number) => setRows(rows.filter((_, j) => j !== i));

  async function save() {
    if (!weekStart.trim() && !weekLabel.trim()) { setErr("Woche (Start oder Label) angeben."); return; }
    setBusy(true); setErr("");
    const item: Record<string, unknown> = {};
    if (weekStart.trim()) item.weekStart = weekStart.trim();
    if (weekLabel.trim()) item.weekLabel = weekLabel.trim();
    for (const r of rows) { const k = r.key.trim(); if (k && r.value.trim() !== "") item[k] = r.value.trim(); }
    const r = id
      ? await cockpitMutate({ collection, action: "replace", id, item })
      : await cockpitMutate({ collection, action: "create", item });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  const L = (label: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{label}</span>;
  return (
    <Modal onClose={onClose} title={id ? "KPI-Woche bearbeiten" : "Neue KPI-Woche"}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">{L("Woche-Start (YYYY-MM-DD)")}<input value={weekStart} onChange={(e) => setWeekStart(e.target.value)} placeholder="2026-05-25" className={sel} /></label>
          <label className="block">{L("Label")}<input value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)} placeholder="KW 22 / 2026" className={sel} /></label>
        </div>
        <div>
          {L("Kennzahlen")}
          <div className="flex flex-col gap-2">
            {rows.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input value={r.key} onChange={(e) => setRow(i, "key", e.target.value)} placeholder="z. B. umsatz" className={`${sel} flex-1`} />
                <input value={r.value} onChange={(e) => setRow(i, "value", e.target.value)} placeholder="Wert" className={`${sel} w-28`} />
                <button onClick={() => delRow(i)} aria-label="Zeile entfernen" className="rounded-lg bg-surface-2 px-2 text-muted-2 hover:text-red">
                  <Icon name="x" className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addRow} className="mt-2 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink">+ Kennzahl</button>
        </div>
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
