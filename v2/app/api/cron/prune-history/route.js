// Cron: hält state_history auf die letzten 50 Snapshots. Täglich via Vercel Cron (vercel.json).
import { db, runJob } from "../../../../lib/bot/db.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const KEEP = 50;
const CRON_SECRET = process.env.CRON_SECRET || "";

export async function GET(req) {
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return new Response("unauthorized", { status: 401 });
  }
  try {
    const out = await runJob("prune-history", async () => {
      const { data } = await db.from("state_history").select("id").order("id", { ascending: false }).limit(KEEP);
      if (data && data.length === KEEP) {
        const cutoff = data[data.length - 1].id;
        await db.from("state_history").delete().lt("id", cutoff);
        return { kept: KEEP, deletedBelowId: cutoff };
      }
      return { kept: data?.length || 0, deleted: 0 };
    });
    return Response.json(out);
  } catch (e) {
    console.error("[cron/prune-history]", e?.message);
    return Response.json({ error: "prune failed" }, { status: 500 });
  }
}
