import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth-helpers";
import { patchItem } from "@/lib/cockpit-write";
import { QA_FIELDS } from "@/lib/qa-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Übernimmt eine korrigierte Fassung in genau EIN erlaubtes Feld (admin-only, Allowlist-gesichert).
export async function POST(req: NextRequest) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { collection?: string; id?: string; field?: string; value?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const collection = String(body?.collection || "");
  const field = String(body?.field || "");
  const id = String(body?.id || "");
  const value = String(body?.value ?? "").slice(0, 6000).trim();

  // Strikte Allowlist: nur bekannte Sammlung+Feld-Kombinationen dürfen geschrieben werden.
  if (!QA_FIELDS[collection]?.includes(field)) return NextResponse.json({ error: "bad_target" }, { status: 400 });
  if (!id || !value) return NextResponse.json({ error: "empty" }, { status: 400 });

  const r = await patchItem(collection, id, { [field]: value });
  if (!r.ok) return NextResponse.json({ error: r.error || "save_failed" }, { status: r.error === "noop" ? 404 : 500 });
  return NextResponse.json({ ok: true, updatedAt: r.updatedAt });
}
