import { MASTERMIND, type Werkzeug } from "@/lib/strategy";
import { Card, Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { fragenFuer } from "@/lib/mastermind-fragen";
import type { MasterMindAntwort } from "@/lib/mastermind";
import { FragenBlock } from "@/components/mastermind/fragen-block";

const statusTone = (s: Werkzeug["status"]): "green" | "accent" | "muted" =>
  s === "Live" ? "green" : s === "Geplant" ? "accent" : "muted";

function SectionTitle({ icon, kicker, title }: { icon: string; kicker: string; title: string }) {
  return (
    <div className="mb-3 mt-8 first:mt-0">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2">
        <Icon name={icon} className="h-3.5 w-3.5" /> {kicker}
      </div>
      <h2 className="mt-1 text-lg font-extrabold tracking-tight">{title}</h2>
    </div>
  );
}

// Render-Body des MasterMind-Plans (aus cockpit/strategie extrahiert).
// Reine Server-Component (kein State) — wird von app/(app)/mastermind/page.tsx in eine
// PageShell eingebettet. MASTERMIND ist die Single Source of Truth aus lib/strategy.ts.
export function PlanView({ antworten }: { antworten: Record<string, MasterMindAntwort> }) {
  const m = MASTERMIND;

  return (
    <>
      {/* Hero */}
      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="amber"><Icon name="lock" className="mr-1 h-3 w-3" /> GF-SAFE</Pill>
          <span className="text-xs text-muted-2">{m.vertraulich}</span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{m.tagline}</h2>
        <p className="mt-1 text-sm font-semibold text-muted">{m.unterzeile}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{m.vision}</p>
      </section>

      {/* Wo wir stehen */}
      <SectionTitle icon="pin" kicker="Wo wir stehen" title="Ausgangslage & zentrale Frage" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm leading-relaxed text-muted">{m.position}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{m.phase}</p>
        </Card>
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent">
            <Icon name="compass" className="h-3.5 w-3.5" /> Die zentrale strategische Frage
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-ink">{m.zentraleFrage}</p>
        </div>
      </div>

      {/* Zwei strategische Hebel */}
      <SectionTitle icon="lever" kicker="Fundament" title="Die zwei strategischen Hebel" />
      <div className="grid gap-4 sm:grid-cols-2">
        {m.hebel.map((h, i) => (
          <Card key={h.titel}>
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/15 font-extrabold text-accent">{i + 1}</span>
              <div>
                <h3 className="text-sm font-bold">{h.titel}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{h.beschreibung}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Vertrauensebenen */}
      <SectionTitle icon="key" kicker="Architektur-Pflicht" title="Drei Vertrauensebenen" />
      <div className="grid gap-3 sm:grid-cols-3">
        {m.vertrauensebenen.map((v) => (
          <Card key={v.ebene}>
            <Pill tone={v.ebene === "GF-SAFE" ? "amber" : v.ebene === "TEAM" ? "accent" : "green"}>{v.ebene}</Pill>
            <div className="mt-2 text-sm font-bold">{v.wer}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-2">{v.beispiele}</p>
          </Card>
        ))}
      </div>

      {/* Querschnitt / Foundation — offene Fragen */}
      <SectionTitle icon="globe" kicker="Querschnitt / Foundation" title="Offene Fragen an Stephan (gilt für alle Werkzeuge)" />
      <FragenBlock titel="Querschnitt / Foundation" fragen={fragenFuer("querschnitt")} antworten={antworten} />

      {/* Werkzeug-Set */}
      <SectionTitle icon="cockpit" kicker="Das Werkzeug-Set" title="Fünf operative Werkzeuge" />
      <div className="grid gap-4 lg:grid-cols-2">
        {m.werkzeuge.map((w) => (
          <div key={w.key}
            className={`rounded-xl border bg-surface p-5 shadow-sm ${w.istDieseApp ? "border-accent ring-1 ring-accent/30" : "border-line"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                  <Icon name={w.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold leading-none">{w.name}</h3>
                  <span className="text-xs text-muted-2">{w.rolle}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Pill tone={statusTone(w.status)}>{w.status}</Pill>
                {w.istDieseApp && <span className="text-[10px] font-bold uppercase tracking-wide text-accent">Diese App</span>}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{w.zweck}</p>
            <ul className="mt-3 grid gap-1">
              {w.faehigkeiten.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-muted-2">
                  <Icon name="check" className="mt-0.5 h-3 w-3 shrink-0 text-accent" /> <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
              <Icon name="bolt" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
              <span><span className="font-semibold text-ink">Hebel:</span> {w.hebel}</span>
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-wide text-muted-2">{w.agentTyp}</div>
            <FragenBlock fragen={fragenFuer(w.key)} antworten={antworten} />
          </div>
        ))}
      </div>

      {/* Future Scope */}
      <SectionTitle icon="rocket" kicker="Future Scope" title="Zwei strategische Erweiterungen" />
      <div className="grid gap-4 sm:grid-cols-2">
        {m.futureScope.map((f) => (
          <Card key={f.name}>
            <div className="flex items-center gap-2">
              <Icon name={f.icon} className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-bold">{f.name}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.beschreibung}</p>
            <p className="mt-3 text-xs font-medium text-muted-2">{f.status}</p>
          </Card>
        ))}
      </div>
      <FragenBlock titel="Offene Fragen — Future Scope" fragen={fragenFuer("future")} antworten={antworten} />

      {/* Roadmap */}
      <SectionTitle icon="repeat" kicker="Roadmap" title="Sequenz — Foundation zuerst" />
      <Card>
        <ol className="flex flex-col">
          {m.roadmap.map((r, i) => (
            <li key={r.schritt} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${r.istDieseApp ? "bg-accent text-bg" : "bg-accent/15 text-accent"}`}>{r.schritt}</span>
                {i < m.roadmap.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold">{r.titel}</h3>
                  {r.istDieseApp && <Pill tone="green">live · diese App</Pill>}
                  {r.timing && <span className="text-xs text-muted-2">{r.timing}</span>}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{r.beschreibung}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Ziele 2028 */}
      <SectionTitle icon="target" kicker="Wo wir in 24 Monaten stehen" title="Ziele bis Mitte 2028" />
      <div className="grid gap-3 sm:grid-cols-2">
        {m.ziele2028.map((z, i) => (
          <div key={i} className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-4 shadow-sm">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-green" />
            <p className="text-sm leading-relaxed text-muted">{z}</p>
          </div>
        ))}
      </div>

      {/* Differenzierung */}
      <SectionTitle icon="star" kicker="Was uns vom Markt unterscheidet" title="Die HFK-Differenzierung" />
      <div className="grid gap-3 lg:grid-cols-3">
        {m.differenzierung.map((d, i) => (
          <Card key={i}><p className="text-sm leading-relaxed text-muted">{d}</p></Card>
        ))}
      </div>

      {/* Prinzipien */}
      <SectionTitle icon="globe" kicker="Nicht verhandelbar" title="Architektur-Prinzipien" />
      <div className="grid gap-3 sm:grid-cols-2">
        {m.prinzipien.map((p) => (
          <Card key={p.titel}>
            <h3 className="text-sm font-bold">{p.titel}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{p.beschreibung}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
