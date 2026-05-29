# MAGALOKO — Supabase Migrations

Versionierte, idempotente SQL-Migrationen (ZENA-Muster). In **aufsteigender Reihenfolge**
im Supabase **SQL-Editor** des Live-Projekts ausführen. Alle sind `if not exists` / idempotent —
mehrfaches Ausführen ist sicher.

| # | Datei | Zweck |
|---|---|---|
| 0001 | `0001_core_schema.sql` | Ist-Stand (app_state, sessions, bot_scores, bot_learnings, audit_log, bot_sessions, bot_users, stephan_otps) + RLS |
| 0002 | `0002_state_history.sql` | `state_history` — Auto-Snapshots gegen Daten-Verlust |
| 0003 | `0003_scheduled_jobs.sql` | `scheduled_jobs` — Cron-/Job-Registry mit Heartbeat |
| 0004 | `0004_rls.sql` | RLS für alle (inkl. neuer) Tabellen sicherstellen |

**Neu seit dem letzten Deploy:** `0002`, `0003`, `0004` — diese im Live-Projekt
(`iyypazhwloycnfobcqpt`) ausführen. `0001` dokumentiert nur den Bestand (schadet nicht).

Zugriff: ausschließlich serverseitig über den `service_role`-Key (Vercel-Env). RLS ist
aktiv ohne Policies = Deny-by-Default für anon/authenticated.
