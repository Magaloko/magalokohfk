import { requireAdmin } from "@/lib/auth-helpers";
import { getCockpitData } from "@/lib/cockpit";
import { getAkademieData } from "@/lib/akademie";
import { PATHS } from "@/lib/paths";
import { PageShell } from "@/components/_primitives/page-shell";
import { CalendarView } from "@/components/calendar/calendar-view";

export const dynamic = "force-dynamic";

export default async function KalenderPage() {
  await requireAdmin();
  const [{ tasks, decisions, calendarEvents, staffTraining }, akademie] = await Promise.all([
    getCockpitData(),
    getAkademieData(),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <PageShell title="Buchungskalender" icon="calendar" subtitle="Termine · Kurse · Angebote · Aufgaben · Fristen — alles an einem Ort">
      <CalendarView
        events={calendarEvents}
        tasks={tasks}
        decisions={decisions}
        staff={staffTraining}
        today={today}
        offers={akademie.angebote.map((a, i) => ({ id: a.id || String(i), title: a.name || "Angebot" }))}
        courses={PATHS.map((p) => ({ id: p.id, title: p.title }))}
      />
    </PageShell>
  );
}
