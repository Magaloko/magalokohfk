import type { ReactNode } from "react";
import { Icon } from "@/components/icon";

export function EmptyState({ icon = "folder", title, hint }: { icon?: string; title: string; hint?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface/50 px-6 py-12 text-center">
      <div className="mb-2 flex justify-center"><Icon name={icon} className="h-8 w-8 text-muted-2" /></div>
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}
