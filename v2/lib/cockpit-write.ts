import { db, STATE_ID } from "./supabase-server";

// Geschützte Sammlungen (wie Live): ein Write von >=3 auf 0 wird blockiert.
const PROTECTED = [
  "akademieDrills", "akademieMarken", "salesObjections", "salesPersonas",
  "akademieRoleplays", "trainingScenarios", "consultingServices",
  "tasks", "knowledgeCards", "glossary",
  "magoHebel", "magoKpis",
  "mastermindAntworten", "mastermindVorgaenge", "mastermindToolStatus",
  "processRuns",
];
const len = (o: any, k: string) => (Array.isArray(o?.[k]) ? o[k].length : 0);

function antiWipe(current: any, incoming: any): string | null {
  const curWs = current?.workspaces?.hfk?.data || {};
  const inWs = incoming?.workspaces?.hfk?.data || {};
  for (const k of PROTECTED) {
    if (len(current, k) >= 3 && len(incoming, k) === 0) return k;
    if (len(curWs, k) >= 3 && len(inWs, k) === 0) return `workspaces.hfk.data.${k}`;
  }
  return null;
}

async function snapshot(old: any, updatedAt: number, actor?: string) {
  try {
    if (old && typeof old === "object") {
      await db().from("state_history").insert({ updated_at: Number(updatedAt) || 0, client_id: "v2-cockpit", data: old, actor: actor || "system" });
    }
  } catch { /* best-effort */ }
}

// Container exakt wie die Reads auflösen (workspaces.hfk.data, sonst top-level).
function containerOf(data: any): Record<string, unknown> {
  const ws = data?.workspaces?.hfk?.data;
  return ws && typeof ws === "object" && !Array.isArray(ws) ? ws : data;
}

export type MutateResult = { ok: boolean; error?: string; updatedAt?: number };

// Liest app_state, wendet fn auf die Sammlung an, schreibt bedingt zurück (Optimistic-Lock + Retry).
// fn bekommt eine Kopie des Arrays und gibt das neue Array zurück (oder null = kein Write).
export async function mutateCollection(
  collection: string,
  fn: (items: any[]) => any[] | null,
  actor?: string,
): Promise<MutateResult> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const cur = await db().from("app_state").select("data, updated_at").eq("id", STATE_ID).maybeSingle();
    const data = (cur.data?.data || {}) as Record<string, any>;
    const oldUpdatedAt = Number(cur.data?.updated_at || 0);
    const old = JSON.parse(JSON.stringify(data));

    const container = containerOf(data);
    const arr = Array.isArray(container[collection]) ? (container[collection] as any[]) : [];
    const next = fn(arr.map((x) => ({ ...x })));
    if (next === null) return { ok: false, error: "noop" };
    container[collection] = next;

    const newUpdatedAt = Date.now();
    data.updatedAt = newUpdatedAt;

    const wiped = antiWipe(old, data);
    if (wiped) return { ok: false, error: "anti-wipe" };

    await snapshot(old, oldUpdatedAt, actor);

    const upd = await db().from("app_state")
      .update({ data, updated_at: newUpdatedAt })
      .eq("id", STATE_ID).eq("updated_at", oldUpdatedAt).select("updated_at");
    if (upd.error) return { ok: false, error: "write_failed" };
    if (upd.data && upd.data.length) return { ok: true, updatedAt: newUpdatedAt };
    // 0 Zeilen → jemand anderes hat zwischenzeitlich geschrieben → neu lesen & erneut versuchen
  }
  return { ok: false, error: "conflict" };
}

export function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// Item per id finden, sonst per Index (Fallback für id-lose Items aus Altdaten).
function locate(items: any[], idOrIdx: string): number {
  const byId = items.findIndex((x) => x && x.id && String(x.id) === idOrIdx);
  if (byId >= 0) return byId;
  if (/^\d+$/.test(idOrIdx)) { const i = Number(idOrIdx); if (i >= 0 && i < items.length) return i; }
  return -1;
}

export async function createItem(collection: string, item: Record<string, unknown>, idPrefix: string, actor?: string): Promise<MutateResult> {
  const withId = { id: genId(idPrefix), ...item };
  return mutateCollection(collection, (items) => [withId, ...items], actor);
}

export async function patchItem(collection: string, idOrIdx: string, patch: Record<string, unknown>, actor?: string): Promise<MutateResult> {
  return mutateCollection(collection, (items) => {
    const i = locate(items, idOrIdx);
    if (i < 0) return null;
    items[i] = { ...items[i], ...patch };
    return items;
  }, actor);
}

// Ersetzt ein Item vollständig (id bleibt erhalten) — z. B. für KPIs mit dynamischen Metriken.
export async function replaceItem(collection: string, idOrIdx: string, item: Record<string, unknown>, actor?: string): Promise<MutateResult> {
  return mutateCollection(collection, (items) => {
    const i = locate(items, idOrIdx);
    if (i < 0) return null;
    items[i] = { id: items[i]?.id, ...item };
    return items;
  }, actor);
}

export async function deleteItem(collection: string, idOrIdx: string, actor?: string): Promise<MutateResult> {
  return mutateCollection(collection, (items) => {
    const i = locate(items, idOrIdx);
    if (i < 0) return null;
    items.splice(i, 1);
    return items;
  }, actor);
}
