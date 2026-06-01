# MasterMind Hub-Diagramm — Design-Spec

> **Status:** Design (User-Approval erfolgt). Nächster Schritt: writing-plans → subagent-driven-development.
> **Datum:** 2026-06-01 · **Projekt:** MAGALOKO v2

## Ziel
Den `/mastermind`-Plan mit einem **visuellen Hub-and-Spoke-Diagramm** als Herzstück: Zentrale „MasterMind" + die 5 Werkzeuge als anklickbare Speichen. Bisher ist die Seite rein Text/Karten — kein Diagramm. Treu zur vom Nutzer gelieferten Infografik (Navy-Zentrum, Gold-Ring).

## Scope
**In:** eine neue reine-SVG-Komponente + Einbindung oben in PlanView + Anker-`id`s an den Werkzeug-Karten.
**Out:** Daten-Charts, die 8-Domänen-Variante, andere Seiten. Spätere Optik-Iteration explizit eingeplant.

## Architektur
- **Neu: `components/mastermind/hub-diagram.tsx`** — **Server-Component**, reines `<svg viewBox="0 0 420 420">` (kein JS, skaliert via viewBox, `max-w-[520px] mx-auto`). Liest `MASTERMIND.werkzeuge` (5).
- **Geometrie:** Zentrum (210,210) r=56; 5 Knoten radial bei R=150, im Uhrzeigersinn ab oben (0°/72°/144°/216°/288°): Treasury (oben), Einkaufssystem, VIPA, SeBo, VEKTRA. Verbindungslinien Zentrum→Knoten (zuerst gezeichnet, von Kreis/Knoten überdeckt).
- **Farben (Tokens):** Zentrum `fill-ink` (#1b1d2e Navy) + Ring `stroke-gold` (#c98a04); Zentrumstext `fill-surface` (weiß) + Untertitel `fill-gold`. Linien `stroke-line`. Knoten `fill-surface` + Status-Stroke (`stroke-green` für VEKTRA=Live, sonst `stroke-line`) + Status-Punkt (`fill-green`/`fill-accent`); Knotentext `fill-ink`.
- **Klickbar:** jeder Knoten = SVG-`<a href="#wz-{key}">` → scrollt zur Werkzeug-Karte. Dazu erhalten die Karten im Werkzeug-Set `id={`wz-${w.key}`}` + `scroll-mt-24`. Kein neues Detail-UI.
- **Platzierung:** neue Sektion „Das System auf einen Blick · MasterMind & seine Werkzeuge" direkt unter dem Hero von PlanView, in einer Card.

## Verifikation
`tsc` + push→Prod: SVG vorhanden, 5 Knoten-Links (`a[href^="#wz-"]`), Klick scrollt zur Karte (Anker-`id`s da), kein horizontaler Überlauf, skaliert bei ~430px. **Optik-Abnahme durch Mago am eigenen Bildschirm** (Browser-Tool rendert nur ~430px) — Farben/Größen werden danach iteriert.

## Risiken
- **Label-Länge:** „Einkaufssystem" (14 Zeichen) in 104px-Knoten bei `fontSize 12` — knapp, im Prod prüfen; ggf. Knoten verbreitern/Font verkleinern (Optik-Iteration).
- **Tailwind fill/stroke-Utilities:** in v4 aus `@theme`-`--color-*` auto-generiert (`fill-ink`, `stroke-gold`, …) — bestätigt via globals.css.
- **SVG-`<a>` in JSX/Next:** Standard-Hash-Anker, kein Client-JS nötig.
