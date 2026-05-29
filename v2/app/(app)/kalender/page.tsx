import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { CalendarView } from "@/components/calendar/calendar-view";

export const dynamic = "force-dynamic";

export default async function KalenderPage() {
  await requireAdmin();
  const { tasks, decisions, weeklyKpis, calendarEvents } = await getCockpitData();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <PageShell title="📅 Kalender" subtitle="Termine · Aufgaben-Fälligkeiten · Entscheidungs-Fristen · KPI-Wochen — alles an einem Ort">
      <CalendarView events={calendarEvents} tasks={tasks} decisions={decisions} kpis={weeklyKpis} today={today} />
    </PageShell>
  );
}
