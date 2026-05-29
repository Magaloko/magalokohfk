"use client";
import { useRef, useState } from "react";
import { Icon } from "@/components/icon";

type Msg = { role: "user" | "assistant"; content: string };
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const STARTERS = [
  "Wie fasse ich meinen Posteingang in Outlook zusammen?",
  "Wie analysiere ich Verkaufszahlen in Excel mit Copilot?",
  "Wie bekomme ich Action Items aus einem Teams-Meeting?",
  "Was ist der Unterschied zwischen Copilot und Copilot Chat?",
];
const errText = (e?: string) =>
  e === "no_key" ? "KI ist nicht konfiguriert (BOT_AI_KEY fehlt)."
    : e === "ai_unreachable" ? "KI nicht erreichbar – bitte erneut versuchen."
      : "Aktion fehlgeschlagen.";

export function CockpilotChat({ configured }: { configured: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy || !configured) return;
    setErr(""); setInput("");
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setBusy(true);
    try {
      const r = await fetch("/api/cockpilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.reply) setMsgs((m) => [...m, { role: "assistant", content: String(j.reply) }]);
      else setErr(errText(j.error));
    } catch { setErr("Verbindungsfehler."); }
    setBusy(false);
    setTimeout(() => boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" }), 60);
  }
  async function copy(text: string, i: number) {
    try { await navigator.clipboard.writeText(text); setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 1500); } catch { /* noop */ }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="sparkles" className="h-3.5 w-3.5 text-accent" />Copilot-Assistent — frag alles zu Microsoft Copilot</h2>

      {!configured && <div className="mb-3 rounded-lg border border-amber/40 bg-amber/10 p-3 text-sm text-amber">KI ist nicht konfiguriert (BOT_AI_KEY fehlt).</div>}

      <div ref={boxRef} className="mb-3 flex max-h-[420px] flex-col gap-3 overflow-y-auto">
        {msgs.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-2">Stell deine Frage – z. B.:</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button key={s} disabled={!configured} onClick={() => send(s)} className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted hover:text-ink disabled:opacity-50">{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={m.role === "user"
              ? "max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-3 py-2 text-sm text-bg"
              : "group max-w-[90%] rounded-2xl rounded-bl-sm border border-line bg-surface-2/50 px-3 py-2 text-sm"}>
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              {m.role === "assistant" && (
                <button onClick={() => copy(m.content, i)} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-2 hover:text-ink">
                  <Icon name={copiedIdx === i ? "check" : "copy"} className="h-3 w-3" />{copiedIdx === i ? "Kopiert" : "Kopieren"}
                </button>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-sm border border-line bg-surface-2/50 px-3 py-2 text-sm text-muted-2">Cockpilot denkt …</div></div>}
      </div>

      {err && <p className="mb-2 text-sm text-red">{err}</p>}
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2">
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          rows={2} placeholder="Frage zu Outlook, Excel, Word, Teams … (Enter zum Senden)" className={sel} disabled={!configured} />
        <button type="submit" disabled={busy || !input.trim() || !configured} className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50"><Icon name="send" className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
