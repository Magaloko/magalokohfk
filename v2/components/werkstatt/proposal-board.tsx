"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/cockpit/task-editor";
import { TYPE_LABEL, STATUS_LABEL, TYPE_OPTIONS, type PublicProposal, type ProposalType, type ProposalStatus } from "@/lib/werkstatt-meta";

const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";

export function ProposalBoard({ initial, prefill }: { initial: PublicProposal[]; prefill?: { type?: ProposalType; title?: string; content?: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-2">{initial.length} {initial.length === 1 ? "Vorschlag" : "Vorschläge"} · ab {3} 👍 netto bereit zur Freigabe</p>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">+ Neuer Vorschlag</button>
      </div>

      {initial.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {initial.map((p) => <Card key={p.id} p={p} />)}
        </div>
      ) : <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted-2">Noch keine Vorschläge. Teile deine erste Idee, Einwand-Antwort oder Lösung!</p>}

      {open && <NewProposal prefill={prefill} onClose={() => setOpen(false)} onDone={() => { setOpen(false); router.refresh(); }} />}
    </div>
  );
}

function Card({ p }: { p: PublicProposal }) {
  return (
    <Link href={`/werkstatt/vorschlag/${p.id}`} className="group flex flex-col rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-2">{TYPE_LABEL[p.type]}</span>
        <StatusBadge p={p} />
      </div>
      <h3 className="font-bold leading-snug group-hover:text-accent">{p.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{p.content}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-2">
        <span className="inline-flex items-center gap-1"><Icon name="check" className="h-3.5 w-3.5" />{p.score >= 0 ? "+" : ""}{p.score}</span>
        <span className="inline-flex items-center gap-1"><Icon name="chat" className="h-3.5 w-3.5" />{p.commentsCount}</span>
        {typeof p.ai_review?.score === "number" && <span className="inline-flex items-center gap-1"><Icon name="sparkles" className="h-3.5 w-3.5" />{p.ai_review.score}/100</span>}
        {p.ready && <span className="ml-auto rounded-full bg-amber/15 px-2 py-0.5 font-semibold text-amber">bereit zur Freigabe</span>}
      </div>
    </Link>
  );
}

export function StatusBadge({ p }: { p: { status: ProposalStatus } }) {
  const tone = p.status === "merged" || p.status === "approved" || p.status === "adapted" ? "bg-green/15 text-green"
    : p.status === "rejected" ? "bg-red/15 text-red" : "bg-accent/15 text-accent";
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", tone)}>{STATUS_LABEL[p.status]}</span>;
}

export function NewProposal({ prefill, onClose, onDone }: { prefill?: { type?: ProposalType; title?: string; content?: string }; onClose: () => void; onDone: () => void }) {
  const [type, setType] = useState<ProposalType>(prefill?.type || "idee");
  const [title, setTitle] = useState(prefill?.title || "");
  const [content, setContent] = useState(prefill?.content || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    if (!title.trim()) { setErr("Titel fehlt."); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/werkstatt/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, title, content }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) onDone(); else setErr(j.error === "empty" ? "Titel fehlt." : "Speichern fehlgeschlagen.");
    } catch { setErr("Verbindungsfehler."); }
    setBusy(false);
  }
  const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;

  return (
    <Modal onClose={onClose} title="Neuer Vorschlag">
      <div className="flex flex-col gap-3">
        <label className="block">{L("Art")}
          <select value={type} onChange={(e) => setType(e.target.value as ProposalType)} className={sel}>
            {TYPE_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>
        <label className="block">{L(type === "einwand" ? "Einwand (Titel) *" : "Titel *")}<input value={title} onChange={(e) => setTitle(e.target.value)} className={sel} placeholder={type === "einwand" ? "z. B. „Das ist mir zu teuer“" : "Kurz & prägnant"} /></label>
        <label className="block">{L(type === "einwand" ? "Deine Antwort / Lösung" : "Inhalt")}<textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className={sel} /></label>
        <p className="text-[11px] text-muted-2">Die KI prüft deinen Vorschlag automatisch und gibt Feedback. Einwand-Antworten können bei Annahme in die Einwände-Bibliothek übernommen werden.</p>
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "Prüfe & speichere …" : "Einreichen"}</button>
        </div>
      </div>
    </Modal>
  );
}
