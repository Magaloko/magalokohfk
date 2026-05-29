import { redirect } from "next/navigation";
import { requireUser, isAdmin, allowedAreas } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

// /akademie → erste erlaubte Sektion
export default async function AkademieIndex() {
  const sess = await requireUser();
  const first = isAdmin(sess) ? "drills" : (allowedAreas(sess)[0] || "drills");
  redirect(`/akademie/${first}`);
}
