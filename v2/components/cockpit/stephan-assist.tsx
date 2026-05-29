"use client";
import { useState } from "react";
import { Icon } from "@/components/icon";

const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const errText = (e?: string) =>
  e === "no_key" || e === "ai_unavailable" ? "KI ist nicht konfiguriert (BOT_AI_KEY fehlt)."
    : e === "rate_limited" ? "Zu viele Anfragen – bitte kurz warten."
      : e === "ai_unreachable" ? "KI nicht erreichbar – bitte erneut versuchen."
      : e === "empty" ? "Bitte zuerst eine Nachricht einfügen."
        : e === "forbidden" || e === "unauthorized" ? "Keine Berechtigung."
          : "Aktion fehlgeschlagen.";

export function StephanAssist({ configured }: { configured: boolean }) {
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  async function run() {
    if (!msg.trim() || busy) return;
    setBusy(true); setErr(""); setReply(""); setCopied(false);
    try {
      const r = await fetch("/api/stephan-assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.reply) setReply(String(j.reply));
      else setErr(errText(j.error));
    } catch { setErr("Verbindungsfehler."); }
    setBusy(false);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(reply); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  }

  return (
    <div className="flex flex-col gap-4">
      {!configured && (
        <div className="rounded-lg border border-amber/40 bg-amber/10 p-3 text-sm text-amber">
          KI ist nicht konfiguriert (BOT_AI_KEY fehlt) – der Assistent kann derzeit keine Antwort erzeugen.
        </div>
      )}

      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Nachricht von Stephan</label>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={6} placeholder="Eingehende Nachricht / Anfrage hier einfügen …" className={sel} />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button disabled={busy || !msg.trim() || !configured} onClick={run}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">
            {busy ? "Suche in MAGALOKO …" : "Antwort entwerfen"}
          </button>
          {msg.trim() && !busy && <button onClick={() => { setMsg(""); setReply(""); setErr(""); }} className="text-xs font-semibold text-muted-2 hover:text-ink">Leeren</button>}
          <span className="text-xs text-muted-2">Antwort basiert ausschließlich auf MAGALOKO-Daten.</span>
        </div>
        {err && <p className="mt-2 text-sm text-red">{err}</p>}
      </div>

      {reply && (
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="chat" className="h-3.5 w-3.5" />Antwortvorschlag</h2>
            <button onClick={copy} className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink">
              <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />{copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{reply}</div>
          <p className="mt-3 border-t border-line pt-2 text-[11px] text-muted-2">Vorschlag vor dem Senden prüfen. Nicht belegte Punkte sind als fehlend gekennzeichnet.</p>
        </div>
      )}
    </div>
  );
}
