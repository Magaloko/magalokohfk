import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData, isTaskOpen, type Task } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { DataTable, type Column } from "@/components/_primitives/data-table";
import { Pill } from "@/components/_primitives/card";

export const dynamic = "force-dynamic";

const statusTone = (s?: string): "muted" | "accent" | "green" | "amber" | "red" => {
  const v = (s || "").toLowerCase();
  if (v === "erledigt") return "green";
  if (v.includes("arbeit") || v === "in arbeit" || v === "doing") return "accent";
  if (v.includes("warte") || v.includes("block")) return "amber";
  return "muted";
};
const prioTone = (p?: string): "red" | "amber" | "muted" => {
  const v = (p || "").toLowerCase();
  if (v.includes("hoch") || v.includes("high")) return "red";
  if (v.includes("mittel") || v.includes("mid")) return "amber";
  return "muted";
};

export default async function TasksPage() {
  await requireAdmin();
  const { tasks } = await getCockpitData();
  // Offene zuerst, dann nach Fälligkeit.
  const rows = [...tasks].sort((a, b) => {
    const o = Number(isTaskOpen(b)) - Number(isTaskOpen(a));
    if (o) return o;
    return String(a.dueDate || "9999").localeCompare(String(b.dueDate || "9999"));
  });

  const cols: Column<Task>[] = [
    { key: "title", label: "Aufgabe", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "area", label: "Bereich", hideOnMobile: true, render: (r) => <span className="text-muted">{r.area || "—"}</span> },
    { key: "prio", label: "Prio", hideOnMobile: true, render: (r) => (r.priority ? <Pill tone={prioTone(r.priority)}>{r.priority}</Pill> : <span className="text-muted-2">—</span>) },
    { key: "owner", label: "Owner", hideOnMobile: true, render: (r) => <span className="text-muted">{r.owner || "—"}</span> },
    { key: "due", label: "Fällig", align: "right", hideOnMobile: true, render: (r) => <span className="font-mono text-xs text-muted-2">{r.dueDate || "—"}</span> },
    { key: "status", label: "Status", align: "right", render: (r) => <Pill tone={statusTone(r.status)}>{r.status || "offen"}</Pill> },
  ];

  return (
    <PageShell title="✅ Tasks" subtitle={`${tasks.filter(isTaskOpen).length} offen · ${tasks.length} gesamt`}>
      <DataTable columns={cols} rows={rows} getKey={(r, i) => r.id || String(i)} empty={{ title: "Keine Tasks" }} />
    </PageShell>
  );
}
