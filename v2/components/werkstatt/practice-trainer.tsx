"use client";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { NewProposal } from "./proposal-board";

type Ein = { einwand: string; antwort: string };
type Review = { score: number; feedback: string; improved: string };
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";

export function PracticeTrainer({ einwaende, configured }: { einwaende: Ein[]; configured: boolean }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [share, setShare] = useState(false);

  const cur = einwaende[idx];

  async function grade() {
    if (!answer.trim() || busy) return;
    setBusy(true); setErr(""); setReview(null);
    try {
      const r = await fetch("/api/werkstatt/practice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ einwand: cur?.einwand || "", musterantwort: cur?.antwort || "", answer }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.review) setReview(j.review);
      else setErr(j.error === "no_key" ? "KI nicht konfiguriert." : "KI nicht erreichbar.");
    } catch { setErr("Verbindungsfehler."); }
    setBusy(false);
  }

  if (!einwaende.length) return <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted-2">Keine Einwände in der Bibliothek — bitte zuerst Inhalte pflegen.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Einwand wählen</label>
        <select value={idx} onChange={(e) => { setIdx(Number(e.target.value)); setReview(null); setAnswer(""); }} className={sel}>
          {einwaende.map((e, i) => <option key={i} value={i}>{e.einwand}</option>)}
        </select>
        <p className="mt-3 rounded-lg bg-surface-2/50 p-3 text-sm font-medium italic">„{cur?.einwand}“</p>

        <label className="mb-1 mt-4 block text-[11px] uppercase tracking-wide text-muted-2">Deine Antwort</label>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} placeholder="Wie reagierst du auf diesen Einwand?" className={sel} />
        <div className="mt-3 flex items-center gap-3">
          <button disabled={busy || !answer.trim() || !configured} onClick={grade} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "KI bewertet …" : "Bewerten lassen"}</button>
          <span className="text-xs text-muted-2">Die KI gibt dir Rückmeldung und einen Verbesserungsvorschlag.</span>
        </div>
        {!configured && <p className="mt-2 text-sm text-amber">KI ist nicht konfiguriert (BOT_AI_KEY fehlt).</p>}
        {err && <p className="mt-2 text-sm text-red">{err}</p>}
      </div>

      {review && (
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="sparkles" className="h-3.5 w-3.5 text-accent" />Deine Rückmeldung · {review.score}/100</h2>
          <p className="text-sm text-muted">{review.feedback}</p>
          {review.improved && (
            <div className="mt-2 rounded-lg border border-line bg-surface-2/50 p-2.5 text-sm">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-2">Verbesserte Fassung</span>
              <p className="mt-1 italic">{review.improved}</p>
            </div>
          )}
          <button onClick={() => setShare(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold hover:text-ink">
            <Icon name="send" className="h-3.5 w-3.5" />Als Vorschlag fürs Team teilen
          </button>
        </div>
      )}

      {share && (
        <NewProposal
          prefill={{ type: "einwand", title: cur?.einwand || "", content: review?.improved || answer }}
          onClose={() => setShare(false)}
          onDone={() => setShare(false)}
        />
      )}
    </div>
  );
}
