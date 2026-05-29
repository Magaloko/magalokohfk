-- 0003 — scheduled_jobs: Job-/Cron-Registry mit Heartbeat (ZENA-Muster)
create table if not exists public.scheduled_jobs (
  name             text primary key,
  kind             text not null default 'cron',   -- 'cron' | 'event'
  enabled          boolean not null default true,
  last_run_at      timestamptz,
  last_status      text,                            -- 'ok' | 'error' | 'skipped'
  last_duration_ms integer,
  last_error       text,
  runs             integer not null default 0,
  meta             jsonb not null default '{}'::jsonb
);

alter table public.scheduled_jobs enable row level security; -- nur service_role

-- Bekannte Jobs vorregistrieren (toggle-bar)
insert into public.scheduled_jobs (name, kind) values ('prune-history', 'cron')
on conflict (name) do nothing;
