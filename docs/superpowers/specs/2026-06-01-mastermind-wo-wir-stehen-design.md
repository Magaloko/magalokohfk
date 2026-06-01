# MasterMind „Wo wir stehen" — Design-Spec

> **Status:** Design (User-Approval erfolgt). Nächster Schritt: writing-plans → subagent-driven-development.
> **Datum:** 2026-06-01 · **Projekt:** MAGALOKO v2

## Ziel
Beim Öffnen von `/mastermind` **sofort** den operativen Stand sehen: je MasterMind-Tool ein Status (Plan/In Bau/Live/Blockiert) + die offenen **Vorgänge/Threads**, inkl. „wartet auf wen/was". Auslöser: SeBo ist gebaut, hängt aber an HFK (Live-Wawi-Anbindung + echtes Service-Postfach). Operativer Stand ≠ Stephans statischer Plan-Status — beides bleibt getrennt.

## Scope
**In:** 2 neue Sammlungen + „Wo wir stehen"-Sektion oben in PlanView + Reader + Copilot-Anbindung + Start-Befüllung (SeBo-Stand).
**Out:** Cockpit-Umsetzung (umsetzungItems) bleibt unberührt; keine Änderung an `strategy.ts`-Plan-Status; SeBo-App selbst (sebo.dadakaev.tech) wird hier nicht angefasst.
**Zugriff:** `/mastermind` ist admin-only; Anzeige + Erfassung für Admins (wie die Fragen).

## Datenmodell (2 Sammlungen, Mutate-API + Anti-Wipe)
**`mastermindVorgaenge`** — offene Vorgänge/Threads:
`fields: ["titel","werkzeug","status","wartetAuf","naechsterSchritt","notiz","datum"], prefix: "mmv"`
- `werkzeug` = Tool-Key (`foundation`/`treasury`/`einkauf`/`vipa`/`sebo`/`vektra`).
- `status` ∈ `Offen` · `Wartet` · `In Arbeit` · `Erledigt`.
- `wartetAuf` = frei (z. B. „HFK-IT", „Stephan", „Lieferant").

**`mastermindToolStatus`** — operativer Status je Tool (1 Record je Werkzeug):
`fields: ["werkzeug","status","notiz"], prefix: "mts"`
- `status` ∈ `Plan` · `In Bau` · `Live` · `Blockiert`.
- Verknüpfung über `werkzeug` (wie die Antworten über `frageId`): vorhanden → update by id, sonst create.

Beide in `lib/cockpit-write.ts` → `PROTECTED` ergänzen (Anti-Wipe).

## Reader — `lib/mastermind.ts` (erweitern)
```ts
export type MasterMindVorgang = { id: string; titel: string; werkzeug: string; status: string; wartetAuf: string; naechsterSchritt: string; notiz: string; datum: string };
export type MasterMindToolStatus = { id: string; werkzeug: string; status: string; notiz: string };
export async function getMastermindVorgaenge(): Promise<MasterMindVorgang[]>;        // Array
export async function getMastermindToolStatus(): Promise<Record<string, MasterMindToolStatus>>; // nach werkzeug
```
Container-Auflösung wie `getMastermindAntworten` (workspaces.hfk.data, Fallback top-level).

## Anzeige — `components/mastermind/wo-wir-stehen.tsx` (Client) + PlanView
**Platzierung:** neue Sektion als **erstes** Element in PlanView (vor dem Hero) → „gleich sichtbar".

**Rollup-Tools (6):** Foundation + die 5 `MASTERMIND.werkzeuge`. Je Tool ein Chip:
- Status-Punkt (Plan grau · In Bau amber · Live grün · Blockiert rot) aus `toolStatus[key]?.status` (Default „Plan").
- Label (Tool-Name) + „wartet N" = Anzahl offener Vorgänge des Tools mit `status==="Wartet"`.
- Inline-`<select>` zum Setzen des Tool-Status (→ POST create/update `mastermindToolStatus`).

**Offene Vorgänge:** alle `mastermindVorgaenge` mit `status!=="Erledigt"`, je Zeile: Tool-Tag · Titel · Status-Badge · „wartet auf …" · nächster Schritt. Aktionen: „Bearbeiten", „Erledigt" (Status→Erledigt). „+ Vorgang" öffnet ein Formular (titel, werkzeug-Select, status-Select, wartetAuf, naechsterSchritt, notiz). Speichern → POST mutate (create/update). `router.refresh()` nach Erfolg; Doppel-Record-Guard wie bei `FragenBlock` (`pendingCreate` + `useEffect`-Reset auf `record?.id`).

**`app/(app)/mastermind/page.tsx`:** zusätzlich `getMastermindVorgaenge()` + `getMastermindToolStatus()` laden und an PlanView durchreichen → `<WoWirStehen vorgaenge={…} toolStatus={…} />`.

## Copilot-Anbindung — `lib/stephan-context.ts`
Neuer Block **„## AKTUELLER STAND (operativ)"**: je Tool der Status (sofern gesetzt) + die offenen Vorgänge (Titel · Tool · wartet auf · nächster Schritt). Quelle: die zwei neuen Reader. Token-begrenzt (`cut`).

## Start-Befüllung (Prod-Write nach Deploy, super-admin-Session)
**ToolStatus (6):** foundation=`In Bau`, treasury=`In Bau`, einkauf=`Plan`, vipa=`Plan`, sebo=`In Bau`, vektra=`Live`.
**Vorgänge (2, beide `werkzeug:"sebo"`, `status:"Wartet"`):**
1. „Live-Wawi-Anbindung (DB-API)" · wartetAuf „HFK-IT" · naechsterSchritt „API-Doku + Firewall-Freigabe (IP 187.127.79.228, Port 5883, HTTPS/Auth) abwarten" · notiz „SeBo nutzt Nov-2025-Snapshot; Live-Feed fehlt."
2. „Echtes HFK-Service-Postfach anbinden" · wartetAuf „HFK" · naechsterSchritt „Zugang zum echten Service-Postfach klären" · notiz „Ticket-Inbox aktuell voll Spam/DMARC; echte Tickets fehlen."
→ Ergebnis: „SeBo ● In Bau · wartet 2".

## Verifikation
`tsc` + push→Prod: Sektion oben in /mastermind, 6 Tool-Chips mit Status, SeBo „wartet 2", die 2 Vorgänge sichtbar; Vorgang anlegen/bearbeiten/Erledigt → persistent (Reload); Tool-Status setzen → persistent; kein Überlauf. Copilot-Block stichprobenhaft. Optik-Abnahme durch Mago.

## Risiken
- **Anti-Wipe:** beide Sammlungen in PROTECTED (wie bei `mastermindAntworten` gelernt).
- **Doppel-Record:** `createItem` liefert keine id → `pendingCreate`-Guard + Reader „letzter gewinnt" (für toolStatus by werkzeug, für vorgaenge by id).
- **Naming:** PlanView hat bereits „Wo wir stehen" (Ausgangslage). Die neue Sektion heißt zur Abgrenzung **„Aktueller Stand"** (Kicker) / „Wo wir gerade stehen" (Titel).
- Kein Unit-Runner — `tsc` + Prod-Browser ist der Weg.
