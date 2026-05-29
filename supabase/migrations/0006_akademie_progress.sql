-- 0006: Akademie-Gamification — persistenter Fortschritt pro Lernende:r
-- Schlüssel = session.email (z. B. "tg:544821565" oder "web:admin") → stabil & eindeutig.

create table if not exists public.akademie_progress (
  user_key       text primary key,
  display        text,                                  -- anonymisierbares Kürzel (kein Klarname nötig)
  xp             integer not null default 0,
  sessions_count integer not null default 0,            -- abgeschlossene Trainings
  streak         integer not null default 0,            -- Tage in Folge
  best_streak    integer not null default 0,
  last_active    date,
  badges         jsonb   not null default '[]'::jsonb,   -- vergebene Badge-IDs
  stats          jsonb   not null default '{}'::jsonb,   -- {perfects,totalCorrect,totalAnswered,byType:{...}}
  updated_at     timestamptz not null default now()
);

create index if not exists akademie_progress_xp_idx on public.akademie_progress (xp desc);

-- RLS: deny-by-default. Nur der service_role (Server) greift zu; kein direkter Client-Zugriff.
alter table public.akademie_progress enable row level security;
-- (Bewusst keine permissiven Policies — service_role umgeht RLS.)
