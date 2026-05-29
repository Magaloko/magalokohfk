import { requireUser } from "@/lib/auth-helpers";
import { MagShell } from "@/components/shell/mag-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sess = await requireUser(); // redirect zu /login wenn keine Session
  return <MagShell role={sess.tgRole}>{children}</MagShell>;
}
