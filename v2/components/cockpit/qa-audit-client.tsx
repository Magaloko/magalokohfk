"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { QAItem } from "@/lib/qa-audit";

type Result = { german: boolean; issues: string; fixed: string };
const EN = ["the", "and", "with", "your", "you", "for", "this", "that", "are", "is", "of", "to", "have", "will", "best", "price", "quality", "customer"];

// Schnelle Heuristik: wirkt der Text eher englisch? (Vorfilter, ersetzt keine KI-Prüfung.)
function looksNonGerman(text: string): boolean {
  const words = text.toLowerCase().match(/[a-zäöüß]+/g) || [];
  if (!words.length) return false;
  const hits = new Set(words.filter((w) => EN.includes(w)));
  const hasGermanChars = /[äöüß]/.test(text);
  return hits.size >= 2 && !hasGermanChars;
}

export function QaAuditClient({ items, configured }: { items: QAItem[]; configured: boolean }) {
  const [onlySuspect, setOnlySuspect] = useState(false);
  const [results, setResults] = useState<Record<string, Result | "busy" | "err">>({});
  const [copied, setCopied] = useState<string | null>(null);

  const flagged = useMemo(() => new Set(items.filter((i) => looksNonGerman(i.text)).map((i) => i.key)), [items]);
  const shown = onlySuspect ? items.filter((i) => flagged.has(i.key)) : items;

  async function check(it: QAItem) {
    setResults((r) => ({ ...r, [it.key]: "busy" }));
    try {
      const res = await fetch("/api/qa-audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: it.text }) });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.result) setResults((r) => ({ ...r, [it.key]: j.result as Result }));
      else setResults((r) => ({ ...r, [it.key]: "err" }));
    } catch { setResults((r) => ({ ...r, [it.key]: "err" })); }
  }
  async function copy(key: string, text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); } catch { /* noop */ }
  }

  return (
    <div className="flex flex-col gap-4">
      {!configured && <div className="rounded-lg border border-amber/40 bg-amber/10 p-3 text-sm text-amber">KI nicht konfiguriert (BOT_AI_KEY) — die KI-Prüfung ist deaktiviert. Die Heuristik-Markierung funktioniert trotzdem.</div>}

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
        <span className="text-sm font-semibold">{items.length} Einträge</span>
        <span className="text-sm text-muted-2">· {flagged.size} verdächtig (Heuristik)</span>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={onlySuspect} onChange={(e) => setOnlySuspect(e.target.checked)} className="h-4 w-4" />
          Nur Verdächtige
        </label>
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
                {suspect && <span className="rounded-full bg-amber/15 px-2.5 py-0.5 text-xs font-semibold text-amber">evtl. nicht deutsch</span>}
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
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-muted-2">Korrigierte Fassung</span>
                        <button onClick={() => copy(it.key, res.fixed)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                          <Icon name={copied === it.key ? "check" : "copy"} className="h-3 w-3" />{copied === it.key ? "Kopiert" : "Kopieren"}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap italic">{res.fixed}</p>
                      <p className="mt-1 text-[11px] text-muted-2">Übernahme im jeweiligen Editor (Akademie) per Einfügen.</p>
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
