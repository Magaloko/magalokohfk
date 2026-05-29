import type { ReactNode } from "react";

// Zentrale Inline-SVG-Icons (Lucide-Stil, currentColor). Ersetzt Emojis in der Web-UI.
const P: Record<string, ReactNode> = {
  home: <><path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" /></>,
  calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  academy: <><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v4c0 1 3 2.5 6 2.5S18 17 18 16v-4" /></>,
  cockpit: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 1.5V1a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 17 2.6a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H23a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.0Z" transform="translate(0.5 0.5) scale(0.92) translate(0.5 0.5)" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" /></>,
  bolt: <><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.5" /></>,
  repeat: <><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>,
  chat: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.3A8.4 8.4 0 1 1 21 11.5Z" /></>,
  tag: <><path d="M3 7v5l9 9 7-7-9-9H5Z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M21 20a6 6 0 0 0-4-5.6" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  package: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  scenario: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v5M16 4v5M3 15h18" /></>,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  flame: <><path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 2 1 2 4a6 6 0 1 1-9-5c1.5-1.5 3-3 3-6Z" /></>,
  medal: <><circle cx="12" cy="15" r="5" /><path d="M9 10 6 2M15 10l3-8M11 13l1-2 1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 13.3Z" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  lever: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2" fill="currentColor" /><circle cx="15" cy="12" r="2" fill="currentColor" /><circle cx="8" cy="18" r="2" fill="currentColor" /></>,
  kpi: <><path d="M3 17l6-6 4 4 7-7" /><path d="M14 8h7v7" /></>,
  check: <><path d="M4 12.5 9 17.5 20 6.5" /></>,
  x: <><path d="M6 6l12 12M18 6 6 18" /></>,
  party: <><path d="M12 3v3M5 7l2 2M19 7l-2 2M3 14h3M18 14h3" /><path d="M9 21l3-9 3 9" /><circle cx="12" cy="12" r="0.5" /></>,
  trophy: <><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 18h6M10 21h4" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /><path d="M4 19a2 2 0 0 1 2-2h13" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></>,
  rocket: <><path d="M5 15c-2 2-2 5-2 5s3 0 5-2" /><path d="M9 13s1-7 8-10c0 7-3 10-8 11l-3-3Z" /><circle cx="14.5" cy="6.5" r="1.3" /></>,
  handshake: <><path d="M8 12 5 9l4-4 3 3 3-3 4 4-3 3" /><path d="M12 8l-2 2 2 2 2-2M6 13l4 4 2-2" /></>,
  key: <><circle cx="8" cy="14" r="4" /><path d="M11 11 21 1M17 5l3 3M15 7l2 2" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  bag: <><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
  undo: <><path d="M9 7 4 12l5 5" /><path d="M4 12h11a5 5 0 0 1 0 10h-1" /></>,
  send: <><path d="M4 12h14M12 6l6 6-6 6" /></>,
  footprints: <><path d="M7 4c1.5 0 2 1.5 2 3s-.5 4-2 4-2-1.5-2-3 .5-4 2-4ZM7 14h2v3a2 2 0 0 1-4 0v-2M17 7c1.5 0 2 1.5 2 3s-.5 4-2 4-2-1.5-2-3 .5-4 2-4ZM15 17h2v2a2 2 0 0 1-4 0" /></>,
  gem: <><path d="M6 3h12l3 6-9 12L3 9l3-6Z" /><path d="M3 9h18M9 3l-1 6 4 12 4-12-1-6" /></>,
  frown: <><circle cx="12" cy="12" r="9" /><path d="M8 15a5 5 0 0 1 8 0M9 9h.01M15 9h.01" /></>,
  money: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></>,
  pin: <><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  folder: <><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5A6 6 0 0 1 12 3Z" /></>,
  star: <><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9L12 3Z" /></>,
  edit: <><path d="M14 4 20 10 9 21H3v-6L14 4Z" /><path d="m12.5 6.5 5 5" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  "arrow-right": <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  masks: <><path d="M3 4h8v6a4 4 0 0 1-8 0V4Z" /><path d="M13 8h8v6a4 4 0 0 1-8 0" /><path d="M5 7h.01M9 7h.01M16 11h.01M19 11h.01" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  logout: <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>,
  dot: <><circle cx="12" cy="12" r="4" fill="currentColor" /></>,
};

export type IconName = keyof typeof P;

export function Icon({ name, className = "h-4 w-4" }: { name: IconName | string; className?: string }) {
  const body = P[name] ?? P.dot;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`} aria-hidden focusable="false">
      {body}
    </svg>
  );
}
