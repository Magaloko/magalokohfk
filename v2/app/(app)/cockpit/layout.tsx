import { requireAdmin } from "@/lib/auth-helpers";
import { CockpitTabs } from "@/components/cockpit/cockpit-tabs";

export const dynamic = "force-dynamic";

export default async function CockpitLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <CockpitTabs />
      {children}
    </>
  );
}
