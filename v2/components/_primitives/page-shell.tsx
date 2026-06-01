import type { ReactNode } from "react";
import { Icon } from "@/components/icon";

export function PageShell({
  title, subtitle, action, icon, children,
}: { title: string; subtitle?: string; action?: ReactNode; icon?: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {icon && <Icon name={icon} className="h-7 w-7 text-accent" />}{title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
      </header>
      {children}
    </div>
  );
}
