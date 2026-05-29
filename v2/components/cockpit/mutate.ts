// Client-Helfer: ruft die Mutate-API (admin-only) auf. Kein "use client" nötig (reine Funktion).
export type MutateBody =
  | { collection: string; action: "create"; item: Record<string, unknown> }
  | { collection: string; action: "update"; id: string; patch: Record<string, unknown> }
  | { collection: string; action: "replace"; id: string; item: Record<string, unknown> }
  | { collection: string; action: "delete"; id: string };

export async function cockpitMutate(body: MutateBody): Promise<{ ok: boolean; error?: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const init = (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData) || "";
  if (init) headers["X-Tg-Init"] = init;
  try {
    const r = await fetch("/api/cockpit/mutate", { method: "POST", headers, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, error: j?.error };
  } catch {
    return { ok: false, error: "network" };
  }
}

export const errText = (e?: string) =>
  e === "conflict" ? "Konflikt — bitte neu laden und erneut versuchen."
    : e === "anti-wipe" ? "Aktion abgelehnt (Schutz vor Daten-Verlust)."
    : e === "network" ? "Verbindungsfehler."
    : "Aktion fehlgeschlagen.";
