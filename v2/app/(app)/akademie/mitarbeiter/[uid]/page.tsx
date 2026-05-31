import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/supabase-server";
import { getProgress, emptyProgress, levelInfo, BADGES, pathComplete, pathDoneCount } from "@/lib/progress";
import { getCockpitData } from "@/lib/cockpit";
import { PATHS } from "@/lib/paths";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

const Back = <Link href="/akademie/mitarbeiter" className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink">← Mitarbeiter</Link>;

export default async function MitarbeiterDetail({ params }: { params: Promise<{ uid: string }> }) {
  await requireAdmin();
  const { uid } = await params;
  const uidNum = Number(decodeURIComponent(uid));
  if (!Number.isInteger(uidNum)) notFound();
  const key = `tg:${uidNum}@telegram`;

  const [userRes, progress, scoreRes, cockpit] = await Promise.all([
    db().from("bot_users").select("uid, name, role, modules").eq("uid", uidNum).maybeSingle(),
    getProgress(key),
    db().from("bot_scores").select("type, correct").eq("uid", uidNum).limit(8000),
    getCockpitData(),
  ]);
  const user = userRes.data as { name?: string; role?: string; modules?: unknown } | null;
  const p = progress || emptyProgress(key);
  const lvl = levelInfo(p.xp);
  const name = user?.name || "MA-" + String(uidNum).slice(-4);
  const role = user?.role || "mitarbeiter";
  const modules = Array.isArray(user?.modules) ? (user!.modules as string[]) : [];
  const areas = role === "admin" ? "alle" : (modules.length ? modules.join(", ") : "alle Akademie");

  // Antwort-Quote gesamt + nach Typ
  const byType: Record<string, { c: number; t: number }> = {};
  let totC = 0, totT = 0;
  for (const s of scoreRes.data || []) {
    const ty = String(s.type || "?"); const e = byType[ty] || { c: 0, t: 0 };
    e.t++; totT++; if (s.correct) { e.c++; totC++; } byType[ty] = e;
  }
  const totPct = totT ? Math.round((totC / totT) * 100) : null;

  const staff = (cockpit.staffTraining || []).find((m) => m.name && user?.name && m.name === user.name);
  const weakCount = Object.keys(p.stats.weak || {}).length;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">{title}</h2>{children}
    </section>
  );

  return (
    <PageShell title={name} icon="user" subtitle={`#${uidNum}`} action={Back}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Pill tone={role === "admin" ? "accent" : "muted"}>{role}</Pill>
          <Pill tone="teal">Bereiche: {areas}</Pill>
        </div>

        <Section title="Fortschritt">
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/20 text-lg font-extrabold text-accent">L{lvl.level}</div>
            <div className="text-sm">
              <div className="font-bold">Level {lvl.level} · {p.xp} XP</div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-2">
                <span>{p.sessions_count} Trainings</span>
                <span className="inline-flex items-center gap-1"><Icon name="flame" className="h-3.5 w-3.5" /> {p.streak} (Best {p.best_streak})</span>
                <span className="inline-flex items-center gap-1"><Icon name="medal" className="h-3.5 w-3.5" /> {p.badges.length}/{BADGES.length}</span>
                {weakCount ? <span className="inline-flex items-center gap-1"><Icon name="repeat" className="h-3.5 w-3.5" /> {weakCount} Wiederholungs-Items</span> : null}
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent" style={{ width: `${lvl.pct}%` }} /></div>
          <div className="mt-3 flex flex-wrap gap-2">
            {BADGES.map((b) => {
              const earned = p.badges.includes(b.id);
              return <span key={b.id} title={b.hint} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${earned ? "bg-green/15 text-green" : "bg-surface-2 text-muted-2 opacity-60"}`}><Icon name={b.icon} className={`h-3.5 w-3.5 ${earned ? "" : "opacity-60"}`} />{b.label}</span>;
            })}
          </div>
        </Section>

        <Section title="Lernpfade">
          <div className="flex flex-col gap-2">
            {PATHS.map((path) => {
              const dn = pathDoneCount(path.id, p.stats);
              const pct = Math.round((dn / path.steps.length) * 100);
              const full = pathComplete(path.id, p.stats);
              return (
                <div key={path.id} className="flex items-center gap-3">
                  <span className="inline-flex w-44 shrink-0 items-center gap-1 truncate text-sm"><Icon name={path.icon} className="h-4 w-4 shrink-0" /> {path.title}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"><div className={`h-full rounded-full ${full ? "bg-green" : "bg-accent"}`} style={{ width: `${pct}%` }} /></div>
                  <span className={`w-10 shrink-0 text-right text-xs ${full ? "font-bold text-green" : "text-muted-2"}`}>{dn}/{path.steps.length}</span>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Antwort-Quote (Bot-Drills)">
          {totPct == null ? <p className="text-sm text-muted-2">Noch keine Bot-Antworten.</p> : (
            <>
              <div className="text-sm">Gesamt: <span className="font-bold">{totC}/{totT} · {totPct}%</span></div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(byType).sort((a, b) => b[1].t - a[1].t).map(([ty, e]) => {
                  const pct = e.t ? Math.round((e.c / e.t) * 100) : 0;
                  return <Pill key={ty} tone={pct >= 80 ? "green" : pct >= 60 ? "amber" : "red"}>{ty}: {e.c}/{e.t} · {pct}%</Pill>;
                })}
              </div>
            </>
          )}
        </Section>

        {staff && (staff.completedScenarios || []).length > 0 && (
          <Section title="Trainings-Historie (Rollenspiele/Szenarien)">
            {staff.strengths && <p className="mb-1 text-xs text-green">+ {staff.strengths}</p>}
            {staff.weaknesses && <p className="mb-1 text-xs text-red">– {staff.weaknesses}</p>}
            <ul className="flex flex-col gap-1">
              {(staff.completedScenarios || []).slice().reverse().map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{c.titel || "Training"}</span>
                  <span className="shrink-0 text-xs text-muted-2">{typeof c.score === "number" ? `${c.score}%` : ""} · {c.completedAt || ""}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </PageShell>
  );
}
