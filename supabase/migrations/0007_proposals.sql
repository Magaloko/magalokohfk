-- 0007: Werkstatt — kollaborative Vorschläge (Einwände, Argumentationen, Ideen, Lösungen)
-- Mitarbeiter reichen ein, alle bewerten/diskutieren, Admin entscheidet & übernimmt.
-- Votes & Kommentare als jsonb auf der Zeile (kleines Team → Read-Modify-Write genügt).

create table if not exists public.proposals (
  id          text primary key,
  author_key  text not null,                          -- session.email des Einreichers
  author_name text not null default 'Mitarbeiter',
  type        text not null default 'idee',           -- einwand|argumentation|idee|loesung|korrektur
  title       text not null,
  content     text not null default '',
  target      text,                                    -- Zielsammlung (z. B. salesObjections) für Übernahme
  status      text not null default 'discussion',      -- discussion|approved|adapted|rejected|merged
  ai_review   jsonb not null default '{}'::jsonb,       -- { score, feedback, improved }
  votes       jsonb not null default '{}'::jsonb,       -- { user_key: 1 | -1 }
  comments    jsonb not null default '[]'::jsonb,       -- [{ id, user_key, user_name, body, at }]
  decided_by  text,
  decided_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists proposals_status_idx  on public.proposals (status);
create index if not exists proposals_created_idx on public.proposals (created_at desc);

-- RLS: deny-by-default; nur service_role (Server) greift zu.
alter table public.proposals enable row level security;
