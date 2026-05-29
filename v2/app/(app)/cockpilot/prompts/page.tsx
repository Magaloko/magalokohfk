import { requireUser } from "@/lib/auth-helpers";
import { APPS, ROLES, COPILOT_PROMPTS } from "@/lib/copilot-kb";
import { PageShell } from "@/components/_primitives/page-shell";
import { PromptLibrary } from "@/components/cockpilot/prompt-library";

export const dynamic = "force-dynamic";

export default async function CockpilotPromptsPage() {
  await requireUser();
  return (
    <PageShell title="Prompt-Bibliothek" icon="copy" subtitle="Kopierfertige Copilot-Prompts für HFK — nach App und Rolle gefiltert">
      <PromptLibrary prompts={COPILOT_PROMPTS} apps={APPS} roles={ROLES} />
    </PageShell>
  );
}
