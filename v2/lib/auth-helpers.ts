import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

export const AKADEMIE_AREAS = ["angebote", "personas", "einwaende", "szenarien", "drills", "rollenspiele", "marken"] as const;
export type AkademieArea = (typeof AKADEMIE_AREAS)[number];

export function normAreas(areas: unknown): AkademieArea[] {
  const a = (Array.isArray(areas) ? areas : []).filter((x): x is AkademieArea => (AKADEMIE_AREAS as readonly string[]).includes(x));
  return a.length ? a : [...AKADEMIE_AREAS];
}

export function isAdmin(sess: Session | null): boolean {
  return !!(sess && sess.tgRole === "admin");
}

// Erlaubte Akademie-Bereiche der Session (Admin = alle).
export function allowedAreas(sess: Session | null): AkademieArea[] {
  if (!sess) return [];
  if (isAdmin(sess)) return [...AKADEMIE_AREAS];
  return normAreas(sess.tgModules);
}

// Server-Guard: erzwingt Login (sonst redirect zu /login).
export async function requireUser(): Promise<Session> {
  const sess = await getSession();
  if (!sess) redirect("/login");
  return sess;
}

export async function requireAdmin(): Promise<Session> {
  const sess = await requireUser();
  if (!isAdmin(sess)) redirect("/akademie");
  return sess;
}

// Erzwingt Zugriff auf einen Akademie-Bereich (Admin = alle); sonst Redirect auf ersten erlaubten.
export async function requireArea(area: AkademieArea): Promise<Session> {
  const sess = await requireUser();
  if (isAdmin(sess)) return sess;
  const areas = allowedAreas(sess);
  if (!areas.includes(area)) redirect(`/akademie/${areas[0] || "drills"}`);
  return sess;
}
