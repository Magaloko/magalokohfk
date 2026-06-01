"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { EIGNUNG_FELDER, type ProduktBasis, type KompassEignung } from "@/lib/kompass-core";

// Cockpit-Pflege des Kompass-Eignungs-Overlays: Team bewertet einzelne Kinderwagen.
export function KompassPflege({ produkte, eignung }: { produkte: ProduktBasis[]; eignung: KompassEignung[] }) {
  const router = useRouter();
  const byNr = useMemo(() => new Map(eignung.map((e) => [e.jtlArtikelNr, e])), [eignung]);
  const [q, setQ] = useState("");
  const gepflegt = (nr: string) => byNr.has(nr);

  const liste = useMemo(() => {
    const s = q.trim().toLowerCase();
    const arr = s ? produkte.filter((p) => p.name.toLowerCase().includes(s) || p.marke.toLowerCase().includes(s)) : produkte;
    // Bewertete zuerst, dann alphabetisch; Anzeige begrenzt.
    return [...arr].sort((a, b) => Number(gepflegt(b.jtlArtikelNr)) - Number(gepflegt(a.jtlArtikelNr))).slice(0, 60);
  }, [q, produkte, byNr]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kinderwagen suchen (Name/Marke) …"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent" />
        </div>
        <span className="shrink-0 text-xs text-muted-2">{byNr.size} bewertet</span>
      </div>
      <div className="flex flex-col gap-2">
        {liste.map((p) => <Row key={p.jtlArtikelNr} p={p} eignung={byNr.get(p.jtlArtikelNr)} onSaved={() => router.refresh()} />)}
        {!liste.length && <p className="text-sm text-muted-2">Keine Treffer.</p>}
      </div>
    </div>
  );
}

function Row({ p, eignung, onSaved }: { p: ProduktBasis; eignung?: KompassEignung; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const init: Record<string, string> = {};
  for (const f of EIGNUNG_FELDER) init[f.key] = (eignung as any)?.[f.key] || "";
  const [vals, setVals] = useState<Record<string, string>>(init);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setVals((s) => ({ ...s, [k]: v }));

  async function save() {
    setBusy(true); setErr("");
    const fields: Record<string, unknown> = {};
    for (const f of EIGNUNG_FELDER) fields[f.key] = vals[f.key] || "";
    const res = eignung?.id
      ? await cockpitMutate({ collection: "kompassEignung", action: "update", id: eignung.id, patch: fields })
      : await cockpitMutate({ collection: "kompassEignung", action: "create", item: { jtlArtikelNr: p.jtlArtikelNr, ...fields } });
    if (res.ok) { setOpen(false); onSaved(); } else { setErr(errText(res.error)); setBusy(false); }
  }

  return (
    <div className={cn("rounded-lg border bg-surface p-3", eignung ? "border-accent/40" : "border-line")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 text-left">
        {eignung ? <Icon name="check" className="h-4 w-4 shrink-0 text-green" /> : <Icon name="dot" className="h-4 w-4 shrink-0 text-muted-2" />}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
        {p.preisEur != null && <span className="shrink-0 text-xs text-muted-2">{Math.round(p.preisEur)} €</span>}
        <span className={cn("shrink-0 transition-transform", open && "rotate-90")}><Icon name="arrow-right" className="h-4 w-4 text-muted-2" /></span>
      </button>
      {open && (
        <div className="mt-3 grid gap-2 border-t border-line pt-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EIGNUNG_FELDER.filter((f) => f.optionen).map((f) => (
              <label key={f.key} className="flex flex-col gap-1 text-xs">
                <span className="font-semibold text-muted-2">{f.label}</span>
                <select value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)}
                  className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-accent">
                  <option value="">—</option>
                  {f.optionen!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold text-muted-2">Ausschluss-Hinweis (optional)</span>
            <input value={vals.ausschlussHinweis} onChange={(e) => set("ausschlussHinweis", e.target.value)} placeholder="z. B. nur für Stadt, nicht für Feldwege"
              className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent" />
          </label>
          {err && <p className="text-xs text-red">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={busy} className="min-h-9 rounded-lg bg-accent px-4 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "Speichert …" : "Speichern"}</button>
            <button type="button" onClick={() => setOpen(false)} disabled={busy} className="min-h-9 rounded-lg bg-surface-2 px-4 text-sm font-semibold">Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}
