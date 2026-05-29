// Typisierte Hülle über die gemeinsame Datendatei copilot-kb.mjs.
// Eine Quelle für Web-App UND Telegram-Bot — hier nur Typen + Re-Export.
import * as KB from "./copilot-kb.mjs";

export type AppKey = "outlook" | "excel" | "word" | "teams" | "powerpoint" | "copilotchat";
export type RoleKey = "einkauf" | "marketing" | "buchhaltung";
export type GuideStep = { title: string; detail: string; prompt?: string };
export type CopilotGuide = { id: string; app: AppKey; role?: RoleKey; title: string; goal: string; minutes: number; steps: GuideStep[]; tips?: string[] };
export type PromptItem = { id: string; app: AppKey; role?: RoleKey; title: string; prompt: string };

export const APPS = KB.APPS as { key: AppKey; label: string; icon: string }[];
export const ROLES = KB.ROLES as { key: RoleKey; label: string; icon: string }[];
export const COPILOT_GUIDES = KB.COPILOT_GUIDES as CopilotGuide[];
export const COPILOT_FAQ = KB.COPILOT_FAQ as { q: string; a: string }[];
export const COPILOT_PROMPTS = KB.COPILOT_PROMPTS as PromptItem[];
export const appLabel = KB.appLabel as (k: AppKey) => string;
export const roleLabel = KB.roleLabel as (k: RoleKey) => string;
export const getGuide = KB.getGuide as (id: string) => CopilotGuide | undefined;
export const guidesByApp = KB.guidesByApp as (app: AppKey) => CopilotGuide[];
export const guidesByRole = KB.guidesByRole as (role: RoleKey) => CopilotGuide[];
export const buildCopilotKB = KB.buildCopilotKB as () => string;
export const copilotSystemPrompt = KB.copilotSystemPrompt as (kb: string, today: string, channel?: "web" | "telegram") => string;
