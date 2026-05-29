"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";

const TABS = [
  { href: "/cockpilot", icon: "sparkles", label: "Assistent & Guides" },
  { href: "/cockpilot/prompts", icon: "copy", label: "Prompt-Bibliothek" },
];

export function CockpilotTabs() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {TABS.map((t) => {
          const active = t.href === "/cockpilot" ? pathname === "/cockpilot" || pathname.startsWith("/cockpilot/guide") : pathname === t.href;
          return (
            <Link key={t.href} href={t.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                active ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
              )}>
              <Icon name={t.icon} className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
