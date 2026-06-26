import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

export const AKADEMIE_AREAS = ["angebote", "personas", "einwaende", "szenarien", "drills", "rollenspiele", "marken"] as const;
export type AkademieArea = (typeof AKADEMIE_AREAS)[number];

export function normAreas(areas: unknown): AkademieArea[] {
  // Deny-by-default: leere/ungültige Module = KEINE Bereiche (Admins erhalten alle separat via allowedAreas).
  return (Array.isArray(areas) ? areas : []).filter((x): x is AkademieArea => (AKADEMIE_AREAS as readonly string[]).includes(x));
}

export function isAdmin(sess: Session | null): boolean {
  return !!(sess && sess.tgRole === "admin");
}

// Super-Admin = darf Einstellungen/User-Verwaltung. Standard: Telegram-ID 544821565 (per Env überschreibbar).
const SUPER_ADMIN_IDS = (process.env.SUPER_ADMIN_IDS || "544821565")
  .split(",").map((s) => Number(s.trim())).filter(Number.isInteger);
export function isSuperAdmin(sess: Session | null): boolean {
  if (!sess) return false;
  if (process.env.NODE_ENV !== "production" && (sess.email === "local:mago" || sess.email === "local:codex")) return true;
  // Telegram-Identität in SUPER_ADMIN_IDS …
  if (sess.tgUserId != null && SUPER_ADMIN_IDS.includes(Number(sess.tgUserId))) return true;
  // … oder der Eigentümer per Admin-Passwort (web:admin). Reguläre Admins/Codes zählen NICHT.
  return sess.email === "web:admin";
}
// Ist diese (Telegram-)UID ein Super-Admin laut Env-Allowlist? (z. B. zum Schutz vor Selbst-Lockout)
export function isSuperAdminUid(uid: number): boolean {
  return Number.isInteger(uid) && SUPER_ADMIN_IDS.includes(Number(uid));
}
export async function requireSuperAdmin(): Promise<Session> {
  const sess = await requireUser();
  if (!isSuperAdmin(sess)) redirect("/heute");
  return sess;
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
  // Kein erlaubter Bereich → zur Akademie-Übersicht (requireUser, kein Redirect-Loop); sonst zum ersten erlaubten.
  if (!areas.includes(area)) redirect(areas.length ? `/akademie/${areas[0]}` : "/akademie");
  return sess;
}
