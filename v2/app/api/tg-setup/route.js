// Einmaliger Setup-Endpoint: registriert den Telegram-Webhook auf DIESE (V2-)Domain.
// Aufruf: GET /api/tg-setup?key=<TG_WEBHOOK_SECRET>
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN = process.env.TELEGRAM_TOKEN || "";
const SECRET = process.env.TG_WEBHOOK_SECRET || "";

async function tg(method, params) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params || {}),
  });
  return r.json();
}

export async function GET(req) {
  const url = new URL(req.url);
  const keyAllowed = Boolean(SECRET && url.searchParams.get("key") === SECRET);
  const sessionAllowed = isAdmin(await getSession());
  if (!keyAllowed && !sessionAllowed) {
    return Response.json({ error: "unauthorized — ?key=<TG_WEBHOOK_SECRET>" }, { status: 401 });
  }
  if (!TOKEN) return Response.json({ error: "TELEGRAM_TOKEN fehlt" }, { status: 500 });

  // Webhook auf die aufrufende Domain (V2) setzen.
  const base = (process.env.WEBAPP_URL || process.env.PUBLIC_URL || url.origin).replace(/\/$/, "");
  const webhookUrl = `${base}/api/tg-webhook`;
  const results = {};
  results.setWebhook = await tg("setWebhook", {
    url: webhookUrl, secret_token: SECRET, allowed_updates: ["message", "callback_query"], drop_pending_updates: true,
  });
  results.setMyCommands = await tg("setMyCommands", {
    commands: [
      { command: "start", description: "Menü & Hilfe" },
      { command: "drill", description: "Zufallsübung mit Buttons" },
      { command: "quiz", description: "Gemischtes Quiz (3–10 Fragen)" },
      { command: "tagesaufgabe", description: "Tägliche 3-Fragen-Aufgabe" },
      { command: "check", description: "Wissens-Check (Pre/Post)" },
      { command: "fortschritt", description: "Skill-Profil & Lernzuwachs" },
      { command: "marke", description: "Marken-Steckbrief" },
      { command: "einwand", description: "Einwand-Antwort suchen" },
      { command: "persona", description: "Kunden-Typ" },
      { command: "rollenspiel", description: "Trainings-Szenario" },
      { command: "score", description: "Dein Lern-Fortschritt" },
      { command: "lern", description: "Dem Bot etwas beibringen" },
      { command: "frag", description: "KI-Assistent (falls freigeschaltet)" },
      { command: "myid", description: "Deine Telegram-ID anzeigen" },
    ],
  });
  results.setDefaultMenuButton = await tg("setChatMenuButton", {
    menu_button: { type: "web_app", text: "VEKTRA", web_app: { url: `${base}/akademie` } },
  });
  results.webhookUrl = webhookUrl;
  results.getWebhookInfo = await tg("getWebhookInfo", {});
  return Response.json(results);
}
