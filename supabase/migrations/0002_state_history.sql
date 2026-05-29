-- 0002 — state_history: Auto-Snapshot des app_state VOR jedem Write (Daten-Verlust-Schutz)
create table if not exists public.state_history (
  id         bigserial primary key,
  ts         timestamptz not null default now(),
  updated_at bigint not null default 0,   -- updated_at des gesicherten Stands
  client_id  text,
  data       jsonb not null
);
create index if not exists state_history_ts_idx on public.state_history (ts desc);

alter table public.state_history enable row level security; -- nur service_role
