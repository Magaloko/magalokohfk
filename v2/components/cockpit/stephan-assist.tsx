"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { cockpitMutate } from "@/components/cockpit/mutate";
import type { MutateBody } from "@/components/cockpit/mutate";
import type { StephanMessage } from "@/lib/stephan-thread";

// Extraktions-Typ → Ziel-Sammlung (Cockpit). Mapping siehe buildMutate().
type ExItem = { type: string; title: string; detail: string; date: string; area: string; reason: string; _key: string; _status?: "busy" | "done" | "err" };
const TYPE_LABEL: Record<string, string> = { aufgabe: "Aufgabe", ziel: "Ziel / Hebel", entscheidung: "Entscheidung", termin: "Termin", idee: "Idee" };
const TARGET_HINT: Record<string, string> = { aufgabe: "→ Aufgaben (Datum = fällig)", ziel: "→ Hebel (Datum = Start)", entscheidung: "→ Entscheidungen (Datum = Frist)", termin: "→ Kalender (Datum = Termin)", idee: "→ Aufgaben, Bereich „Idee“" };

// Baut den Anti-Wipe-sicheren create-Aufruf je Typ; leere Felder werden weggelassen.
// Provenance-Backlink kommt in notes/empfehlung (alle Ziel-Sammlungen unterstützen das).
function buildMutate(it: ExItem): MutateBody {
  const notes = [it.detail.trim(), it.reason.trim() && `Beleg: „${it.reason.trim()}“`, "[Aus Stephan-Chat erfasst]"].filter(Boolean).join("\n\n");
  const put = (o: Record<string, unknown>): Record<string, unknown> => {
    const c: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) if (v !== undefined && String(v).trim() !== "") c[k] = v;
    return c;
  };
  switch (it.type) {
    case "ziel": return { collection: "levers", action: "create", item: put({ title: it.title, area: it.area, startDate: it.date, notes }) };
    case "entscheidung": return { collection: "stephanDecisions", action: "create", item: put({ titel: it.title, kategorie: it.area, frist: it.date, empfehlung: notes }) };
    case "termin": return { collection: "calendarEvents", action: "create", item: put({ title: it.title, date: it.date, kind: "Termin", notes }) };
    case "idee": return { collection: "tasks", action: "create", item: put({ title: it.title, area: it.area || "Idee", priority: "niedrig", notes }) };
    default: return { collection: "tasks", action: "create", item: put({ title: it.title, area: it.area, dueDate: it.date, notes }) };
  }
}

const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const errText = (e?: string) =>
  e === "no_key" || e === "ai_unavailable" ? "KI ist nicht konfiguriert (BOT_AI_KEY fehlt)."
    : e === "rate_limited" ? "Zu viele Anfragen – bitte kurz warten."
      : e === "ai_unreachable" ? "KI nicht erreichbar – bitte erneut versuchen."
        : e === "empty" ? "Bitte zuerst Text eingeben."
          : e === "forbidden" || e === "unauthorized" ? "Keine Berechtigung."
            : e === "save_failed" ? "Speichern fehlgeschlagen (ist Migration 0009 eingespielt?)."
              : "Aktion fehlgeschlagen.";

type Decision = { id: string; titel: string };

const fmtTime = (iso: string) => {
  try { return new Date(iso).toLocaleString("de-AT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
};

export function StephanAssist({ configured, thread, openDecisions }: { configured: boolean; thread: StephanMessage[]; openDecisions: Decision[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");        // eingehende Nachricht von Stephan
  const [reply, setReply] = useState("");    // KI-Entwurf
  const [final, setFinal] = useState("");    // Endfassung (so gesendet)
  const [refId, setRefId] = useState("");    // gekoppelte Entscheidung
  const [occurred, setOccurred] = useState(""); // echtes Datum (optional)
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [useStyle, setUseStyle] = useState(true);     // Stil-Lernen (Few-Shot aus eigenen Antworten)
  const [styleUsed, setStyleUsed] = useState<number | null>(null);
  const outgoingCount = thread.filter((m) => m.direction === "outgoing").length;

  // Manuell erfassen (standalone)
  const [manOpen, setManOpen] = useState(false);
  const [manDir, setManDir] = useState<"incoming" | "outgoing">("incoming");
  const [manBody, setManBody] = useState("");
  const [manRef, setManRef] = useState("");
  const [manDate, setManDate] = useState("");
  const [manSaving, setManSaving] = useState(false);

  const [delId, setDelId] = useState<string | null>(null);

  // Extraktion: Aufgaben/Ziele/Termine/Ideen aus Text erkennen → "Übernehmen"-Karten
  const [exSrc, setExSrc] = useState("");
  const [exBusy, setExBusy] = useState(false);
  const [exErr, setExErr] = useState("");
  const [exItems, setExItems] = useState<ExItem[]>([]);

  async function run() {
    if (!msg.trim() || busy) return;
    setBusy(true); setErr(""); setReply(""); setCopied(false); setStyleUsed(null);
    try {
      const r = await fetch("/api/stephan-assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg, useStyle }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.reply) { setReply(String(j.reply)); setFinal(String(j.reply)); setStyleUsed(typeof j.styleCount === "number" ? j.styleCount : null); }
      else setErr(errText(j.error));
    } catch { setErr("Verbindungsfehler."); }
    setBusy(false);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(final || reply); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  }

  async function saveSent() {
    if (!final.trim() || saving) return;
    setSaving(true); setErr("");
    try {
      const r = await fetch("/api/stephan/log", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incoming: msg.trim() || undefined,
          outgoing: final.trim(),
          ai_draft: reply || undefined,
          source: reply ? "edited_draft" : "pasted",
          ref_kind: refId ? "stephanDecisions" : undefined,
          ref_id: refId || undefined,
          occurred_at: occurred || undefined,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setMsg(""); setReply(""); setFinal(""); setOccurred(""); router.refresh(); }
      else setErr(errText(j.error));
    } catch { setErr("Verbindungsfehler."); }
    setSaving(false);
  }

  async function saveManual() {
    if (!manBody.trim() || manSaving) return;
    setManSaving(true); setErr("");
    try {
      const payload: Record<string, unknown> = {
        ref_kind: manRef ? "stephanDecisions" : undefined, ref_id: manRef || undefined, occurred_at: manDate || undefined,
      };
      if (manDir === "incoming") payload.incoming = manBody.trim();
      else { payload.outgoing = manBody.trim(); payload.source = "pasted"; }
      const r = await fetch("/api/stephan/log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setManBody(""); setManDate(""); setManRef(""); setManOpen(false); router.refresh(); }
      else setErr(errText(j.error));
    } catch { setErr("Verbindungsfehler."); }
    setManSaving(false);
  }

  async function del(id: string) {
    if (delId) return;
    if (!confirm("Diesen Verlaufseintrag löschen?")) return;
    setDelId(id);
    try {
      const r = await fetch(`/api/stephan/log?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (r.ok) router.refresh();
    } catch { /* noop */ }
    setDelId(null);
  }

  async function runExtract() {
    if (!exSrc.trim() || exBusy) return;
    setExBusy(true); setExErr(""); setExItems([]);
    try {
      const r = await fetch("/api/stephan/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: exSrc }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && Array.isArray(j.items)) {
        setExItems(j.items.map((x: Omit<ExItem, "_key" | "_status">, idx: number) => ({ ...x, _key: `ex${idx}-${String(x.title).slice(0, 12)}` })));
      } else setExErr(errText(j.error));
    } catch { setExErr("Verbindungsfehler."); }
    setExBusy(false);
  }
  const editItem = (i: number, patch: Partial<ExItem>) => setExItems((arr) => arr.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const discardItem = (i: number) => setExItems((arr) => arr.filter((_, j) => j !== i));
  async function applyItem(i: number) {
    const it = exItems[i];
    if (!it || !it.title.trim() || it._status === "busy" || it._status === "done") return;
    editItem(i, { _status: "busy" });
    const r = await cockpitMutate(buildMutate(it));
    editItem(i, { _status: r.ok ? "done" : "err" });
    if (r.ok) router.refresh();
  }

  const decTitel = (id?: string | null) => openDecisions.find((d) => d.id === id)?.titel;

  return (
    <div className="flex flex-col gap-4">
      {!configured && (
        <div className="rounded-lg border border-amber/40 bg-amber/10 p-3 text-sm text-amber">
          KI ist nicht konfiguriert (BOT_AI_KEY fehlt) – der Assistent kann derzeit keine Antwort erzeugen. Erfassen & Verlauf funktionieren trotzdem.
        </div>
      )}

      {/* Eingehende Nachricht + KI-Entwurf */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Nachricht von Stephan</label>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} placeholder="Eingehende Nachricht / Anfrage hier einfügen …" className={sel} />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button disabled={busy || !msg.trim() || !configured} onClick={run}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">
            {busy ? "Suche in MAGALOKO …" : "Antwort entwerfen"}
          </button>
          {(msg.trim() || reply) && !busy && <button onClick={() => { setMsg(""); setReply(""); setFinal(""); setErr(""); }} className="text-xs font-semibold text-muted-2 hover:text-ink">Leeren</button>}
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-2" title="Die KI ahmt deinen Schreibstil aus früheren Antworten nach (Fakten bleiben aus den MAGALOKO-Daten).">
            <input type="checkbox" checked={useStyle} onChange={(e) => setUseStyle(e.target.checked)} className="accent-accent" />
            Meinen Stil verwenden <span>{outgoingCount > 0 ? `(${outgoingCount} erfasst)` : "(noch keine Beispiele)"}</span>
          </label>
          <span className="text-xs text-muted-2">Fakten ausschließlich aus MAGALOKO-Daten.</span>
        </div>
        {err && <p className="mt-2 text-sm text-red">{err}</p>}

        {reply && (
          <div className="mt-4 rounded-lg border border-line bg-surface-2/50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-2"><Icon name="chat" className="h-3.5 w-3.5" />KI-Entwurf{styleUsed && styleUsed > 0 ? <span className="ml-1 normal-case text-accent">· Stil aus {styleUsed} {styleUsed === 1 ? "Nachricht" : "Nachrichten"}</span> : null}</span>
              <button onClick={copy} className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold hover:text-ink">
                <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />{copied ? "Kopiert" : "Kopieren"}
              </button>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{reply}</div>
          </div>
        )}
      </div>

      {/* Endfassung erfassen */}
      {(reply || final) && (
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Endfassung (so gesendet)</label>
          <textarea value={final} onChange={(e) => setFinal(e.target.value)} rows={5} placeholder="Deine tatsächlich gesendete Nachricht – Entwurf anpassen oder eigene Fassung einfügen …" className={sel} />
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-muted-2">Entscheidung koppeln (optional)
              <select value={refId} onChange={(e) => setRefId(e.target.value)} className={cn(sel, "min-w-[220px]")}>
                <option value="">— keine —</option>
                {openDecisions.map((d) => <option key={d.id} value={d.id}>{d.titel}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-muted-2">Echtes Datum (optional)
              <input type="date" value={occurred} onChange={(e) => setOccurred(e.target.value)} className={cn(sel, "w-auto")} />
            </label>
            <button disabled={saving || !final.trim()} onClick={saveSent}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">
              <Icon name="send" className="h-4 w-4" />{saving ? "Speichere …" : "Als gesendet speichern"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-2">Speichert Stephans Nachricht + deine Endfassung (mit KI-Entwurf zum Vergleich) in den Verlauf.</p>
        </div>
      )}

      {/* Manuell erfassen */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <button onClick={() => setManOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
          <span className="flex items-center gap-1.5 text-sm font-semibold"><Icon name="edit" className="h-4 w-4 text-muted-2" />Nachricht manuell erfassen</span>
          <span className="text-xs text-muted-2">{manOpen ? "schließen" : "öffnen"}</span>
        </button>
        {manOpen && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex gap-1.5">
              {(["incoming", "outgoing"] as const).map((d) => (
                <button key={d} onClick={() => setManDir(d)}
                  className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition", manDir === d ? "bg-accent text-bg" : "bg-surface-2 text-muted hover:text-ink")}>
                  {d === "incoming" ? "Von Stephan" : "Von mir gesendet"}
                </button>
              ))}
            </div>
            <textarea value={manBody} onChange={(e) => setManBody(e.target.value)} rows={4} placeholder="Nachrichtentext …" className={sel} />
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-muted-2">Entscheidung koppeln (optional)
                <select value={manRef} onChange={(e) => setManRef(e.target.value)} className={cn(sel, "min-w-[220px]")}>
                  <option value="">— keine —</option>
                  {openDecisions.map((d) => <option key={d.id} value={d.id}>{d.titel}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-muted-2">Echtes Datum (optional)
                <input type="date" value={manDate} onChange={(e) => setManDate(e.target.value)} className={cn(sel, "w-auto")} />
              </label>
              <button disabled={manSaving || !manBody.trim()} onClick={saveManual}
                className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{manSaving ? "Speichere …" : "Erfassen"}</button>
            </div>
          </div>
        )}
      </div>

      {/* Aufgaben & Ziele aus dem Chat extrahieren */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <h2 className="mb-1 flex items-center gap-1.5 text-sm font-bold"><Icon name="bolt" className="h-4 w-4 text-muted-2" />Aufgaben &amp; Ziele aus dem Chat</h2>
        <p className="mb-2 text-xs text-muted-2">Erkennt Aufgaben, Ziele, Termine, Entscheidungen und Ideen — du prüfst &amp; übernimmst jede einzeln.</p>
        <div className="mb-2 flex flex-wrap gap-2">
          <button disabled={!msg.trim()} onClick={() => setExSrc(msg)} className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold hover:text-ink disabled:opacity-50">← Eingehende Nachricht</button>
          <button disabled={!thread.length} onClick={() => setExSrc(thread.map((m) => `${m.direction === "incoming" ? "Stephan" : "Ich"}: ${m.body}`).join("\n\n"))} className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold hover:text-ink disabled:opacity-50">← Ganzer Verlauf</button>
        </div>
        <textarea value={exSrc} onChange={(e) => setExSrc(e.target.value)} rows={4} placeholder="Text einfügen, aus dem Aufgaben/Ziele/Termine/Ideen erkannt werden sollen …" className={sel} />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button disabled={exBusy || !exSrc.trim() || !configured} onClick={runExtract}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">
            <Icon name="bolt" className="h-4 w-4" />{exBusy ? "Analysiere …" : "Analysieren"}
          </button>
          {exItems.length > 0 && !exBusy && <button onClick={() => { setExItems([]); setExSrc(""); }} className="text-xs font-semibold text-muted-2 hover:text-ink">Leeren</button>}
        </div>
        {exErr && <p className="mt-2 text-sm text-red">{exErr}</p>}
        {!exBusy && !exErr && !exItems.length && exSrc.trim() && <p className="mt-2 text-xs text-muted-2">Klick „Analysieren" — oder es wurde nichts Umsetzbares gefunden.</p>}

        {exItems.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {exItems.map((it, i) => (
              <li key={it._key} className="rounded-lg border border-line bg-surface-2/40 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select value={it.type} onChange={(e) => editItem(i, { type: e.target.value })} disabled={it._status === "done"} className="rounded-lg border border-line bg-surface px-2 py-1 text-xs font-semibold outline-none focus:border-accent disabled:opacity-60">
                    {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <input value={it.title} onChange={(e) => editItem(i, { title: e.target.value })} disabled={it._status === "done"} className="min-w-[180px] flex-1 rounded-lg border border-line bg-surface px-2 py-1 text-sm font-medium outline-none focus:border-accent disabled:opacity-60" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input value={it.area} onChange={(e) => editItem(i, { area: e.target.value })} disabled={it._status === "done"} placeholder="Bereich/Kategorie" className="w-40 rounded-lg border border-line bg-surface px-2 py-1 text-xs outline-none focus:border-accent disabled:opacity-60" />
                  <input type="date" value={it.date} onChange={(e) => editItem(i, { date: e.target.value })} disabled={it._status === "done"} className="rounded-lg border border-line bg-surface px-2 py-1 text-xs outline-none focus:border-accent disabled:opacity-60" />
                  <span className="text-[11px] text-muted-2">{TARGET_HINT[it.type]}</span>
                </div>
                {it.detail && <p className="mt-1.5 text-xs text-muted">{it.detail}</p>}
                {it.reason && <p className="mt-0.5 text-[11px] italic text-muted-2">Beleg: {it.reason}</p>}
                <div className="mt-2 flex items-center gap-3">
                  {it._status === "done"
                    ? <span className="inline-flex items-center gap-1 rounded-lg bg-green/15 px-2.5 py-1 text-[11px] font-semibold text-green"><Icon name="check" className="h-3 w-3" />Übernommen</span>
                    : <button disabled={it._status === "busy" || !it.title.trim()} onClick={() => applyItem(i)} className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-[11px] font-semibold text-bg disabled:opacity-50"><Icon name="check" className="h-3 w-3" />{it._status === "busy" ? "Übernehme …" : "Übernehmen"}</button>}
                  {it._status !== "done" && <button onClick={() => discardItem(i)} className="text-[11px] font-semibold text-muted-2 hover:text-red">verwerfen</button>}
                  {it._status === "err" && <span className="text-[11px] text-red">Übernahme fehlgeschlagen.</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Verlauf */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold"><Icon name="chat" className="h-4 w-4 text-muted-2" />Verlauf mit Stephan {thread.length > 0 && <span className="text-xs font-normal text-muted-2">({thread.length})</span>}</h2>
        {thread.length === 0 ? (
          <p className="text-sm text-muted-2">Noch kein Verlauf. Entwirf eine Antwort und speichere sie als gesendet – oder erfasse eine Nachricht manuell.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {thread.map((m) => {
              const mine = m.direction === "outgoing";
              const titel = decTitel(m.ref_id);
              return (
                <li key={m.id} className={cn("max-w-[88%] rounded-xl border p-3", mine ? "ml-auto border-accent/30 bg-accent/5" : "mr-auto border-line bg-surface-2/50")}>
                  <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-2">
                    <span className="font-semibold">{mine ? "Du" : "Stephan"}</span>
                    <span className="inline-flex items-center gap-1"><Icon name="clock" className="h-3 w-3" />{fmtTime(m.occurred_at || m.created_at)}</span>
                    {m.ref_id && (
                      <Link href={`/cockpit/entscheidungen/${encodeURIComponent(m.ref_id)}`} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-accent hover:underline">
                        <Icon name="target" className="h-3 w-3" />{titel || "Entscheidung"}
                      </Link>
                    )}
                    <button onClick={() => del(m.id)} disabled={!!delId} className="ml-auto inline-flex items-center gap-1 text-muted-2 hover:text-red disabled:opacity-50" aria-label="Eintrag löschen">
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</div>
                  {mine && m.ai_draft && m.ai_draft.trim() !== m.body.trim() && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[11px] font-semibold text-muted-2 hover:text-ink">KI-Entwurf anzeigen (vor deiner Anpassung)</summary>
                      <div className="mt-1 whitespace-pre-wrap rounded-lg bg-surface-2/60 p-2 text-xs text-muted">{m.ai_draft}</div>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
