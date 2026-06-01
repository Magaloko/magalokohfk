import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData } from "@/lib/cockpit";
import { PageShell } from "@/components/_primitives/page-shell";
import { CalendarView } from "@/components/calendar/calendar-view";

export const dynamic = "force-dynamic";

export default async function KalenderPage() {
  await requireAdmin();
  const { tasks, decisions, calendarEvents, staffTraining } = await getCockpitData();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <PageShell title="Kalender" icon="calendar" subtitle="Termine · Aufgaben · Fristen · Mitarbeiter-Training — alles an einem Ort">
      <CalendarView events={calendarEvents} tasks={tasks} decisions={decisions} staff={staffTraining} today={today} />
    </PageShell>
  );
}
