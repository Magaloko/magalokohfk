"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { PromptItem, AppKey, RoleKey } from "@/lib/copilot-kb";

export function PromptLibrary({ prompts, apps, roles }: {
  prompts: PromptItem[];
  apps: { key: AppKey; label: string; icon: string }[];
  roles: { key: RoleKey; label: string; icon: string }[];
}) {
  const [app, setApp] = useState<AppKey | "">("");
  const [role, setRole] = useState<RoleKey | "">("");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return prompts.filter((p) =>
      (!app || p.app === app) && (!role || p.role === role) &&
      (!needle || p.title.toLowerCase().includes(needle) || p.prompt.toLowerCase().includes(needle)));
  }, [prompts, app, role, q]);

  async function copy(p: PromptItem) {
    try { await navigator.clipboard.writeText(p.prompt); setCopied(p.id); setTimeout(() => setCopied(null), 1500); } catch { /* noop */ }
  }
  const chip = (active: boolean) => cn("rounded-full border px-3 py-1 text-xs font-medium transition", active ? "border-accent bg-accent/15 text-accent" : "border-line bg-surface-2 text-muted hover:text-ink");

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Prompts durchsuchen …"
          className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button onClick={() => setApp("")} className={chip(app === "")}>Alle Apps</button>
          {apps.map((a) => <button key={a.key} onClick={() => setApp(a.key)} className={chip(app === a.key)}>{a.label}</button>)}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button onClick={() => setRole("")} className={chip(role === "")}>Alle Rollen</button>
          {roles.map((r) => <button key={r.key} onClick={() => setRole(r.key)} className={chip(role === r.key)}>{r.label}</button>)}
        </div>
      </div>

      <p className="text-xs text-muted-2">{filtered.length} Prompt{filtered.length === 1 ? "" : "s"}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((p) => (
          <div key={p.id} className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="font-bold leading-snug">{p.title}</h3>
              <button onClick={() => copy(p)} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-surface-2 px-2.5 py-1 text-[11px] font-semibold hover:text-ink">
                <Icon name={copied === p.id ? "check" : "copy"} className="h-3 w-3" />{copied === p.id ? "Kopiert" : "Kopieren"}
              </button>
            </div>
            <p className="text-sm italic text-muted">„{p.prompt}“</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-2">{appLabelLocal(apps, p.app)}</span>
              {p.role && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">{roleLabelLocal(roles, p.role)}</span>}
            </div>
          </div>
        ))}
      </div>
      {!filtered.length && <p className="text-sm text-muted-2">Keine Prompts für diese Auswahl.</p>}
    </div>
  );
}

const appLabelLocal = (apps: { key: AppKey; label: string }[], k: AppKey) => apps.find((a) => a.key === k)?.label || k;
const roleLabelLocal = (roles: { key: RoleKey; label: string }[], k: RoleKey) => roles.find((r) => r.key === k)?.label || k;
