"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import type { Rollenspiel } from "@/lib/akademie";

type Msg = { role: "user" | "assistant"; content: string };
type Coach = {
  perKrit: { name: string; punkte: number; max: number; kommentar: string }[];
  gesamt: string; got: number; max: number; pct: number;
};

const SEED = "(Die Szene beginnt. Sag als Kunde den ersten Satz — kurz, natürlich, passend zur Situation.)";

async function aiCall(mode: "chat" | "coach", rp: Rollenspiel, messages: Msg[]): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const init = (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData) || "";
  if (init) headers["X-Tg-Init"] = init;
  return fetch("/api/ai-chat", { method: "POST", headers, body: JSON.stringify({ mode, rp, messages }) });
}

export function RoleplayRunner({ rp, onClose }: { rp: Rollenspiel; onClose: () => void }) {
  // convo[0] = versteckte Seed-Anweisung; ab [1] sichtbar.
  const [convo, setConvo] = useState<Msg[]>([{ role: "user", content: SEED }]);
  const [sending, setSending] = useState(true);
  const [phase, setPhase] = useState<"chat" | "evaluating" | "result">("chat");
  const [coach, setCoach] = useState<Coach | null>(null);
  const [err, setErr] = useState<string>("");
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const turns = convo.slice(1).filter((m) => m.role === "user").length;

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; });
  }, []);

  // Eröffnung der KI beim Öffnen.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await aiCall("chat", rp, [{ role: "user", content: SEED }]);
        const j = await r.json().catch(() => ({}));
        if (!alive) return;
        if (r.ok && j.reply) setConvo((c) => [...c, { role: "assistant", content: j.reply }]);
        else setErr(j.error === "no_key" ? "no_key" : "unreachable");
      } catch { if (alive) setErr("unreachable"); }
      finally { if (alive) { setSending(false); scrollDown(); } }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(scrollDown, [convo, sending, scrollDown]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setErr("");
    const next = [...convo, { role: "user" as const, content: text }];
    setConvo(next);
    setInput("");
    setSending(true);
    try {
      const r = await aiCall("chat", rp, next);
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.reply) setConvo((c) => [...c, { role: "assistant", content: j.reply }]);
      else { setConvo(convo); setInput(text); setErr(j.error === "no_key" ? "no_key" : "unreachable"); }
    } catch { setConvo(convo); setInput(text); setErr("unreachable"); }
    finally { setSending(false); }
  }

  async function evaluate() {
    if (sending || turns < 1) { if (turns < 1) setErr("min"); return; }
    setPhase("evaluating");
    setErr("");
    const transcript = convo.slice(1).map((m) => `${m.role === "assistant" ? "KUNDE" : "VERKÄUFER"}: ${m.content}`).join("\n");
    try {
      const r = await aiCall("coach", rp, [{ role: "user", content: transcript }]);
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.coach) { setCoach(j.coach); setPhase("result"); }
      else { setErr(j.error === "no_key" ? "no_key" : "coach"); setPhase("chat"); }
    } catch { setErr("coach"); setPhase("chat"); }
  }

  function reset() {
    setConvo([{ role: "user", content: SEED }]);
    setCoach(null); setErr(""); setInput(""); setPhase("chat"); setSending(true);
    (async () => {
      try {
        const r = await aiCall("chat", rp, [{ role: "user", content: SEED }]);
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.reply) setConvo((c) => [...c, { role: "assistant", content: j.reply }]);
        else setErr(j.error === "no_key" ? "no_key" : "unreachable");
      } catch { setErr("unreachable"); }
      finally { setSending(false); }
    })();
  }

  const visible = convo.slice(1);

  return (
    <Modal onClose={onClose} wide>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">🎙 {rp.titel || "Live-Rollenspiel"}</h3>
          <p className="text-xs text-muted-2">{(rp.persona || "").split("(")[0].trim()}{rp.verkaufstechnik ? ` · ${rp.verkaufstechnik}` : ""}</p>
        </div>
        <button onClick={onClose} aria-label="Schließen" className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-muted hover:text-ink">✕</button>
      </div>

      {phase === "result" && coach ? (
        <CoachResult coach={coach} onRetry={reset} onClose={onClose} />
      ) : phase === "evaluating" ? (
        <div className="py-10 text-center">
          <div className="text-2xl">🎓</div>
          <p className="mt-2 font-semibold">KI-Coach wertet aus…</p>
          <Dots center />
        </div>
      ) : (
        <>
          <p className="mb-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">🛍 Du bist der/die VerkäuferIn. Antworte natürlich, wie im Laden. Die KI spielt die Kundin/den Kunden.</p>
          <div ref={chatRef} className="flex max-h-[46vh] min-h-[180px] flex-col gap-2 overflow-y-auto rounded-lg border border-line bg-bg/40 p-3">
            {visible.map((m, i) => (
              <Bubble key={i} seller={m.role === "user"} text={m.content} />
            ))}
            {sending && <Bubble seller={false} typing />}
            {!visible.length && !sending && <p className="py-6 text-center text-sm text-muted-2">Gespräch wird vorbereitet…</p>}
          </div>

          {err && (
            <p className="mt-2 rounded-lg bg-red/10 px-3 py-2 text-xs text-red">
              {err === "no_key" ? "⚙️ Kein KI-Key konfiguriert (Vercel-Env BOT_AI_KEY) — bitte ergänzen."
                : err === "min" ? "Sag erst ein paar Sätze, dann auswerten."
                : err === "coach" ? "Auto-Bewertung nicht möglich — nochmal versuchen."
                : "KI nicht erreichbar — nochmal senden."}
            </p>
          )}

          <div className="mt-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={2}
              disabled={sending}
              placeholder="Deine Antwort als VerkäuferIn…"
              className="flex-1 resize-none rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent disabled:opacity-60"
            />
            <button onClick={send} disabled={sending || !input.trim()} aria-label="Senden"
              className="rounded-lg bg-accent px-4 py-2.5 font-semibold text-bg disabled:opacity-50">➤</button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-2">{turns} Wechsel</span>
            <button onClick={evaluate} disabled={sending}
              className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-surface-2/70 disabled:opacity-50">🏁 Gespräch auswerten</button>
          </div>
        </>
      )}
    </Modal>
  );
}

function CoachResult({ coach, onRetry, onClose }: { coach: Coach; onRetry: () => void; onClose: () => void }) {
  const emoji = coach.pct >= 90 ? "🎉" : coach.pct >= 75 ? "🏆" : coach.pct >= 55 ? "🎯" : coach.pct >= 35 ? "💪" : "📚";
  return (
    <div>
      <div className="text-center">
        <div className="text-4xl">{emoji}</div>
        <div className="mt-1 text-3xl font-extrabold">{coach.got}<span className="text-lg text-muted">/{coach.max}</span></div>
        <div className="text-muted">{coach.pct}%</div>
      </div>
      {coach.gesamt && <p className="mt-3 rounded-lg border-l-2 border-accent bg-surface-2 px-3 py-2 text-sm text-muted">{coach.gesamt}</p>}
      <div className="mt-3 flex flex-col gap-2">
        {coach.perKrit.map((k, i) => {
          const ratio = k.max ? k.punkte / k.max : 0;
          const tone = ratio >= 0.75 ? "text-green" : ratio >= 0.4 ? "text-amber" : "text-red";
          return (
            <div key={i} className="rounded-lg border border-line bg-surface px-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{k.name}</span>
                <span className={cn("font-mono font-bold", tone)}>{k.punkte}/{k.max}</span>
              </div>
              {k.kommentar && <p className="mt-1 text-xs text-muted">{k.kommentar}</p>}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={onRetry} className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg">🔄 Nochmal</button>
        <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold">✓ Fertig</button>
      </div>
    </div>
  );
}

function Bubble({ seller, text, typing }: { seller: boolean; text?: string; typing?: boolean }) {
  return (
    <div className={cn("flex flex-col", seller ? "items-end" : "items-start")}>
      <span className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-2">{seller ? "Du" : "👤 Kunde"}</span>
      <div className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
        seller ? "rounded-br-sm bg-accent/20 text-ink" : "rounded-bl-sm bg-surface-2 text-ink")}>
        {typing ? <Dots /> : text}
      </div>
    </div>
  );
}

function Dots({ center }: { center?: boolean }) {
  return (
    <span className={cn("inline-flex gap-1", center && "mt-3 justify-center")}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-2" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={cn("relative w-full rounded-2xl border border-line bg-surface p-5 shadow-2xl", wide ? "max-w-xl" : "max-w-lg")}>{children}</div>
    </div>
  );
}
