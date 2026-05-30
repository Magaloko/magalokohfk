import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin, isSuperAdmin } from "@/lib/auth-helpers";
import { createItem, patchItem, replaceItem, deleteItem } from "@/lib/cockpit-write";
import { STRUCTURED } from "@/lib/struct-sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Sammlungen mit festem Feld-Schema (Strings + optional numerische Felder).
const SPEC: Record<string, { fields: string[]; numeric?: string[]; prefix: string }> = {
  tasks: { fields: ["title", "area", "phase", "status", "priority", "impact", "effort", "owner", "dueDate", "notes"], prefix: "t" },
  stephanDecisions: { fields: ["titel", "status", "kategorie", "frist", "empfehlung"], prefix: "d" },
  levers: { fields: ["title", "area", "status", "confidence", "risk", "description", "notes", "startDate", "finishDate"], numeric: ["expectedImpactEur", "effortHours"], prefix: "l" },
  calendarEvents: { fields: ["title", "date", "time", "kind", "notes"], prefix: "ev" },
  umsetzungItems: { fields: ["typ", "titel", "status", "wer", "phase", "datum", "notiz"], prefix: "ums" },
  // Akademie-Inhalte (flach) — admin-only Pflege
  salesObjections: { fields: ["einwand", "kategorie", "antwort", "beweis"], prefix: "obj" },
  consultingServices: { fields: ["name", "dauer", "preis", "zielgruppe", "inhalt", "ergebnis"], prefix: "svc" },
  salesPersonas: { fields: ["name", "avatar", "alter", "kontext", "zitat", "einwaendeTypisch", "schmerzpunkte", "werte", "budget"], prefix: "p" },
  // Magos privater Bereich (super-admin-only — siehe Gate in POST)
  magoLog: { fields: ["datum", "titel", "kategorie", "status", "bezug", "beschreibung"], prefix: "mlog" },
  magoBewertung: { fields: ["datum", "phase", "stimmung", "notiz", "offenePunkte"], numeric: ["score"], prefix: "mbew" },
  magoZeit: { fields: ["datum", "taetigkeit", "bezug", "notiz"], numeric: ["stunden", "satz"], prefix: "mzeit" },
  magoMeilensteine: { fields: ["titel", "phase", "status", "datumZiel", "datumAbnahme", "notiz"], prefix: "mms" },
};
const DYNAMIC = new Set(["weeklyKpis"]); // dynamische Metrik-Felder
const KPI_PREFIX = "kpi";
const KPI_STRINGS = new Set(["weekStart", "weekLabel", "label", "notes"]);

function cleanFixed(spec: { fields: string[]; numeric?: string[] }, input: unknown): Record<string, unknown> {
  const o = (input || {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of spec.fields) {
    if (o[f] === undefined || o[f] === null) continue;
    out[f] = String(o[f]).slice(0, 4000);
  }
  for (const f of spec.numeric || []) {
    if (o[f] === undefined || o[f] === null || o[f] === "") continue;
    const n = Number(o[f]);
    if (Number.isFinite(n)) out[f] = n;
  }
  return out;
}

// KPIs: weekStart/weekLabel als String, restliche Keys numerisch (sonst String), begrenzt.
function cleanKpi(input: unknown): Record<string, unknown> {
  const o = (input || {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  let count = 0;
  for (const [k0, v] of Object.entries(o)) {
    if (k0 === "id") continue;
    const k = k0.slice(0, 60);
    if (!k || v === undefined || v === null || v === "") continue;
    if (++count > 60) break;
    if (KPI_STRINGS.has(k)) { out[k] = String(v).slice(0, 200); continue; }
    const n = Number(v);
    out[k] = Number.isFinite(n) && String(v).trim() !== "" ? n : String(v).slice(0, 200);
  }
  return out;
}

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { collection?: string; action?: string; id?: string; item?: unknown; patch?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const collection = body?.collection || "";
  // Magos privater Bereich darf nur der Super-Admin (Mago) schreiben.
  if (collection.startsWith("mago") && !isSuperAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const spec = SPEC[collection];
  const isDyn = DYNAMIC.has(collection);
  const struct = STRUCTURED[collection];
  if (!spec && !isDyn && !struct) return NextResponse.json({ error: "bad_collection" }, { status: 400 });

  // Strukturierte Sammlungen (Szenarien/Rollenspiele): create/replace/delete mit Deep-Sanitizer.
  if (struct) {
    if (body.action === "delete") {
      if (!body.id) return NextResponse.json({ error: "no_id" }, { status: 400 });
      const r = await deleteItem(collection, String(body.id), sess.email);
      return finish(r);
    }
    if (body.action === "create" || body.action === "replace") {
      const item = struct.fn(body.action === "create" ? body.item : body.item);
      if (!String(item[struct.required] || "").trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
      const r = body.action === "create"
        ? await createItem(collection, item, struct.prefix, sess.email)
        : (body.id ? await replaceItem(collection, String(body.id), item, sess.email) : { ok: false, error: "no_id" as const });
      return finish(r);
    }
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  }

  const clean = (v: unknown) => (isDyn ? cleanKpi(v) : cleanFixed(spec, v));
  const prefix = isDyn ? KPI_PREFIX : spec.prefix;

  let res;
  if (body.action === "create") {
    const item = clean(body.item);
    if (!Object.keys(item).length) return NextResponse.json({ error: "empty" }, { status: 400 });
    res = await createItem(collection, item, prefix, sess.email);
  } else if (body.action === "update") {
    if (!body.id) return NextResponse.json({ error: "no_id" }, { status: 400 });
    const patch = clean(body.patch);
    if (!Object.keys(patch).length) return NextResponse.json({ error: "empty" }, { status: 400 });
    res = await patchItem(collection, String(body.id), patch, sess.email);
  } else if (body.action === "replace") {
    if (!body.id) return NextResponse.json({ error: "no_id" }, { status: 400 });
    const item = clean(body.item);
    if (!Object.keys(item).length) return NextResponse.json({ error: "empty" }, { status: 400 });
    res = await replaceItem(collection, String(body.id), item, sess.email);
  } else if (body.action === "delete") {
    if (!body.id) return NextResponse.json({ error: "no_id" }, { status: 400 });
    res = await deleteItem(collection, String(body.id), sess.email);
  } else {
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  }

  return finish(res);
}

function finish(res: { ok: boolean; error?: string; updatedAt?: number }) {
  if (!res.ok) {
    const code = res.error === "conflict" || res.error === "anti-wipe" ? 409
      : res.error === "noop" ? 404
      : res.error === "no_id" ? 400
      : 500;
    return NextResponse.json({ error: res.error }, { status: code });
  }
  return NextResponse.json({ ok: true, updatedAt: res.updatedAt });
}
