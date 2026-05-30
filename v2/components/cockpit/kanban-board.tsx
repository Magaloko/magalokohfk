"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { cockpitMutate, errText } from "./mutate";

export type KanbanCard = { id: string; title: string; status: string; href?: string; primary?: string; badges?: string[] };

const headTone = (s: string) => {
  const v = s.toLowerCase();
  if (v.includes("live") || v.includes("erledigt")) return "text-green";
  if (v.includes("verworfen")) return "text-muted-2";
  if (v.includes("arbeit")) return "text-amber";
  if (v.includes("warte") || v.includes("block")) return "text-amber";
  if (v.includes("geplant")) return "text-accent";
  return "text-muted-2";
};
const borderTone = (s: string) => {
  const v = s.toLowerCase();
  if (v.includes("live") || v.includes("erledigt")) return "border-green/50";
  if (v.includes("arbeit")) return "border-amber/50";
  if (v.includes("geplant")) return "border-accent/40";
  return "border-line";
};

// Generisches Status-Board (Kanban) — Karten per Drag & Drop zwischen Spalten; Status via cockpitMutate.
export function KanbanBoard({ collection, statuses, cards }: { collection: string; statuses: string[]; cards: KanbanCard[] }) {
  const router = useRouter();
  const [items, setItems] = useState<KanbanCard[]>(cards);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; from: string } | null>(null);

  const colOf = (s: string) => (statuses.includes(s) ? s : statuses[0]);

  async function moveTo(status: string) {
    const dr = dragRef.current; dragRef.current = null; setOver(null);
    if (!dr || dr.from === status || busy) return;
    setBusy(true);
    setItems((arr) => arr.map((c) => (c.id === dr.id ? { ...c, status } : c)));
    const r = await cockpitMutate({ collection, action: "update", id: dr.id, patch: { status } });
    setBusy(false);
    if (r.ok) router.refresh();
    else { setItems(cards); alert(errText(r.error)); }
  }

  const dragProps = (c: KanbanCard) => busy ? {} : {
    draggable: true,
    onDragStart: (e: React.DragEvent) => { dragRef.current = { id: c.id, from: colOf(c.status) }; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", c.id); },
    onDragEnd: () => { dragRef.current = null; setOver(null); },
  };
  const colDrop = (status: string) => ({
    onDragOver: (e: React.DragEvent) => { if (dragRef.current) { e.preventDefault(); if (over !== status) setOver(status); } },
    onDragLeave: () => { if (over === status) setOver(null); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); moveTo(status); },
  });

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-2", busy && "opacity-70")}>
      {statuses.map((status) => {
        const cs = items.filter((c) => colOf(c.status) === status);
        return (
          <div key={status} {...colDrop(status)}
            className={cn("flex w-[240px] shrink-0 flex-col rounded-xl border bg-surface-2/40 p-2 transition", borderTone(status), over === status && "ring-2 ring-accent")}>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className={cn("text-xs font-bold uppercase tracking-wide", headTone(status))}>{status}</span>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted-2">{cs.length}</span>
            </div>
            <div className="flex min-h-[60px] flex-col gap-2">
              {cs.map((c) => (
                <div key={c.id} {...dragProps(c)} className={cn("rounded-lg border border-line bg-surface p-3 shadow-sm", !busy && "cursor-grab active:cursor-grabbing")}>
                  {c.href ? <Link href={c.href} draggable={false} className="font-semibold leading-snug hover:text-accent">{c.title}</Link> : <span className="font-semibold leading-snug">{c.title}</span>}
                  {(c.primary || c.badges?.length) && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      {c.primary && <span className="font-mono font-semibold text-green">{c.primary}</span>}
                      {c.badges?.filter(Boolean).map((b, j) => <span key={j} className="text-muted-2">{b}</span>)}
                    </div>
                  )}
                </div>
              ))}
              {!cs.length && <p className="px-1 py-2 text-xs text-muted-2">leer</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
