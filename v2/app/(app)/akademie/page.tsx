import Link from "next/link";
import { requireUser, isAdmin, allowedAreas } from "@/lib/auth-helpers";
import { getAkademieData } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { QuizLauncher } from "@/components/akademie/quiz-launcher";
import { DrillLauncher } from "@/components/akademie/drill-launcher";
import { ContinueCard } from "@/components/akademie/continue-card";

export const dynamic = "force-dynamic";

type Tile = { area: string; icon: string; title: string; desc: string; count: number; tone: string };

export default async function AkademieHub() {
  const sess = await requireUser();
  const admin = isAdmin(sess);
  const areas = allowedAreas(sess);
  const has = (a: string) => admin || (areas as readonly string[]).includes(a);
  const d = await getAkademieData();

  const all: Tile[] = [
    { area: "drills", icon: "⚡", title: "Daily-Drills", desc: "Mikro-Training mit Sofort-Feedback", count: d.drills.length, tone: "from-sky-500/15" },
    { area: "szenarien", icon: "🎬", title: "Szenarien", desc: "Mehrstufige Gesprächsübungen", count: d.szenarien.length, tone: "from-violet-500/15" },
    { area: "rollenspiele", icon: "🎙", title: "Rollenspiele", desc: "Live-Gespräch mit KI-Kunde", count: d.rollenspiele.length, tone: "from-pink-500/15" },
    { area: "marken", icon: "🏷", title: "Marken-Bibel", desc: "Herkunft, USPs, Hero-Produkte", count: d.marken.length, tone: "from-teal-500/15" },
    { area: "personas", icon: "👥", title: "Personas", desc: "Kundentypen verstehen", count: d.personas.length, tone: "from-amber-500/15" },
    { area: "einwaende", icon: "💬", title: "Einwände", desc: "Antworten auf Kundeneinwände", count: d.einwaende.length, tone: "from-emerald-500/15" },
    { area: "angebote", icon: "📦", title: "Angebote", desc: "Beratungs- & Service-Pakete", count: d.angebote.length, tone: "from-orange-500/15" },
  ];
  const tiles = all.filter((t) => has(t.area));
  const showQuick = has("drills") || has("einwaende") || has("marken");

  return (
    <PageShell title="🎓 Akademie" subtitle="Dein Verkaufstraining — wähle einen Bereich oder leg direkt los.">
      <div className="flex flex-col gap-5">
        <ContinueCard allowed={areas} />

        {showQuick && (
          <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-2">⚡ Schnellstart</h2>
            <div className="flex flex-col gap-3">
              {has("drills") && <DrillLauncher drills={d.drills} />}
              <QuizLauncher drills={d.drills} einwaende={d.einwaende} marken={d.marken} />
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-2">Bereiche</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((t) => (
              <Link key={t.area} href={`/akademie/${t.area}`}
                className={`group relative overflow-hidden rounded-xl border border-line bg-gradient-to-br ${t.tone} to-transparent p-4 transition hover:border-accent`}>
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{t.icon}</span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-mono font-bold text-muted">{t.count}</span>
                </div>
                <h3 className="mt-3 font-bold">{t.title}</h3>
                <p className="mt-0.5 text-xs text-muted">{t.desc}</p>
                <span className="mt-3 inline-block text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">Öffnen →</span>
              </Link>
            ))}
            {admin && (
              <Link href="/akademie/mitarbeiter"
                className="group rounded-xl border border-line bg-surface p-4 transition hover:border-accent">
                <span className="text-2xl">👤</span>
                <h3 className="mt-3 font-bold">Mitarbeiter</h3>
                <p className="mt-0.5 text-xs text-muted">Team-Fortschritt & Verwaltung</p>
                <span className="mt-3 inline-block text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">Öffnen →</span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
