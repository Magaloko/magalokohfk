# MasterMind-Fragen im Plan — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Pro Werkzeug (+ Querschnitt/Future) die offenen Klärungsfragen an Stephan im `/mastermind`-Plan anzeigen, beantwortbar machen (Status + Antwort), persistent speichern und beantwortete Q&A in den Stephan-Copiloten einspeisen.

**Architecture:** Statischer Fragenkatalog (Code-Konstante) + erfassbare Antwort-Sammlung `mastermindAntworten` über die bestehende Mutate-API (Optimistic-Lock + Anti-Wipe). Anzeige via Client-`FragenBlock` im (sync bleibenden) PlanView; die Seite lädt die Antworten und reicht sie als Prop durch.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4. Bestehende Muster: `lib/mago.ts` (Reader), `lib/cockpit-write.ts` (Write), `app/api/cockpit/mutate/route.ts` (SPEC).

**Spec:** `docs/superpowers/specs/2026-06-01-mastermind-fragen-design.md` · Fragetexte: `docs/mastermind-fragen-stephan.md`

**Verifikation pro Task:** `tsc --noEmit` aus `F:\JTL_Export\JTL_Export\magaloko\v2`:
```powershell
Set-Location F:\JTL_Export\JTL_Export\magaloko\v2; .\node_modules\.bin\tsc.cmd --noEmit
```
**Commits direkt auf `main`.** Kein Unit-Runner — `tsc` + Prod-Browser (inkl. echtem Schreib-Roundtrip in Task 7).

**Zwei verbindliche Korrekturen (aus der Verifikation):**
1. **PlanView bleibt synchron** — die **Seite** holt `antworten` und übergibt sie als Prop; PlanView wird NICHT async.
2. **Doppel-Record-Guard** — `createItem` liefert die neue id nicht zurück; der `FragenBlock` sperrt nach einem Create bis zum `router.refresh()` (Flag `pendingCreate`, Reset via `useEffect` auf `record?.id`).

**Out of Scope:** eigene Fragen hinzufügen, Fragen-CRUD, andere Seiten/Werkzeuge, der `MASTERMIND`-Plan-Inhalt.

---

## File Structure
- **Neu:** `v2/lib/mastermind-fragen.ts` (Katalog, client-safe), `v2/lib/mastermind.ts` (Reader, server), `v2/components/mastermind/fragen-block.tsx` (Client).
- **Geändert:** `v2/app/api/cockpit/mutate/route.ts` (+SPEC), `v2/lib/cockpit-write.ts` (+PROTECTED), `v2/components/mastermind/plan-view.tsx` (+Blöcke, +Prop), `v2/app/(app)/mastermind/page.tsx` (+Reader/Prop), `v2/lib/stephan-context.ts` (+KLÄRUNGEN-Block).

---

### Task 1: Fragenkatalog — `lib/mastermind-fragen.ts`

**Files:** Create `v2/lib/mastermind-fragen.ts`

- [ ] **Step 1: Datei anlegen** (Texte 1:1 aus `docs/mastermind-fragen-stephan.md`)

```ts
// Statischer MasterMind-Fragenkatalog (abgeleitet aus lib/strategy.ts / MASTERMIND v2.0).
// Client-safe: reine Daten, KEINE Server-Imports. Antworten werden separat in app_state
// (Sammlung mastermindAntworten) erfasst und über frageId = id verknüpft.

export type FragePrio = "P0" | "P1" | "P2" | "P3" | "P4";
export type FrageEbene = "GF-SAFE" | "TEAM" | "PUBLIC";
export type MasterMindFrage = {
  id: string;
  werkzeug: string; // Tool-Key (treasury/einkauf/vipa/sebo/vektra) ODER "querschnitt" / "future"
  prio: FragePrio;
  frage: string;
  ebene?: FrageEbene;
};

export const MASTERMIND_FRAGEN: MasterMindFrage[] = [
  // Querschnitt / Foundation (P0)
  { id: "qs-1", werkzeug: "querschnitt", prio: "P0", ebene: "GF-SAFE", frage: "Datenquellen-Inventur: Welche Systeme speisen die HFK-Datenschicht (JTL Wawi/eazybusiness, Web-Shop, Banking, Lieferanten-Portale, Buchhaltung)? Was per API, was nur per Export?" },
  { id: "qs-2", werkzeug: "querschnitt", prio: "P0", ebene: "GF-SAFE", frage: "ERP-Connector: Aktuelles ERP = JTL Wawi? Welche Tabellen/Felder sind verlässlich gepflegt (tBestellung, tBestellpos, tArtikel, tWarenLager)? Wo ist die Datenqualität schwach?" },
  { id: "qs-3", werkzeug: "querschnitt", prio: "P0", frage: "Vertrauensebenen konkret: Wer hat GF-SAFE-Zugriff (nur Stephan/Beate? Lorna? Sarah?)? Wie werden TEAM- und PUBLIC-Felder operativ getrennt? Wer vergibt Rechte?" },
  { id: "qs-4", werkzeug: "querschnitt", prio: "P0", ebene: "GF-SAFE", frage: "Hosting & Datenschutz: Wo dürfen GF-SAFE-Daten (Margen, Konditionen, Bankdaten) liegen — Cloud-Region, DSGVO-Auflagen, Auftragsverarbeitung?" },
  { id: "qs-5", werkzeug: "querschnitt", prio: "P0", frage: "Daten-Ownership & Pflege-Rhythmus: Wer pflegt welche Daten und wie oft (Marken = Lorna? Finanzen = Beate? Sales-Daten = Sarah? Marketing = Adnan?)?" },
  { id: "qs-6", werkzeug: "querschnitt", prio: "P0", frage: "Abnahme-Standard: Was ist dein Abnahme-Kriterium pro Werkzeug (wer testet, wie lange Pilot, was muss erfüllt sein für „live“)?" },
  { id: "qs-7", werkzeug: "querschnitt", prio: "P0", frage: "Reihenfolge-Bestätigung: Bleibt es bei Foundation → Treasury → Einkauf? Oder zwingt der Liquiditäts-Druck zu einem schlanken Treasury-Vorlauf parallel zur Foundation?" },

  // Treasury (P0)
  { id: "tre-1", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Kontokorrent: Aktueller Rahmen, aktueller Stand, Zielreduktion bis wann? Zinssatz?" },
  { id: "tre-2", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Cash-Inflows: Quellen & Systeme für Zuflüsse (Tagesumsätze stationär + Shop, offene Forderungen, Zahlungsziele)?" },
  { id: "tre-3", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Cash-Outflows: Fixkosten (Miete Kirchengasse 7, Gehälter, Versicherungen), Lieferantenverbindlichkeiten, Steuern, Leasing — Höhe & Fälligkeiten?" },
  { id: "tre-4", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "180-Tage-Forecast: Welche Positionen müssen wöchentlich rein? Welche Genauigkeit gilt als „belastbar“ (Ziel-%)? Wer kalibriert?" },
  { id: "tre-5", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Order-Ampel-Schwelle: Bestätigst du die 2.000-€-Grenze für die Prüfung? Wer darf „rot“ überschreiben (nur GF)? Wie werden die 3 Alternativ-Vorschläge gewichtet?" },
  { id: "tre-6", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Konfidenz-Gewichte: Bleiben 1,0 / 0,9 / 0,7 für hoch/mittel/niedrig? Wer setzt die Konfidenz je Forecast-Position?" },
  { id: "tre-7", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Skonto-Landschaft: Welche Lieferanten bieten Skonto, zu welchen Konditionen (z. B. 2 % / 10 Tage netto 30)? Ab welchem effektiven Jahreszins lohnt das Ziehen?" },
  { id: "tre-8", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Saisonalität: Welche Monate sind die kritischen Liquiditäts-Tiefpunkte? Wie wirken die 14–18 Wochen Eigenmarken-Vorlauf konkret?" },
  { id: "tre-9", werkzeug: "treasury", prio: "P0", ebene: "GF-SAFE", frage: "Liqui-Cockpit-Szenarien: Welche Szenario-Schieber braucht die GF (Umsatz ±, Zahlungsziel-Verschiebung, Großorder, Lieferanten-Ausfall)?" },

  // Einkaufssystem (P1)
  { id: "ein-1", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "A/B/C-Klassen & DB1: Wie definierst du „A-Klasse / hoher DB1“ (Schwellen)? Woher kommt der DB1 je Artikel verlässlich?" },
  { id: "ein-2", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "Autopilot-Grenze: Darf das System Renner eigenständig nachbestellen oder nur vorschlagen (Buyer-Review)? Bis zu welchem Order-Volumen autonom?" },
  { id: "ein-3", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "Penner-Definition: Ab wann ist ein Artikel ein „Penner“ (Sell-Through-Schwelle, Lagerdauer, Kapitalbindung)?" },
  { id: "ein-4", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "Markdown-Logik: Sell-Through-Markdown-Stufen je Kategorie + Floor (Mindestmarge), unter den nie reduziert wird?" },
  { id: "ein-5", werkzeug: "einkauf", prio: "P1", frage: "Event-Kalender: Welche Events steuern HFK wirklich (Black Friday, Schulanfang, Weihnachten, Mode-Saisonwechsel) — mit welchen Vorlaufzeiten?" },
  { id: "ein-6", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "OOS-Frühwarnung: Lieferzeit-Range je Lieferant/Kategorie (Mode vs. KiWa/Möbel = 14–18 Wochen?)? Safety-Buffer je Kategorie?" },
  { id: "ein-7", werkzeug: "einkauf", prio: "P1", ebene: "GF-SAFE", frage: "Zielkauf KiWa & Möbel: Bestätigung Vorkasse/auftragsorientiert? Welche Lieferanten, welche Konditionen?" },
  { id: "ein-8", werkzeug: "einkauf", prio: "P1", frage: "Top-20-Renner-Sichtbarkeit: Woran misst sich „Sichtbarkeit“ (Shop-Position, Bestand, Platzierung im Store)? Was ist ein „Rhythm-Break“?" },

  // VIPA (P2)
  { id: "vip-1", werkzeug: "vipa", prio: "P2", ebene: "GF-SAFE", frage: "Mail-Zugang: Welches Postfach, welche Rechte (nur Lesen/Triage vs. auch Senden)?" },
  { id: "vip-2", werkzeug: "vipa", prio: "P2", frage: "Mail-Klassen: Welche Kategorien priorisieren (Lieferant, Steuer/Behörde, Kunde, intern, Bank)? Was ist „kritisch“?" },
  { id: "vip-3", werkzeug: "vipa", prio: "P2", ebene: "GF-SAFE", frage: "Reminder-Quellen: Welche Fristen proaktiv (Skonto, Steuertermine, Lieferungen) — woher kommen die Termine (Kalender, Buchhaltung)?" },
  { id: "vip-4", werkzeug: "vipa", prio: "P2", frage: "Delegation (Team-Task-Sub): Wer ist für was die „richtige Person“ (Lorna/Marken, Sarah/Sales-Service, Adnan/Marketing, Beate/Finanzen)? Delegations-Regeln?" },
  { id: "vip-5", werkzeug: "vipa", prio: "P2", frage: "HFK-Ton: 2–3 Referenz-Mails, an denen VIPA den Schreibstil lernt?" },
  { id: "vip-6", werkzeug: "vipa", prio: "P2", frage: "Kanäle: Sollen Anruf & WhatsApp wirklich zu Tasks werden — welche Nummern/Accounts (WhatsApp Business)?" },
  { id: "vip-7", werkzeug: "vipa", prio: "P2", ebene: "GF-SAFE", frage: "Autonomie-Grenze: Was darf VIPA selbst senden vs. nur vorbereiten (Mensch-im-Loop)?" },

  // SeBo (P2)
  { id: "seb-1", werkzeug: "sebo", prio: "P2", frage: "Kanäle & Volumen: Wo kommen Service-Anfragen rein (Mail, Shop-Kontaktformular, WhatsApp)? Wie viele pro Tag?" },
  { id: "seb-2", werkzeug: "sebo", prio: "P2", frage: "5 Kategorien: Bestätigung Retoure / Lieferung / Rechnung / Produkt / Sonstiges — oder fehlt eine (z. B. Reklamation, Beratung)?" },
  { id: "seb-3", werkzeug: "sebo", prio: "P2", ebene: "GF-SAFE", frage: "Datenabruf: Welche Bestelldaten per Bestellnummer (aus Wawi/Shop) darf SeBo ziehen?" },
  { id: "seb-4", werkzeug: "sebo", prio: "P2", ebene: "TEAM", frage: "Policies für korrekte Antworten: Retouren-Fristen & -Kosten, Versandregeln, Rechnungs-Handling — die harten Regeln, damit SeBo nicht halluziniert." },
  { id: "seb-5", werkzeug: "sebo", prio: "P2", frage: "Eskalation & SLA: Wer ist der Mensch im Loop (Sarah/Service?)? Antwort-SLA? Wann „manuelle Prüfung“?" },

  // VEKTRA (P3, live — Ausbau)
  { id: "vek-1", werkzeug: "vektra", prio: "P3", ebene: "TEAM", frage: "Inhalts-Lücken: Welche Marken-Profile fehlen noch / sind veraltet? Wer pflegt sie verbindlich (Lorna)?" },
  { id: "vek-2", werkzeug: "vektra", prio: "P3", ebene: "TEAM", frage: "Sales-Cockpit / Live-Lookup: Welche Live-Daten braucht das Team im Verkaufsgespräch (Bestand, Größe/Schnitt, Liefertermin, Preis)?" },
  { id: "vek-3", werkzeug: "vektra", prio: "P3", frage: "Verbindlicher Rollout: Wer nutzt VEKTRA verpflichtend, mit welchem Ziel? Wie messen wir „neue Mitarbeitende in 3 statt 12 Monaten einsatzbereit“?" },
  { id: "vek-4", werkzeug: "vektra", prio: "P3", frage: "Management-Sicht: Welche KPIs will das Store-Management je Mitarbeiter sehen (Trainings, Quote, Schwächen)?" },

  // Future Scope & Strategisch (P4)
  { id: "fut-1", werkzeug: "future", prio: "P4", ebene: "GF-SAFE", frage: "Brand Intelligence — Wiederaufnahme: Welches Signal/Datum löst die Reaktivierung aus? Bestätigung der „12 Felder je Marke“? Quelle für den wöchentlichen „Brand Pulse“?" },
  { id: "fut-2", werkzeug: "future", prio: "P4", frage: "Customer App 2027: Budget/Förderung geklärt? Datenquellen für die Killer-Features (Babywetter, Größenrechner mit Marken-Schnitt-Awareness)?" },
  { id: "fut-3", werkzeug: "future", prio: "P4", ebene: "GF-SAFE", frage: "Ungarn-Expansion: Zeithorizont? Was muss die Architektur dafür vorbereiten (Mehrsprachigkeit, zweiter Standort, Steuer/Recht)?" },
  { id: "fut-4", werkzeug: "future", prio: "P4", ebene: "GF-SAFE", frage: "Investor-Pitch: Welche Produkt-Substanz soll bis wann stehen, um den Pitch mit „echter Substanz“ zu führen?" },
  { id: "fut-5", werkzeug: "future", prio: "P4", ebene: "GF-SAFE", frage: "ERP-Wechsel-Option: Ist ein ERP-Wechsel mittelfristig realistisch oder rein optional? Beeinflusst das den Connector-Bau jetzt?" },
];

export const fragenFuer = (werkzeug: string): MasterMindFrage[] =>
  MASTERMIND_FRAGEN.filter((f) => f.werkzeug === werkzeug);
```

- [ ] **Step 2: tsc** → keine Fehler.
- [ ] **Step 3: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/lib/mastermind-fragen.ts; git commit -m "feat(mastermind): statischer Fragenkatalog an Stephan (45, P0-P4)"
```

---

### Task 2: Antwort-Sammlung registrieren (Mutate-SPEC + Anti-Wipe)

**Files:** Modify `v2/app/api/cockpit/mutate/route.ts`, `v2/lib/cockpit-write.ts`

- [ ] **Step 1: SPEC ergänzen** — in `route.ts` nach der `magoHebel`-Zeile (innerhalb des `SPEC`-Objekts):

Old:
```ts
  magoHebel: { fields: ["title", "area", "phase", "status", "confidence", "risk", "description", "notes", "startDate", "finishDate"], numeric: ["expectedImpactEur", "effortHours"], prefix: "mhbl" },
};
```
New:
```ts
  magoHebel: { fields: ["title", "area", "phase", "status", "confidence", "risk", "description", "notes", "startDate", "finishDate"], numeric: ["expectedImpactEur", "effortHours"], prefix: "mhbl" },
  mastermindAntworten: { fields: ["frageId", "status", "antwort", "notiz"], prefix: "mma" },
};
```

- [ ] **Step 2: PROTECTED ergänzen** — in `cockpit-write.ts`:

Old:
```ts
  "magoHebel", "magoKpis",
];
```
New:
```ts
  "magoHebel", "magoKpis",
  "mastermindAntworten",
];
```

- [ ] **Step 3: tsc** → keine Fehler.
- [ ] **Step 4: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/app/api/cockpit/mutate/route.ts v2/lib/cockpit-write.ts; git commit -m "feat(mastermind): mastermindAntworten-Sammlung (Mutate-SPEC + Anti-Wipe)"
```

---

### Task 3: Reader — `lib/mastermind.ts`

**Files:** Create `v2/lib/mastermind.ts`

- [ ] **Step 1: Datei anlegen** (spiegelt `lib/mago.ts` Container-Auflösung)

```ts
import { db, STATE_ID } from "./supabase-server";

// Server-Reader für die erfassten Antworten auf den MasterMind-Fragenkatalog.
// Liest app_state (Container workspaces.hfk.data, Fallback top-level) — wie lib/mago.ts.
export type MasterMindAntwort = { id: string; frageId: string; status: string; antwort: string; notiz?: string };

// Indexiert nach frageId (letzter gewinnt — defensiv gegen seltene Doppel-Records).
export async function getMastermindAntworten(): Promise<Record<string, MasterMindAntwort>> {
  const { data } = await db().from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
  const st = (data?.data || {}) as Record<string, unknown>;
  const ws = (((st.workspaces as Record<string, any>)?.hfk?.data) || st) as Record<string, unknown>;
  const arr = Array.isArray(ws["mastermindAntworten"]) ? (ws["mastermindAntworten"] as any[]) : [];
  const out: Record<string, MasterMindAntwort> = {};
  for (const a of arr) {
    if (!a || !a.frageId) continue;
    out[String(a.frageId)] = {
      id: String(a.id || ""), frageId: String(a.frageId),
      status: String(a.status || "offen"), antwort: String(a.antwort || ""),
      notiz: a.notiz != null ? String(a.notiz) : undefined,
    };
  }
  return out;
}
```

- [ ] **Step 2: tsc** → keine Fehler.
- [ ] **Step 3: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/lib/mastermind.ts; git commit -m "feat(mastermind): Reader getMastermindAntworten (indexiert nach frageId)"
```

---

### Task 4: `components/mastermind/fragen-block.tsx` (Client)

**Files:** Create `v2/components/mastermind/fragen-block.tsx`

- [ ] **Step 1: Datei anlegen** (enthält Doppel-Record-Guard: `pendingCreate` + `useEffect`-Reset)

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "@/components/_primitives/card";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { MasterMindFrage } from "@/lib/mastermind-fragen";
import type { MasterMindAntwort } from "@/lib/mastermind";

const prioTone = (p: string): "red" | "amber" | "accent" | "muted" =>
  p === "P0" ? "red" : p === "P1" ? "amber" : p === "P2" ? "accent" : "muted";

export function FragenBlock({ fragen, antworten, titel = "Offene Fragen" }:
  { fragen: MasterMindFrage[]; antworten: Record<string, MasterMindAntwort>; titel?: string }) {
  const [open, setOpen] = useState(false);
  if (!fragen.length) return null;
  const beantwortet = fragen.filter((f) => antworten[f.id]?.status === "beantwortet").length;
  const offen = fragen.length - beantwortet;
  return (
    <div className="mt-3 rounded-lg border border-line bg-surface-2/40">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-xs font-bold uppercase tracking-wide text-muted-2">
        <span className="inline-flex items-center gap-1.5"><Icon name="chat" className="h-3.5 w-3.5" /> {titel} · {offen} offen{beantwortet ? ` · ${beantwortet} beantwortet` : ""}</span>
        <Icon name="arrow-right" className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <ul className="flex flex-col gap-2 px-3 pb-3">
          {fragen.map((f) => <FrageRow key={f.id} frage={f} record={antworten[f.id]} />)}
        </ul>
      )}
    </div>
  );
}

function FrageRow({ frage, record }: { frage: MasterMindFrage; record?: MasterMindAntwort }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [antwort, setAntwort] = useState(record?.antwort || "");
  const [done, setDone] = useState(record?.status === "beantwortet");
  const [err, setErr] = useState("");

  // Frische Server-Daten (nach router.refresh) → Sperren lösen + Felder synchronisieren.
  useEffect(() => {
    setBusy(false); setPendingCreate(false);
    setAntwort(record?.antwort || ""); setDone(record?.status === "beantwortet");
  }, [record?.id, record?.status, record?.antwort]);

  async function save() {
    if (busy || pendingCreate) return;
    setBusy(true); setErr("");
    const status = done ? "beantwortet" : "offen";
    const body = record
      ? { collection: "mastermindAntworten", action: "update", id: record.id, patch: { status, antwort } }
      : { collection: "mastermindAntworten", action: "create", item: { frageId: frage.id, status, antwort } };
    try {
      const res = await fetch("/api/cockpit/mutate", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) { setErr(res.status === 409 ? "Konflikt — bitte neu laden." : "Speichern fehlgeschlagen."); setBusy(false); return; }
      setEdit(false);
      if (record) setBusy(false);        // Update: id bekannt, kein Doppel-Risiko
      else setPendingCreate(true);       // Create: bis Refresh gegen Doppel-Record gesperrt
      router.refresh();
    } catch { setErr("Netzwerkfehler."); setBusy(false); }
  }

  const isDone = record?.status === "beantwortet";
  return (
    <li className="rounded-lg border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill tone={prioTone(frage.prio)}>{frage.prio}</Pill>
        {frage.ebene && <span className="text-[10px] font-bold uppercase tracking-wide text-muted-2">{frage.ebene}</span>}
        {isDone && <Pill tone="green">beantwortet</Pill>}
      </div>
      <p className="mt-1.5 text-sm font-medium leading-snug">{frage.frage}</p>
      {isDone && !edit && record?.antwort && (
        <p className="mt-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm leading-relaxed text-muted">{record.antwort}</p>
      )}
      {edit ? (
        <div className="mt-2 flex flex-col gap-2">
          <textarea value={antwort} onChange={(e) => setAntwort(e.target.value)} rows={3} placeholder="Stephans Antwort …"
            className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} className="h-5 w-5 accent-green" /> als beantwortet markieren
          </label>
          {err && <p className="text-xs text-red">{err}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} disabled={busy}
              className="min-h-11 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50">
              {busy ? "Speichert …" : "Speichern"}</button>
            <button type="button" onClick={() => { setEdit(false); setErr(""); setAntwort(record?.antwort || ""); setDone(record?.status === "beantwortet"); }} disabled={busy}
              className="min-h-11 rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-semibold">Abbrechen</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setEdit(true)} disabled={busy || pendingCreate}
          className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold text-accent disabled:opacity-50">
          {pendingCreate ? "Gespeichert …" : isDone ? "Antwort bearbeiten" : "Antwort erfassen"}</button>
      )}
    </li>
  );
}
```

- [ ] **Step 2: tsc** → keine Fehler.
- [ ] **Step 3: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/mastermind/fragen-block.tsx; git commit -m "feat(mastermind): FragenBlock (Inline-Erfassung, Status, Doppel-Record-Guard)"
```

---

### Task 5: PlanView-Blöcke + Seite

**Files:** Modify `v2/components/mastermind/plan-view.tsx`, `v2/app/(app)/mastermind/page.tsx`

- [ ] **Step 1: plan-view.tsx — Imports ergänzen** (nach den bestehenden Imports oben):
```tsx
import { fragenFuer } from "@/lib/mastermind-fragen";
import type { MasterMindAntwort } from "@/lib/mastermind";
import { FragenBlock } from "@/components/mastermind/fragen-block";
```

- [ ] **Step 2: plan-view.tsx — Signatur + Prop**

Old:
```tsx
export function PlanView() {
  const m = MASTERMIND;
```
New:
```tsx
export function PlanView({ antworten }: { antworten: Record<string, MasterMindAntwort> }) {
  const m = MASTERMIND;
```

- [ ] **Step 3: plan-view.tsx — Querschnitt-Block vor dem Werkzeug-Set.** Direkt VOR der Zeile `{/* Werkzeug-Set */}` einfügen:

Old:
```tsx
      {/* Werkzeug-Set */}
      <SectionTitle icon="cockpit" kicker="Das Werkzeug-Set" title="Fünf operative Werkzeuge" />
```
New:
```tsx
      {/* Querschnitt / Foundation — offene Fragen */}
      <SectionTitle icon="globe" kicker="Querschnitt / Foundation" title="Offene Fragen an Stephan (gilt für alle Werkzeuge)" />
      <FragenBlock titel="Querschnitt / Foundation" fragen={fragenFuer("querschnitt")} antworten={antworten} />

      {/* Werkzeug-Set */}
      <SectionTitle icon="cockpit" kicker="Das Werkzeug-Set" title="Fünf operative Werkzeuge" />
```

- [ ] **Step 4: plan-view.tsx — FragenBlock je Werkzeug.** Innerhalb der Werkzeug-Karte den `agentTyp`-Abschluss um den Block ergänzen:

Old:
```tsx
            <div className="mt-2 text-[11px] uppercase tracking-wide text-muted-2">{w.agentTyp}</div>
          </div>
        ))}
      </div>
```
New:
```tsx
            <div className="mt-2 text-[11px] uppercase tracking-wide text-muted-2">{w.agentTyp}</div>
            <FragenBlock fragen={fragenFuer(w.key)} antworten={antworten} />
          </div>
        ))}
      </div>
```

- [ ] **Step 5: plan-view.tsx — Future-Fragen im Future-Scope-Abschnitt.** Nach dem schließenden `</div>` des Future-Scope-Grids:

Old:
```tsx
      <div className="grid gap-4 sm:grid-cols-2">
        {m.futureScope.map((f) => (
          <Card key={f.name}>
            <div className="flex items-center gap-2">
              <Icon name={f.icon} className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-bold">{f.name}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.beschreibung}</p>
            <p className="mt-3 text-xs font-medium text-muted-2">{f.status}</p>
          </Card>
        ))}
      </div>
```
New:
```tsx
      <div className="grid gap-4 sm:grid-cols-2">
        {m.futureScope.map((f) => (
          <Card key={f.name}>
            <div className="flex items-center gap-2">
              <Icon name={f.icon} className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-bold">{f.name}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.beschreibung}</p>
            <p className="mt-3 text-xs font-medium text-muted-2">{f.status}</p>
          </Card>
        ))}
      </div>
      <FragenBlock titel="Offene Fragen — Future Scope" fragen={fragenFuer("future")} antworten={antworten} />
```

- [ ] **Step 6: page.tsx — Reader laden + Prop übergeben**

Old:
```tsx
import { requireAdmin } from "@/lib/auth-helpers";
import { MASTERMIND } from "@/lib/strategy";
import { PageShell } from "@/components/_primitives/page-shell";
import { PlanView } from "@/components/mastermind/plan-view";

export const dynamic = "force-dynamic";
```
New:
```tsx
import { requireAdmin } from "@/lib/auth-helpers";
import { MASTERMIND } from "@/lib/strategy";
import { getMastermindAntworten } from "@/lib/mastermind";
import { PageShell } from "@/components/_primitives/page-shell";
import { PlanView } from "@/components/mastermind/plan-view";

export const dynamic = "force-dynamic";
```

Old:
```tsx
  await requireAdmin();
  const m = MASTERMIND;

  return (
    <PageShell icon="compass" title="Strategie & Roadmap" subtitle={`MasterMind — der Plan von Stephan · ${m.version}`}>
      <PlanView />
    </PageShell>
  );
```
New:
```tsx
  await requireAdmin();
  const m = MASTERMIND;
  const antworten = await getMastermindAntworten();

  return (
    <PageShell icon="compass" title="Strategie & Roadmap" subtitle={`MasterMind — der Plan von Stephan · ${m.version}`}>
      <PlanView antworten={antworten} />
    </PageShell>
  );
```

- [ ] **Step 7: tsc** → keine Fehler.
- [ ] **Step 8: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/components/mastermind/plan-view.tsx "v2/app/(app)/mastermind/page.tsx"; git commit -m "feat(mastermind): Fragen-Bloecke im Plan (je Werkzeug + Querschnitt + Future)"
```

---

### Task 6: Wissensbasis — `lib/stephan-context.ts`

**Files:** Modify `v2/lib/stephan-context.ts`

- [ ] **Step 1: Imports ergänzen** (oben):
```tsx
import { getMastermindAntworten } from "./mastermind";
import { MASTERMIND_FRAGEN } from "./mastermind-fragen";
import { MASTERMIND } from "./strategy";
```
> Hinweis: `strategySummaryText` wird bereits importiert — prüfen, ob `MASTERMIND` schon importiert ist; falls ja, nicht doppelt importieren.

- [ ] **Step 2: Antworten mitladen** — die bestehende `Promise.all`-Zeile erweitern:

Old:
```tsx
  const [c, a] = await Promise.all([getCockpitData(), getAkademieData()]);
```
New:
```tsx
  const [c, a, mmAntworten] = await Promise.all([getCockpitData(), getAkademieData(), getMastermindAntworten()]);
```

- [ ] **Step 3: KLÄRUNGEN-Block anhängen** — direkt vor `return out.join("\n\n");`:

Old:
```tsx
  return out.join("\n\n");
}
```
New:
```tsx
  const wzName = (key: string) =>
    MASTERMIND.werkzeuge.find((w) => w.key === key)?.name
    || (key === "querschnitt" ? "Querschnitt/Foundation" : key === "future" ? "Future Scope" : key);
  const beantwortet = MASTERMIND_FRAGEN.filter((f) => {
    const r = mmAntworten[f.id];
    return r && r.status === "beantwortet" && String(r.antwort || "").trim();
  });
  if (beantwortet.length) {
    out.push("## MASTERMIND-KLÄRUNGEN (von Stephan beantwortet)\n" + beantwortet.map((f) =>
      `- [${wzName(f.werkzeug)}] ${cut(f.frage, 160)}: „${cut(mmAntworten[f.id].antwort, 400)}"`).join("\n"));
  }

  return out.join("\n\n");
}
```

- [ ] **Step 4: tsc** → keine Fehler.
- [ ] **Step 5: Commit**
```powershell
cd F:/JTL_Export/JTL_Export/magaloko; git add v2/lib/stephan-context.ts; git commit -m "feat(mastermind): beantwortete Q&A als MASTERMIND-KLAERUNGEN in den Copiloten"
```

---

### Task 7: Push + Prod-Verifikation (echter Schreib-Roundtrip)

**Files:** keine.

- [ ] **Step 1: Push** `cd F:/JTL_Export/JTL_Export/magaloko; git push`
- [ ] **Step 2: Deploy abwarten** (Marker im Browser; ~430px-Viewport).
- [ ] **Step 3: Anzeige prüfen** (`/mastermind`, eingeloggt als Admin):
  - Querschnitt-Block vor dem Werkzeug-Set; je Werkzeug-Karte ein „Offene Fragen · N offen"-Block; Future-Block im Future-Abschnitt. Zähler stimmen (Treasury 9, Einkauf 8, …).
  - Block aufklappen → Fragen mit Prio-Pill + ggf. GF-SAFE-Tag.
- [ ] **Step 4: Schreib-Roundtrip** (Kern!): eine Frage „Antwort erfassen" → Text + „als beantwortet" → Speichern → Status-Pill „beantwortet" + Antworttext sichtbar; **Seite neu laden → bleibt erhalten** (echter app_state-Write). Erneut „bearbeiten" → ändern → speichern → kein Duplikat (Zähler bleibt korrekt).
- [ ] **Step 5: Überlauf-/Mobil-Check** (kein horizontaler Überlauf; Blöcke eingeklappt per Default).
- [ ] **Step 6: Bericht** + Hinweis: finale Optik-Abnahme am Handy.

---

## Self-Review (Plan gegen Spec)
- **Katalog (T1):** 45 Fragen, ids `qs/tre/ein/vip/seb/vek/fut`, werkzeug-Keys = `MASTERMIND.werkzeuge[].key` + querschnitt/future. ✔
- **Schreiben (T2):** SPEC `mastermindAntworten` + PROTECTED — beide gesetzt. ✔
- **Reader (T3):** spiegelt `lib/mago.ts`, indexiert nach frageId. ✔
- **UI (T4/T5):** FragenBlock je Werkzeug + Querschnitt + Future; PlanView bleibt sync, Seite reicht Prop (Korrektur 1). ✔
- **Guard (T4):** `pendingCreate` + `useEffect`-Reset auf `record?.id/status/antwort` (Korrektur 2). ✔
- **Copilot (T6):** beantwortete Q&A in stephan-context. ✔
- **Typkonsistenz:** `MasterMindFrage`, `MasterMindAntwort`, Pill-Tones (red/amber/accent/muted/green) gültig; Icons `chat`/`arrow-right`/`globe` vorhanden. ✔
