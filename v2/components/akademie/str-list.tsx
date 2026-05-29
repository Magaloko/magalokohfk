"use client";
import { Icon } from "@/components/icon";

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
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-muted-2 hover:text-red" aria-label="entfernen"><Icon name="x" className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={() => setItems([...items, ""])} className="mt-2 rounded bg-surface-2 px-2 py-1 text-xs font-semibold text-muted hover:text-ink">+ hinzufügen</button>
    </div>
  );
}
