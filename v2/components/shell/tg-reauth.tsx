"use client";
import { useEffect } from "react";

// Account-Wechsel-Schutz für Telegram: Wenn das aktuell in Telegram angemeldete Konto
// von der Server-Session abweicht, wird mit frischer initData neu authentifiziert und neu geladen.
// Verhindert, dass bei 2 Telegram-Konten auf einem Gerät Konto B die Session von Konto A sieht.
export function TgReauth({ sessionTgUserId }: { sessionTgUserId: number | null }) {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const init: string = tg?.initData || "";
    if (!init) return; // kein Telegram-Kontext (normaler Browser) → nichts tun
    try { tg.ready?.(); } catch { /* ignore */ }
    const curId = tg?.initDataUnsafe?.user?.id;
    if (curId == null) return;
    if (Number(curId) === Number(sessionTgUserId)) return; // gleiches Konto → ok

    // Konto weicht ab (oder Web-Session in Telegram) → neu binden.
    fetch("/api/tg-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ initData: init }) })
      .then((r) => { if (r.ok) location.reload(); })
      .catch(() => { /* ignore */ });
  }, [sessionTgUserId]);

  return null;
}
