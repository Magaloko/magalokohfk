"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import { DataTable, type Column } from "@/components/_primitives/data-table";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import type { MagoModule, MagoField, MagoItem } from "@/lib/mago-config";

const selCls = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";

function display(field: MagoField, v: unknown): string {
  if (v === undefined || v === null || v === "") return "—";
  return field.suffix ? `${v}${field.suffix}` : String(v);
}

function toneFor(v: string): "green" | "amber" | "accent" | "muted" {
  const s = v.toLowerCase();
  if (["abgenommen", "geliefert", "erreicht", "erledigt", "gut"].includes(s)) return "green";
  if (["in arbeit", "neutral", "geplant"].includes(s)) return "accent";
  if (["schwierig"].includes(s)) return "amber";
  return "muted";
}

// Generisches CRUD für Magos Module — Liste (DataTable) + Modal-Formular (Neu/Bearbeiten) + Löschen.
export function MagoCrud({ module, items }: { module: MagoModule; items: MagoItem[] }) {
  const [openNew, setOpenNew] = useState(false);
  const listFields = module.fields.filter((f) => f.inList);

  const cols: Column<MagoItem>[] = [
    ...listFields.map((f): Column<MagoItem> => ({
      key: f.key,
      label: f.label,
      align: f.type === "number" ? "right" : "left",
      render: (r) => {
        if (f.key === "status" || f.key === "stimmung") {
          const raw = String(r[f.key] || "");
          return raw ? <Pill tone={toneFor(raw)}>{raw}</Pill> : <span className="text-muted-2">—</span>;
        }
        return <span className={f.required ? "font-medium text-ink" : "text-muted"}>{display(f, r[f.key])}</span>;
      },
    })),
    { key: "_act", label: "", align: "right", render: (r) => <RowActions module={module} item={r} /> },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={() => setOpenNew(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">{module.newLabel}</button>
      </div>
      <DataTable columns={cols} rows={items} getKey={(r, i) => String(r.id || i)} empty={{ title: module.emptyTitle }} />
      {openNew && <MagoForm module={module} item={null} onClose={() => setOpenNew(false)} />}
    </div>
  );
}

function RowActions({ module, item }: { module: MagoModule; item: MagoItem }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  async function del() {
    if (busy || !item.id || !confirm("Diesen Eintrag wirklich löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: module.collection, action: "delete", id: String(item.id) });
    if (r.ok) router.refresh();
    else { setBusy(false); alert(errText(r.error)); }
  }
  return (
    <div className="flex items-center justify-end gap-1">
      <button onClick={() => setEdit(true)} className="rounded-lg p-1.5 text-muted-2 transition hover:bg-surface-2 hover:text-ink" aria-label="Bearbeiten"><Icon name="edit" className="h-4 w-4" /></button>
      <button onClick={del} disabled={busy} className="rounded-lg p-1.5 text-muted-2 transition hover:bg-red/10 hover:text-red disabled:opacity-50" aria-label="Löschen"><Icon name="trash" className="h-4 w-4" /></button>
      {edit && <MagoForm module={module} item={item} onClose={() => setEdit(false)} />}
    </div>
  );
}

function MagoForm({ module, item, onClose }: { module: MagoModule; item: MagoItem | null; onClose: () => void }) {
  const router = useRouter();
  const initial: Record<string, string> = {};
  for (const f of module.fields) initial[f.key] = item && item[f.key] != null ? String(item[f.key]) : "";
  const [f, setF] = useState<Record<string, string>>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  const reqField = module.fields.find((x) => x.required);
  async function save() {
    if (reqField && !f[reqField.key]?.trim()) { setErr(`${reqField.label} fehlt.`); return; }
    setBusy(true); setErr("");
    const id = item?.id ? String(item.id) : "";
    const r = id
      ? await cockpitMutate({ collection: module.collection, action: "update", id, patch: f })
      : await cockpitMutate({ collection: module.collection, action: "create", item: f });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={item ? `${module.label} bearbeiten` : module.newLabel.replace(/^\+\s*/, "Neu: ")}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {module.fields.map((fd) => (
            <label key={fd.key} className={`block ${fd.full || fd.type === "textarea" ? "sm:col-span-2" : ""}`}>
              <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{fd.label}{fd.required ? " *" : ""}</span>
              {fd.type === "textarea" ? (
                <textarea value={f[fd.key]} onChange={(e) => set(fd.key, e.target.value)} rows={3} className={selCls} />
              ) : fd.type === "select" ? (
                <select value={f[fd.key]} onChange={(e) => set(fd.key, e.target.value)} className={selCls}>
                  <option value="">—</option>
                  {fd.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={fd.type === "number" ? "number" : "text"} inputMode={fd.type === "number" ? "decimal" : undefined}
                  value={f[fd.key]} onChange={(e) => set(fd.key, e.target.value)} placeholder={fd.placeholder} className={selCls} />
              )}
            </label>
          ))}
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
