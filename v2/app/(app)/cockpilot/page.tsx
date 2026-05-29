import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { aiConfigured } from "@/lib/ai";
import { getProgress } from "@/lib/progress";
import { APPS, guidesByApp } from "@/lib/copilot-kb";
import { PageShell } from "@/components/_primitives/page-shell";
import { Icon } from "@/components/icon";
import { CockpilotChat } from "@/components/cockpilot/cockpilot-chat";

export const dynamic = "force-dynamic";

export default async function CockpilotPage() {
  const sess = await requireUser();
  const progress = await getProgress(sess.email);
  const paths = progress?.stats.paths || {};
  const doneCount = (id: string) => (paths[`copilot:${id}`] || []).length;

  return (
    <PageShell title="Cockpilot" icon="sparkles" subtitle="Microsoft 365 Copilot für HFK — frag den Assistenten oder folge einer Schritt-für-Schritt-Anleitung">
      <div className="flex flex-col gap-6">
        <CockpilotChat configured={aiConfigured()} />

        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="book" className="h-3.5 w-3.5" />Arbeitsanweisungen mit Check-ins</h2>
          <div className="flex flex-col gap-5">
            {APPS.map((app) => {
              const guides = guidesByApp(app.key);
              if (!guides.length) return null;
              return (
                <div key={app.key}>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><Icon name={app.icon} className="h-4 w-4 text-accent" />{app.label}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {guides.map((g) => {
                      const done = doneCount(g.id);
                      const complete = done >= g.steps.length;
                      return (
                        <Link key={g.id} href={`/cockpilot/guide/${g.id}`}
                          className="group flex flex-col rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-accent">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold leading-snug group-hover:text-accent">{g.title}</h4>
                            {complete
                              ? <span className="shrink-0 rounded-full bg-green/15 px-2 py-0.5 text-[11px] font-semibold text-green">fertig</span>
                              : done > 0 ? <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">{done}/{g.steps.length}</span> : null}
                          </div>
                          <p className="mt-1 text-sm text-muted">{g.goal}</p>
                          <span className="mt-3 flex items-center gap-2 text-xs text-muted-2">
                            <Icon name="clock" className="h-3.5 w-3.5" />~{g.minutes} Min · {g.steps.length} Schritte
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
