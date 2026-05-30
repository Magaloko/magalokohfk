-- 0009: Stephan-Gespraech — persistenter Verlauf (Tracking) +
-- Korpus gesendeter Antworten (Grundlage fuer spaeteres Stil-Lernen).
-- Append-lastiger Log in eigener Tabelle (nicht in app_state, das sonst bei jedem
-- Cockpit-Write komplett neu geschrieben wuerde). Muster wie public.proposals.
-- Idempotent & selbstheilend: ergaenzt fehlende Spalten, falls die Tabelle aus einer
-- frueheren (schlankeren) Fassung bereits existiert.

create table if not exists public.stephan_messages (
  id          text primary key,
  thread      text not null default 'stephan',  -- Stream-Label; 'stephan' = Hauptstrang
  direction   text not null,                     -- 'incoming' | 'outgoing'
  body        text not null,                     -- tatsaechlicher Nachrichtentext
  ai_draft    text,                              -- KI-Entwurf (nur outgoing) -> Entwurf vs. Endfassung
  source      text,                              -- 'edited_draft' | 'pasted' | 'manual' (Stil-Gewichtung)
  reply_to    text,                              -- id der eingehenden Nachricht, die hier beantwortet wird
  ref_kind    text,                              -- Kopplung: 'stephanDecisions' | 'tasks' | 'levers' | null
  ref_id      text,                              -- id des gekoppelten Objekts
  occurred_at timestamptz,                        -- echter Sende-/Empfangszeitpunkt (sonst = created_at)
  actor       text,                              -- session.email des Erfassers
  created_at  timestamptz not null default now()
);

-- Falls die Tabelle aus einer frueheren Fassung schon existiert: fehlende Spalten ergaenzen (nullable -> immer sicher).
alter table public.stephan_messages add column if not exists source      text;
alter table public.stephan_messages add column if not exists reply_to    text;
alter table public.stephan_messages add column if not exists ref_kind    text;
alter table public.stephan_messages add column if not exists ref_id      text;
alter table public.stephan_messages add column if not exists occurred_at timestamptz;

create index if not exists stephan_messages_thread_idx on public.stephan_messages (thread, created_at);
create index if not exists stephan_messages_ref_idx    on public.stephan_messages (ref_kind, ref_id);

-- RLS deny-by-default; nur service_role (Server) greift zu — wie proposals.
alter table public.stephan_messages enable row level security;
