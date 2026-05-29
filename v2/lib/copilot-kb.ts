// Typisierte Hülle über die gemeinsame Datendatei copilot-kb.mjs.
// Eine Quelle für Web-App UND Telegram-Bot — hier nur Typen + Re-Export.
import * as KB from "./copilot-kb.mjs";

export type AppKey = "outlook" | "excel" | "word" | "teams";
export type GuideStep = { title: string; detail: string; prompt?: string };
export type CopilotGuide = { id: string; app: AppKey; title: string; goal: string; minutes: number; steps: GuideStep[]; tips?: string[] };

export const APPS = KB.APPS as { key: AppKey; label: string; icon: string }[];
export const COPILOT_GUIDES = KB.COPILOT_GUIDES as CopilotGuide[];
export const COPILOT_FAQ = KB.COPILOT_FAQ as { q: string; a: string }[];
export const appLabel = KB.appLabel as (k: AppKey) => string;
export const getGuide = KB.getGuide as (id: string) => CopilotGuide | undefined;
export const guidesByApp = KB.guidesByApp as (app: AppKey) => CopilotGuide[];
export const buildCopilotKB = KB.buildCopilotKB as () => string;
export const copilotSystemPrompt = KB.copilotSystemPrompt as (kb: string, today: string, channel?: "web" | "telegram") => string;
