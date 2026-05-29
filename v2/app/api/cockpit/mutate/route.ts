import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth-helpers";
import { createItem, patchItem, deleteItem } from "@/lib/cockpit-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Erlaubte Sammlungen + ihre erlaubten Felder + id-Präfix.
const SPEC: Record<string, { fields: string[]; prefix: string }> = {
  tasks: { fields: ["title", "area", "status", "priority", "impact", "effort", "owner", "dueDate", "notes"], prefix: "t" },
  stephanDecisions: { fields: ["titel", "status", "kategorie", "frist", "empfehlung"], prefix: "d" },
};

function clean(spec: { fields: string[] }, input: unknown): Record<string, unknown> {
  const o = (input || {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of spec.fields) {
    if (o[f] === undefined || o[f] === null) continue;
    out[f] = String(o[f]).slice(0, 4000);
  }
  return out;
}

export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { collection?: string; action?: string; id?: string; item?: unknown; patch?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const spec = body?.collection ? SPEC[body.collection] : undefined;
  if (!spec) return NextResponse.json({ error: "bad_collection" }, { status: 400 });
  const collection = body!.collection as string;

  let res;
  if (body.action === "create") {
    const item = clean(spec, body.item);
    if (!Object.keys(item).length) return NextResponse.json({ error: "empty" }, { status: 400 });
    res = await createItem(collection, item, spec.prefix);
  } else if (body.action === "update") {
    if (!body.id) return NextResponse.json({ error: "no_id" }, { status: 400 });
    const patch = clean(spec, body.patch);
    if (!Object.keys(patch).length) return NextResponse.json({ error: "empty" }, { status: 400 });
    res = await patchItem(collection, String(body.id), patch);
  } else if (body.action === "delete") {
    if (!body.id) return NextResponse.json({ error: "no_id" }, { status: 400 });
    res = await deleteItem(collection, String(body.id));
  } else {
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  }

  if (!res.ok) {
    const code = res.error === "conflict" ? 409 : res.error === "anti-wipe" ? 409 : res.error === "noop" ? 404 : 500;
    return NextResponse.json({ error: res.error }, { status: code });
  }
  return NextResponse.json({ ok: true, updatedAt: res.updatedAt });
}
