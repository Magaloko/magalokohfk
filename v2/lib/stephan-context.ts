import { getCockpitData } from "./cockpit";
import { getAkademieData } from "./akademie";
import { strategySummaryText, MASTERMIND } from "./strategy";
import { getMastermindAntworten } from "./mastermind";
import { MASTERMIND_FRAGEN } from "./mastermind-fragen";

// Baut eine kompakte, token-begrenzte Wissensbasis aus ALLEN MasterMind-Daten.
// Dient als alleinige Faktenquelle für den Stephan-Assistenten (keine Halluzination).

const cut = (s: unknown, n = 300) => { const t = String(s ?? "").trim(); return t.length > n ? t.slice(0, n) + "…" : t; };
const line = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" · ");

export async function buildStephanContext(): Promise<string> {
  const [c, a, mmAntworten] = await Promise.all([getCockpitData(), getAkademieData(), getMastermindAntworten()]);
  const today = new Date().toISOString().slice(0, 10);
  const out: string[] = [];

  // Stephans Strategie (MasterMind) zuerst — damit Fragen zu Roadmap/Zielen/Werkzeugen belegbar sind.
  out.push("## MASTERMIND-STRATEGIE (Plan von Stephan — verbindliche Grundlage)\n" + strategySummaryText());

  const tasks = c.tasks.slice(0, 80);
  if (tasks.length) out.push("## AUFGABEN\n" + tasks.map((t) => "- " + line(
    cut(t.title, 160), t.area && `Bereich: ${t.area}`, t.status && `Status: ${t.status}`, t.priority && `Prio: ${t.priority}`,
    t.owner && `Verantw.: ${t.owner}`, t.dueDate && `fällig: ${t.dueDate}`, t.notes && `Notiz: ${cut(t.notes, 200)}`,
  )).join("\n"));

  const dec = c.decisions.slice(0, 60);
  if (dec.length) out.push("## ENTSCHEIDUNGEN (Stephan)\n" + dec.map((d) => "- " + line(
    cut(d.titel, 160), d.status && `Status: ${d.status}`, d.kategorie && `Kategorie: ${d.kategorie}`,
    d.frist && `Frist: ${d.frist}`, d.empfehlung && `Empfehlung: ${cut(d.empfehlung, 300)}`,
  )).join("\n"));

  const events = c.calendarEvents.filter((e) => (e.date || "") >= today).sort((x, y) => String(x.date).localeCompare(String(y.date))).slice(0, 40);
  if (events.length) out.push("## KOMMENDE TERMINE\n" + events.map((e) => "- " + line(
    e.date, e.time, e.kind, cut(e.title, 120), e.notes && `(${cut(e.notes, 150)})`,
  )).join("\n"));

  if (c.staffTraining.length) out.push("## MITARBEITER (Training)\n" + c.staffTraining.slice(0, 40).map((m) => {
    const cs = m.completedScenarios || [];
    const avg = cs.length ? Math.round(cs.reduce((s, x) => s + (Number(x.score) || 0), 0) / cs.length) : 0;
    return "- " + line(m.name, `${cs.length} Trainings`, !!cs.length && `Ø ${avg}%`, m.strengths && `Stärken: ${cut(m.strengths, 150)}`, m.weaknesses && `Schwächen: ${cut(m.weaknesses, 150)}`);
  }).join("\n"));

  if (a.angebote.length) out.push("## BERATUNGSANGEBOTE\n" + a.angebote.slice(0, 60).map((o) => "- " + line(
    cut(o.name, 120), o.preis && `Preis: ${o.preis}`, o.dauer && `Dauer: ${o.dauer}`, o.zielgruppe && `Zielgruppe: ${o.zielgruppe}`,
    o.inhalt && `Inhalt: ${cut(o.inhalt, 200)}`, o.ergebnis && `Ergebnis: ${cut(o.ergebnis, 150)}`,
  )).join("\n"));

  if (a.marken.length) out.push("## MARKEN\n" + a.marken.slice(0, 60).map((m) => {
    const usps = Array.isArray(m.usps) ? m.usps.slice(0, 4).join("; ") : "";
    return "- " + line(cut(m.name, 100), m.philosophie && `Philosophie: ${cut(m.philosophie, 200)}`, usps && `USPs: ${usps}`);
  }).join("\n"));

  if (a.einwaende.length) out.push("## EINWAND-BEHANDLUNG\n" + a.einwaende.slice(0, 100).map((e) => "- " + line(
    e.einwand && `Einwand: „${cut(e.einwand, 150)}"`, e.antwort && `Antwort: ${cut(e.antwort, 250)}`, e.beweis && `Beleg: ${cut(e.beweis, 150)}`,
  )).join("\n"));

  if (a.personas.length) out.push("## KUNDEN-PERSONAS\n" + a.personas.slice(0, 40).map((p) => "- " + line(
    cut(p.name, 100), p.alter, p.kontext && cut(p.kontext, 200), p.einwaendeTypisch && `typische Einwände: ${cut(p.einwaendeTypisch, 150)}`,
  )).join("\n"));

  if (a.szenarien.length) out.push("## TRAININGS-SZENARIEN\n" + a.szenarien.slice(0, 40).map((s) => "- " + line(
    cut(s.name, 120), s.schwierigkeit && `Niveau: ${s.schwierigkeit}`, s.situation && cut(s.situation, 200),
  )).join("\n"));

  const wzName = (key: string) =>
    MASTERMIND.werkzeuge.find((w) => w.key === key)?.name
    || (key === "querschnitt" ? "Querschnitt/Foundation" : key === "future" ? "Future Scope" : key);
  const beantwortet = MASTERMIND_FRAGEN.filter((f) => {
    const r = mmAntworten[f.id];
    return r && r.status === "beantwortet" && String(r.antwort || "").trim();
  });
  if (beantwortet.length) {
    out.push("## MASTERMIND-KLÄRUNGEN (von Stephan beantwortet)\n" + beantwortet.map((f) =>
      `- [${wzName(f.werkzeug)}] ${cut(f.frage, 160)}: „${cut(mmAntworten[f.id].antwort, 400)}"`).join("\n"));
  }

  return out.join("\n\n");
}
