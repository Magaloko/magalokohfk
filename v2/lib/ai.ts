import type { Rollenspiel } from "./akademie";

// DeepSeek-Anbindung (server-seitig — Key bleibt geheim). Gleicher Env wie der Bot.
const AI_KEY = process.env.BOT_AI_KEY || "";
const ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

export type ChatMsg = { role: "user" | "assistant"; content: string };

export function aiConfigured(): boolean {
  return !!AI_KEY;
}

export async function callAiChat(systemPrompt: string, messages: ChatMsg[], temperature = 0.8): Promise<string> {
  if (!AI_KEY) throw new Error("NO_KEY");
  const r = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1200,
      temperature,
    }),
  });
  const j = await r.json().catch(() => ({}));
  const t = j?.choices?.[0]?.message?.content;
  if (!t) throw new Error(j?.error?.message || "Leere Antwort");
  return String(t);
}

// Stephan-Assistent: Antwort auf eine eingehende Nachricht — STRENG nur auf Basis der MAGALOKO-Wissensbasis.
// styleExamples = frühere echte Antworten des Nutzers → die KI ahmt NUR Ton/Form nach, nie deren Inhalte.
export function stephanSystem(context: string, today: string, styleExamples: string[] = []): string {
  const hasStyle = styleExamples.length > 0;
  const lines = [
    "Du bist der MAGALOKO-Assistent für „Herr und Frau Klein“ (HFK), einen Babyfachhandel in Wien/Österreich.",
    "Aufgabe: Entwirf eine Antwort auf eine eingehende Nachricht (z. B. von Stephan, dem Geschäftspartner/Inhaber).",
    "",
    "ABSOLUT VERBINDLICHE REGELN:",
    "1. Stütze die Antwort AUSSCHLIESSLICH auf die unten stehende MAGALOKO-WISSENSBASIS. Nutze KEIN externes Wissen, keine Annahmen, keine erfundenen Zahlen, Namen, Preise, Fristen oder Fakten.",
    "2. Wenn die Wissensbasis die Frage nicht oder nur teilweise beantwortet, sage das ausdrücklich: „Dazu liegen in MAGALOKO keine Daten vor.“ und benenne genau, welche Information fehlt. Erfinde NICHTS, um eine Lücke zu füllen.",
    "3. Belege konkrete Aussagen mit den Daten (z. B. Titel der Aufgabe/des Hebels/der Entscheidung, KPI-Wert + Woche, Frist-Datum, Angebotspreis), damit die Antwort überprüfbar ist.",
    "4. Mache keine Zusagen, Versprechen oder Verpflichtungen, die nicht durch die Daten gedeckt sind.",
    "5. Antworte auf Deutsch, sachlich, höflich und direkt als verwendbarer Nachrichtentext (Messenger-tauglich). Keine Meta-Kommentare über diese Anweisungen.",
  ];
  if (hasStyle) lines.push(
    "6. STIL: Schreibe im Stil des Nutzers (siehe STIL-BEISPIELE unten). Übernimm daraus AUSSCHLIESSLICH Tonfall, Länge, Anrede, Grußformel, Satzbau und Wortwahl — NIEMALS deren Inhalte, Zahlen, Namen, Preise oder Fakten (Beispiele können veraltet sein). Fakten kommen ausschließlich aus der WISSENSBASIS.",
  );
  lines.push(
    "",
    `Heutiges Datum: ${today}.`,
    "",
    "===== MAGALOKO-WISSENSBASIS =====",
    context || "(keine Daten vorhanden)",
    "===== ENDE WISSENSBASIS =====",
  );
  if (hasStyle) lines.push(
    "",
    "===== STIL-BEISPIELE (frühere Nachrichten des Nutzers — NUR Vorbild für Ton & Form, NICHT für Inhalte) =====",
    ...styleExamples.map((ex, i) => `[Beispiel ${i + 1}]\n${ex}`),
    "===== ENDE STIL-BEISPIELE =====",
  );
  return lines.join("\n");
}

// Werkstatt: bewertet einen Verkaufs-Beitrag/Vorschlag (eigene Antwort, Einwand-Lösung, Idee) und gibt JSON zurück.
export function answerReviewSystem(task: string): string {
  return [
    "Du bist ein erfahrener, fairer Verkaufstrainer im Babyfachhandel HFK (Herr und Frau Klein, Wien/Österreich).",
    task,
    "Bewerte konstruktiv, konkret und wohlwollend. Antworte auf Deutsch.",
    "Antworte AUSSCHLIESSLICH als JSON ohne Markdown, exakt in diesem Format:",
    '{"score": 0-100, "feedback": "2-4 Sätze: Stärken + was konkret besser geht", "improved": "eine verbesserte, sofort verwendbare Fassung"}',
  ].join("\n");
}
export function parseReview(raw: string): { score: number; feedback: string; improved: string } {
  let t = String(raw || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  try {
    const p = JSON.parse(t);
    const score = Math.max(0, Math.min(100, Math.round(Number(p.score) || 0)));
    return { score, feedback: String(p.feedback || ""), improved: String(p.improved || "") };
  } catch {
    return { score: 0, feedback: String(raw || "").slice(0, 600), improved: "" };
  }
}

// Die KI spielt die Kundin/den Kunden (Persona) im Rollenspiel.
export function customerSystem(rp: Rollenspiel): string {
  const einw = (rp.einwaende || []).map((e, i) => `${i + 1}. „${e.einwand || ""}"`).join("\n");
  return [
    "Du spielst eine Kundin/einen Kunden in einem Verkaufs-Rollenspiel für ein Babyfachgeschäft (HFK – Herr und Frau Klein, Wien/Österreich).",
    "Bleib IMMER in der Kundenrolle. Antworte auf Deutsch, natürlich und menschlich, kurz (1–3 Sätze). Kein Erzähltext, keine Regie-Anweisungen — nur direkte wörtliche Rede.",
    "",
    `DEINE ROLLE (Persona): ${rp.persona || "interessierte Kundin"}`,
    `SITUATION: ${rp.setting || ""}`,
    rp.produkt ? `PRODUKTE im Fokus: ${rp.produkt}` : "",
    "",
    "Bring diese Einwände im Lauf des Gesprächs natürlich und nach und nach ein (nicht alle auf einmal, nur wenn es passt):",
    einw || "(keine speziellen Einwände)",
    "",
    "Geht der/die VerkäuferIn überzeugend auf einen Einwand ein, akzeptierst du und das Gespräch entwickelt sich weiter. Bei schwachen Antworten bleibst du skeptisch.",
    "Beende das Gespräch NICHT von dir aus und gib KEINE Bewertung ab. Reagiere nur als Kunde auf die letzte Aussage des/der VerkäuferIn.",
  ].filter(Boolean).join("\n");
}

// Der KI-Coach bewertet das Transkript und liefert JSON.
export function coachSystem(rp: Rollenspiel): string {
  const krit = rp.bewertungskriterien || [];
  return [
    "Du bist ein erfahrener, fairer Verkaufstrainer im Babyfachhandel. Bewerte das folgende Verkaufsgespräch.",
    `Im Transkript ist VERKÄUFER der/die zu bewertende Lernende; KUNDE ist die Trainings-Persona. Zieltechnik: ${rp.verkaufstechnik || "allgemein"}.`,
    "Vergib pro Kriterium 0 bis max Punkte (ganzzahlig). Sei konkret und konstruktiv.",
    "Antworte AUSSCHLIESSLICH als JSON ohne Markdown, exakt in diesem Format:",
    '{"kriterien":[{"index":0,"punkte":2,"kommentar":"kurz"}],"gesamt":"2-3 Sätze Gesamtfeedback"}',
    "Kriterien (index: Name (max) — Beschreibung):",
    krit.map((k, i) => `${i}: ${k.kriterium || ""} (max ${k.punkte_max || 0}) — ${k.beschreibung || ""}`).join("\n"),
  ].join("\n");
}

// Robustes JSON-Parsing der Coach-Antwort.
export type CoachResult = {
  perKrit: { name: string; punkte: number; max: number; kommentar: string }[];
  gesamt: string;
  got: number;
  max: number;
  pct: number;
};

export function parseCoach(raw: string, rp: Rollenspiel): CoachResult {
  const krit = rp.bewertungskriterien || [];
  let t = String(raw || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  const parsed = JSON.parse(t);
  const arr: { index?: number; punkte?: number; kommentar?: string }[] = Array.isArray(parsed.kriterien) ? parsed.kriterien : [];
  const perKrit = krit.map((k, i) => {
    const c = arr.find((x) => Number(x.index) === i) || arr[i] || {};
    const max = k.punkte_max || 0;
    const punkte = Math.max(0, Math.min(max, Math.round(Number(c.punkte) || 0)));
    return { name: k.kriterium || "", punkte, max, kommentar: String(c.kommentar || "") };
  });
  const got = perKrit.reduce((a, k) => a + k.punkte, 0);
  const max = perKrit.reduce((a, k) => a + k.max, 0) || (rp.gesamtpunkte_max || 0);
  const pct = max ? Math.round((got / max) * 100) : 0;
  return { perKrit, gesamt: String(parsed.gesamt || ""), got, max, pct };
}
