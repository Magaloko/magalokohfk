import { db, STATE_ID } from "./supabase-server";

export type HistoryChange = { label: string; from: string; to: string };
export type HistoryEvent = { at: number; kind: "created" | "changed"; changes: HistoryChange[] };
export type FieldSpec = { key: string; label: string };

// Container wie die Reads auflösen (workspaces.hfk.data bevorzugt, sonst top-level).
function container(d: any): Record<string, any> {
  const ws = d?.workspaces?.hfk?.data;
  return ws && typeof ws === "object" && !Array.isArray(ws) ? ws : (d || {});
}
function findItem(data: any, collection: string, id: string): Record<string, any> | undefined {
  const arr = container(data)?.[collection];
  if (!Array.isArray(arr)) return undefined;
  const byId = arr.find((x) => x && x.id != null && String(x.id) === id);
  if (byId) return byId;
  if (/^\d+$/.test(id)) { const i = Number(id); if (i >= 0 && i < arr.length) return arr[i]; }
  return undefined;
}
function fmt(v: unknown): string {
  if (v == null || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString("de-AT");
  return String(v).slice(0, 200);
}

// Baut die Änderungs-Historie eines Datensatzes aus den state_history-Snapshots (alt) + aktuellem Stand.
export async function getRecordHistory(collection: string, id: string, fields: FieldSpec[]): Promise<HistoryEvent[]> {
  try {
    const snaps = await db().from("state_history").select("updated_at, data").order("updated_at", { ascending: true }).limit(120);
    const cur = await db().from("app_state").select("data, updated_at").eq("id", STATE_ID).maybeSingle();

    const versions: { at: number; item: Record<string, any> | undefined }[] = [];
    for (const s of (snaps.data || [])) versions.push({ at: Number((s as any).updated_at) || 0, item: findItem((s as any).data, collection, id) });
    versions.push({ at: Number(cur.data?.updated_at) || Date.now(), item: findItem(cur.data?.data, collection, id) });

    const events: HistoryEvent[] = [];
    let prev: Record<string, any> | undefined;
    let first = true;
    for (const v of versions) {
      const item = v.item;
      if (item && !prev) {
        // taucht (wieder) auf — „angelegt“ nur, wenn nicht schon in der allerersten Version vorhanden
        if (!first) events.push({ at: v.at, kind: "created", changes: [] });
      } else if (item && prev) {
        const changes: HistoryChange[] = [];
        for (const f of fields) if (fmt(prev[f.key]) !== fmt(item[f.key])) changes.push({ label: f.label, from: fmt(prev[f.key]), to: fmt(item[f.key]) });
        if (changes.length) events.push({ at: v.at, kind: "changed", changes });
      }
      prev = item;
      first = false;
    }
    return events.reverse(); // neueste zuerst
  } catch { return []; }
}

export const LEVER_FIELDS: FieldSpec[] = [
  { key: "status", label: "Status" }, { key: "title", label: "Titel" }, { key: "area", label: "Bereich" },
  { key: "expectedImpactEur", label: "Impact €/J" }, { key: "effortHours", label: "Aufwand (h)" },
  { key: "confidence", label: "Confidence" }, { key: "risk", label: "Risiko" },
  { key: "startDate", label: "Start" }, { key: "finishDate", label: "Ziel" },
  { key: "description", label: "Beschreibung" }, { key: "notes", label: "Notiz" },
];
export const TASK_FIELDS: FieldSpec[] = [
  { key: "status", label: "Status" }, { key: "title", label: "Titel" }, { key: "area", label: "Bereich" },
  { key: "priority", label: "Priorität" }, { key: "impact", label: "Impact" }, { key: "effort", label: "Aufwand" },
  { key: "owner", label: "Verantwortlich" }, { key: "dueDate", label: "Fällig" }, { key: "notes", label: "Notiz" },
];
export const DECISION_FIELDS: FieldSpec[] = [
  { key: "status", label: "Status" }, { key: "titel", label: "Titel" }, { key: "kategorie", label: "Kategorie" },
  { key: "frist", label: "Frist" }, { key: "empfehlung", label: "Empfehlung" },
];
