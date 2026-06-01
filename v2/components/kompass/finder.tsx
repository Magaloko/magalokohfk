"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";
import { KOMPASS_FRAGEN, empfehlung, type KompassProdukt, type KompassAntworten } from "@/lib/kompass-core";

// Interner Beratungs-Assistent: Frage-Flow (Tastatur 1–9) → 2–3 Empfehlungen + "passt eher nicht".
// Antworten sind ephemer (kein Kundendaten-Storage).
export function Finder({ produkte }: { produkte: KompassProdukt[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<KompassAntworten>({});
  const fragen = KOMPASS_FRAGEN;
  const total = fragen.length;
  const done = step >= total;
  const frage = fragen[step];

  const pick = (value: string) => {
    if (!frage) return;
    setAnswers((a) => ({ ...a, [frage.id]: value }));
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const restart = () => { setStep(0); setAnswers({}); };

  // Tastatur: 1–9 wählt Option, Backspace = zurück, Escape = neu starten.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { restart(); return; }
      if (e.key === "Backspace") { e.preventDefault(); back(); return; }
      if (done || !frage) return;
      const num = parseInt(e.key, 10);
      if (Number.isInteger(num) && num >= 1 && num <= frage.optionen.length) { e.preventDefault(); pick(frage.optionen[num - 1].value); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, done, frage]);

  if (!produkte.length) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-center shadow-sm">
        <Icon name="alert" className="mx-auto h-8 w-8 text-amber" />
        <p className="mt-3 text-sm font-semibold">Noch keine bewerteten Modelle vorhanden.</p>
        <p className="mt-1 text-sm text-muted">Pflege unter <span className="font-semibold">Beratung → Kompass-Pflege</span> die Eignung einiger Kinderwagen — dann liefert der Finder Empfehlungen.</p>
      </div>
    );
  }

  if (done) return <Ergebnis answers={answers} produkte={produkte} onRestart={restart} />;

  const progress = (step / total) * 100;
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-2">
        <span className="font-medium">Frage {step + 1}/{total}</span>
        {step > 0 && <button onClick={back} className="inline-flex items-center gap-1 font-semibold text-accent"><Icon name="undo" className="h-3.5 w-3.5" />Zurück</button>}
      </div>
      <p className="mb-4 text-lg font-extrabold tracking-tight">{frage.frage}</p>
      <div className="flex flex-col gap-2">
        {frage.optionen.map((o, i) => (
          <button key={o.value} onClick={() => pick(o.value)}
            className="flex items-center gap-3 rounded-lg border border-line px-4 py-3.5 text-left text-base leading-snug transition hover:border-accent hover:bg-accent/5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-2 font-mono text-xs text-muted-2">{i + 1}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Ergebnis({ answers, produkte, onRestart }: { answers: KompassAntworten; produkte: KompassProdukt[]; onRestart: () => void }) {
  const { empfehlungen, ausgeschlossen } = empfehlung(answers, produkte);
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight">Empfehlung für diese Familie</h2>
        <button onClick={onRestart} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-surface-2 px-3 text-sm font-semibold"><Icon name="repeat" className="h-4 w-4" />Neu</button>
      </div>

      {empfehlungen.length ? (
        <div className="flex flex-col gap-3">
          {empfehlungen.map((e, idx) => (
            <div key={e.produkt.jtlArtikelNr} className={cn("rounded-xl border bg-surface p-5 shadow-sm", idx === 0 ? "border-accent ring-1 ring-accent/30" : "border-line")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  {idx === 0 && <span className="mb-1 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">Top-Empfehlung</span>}
                  <h3 className="text-base font-extrabold leading-tight">{e.produkt.name}</h3>
                  {e.produkt.marke && <span className="text-xs text-muted-2">{e.produkt.marke}</span>}
                </div>
                {e.produkt.preisEur != null && <span className="shrink-0 rounded-lg bg-surface-2 px-2.5 py-1 text-sm font-bold">{Math.round(e.produkt.preisEur)} €</span>}
              </div>
              {e.gruende.length > 0 && (
                <ul className="mt-3 grid gap-1">
                  {e.gruende.map((g, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm text-muted"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-green" />{g}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-5 text-sm text-muted shadow-sm">
          Kein Modell passt klar zu allen Angaben. Bitte im Gespräch nachschärfen oder die Bewertung im Cockpit ergänzen.
        </div>
      )}

      {ausgeschlossen.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">Passt eher nicht</h3>
          <div className="flex flex-col gap-2">
            {ausgeschlossen.map((x) => (
              <div key={x.produkt.jtlArtikelNr} className="flex items-start gap-2 rounded-lg border border-line bg-surface-2/50 px-3 py-2 text-sm">
                <Icon name="x" className="mt-0.5 h-4 w-4 shrink-0 text-red" />
                <span><span className="font-semibold">{x.produkt.name}</span> — {x.grund}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 rounded-lg bg-surface-2 px-4 py-3 text-sm text-muted">
        <Icon name="bulb" className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
        <span>Nächster Schritt: Modelle gemeinsam ansehen, Beratung/Reservierung im Cockpit notieren.</span>
      </div>
    </div>
  );
}
