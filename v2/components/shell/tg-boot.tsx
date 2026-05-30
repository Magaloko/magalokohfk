"use client";
import { useEffect } from "react";

// Telegram-Mini-App-Initialisierung: volle Höhe nutzen, Header/Hintergrund ans helle
// Theme angleichen, exakte Viewport-Höhe als CSS-Var (--tg-vh) bereitstellen und
// versehentliches Schließen beim Scrollen verhindern. Im normalen Browser No-Op.
export function TgBoot() {
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let tries = 0;

    const apply = (): boolean => {
      const tg = (window as any).Telegram?.WebApp;
      if (!tg) return false;
      try { tg.ready?.(); } catch { /* ignore */ }
      try { tg.expand?.(); } catch { /* ignore */ }
      // Helle Theme-Farben für Telegram-Header & -Hintergrund (passt zum App-Theme).
      try { tg.setHeaderColor?.("#ffffff"); } catch { /* ignore */ }
      try { tg.setBackgroundColor?.("#f4f6fb"); } catch { /* ignore */ }
      // Nicht versehentlich schließen, wenn man in Listen/Chats nach unten wischt (neuere Clients).
      try { tg.disableVerticalSwipes?.(); } catch { /* ignore */ }

      const setVh = () => {
        const h = tg.viewportStableHeight || tg.viewportHeight;
        if (h) document.documentElement.style.setProperty("--tg-vh", h + "px");
      };
      setVh();
      try { tg.onEvent?.("viewportChanged", setVh); } catch { /* ignore */ }
      cleanup = () => { try { tg.offEvent?.("viewportChanged", setVh); } catch { /* ignore */ } };
      return true;
    };

    // telegram-web-app.js lädt async → kurz pollen, bis WebApp verfügbar ist.
    if (!apply()) {
      const iv = setInterval(() => { if (apply() || ++tries > 25) clearInterval(iv); }, 150);
      return () => { clearInterval(iv); cleanup?.(); };
    }
    return () => cleanup?.();
  }, []);

  return null;
}
