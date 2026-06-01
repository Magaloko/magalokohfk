import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Verschoben: Der MasterMind-Plan lebt jetzt unter /mastermind.
// Slug bleibt erhalten (bestehende Links/Tabs funktionieren), leitet nur weiter.
export default function StrategieRedirect() {
  redirect("/mastermind");
}
