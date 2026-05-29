// Kuratierte Lernpfade — geführte Kurse, die auf vorhandene Akademie-Inhalte verweisen.
export type PathStep = { title: string; hint?: string; href: string };
export type LearnPath = { id: string; icon: string; title: string; desc: string; steps: PathStep[] };

export const PATHS: LearnPath[] = [
  {
    id: "basics", icon: "🚀", title: "Verkaufs-Basics",
    desc: "Der Einstieg: Kundentypen verstehen & souverän auf Einwände antworten.",
    steps: [
      { title: "Personas kennenlernen", hint: "Wer kauft bei uns?", href: "/akademie/personas" },
      { title: "Einwände studieren", hint: "Antworten auf typische Einwände", href: "/akademie/einwaende" },
      { title: "Quick-Quiz bestehen", hint: "5 gemischte Fragen", href: "/akademie/drills" },
      { title: "Szenario meistern", hint: "Ein Gespräch durchspielen", href: "/akademie/szenarien" },
    ],
  },
  {
    id: "marken", icon: "🏷", title: "Marken-Profi",
    desc: "Produktwissen, das im Verkaufsgespräch überzeugt.",
    steps: [
      { title: "Marken-Bibel lesen", hint: "Herkunft, USPs, Hero-Produkte", href: "/akademie/marken" },
      { title: "Drill-Training", hint: "Marken-Drills üben", href: "/akademie/drills" },
      { title: "Wissen testen", hint: "Quick-Quiz", href: "/akademie/drills" },
    ],
  },
  {
    id: "gespraech", icon: "🎙", title: "Gesprächs-Champion",
    desc: "Vom Skript zum echten Verkaufsgespräch — mit KI-Kunde.",
    steps: [
      { title: "Szenario spielen", hint: "Mehrstufige Übung", href: "/akademie/szenarien" },
      { title: "KI-Live-Rollenspiel", hint: "Mit KI-Kunde sprechen & Coach-Feedback", href: "/akademie/rollenspiele" },
      { title: "Abschluss-Quiz", hint: "Gelerntes festigen", href: "/akademie/drills" },
    ],
  },
  {
    id: "einwand", icon: "💬", title: "Einwand-Meister",
    desc: "Jeden Einwand souverän in einen Abschluss verwandeln.",
    steps: [
      { title: "Einwände-Bibliothek lesen", hint: "Antworten & Beweise", href: "/akademie/einwaende" },
      { title: "Quick-Quiz", hint: "Einwand-Antworten testen", href: "/akademie/drills" },
      { title: "Szenario mit Einwänden", hint: "Im Gespräch anwenden", href: "/akademie/szenarien" },
      { title: "Rollenspiel", hint: "Live gegen echte Einwände", href: "/akademie/rollenspiele" },
    ],
  },
  {
    id: "beratung", icon: "🤝", title: "Premium-Beratung",
    desc: "Hochwertig beraten: vom Bedarf zur passenden Empfehlung.",
    steps: [
      { title: "Angebote kennen", hint: "Beratungs- & Service-Pakete", href: "/akademie/angebote" },
      { title: "Personas verstehen", hint: "Bedarf je Kundentyp", href: "/akademie/personas" },
      { title: "Marken-Wissen", hint: "Passende Hero-Produkte", href: "/akademie/marken" },
      { title: "Rollenspiel: Beratung", hint: "Alles zusammenführen", href: "/akademie/rollenspiele" },
    ],
  },
];

export const getPath = (id: string) => PATHS.find((p) => p.id === id);
