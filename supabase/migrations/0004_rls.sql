-- 0004 — RLS-Härtung: sicherstellen, dass ALLE Tabellen RLS aktiv haben (Deny-by-Default).
-- Keine Policies → nur der service_role-Key (serverseitig in der Vercel-Function) hat Zugriff.
-- anon/authenticated/Client haben KEINEN Direktzugriff. Idempotent.
alter table public.app_state      enable row level security;
alter table public.sessions       enable row level security;
alter table public.bot_scores     enable row level security;
alter table public.bot_learnings  enable row level security;
alter table public.audit_log      enable row level security;
alter table public.bot_sessions   enable row level security;
alter table public.bot_users      enable row level security;
alter table public.stephan_otps   enable row level security;
alter table public.state_history  enable row level security;
alter table public.scheduled_jobs enable row level security;
