"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "task" | "status" | "blocker" | "decision" | "einkauf" | "vektra";
type Field = { key: string; label: string; placeholder?: string; type?: "textarea" | "select"; options?: string[] };

const inputCls = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";

const MODES: Record<Mode, { title: string; icon: string; collection: string; fields: Field[]; build: (v: Record<string, string>, draft: string) => Record<string, string> }> = {
  task: {
    title: "Aufgabe anlegen",
    icon: "check",
    collection: "tasks",
    fields: [
      { key: "title", label: "Aufgabe", placeholder: "Was muss erledigt werden?" },
      { key: "area", label: "Bereich", type: "select", options: ["HFK", "Mago", "SeBo System", "Einkaufssystem", "SeBo", "VEKTRA", "Privat"] },
      { key: "priority", label: "Priorität", type: "select", options: ["hoch", "mittel", "niedrig"] },
      { key: "status", label: "Status", type: "select", options: ["Offen", "Heute", "Diese Woche", "Wartet", "Erledigt"] },
      { key: "notes", label: "Notiz", type: "textarea", placeholder: "Kontext, nächster Schritt, Link ..." },
    ],
    build: (v, draft) => ({ title: v.title || draft, area: v.area || "HFK", phase: v.area || "HFK", status: v.status || "Offen", priority: v.priority || "mittel", notes: v.notes || draft }),
  },
  status: {
    title: "Status speichern",
    icon: "briefcase",
    collection: "magoLog",
    fields: [
      { key: "titel", label: "Titel", placeholder: "Status zu welchem Thema?" },
      { key: "bezug", label: "Bezug", type: "select", options: ["HFK", "Mago", "SeBo System", "Einkaufssystem", "SeBo", "VEKTRA", "Stephan"] },
      { key: "status", label: "Status", type: "select", options: ["Offen", "In Arbeit", "Wartet", "Erledigt", "Risiko"] },
      { key: "beschreibung", label: "Beschreibung", type: "textarea", placeholder: "Aktueller Stand und nächster Schritt" },
    ],
    build: (v, draft) => ({ datum: new Date().toISOString().slice(0, 10), titel: v.titel || draft, kategorie: "Status", status: v.status || "Offen", bezug: v.bezug || "HFK", beschreibung: v.beschreibung || draft }),
  },
  blocker: {
    title: "Blocker / Vorgang",
    icon: "alert",
    collection: "mastermindVorgaenge",
    fields: [
      { key: "titel", label: "Vorgang", placeholder: "Was blockiert gerade?" },
      { key: "werkzeug", label: "Werkzeug", type: "select", options: ["foundation", "treasury", "einkauf", "vipa", "sebo", "vektra"] },
      { key: "wartetAuf", label: "Wartet auf", placeholder: "Person, Zugang, Entscheidung ..." },
      { key: "naechsterSchritt", label: "Nächster Schritt", placeholder: "Was ist der konkrete nächste Schritt?" },
      { key: "notiz", label: "Notiz", type: "textarea" },
    ],
    build: (v, draft) => ({ titel: v.titel || draft, werkzeug: v.werkzeug || "sebo", status: "Wartet", wartetAuf: v.wartetAuf || "", naechsterSchritt: v.naechsterSchritt || "", notiz: v.notiz || draft, datum: new Date().toISOString().slice(0, 10) }),
  },
  decision: {
    title: "Entscheidung speichern",
    icon: "target",
    collection: "stephanDecisions",
    fields: [
      { key: "titel", label: "Entscheidung", placeholder: "Welche Entscheidung muss festgehalten werden?" },
      { key: "kategorie", label: "Kategorie", type: "select", options: ["HFK", "Mago", "SeBo System", "Einkaufssystem", "SeBo", "VEKTRA", "Strategie", "Budget"] },
      { key: "status", label: "Status", type: "select", options: ["Offen", "Empfohlen", "Entschieden", "Vertagt"] },
      { key: "frist", label: "Frist", placeholder: "YYYY-MM-DD oder frei" },
      { key: "empfehlung", label: "Empfehlung", type: "textarea", placeholder: "Was ist deine Empfehlung?" },
    ],
    build: (v, draft) => ({ titel: v.titel || draft, status: v.status || "Offen", kategorie: v.kategorie || "HFK", frist: v.frist || "", empfehlung: v.empfehlung || draft }),
  },
  einkauf: {
    title: "Einkaufsfall erfassen",
    icon: "bag",
    collection: "processRuns",
    fields: [
      { key: "entscheidung", label: "Entscheidung/Fall", placeholder: "Welcher Artikel/Fall soll digitalisiert werden?" },
      { key: "prozess", label: "Falltyp", type: "select", options: ["Renner", "OOS", "Saison", "Lieferzeit", "Kategorie-Regel", "Safety-Buffer", "Budget", "Penner"] },
      { key: "einsatz", label: "Einsatz", placeholder: "DB1, Bestand, Lieferzeit, Budget oder Risiko" },
      { key: "risiko", label: "Risiko", placeholder: "Was geht schief, wenn Mago falsch entscheidet?" },
      { key: "systemSignal", label: "Systemsignal", placeholder: "Was soll der Einkaufsplaner anzeigen oder blockieren?" },
      { key: "naechsterSchritt", label: "Nächster Schritt", placeholder: "Testfall, Datenfeld, Regel oder Optimizer-Anpassung" },
    ],
    build: (v, draft) => ({
      datum: new Date().toISOString().slice(0, 10),
      bereich: "Einkauf",
      prozess: v.prozess || "Einkaufslogik",
      entscheidung: v.entscheidung || draft,
      einsatz: v.einsatz || "",
      nachweis: "Mago Command Center",
      risiko: v.risiko || "",
      status: "Entwurf",
      systemSignal: v.systemSignal || "",
      naechsterSchritt: v.naechsterSchritt || "",
    }),
  },
  vektra: {
    title: "VEKTRA-Einwand",
    icon: "academy",
    collection: "salesObjections",
    fields: [
      { key: "einwand", label: "Einwand", placeholder: "Was sagt der Kunde/Mitarbeiter?" },
      { key: "kategorie", label: "Kategorie", type: "select", options: ["Preis", "Lieferzeit", "Produkt", "Beratung", "Retoure", "Sonstiges"] },
      { key: "antwort", label: "Antwort", type: "textarea", placeholder: "Gute Antwort für das Training" },
      { key: "beweis", label: "Beweis / Quelle", placeholder: "Policy, Marke, Erfahrung, Datenpunkt ..." },
    ],
    build: (v, draft) => ({ einwand: v.einwand || draft, kategorie: v.kategorie || "Sonstiges", antwort: v.antwort || "", beweis: v.beweis || "" }),
  },
};

const QUICK: { label: string; icon: string; mode: Mode; hint: string }[] = [
  { label: "+ Aufgabe", icon: "check", mode: "task", hint: "Aus dem Chat sofort eine Aufgabe machen." },
  { label: "Status", icon: "briefcase", mode: "status", hint: "Aktuellen Projektstand in Mago speichern." },
  { label: "Blocker", icon: "alert", mode: "blocker", hint: "Wartet-auf/Vorgang für MasterMind erfassen." },
  { label: "Entscheidung", icon: "target", mode: "decision", hint: "Offene oder getroffene Entscheidung sichern." },
  { label: "Einkauf", icon: "bag", mode: "einkauf", hint: "Echten Einkaufsfall als Prozess-Spielzug erfassen." },
  { label: "VEKTRA", icon: "academy", mode: "vektra", hint: "Trainingsinhalt für Mitarbeiter vorbereiten." },
];

function defaultsFor(mode: Mode, draft: string) {
  const d: Record<string, string> = {};
  for (const f of MODES[mode].fields) {
    if (f.options?.length) d[f.key] = f.options[0];
  }
  const first = MODES[mode].fields[0]?.key;
  if (first) d[first] = draft;
  return d;
}

export function MagoCommandCenter() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Sag frei, was los ist. Danach kannst du es per Inline-Button als Aufgabe, Status, Blocker, Entscheidung, Einkaufsfall oder VEKTRA-Inhalt speichern." },
  ]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const active = mode ? MODES[mode] : null;

  const actionTitle = useMemo(() => active ? active.title : "Inline-Aktionen", [active]);

  function submitChat(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "Wie soll ich das für dich festhalten?" }]);
    setDraft(text);
    setInput("");
    setErr("");
    setMode(null);
  }

  function openMode(next: Mode) {
    setErr("");
    setMode(next);
    setValues(defaultsFor(next, draft));
  }

  async function save() {
    if (!mode || !active || busy) return;
    setBusy(true);
    setErr("");
    try {
      const item = active.build(values, draft);
      const r = await fetch("/api/cockpit/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: active.collection, action: "create", item }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(String(j?.error || "write_failed"));
      setMsgs((m) => [...m, { role: "assistant", content: `${active.title} gespeichert.` }]);
      setMode(null);
      setValues({});
      router.refresh();
    } catch (e) {
      setErr((e as Error).message === "forbidden" ? "Keine Berechtigung für diese Aktion." : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-bold"><Icon name="sparkles" className="h-4 w-4 text-accent" />Mago Command Center</h2>
          <p className="mt-1 text-sm text-muted">Chat als Oberfläche. Mago bleibt das Gedächtnis.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button key={q.mode} type="button" onClick={() => openMode(q.mode)} title={q.hint}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-ink">
              <Icon name={q.icon} className="h-3.5 w-3.5" />{q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-h-[300px] flex-col rounded-lg border border-line bg-bg p-3">
          <div className="flex max-h-[300px] flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user" ? "rounded-br-sm bg-accent text-bg" : "rounded-bl-sm border border-line bg-surface",
                )}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={submitChat} className="mt-3 flex items-end gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitChat(e); } }}
              rows={2} placeholder="Schreib z. B. 'Stephan wartet auf JTL-Zugang, ich muss morgen nachfassen' ..." className={inputCls} />
            <button type="submit" disabled={!input.trim()} className="min-h-11 shrink-0 rounded-lg bg-accent px-4 text-bg disabled:opacity-50">
              <Icon name="send" className="h-4 w-4" />
            </button>
          </form>
        </div>

        <aside className="rounded-lg border border-line bg-surface-2 p-3">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            <Icon name={active?.icon || "bolt"} className="h-3.5 w-3.5" />{actionTitle}
          </div>
          {!active ? (
            <div className="flex flex-col gap-2">
              {QUICK.map((q) => (
                <button key={q.mode} type="button" onClick={() => openMode(q.mode)}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left transition hover:border-accent">
                  <span><span className="block text-sm font-semibold">{q.label}</span><span className="block text-xs text-muted-2">{q.hint}</span></span>
                  <Icon name="arrow-right" className="h-4 w-4 text-muted-2" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {active.fields.map((f) => (
                <label key={f.key} className="text-sm font-semibold">
                  {f.label}
                  {f.type === "select" ? (
                    <select value={values[f.key] || f.options?.[0] || ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} className={cn(inputCls, "mt-1")}>
                      {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea value={values[f.key] || ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} rows={4} placeholder={f.placeholder} className={cn(inputCls, "mt-1")} />
                  ) : (
                    <input value={values[f.key] || ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder} className={cn(inputCls, "mt-1")} />
                  )}
                </label>
              ))}
              {err && <p className="text-sm text-red">{err}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={save} disabled={busy}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-bg disabled:opacity-50">
                  <Icon name="check" className="h-4 w-4" />Speichern
                </button>
                <button type="button" onClick={() => setMode(null)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-muted hover:text-ink">
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
