// Telegram-Bot-Webhook (in V2 integriert). Logik: lib/bot/handler.mjs.
import { handleUpdate } from "../../../lib/bot/handler.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SECRET = process.env.TG_WEBHOOK_SECRET || "";

export async function GET() {
  return new Response("MAGALOKO Bot Webhook");
}

export async function POST(req) {
  // Telegram-Secret-Token prüfen (gegen Fremd-POSTs)
  if (SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== SECRET) {
    return new Response("unauthorized", { status: 401 });
  }
  let update;
  try { update = await req.json(); } catch { return new Response("OK"); }
  try { await handleUpdate(update); } catch (e) { console.error("[tg-webhook]", e?.message); }
  return new Response("OK"); // Telegram immer 200 (kein Retry-Storm)
}
