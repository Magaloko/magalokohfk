"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export default function LoginPage() {
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Telegram-Auto-Login + Redirect wenn bereits eingeloggt.
  // telegram-web-app.js lädt async → wir pollen kurz auf window.Telegram.WebApp.initData,
  // bevor wir das Web-Login-Formular als Fallback zeigen.
  useEffect(() => {
    let done = false;
    let tries = 0;
    const tryTg = (): boolean => {
      const tg = (window as any).Telegram?.WebApp;
      const init: string = tg?.initData || "";
      if (!init) return false;
      done = true;
      try { tg.ready(); tg.expand?.(); } catch { /* ignore */ }
      setMsg("Telegram-Login läuft …");
      fetch("/api/tg-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ initData: init }) })
        .then((r) => { if (r.ok) location.href = "/"; else setMsg("Kein Zugriff — bitte bei Mago melden."); })
        .catch(() => setMsg("Verbindungsfehler."));
      return true;
    };
    if (!tryTg()) {
      const iv = setInterval(() => { tries += 1; if (tryTg() || tries > 25) clearInterval(iv); }, 150);
      // Falls schon eine gültige Session existiert (Web), direkt weiter.
      fetch("/auth/status").then((r) => r.json()).then((s) => { if (s.authenticated && !done) { clearInterval(iv); location.href = "/"; } }).catch(() => {});
      return () => clearInterval(iv);
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pass) return;
    setBusy(true); setMsg("Anmeldung läuft …");
    try {
      const r = await fetch("/api/web-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass }) });
      if (r.ok) { location.href = "/"; return; }
      setMsg(r.status === 429 ? "Zu viele Versuche — in 15 Min erneut." : "Falsches Passwort / Code.");
    } catch { setMsg("Verbindungsfehler."); }
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-7 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/20 text-lg font-extrabold text-accent">M</div>
          <div><div className="text-lg font-extrabold">MAGALOKO</div><div className="text-xs text-muted-2">Cockpit & Akademie</div></div>
        </div>
        <p className="mb-4 text-sm text-muted">Im Browser mit Passwort (Admin) oder persönlichem Zugangscode anmelden. In Telegram öffnet sich alles automatisch.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passwort / Zugangscode" autoComplete="current-password"
            className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-ink outline-none focus:border-accent" />
          <button disabled={busy} className="rounded-lg bg-accent px-4 py-3 font-semibold text-bg disabled:opacity-60">Anmelden</button>
        </form>
        {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
        <p className="mt-5 inline-flex w-full items-center justify-center gap-1.5 text-xs text-muted-2"><Icon name="lock" className="h-3.5 w-3.5" /> Admin per Passwort · Mitarbeiter per Code</p>
      </div>
      <script src="https://telegram.org/js/telegram-web-app.js" async />
    </div>
  );
}
