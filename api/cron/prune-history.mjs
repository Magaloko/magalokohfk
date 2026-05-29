// Cron: hält state_history auf die letzten 50 Snapshots (Speicher begrenzen).
// Läuft via Vercel Cron (vercel.json) täglich; schreibt Heartbeat in scheduled_jobs.
// Schutz: wenn CRON_SECRET gesetzt ist, muss Vercel den Bearer-Header mitschicken.
import { db, runJob } from "../../lib/db.mjs";

const KEEP = 50;
const CRON_SECRET = process.env.CRON_SECRET || "";

export default async function handler(req, res) {
  if (CRON_SECRET && req.headers["authorization"] !== `Bearer ${CRON_SECRET}`) {
    res.writeHead(401); res.end("unauthorized"); return;
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
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(out));
  } catch (e) {
    console.error("[cron/prune-history]", e?.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "prune failed" }));
  }
}
