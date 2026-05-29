// Einmaliger Setup-Endpoint: registriert den Telegram-Webhook + Slash-Commands.
// Aufruf: GET /api/tg-setup?key=<TG_WEBHOOK_SECRET>
// Setzt Webhook auf <PUBLIC_URL or VERCEL_URL>/api/tg-webhook mit secret_token.
const TOKEN = process.env.TELEGRAM_TOKEN || "";
const SECRET = process.env.TG_WEBHOOK_SECRET || "";

async function tg(method, params) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params || {})
  });
  return r.json();
}

export default async function handler(req, res) {
  const url = new URL(req.url, "https://x");
  if (!SECRET || url.searchParams.get("key") !== SECRET) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "unauthorized — ?key=<TG_WEBHOOK_SECRET>" }));
    return;
  }
  if (!TOKEN) { res.writeHead(500); res.end(JSON.stringify({ error: "TELEGRAM_TOKEN fehlt" })); return; }
  const base = (process.env.PUBLIC_URL || `https://${process.env.VERCEL_URL || ""}`).replace(/\/$/, "");
  const webhookUrl = `${base}/api/tg-webhook`;
  const results = {};
  results.setWebhook = await tg("setWebhook", {
    url: webhookUrl, secret_token: SECRET, allowed_updates: ["message", "callback_query"], drop_pending_updates: true
  });
  results.setMyCommands = await tg("setMyCommands", {
    commands: [
      { command: "start", description: "Menü & Hilfe" },
      { command: "drill", description: "Zufalls-Quiz mit Buttons" },
      { command: "quiz", description: "Gemischtes Quiz (3–10 Fragen)" },
      { command: "tagesaufgabe", description: "Tägliche 3-Fragen-Challenge" },
      { command: "check", description: "Wissens-Check (Pre/Post)" },
      { command: "fortschritt", description: "Skill-Profil & Lernzuwachs" },
      { command: "marke", description: "Marken-Steckbrief" },
      { command: "einwand", description: "Einwand-Antwort suchen" },
      { command: "persona", description: "Kunden-Typ" },
      { command: "rollenspiel", description: "Trainings-Szenario" },
      { command: "score", description: "Dein Lern-Fortschritt" },
      { command: "lern", description: "Dem Bot etwas beibringen" },
      { command: "frag", description: "KI-Assistent (falls freigeschaltet)" },
      { command: "myid", description: "Deine Telegram-ID anzeigen" }
    ]
  });
  results.webhookUrl = webhookUrl;
  results.getWebhookInfo = await tg("getWebhookInfo", {});
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(results, null, 2));
}
