"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { StatusBadge } from "./proposal-board";
import { TYPE_LABEL, READY_THRESHOLD, type PublicProposal } from "@/lib/werkstatt-meta";

const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";

export function ProposalDetail({ initial, admin }: { initial: PublicProposal; admin: boolean }) {
  const router = useRouter();
  const [p, setP] = useState<PublicProposal>(initial);
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState("");
  const [adapt, setAdapt] = useState<{ title: string; content: string } | null>(null);

  const decided = p.decided;

  async function call(path: string, body: Record<string, unknown>) {
    setBusy(true);
    try {
      const r = await fetch(`/api/werkstatt/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, ...body }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.proposal) { setP(j.proposal); router.refresh(); }
      else alert(j.error === "rate_limited" ? "Zu viele Anfragen — kurz warten." : j.error === "forbidden" ? "Keine Berechtigung." : "Aktion fehlgeschlagen.");
    } catch { alert("Verbindungsfehler."); }
    setBusy(false);
  }
  const vote = (v: number) => call("vote", { value: p.myVote === v ? 0 : v });
  async function sendComment() {
    if (!comment.trim()) return;
    const body = comment; setComment("");
    await call("comment", { body });
  }
  async function decide(decision: string, extra: Record<string, unknown> = {}) {
    if (decision === "rejected" && !confirm("Vorschlag wirklich ablehnen?")) return;
    await call("decide", { decision, ...extra });
    setAdapt(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-2">{TYPE_LABEL[p.type]}</span>
          <StatusBadge p={p} />
          {p.ready && <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-semibold text-amber">bereit zur Freigabe</span>}
        </div>
        <h1 className="text-xl font-extrabold">{p.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink">{p.content}</p>

        {/* Voting */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button disabled={busy || decided} onClick={() => vote(1)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50", p.myVote === 1 ? "bg-green text-bg" : "bg-surface-2 text-muted hover:text-ink")}><Icon name="check" className="h-4 w-4" />Dafür</button>
          <button disabled={busy || decided} onClick={() => vote(-1)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50", p.myVote === -1 ? "bg-red text-bg" : "bg-surface-2 text-muted hover:text-ink")}><Icon name="x" className="h-4 w-4" />Dagegen</button>
          <span className="ml-1 text-sm text-muted-2">Netto: <b className="text-ink">{p.score >= 0 ? "+" : ""}{p.score}</b> · ab +{READY_THRESHOLD} bereit</span>
        </div>
      </div>

      {/* KI-Bewertung */}
      {(typeof p.ai_review?.score === "number" || p.ai_review?.feedback) && (
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="sparkles" className="h-3.5 w-3.5 text-accent" />KI-Bewertung {typeof p.ai_review.score === "number" ? `· ${p.ai_review.score}/100` : ""}</h2>
          {p.ai_review.feedback && <p className="text-sm text-muted">{p.ai_review.feedback}</p>}
          {p.ai_review.improved && <div className="mt-2 rounded-lg border border-line bg-surface-2/50 p-2.5 text-sm"><span className="text-[11px] font-bold uppercase tracking-wide text-muted-2">KI-Vorschlag</span><p className="mt-1 italic">{p.ai_review.improved}</p></div>}
        </div>
      )}

      {/* Admin-Entscheidung */}
      {admin && !decided && (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 shadow-sm">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-accent">Entscheidung (Admin)</h2>
          {!adapt ? (
            <div className="flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => decide("approved")} className="rounded-lg bg-green px-3 py-2 text-sm font-semibold text-bg disabled:opacity-50">Annehmen{p.type === "einwand" ? " & übernehmen" : ""}</button>
              <button disabled={busy} onClick={() => setAdapt({ title: p.title, content: p.content })} className="rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink disabled:opacity-50">Anpassen & übernehmen</button>
              <button disabled={busy} onClick={() => decide("rejected")} className="rounded-lg bg-red/10 px-3 py-2 text-sm font-semibold text-red hover:bg-red/20 disabled:opacity-50">Ablehnen</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <input value={adapt.title} onChange={(e) => setAdapt({ ...adapt, title: e.target.value })} className={sel} />
              <textarea value={adapt.content} onChange={(e) => setAdapt({ ...adapt, content: e.target.value })} rows={4} className={sel} />
              <div className="flex gap-2">
                <button disabled={busy} onClick={() => decide("adapted", { title: adapt.title, content: adapt.content })} className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-bg disabled:opacity-50">Übernehmen</button>
                <button onClick={() => setAdapt(null)} className="rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold">Abbrechen</button>
              </div>
            </div>
          )}
          {p.type === "einwand" && <p className="mt-2 text-[11px] text-muted-2">Bei Annahme wird die Einwand-Antwort in die Einwände-Bibliothek übernommen.</p>}
        </div>
      )}

      {/* Kommentare */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="chat" className="h-3.5 w-3.5" />Diskussion ({p.commentsCount})</h2>
        <ul className="mb-3 flex flex-col gap-2">
          {p.comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-line bg-surface-2/40 p-2.5 text-sm">
              <div className="mb-0.5 text-[11px] text-muted-2">{c.mine ? "Du" : "Kolleg:in"} · {c.at.slice(0, 10)}</div>
              <p className="whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
          {!p.comments.length && <li className="text-sm text-muted-2">Noch keine Kommentare — starte die Diskussion.</li>}
        </ul>
        <div className="flex items-end gap-2">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Kommentar schreiben …" className={sel} />
          <button disabled={busy || !comment.trim()} onClick={sendComment} className="shrink-0 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-bg disabled:opacity-50"><Icon name="send" className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
