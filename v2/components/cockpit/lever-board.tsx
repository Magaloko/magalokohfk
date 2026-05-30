"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";
import { cockpitMutate, errText } from "./mutate";

export type BoardLever = { id: string; title: string; area: string; status: string; impact: string; roi: number; confidence: string; risk: string };

const STATUSES = ["Backlog", "Geplant", "In Arbeit", "Live", "Verworfen"];
const colTone: Record<string, string> = {
  Backlog: "border-line", Geplant: "border-accent/40", "In Arbeit": "border-amber/50", Live: "border-green/50", Verworfen: "border-line",
};
const headTone: Record<string, string> = {
  Backlog: "text-muted-2", Geplant: "text-accent", "In Arbeit": "text-amber", Live: "text-green", Verworfen: "text-muted-2",
};

export function LeverBoard({ initial }: { initial: BoardLever[] }) {
  const router = useRouter();
  const [items, setItems] = useState<BoardLever[]>(initial);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; from: string } | null>(null);

  const colOf = (s: string) => (STATUSES.includes(s) ? s : "Backlog");

  async function moveTo(status: string) {
    const dr = dragRef.current; dragRef.current = null; setOver(null);
    if (!dr || dr.from === status || busy) return;
    setBusy(true);
    setItems((arr) => arr.map((l) => (l.id === dr.id ? { ...l, status } : l))); // optimistisch
    const r = await cockpitMutate({ collection: "levers", action: "update", id: dr.id, patch: { status } });
    setBusy(false);
    if (r.ok) router.refresh();
    else { setItems(initial); alert(errText(r.error)); }
  }

  const dragProps = (l: BoardLever) => busy ? {} : {
    draggable: true,
    onDragStart: (e: React.DragEvent) => { dragRef.current = { id: l.id, from: colOf(l.status) }; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", l.id); },
    onDragEnd: () => { dragRef.current = null; setOver(null); },
  };
  const colDrop = (status: string) => ({
    onDragOver: (e: React.DragEvent) => { if (dragRef.current) { e.preventDefault(); if (over !== status) setOver(status); } },
    onDragLeave: () => { if (over === status) setOver(null); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); moveTo(status); },
  });

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-2", busy && "opacity-70")}>
      {STATUSES.map((status) => {
        const cards = items.filter((l) => colOf(l.status) === status);
        const sum = cards.length;
        return (
          <div key={status} {...colDrop(status)}
            className={cn("flex w-[240px] shrink-0 flex-col rounded-xl border bg-surface-2/40 p-2 transition", colTone[status], over === status && "ring-2 ring-accent")}>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className={cn("text-xs font-bold uppercase tracking-wide", headTone[status])}>{status}</span>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted-2">{sum}</span>
            </div>
            <div className="flex min-h-[60px] flex-col gap-2">
              {cards.map((l) => (
                <div key={l.id} {...dragProps(l)}
                  className={cn("rounded-lg border border-line bg-surface p-3 shadow-sm", !busy && "cursor-grab active:cursor-grabbing")}>
                  <Link href={`/cockpit/hebel/${encodeURIComponent(l.id)}`} draggable={false} className="font-semibold leading-snug hover:text-accent">{l.title}</Link>
                  {l.area && <div className="mt-0.5 text-xs text-muted-2">{l.area}</div>}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="font-mono font-semibold text-green">{l.impact}</span>
                    <span className="inline-flex items-center gap-1 text-muted-2"><Icon name="kpi" className="h-3 w-3" />{l.roi.toLocaleString("de-AT")}</span>
                    {l.confidence && <span className="text-muted-2">Conf: {l.confidence}</span>}
                    {l.risk && <span className="text-muted-2">Risk: {l.risk}</span>}
                  </div>
                </div>
              ))}
              {!cards.length && <p className="px-1 py-2 text-xs text-muted-2">leer</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
