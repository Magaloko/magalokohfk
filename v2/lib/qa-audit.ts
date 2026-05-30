import { getAkademieData } from "./akademie";

// Ein Audit-Eintrag = GENAU EIN bearbeitbares Feld (collection/id/field) → sichere Einzelfeld-Übernahme.
export type QAItem = { key: string; type: string; label: string; collection: string; id: string; field: string; text: string };

const clean = (s: unknown) => String(s ?? "").trim();

// Erlaubte (Sammlung → Felder) für Audit & Übernahme. Nur Prosa-Felder oberster Ebene (patch-fähig).
export const QA_FIELDS: Record<string, string[]> = {
  akademieDrills: ["frage", "musterantwort"],
  salesObjections: ["einwand", "antwort", "beweis"],
  akademieMarken: ["philosophie"],
  trainingScenarios: ["situation"],
  salesPersonas: ["kontext", "zitat", "einwaendeTypisch"],
  consultingServices: ["inhalt", "ergebnis", "zielgruppe"],
};

const FIELD_LABEL: Record<string, string> = {
  frage: "Frage", musterantwort: "Musterantwort", einwand: "Einwand", antwort: "Antwort", beweis: "Beleg",
  philosophie: "Philosophie", situation: "Situation", kontext: "Kontext", zitat: "Zitat",
  einwaendeTypisch: "Typische Einwände", inhalt: "Inhalt", ergebnis: "Ergebnis", zielgruppe: "Zielgruppe",
};

// Sammelt alle prüfbaren Prosa-Felder der Akademie (ein Eintrag je Feld).
export async function collectQA(): Promise<QAItem[]> {
  const a = await getAkademieData();
  const out: QAItem[] = [];
  const push = (type: string, label: string, collection: string, id: string | number, field: string, value: unknown) => {
    const text = clean(value);
    if (!text) return;
    out.push({ key: `${collection}:${id}:${field}`, type, label: `${label} · ${FIELD_LABEL[field] || field}`, collection, id: String(id), field, text });
  };

  a.drills.forEach((d, i) => { const id = d.id ?? i; const lbl = clean(d.marke) || "allgemein"; push("Drill", lbl, "akademieDrills", id, "frage", d.frage); push("Drill", lbl, "akademieDrills", id, "musterantwort", d.musterantwort); });
  a.einwaende.forEach((e, i) => { const id = e.id ?? i; const lbl = clean(e.kategorie) || "Einwand"; push("Einwand", lbl, "salesObjections", id, "einwand", e.einwand); push("Einwand", lbl, "salesObjections", id, "antwort", e.antwort); push("Einwand", lbl, "salesObjections", id, "beweis", e.beweis); });
  a.marken.forEach((m, i) => { const id = m.id ?? i; push("Marke", clean(m.name) || "Marke", "akademieMarken", id, "philosophie", m.philosophie); });
  a.szenarien.forEach((s, i) => { const id = s.id ?? i; push("Szenario", clean(s.name) || "Szenario", "trainingScenarios", id, "situation", s.situation); });
  a.personas.forEach((p, i) => { const id = p.id ?? i; const lbl = clean(p.name) || "Persona"; push("Persona", lbl, "salesPersonas", id, "kontext", p.kontext); push("Persona", lbl, "salesPersonas", id, "zitat", p.zitat); push("Persona", lbl, "salesPersonas", id, "einwaendeTypisch", p.einwaendeTypisch); });
  a.angebote.forEach((o, i) => { const id = o.id ?? i; const lbl = clean(o.name) || "Angebot"; push("Angebot", lbl, "consultingServices", id, "inhalt", o.inhalt); push("Angebot", lbl, "consultingServices", id, "ergebnis", o.ergebnis); push("Angebot", lbl, "consultingServices", id, "zielgruppe", o.zielgruppe); });

  return out;
}
