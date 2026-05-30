-- 0012 — Umsetzungsplan-Seed: Tasks & Hebel an Stephans MasterMind-Roadmap ausrichten.
-- Quelle: Strategie-Grundlagen v2.0 (Foundation -> Treasury -> Einkauf -> VIPA & SeBo -> VEKTRA).
--
-- ADDITIV & IDEMPOTENT (Standard): bestehende Daten bleiben unveraendert; Plan-Eintraege werden
-- NUR angehaengt, wenn ihre id noch fehlt. Mehrfaches Ausfuehren aendert nichts (Anti-Wipe-konform).
-- Ausserdem: phase an die zwei strategischen Hebel aus 0011 ergaenzt (falls vorhanden).
--
-- Ziel-Container wie die App-Reads: app_state.data.workspaces.hfk.data.{tasks,levers}
-- (Fallback: top-level). Tasks tragen phase = Foundation/Treasury/Einkaufssystem/VIPA/SeBo/VEKTRA
-- (Steuerungs-Aufgaben ohne phase). Hebel = die operativen Werkzeuge je Phase.
--
-- OPTIONAL "ERSETZEN" (Altlasten entfernen): siehe auskommentierter Block am Ende.

do $$
declare
  v_data   jsonb;
  v_tpath  text[];
  v_lpath  text[];
  v_tasks  jsonb;
  v_levers jsonb;
  v_seed_tasks jsonb := '[
    {"id":"up_found_1","title":"ETL-Pipeline aufsetzen (JTL nach HFK-Datenschicht)","phase":"Foundation","status":"In Arbeit","area":"Daten"},
    {"id":"up_found_2","title":"HFK-Postgres-Schema definieren","phase":"Foundation","status":"In Arbeit","area":"Daten"},
    {"id":"up_found_3","title":"Connector JTL/Datenschicht (ERP-agnostisch)","phase":"Foundation","status":"Backlog","area":"Daten"},
    {"id":"up_found_4","title":"ETL-Monitoring und Datenqualitaet sichern","phase":"Foundation","status":"Backlog","area":"Daten"},
    {"id":"up_treas_1","title":"Cashflow-Forecast 180 Tage (Datenmodell)","phase":"Treasury","status":"Backlog","area":"Finanzen"},
    {"id":"up_treas_2","title":"Order-Ampel ab 2.000 EUR mit Alternativen","phase":"Treasury","status":"Backlog","area":"Finanzen"},
    {"id":"up_treas_3","title":"Skonto-Optimierung (effektiver Jahreszins)","phase":"Treasury","status":"Backlog","area":"Finanzen"},
    {"id":"up_treas_4","title":"Liqui-Cockpit (Metabase) fuer die GF","phase":"Treasury","status":"Backlog","area":"Finanzen"},
    {"id":"up_eink_1","title":"Autopilot fuer Renner (A/X-Klasse, DB1)","phase":"Einkaufssystem","status":"Backlog","area":"Einkauf"},
    {"id":"up_eink_2","title":"OOS-Fruehwarnung mit Lieferzeit-Range","phase":"Einkaufssystem","status":"Backlog","area":"Einkauf"},
    {"id":"up_eink_3","title":"Fashion-Markdown mit Floor (EK x 1,05)","phase":"Einkaufssystem","status":"Backlog","area":"Einkauf"},
    {"id":"up_eink_4","title":"JTL-Write-Back (Ameise-Format)","phase":"Einkaufssystem","status":"Backlog","area":"Einkauf"},
    {"id":"up_vipa_1","title":"Mail-Triage (klassifizieren und priorisieren)","phase":"VIPA","status":"Backlog","area":"Assistenz"},
    {"id":"up_vipa_2","title":"Proaktive Reminder (Fristen, Lieferungen)","phase":"VIPA","status":"Backlog","area":"Assistenz"},
    {"id":"up_vipa_3","title":"Mail diktieren im HFK-Ton","phase":"VIPA","status":"Backlog","area":"Assistenz"},
    {"id":"up_sebo_1","title":"Klassifikation in 5 Kategorien","phase":"SeBo","status":"Backlog","area":"Service"},
    {"id":"up_sebo_2","title":"Automatischer Datenabruf zur Bestellnummer","phase":"SeBo","status":"Backlog","area":"Service"},
    {"id":"up_sebo_3","title":"Antwortvorschlag mit Halluzinations-Schutz","phase":"SeBo","status":"Backlog","area":"Service"},
    {"id":"up_vekt_1","title":"Sales-Training live (Quiz, Rollenspiel, Einwand)","phase":"VEKTRA","status":"Erledigt","area":"Sales"},
    {"id":"up_vekt_2","title":"Live-Lookup-Modus (Knowledge) am POS","phase":"VEKTRA","status":"Backlog","area":"Sales"},
    {"id":"up_vekt_3","title":"Anbindung an Brand Intelligence (Future Scope)","phase":"VEKTRA","status":"Backlog","area":"Sales"},
    {"id":"up_steu_1","title":"Strategie mit Schluessel-Stakeholdern absichern","phase":"","status":"In Arbeit","area":"Steuerung"},
    {"id":"up_steu_2","title":"Foerderung pruefen: Wirtschaftsagentur Wien / KMU.DIGITAL","phase":"","status":"Backlog","area":"Steuerung"}
  ]'::jsonb;
  v_seed_levers jsonb := '[
    {"id":"tool_foundation","title":"Foundation - Datenbasis als Fundament","area":"Daten","phase":"Foundation","status":"In Arbeit","confidence":"hoch","risk":"mittel"},
    {"id":"tool_treasury","title":"Treasury - Liquiditaets-Steuerung","area":"Finanzen","phase":"Treasury","status":"Geplant","confidence":"hoch","risk":"mittel"},
    {"id":"tool_einkauf","title":"Einkaufssystem - Margen-Steuerung (+1-2 pp DB1)","area":"Einkauf","phase":"Einkaufssystem","status":"Geplant","confidence":"mittel","risk":"mittel"},
    {"id":"tool_vipa","title":"VIPA - GF-Assistent (Zeitgewinn)","area":"Assistenz","phase":"VIPA","status":"Geplant","confidence":"mittel","risk":"niedrig"},
    {"id":"tool_sebo","title":"SeBo - Service-Bot (schnellere Bearbeitung)","area":"Service","phase":"SeBo","status":"Geplant","confidence":"mittel","risk":"niedrig"},
    {"id":"tool_vektra","title":"VEKTRA - Verkaufstrainer (Beratungsqualitaet)","area":"Sales","phase":"VEKTRA","status":"Live","confidence":"hoch","risk":"niedrig"}
  ]'::jsonb;
  v_item   jsonb;
  v_added_t int := 0;
  v_added_l int := 0;
begin
  select data into v_data from public.app_state where id = 'hfk';
  if v_data is null then
    raise notice '0012: app_state (id=hfk) nicht gefunden -- uebersprungen.';
    return;
  end if;

  if jsonb_typeof(v_data #> '{workspaces,hfk,data}') = 'object' then
    v_tpath := array['workspaces','hfk','data','tasks'];
    v_lpath := array['workspaces','hfk','data','levers'];
  else
    v_tpath := array['tasks'];
    v_lpath := array['levers'];
  end if;

  v_tasks  := coalesce(v_data #> v_tpath,  '[]'::jsonb);
  v_levers := coalesce(v_data #> v_lpath, '[]'::jsonb);
  if jsonb_typeof(v_tasks)  <> 'array' then v_tasks  := '[]'::jsonb; end if;
  if jsonb_typeof(v_levers) <> 'array' then v_levers := '[]'::jsonb; end if;

  -- Tasks anhaengen (nur fehlende ids)
  for v_item in select * from jsonb_array_elements(v_seed_tasks) loop
    if not exists (select 1 from jsonb_array_elements(v_tasks) e where e ->> 'id' = v_item ->> 'id') then
      v_tasks := v_tasks || v_item; v_added_t := v_added_t + 1;
    end if;
  end loop;

  -- Hebel anhaengen (nur fehlende ids)
  for v_item in select * from jsonb_array_elements(v_seed_levers) loop
    if not exists (select 1 from jsonb_array_elements(v_levers) e where e ->> 'id' = v_item ->> 'id') then
      v_levers := v_levers || v_item; v_added_l := v_added_l + 1;
    end if;
  end loop;

  -- phase an die strategischen Hebel aus 0011 ergaenzen (falls vorhanden und noch ohne phase)
  v_levers := (
    select jsonb_agg(
      case
        when e ->> 'id' = 'mm_hebel_beratung' and coalesce(e ->> 'phase','') = '' then e || '{"phase":"VEKTRA"}'::jsonb
        when e ->> 'id' = 'mm_hebel_einkauf'  and coalesce(e ->> 'phase','') = '' then e || '{"phase":"Einkaufssystem"}'::jsonb
        else e
      end)
    from jsonb_array_elements(v_levers) e
  );

  v_data := jsonb_set(v_data, v_tpath, v_tasks, true);
  v_data := jsonb_set(v_data, v_lpath, v_levers, true);
  v_data := jsonb_set(v_data, array['updatedAt'], to_jsonb((extract(epoch from now()) * 1000)::bigint), true);

  update public.app_state
     set data = v_data,
         updated_at = (extract(epoch from now()) * 1000)::bigint
   where id = 'hfk';

  raise notice '0012: % Tasks, % Hebel ergaenzt (additiv).', v_added_t, v_added_l;
end $$;


-- =====================================================================================
-- OPTIONAL: "ERSETZEN"-MODUS — Altlasten entfernen, NUR Plan-Eintraege behalten.
-- ACHTUNG: loescht alle Tasks/Hebel, deren id NICHT zum Plan gehoert (up_* / tool_* / mm_*).
-- Nicht-destruktiv ist der Block oben; DIESEN nur bei Bedarf bewusst ausfuehren.
-- Zum Aktivieren: das /* ... */ um den folgenden Block entfernen.
-- =====================================================================================
/*
do $$
declare
  v_data jsonb; v_tpath text[]; v_lpath text[];
begin
  select data into v_data from public.app_state where id = 'hfk';
  if v_data is null then return; end if;
  if jsonb_typeof(v_data #> '{workspaces,hfk,data}') = 'object' then
    v_tpath := array['workspaces','hfk','data','tasks'];
    v_lpath := array['workspaces','hfk','data','levers'];
  else
    v_tpath := array['tasks']; v_lpath := array['levers'];
  end if;

  v_data := jsonb_set(v_data, v_tpath, coalesce((
    select jsonb_agg(e) from jsonb_array_elements(coalesce(v_data #> v_tpath,'[]'::jsonb)) e
    where e ->> 'id' like 'up\_%'
  ), '[]'::jsonb), true);

  v_data := jsonb_set(v_data, v_lpath, coalesce((
    select jsonb_agg(e) from jsonb_array_elements(coalesce(v_data #> v_lpath,'[]'::jsonb)) e
    where e ->> 'id' like 'tool\_%' or e ->> 'id' like 'mm\_%'
  ), '[]'::jsonb), true);

  v_data := jsonb_set(v_data, array['updatedAt'], to_jsonb((extract(epoch from now()) * 1000)::bigint), true);
  update public.app_state set data = v_data, updated_at = (extract(epoch from now()) * 1000)::bigint where id = 'hfk';
  raise notice '0012-REPLACE: Altlasten entfernt, nur Plan-Eintraege behalten.';
end $$;
*/
