import Link from "next/link";
import { notFound } from "next/navigation";
import { requireArea, isAdmin } from "@/lib/auth-helpers";
import { getAkademieData, type Marke } from "@/lib/akademie";
import { PageShell } from "@/components/_primitives/page-shell";
import { Pill } from "@/components/_primitives/card";
import { MarkeActions } from "@/components/akademie/marke-editor";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

const txt = (v: unknown): string =>
  typeof v === "string" ? v : (v as any)?.name || (v as any)?.argument || (v as any)?.text || "";

const BackLink = (
  <Link href="/akademie/marken" className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink">← Marken-Bibel</Link>
);

export default async function MarkeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const sess = await requireArea("marken");
  const admin = isAdmin(sess);
  const { id } = await params;
  const key = decodeURIComponent(id);
  const { marken } = await getAkademieData();

  // Auflösung: zuerst per id, sonst per Array-Index (Fallback für id-lose Marken).
  let m: Marke | undefined = marken.find((x) => x.id && x.id === key);
  if (!m && /^\d+$/.test(key)) m = marken[Number(key)];
  if (!m) notFound();

  const herkunft = [m.herkunft?.stadt, m.herkunft?.land].filter(Boolean).join(", ");
  const gruendung = m.herkunft?.gruendung;
  const argumente = (m.verkaufsargumente || []).map(txt).filter(Boolean);
  const usps = (m.usps || []).filter(Boolean);
  const hero = (m.hero_produkte || []).map(txt).filter(Boolean);
  const kategorien = (m.kategorien || []).map(txt).filter(Boolean);

  return (
    <PageShell title={m.name || "Marke"} subtitle={[herkunft, gruendung ? `gegr. ${gruendung}` : ""].filter(Boolean).join(" · ") || undefined} action={BackLink}>
      <div className="flex flex-col gap-4">
        {m.philosophie && (
          <Section title="Philosophie">
            <p className="text-base italic text-muted">„{m.philosophie}"</p>
          </Section>
        )}

        {(m.herkunft?.land || m.herkunft?.stadt || gruendung) && (
          <Section title="Herkunft">
            <div className="flex flex-wrap gap-2">
              {m.herkunft?.land && <Pill tone="teal"><span className="inline-flex items-center gap-1"><Icon name="globe" className="h-3.5 w-3.5" /> {m.herkunft.land}</span></Pill>}
              {m.herkunft?.stadt && <Pill><span className="inline-flex items-center gap-1"><Icon name="pin" className="h-3.5 w-3.5" /> {m.herkunft.stadt}</span></Pill>}
              {gruendung && <Pill><span className="inline-flex items-center gap-1"><Icon name="calendar" className="h-3.5 w-3.5" /> {gruendung}</span></Pill>}
            </div>
          </Section>
        )}

        {!!kategorien.length && (
          <Section title="Kategorien">
            <div className="flex flex-wrap gap-2">{kategorien.map((k, i) => <Pill key={i} tone="accent">{k}</Pill>)}</div>
          </Section>
        )}

        {!!hero.length && (
          <Section title="Hero-Produkte">
            <ul className="grid gap-2 sm:grid-cols-2">
              {hero.map((h, i) => (
                <li key={i} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm">
                  <Icon name="star" className="h-3.5 w-3.5 shrink-0 text-amber-400" /> {h}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {!!argumente.length && (
          <Section title="Verkaufsargumente">
            <ul className="space-y-2">
              {argumente.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm"><Icon name="check" className="h-4 w-4 shrink-0 text-green mt-0.5" /><span>{a}</span></li>
              ))}
            </ul>
          </Section>
        )}

        {!!usps.length && (
          <Section title="USPs">
            <div className="flex flex-wrap gap-2">{usps.map((u, i) => <Pill key={i} tone="amber">{u}</Pill>)}</div>
          </Section>
        )}
        {admin && <MarkeActions id={m.id || key} marke={m} />}
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-2">{title}</h2>
      {children}
    </section>
  );
}
