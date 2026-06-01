import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Komfort-Redirect: /vektra → /akademie (der Trainer-/VEKTRA-Bereich).
export default function VektraRedirect() {
  redirect("/akademie");
}
