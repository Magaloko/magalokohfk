import { requireUser, isAdmin, allowedAreas } from "@/lib/auth-helpers";
import { AkademieTabs } from "@/components/akademie/akademie-tabs";

export const dynamic = "force-dynamic";

export default async function AkademieLayout({ children }: { children: React.ReactNode }) {
  const sess = await requireUser();
  return (
    <>
      <AkademieTabs allowed={allowedAreas(sess)} isAdmin={isAdmin(sess)} />
      {children}
    </>
  );
}
