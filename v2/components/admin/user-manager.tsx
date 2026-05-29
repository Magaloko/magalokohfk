"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icon";

const AREAS: { key: string; label: string }[] = [
  { key: "drills", label: "Drills" }, { key: "marken", label: "Marken" }, { key: "einwaende", label: "Einwände" },
  { key: "personas", label: "Personas" }, { key: "szenarien", label: "Szenarien" }, { key: "rollenspiele", label: "Rollenspiele" },
  { key: "angebote", label: "Angebote" },
];

type User = { uid: number; name: string; role: string; modules: string[]; hasCode: boolean };

async function api(body: Record<string, unknown>) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const init = (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData) || "";
  if (init) headers["X-Tg-Init"] = init;
  const r = await fetch("/api/admin/users", { method: "POST", headers, body: JSON.stringify(body) });
  return r.ok ? r.json() : null;
}

export function UserManager({ initial }: { initial: User[] }) {
  const [users, setUsers] = useState<User[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [codes, setCodes] = useState<Record<number, string>>({});
  const [newUid, setNewUid] = useState("");
  const [newName, setNewName] = useState("");

  async function refresh() {
    const r = await fetch("/api/admin/users").then((x) => (x.ok ? x.json() : null)).catch(() => null);
    if (r?.users) setUsers(r.users);
  }
  async function run(body: Record<string, unknown>, note = "") {
    setBusy(true); setMsg("");
    const r = await api(body);
    if (r?.ok) { if (note) setMsg(note); await refresh(); }
    else setMsg("Fehler — bitte erneut versuchen.");
    setBusy(false);
    return r;
  }

  async function addUser() {
    const uid = Number(newUid.trim());
    if (!Number.isInteger(uid) || uid <= 0) { setMsg("Gültige Telegram-ID eingeben (Zahlen)."); return; }
    await run({ action: "add", uid, name: newName.trim() }, "Mitarbeiter hinzugefügt.");
    setNewUid(""); setNewName("");
  }
  const setRole = (uid: number, role: string) => run({ action: "setRole", uid, role });
  const toggleArea = (u: User, area: string) => {
    const has = u.modules.includes(area);
    const modules = has ? u.modules.filter((m) => m !== area) : [...u.modules, area];
    run({ action: "setAreas", uid: u.uid, modules });
  };
  const webcode = async (uid: number) => { const r = await run({ action: "webcode", uid }, ""); if (r?.code) setCodes((c) => ({ ...c, [uid]: r.code })); };
  const remove = (uid: number) => { if (confirm("Diesen Mitarbeiter wirklich entfernen?")) run({ action: "remove", uid }, "Entfernt."); };

  const inp = "rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";

  return (
    <div className="flex flex-col gap-5">
      {/* Neuer Mitarbeiter */}
      <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-2"><Icon name="plus" className="h-3.5 w-3.5" /> Mitarbeiter hinzufügen</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block"><span className="mb-1 block text-[11px] uppercase text-muted-2">Telegram-ID</span><input value={newUid} onChange={(e) => setNewUid(e.target.value)} inputMode="numeric" placeholder="z. B. 123456789" className={cn(inp, "w-40")} /></label>
          <label className="block"><span className="mb-1 block text-[11px] uppercase text-muted-2">Name</span><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Vorname" className={cn(inp, "w-48")} /></label>
          <button onClick={addUser} disabled={busy} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">Hinzufügen</button>
        </div>
        <p className="mt-2 text-xs text-muted-2">Die Telegram-ID erhältst du vom Mitarbeiter via <code>/myid</code> im Bot.</p>
        {msg && <p className="mt-2 text-sm text-accent">{msg}</p>}
      </section>

      {/* Liste */}
      <section className="flex flex-col gap-3">
        {users.map((u) => {
          const admin = u.role === "admin";
          return (
            <div key={u.uid} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold">{u.name || "—"} <span className="font-mono text-xs text-muted-2">#{u.uid}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={u.role} onChange={(e) => setRole(u.uid, e.target.value)} disabled={busy} className={inp}>
                    <option value="mitarbeiter">Mitarbeiter</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => webcode(u.uid)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold hover:text-ink disabled:opacity-50"><Icon name="key" className="h-4 w-4" /> Web-Code</button>
                  <button onClick={() => remove(u.uid)} disabled={busy} className="rounded-lg bg-red/10 px-3 py-2 text-sm font-semibold text-red hover:bg-red/20 disabled:opacity-50">Entfernen</button>
                </div>
              </div>
              {codes[u.uid] && <p className="mt-2 rounded-lg bg-green/10 px-3 py-2 text-sm text-green">Web-Code (nur einmal sichtbar): <code className="font-bold">{codes[u.uid]}</code> — dem Mitarbeiter für den Browser-Login geben.</p>}
              <div className="mt-3">
                <span className="mb-1 block text-[11px] uppercase text-muted-2">Akademie-Bereiche {admin && "(Admin sieht alles)"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {AREAS.map((a) => {
                    const on = admin || u.modules.includes(a.key);
                    return (
                      <button key={a.key} onClick={() => !admin && toggleArea(u, a.key)} disabled={busy || admin}
                        className={cn("rounded-full px-3 py-1 text-xs font-semibold transition",
                          on ? "bg-accent/15 text-accent" : "bg-surface-2 text-muted-2 hover:text-ink", admin && "opacity-60")}>
                        {(u.modules.includes(a.key) || admin) && <Icon name="check" className="h-3 w-3 mr-0.5" />}{a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        {!users.length && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted-2">Noch keine Mitarbeiter. Oben hinzufügen.</p>}
      </section>
    </div>
  );
}
