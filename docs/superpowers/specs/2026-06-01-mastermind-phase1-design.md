# MasterMind — Phase 1: Präsentationsreife Neustruktur (Design-Spec)

**Datum:** 2026-06-01 · **App:** MAGALOKO v2 (`v2/`, Next.js 15 App Router) · **Status:** zur Umsetzung freigegeben (Brainstorming abgeschlossen)

## 1. Kontext & Ziel

Stephans Strategie-Grundlagen (**MasterMind**, Version 2.0) sind das Hauptziel für HFK. Das MasterMind-System besteht aus **5 operativen Werkzeugen** (Treasury, Einkaufssystem, VIPA, SeBo, **VEKTRA**) + 2 Future-Scope + Roadmap, strukturiert nach **3 Vertrauensebenen** (GF-SAFE / TEAM / PUBLIC). Im Plan ist **VEKTRA = der Verkaufstrainer** — und das ist exakt die heutige **Akademie** (Quiz, Beratungs-Rollenspiel, Einwand-Coaching, Fortschritt; mobil; Premium-HFK-Ästhetik).

Heute liegt die App-Schwerkraft auf einem generischen Cockpit (Tasks/Hebel/KPIs), das nicht an die Werkzeug-/Roadmap-Struktur gekoppelt ist („unpassend"). **Ziel:** Die App so umstellen, dass sie in erster Linie dem MasterMind-Plan dient.

**Quelle Plan-Inhalt:** `v2/lib/strategy.ts` (`MASTERMIND`, Single Source of Truth) · gerendert auf `/cockpit/strategie`.

## 2. Getroffene Entscheidungen (Brainstorming)

1. **Rückgrat = MasterMind-Plan** (5 Werkzeuge + Roadmap + 2 Hebel).
2. **App/Hülle = „MasterMind"; Trainer (heute Akademie) = „VEKTRA"** (= das eine LIVE-Werkzeug, public, erstes Präsentations-Feature).
3. **Generische Tasks/Hebel/KPIs werden an Werkzeuge/Roadmap gekoppelt** — aber **erst in Phase 2**. Magos eigene Ziele/Jobs/Aufgaben/Rollen bleiben.
4. **Phasiert.** Diese Spec = **Phase 1** (Struktur/Umbenennung/Reposition, präsentationsreif). Phase 2 (Daten-Kopplung) = separater Spec.
5. **IA-Ansatz = „A" (MasterMind-Heim + Werkzeug-Landkarte).**

## 3. Scope Phase 1

**IN:** Branding-Umbenennung (mit Disambiguierung, §4), gruppierte Navigation (§5), MasterMind-Heim als Top-Level-Plan-Seite (§6), Trainer-Reposition als „VEKTRA" (§6), Login-Weiche + Bot-Label (§7), optionaler `/vektra`-Redirect.

**OUT (→ Phase 2 oder später):**
- Tiefe Daten-Kopplung Tasks/Hebel/KPIs → Werkzeuge/Roadmap-Phasen; Archivieren nicht-zuordenbarer Alt-Items.
- Jegliche Datenmodell-/DB-Änderung.
- Physische Slug-Umbenennung (`/akademie`→`/vektra`, `/cockpit`→`/steuerung`).
- Änderung der Zugriffs-Guards (bleiben unverändert).
- Trainer-Funktionalität, Bot-Logik (außer Button-Labels), Mago-Interna.

## 4. Benennung & VEKTRA-Disambiguierung (Kern)

„VEKTRA" existiert im Code in **zwei Bedeutungen**. **Kein blindes Replace.** Pro Fundstelle:

| Ort | Heutige Bedeutung | Phase-1-Aktion |
|---|---|---|
| `app/layout.tsx` — `title.default`/`template` „VEKTRA" | App-Marke | → **„MasterMind"** |
| `app/login/page.tsx` — „VEKTRA / Cockpit & Akademie" | App-Marke + Trainer | → **„MasterMind / Cockpit & VEKTRA"** |
| `components/shell/mag-shell.tsx` — Kopf/Drawer/Topbar „VEKTRA" | App-Marke | Marke → **„MasterMind"**; Logo-Kürzel V→M |
| `components/shell/mag-shell.tsx` — Nav-Label „Akademie" + Subtitle `isAdmin?"Admin":"Akademie"` | Trainer-Label | Nav-Label „Akademie" → **„VEKTRA"**; Subtitle „Akademie" → „VEKTRA" |
| `app/(app)/akademie/page.tsx` — PageShell-Titel „Akademie" | Trainer-Hub | → **„VEKTRA"** |
| `lib/strategy.ts` — `werkzeug.name:"VEKTRA"`, roadmap „VEKTRA", Kommentar „VEKTRA = diese App" | **Werkzeug = Trainer** | **bleibt „VEKTRA"**; Kommentar präzisieren zu „VEKTRA = das Trainer-Werkzeug dieser App (MasterMind)" |
| `lib/phases.ts` — `"VEKTRA"`-Phase (Sales-Training, Schritt 5, live) | Roadmap-Phase = Trainer | **bleibt „VEKTRA"** |
| `lib/bot/handler.mjs` — „🎯 VEKTRA — Was möchtest du tun?" | Bot **ist** der Trainer | **bleibt „VEKTRA"** |
| `lib/bot/handler.mjs` — Menü-Button „🎓 Akademie" (`/akademie`) | Trainer-Webapp-Link | Label → **„🎓 VEKTRA"** (Route bleibt `/akademie`) |
| `lib/ai.ts`, `lib/stephan-context.ts`, `components/cockpit/stephan-assist.tsx`, `app/api/stephan-assist/route.ts` — „VEKTRA-Wissensbasis/-Daten/-Assistent" | App-Datenname (interne KI-Prompts) | → **„MasterMind-Wissensbasis/-Daten/-Assistent"** (Konsistenz; nicht nutzer-sichtbares Branding, aber gleiche Marke) |
| `lib/copilot-kb.mjs` — „in VEKTRA (Cockpit→Tasks)" u. a. | App-Name (Guide-Copy) | → **„MasterMind"** |
| `app/(app)/cockpit/page.tsx` — „VEKTRA (diese App) ist der erste sichtbare Baustein …" | Werkzeug-Bezug | Satz präzisieren: gemeint ist das **Werkzeug** VEKTRA (= der Trainer), nicht die App |

**Regel:** „VEKTRA" bleibt überall, wo der **Trainer/das Werkzeug** gemeint ist (strategy/phases/Bot-Trainer/Trainer-Hub). Überall, wo die **gesamte App / deren Datenbasis** gemeint ist, → „MasterMind".

## 5. Navigation & Zugriff (IA — Ansatz A)

Neue gruppierte Sidebar (`components/shell/mag-shell.tsx`):

```
■ MasterMind          (Admin/GF)   → Plan-Heim (§6)
■ VEKTRA              (alle)        → /akademie (Trainer), Label „VEKTRA"

  STEUERUNG  (Admin/GF):
   • Heute             → /heute
   • Lieferung         → /cockpit      (heute „Umsetzung")
   • Kalender          → /kalender

  TEAM  (alle):
   • Cockpilot         → /cockpilot
   • Werkstatt         → /werkstatt

■ Mago                (nur Super-Admin · privat) → /mago
■ Einstellungen       (nur Super-Admin)
```

Umsetzung der Gruppierung: leichte **Sektions-Überschriften** in der Sidebar (kein neues Routing, keine neuen Landing-Pages für „Steuerung"/„Team"). „Steuerung"/„Team" sind reine Sidebar-Gruppen über bestehenden Hubs.

**Zugriff = Vertrauensebenen (Guards bleiben unverändert, verifiziert gegen Code):**

| Bereich | Wer | Trust-Level | Guard (Ist-Zustand) |
|---|---|---|---|
| MasterMind-Heim, Steuerung (`/heute`,`/cockpit/*`,`/kalender`) | Admin/GF | GF-SAFE | `requireAdmin` |
| VEKTRA-Trainer (`/akademie/*`) | alle Eingeloggten | TEAM/PUBLIC | `requireUser` (+ Bereichs-Gate). Ausnahme: `/akademie/mitarbeiter*` ist `requireAdmin` — bleibt so |
| Team (`/cockpilot/*`,`/werkstatt/*`) | alle | TEAM | `requireUser` |
| Mago (`/mago/*`) | nur Mo | privat | `requireSuperAdmin` |
| Einstellungen | nur Mo | privat | `requireSuperAdmin` |

Mago kehrt als **super-only** Nav-Eintrag zurück (nur Mo sichtbar; für Stephan/Team unsichtbar).

## 6. Seiten: MasterMind-Heim & VEKTRA-Trainer

**MasterMind-Heim (neu, Top-Level):** Zeigt den Plan, geführt von der **Werkzeug-Landkarte** (5 Tools mit Status: VEKTRA = „live" → verlinkt den Trainer; Treasury/Einkauf/VIPA/SeBo = „Geplant"-Status/Konzept-Karten), darunter Roadmap · 2 Hebel · Vertrauensebenen · Ziele 2028. **Wiederverwendet** die bestehende `MASTERMIND`-Daten & die Komponenten der heutigen `/cockpit/strategie`-Seite (kein neuer Inhalt, nur als Top-Level-Heim positioniert). **Route: neue Top-Level-Route `/mastermind`** (additiv, geringes Risiko), die die Plan-Komponenten rendert (`requireAdmin`). `/cockpit/strategie` bekommt einen **Redirect auf `/mastermind`** (Alt-Links bleiben gültig); die Nav „MasterMind" und alle „Strategie/Plan"-Verlinkungen zeigen künftig auf `/mastermind`.

**VEKTRA-Trainer:** heutige `/akademie/*` — **nur relabeln** (Header/Tabs/Copy „Akademie"→„VEKTRA"). Funktionalität, Routen, Sub-Tabs unverändert.

## 7. Login-Weiche & Bot

- `app/page.tsx` Root-Redirect: heute `isAdmin ? "/heute" : "/akademie"` → **`isAdmin ? "/mastermind" : "/akademie"`** (Mitarbeiter weiterhin direkt in VEKTRA).
- Bot `lib/bot/handler.mjs`: **nur** Menü-Button „🎓 Akademie" → „🎓 VEKTRA" (Route `/akademie` bleibt). Admin-Buttons („🚀/📱 Cockpit" → `/heute` = Steuerung) und das Bot-Trainer-Menü „🎯 VEKTRA" **bleiben unverändert** (geringere Bot-Churn).

## 8. Risiken & Nicht-Ziele

- **Risiko Pauschal-Replace** von „VEKTRA": ausgeschlossen durch die Tabelle in §4 — strikt fundstellen-basiert.
- **Kein** Bruch von Bot-Deeplinks / Bookmarks / internen Links (Slugs unverändert).
- **Kein** Daten-/Guard-Eingriff. Phase 1 ist rein darstellend/strukturell.

## 9. Akzeptanzkriterien (präsentationsreif)

1. Shell/Login/Tab-Titel zeigen **„MasterMind"** (nicht mehr „VEKTRA" als App-Marke).
2. Der Trainer ist überall sichtbar als **„VEKTRA"** benannt (Nav, Hub-Titel, Bot-Button).
3. Admin landet nach Login auf dem **MasterMind-Heim** mit der Werkzeug-Landkarte; Mitarbeiter auf **VEKTRA**.
4. Sidebar ist gruppiert (MasterMind · VEKTRA · Steuerung · Team · Mago · Einstellungen); Zugriff je Rolle wie §5.
5. `tsc --noEmit` grün; Bot-Deeplinks (`/akademie`,`/heute`) funktionieren weiter; keine Slug-/Daten-Änderung.
6. `strategy.ts`/`phases.ts`/Bot-Trainer behalten „VEKTRA" als Werkzeug-Name.

## 10. Ausblick Phase 2 (separater Spec)

Tasks/Hebel/KPIs an Werkzeuge/Roadmap-Phasen koppeln; nicht-zuordenbare Alt-Items archivieren; ggf. physische Slug-Umbenennung inkl. Redirects + Bot-Link-Update; Performance-Fix der History/Aktivität (120-Snapshot-Problem) sinnvoll hier mit-erledigen.
