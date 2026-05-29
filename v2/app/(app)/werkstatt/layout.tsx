import { requireUser } from "@/lib/auth-helpers";
import { WerkstattTabs } from "@/components/werkstatt/werkstatt-tabs";

export const dynamic = "force-dynamic";

export default async function WerkstattLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <>
      <WerkstattTabs />
      {children}
    </>
  );
}
