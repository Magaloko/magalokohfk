import { db, STATE_ID } from "./supabase-server";
import { type ProcessRun } from "./process-game-core";

export {
  PROCESS_MISSIONS,
  basePointsForProcess,
  processStats,
  scoreRun,
  type ProcessArea,
  type ProcessMission,
  type ProcessRun,
  type ProcessRunStatus,
  type ProcessStats,
} from "./process-game-core";

export async function getProcessRuns(): Promise<ProcessRun[]> {
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  const ws = ((st.workspaces as any)?.hfk?.data || st) as Record<string, unknown>;
  return Array.isArray(ws.processRuns) ? (ws.processRuns as ProcessRun[]) : [];
}
