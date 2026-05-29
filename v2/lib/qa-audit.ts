import { getAkademieData } from "./akademie";

export type QAItem = { key: string; type: string; label: string; text: string };

const clean = (s: unknown) => String(s ?? "").trim();
const join = (...parts: (string | undefined)[]) => parts.map(clean).filter(Boolean).join("\n");

// Sammelt alle Frage-/Antwort-/Inhalts-Texte der Akademie für die Deutsch-Prüfung.
export async function collectQA(): Promise<QAItem[]> {
  const a = await getAkademieData();
  const out: QAItem[] = [];

  a.drills.forEach((d, i) => {
    const opts = (d.optionen || []).map((o) => clean(o.text)).filter(Boolean).join(" | ");
    const text = join(d.frage, opts, d.musterantwort);
    if (text) out.push({ key: `drill:${d.id || i}`, type: "Drill", label: clean(d.marke) || "allgemein", text });
  });
  a.einwaende.forEach((e, i) => {
    const text = join(e.einwand ? `Einwand: ${e.einwand}` : "", e.antwort ? `Antwort: ${e.antwort}` : "", e.beweis ? `Beleg: ${e.beweis}` : "");
    if (text) out.push({ key: `einwand:${e.id || i}`, type: "Einwand", label: clean(e.kategorie) || "—", text });
  });
  a.marken.forEach((m, i) => {
    const text = join(m.name, m.philosophie);
    if (text) out.push({ key: `marke:${m.id || i}`, type: "Marke", label: clean(m.name) || "—", text });
  });
  a.szenarien.forEach((s, i) => {
    const steps = (s.steps || []).map((st) => join(st.prompt, (st.options || []).map((o) => clean(o.text)).filter(Boolean).join(" | "))).filter(Boolean).join("\n");
    const text = join(s.name, s.situation, steps);
    if (text) out.push({ key: `szenario:${s.id || i}`, type: "Szenario", label: clean(s.name) || "—", text });
  });
  a.personas.forEach((p, i) => {
    const text = join(p.name, p.kontext, p.zitat, p.einwaendeTypisch);
    if (text) out.push({ key: `persona:${p.id || i}`, type: "Persona", label: clean(p.name) || "—", text });
  });
  a.angebote.forEach((o, i) => {
    const text = join(o.name, o.inhalt, o.ergebnis, o.zielgruppe);
    if (text) out.push({ key: `angebot:${o.id || i}`, type: "Angebot", label: clean(o.name) || "—", text });
  });

  return out;
}
