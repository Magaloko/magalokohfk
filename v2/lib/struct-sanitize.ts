// Server-seitige Sanitizer für verschachtelte Akademie-Strukturen (Szenarien, Rollenspiele).
// Längen-/Anzahl-Limits schützen vor Missbrauch & Token-/Payload-Explosion.

const S = (v: unknown, n = 2000) => String(v ?? "").slice(0, n);
const N = (v: unknown): number | undefined => { const x = Number(v); return Number.isFinite(x) ? x : undefined; };
const arr = (v: unknown, max: number): any[] => (Array.isArray(v) ? v.slice(0, max) : []);

export function sanitizeScenario(input: unknown): Record<string, unknown> {
  const o = (input || {}) as Record<string, any>;
  const steps = arr(o.steps, 30).map((s) => {
    const options = arr(s?.options, 8).map((op) => ({ text: S(op?.text, 500), feedback: S(op?.feedback, 500) }));
    const ci = N(s?.correctIdx);
    return {
      prompt: S(s?.prompt, 2000),
      options,
      correctIdx: ci !== undefined ? Math.max(0, Math.min(Math.max(options.length - 1, 0), Math.round(ci))) : 0,
    };
  });
  return {
    name: S(o.name, 300),
    situation: S(o.situation, 2000),
    personaId: S(o.personaId, 100),
    schwierigkeit: S(o.schwierigkeit, 60),
    steps,
  };
}

export function sanitizeRoleplay(input: unknown): Record<string, unknown> {
  const o = (input || {}) as Record<string, any>;
  const out: Record<string, unknown> = {
    titel: S(o.titel, 300),
    persona: S(o.persona, 600),
    setting: S(o.setting, 1500),
    verkaufstechnik: S(o.verkaufstechnik, 200),
    produkt: S(o.produkt, 400),
    marke: S(o.marke, 200),
    ablauf: arr(o.ablauf, 30).map((a, i) => {
      const sch = N(a?.schritt);
      return { schritt: sch !== undefined ? Math.round(sch) : i + 1, name: S(a?.name, 200), beschreibung: S(a?.beschreibung, 1000) };
    }),
    einwaende: arr(o.einwaende, 30).map((e) => ({ einwand: S(e?.einwand, 400), psychologie: S(e?.psychologie, 600), erwartete_technik: S(e?.erwartete_technik, 300) })),
    bewertungskriterien: arr(o.bewertungskriterien, 30).map((k) => {
      const pm = N(k?.punkte_max);
      return { kriterium: S(k?.kriterium, 200), punkte_max: pm !== undefined ? Math.round(pm) : 0, beschreibung: S(k?.beschreibung, 600) };
    }),
    erfolgskriterien: arr(o.erfolgskriterien, 30).map((x) => S(x, 300)).filter(Boolean),
  };
  const aov = N(o.ziel_aov); if (aov !== undefined) out.ziel_aov = Math.round(aov);
  const gp = N(o.gesamtpunkte_max);
  out.gesamtpunkte_max = gp !== undefined ? Math.round(gp) : (out.bewertungskriterien as any[]).reduce((s, k) => s + (k.punkte_max || 0), 0);
  return out;
}

const txtItem = (x: any, n: number) => S(typeof x === "string" ? x : (x?.name ?? x?.argument ?? x?.text), n);

export function sanitizeMarke(input: unknown): Record<string, unknown> {
  const o = (input || {}) as Record<string, any>;
  return {
    name: S(o.name, 300),
    philosophie: S(o.philosophie, 1500),
    herkunft: { land: S(o.herkunft?.land, 120), stadt: S(o.herkunft?.stadt, 120), gruendung: S(o.herkunft?.gruendung, 40) },
    kategorien: arr(o.kategorien, 40).map((x) => txtItem(x, 200)).filter(Boolean),
    hero_produkte: arr(o.hero_produkte, 40).map((x) => txtItem(x, 200)).filter(Boolean),
    verkaufsargumente: arr(o.verkaufsargumente, 40).map((x) => txtItem(x, 300)).filter(Boolean),
    usps: arr(o.usps, 40).map((x) => S(x, 200)).filter(Boolean),
  };
}

export function sanitizeDrill(input: unknown): Record<string, unknown> {
  const o = (input || {}) as Record<string, any>;
  return {
    marke: S(o.marke, 200),
    frage: S(o.frage, 1000),
    schwierigkeit: S(o.schwierigkeit, 60),
    verkaufstechnik: S(o.verkaufstechnik, 200),
    musterantwort: S(o.musterantwort, 2000),
    lerntyp: arr(o.lerntyp, 12).map((x) => S(x, 60)).filter(Boolean),
    optionen: arr(o.optionen, 8).map((op) => {
      const out: Record<string, unknown> = { text: S(op?.text, 500), ist_richtig: !!op?.ist_richtig, feedback: S(op?.feedback, 500) };
      const p = N(op?.punkte); if (p !== undefined) out.punkte = Math.round(p);
      return out;
    }),
  };
}

export const STRUCTURED: Record<string, { fn: (i: unknown) => Record<string, unknown>; prefix: string; required: string }> = {
  trainingScenarios: { fn: sanitizeScenario, prefix: "sc", required: "name" },
  akademieRoleplays: { fn: sanitizeRoleplay, prefix: "rp", required: "titel" },
  akademieMarken: { fn: sanitizeMarke, prefix: "m", required: "name" },
  akademieDrills: { fn: sanitizeDrill, prefix: "dr", required: "frage" },
};
