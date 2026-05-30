import { requireSuperAdmin } from "@/lib/auth-helpers";
import { MagoTabs } from "@/components/mago/mago-tabs";

export const dynamic = "force-dynamic";

// Magos privater Bereich — ausschließlich für den Super-Admin (Mago selbst).
export default async function MagoLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  return (
    <>
      <MagoTabs />
      {children}
    </>
  );
}
