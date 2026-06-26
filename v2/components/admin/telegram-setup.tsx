"use client";
import { useState } from "react";
import { Icon } from "@/components/icon";

export function TelegramSetup() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function setup() {
    setBusy(true);
    setMsg("Telegram wird verbunden …");
    try {
      const r = await fetch("/api/tg-setup", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      const ok = r.ok && j?.setWebhook?.ok && j?.setMyCommands?.ok && j?.setDefaultMenuButton?.ok;
      setMsg(ok ? "Telegram ist verbunden. Webhook, Befehle und Menüknopf sind aktuell." : String(j?.error || "Telegram-Setup unvollständig."));
    } catch {
      setMsg("Telegram-Setup nicht erreichbar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-5 rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-bold"><Icon name="send" className="h-4 w-4 text-accent" />Telegram Mini-App</h2>
          <p className="mt-1 text-sm text-muted">Webhook, Bot-Befehle und VEKTRA-Menüknopf synchronisieren.</p>
        </div>
        <button type="button" disabled={busy} onClick={setup}
          className="min-h-11 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg disabled:opacity-50">
          {busy ? "Verbindet …" : "Telegram verbinden"}
        </button>
      </div>
      {msg && <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">{msg}</p>}
    </section>
  );
}
