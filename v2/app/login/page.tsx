"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export default function LoginPage() {
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [localDev, setLocalDev] = useState(process.env.NODE_ENV !== "production");

  // Telegram-Auto-Login + Redirect wenn bereits eingeloggt.
  // telegram-web-app.js lädt async → wir pollen kurz auf window.Telegram.WebApp.initData,
  // bevor wir das Web-Login-Formular als Fallback zeigen.
  useEffect(() => {
    setLocalDev(["localhost", "127.0.0.1", "::1"].includes(window.location.hostname));
    let done = false;
    let tries = 0;
    let iv: ReturnType<typeof setInterval> | null = null;
    const tryTg = async (): Promise<boolean> => {
      const tg = (window as any).Telegram?.WebApp;
      const init: string = tg?.initData || "";
      if (!init) return false;
      done = true;
      if (iv) clearInterval(iv);
      try { tg.ready(); tg.expand?.(); } catch { /* ignore */ }
      setMsg("Telegram-Login läuft …");
      try {
        const r = await fetch("/api/tg-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ initData: init }) });
        const j = await r.json().catch(() => ({}));
        if (r.ok) { location.replace("/"); return true; }
        setMsg(String(j?.error || "Kein Zugriff — bitte bei Mago melden."));
      } catch { setMsg("Verbindungsfehler."); }
      return true;
    };
    void tryTg();
    iv = setInterval(() => {
      tries += 1;
      void tryTg();
      if (tries > 100 && iv) {
        clearInterval(iv);
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.platform && tg.platform !== "unknown" && !done) setMsg("Telegram-Daten fehlen. Bitte die App über den Menüknopf im Bot öffnen.");
      }
    }, 100);
    // Falls schon eine gültige Session existiert (Web), direkt weiter.
    fetch("/auth/status").then((r) => r.json()).then((s) => { if (s.authenticated && !done) { if (iv) clearInterval(iv); location.replace("/"); } }).catch(() => {});
    return () => { if (iv) clearInterval(iv); };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pass) return;
    setBusy(true); setMsg("Anmeldung läuft …");
    try {
      const r = await fetch("/api/web-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { location.replace("/"); return; }
      setMsg(String(j?.error || (r.status === 429 ? "Zu viele Versuche — in 15 Min erneut." : "Falsches Passwort / Code.")));
    } catch { setMsg("Verbindungsfehler."); }
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-7 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/20 text-lg font-extrabold text-accent">V</div>
          <div><div className="text-lg font-extrabold">VEKTRA</div><div className="text-xs text-muted-2">HFK-Verkaufstraining</div></div>
        </div>
        <p className="mb-4 text-sm text-muted">
          Lokal kannst du direkt als Mago oder Codex rein. Produktiv bleibt der Login per Admin-Passwort, persönlichem Code oder Telegram.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passwort / Zugangscode" aria-label="Passwort oder Zugangscode" autoComplete="current-password"
            className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-ink outline-none focus:border-accent" />
          <button disabled={busy} className="rounded-lg bg-accent px-4 py-3 font-semibold text-bg disabled:opacity-60">Anmelden</button>
        </form>
        {localDev && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">Lokaler Dev-Login</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/api/dev-login?user=mago"
                className="grid min-h-10 place-items-center rounded-lg border border-line bg-surface-2 px-3 text-sm font-semibold text-muted hover:text-ink">Mago</Link>
              <Link href="/api/dev-login?user=codex"
                className="grid min-h-10 place-items-center rounded-lg border border-line bg-surface-2 px-3 text-sm font-semibold text-muted hover:text-ink">Codex</Link>
            </div>
          </div>
        )}
        {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
        <p className="mt-5 inline-flex w-full items-center justify-center gap-1.5 text-xs text-muted-2"><Icon name="lock" className="h-3.5 w-3.5" /> Admin per Passwort · Mitarbeiter per Code</p>
      </div>
    </div>
  );
}
