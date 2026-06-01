-- 0013: Produkt-Basiskatalog für den Baby-Kompass (POC: Kinderwagen-Finder).
-- Quelle: HFK-JTL-Export (Artikel-Nr, Name, Marke, Kategorie, Preis). Befüllt durch ein
-- lokales Import-Skript (scripts/import-kinderwagen.mjs), NICHT durch diese Migration.
-- Hinweis: Der JTL-Export enthält KEINE Maße (Dimension-Datei leer) und kein verlässliches
-- Gewicht. Alle matching-relevanten Entscheidungs-Attribute (Gewicht-/Faltmaß-Klasse,
-- "ohne Lift tragbar", Kofferraum-Klasse, öffi-tauglich, Gelände, abGeburt, Ausschlussgründe)
-- liegen im kuratierten Overlay (app_state-Sammlung `kompassEignung`), gepflegt im Cockpit.

create table if not exists public.produkte (
  id              text primary key,                    -- = jtl_artikel_nr (stabil, idempotenter Upsert)
  jtl_artikel_nr  text not null unique,                -- kArtikel aus dem JTL-Export
  name            text not null,
  marke           text,
  kategorie       text,                                -- z. B. "Kinderwagen"
  preis_eur       numeric,                             -- best-effort aus dem Export
  bild_url        text,
  aktiv           boolean not null default true,
  updated_at      timestamptz not null default now()
);

create index if not exists produkte_kategorie_idx on public.produkte (kategorie);
create index if not exists produkte_aktiv_idx      on public.produkte (aktiv);

-- RLS: deny-by-default; nur service_role (Server) greift zu (konsistent mit 0004).
alter table public.produkte enable row level security;
