import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/supabase-server";
import { getAllProgress, uidFromKey, levelInfo, type Progress } from "@/lib/progress";
import { getCockpitData } from "@/lib/cockpit";
import { PATHS } from "@/lib/paths";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { EmptyState } from "@/components/_primitives/empty-state";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

type Member = {
  key: string; uid?: number; name: string; role: string; areas: string;
  level: number; xp: number; streak: number; sessions: number; badges: number;
  ansCorrect: number; ansTotal: number; pathsDone: number;
};

const PATHS_TOTAL = PATHS.length;
const donePaths = (p?: Progress | null) =>
  PATHS.filter((path) => (p?.stats.paths?.[path.id]?.length || 0) >= path.steps.length).length;

export default async function MitarbeiterPage() {
  await requireAdmin();
  const [progress, scoresRes, usersRes, cockpit] = await Promise.all([
    getAllProgress(),
    db().from("bot_scores").select("uid, correct").limit(8000),
    db().from("bot_users").select("uid, name, role, modules"),
    getCockpitData(),
  ]);

  const users = new Map<number, { name?: string; role?: string; modules?: unknown }>();
  for (const u of usersRes.data || []) { const id = Number(u.uid); if (Number.isInteger(id)) users.set(id, u); }
  const scores = new Map<number, { c: number; t: number }>();
  for (const s of scoresRes.data || []) { const id = Number(s.uid); if (!Number.isInteger(id)) continue; const e = scores.get(id) || { c: 0, t: 0 }; e.t++; if (s.correct) e.c++; scores.set(id, e); }
  const progByUid = new Map<number, (typeof progress)[number]>();
  const webProg: typeof progress = [];
  for (const p of progress) { const id = uidFromKey(p.user_key); if (id != null) progByUid.set(id, p); else webProg.push(p); }

  const areasLabel = (modules: unknown, role?: string) => {
    if (role === "admin") return "alle";
    const a = Array.isArray(modules) ? (modules as string[]) : [];
    if (!a.length || a.includes("*")) return "alle Akademie";
    return a.join(", ");
  };

  // Alle bekannten Lernenden (uid aus progress ∪ scores ∪ bot_users)
  const uids = new Set<number>([...progByUid.keys(), ...scores.keys(), ...users.keys()]);
  const members: Member[] = [];
  for (const uid of uids) {
    const u = users.get(uid);
    const p = progByUid.get(uid);
    const sc = scores.get(uid);
    members.push({
      key: "tg" + uid, uid,
      name: u?.name || "MA-" + String(uid).slice(-4),
      role: u?.role || "mitarbeiter",
      areas: areasLabel(u?.modules, u?.role),
      level: p ? levelInfo(p.xp).level : 1, xp: p?.xp || 0, streak: p?.streak || 0, sessions: p?.sessions_count || 0, badges: p?.badges.length || 0,
      ansCorrect: sc?.c || 0, ansTotal: sc?.t || 0, pathsDone: donePaths(p),
    });
  }
  for (const p of webProg) members.push({
    key: p.user_key, name: p.user_key === "web:admin" ? "Web-Admin" : "Web-Login", role: p.user_key === "web:admin" ? "admin" : "mitarbeiter",
    areas: "—", level: levelInfo(p.xp).level, xp: p.xp, streak: p.streak, sessions: p.sessions_count, badges: p.badges.length, ansCorrect: 0, ansTotal: 0, pathsDone: donePaths(p),
  });
  members.sort((a, b) => b.xp - a.xp || b.ansTotal - a.ansTotal);

  const staff = (cockpit.staffTraining || []).filter((m) => (m.completedScenarios || []).length);

  return (
    <PageShell title="Mitarbeiter" icon="users" subtitle={`${members.length} Lernende · Team-Fortschritt`}>
      <div className="flex flex-col gap-6">
        {members.length ? (
          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <table className="hidden w-full text-sm sm:table">
              <thead><tr className="border-b border-line text-xs uppercase tracking-wide text-muted-2">
                <th className="px-4 py-3 text-left font-semibold">Mitarbeiter</th>
                <th className="px-4 py-3 text-left font-semibold">Rolle / Bereiche</th>
                <th className="px-4 py-3 text-right font-semibold">Level</th>
                <th className="px-4 py-3 text-right font-semibold">XP</th>
                <th className="px-4 py-3 text-right font-semibold"><Icon name="flame" className="h-4 w-4 inline" /></th>
                <th className="px-4 py-3 text-right font-semibold">Trainings</th>
                <th className="px-4 py-3 text-right font-semibold" title="Lernpfade abgeschlossen"><Icon name="compass" className="h-4 w-4 inline" /> Pfade</th>
                <th className="px-4 py-3 text-right font-semibold"><Icon name="medal" className="h-4 w-4 inline" /></th>
                <th className="px-4 py-3 text-right font-semibold">Antwort-Quote</th>
              </tr></thead>
              <tbody>
                {members.map((m) => {
                  const pct = m.ansTotal ? Math.round((m.ansCorrect / m.ansTotal) * 100) : null;
                  return (
                    <tr key={m.key} className="border-b border-line/60 last:border-0 hover:bg-surface-2/40">
                      <td className="px-4 py-3 font-medium">{m.uid ? <Link href={`/akademie/mitarbeiter/${m.uid}`} className="text-ink hover:text-accent">{m.name}</Link> : m.name}</td>
                      <td className="px-4 py-3"><Pill tone={m.role === "admin" ? "accent" : "muted"}>{m.role}</Pill> <span className="text-xs text-muted-2">{m.areas}</span></td>
                      <td className="px-4 py-3 text-right font-mono">L{m.level}</td>
                      <td className="px-4 py-3 text-right font-mono">{m.xp}</td>
                      <td className="px-4 py-3 text-right">{m.streak || "—"}</td>
                      <td className="px-4 py-3 text-right font-mono">{m.sessions}</td>
                      <td className="px-4 py-3 text-right"><span className={m.pathsDone >= PATHS_TOTAL ? "font-bold text-green" : m.pathsDone ? "text-accent" : "text-muted-2"}>{m.pathsDone}/{PATHS_TOTAL}</span></td>
                      <td className="px-4 py-3 text-right">{m.badges || "—"}</td>
                      <td className="px-4 py-3 text-right">{pct == null ? <span className="text-muted-2">—</span> : <Pill tone={pct >= 80 ? "green" : pct >= 60 ? "amber" : "red"}>{m.ansCorrect}/{m.ansTotal} · {pct}%</Pill>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Mobile */}
            <ul className="divide-y divide-line/60 sm:hidden">
              {members.map((m) => {
                const pct = m.ansTotal ? Math.round((m.ansCorrect / m.ansTotal) * 100) : null;
                return (
                  <li key={m.key} className="p-4">
                    <div className="flex items-center justify-between"><span className="font-semibold">{m.uid ? <Link href={`/akademie/mitarbeiter/${m.uid}`} className="hover:text-accent">{m.name}</Link> : m.name}</span><Pill tone={m.role === "admin" ? "accent" : "muted"}>{m.role}</Pill></div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-2">
                      <span>L{m.level} · {m.xp} XP</span>
                      <span className="inline-flex items-center gap-1"><Icon name="flame" className="h-3.5 w-3.5" /> {m.streak}</span>
                      <span>{m.sessions} Trainings</span>
                      <span className="inline-flex items-center gap-1"><Icon name="compass" className="h-3.5 w-3.5" /> {m.pathsDone}/{PATHS_TOTAL}</span>
                      <span className="inline-flex items-center gap-1"><Icon name="medal" className="h-3.5 w-3.5" /> {m.badges}</span>
                      {pct != null && <span>{pct}% ({m.ansCorrect}/{m.ansTotal})</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : <EmptyState title="Noch keine Lern-Aktivität" hint="Mitarbeiter starten Trainings via Telegram oder Web." />}

        {!!staff.length && (
          <section>
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="academy" className="h-4 w-4" /> Trainings-Historie (Rollenspiele/Szenarien)</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {staff.map((m, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{m.name}</h3>
                    <span className="text-xs text-muted-2">{(m.completedScenarios || []).length} abgeschlossen</span>
                  </div>
                  {m.strengths && <p className="mt-1 text-xs text-green">+ {m.strengths}</p>}
                  {m.weaknesses && <p className="text-xs text-red">– {m.weaknesses}</p>}
                  <ul className="mt-2 flex flex-col gap-1">
                    {(m.completedScenarios || []).slice(-6).reverse().map((c, j) => (
                      <li key={j} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate">{c.titel || "Training"}</span>
                        <span className="shrink-0 text-xs text-muted-2">{typeof c.score === "number" ? `${c.score}%` : ""} · {c.completedAt || ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
