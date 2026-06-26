"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import type { CalendarEvent } from "@/lib/cockpit";

const COL = "calendarEvents";
const KINDS = ["Termin", "Kurs", "Angebot", "Erinnerung", "Deadline", "Block"];
const STATUSES = ["geplant", "angefragt", "gebucht", "bestätigt", "abgesagt", "erledigt"];
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;
type BookingOption = { id: string; title: string };

export function NewEventButton({ presetDate, label = "+ Termin", offers = [], courses = [] }: { presetDate?: string; label?: string; offers?: BookingOption[]; courses?: BookingOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-bg hover:opacity-90">{label}</button>
      {open && <EventForm presetDate={presetDate} offers={offers} courses={courses} onClose={() => setOpen(false)} />}
    </>
  );
}

export function EventEditButton({ event, offers = [], courses = [] }: { event: CalendarEvent; offers?: BookingOption[]; courses?: BookingOption[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  async function del() {
    if (busy || !event.id || !confirm("Diesen Termin löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: COL, action: "delete", id: event.id });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  return (
    <span className="inline-flex gap-1">
      <button disabled={busy} onClick={() => setEdit(true)} className="rounded bg-surface-2 px-2 py-1 text-xs hover:text-ink disabled:opacity-50" aria-label="Bearbeiten"><Icon name="edit" className="h-3.5 w-3.5" /></button>
      <button disabled={busy} onClick={del} className="rounded bg-red/10 px-2 py-1 text-xs text-red hover:bg-red/20 disabled:opacity-50" aria-label="Löschen"><Icon name="trash" className="h-3.5 w-3.5" /></button>
      {edit && <EventForm event={event} offers={offers} courses={courses} onClose={() => setEdit(false)} />}
    </span>
  );
}

function EventForm({ event, presetDate, offers = [], courses = [], onClose }: { event?: CalendarEvent; presetDate?: string; offers?: BookingOption[]; courses?: BookingOption[]; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<CalendarEvent>({
    title: event?.title || "",
    date: event?.date || presetDate || "",
    time: event?.time || "",
    kind: event?.kind || "Termin",
    notes: event?.notes || "",
    bookingType: event?.bookingType || "",
    refId: event?.refId || "",
    refTitle: event?.refTitle || "",
    participant: event?.participant || "",
    status: event?.status || "geplant",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof CalendarEvent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    if (k === "kind") {
      setF({ ...f, kind: value, refId: "", refTitle: "", bookingType: value === "Kurs" || value === "Angebot" ? value : "" });
      return;
    }
    setF({ ...f, [k]: value });
  };
  const refs = f.kind === "Kurs" ? courses : f.kind === "Angebot" ? offers : [];
  const setRef = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const refId = e.target.value;
    const refTitle = refs.find((r) => r.id === refId)?.title || "";
    const title = f.title || refTitle;
    setF({ ...f, refId, refTitle, title });
  };

  async function save() {
    if (!f.title?.trim()) { setErr("Titel fehlt."); return; }
    if (!f.date?.trim()) { setErr("Datum fehlt."); return; }
    setBusy(true); setErr("");
    const payload = { ...f, bookingType: f.kind === "Kurs" || f.kind === "Angebot" ? f.kind : "" } as Record<string, unknown>;
    const r = event?.id ? await cockpitMutate({ collection: COL, action: "update", id: event.id, patch: payload }) : await cockpitMutate({ collection: COL, action: "create", item: payload });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={event?.id ? "Termin bearbeiten" : "Neuer Termin"}>
      <div className="flex flex-col gap-3">
        <label className="block">{L("Titel *")}<input value={f.title || ""} onChange={set("title")} className={sel} /></label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">{L("Datum *")}<input type="date" value={f.date || ""} onChange={set("date")} className={sel} /></label>
          <label className="block">{L("Uhrzeit")}<input value={f.time || ""} onChange={set("time")} placeholder="14:00" className={sel} /></label>
          <label className="block">{L("Art")}<select value={f.kind || "Termin"} onChange={set("kind")} className={sel}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
        </div>
        {(f.kind === "Kurs" || f.kind === "Angebot") && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">{L(f.kind === "Kurs" ? "Kurs" : "Angebot")}
              <select value={f.refId || ""} onChange={setRef} className={sel}>
                <option value="">Ohne Verknüpfung</option>
                {refs.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </label>
            <label className="block">{L("Buchungsstatus")}
              <select value={f.status || "geplant"} onChange={set("status")} className={sel}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </label>
          </div>
        )}
        {(f.kind === "Kurs" || f.kind === "Angebot") && (
          <label className="block">{L("Teilnehmer / Kunde / Gruppe")}<input value={f.participant || ""} onChange={set("participant")} placeholder="Name, Kundin, Team oder Kursgruppe" className={sel} /></label>
        )}
        <label className="block">{L("Notiz")}<textarea value={f.notes || ""} onChange={set("notes")} rows={2} className={sel} /></label>
        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
