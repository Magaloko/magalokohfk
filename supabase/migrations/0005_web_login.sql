-- 0005 — Web-Login (ohne Telegram): persönlicher Zugangscode je Mitarbeiter + Brute-Force-Schutz.
-- Admin meldet sich mit ADMIN_PASSWORD (Vercel-Env) an; Mitarbeiter mit einem Code (Hash hier).
alter table public.bot_users add column if not exists web_code_hash text;

create table if not exists public.web_login_attempts (
  id bigserial primary key,
  ip text,
  ts timestamptz not null default now()
);
create index if not exists web_login_attempts_ts_idx on public.web_login_attempts (ts desc);
alter table public.web_login_attempts enable row level security;
