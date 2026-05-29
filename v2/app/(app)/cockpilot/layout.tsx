import { requireUser } from "@/lib/auth-helpers";
import { CockpilotTabs } from "@/components/cockpilot/cockpilot-tabs";

export const dynamic = "force-dynamic";

export default async function CockpilotLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <>
      <CockpilotTabs />
      {children}
    </>
  );
}
