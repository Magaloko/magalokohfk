import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

// Root: je nach Session weiterleiten.
export default async function Root() {
  const sess = await getSession();
  if (!sess) redirect("/login");
  redirect(isAdmin(sess) ? "/heute" : "/akademie");
}
