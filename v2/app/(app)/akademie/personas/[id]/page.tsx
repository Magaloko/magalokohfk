import Link from "next/link";
import { notFound } from "next/navigation";
import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData, type Persona } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { PersonaActions } from "@/components/akademie/persona-editor";

export const dynamic = "force-dynamic";

// jsonb-Werte robust zu lesbarem Text/Listen.
const s = (v: unknown): string => (typeof v === "string" ? v : v != null ? JSON.stringify(v) : "");
function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : (x as any)?.text || (x as any)?.name || JSON.stringify(x))).filter(Boolean);
  if (typeof v === "string") return v.split(/\n|;|·/).map((x) => x.trim()).filter(Boolean);
  return v != null ? [s(v)] : [];
}

const BackLink = (
  <Link href="/akademie/personas" className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink">← Personas</Link>
);

export default async function PersonaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const sess = await requireArea("personas");
  const admin = isAdmin(sess);
  const { id } = await params;
  const key = decodeURIComponent(id);
  const { personas } = await getAkademieData();

  let p: Persona | undefined = personas.find((x) => x.id && x.id === key);
  if (!p && /^\d+$/.test(key)) p = personas[Number(key)];
  if (!p) notFound();

  const schmerz = toList(p.schmerzpunkte);
  const werte = toList(p.werte);

  return (
    <PageShell title={`${p.avatar || "👤"} ${p.name || "Persona"}`} subtitle={[p.alter, p.kontext].filter(Boolean).join(" · ") || undefined} action={BackLink}>
      <div className="flex flex-col gap-4">
        {p.zitat && (
          <section className="rounded-xl border-l-4 border-accent bg-surface p-4 shadow-sm">
            <p className="text-lg italic text-muted">„{p.zitat}"</p>
          </section>
        )}

        {!!schmerz.length && (
          <Section title="Schmerzpunkte" icon="😟">
            <ul className="space-y-2">
              {schmerz.map((x, i) => <li key={i} className="flex gap-2 text-sm"><span className="text-red">•</span><span>{x}</span></li>)}
            </ul>
          </Section>
        )}

        {!!werte.length && (
          <Section title="Werte & Motivation" icon="💎">
            <div className="flex flex-wrap gap-2">{werte.map((x, i) => <Pill key={i} tone="teal">{x}</Pill>)}</div>
          </Section>
        )}

        {p.einwaendeTypisch && (
          <Section title="Typische Einwände" icon="💬">
            <p className="text-sm text-muted">{p.einwaendeTypisch}</p>
          </Section>
        )}

        {!!s(p.budget) && (
          <Section title="Budget" icon="💰">
            <p className="text-sm">{s(p.budget)}</p>
          </Section>
        )}
        {admin && <PersonaActions id={p.id || key} persona={p} />}
      </div>
    </PageShell>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">{icon} {title}</h2>
      {children}
    </section>
  );
}
