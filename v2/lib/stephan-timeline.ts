import type { Task, Decision, Lever, CalendarEvent } from "./cockpit";

// Marker, den die Extraktion (Phase 3) in notes/empfehlung schreibt.
const PROV = "Aus Stephan-Chat erfasst";
const has = (s: unknown) => typeof s === "string" && s.includes(PROV);

export type ChatCreatedItem = { kind: string; title: string; href: string; sub: string };

// Findet Cockpit-Einträge, die aus dem Stephan-Chat erzeugt wurden (heuristisch über den
// Provenance-Marker). Reine Anzeige für die Beziehungs-Timeline — read-only.
export function findChatCreatedItems(d: { tasks: Task[]; levers: Lever[]; decisions: Decision[]; calendarEvents: CalendarEvent[] }): ChatCreatedItem[] {
  const out: ChatCreatedItem[] = [];
  d.tasks.forEach((t, i) => {
    if (!has((t as { notes?: unknown }).notes)) return;
    const idee = (t as { area?: unknown }).area === "Idee";
    out.push({ kind: idee ? "Idee" : "Aufgabe", title: t.title || "Aufgabe", href: `/cockpit/tasks/${encodeURIComponent(t.id || String(i))}`, sub: t.dueDate ? `fällig ${t.dueDate}` : "" });
  });
  d.levers.forEach((l, i) => {
    if (!has((l as { notes?: unknown }).notes)) return;
    out.push({ kind: "Ziel", title: l.title || "Hebel", href: `/cockpit/hebel/${encodeURIComponent(l.id || String(i))}`, sub: l.startDate ? `Start ${l.startDate}` : "" });
  });
  d.decisions.forEach((x, i) => {
    if (!has(x.empfehlung)) return;
    out.push({ kind: "Entscheidung", title: x.titel || "Entscheidung", href: `/cockpit/entscheidungen/${encodeURIComponent(x.id || String(i))}`, sub: x.frist ? `Frist ${x.frist}` : "" });
  });
  d.calendarEvents.forEach((e) => {
    if (!has(e.notes)) return;
    out.push({ kind: "Termin", title: e.title || "Termin", href: "/kalender", sub: e.date || "" });
  });
  return out;
}
