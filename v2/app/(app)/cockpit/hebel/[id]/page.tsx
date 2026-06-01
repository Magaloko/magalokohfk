import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function HebelIdRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect("/mago/hebel/" + encodeURIComponent(id));
}
