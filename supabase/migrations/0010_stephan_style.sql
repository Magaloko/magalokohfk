-- 0010: Persistentes Stil-Profil fuer den Stephan-Assistenten (Phase 2b).
-- Einmal aus dem Korpus der gesendeten Antworten abgeleitet und gecacht -> beim Entwerfen
-- wird nur das kompakte Profil (+ wenige frische Beispiele) statt vieler Volltexte mitgegeben
-- => Token-Ersparnis bei grossem Korpus. Eine Zeile (global; thread = 'global').

create table if not exists public.stephan_style (
  thread      text primary key default 'global',
  profile     text not null default '',
  built_from  integer not null default 0,      -- aus wie vielen gesendeten Nachrichten gebaut
  actor       text,
  updated_at  timestamptz not null default now()
);

-- RLS deny-by-default; nur service_role (Server) greift zu — wie proposals/stephan_messages.
alter table public.stephan_style enable row level security;
