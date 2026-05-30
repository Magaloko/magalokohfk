import Script from "next/script";
import { requireUser, isSuperAdmin } from "@/lib/auth-helpers";
import { MagShell } from "@/components/shell/mag-shell";
import { TgReauth } from "@/components/shell/tg-reauth";
import { TgBoot } from "@/components/shell/tg-boot";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sess = await requireUser(); // redirect zu /login wenn keine Session
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <TgBoot />
      <TgReauth sessionTgUserId={sess.tgUserId} />
      <MagShell role={sess.tgRole} superAdmin={isSuperAdmin(sess)}>{children}</MagShell>
    </>
  );
}
