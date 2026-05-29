import { db, STATE_ID } from "./supabase-server";

export type Task = { id?: string; title?: string; area?: string; status?: string; priority?: string; impact?: string; effort?: string; owner?: string; dueDate?: string; notes?: string };
export type Lever = { id?: string; title?: string; area?: string; status?: string; expectedImpactEur?: number; effortHours?: number; confidence?: string; risk?: string; startDate?: string; finishDate?: string };
export type StaffMember = { name?: string; completedScenarios?: { scenarioId?: string; titel?: string; score?: number; completedAt?: string }[]; strengths?: string; weaknesses?: string };
export type WeeklyKpi = { id?: string; weekStart?: string; weekLabel?: string } & Record<string, unknown>;
export type Decision = { id?: string; titel?: string; status?: string; frist?: string; kategorie?: string; empfehlung?: string };
export type CalendarEvent = { id?: string; title?: string; date?: string; time?: string; kind?: string; notes?: string };

export type CockpitData = {
  tasks: Task[];
  levers: Lever[];
  weeklyKpis: WeeklyKpi[];
  decisions: Decision[];
  calendarEvents: CalendarEvent[];
  staffTraining: StaffMember[];
};

const CONF: Record<string, number> = { hoch: 1, mittel: 0.7, niedrig: 0.4 };
const RISK: Record<string, number> = { niedrig: 1, mittel: 0.8, hoch: 0.5 };

// ROI-Score eines Hebels (wie Live: (Impact/Stunden)·Confidence·Risk).
export function leverScore(l: Lever): number {
  const hours = Math.max(Number(l.effortHours) || 0, 1);
  const impact = Number(l.expectedImpactEur) || 0;
  return (impact / hours) * (CONF[l.confidence || ""] ?? 0.7) * (RISK[l.risk || ""] ?? 0.8);
}

export function formatEur(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n) || !n) return "—";
  return "€" + n.toLocaleString("de-AT", { maximumFractionDigits: 0 });
}

let _cache: { data: CockpitData; ts: number } | null = null;

export async function getCockpitData(): Promise<CockpitData> {
  if (_cache && Date.now() - _cache.ts < 500) return _cache.data;
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  const ws = ((st.workspaces as any)?.hfk?.data || st) as Record<string, unknown>;
  const arr = <T,>(k: string): T[] => (Array.isArray(ws[k]) ? (ws[k] as T[]) : []);
  const out: CockpitData = {
    tasks: arr<Task>("tasks"),
    levers: arr<Lever>("levers"),
    weeklyKpis: arr<WeeklyKpi>("weeklyKpis"),
    decisions: arr<Decision>("stephanDecisions"),
    calendarEvents: arr<CalendarEvent>("calendarEvents"),
    staffTraining: arr<StaffMember>("staffTraining"),
  };
  _cache = { data: out, ts: Date.now() };
  return out;
}

export const isTaskOpen = (t: Task) => (t.status || "") !== "Erledigt";
export const isLeverActive = (l: Lever) => l.status !== "Live" && l.status !== "Verworfen";

// Neueste KPI-Wochen zuerst.
export function sortedWeeks(weeks: WeeklyKpi[]): WeeklyKpi[] {
  return [...weeks].sort((a, b) => String(b.weekStart || "").localeCompare(String(a.weekStart || "")));
}
