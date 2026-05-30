"use client";
import { useState } from "react";
import { Icon } from "@/components/icon";

// Kopiert das fertig zusammengestellte Wochen-Briefing als Klartext (zum Senden an Stephan).
export function BriefingCopy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch { /* Clipboard nicht verfügbar */ }
  }
  return (
    <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">
      <Icon name={done ? "check" : "copy"} className="h-4 w-4" />
      {done ? "Kopiert" : "Briefing kopieren"}
    </button>
  );
}
