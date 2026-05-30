import { db } from "./supabase-server";

export type TrainingType = "drill" | "quiz" | "szenario" | "rollenspiel" | "challenge";

export type Stats = {
  perfects: number;
  totalCorrect: number;
  totalAnswered: number;
  byType: Partial<Record<TrainingType, number>>;
  lastChallenge?: string; // YYYY-MM-DD der letzten Tages-Challenge
  weak?: Record<string, number>; // itemKey ("drill:<id>" …) -> Fehlversuch-Gewicht (Spaced Repetition)
  paths?: Record<string, number[]>; // pathId -> erledigte Schritt-Indizes (Lernpfade)
  pathsAwarded?: string[]; // bereits mit Abschluss-Bonus belohnte Pfade
  proposals?: number; // eingereichte Werkstatt-Vorschläge
  proposalsAccepted?: number; // angenommene Vorschläge
};

export type Progress = {
  user_key: string;
  display: string;
  xp: number;
  sessions_count: number;
  streak: number;
  best_streak: number;
  last_active: string | null;
  badges: string[];
  stats: Stats;
};

export type Badge = { id: string; icon: string; label: string; hint: string };

// Badge-Katalog (Reihenfolge = Anzeige).
export const BADGES: Badge[] = [
  { id: "first_steps", icon: "footprints", label: "Erste Schritte", hint: "Erstes Training abgeschlossen" },
  { id: "perfect", icon: "trophy", label: "Perfektionist", hint: "Ein Training mit 100 %" },
  { id: "sharp", icon: "target", label: "Treffsicher", hint: "100 richtige Antworten" },
  { id: "streak_3", icon: "flame", label: "3-Tage-Serie", hint: "3 Tage in Folge geübt" },
  { id: "streak_7", icon: "bolt", label: "7-Tage-Serie", hint: "7 Tage in Folge geübt" },
  { id: "roleplayer", icon: "masks", label: "Rollenspieler", hint: "Erstes KI-Rollenspiel bewertet" },
  { id: "marathon", icon: "user", label: "Marathon", hint: "25 Trainings abgeschlossen" },
  { id: "scholar", icon: "academy", label: "Gelehrte:r", hint: "2000 XP erreicht" },
  { id: "contributor", icon: "bulb", label: "Mitdenker", hint: "Ersten Werkstatt-Vorschlag eingereicht" },
  { id: "innovator", icon: "star", label: "Ideengeber", hint: "Ein Vorschlag wurde angenommen" },
];

const XP_PER_LEVEL = 400;
export function levelInfo(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, need: XP_PER_LEVEL, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

const EMPTY_STATS: Stats = { perfects: 0, totalCorrect: 0, totalAnswered: 0, byType: {} };

function normStats(s: unknown): Stats {
  const o = (s || {}) as Partial<Stats>;
  return {
    perfects: Number(o.perfects) || 0,
    totalCorrect: Number(o.totalCorrect) || 0,
    totalAnswered: Number(o.totalAnswered) || 0,
    byType: (o.byType && typeof o.byType === "object" ? o.byType : {}) as Stats["byType"],
    lastChallenge: typeof o.lastChallenge === "string" ? o.lastChallenge : undefined,
    weak: (o.weak && typeof o.weak === "object" ? o.weak : {}) as Record<string, number>,
    paths: (o.paths && typeof o.paths === "object" ? o.paths : {}) as Record<string, number[]>,
    pathsAwarded: Array.isArray(o.pathsAwarded) ? (o.pathsAwarded as string[]) : [],
    proposals: Number(o.proposals) || 0,
    proposalsAccepted: Number(o.proposalsAccepted) || 0,
  };
}

function row2progress(d: Record<string, unknown>): Progress {
  return {
    user_key: String(d.user_key),
    display: String(d.display || "Du"),
    xp: Number(d.xp) || 0,
    sessions_count: Number(d.sessions_count) || 0,
    streak: Number(d.streak) || 0,
    best_streak: Number(d.best_streak) || 0,
    last_active: (d.last_active as string) || null,
    badges: Array.isArray(d.badges) ? (d.badges as string[]) : [],
    stats: normStats(d.stats),
  };
}

export function emptyProgress(userKey = "", display = "Du"): Progress {
  return { user_key: userKey, display, xp: 0, sessions_count: 0, streak: 0, best_streak: 0, last_active: null, badges: [], stats: { ...EMPTY_STATS, byType: {} } };
}

// Liest Fortschritt; null wenn nicht vorhanden / Tabelle fehlt.
export async function getProgress(userKey: string): Promise<Progress | null> {
  try {
    const { data, error } = await db().from("akademie_progress").select("*").eq("user_key", userKey).maybeSingle();
    if (error || !data) return null;
    return row2progress(data as Record<string, unknown>);
  } catch { return null; }
}

// Alle Fortschritts-Zeilen (Admin: Team-Übersicht).
export async function getAllProgress(): Promise<Progress[]> {
  try {
    const { data } = await db().from("akademie_progress").select("*").order("xp", { ascending: false }).limit(300);
    return (data || []).map((d) => row2progress(d as Record<string, unknown>));
  } catch { return []; }
}

// uid aus user_key ("tg:544821565@telegram") extrahieren; null bei Web-Sessions.
export function uidFromKey(key: string): number | null {
  const m = /^tg:(\d+)/.exec(key || "");
  return m ? Number(m[1]) : null;
}

function earnedBadges(p: Progress): string[] {
  const out: string[] = [];
  if (p.sessions_count >= 1) out.push("first_steps");
  if (p.stats.perfects >= 1) out.push("perfect");
  if (p.stats.totalCorrect >= 100) out.push("sharp");
  if (p.best_streak >= 3) out.push("streak_3");
  if (p.best_streak >= 7) out.push("streak_7");
  if ((p.stats.byType.rollenspiel || 0) >= 1) out.push("roleplayer");
  if (p.sessions_count >= 25) out.push("marathon");
  if (p.xp >= 2000) out.push("scholar");
  if ((p.stats.proposals || 0) >= 1) out.push("contributor");
  if ((p.stats.proposalsAccepted || 0) >= 1) out.push("innovator");
  return out;
}

function daysBetween(a: string, b: string): number {
  const da = Date.parse(a + "T00:00:00Z"), db_ = Date.parse(b + "T00:00:00Z");
  if (!Number.isFinite(da) || !Number.isFinite(db_)) return 99;
  return Math.round((db_ - da) / 86400000);
}

// Spaced-Repetition-Gewichte aktualisieren: Fehler erhöhen, Treffer senken; auf 120 Items begrenzt.
function updateWeak(prev: Record<string, number> | undefined, results?: { key: string; correct: boolean }[]): Record<string, number> {
  const weak: Record<string, number> = { ...(prev || {}) };
  for (const r of results || []) {
    if (!r || !r.key) continue;
    if (r.correct) { const v = (weak[r.key] || 0) - 1; if (v <= 0) delete weak[r.key]; else weak[r.key] = v; }
    else weak[r.key] = Math.min((weak[r.key] || 0) + 1, 9);
  }
  const entries = Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 120);
  return Object.fromEntries(entries);
}

export type RecordResult = {
  ok: boolean;
  xpGain: number;
  newBadges: Badge[];
  progress: Progress;
};

// Verbucht ein abgeschlossenes Training. Defensiv: bei DB-Fehler ok:false, aber konsistentes Ergebnis.
export async function recordResult(
  userKey: string,
  display: string,
  input: { type: TrainingType; score: number; total: number; itemResults?: { key: string; correct: boolean }[] },
): Promise<RecordResult> {
  const score = Math.max(0, Math.round(input.score) || 0);
  const total = Math.max(0, Math.round(input.total) || 0);
  const pct = total ? Math.round((score / total) * 100) : 0;
  // 5 Basis-XP fürs Abschließen + 10/richtige Antwort + Bonus bei starkem Ergebnis + Challenge-Bonus.
  const xpGain = 5 + score * 10 + (pct === 100 ? 30 : pct >= 80 ? 15 : 0) + (input.type === "challenge" ? 25 : 0);

  const today = new Date().toISOString().slice(0, 10);

  const prev = (await getProgress(userKey)) || emptyProgress(userKey, display);

  // Streak
  let streak = prev.streak;
  if (prev.last_active === today) { /* schon heute aktiv */ }
  else if (prev.last_active && daysBetween(prev.last_active, today) === 1) streak = prev.streak + 1;
  else streak = 1;
  const best_streak = Math.max(prev.best_streak, streak);

  const stats: Stats = {
    ...prev.stats, // WICHTIG: paths/pathsAwarded/proposals/proposalsAccepted erhalten (sonst Datenverlust)
    perfects: prev.stats.perfects + (pct === 100 ? 1 : 0),
    totalCorrect: prev.stats.totalCorrect + score,
    totalAnswered: prev.stats.totalAnswered + total,
    byType: { ...prev.stats.byType, [input.type]: (prev.stats.byType[input.type] || 0) + 1 },
    lastChallenge: input.type === "challenge" ? today : prev.stats.lastChallenge,
    weak: updateWeak(prev.stats.weak, input.itemResults),
  };

  const next: Progress = {
    user_key: userKey,
    display: display || prev.display || "Du",
    xp: prev.xp + xpGain,
    sessions_count: prev.sessions_count + 1,
    streak, best_streak,
    last_active: today,
    badges: prev.badges,
    stats,
  };

  const allEarned = earnedBadges(next);
  const newBadgeIds = allEarned.filter((b) => !prev.badges.includes(b));
  next.badges = [...new Set([...prev.badges, ...allEarned])];

  try {
    const { error } = await db().from("akademie_progress").upsert({
      user_key: next.user_key, display: next.display, xp: next.xp, sessions_count: next.sessions_count,
      streak: next.streak, best_streak: next.best_streak, last_active: next.last_active,
      badges: next.badges, stats: next.stats, updated_at: new Date().toISOString(),
    }, { onConflict: "user_key" });
    if (error) return { ok: false, xpGain, newBadges: badgesByIds(newBadgeIds), progress: next };
  } catch {
    return { ok: false, xpGain, newBadges: badgesByIds(newBadgeIds), progress: next };
  }
  return { ok: true, xpGain, newBadges: badgesByIds(newBadgeIds), progress: next };
}

// Lernpfad-Schritt umschalten; bei erstmaligem Abschluss +60 XP Bonus.
export async function recordPathStep(
  userKey: string, display: string, pathId: string, totalSteps: number, step: number, done: boolean,
): Promise<{ ok: boolean; steps: number[]; justCompleted: boolean; xpGain: number }> {
  const prev = (await getProgress(userKey)) || emptyProgress(userKey, display);
  const paths = { ...(prev.stats.paths || {}) };
  const set = new Set<number>((paths[pathId] || []).filter((s) => s >= 0 && s < totalSteps));
  if (done) set.add(step); else set.delete(step);
  const steps = [...set].sort((a, b) => a - b);
  paths[pathId] = steps;

  const awarded = new Set<string>(prev.stats.pathsAwarded || []);
  let xpGain = 0, justCompleted = false;
  if (steps.length >= totalSteps && totalSteps > 0 && !awarded.has(pathId)) { awarded.add(pathId); xpGain = 60; justCompleted = true; }

  const stats: Stats = { ...prev.stats, paths, pathsAwarded: [...awarded] };
  const next: Progress = { ...prev, display: display || prev.display, xp: prev.xp + xpGain, stats };
  try {
    const { error } = await db().from("akademie_progress").upsert({
      user_key: next.user_key, display: next.display, xp: next.xp, sessions_count: next.sessions_count,
      streak: next.streak, best_streak: next.best_streak, last_active: next.last_active,
      badges: next.badges, stats: next.stats, updated_at: new Date().toISOString(),
    }, { onConflict: "user_key" });
    if (error) return { ok: false, steps, justCompleted, xpGain };
  } catch { return { ok: false, steps, justCompleted, xpGain }; }
  return { ok: true, steps, justCompleted, xpGain };
}

export function badgesByIds(ids: string[]): Badge[] {
  return ids.map((id) => BADGES.find((b) => b.id === id)).filter((b): b is Badge => !!b);
}

// Werkstatt-Gamification: XP fürs Einreichen (+10) bzw. für einen angenommenen Vorschlag (+50, an den Autor).
export async function recordWerkstatt(userKey: string, display: string, kind: "submit" | "accepted"): Promise<{ ok: boolean; xpGain: number; newBadges: Badge[] }> {
  const prev = (await getProgress(userKey)) || emptyProgress(userKey, display);
  const xpGain = kind === "accepted" ? 50 : 10;
  const stats: Stats = {
    ...prev.stats,
    proposals: (prev.stats.proposals || 0) + (kind === "submit" ? 1 : 0),
    proposalsAccepted: (prev.stats.proposalsAccepted || 0) + (kind === "accepted" ? 1 : 0),
  };
  const next: Progress = { ...prev, display: display || prev.display || "Du", xp: prev.xp + xpGain, stats };
  const allEarned = earnedBadges(next);
  const newBadgeIds = allEarned.filter((b) => !prev.badges.includes(b));
  next.badges = [...new Set([...prev.badges, ...allEarned])];
  try {
    const { error } = await db().from("akademie_progress").upsert({
      user_key: next.user_key, display: next.display, xp: next.xp, sessions_count: next.sessions_count,
      streak: next.streak, best_streak: next.best_streak, last_active: next.last_active,
      badges: next.badges, stats: next.stats, updated_at: new Date().toISOString(),
    }, { onConflict: "user_key" });
    if (error) return { ok: false, xpGain, newBadges: badgesByIds(newBadgeIds) };
  } catch { return { ok: false, xpGain, newBadges: badgesByIds(newBadgeIds) }; }
  return { ok: true, xpGain, newBadges: badgesByIds(newBadgeIds) };
}

export type LeaderEntry = { rank: number; label: string; xp: number; level: number; me: boolean };

// Anonymisierte Bestenliste (Top N nach XP). Eigener Eintrag = "Du".
export async function getLeaderboard(meKey: string, limit = 10): Promise<LeaderEntry[]> {
  try {
    const { data } = await db().from("akademie_progress").select("user_key, xp").order("xp", { ascending: false }).limit(limit);
    if (!Array.isArray(data)) return [];
    return data.map((d, i) => {
      const key = String((d as any).user_key);
      const xp = Number((d as any).xp) || 0;
      const me = key === meKey;
      return { rank: i + 1, label: me ? "Du" : anonLabel(key), xp, level: levelInfo(xp).level, me };
    });
  } catch { return []; }
}

// Stabiles, anonymes Kürzel aus dem user_key (kein Klarname).
function anonLabel(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return "Kolleg:in #" + (100 + (h % 900));
}
