import { db, STATE_ID } from "./supabase-server";

// Wie viele state_history-Snapshots die History lädt. Bewusst klein: jeder Snapshot ist der
// komplette App-State-jsonb — 120 wären mehrere MB Transfer/Parse pro Request (Perf, Phase 2a).
const HISTORY_SNAPSHOTS = 20;

export type HistoryChange = { label: string; from: string; to: string };
export type HistoryEvent = { at: number; kind: "created" | "changed"; changes: HistoryChange[]; by?: string };
export type FieldSpec = { key: string; label: string };

// Rohe Actor-Kennungen (session.email) zu lesbaren, DSGVO-schonenden Labels auflösen.
async function resolveActors(actors: Set<string>): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const uids: number[] = [];
  for (const a of actors) {
    if (a === "web:admin") map[a] = "Admin";
    else if (a === "system" || a === "v2-cockpit") map[a] = "System";
    else { const m = /tg:(\d+)/.exec(a); if (m) { uids.push(Number(m[1])); map[a] = "Mitarbeiter"; } else map[a] = a; }
  }
  if (uids.length) {
    try {
      const { data } = await db().from("bot_users").select("uid, name, role").in("uid", uids);
      for (const r of (data || []) as any[]) {
        const nm = r.name || (r.role === "admin" ? "Admin" : "Mitarbeiter");
        for (const a of actors) if (a.includes(`tg:${r.uid}`)) map[a] = nm;
      }
    } catch { /* best-effort */ }
  }
  return map;
}

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
    const [snaps, cur] = await Promise.all([
      db().from("state_history").select("updated_at, data, actor").order("updated_at", { ascending: true }).limit(HISTORY_SNAPSHOTS),
      db().from("app_state").select("data, updated_at").eq("id", STATE_ID).maybeSingle(),
    ]);

    const versions: { at: number; item: Record<string, any> | undefined; actor?: string }[] = [];
    for (const s of (snaps.data || [])) versions.push({ at: Number((s as any).updated_at) || 0, item: findItem((s as any).data, collection, id), actor: (s as any).actor || undefined });
    versions.push({ at: Number(cur.data?.updated_at) || Date.now(), item: findItem(cur.data?.data, collection, id), actor: undefined });

    // Roh-Events sammeln; der Verursacher einer Änderung steht auf dem VORHERIGEN Snapshot (dieser Write hat ihn geschrieben).
    type Raw = { at: number; kind: "created" | "changed"; changes: HistoryChange[]; actor?: string };
    const raw: Raw[] = [];
    let prev: Record<string, any> | undefined;
    let first = true;
    let lastActor: string | undefined;
    for (const v of versions) {
      const item = v.item;
      const by = lastActor; // Actor, der DIESE Version erzeugt hat
      if (item && !prev) {
        if (!first) raw.push({ at: v.at, kind: "created", changes: [], actor: by });
      } else if (item && prev) {
        const changes: HistoryChange[] = [];
        for (const f of fields) if (fmt(prev[f.key]) !== fmt(item[f.key])) changes.push({ label: f.label, from: fmt(prev[f.key]), to: fmt(item[f.key]) });
        if (changes.length) raw.push({ at: v.at, kind: "changed", changes, actor: by });
      }
      prev = item;
      first = false;
      lastActor = v.actor;
    }

    const labels = await resolveActors(new Set(raw.map((r) => r.actor).filter((a): a is string => !!a)));
    const events: HistoryEvent[] = raw.map((r) => ({ at: r.at, kind: r.kind, changes: r.changes, by: r.actor ? labels[r.actor] : undefined }));
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

// === Org-weiter Aktivitäts-Feed (alle Hebel/Tasks/Entscheidungen) ===
export type ActivityItem = { at: number; by?: string; type: string; title: string; href: string; kind: "created" | "changed"; changes: HistoryChange[] };

const ACT_CONF = [
  { collection: "tasks", type: "Task", titleKey: "title", path: "tasks", fields: TASK_FIELDS },
  { collection: "stephanDecisions", type: "Entscheidung", titleKey: "titel", path: "entscheidungen", fields: DECISION_FIELDS },
];

function byId(data: any, collection: string): Record<string, Record<string, any>> {
  const arr = container(data)?.[collection];
  const map: Record<string, Record<string, any>> = {};
  if (Array.isArray(arr)) for (const it of arr) if (it && it.id != null) map[String(it.id)] = it;
  return map;
}

export async function getRecentActivity(limit = 40): Promise<ActivityItem[]> {
  try {
    const [snaps, cur] = await Promise.all([
      db().from("state_history").select("updated_at, data, actor").order("updated_at", { ascending: true }).limit(HISTORY_SNAPSHOTS),
      db().from("app_state").select("data, updated_at").eq("id", STATE_ID).maybeSingle(),
    ]);
    const versions: { at: number; data: any; actor?: string }[] = [];
    for (const s of (snaps.data || [])) versions.push({ at: Number((s as any).updated_at) || 0, data: (s as any).data, actor: (s as any).actor || undefined });
    versions.push({ at: Number(cur.data?.updated_at) || Date.now(), data: cur.data?.data, actor: undefined });

    const out: (ActivityItem & { _actor?: string })[] = [];
    for (let i = 0; i + 1 < versions.length; i++) {
      const A = versions[i], B = versions[i + 1];
      const by = A.actor; // der Write, der B erzeugt hat, hat A gesnapshottet
      for (const cfg of ACT_CONF) {
        const a = byId(A.data, cfg.collection), b = byId(B.data, cfg.collection);
        for (const id of Object.keys(b)) {
          const item = b[id], prev = a[id];
          const href = `/cockpit/${cfg.path}/${encodeURIComponent(id)}`;
          const title = fmt(item[cfg.titleKey]) || cfg.type;
          if (!prev) {
            out.push({ at: B.at, type: cfg.type, title, href, kind: "created", changes: [], _actor: by });
          } else {
            const changes: HistoryChange[] = [];
            for (const f of cfg.fields) if (fmt(prev[f.key]) !== fmt(item[f.key])) changes.push({ label: f.label, from: fmt(prev[f.key]), to: fmt(item[f.key]) });
            if (changes.length) out.push({ at: B.at, type: cfg.type, title, href, kind: "changed", changes, _actor: by });
          }
        }
      }
    }
    out.sort((x, y) => y.at - x.at);
    const top = out.slice(0, limit);
    const labels = await resolveActors(new Set(top.map((e) => e._actor).filter((a): a is string => !!a)));
    return top.map(({ _actor, ...e }) => ({ ...e, by: _actor ? labels[_actor] : undefined }));
  } catch { return []; }
}
