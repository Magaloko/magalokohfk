import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { db, STATE_ID } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// EINMALIGE Phase-2b-Migration (super-only, idempotent, reversibel via state_history-Snapshot):
// Retail-Hebel (levers ohne phase) -> magoHebel; weeklyKpis -> magoKpis;
// Plan-Hebel (levers mit phase) GELÖSCHT; levers/weeklyKpis geleert.
export async function POST() {
  const sess = await getSession();
  if (!sess || !isSuperAdmin(sess)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const cur = await db().from("app_state").select("data, updated_at").eq("id", STATE_ID).maybeSingle();
  const data = (cur.data?.data || {}) as Record<string, any>;
  const oldUpdatedAt = Number(cur.data?.updated_at || 0);
  const wsRaw = data?.workspaces?.hfk?.data;
  const ws = (wsRaw && typeof wsRaw === "object" && !Array.isArray(wsRaw)) ? wsRaw : data;

  const levers = Array.isArray(ws.levers) ? ws.levers : [];
  const weeklyKpis = Array.isArray(ws.weeklyKpis) ? ws.weeklyKpis : [];
  const alreadyMago = Array.isArray(ws.magoHebel) ? ws.magoHebel : [];
  if (alreadyMago.length > 0 || (levers.length === 0 && weeklyKpis.length === 0)) {
    return NextResponse.json({ ok: true, skipped: true, reason: "already_migrated_or_empty" });
  }

  const retail = levers.filter((l: any) => !l?.phase);
  await db().from("state_history").insert({ updated_at: oldUpdatedAt, client_id: "v2-migrate-2b", data: JSON.parse(JSON.stringify(data)), actor: sess.email });

  ws.magoHebel = retail;
  ws.magoKpis = weeklyKpis;
  ws.levers = [];
  ws.weeklyKpis = [];
  const newUpdatedAt = Date.now();
  data.updatedAt = newUpdatedAt;

  const upd = await db().from("app_state").update({ data, updated_at: newUpdatedAt }).eq("id", STATE_ID).eq("updated_at", oldUpdatedAt).select("updated_at");
  if (upd.error || !upd.data?.length) return NextResponse.json({ error: "write_failed_or_conflict" }, { status: 409 });
  return NextResponse.json({ ok: true, movedHebel: retail.length, deletedPlanHebel: levers.length - retail.length, movedKpis: weeklyKpis.length });
}
