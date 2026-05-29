# MAGALOKO V2 (Next.js · ZENA-V3-Architektur)

Strukturierte Neu-Auflage von MAGALOKO im ZENA-V3-Stil: Next.js 15 (App Router) + React 19 +
TypeScript + Tailwind v4. Isolierte Shell, Hub-Navigation, Server/Client-Split,
wiederverwendbare Primitives (`PageShell`, `DataTable`, `Card`, `EmptyState`), Design-Tokens.

**Läuft parallel zur Live-App** (Repo-Root) und liest **dieselbe Supabase**. Phase 0 = POC
mit dem **Akademie-Hub** (Drills/Marken/Einwände/Personas/Szenarien/Rollenspiele/Angebote +
interaktiver Quiz-Runner) + Login (Admin-Passwort / Mitarbeiter-Code / Telegram).

## Struktur
```
v2/
  app/
    layout.tsx               Root (Fonts, Tokens)
    globals.css              Tailwind v4 @theme Design-Tokens
    page.tsx                 Root-Redirect (Session → /heute|/akademie, sonst /login)
    login/page.tsx           Web-Login + Telegram-Auto-Login
    auth/status/route.ts     Session-Status (role, areas)
    api/{web-auth,tg-auth,logout}/route.ts   Auth-Routen
    (app)/
      layout.tsx             requireUser → MagShell
      heute/page.tsx         Admin-Dashboard
      cockpit/page.tsx       (Platzhalter, folgt)
      akademie/
        layout.tsx           AkademieTabs (Bereichs-Gating)
        {drills,marken,einwaende,personas,szenarien,rollenspiele,angebote,mitarbeiter}/page.tsx
  components/
    shell/mag-shell.tsx      Sidebar-Hubs + Drawer
    _primitives/*            PageShell, DataTable, Card, EmptyState
    akademie/*               AkademieTabs, QuizLauncher, QuizRunner
  lib/
    supabase-server.ts       Service-Role-Client (server-only)
    session.ts               getSession (Cookie → sessions; tg:-Bindung)
    auth-crypto.ts           Passwort/Code/HMAC, createSession, Cookie-Opts
    auth-helpers.ts          requireUser/requireAdmin/requireArea, Bereiche
    akademie.ts              Reads aus app_state (workspaces.hfk.data)
```

## Deploy (eigenes Vercel-Projekt, parallel zur Live-App)
1. Vercel → **Add New Project** → selbes GitHub-Repo `Magaloko/magalokohfk`.
2. **Root Directory = `v2`** (wichtig!). Framework auto: **Next.js**.
3. **Environment Variables** (gleiche Werte wie Live-App):
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `TELEGRAM_TOKEN`,
   `ADMIN_PASSWORD`, optional `ADMIN_USER_IDS`, `ALLOWED_USER_IDS`, `TG_USERS_JSON`.
4. Deploy → eigene URL (z. B. `magalokohfk-v2.vercel.app`). Die Live-App bleibt unberührt.

## Hinweise
- Schreibt (Phase 0) nicht in `app_state` → kein Risiko für Live-Daten; liest nur.
- Mitarbeiter sehen nur freigegebene Akademie-Bereiche (server-seitig, wie Live).
- Bei Parität: Domain auf V2 umstellen (separater Schritt).
