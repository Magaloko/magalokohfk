-- 0011 — MasterMind-Strategie: die zwei strategischen Hebel als Cockpit-Hebel seeden.
-- Quelle: Stephans Strategie-Grundlagen (Version 2.0, Mai 2026), Abschnitt 1.1.
--
-- NICHT-DESTRUKTIV & IDEMPOTENT: bestehende Hebel und alle anderen Daten bleiben
-- unveraendert. Die zwei neuen Hebel werden NUR angehaengt, wenn ihre id noch nicht
-- existiert. Mehrfaches Ausfuehren aendert nichts (Anti-Wipe-konform).
--
-- Ziel-Container exakt wie die App-Reads/Writes (v2/lib/cockpit.ts, cockpit-write.ts):
--   app_state.data.workspaces.hfk.data.levers   (Fallback: app_state.data.levers)
--
-- Die 5 Werkzeuge, die 4-Quartals-Roadmap und die 24-Monats-Ziele leben bewusst im Code
-- (v2/lib/strategy.ts -> Seite /cockpit/strategie + Stephan-Assistent) und werden NICHT
-- als DB-Daten dupliziert.

do $$
declare
  v_data   jsonb;
  v_path   text[];
  v_levers jsonb;
  v_seed   jsonb := '[
    {"id":"mm_hebel_beratung","title":"Skalierung der Beratungs-Kompetenz","area":"Strategie","status":"Aktiv","confidence":"hoch","risk":"mittel"},
    {"id":"mm_hebel_einkauf","title":"Finanzielle Disziplin im Einkauf","area":"Strategie","status":"Aktiv","confidence":"hoch","risk":"mittel"}
  ]'::jsonb;
  v_item   jsonb;
  v_added  int := 0;
begin
  select data into v_data from public.app_state where id = 'hfk';
  if v_data is null then
    raise notice '0011: app_state (id=hfk) nicht gefunden -- uebersprungen.';
    return;
  end if;

  -- Container-Pfad bestimmen (workspaces.hfk.data, sonst top-level)
  if jsonb_typeof(v_data #> '{workspaces,hfk,data}') = 'object' then
    v_path := array['workspaces','hfk','data','levers'];
  else
    v_path := array['levers'];
  end if;

  v_levers := coalesce(v_data #> v_path, '[]'::jsonb);
  if jsonb_typeof(v_levers) <> 'array' then
    v_levers := '[]'::jsonb;
  end if;

  -- Nur fehlende Hebel (per id) anhaengen
  for v_item in select * from jsonb_array_elements(v_seed) loop
    if not exists (
      select 1 from jsonb_array_elements(v_levers) e where e ->> 'id' = v_item ->> 'id'
    ) then
      v_levers := v_levers || v_item;
      v_added := v_added + 1;
    end if;
  end loop;

  if v_added = 0 then
    raise notice '0011: beide Strategie-Hebel bereits vorhanden -- keine Aenderung.';
    return;
  end if;

  v_data := jsonb_set(v_data, v_path, v_levers, true);
  v_data := jsonb_set(v_data, array['updatedAt'], to_jsonb((extract(epoch from now()) * 1000)::bigint), true);

  update public.app_state
     set data = v_data,
         updated_at = (extract(epoch from now()) * 1000)::bigint
   where id = 'hfk';

  raise notice '0011: % Strategie-Hebel ergaenzt.', v_added;
end $$;
