"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import { Confetti } from "./confetti";
import { ResultRewards } from "./result-rewards";
import type { Rollenspiel } from "@/lib/akademie";
import { Icon } from "@/components/icon";
import { IconButton } from "@/components/_primitives/icon-button";

type Msg = { role: "user" | "assistant"; content: string };
type Coach = {
  perKrit: { name: string; punkte: number; max: number; kommentar: string }[];
  gesamt: string; got: number; max: number; pct: number;
};
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

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
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceErr, setVoiceErr] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechBaseRef = useRef("");
  const speechEnabledRef = useRef(false);
  const speechSupportedRef = useRef(false);
  const turns = convo.slice(1).filter((m) => m.role === "user").length;

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; });
  }, []);

  // Eröffnung der KI (einmalig genutzt von Erst-Start UND „Nochmal").
  const startConversation = useCallback(async () => {
    setSending(true); setErr("");
    try {
      const r = await aiCall("chat", rp, [{ role: "user", content: SEED }]);
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.reply) {
        setConvo([{ role: "user", content: SEED }, { role: "assistant", content: j.reply }]);
        speakCustomer(j.reply);
      }
      else setErr(j.error === "no_key" ? "no_key" : "unreachable");
    } catch { setErr("unreachable"); }
    finally { setSending(false); scrollDown(); }
  }, [rp, scrollDown]);

  useEffect(() => { startConversation(); }, [startConversation]);
  useEffect(scrollDown, [convo, sending, scrollDown]);

  useEffect(() => {
    const w = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    setVoiceSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSpeechSupported(canSpeak);
    speechSupportedRef.current = canSpeak;
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => { speechEnabledRef.current = speechEnabled; }, [speechEnabled]);

  // Escape schließt; Eingabe fokussieren, sobald die KI fertig ist.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => { if (!sending && phase === "chat") inputRef.current?.focus(); }, [sending, phase]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    stopListening();
    setErr("");
    const next = [...convo, { role: "user" as const, content: text }];
    setConvo(next);
    setInput("");
    setSending(true);
    try {
      const r = await aiCall("chat", rp, next);
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.reply) {
        setConvo((c) => [...c, { role: "assistant", content: j.reply }]);
        speakCustomer(j.reply);
      }
      else { setConvo(convo); setInput(text); setErr(j.error === "no_key" ? "no_key" : "unreachable"); }
    } catch { setConvo(convo); setInput(text); setErr("unreachable"); }
    finally { setSending(false); }
  }

  function stopSpeech() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function speakCustomer(text: string) {
    if (!speechEnabledRef.current || !speechSupportedRef.current || !text.trim()) return;
    stopSpeech();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.96;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function toggleVoice() {
    if (listening) { stopListening(); return; }
    const w = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceErr("voice_unsupported");
      setVoiceSupported(false);
      return;
    }

    setVoiceErr("");
    speechBaseRef.current = input.trim();
    const recognition = new Recognition();
    recognition.lang = "de-DE";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) finalText += transcript;
        else interimText += transcript;
      }
      const spoken = `${finalText}${interimText}`.trim();
      const base = speechBaseRef.current;
      setInput([base, spoken].filter(Boolean).join(" "));
    };
    recognition.onerror = (event) => {
      setVoiceErr(event.error === "not-allowed" ? "voice_denied" : "voice_failed");
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      inputRef.current?.focus();
    };

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      recognitionRef.current = null;
      setVoiceErr("voice_failed");
    }
  }

  async function evaluate() {
    stopListening();
    stopSpeech();
    if (sending || turns < 1) { if (turns < 1) setErr("min"); return; }
    setPhase("evaluating");
    setErr("");
    const transcript = convo.slice(1).map((m) => `${m.role === "assistant" ? "KUNDE" : "MITARBEITER"}: ${m.content}`).join("\n");
    try {
      const r = await aiCall("coach", rp, [{ role: "user", content: transcript }]);
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.coach) { setCoach(j.coach); setPhase("result"); }
      else { setErr(j.error === "no_key" ? "no_key" : "coach"); setPhase("chat"); }
    } catch { setErr("coach"); setPhase("chat"); }
  }

  function reset() {
    stopListening();
    stopSpeech();
    setConvo([{ role: "user", content: SEED }]);
    setCoach(null); setInput(""); setPhase("chat");
    startConversation();
  }

  const visible = convo.slice(1);

  return (
    <Modal onClose={onClose} wide>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold"><Icon name="mic" className="h-5 w-5 inline-block mr-1" />{rp.titel || "Live-Rollenspiel"}</h3>
          <p className="text-xs text-muted-2">{(rp.persona || "").split("(")[0].trim()}{rp.verkaufstechnik ? ` · ${rp.verkaufstechnik}` : ""}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!speechSupported}
            onClick={() => { const next = !speechEnabled; speechEnabledRef.current = next; setSpeechEnabled(next); if (!next) stopSpeech(); }}
            title={speechSupported ? "Kundenantwort vorlesen" : "Vorlesen wird in diesem Browser nicht unterstützt"}
            aria-label={speechEnabled ? "Vorlesen ausschalten" : "Vorlesen einschalten"}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-lg disabled:opacity-50",
              speechEnabled ? "bg-accent/15 text-accent" : "text-muted-2 hover:text-ink",
            )}
          >
            <Icon name={speaking ? "dot" : "chat"} className="h-4 w-4" />
          </button>
          <IconButton icon="x" label="Schließen" onClick={onClose} tone="default" />
        </div>
      </div>

      {phase === "result" && coach ? (
        <CoachResult coach={coach} onRetry={reset} onClose={onClose} />
      ) : phase === "evaluating" ? (
        <div className="py-10 text-center">
          <div className="flex justify-center"><Icon name="academy" className="h-8 w-8" /></div>
          <p className="mt-2 font-semibold">KI-Coach wertet aus…</p>
          <Dots center />
        </div>
      ) : (
        <>
          <p className="mb-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted"><Icon name="chat" className="h-4 w-4 inline-block mr-1" />Du bist der/die HFK-MitarbeiterIn. Antworte natürlich, ruhig und verbindlich. Die KI spielt die Kundin/den Kunden.</p>
          <div ref={chatRef} className="flex max-h-[46vh] min-h-[180px] flex-col gap-2 overflow-y-auto rounded-lg border border-line bg-bg/40 p-3">
            {visible.map((m, i) => (
              <Bubble key={i} seller={m.role === "user"} text={m.content} />
            ))}
            {sending && <Bubble seller={false} typing />}
            {!visible.length && !sending && <p className="py-6 text-center text-sm text-muted-2">Gespräch wird vorbereitet…</p>}
          </div>

          {err && (
            <p className="mt-2 rounded-lg bg-red/10 px-3 py-2 text-xs text-red">
              {err === "no_key" ? <><Icon name="settings" className="h-4 w-4 inline-block mr-1" />Kein KI-Key konfiguriert (Vercel-Env BOT_AI_KEY) — bitte ergänzen.</>

                : err === "min" ? "Sag erst ein paar Sätze, dann auswerten."
                : err === "coach" ? "Auto-Bewertung nicht möglich — nochmal versuchen."
                : "KI nicht erreichbar — nochmal senden."}
            </p>
          )}
          {voiceErr && (
            <p className="mt-2 rounded-lg bg-amber/10 px-3 py-2 text-xs text-amber">
              {voiceErr === "voice_unsupported" ? "Spracheingabe wird in diesem Browser nicht unterstützt."
                : voiceErr === "voice_denied" ? "Mikrofon-Zugriff wurde nicht erlaubt."
                : "Spracheingabe konnte nicht gestartet werden."}
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
              placeholder="Deine Antwort als HFK-MitarbeiterIn…"
              className="flex-1 resize-none rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-base text-ink outline-none focus:border-accent disabled:opacity-60"
            />
            <button onClick={toggleVoice} disabled={sending} aria-label={listening ? "Aufnahme stoppen" : "Antwort diktieren"} title={voiceSupported ? "Antwort diktieren" : "Spracheingabe prüfen"}
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-lg border font-semibold disabled:opacity-50",
                listening ? "border-red bg-red/10 text-red" : voiceSupported ? "border-line bg-surface-2 text-ink hover:border-accent" : "border-line bg-surface-2 text-muted-2",
              )}>
              <Icon name="mic" className="h-4 w-4" />
            </button>
            <button onClick={send} disabled={sending || !input.trim()} aria-label="Senden"
              className="rounded-lg bg-accent px-4 py-2.5 font-semibold text-bg disabled:opacity-50"><Icon name="send" className="h-4 w-4" /></button>
          </div>
          {listening && <p className="mt-1 text-xs font-medium text-red">Aufnahme läuft. Sprich deine Antwort, dann stoppt VEKTRA automatisch.</p>}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-2">{turns} Wechsel</span>
            <button onClick={evaluate} disabled={sending}
              className="rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2/70 disabled:opacity-50 min-h-11"><Icon name="target" className="h-4 w-4 inline-block mr-1" />Gespräch auswerten</button>
          </div>
        </>
      )}
    </Modal>
  );
}

function CoachResult({ coach, onRetry, onClose }: { coach: Coach; onRetry: () => void; onClose: () => void }) {
  const icon = coach.pct >= 90 ? "party" : coach.pct >= 75 ? "trophy" : coach.pct >= 55 ? "target" : coach.pct >= 35 ? "bolt" : "book";
  return (
    <div>
      {coach.pct >= 75 && <Confetti intensity={coach.pct >= 90 ? 1.4 : 1} />}
      <div className="text-center">
        <div className="flex justify-center"><Icon name={icon} className="h-10 w-10" /></div>
        <div className="mt-1 text-3xl font-extrabold">{coach.got}<span className="text-lg text-muted">/{coach.max}</span></div>
        <div className="text-muted">{coach.pct}%</div>
      </div>
      {coach.max > 0 && <ResultRewards type="rollenspiel" score={coach.got} total={coach.max} />}
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
        <button onClick={onRetry} className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg"><Icon name="repeat" className="h-4 w-4 inline-block mr-1" />Nochmal</button>
        <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 font-semibold"><Icon name="check" className="h-4 w-4 inline-block mr-1" />Fertig</button>
      </div>
    </div>
  );
}

function Bubble({ seller, text, typing }: { seller: boolean; text?: string; typing?: boolean }) {
  return (
    <div className={cn("flex flex-col", seller ? "items-end" : "items-start")}>
      <span className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-2">{seller ? "Du" : <><Icon name="user" className="h-3 w-3 inline-block mr-0.5" />Kunde</>}</span>
      <div className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-base leading-relaxed",
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
      <div className={cn("relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-2xl", wide ? "max-w-xl" : "max-w-lg")}>{children}</div>
    </div>
  );
}
