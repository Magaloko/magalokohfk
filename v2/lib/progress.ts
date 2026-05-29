import { db } from "./supabase-server";

export type TrainingType = "drill" | "quiz" | "szenario" | "rollenspiel";

export type Stats = {
  perfects: number;
  totalCorrect: number;
  totalAnswered: number;
  byType: Partial<Record<TrainingType, number>>;
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
  { id: "first_steps", icon: "👣", label: "Erste Schritte", hint: "Erstes Training abgeschlossen" },
  { id: "perfect", icon: "💯", label: "Perfektionist", hint: "Ein Training mit 100 %" },
  { id: "sharp", icon: "🎯", label: "Treffsicher", hint: "100 richtige Antworten" },
  { id: "streak_3", icon: "🔥", label: "3-Tage-Serie", hint: "3 Tage in Folge geübt" },
  { id: "streak_7", icon: "⚡", label: "7-Tage-Serie", hint: "7 Tage in Folge geübt" },
  { id: "roleplayer", icon: "🎭", label: "Rollenspieler", hint: "Erstes KI-Rollenspiel bewertet" },
  { id: "marathon", icon: "🏃", label: "Marathon", hint: "25 Trainings abgeschlossen" },
  { id: "scholar", icon: "🎓", label: "Gelehrte:r", hint: "2000 XP erreicht" },
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
  return out;
}

function daysBetween(a: string, b: string): number {
  const da = Date.parse(a + "T00:00:00Z"), db_ = Date.parse(b + "T00:00:00Z");
  if (!Number.isFinite(da) || !Number.isFinite(db_)) return 99;
  return Math.round((db_ - da) / 86400000);
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
  input: { type: TrainingType; score: number; total: number },
): Promise<RecordResult> {
  const score = Math.max(0, Math.round(input.score) || 0);
  const total = Math.max(0, Math.round(input.total) || 0);
  const pct = total ? Math.round((score / total) * 100) : 0;
  const xpGain = score * 10 + (pct === 100 ? 30 : pct >= 80 ? 15 : 0);

  const today = new Date().toISOString().slice(0, 10);

  const prev = (await getProgress(userKey)) || emptyProgress(userKey, display);

  // Streak
  let streak = prev.streak;
  if (prev.last_active === today) { /* schon heute aktiv */ }
  else if (prev.last_active && daysBetween(prev.last_active, today) === 1) streak = prev.streak + 1;
  else streak = 1;
  const best_streak = Math.max(prev.best_streak, streak);

  const stats: Stats = {
    perfects: prev.stats.perfects + (pct === 100 ? 1 : 0),
    totalCorrect: prev.stats.totalCorrect + score,
    totalAnswered: prev.stats.totalAnswered + total,
    byType: { ...prev.stats.byType, [input.type]: (prev.stats.byType[input.type] || 0) + 1 },
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

export function badgesByIds(ids: string[]): Badge[] {
  return ids.map((id) => BADGES.find((b) => b.id === id)).filter((b): b is Badge => !!b);
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
