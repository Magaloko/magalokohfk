import type { TrainingType } from "./progress";

// Kuratierte Lernpfade — geführte Kurse, die auf vorhandene Akademie-Inhalte verweisen.
// `auto`: Trainings-Schritt, der NICHT manuell abgehakt wird, sondern als erfüllt gilt,
// sobald der Nutzer ein passendes Training (einer der genannten Typen) absolviert hat.
// Schritte ohne `auto` sind Lese-/Info-Schritte und werden manuell abgehakt.
export type PathStep = { title: string; hint?: string; href: string; auto?: TrainingType[] };
export type LearnPath = { id: string; icon: string; title: string; desc: string; steps: PathStep[] };

export const PATHS: LearnPath[] = [
  {
    id: "basics", icon: "rocket", title: "Verkaufs-Basics",
    desc: "Der Einstieg: Kundentypen verstehen & souverän auf Einwände antworten.",
    steps: [
      { title: "Personas kennenlernen", hint: "Wer kauft bei uns?", href: "/akademie/personas" },
      { title: "Einwände studieren", hint: "Antworten auf typische Einwände", href: "/akademie/einwaende" },
      { title: "Quick-Quiz bestehen", hint: "5 gemischte Fragen", href: "/akademie/drills", auto: ["quiz"] },
      { title: "Szenario meistern", hint: "Ein Gespräch durchspielen", href: "/akademie/szenarien", auto: ["szenario"] },
    ],
  },
  {
    id: "marken", icon: "tag", title: "Marken-Profi",
    desc: "Produktwissen, das im Verkaufsgespräch überzeugt.",
    steps: [
      { title: "Marken-Bibel lesen", hint: "Herkunft, USPs, Hero-Produkte", href: "/akademie/marken" },
      { title: "Drill-Training", hint: "Marken-Drills üben", href: "/akademie/drills", auto: ["drill"] },
      { title: "Wissen testen", hint: "Quick-Quiz", href: "/akademie/drills", auto: ["quiz"] },
    ],
  },
  {
    id: "gespraech", icon: "mic", title: "Gesprächs-Champion",
    desc: "Vom Skript zum echten Verkaufsgespräch — mit KI-Kunde.",
    steps: [
      { title: "Szenario spielen", hint: "Mehrstufige Übung", href: "/akademie/szenarien", auto: ["szenario"] },
      { title: "KI-Live-Rollenspiel", hint: "Mit KI-Kunde sprechen & Coach-Feedback", href: "/akademie/rollenspiele", auto: ["rollenspiel"] },
      { title: "Abschluss-Quiz", hint: "Gelerntes festigen", href: "/akademie/drills", auto: ["quiz"] },
    ],
  },
  {
    id: "einwand", icon: "chat", title: "Einwand-Meister",
    desc: "Jeden Einwand souverän in einen Abschluss verwandeln.",
    steps: [
      { title: "Einwände-Bibliothek lesen", hint: "Antworten & Beweise", href: "/akademie/einwaende" },
      { title: "Quick-Quiz", hint: "Einwand-Antworten testen", href: "/akademie/drills", auto: ["quiz"] },
      { title: "Szenario mit Einwänden", hint: "Im Gespräch anwenden", href: "/akademie/szenarien", auto: ["szenario"] },
      { title: "Rollenspiel", hint: "Live gegen echte Einwände", href: "/akademie/rollenspiele", auto: ["rollenspiel"] },
    ],
  },
  {
    id: "copilot", icon: "sparkles", title: "Microsoft-Copilot-Profi",
    desc: "Im Arbeitsalltag mit Microsoft 365 Copilot schneller werden — Outlook, Excel, Word, Teams.",
    steps: [
      { title: "Outlook: Posteingang priorisieren", hint: "Mails zusammenfassen & sortieren", href: "/cockpilot/guide/outlook-inbox-triage" },
      { title: "Outlook: Antwort entwerfen", hint: "Kundenanfrage in Sekunden beantworten", href: "/cockpilot/guide/outlook-reply-draft" },
      { title: "Excel: Verkaufszahlen analysieren", hint: "Trends & Empfehlungen ohne Formeln", href: "/cockpilot/guide/excel-analyze-sales" },
      { title: "Word: Beratungsprotokoll erstellen", hint: "Aus Stichpunkten ein Dokument", href: "/cockpilot/guide/word-draft" },
      { title: "Teams: Meeting-Recap & Aufgaben", hint: "Zusammenfassung & Action Items", href: "/cockpilot/guide/teams-recap" },
    ],
  },
  {
    id: "beratung", icon: "handshake", title: "Premium-Beratung",
    desc: "Hochwertig beraten: vom Bedarf zur passenden Empfehlung.",
    steps: [
      { title: "Angebote kennen", hint: "Beratungs- & Service-Pakete", href: "/akademie/angebote" },
      { title: "Personas verstehen", hint: "Bedarf je Kundentyp", href: "/akademie/personas" },
      { title: "Marken-Wissen", hint: "Passende Hero-Produkte", href: "/akademie/marken" },
      { title: "Rollenspiel: Beratung", hint: "Alles zusammenführen", href: "/akademie/rollenspiele", auto: ["rollenspiel"] },
    ],
  },
];

export const getPath = (id: string) => PATHS.find((p) => p.id === id);
