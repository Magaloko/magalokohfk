import type { ReactNode } from "react";

export function EmptyState({ icon = "📭", title, hint }: { icon?: string; title: string; hint?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface/50 px-6 py-12 text-center">
      <div className="mb-2 text-3xl">{icon}</div>
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}
