"use client";
import { IconButton } from "@/components/_primitives/icon-button";

const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";

// Editor für eine Liste von Strings (z. B. USPs, Kategorien).
export function StrList({ label, items, setItems, placeholder }: { label: string; items: string[]; setItems: (x: string[]) => void; placeholder?: string }) {
  return (
    <div>
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{label}</span>
      <div className="flex flex-col gap-2">
        {items.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input value={v} onChange={(e) => setItems(items.map((x, j) => (j === i ? e.target.value : x)))} placeholder={placeholder} className={`${sel} flex-1`} />
            <IconButton icon="x" label="entfernen" onClick={() => setItems(items.filter((_, j) => j !== i))} tone="danger" />
          </div>
        ))}
      </div>
      <button onClick={() => setItems([...items, ""])} className="mt-2 rounded bg-surface-2 px-3 py-2 text-sm font-semibold text-muted hover:text-ink min-h-10">+ hinzufügen</button>
    </div>
  );
}
