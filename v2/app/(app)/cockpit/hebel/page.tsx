import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default function HebelRedirect() {
  redirect("/mago/hebel");
}
