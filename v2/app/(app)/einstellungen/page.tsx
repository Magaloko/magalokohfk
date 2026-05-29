import { requireSuperAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/supabase-server";
import { PageShell } from "@/components/_primitives/page-shell";
import { UserManager } from "@/components/admin/user-manager";

export const dynamic = "force-dynamic";

export default async function EinstellungenPage() {
  await requireSuperAdmin(); // ausschließlich Super-Admin (Telegram-ID 544821565)
  const { data } = await db().from("bot_users").select("uid, name, role, modules, web_code_hash").order("added_at", { ascending: true });
  const users = (data || []).map((u) => ({
    uid: Number(u.uid), name: u.name || "", role: u.role || "mitarbeiter",
    modules: Array.isArray(u.modules) ? (u.modules as string[]) : [], hasCode: !!u.web_code_hash,
  }));
  return (
    <PageShell title="⚙️ Einstellungen" subtitle="Nur du (Super-Admin) verwaltest hier Zugänge, Rollen & Akademie-Bereiche">
      <UserManager initial={users} />
    </PageShell>
  );
}
