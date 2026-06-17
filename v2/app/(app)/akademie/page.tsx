import Link from "next/link";
import { requireUser, isAdmin, allowedAreas } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { QuizLauncher } from "@/components/akademie/quiz-launcher";
import { DrillLauncher } from "@/components/akademie/drill-launcher";
import { ContinueCard } from "@/components/akademie/continue-card";
import { ChallengeCard } from "@/components/akademie/challenge-card";
import { getProgress, getLeaderboard, levelInfo, BADGES, emptyProgress, pathComplete } from "@/lib/progress";
import { PATHS } from "@/lib/paths";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

type Tile = { area: string; icon: string; title: string; desc: string; count: number; tone: string };

export default async function AkademieHub() {
  const sess = await requireUser();
  const admin = isAdmin(sess);
  const areas = allowedAreas(sess);
  const has = (a: string) => admin || (areas as readonly string[]).includes(a);
  const d = await getAkademieData();

  const all: Tile[] = [
    { area: "drills", icon: "bolt", title: "Tagesübungen", desc: "Kurzes Training mit Sofort-Rückmeldung", count: d.drills.length, tone: "from-sky-500/15" },
    { area: "szenarien", icon: "scenario", title: "Szenarien", desc: "Mehrstufige Gesprächsübungen", count: d.szenarien.length, tone: "from-violet-500/15" },
    { area: "rollenspiele", icon: "mic", title: "Rollenspiele", desc: "Kundengespräche mit KI-Kunde", count: d.rollenspiele.length, tone: "from-pink-500/15" },
    { area: "marken", icon: "tag", title: "Marken-Bibel", desc: "Herkunft, USPs, Hero-Produkte", count: d.marken.length, tone: "from-teal-500/15" },
    { area: "personas", icon: "users", title: "Personas", desc: "Kundentypen verstehen", count: d.personas.length, tone: "from-amber-500/15" },
    { area: "einwaende", icon: "chat", title: "Einwände", desc: "Antworten auf Kundeneinwände", count: d.einwaende.length, tone: "from-emerald-500/15" },
    { area: "angebote", icon: "package", title: "Angebote", desc: "Beratungs- & Service-Pakete", count: d.angebote.length, tone: "from-orange-500/15" },
  ];
  const tiles = all.filter((t) => has(t.area));
  const showQuick = has("drills") || has("einwaende") || has("marken");

  const progress = (await getProgress(sess.email)) || emptyProgress(sess.email);
  const lvl = levelInfo(progress.xp);
  const board = await getLeaderboard(sess.email, 8);
  const today = new Date().toISOString().slice(0, 10);
  const challengeDone = progress.stats.lastChallenge === today;
  const pathsDone = PATHS.filter((p) => pathComplete(p.id, progress.stats)).length;

  return (
    <PageShell title="VEKTRA" icon="academy" subtitle="Dein Verkaufstraining — wähle einen Bereich oder leg direkt los.">
      <div className="flex flex-col gap-5">
        {/* Fortschritt */}
        <section className="rounded-xl border border-line bg-gradient-to-br from-accent/10 to-transparent p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/20 text-lg font-extrabold text-accent">L{lvl.level}</div>
              <div>
                <div className="text-sm font-bold">Level {lvl.level}</div>
                <div className="text-xs text-muted-2">{progress.xp} XP gesamt · {progress.sessions_count} Trainings</div>
              </div>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-3 py-1 font-semibold text-amber"><Icon name="flame" className="h-4 w-4" /> {progress.streak} Tage</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 font-semibold text-muted"><Icon name="medal" className="h-4 w-4" /> {progress.badges.length}/{BADGES.length}</span>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${lvl.pct}%` }} />
          </div>
          <div className="mt-1 text-right text-[11px] text-muted-2">{lvl.into}/{lvl.need} bis Level {lvl.level + 1}</div>
          {/* Badges */}
          <div className="mt-3 hidden flex-wrap gap-2 md:flex">
            {BADGES.map((b) => {
              const earned = progress.badges.includes(b.id);
              return (
                <span key={b.id} title={`${b.label} — ${b.hint}`}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${earned ? "bg-green/15 text-green" : "bg-surface-2 text-muted-2 opacity-60"}`}>
                  <Icon name={b.icon} className={`h-3.5 w-3.5 ${earned ? "" : "opacity-60"}`} />{b.label}
                </span>
              );
            })}
          </div>
        </section>

        {showQuick && <div className="order-2 md:order-none"><ChallengeCard drills={d.drills} einwaende={d.einwaende} marken={d.marken} doneToday={challengeDone} streak={progress.streak} /></div>}

        <Link href="/akademie/lernpfade" className="group order-2 md:order-none flex items-center justify-between rounded-xl border border-line bg-gradient-to-br from-accent/10 to-transparent p-4 shadow-sm transition hover:border-accent">
          <div className="flex items-center gap-3">
            <Icon name="compass" className="h-6 w-6 text-accent" />
            <div>
              <div className="text-sm font-bold">Lernpfade</div>
              <div className="text-xs text-muted">{PATHS.length} geführte Kurse · {pathsDone}/{PATHS.length} abgeschlossen · +60 XP pro Pfad</div>
            </div>
          </div>
          <span className="text-accent transition group-hover:translate-x-0.5">→</span>
        </Link>

        <div className="order-2 md:order-none"><ContinueCard allowed={areas} /></div>

        {showQuick && (
          <section className="order-2 md:order-none rounded-xl border border-line bg-surface p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="bolt" className="h-4 w-4" /> Schnellstart</h2>
            <div className="flex flex-col gap-3">
              {has("drills") && <DrillLauncher drills={d.drills} />}
              <QuizLauncher drills={d.drills} einwaende={d.einwaende} marken={d.marken} />
            </div>
          </section>
        )}

        <section className="order-1 md:order-none">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-2">Bereiche</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((t) => (
              <Link key={t.area} href={`/akademie/${t.area}`}
                className={`group relative flex min-h-[140px] flex-col overflow-hidden rounded-xl border border-line bg-gradient-to-br ${t.tone} to-transparent p-5 transition hover:border-accent`}>
                <div className="flex items-start justify-between">
                  <Icon name={t.icon} className="h-7 w-7" />
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-mono font-bold text-muted">{t.count}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted">{t.desc}</p>
                <span className="mt-auto pt-3 inline-block text-sm font-semibold text-accent">Öffnen →</span>
              </Link>
            ))}
            {admin && (
              <Link href="/akademie/mitarbeiter"
                className="group flex min-h-[140px] flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-accent">
                <Icon name="user" className="h-7 w-7" />
                <h3 className="mt-3 text-lg font-bold">Mitarbeiter</h3>
                <p className="mt-1 text-sm text-muted">Team-Fortschritt & Verwaltung</p>
                <span className="mt-auto pt-3 inline-block text-sm font-semibold text-accent">Öffnen →</span>
              </Link>
            )}
          </div>
        </section>

        {board.length > 0 && (
          <section className="order-3 md:order-none">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="trophy" className="h-4 w-4" /> Bestenliste (anonym)</h2>
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              {board.map((e) => (
                <div key={e.rank}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm ${e.me ? "bg-accent/10" : ""} ${e.rank > 1 ? "border-t border-line" : ""}`}>
                  <span className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono font-bold text-muted-2">
                      {e.rank === 1 ? <Icon name="trophy" className="h-4 w-4 text-amber-400" /> : e.rank === 2 ? <Icon name="medal" className="h-4 w-4 text-slate-400" /> : e.rank === 3 ? <Icon name="medal" className="h-4 w-4 text-amber-700" /> : e.rank}
                    </span>
                    <span className={e.me ? "font-bold text-accent" : "font-medium"}>{e.label}</span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-muted-2">
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 font-semibold">L{e.level}</span>
                    <span className="font-mono">{e.xp} XP</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
