"use client";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

// Icon-only-Button mit garantierter Touch-Hit-Area (40/44px). Icon bleibt klein zentriert.
// Größe/Farbe nur über exklusive Props (nie via className) → keine Tailwind-Klassenkonflikte.
// className ausschließlich für Layout-Nudges (-ml-2 / -mr-2). type default "button" verhindert Form-Submit.
export function IconButton({
  icon, label, onClick, className, iconClassName = "h-4 w-4",
  type = "button", disabled, size = "md", tone = "default",
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  size?: "md" | "lg";
  tone?: "default" | "danger" | "strong";
}) {
  const sizes = { md: "h-10 w-10", lg: "h-11 w-11" };
  const tones = {
    default: "text-muted-2 hover:text-ink",
    danger: "text-muted-2 hover:text-red",
    strong: "text-ink",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={label}
      className={cn("grid shrink-0 place-items-center rounded-lg active:bg-surface-2 disabled:opacity-50",
        sizes[size], tones[tone], className)}>
      <Icon name={icon} className={iconClassName} />
    </button>
  );
}
