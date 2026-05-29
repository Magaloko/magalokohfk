-- 0001 — MAGALOKO Core-Schema (Ist-Stand, replay-sicher; ändert keine Daten)
-- Cockpit/Akademie + Bot, server-only Zugriff via service_role. RLS deny-by-default.

create table if not exists public.app_state (
  id          text primary key default 'hfk',
  data        jsonb not null default '{}'::jsonb,
  updated_at  bigint not null default 0,
  version     integer not null default 0
);

create table if not exists public.sessions (
  token_hash  text primary key,
  tg_user_id  bigint,
  tg_role     text,
  tg_modules  jsonb not null default '[]'::jsonb,
  email       text,
  created_at  bigint not null default 0,
  last_seen   bigint not null default 0,
  ua          text
);
create index if not exists sessions_last_seen_idx on public.sessions (last_seen);
create index if not exists sessions_tg_user_idx on public.sessions (tg_user_id);

create table if not exists public.bot_scores (
  id        bigserial primary key,
  ts        timestamptz not null default now(),
  uid       bigint,
  name      text,
  type      text,
  item_id   text,
  correct   boolean,
  score     numeric,
  total     integer,
  marke     text,
  topics    jsonb
);
create index if not exists bot_scores_uid_idx on public.bot_scores (uid);
create index if not exists bot_scores_ts_idx on public.bot_scores (ts desc);

create table if not exists public.bot_learnings (
  id         text primary key,
  keywords   jsonb not null default '[]'::jsonb,
  topic      text,
  correction text,
  added_at   text,
  added_by   text
);

create table if not exists public.audit_log (
  id     bigserial primary key,
  ts     timestamptz not null default now(),
  event  text,
  detail jsonb
);
create index if not exists audit_log_ts_idx on public.audit_log (ts desc);

create table if not exists public.bot_sessions (
  uid        bigint primary key,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.bot_users (
  uid      bigint primary key,
  name     text,
  role     text not null default 'mitarbeiter',
  modules  jsonb not null default '[]'::jsonb,
  added_at timestamptz not null default now()
);

create table if not exists public.stephan_otps (
  otp        text primary key,
  created_at bigint not null default 0,
  uses       integer not null default 0
);

-- RLS an für alle (keine Policies → nur service_role; anon/authenticated deny)
alter table public.app_state     enable row level security;
alter table public.sessions      enable row level security;
alter table public.bot_scores    enable row level security;
alter table public.bot_learnings enable row level security;
alter table public.audit_log     enable row level security;
alter table public.bot_sessions  enable row level security;
alter table public.bot_users     enable row level security;
alter table public.stephan_otps  enable row level security;

insert into public.app_state (id, data, updated_at, version)
values ('hfk', '{}'::jsonb, 0, 0) on conflict (id) do nothing;
