"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { QAItem } from "@/lib/qa-audit";

type Result = { german: boolean; issues: string; fixed: string };
const EN = ["the", "and", "with", "your", "you", "for", "this", "that", "are", "is", "of", "to", "have", "will", "best", "price", "quality", "customer"];

// Häufige deutsche Wortstämme, bei denen ae/oe/ue/ss fast sicher einen Umlaut/ß ersetzt (mit Wortgrenzen,
// damit legitime Wörter wie schauen, teuer, neue, OEKO-TEX, individuell NICHT markiert werden).
// Fängt transliterierte Umlaute, die die Englisch-Heuristik übersieht (z. B. "fuer", "Waechst", "Hoeren").
const UMLAUT_TL = /\b(?:fuers?|ueber\w*|moeglich\w*|koenn\w*|muess\w*|wuerd\w*|haett\w*|waer\w*|naechst\w*|spaet\w*|frueh\w*|schoen\w*|groess\w*|gross\w*|guenstig\w*|laeng\w*|staerk\w*|waechst|fuehr\w*|daenisch\w*|oekolog\w*|aerzt\w*|geaendert|aender\w*|jaehrig\w*|haelfte|paedagog\w*|bruecke\w*|loesung\w*|hoer\w*|schliess\w*|tuer\w*|buecher|sloejd|[NO]Oe)\b/i;

// Schnelle Heuristik: wirkt der Text sprachlich auffällig — englisch ODER transliterierte Umlaute?
// Reiner Vorfilter, ersetzt keine KI-Prüfung.
function looksNonGerman(text: string): boolean {
  if (UMLAUT_TL.test(text)) return true;
  const words = text.toLowerCase().match(/[a-zäöüß]+/g) || [];
  if (!words.length) return false;
  const hits = new Set(words.filter((w) => EN.includes(w)));
  const hasGermanChars = /[äöüß]/.test(text);
  return hits.size >= 2 && !hasGermanChars;
}

type Filter = "all" | "suspect" | "flagged";

export function QaAuditClient({ items, configured }: { items: QAItem[]; configured: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [results, setResults] = useState<Record<string, Result | "busy" | "err">>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [applied, setApplied] = useState<Record<string, "busy" | "done" | "err">>({});
  const [batch, setBatch] = useState<{ running: boolean; done: number; total: number }>({ running: false, done: 0, total: 0 });

  async function apply(it: QAItem, value: string) {
    setApplied((a) => ({ ...a, [it.key]: "busy" }));
    try {
      const res = await fetch("/api/qa-audit/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection: it.collection, id: it.id, field: it.field, value }) });
      setApplied((a) => ({ ...a, [it.key]: res.ok ? "done" : "err" }));
    } catch { setApplied((a) => ({ ...a, [it.key]: "err" })); }
  }

  const flagged = useMemo(() => new Set(items.filter((i) => looksNonGerman(i.text)).map((i) => i.key)), [items]);
  const kiFlagged = useMemo(() => items.filter((i) => { const r = results[i.key]; return r && r !== "busy" && r !== "err" && !r.german; }).length, [items, results]);
  const checkedCount = useMemo(() => items.filter((i) => { const r = results[i.key]; return r && r !== "busy" && r !== "err"; }).length, [items, results]);

  const shown = filter === "suspect" ? items.filter((i) => flagged.has(i.key))
    : filter === "flagged" ? items.filter((i) => { const r = results[i.key]; return r && r !== "busy" && r !== "err" && !r.german; })
      : items;

  async function checkOne(it: QAItem): Promise<Result | "err"> {
    setResults((r) => ({ ...r, [it.key]: "busy" }));
    try {
      const res = await fetch("/api/qa-audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: it.text }) });
      const j = await res.json().catch(() => ({}));
      const out: Result | "err" = res.ok && j.result ? (j.result as Result) : "err";
      setResults((r) => ({ ...r, [it.key]: out }));
      return out;
    } catch { setResults((r) => ({ ...r, [it.key]: "err" })); return "err"; }
  }
  const check = (it: QAItem) => { void checkOne(it); };

  // Stapel-Prüfung: nacheinander (schont KI/Rate-Limit). targets = Verdächtige oder alle.
  async function runBatch(targets: QAItem[]) {
    const todo = targets.filter((it) => { const r = results[it.key]; return !r || r === "err"; });
    if (!todo.length || batch.running) return;
    setBatch({ running: true, done: 0, total: todo.length });
    for (let i = 0; i < todo.length; i++) {
      await checkOne(todo[i]);
      setBatch({ running: true, done: i + 1, total: todo.length });
    }
    setBatch({ running: false, done: 0, total: 0 });
  }
  async function copy(key: string, text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); } catch { /* noop */ }
  }

  return (
    <div className="flex flex-col gap-4">
      {!configured && <div className="rounded-lg border border-amber/40 bg-amber/10 p-3 text-sm text-amber">KI nicht konfiguriert (BOT_AI_KEY) — die KI-Prüfung ist deaktiviert. Die Heuristik-Markierung funktioniert trotzdem.</div>}

      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold">{items.length} Einträge</span>
          <span className="text-muted-2">{flagged.size} verdächtig (Heuristik)</span>
          <span className="text-muted-2">{checkedCount} geprüft</span>
          <span className={kiFlagged ? "font-semibold text-red" : "text-muted-2"}>{kiFlagged} auffällig (KI)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {([["all", "Alle"], ["suspect", `Verdächtige (${flagged.size})`], ["flagged", `KI-auffällig (${kiFlagged})`]] as [Filter, string][]).map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition", filter === f ? "border-accent bg-accent/15 text-accent" : "border-line bg-surface-2 text-muted hover:text-ink")}>{label}</button>
          ))}
          <span className="ml-auto flex gap-2">
            <button disabled={!configured || batch.running} onClick={() => runBatch(items.filter((i) => flagged.has(i.key)))}
              className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:text-ink disabled:opacity-50">Verdächtige prüfen</button>
            <button disabled={!configured || batch.running} onClick={() => runBatch(items)}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg disabled:opacity-50">Alle prüfen</button>
          </span>
        </div>
        {batch.running && (
          <div>
            <div className="mb-1 text-xs text-muted-2">KI prüft … {batch.done}/{batch.total}</div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${batch.total ? (batch.done / batch.total) * 100 : 0}%` }} /></div>
          </div>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {shown.map((it) => {
          const res = results[it.key];
          const suspect = flagged.has(it.key);
          return (
            <li key={it.key} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted-2">{it.type}</span>
                <span className="text-sm font-bold">{it.label}</span>
                {suspect && <span className="rounded-full bg-amber/15 px-2.5 py-0.5 text-xs font-semibold text-amber">Sprache prüfen</span>}
                <button onClick={() => check(it)} disabled={!configured || res === "busy"} className="ml-auto rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg disabled:opacity-50">
                  {res === "busy" ? "KI prüft …" : "KI prüfen"}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted">{it.text}</p>

              {res && res !== "busy" && res !== "err" && (
                <div className={cn("mt-3 rounded-lg border p-3 text-sm", res.german ? "border-green/40 bg-green/5" : "border-red/40 bg-red/5")}>
                  <p className={cn("flex items-center gap-1.5 font-semibold", res.german ? "text-green" : "text-red")}>
                    <Icon name={res.german ? "check" : "alert"} className="h-4 w-4" />{res.german ? "Deutsch & sauber" : "Sprachlich auffällig"}
                  </p>
                  {res.issues && <p className="mt-1 text-muted">{res.issues}</p>}
                  {res.fixed && (
                    <div className="mt-2 rounded-lg border border-line bg-surface-2/60 p-2.5">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-muted-2">Korrigierte Fassung</span>
                        <span className="flex items-center gap-2">
                          <button onClick={() => copy(it.key, res.fixed)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                            <Icon name={copied === it.key ? "check" : "copy"} className="h-3 w-3" />{copied === it.key ? "Kopiert" : "Kopieren"}
                          </button>
                          {applied[it.key] === "done"
                            ? <span className="inline-flex items-center gap-1 rounded-lg bg-green/15 px-2.5 py-1 text-[11px] font-semibold text-green"><Icon name="check" className="h-3 w-3" />Übernommen</span>
                            : <button onClick={() => apply(it, res.fixed)} disabled={applied[it.key] === "busy"} className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-[11px] font-semibold text-bg disabled:opacity-50"><Icon name="check" className="h-3 w-3" />{applied[it.key] === "busy" ? "Übernehme …" : "Übernehmen"}</button>}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap italic">{res.fixed}</p>
                      {applied[it.key] === "err" && <p className="mt-1 text-[11px] text-red">Übernahme fehlgeschlagen.</p>}
                      <p className="mt-1 text-[11px] text-muted-2">„Übernehmen" schreibt die Fassung direkt ins Feld „{it.label.split(" · ").pop()}".</p>
                    </div>
                  )}
                </div>
              )}
              {res === "err" && <p className="mt-2 text-sm text-red">KI-Prüfung fehlgeschlagen — nochmal versuchen.</p>}
            </li>
          );
        })}
        {!shown.length && <li className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted-2">Keine Einträge.</li>}
      </ul>
    </div>
  );
}
