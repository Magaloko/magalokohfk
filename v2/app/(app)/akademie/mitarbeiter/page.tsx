import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/supabase-server";
import { PageShell } from "@/components/_primitives/page-shell";
import { DataTable, type Column } from "@/components/_primitives/data-table";
import { Pill } from "@/components/_primitives/card";

export const dynamic = "force-dynamic";

type Row = { name: string; total: number; correct: number; pct: number };

export default async function MitarbeiterPage() {
  await requireAdmin(); // nur Admin
  const { data } = await db().from("bot_scores").select("uid, correct").order("ts", { ascending: false }).limit(5000);
  const by = new Map<string, { total: number; correct: number }>();
  for (const s of data || []) {
    const key = "MA-" + String(s.uid || "").slice(-4);
    const u = by.get(key) || { total: 0, correct: 0 };
    u.total++; if (s.correct) u.correct++; by.set(key, u);
  }
  const rows: Row[] = [...by.entries()].map(([name, u]) => ({ name, total: u.total, correct: u.correct, pct: u.total ? Math.round((u.correct / u.total) * 100) : 0 })).sort((a, b) => b.total - a.total);
  const cols: Column<Row>[] = [
    { key: "n", label: "Mitarbeiter (anonym)", render: (r) => <span className="font-mono">{r.name}</span> },
    { key: "t", label: "Antworten", align: "right", render: (r) => <span>{r.correct}/{r.total}</span> },
    { key: "p", label: "Quote", align: "right", render: (r) => <Pill tone={r.pct >= 80 ? "green" : r.pct >= 60 ? "amber" : "red"}>{r.pct}%</Pill> },
  ];
  return (
    <PageShell title="Mitarbeiter-Fortschritt" subtitle="Bot-Lernaktivität (pseudonymisiert)">
      <DataTable columns={cols} rows={rows} getKey={(r) => r.name} empty={{ title: "Noch keine Bot-Aktivität", hint: "Mitarbeiter starten Drills via Telegram /drill." }} />
    </PageShell>
  );
}
