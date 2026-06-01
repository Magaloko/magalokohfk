import { requireAdmin } from "@/lib/auth-helpers";
import { aiConfigured } from "@/lib/ai";
import { getCockpitData } from "@/lib/cockpit";
import { getAllStephanMessages } from "@/lib/stephan-thread";
import { getStyleProfile } from "@/lib/stephan-style";
import { findChatCreatedItems } from "@/lib/stephan-timeline";
import { PageShell } from "@/components/_primitives/page-shell";
import { StephanAssist } from "@/components/cockpit/stephan-assist";

export const dynamic = "force-dynamic";

export default async function StephanPage({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const activeThread = (typeof sp?.thread === "string" && sp.thread.trim().slice(0, 60)) || "stephan";

  const [all, cockpit, styleProfile] = await Promise.all([getAllStephanMessages(), getCockpitData(), getStyleProfile()]);
  const threadNames = Array.from(new Set(["stephan", ...all.map((m) => m.thread || "stephan")]));
  const messages = all.filter((m) => (m.thread || "stephan") === activeThread);
  const createdItems = findChatCreatedItems(cockpit);
  const openDecisions = cockpit.decisions
    .filter((d) => (d.status || "offen") !== "entschieden" && d.status !== "verworfen")
    .map((d) => ({ id: String(d.id || ""), titel: d.titel || "Entscheidung" }))
    .filter((d) => d.id);

  return (
    <PageShell title="Stephan-Assistent" icon="chat" subtitle="Antwort entwerfen · Gespräch festhalten · auf Basis der MasterMind-Daten">
      <StephanAssist
        configured={aiConfigured()}
        activeThread={activeThread}
        threadNames={threadNames}
        messages={messages}
        allMessages={all}
        createdItems={createdItems}
        openDecisions={openDecisions}
        styleProfile={styleProfile}
      />
    </PageShell>
  );
}
