-- 0015 - SeBo v1 Ist-Stand: operative Abschluss-Tasks aus Amok-AI-Status Juni 2026.
--
-- ADDITIV & IDEMPOTENT: bestehende Daten bleiben unveraendert. Eintraege werden nur
-- angehaengt, wenn ihre id noch fehlt.

do $$
declare
  v_data jsonb;
  v_tpath text[];
  v_dpath text[];
  v_tasks jsonb;
  v_decisions jsonb;
  v_item jsonb;
  v_added_t int := 0;
  v_added_d int := 0;
  v_seed_tasks jsonb := '[
    {
      "id":"sebo_v1_pilot_abnahme_doku",
      "title":"SeBo 5k-Projekt abschliessen: Pilot, Abnahme, Dokumentation",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"hoch",
      "area":"Steuerung",
      "owner":"Mago",
      "effort":"10-14 Tage",
      "notes":"Pilotphase durchfuehren, Abnahmeprotokoll erstellen, Dokumentation/Schulung fertigstellen. Ziel: urspruenglichen 5k-Auftrag sauber beenden."
    },
    {
      "id":"sebo_v1_analytics_sales_import",
      "title":"analytics_sales mit echten Daten befuellen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"hoch",
      "area":"Daten",
      "owner":"Mago",
      "effort":"mittel",
      "notes":"Zuerst Test-Batch, danach automatisieren. Kritisch fuer Bestellhistorie, 360-Grad-Kundensicht und datenbasierte Entscheidungen."
    },
    {
      "id":"sebo_v1_order_history_finish",
      "title":"Stufe 1 Bestellhistorie fertigstellen und testen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"mittel",
      "area":"Service",
      "owner":"Mago",
      "effort":"3-5 Tage",
      "notes":"Komponente ist vorhanden, aber ohne Daten. Nach analytics_sales-Test-Batch sichtbaren Fortschritt fuer Stephan herstellen."
    },
    {
      "id":"sebo_v1_auto_replies_test",
      "title":"Automatische Erstantworten aktiv testen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"mittel",
      "area":"Automatisierung",
      "owner":"Mago",
      "notes":"Technisch fertig/Flag vorhanden. Testen und dokumentieren, produktiv zunaechst deaktiviert lassen bis Freigabe."
    },
    {
      "id":"sebo_v1_docs_training",
      "title":"SeBo Dokumentation und Schulung erstellen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"hoch",
      "area":"Dokumentation",
      "owner":"Mago",
      "effort":"3-5 Tage",
      "notes":"Bedienung, Grenzen, Feature Flags, Admin-Panel, Pilot-Testplan, Abnahme und Betriebslogik dokumentieren."
    }
  ]'::jsonb;
  v_seed_decisions jsonb := '[
    {
      "id":"sebo_dec_rule_engine_vs_power_automate",
      "titel":"SeBo Automatisierung: eigene Rule-Engine oder Power Automate?",
      "status":"offen",
      "frist":"",
      "kategorie":"SeBo",
      "empfehlung":"Frueh mit Stephan klaeren. Kurzfristig Power Automate weiter nutzen, mittelfristig einfache visuelle Steuerung nur als neuer Scope."
    },
    {
      "id":"sebo_dec_auto_reply_go_live",
      "titel":"Wann duerfen automatische Erstantworten produktiv aktiv werden?",
      "status":"offen",
      "frist":"",
      "kategorie":"Governance",
      "empfehlung":"Erst nach Pilot, Dokumentation, Freigabe und klarer Abschalt-/Feature-Flag-Logik."
    }
  ]'::jsonb;
begin
  select data into v_data from public.app_state where id = 'hfk';
  if v_data is null then
    raise notice '0015: app_state (id=hfk) nicht gefunden -- uebersprungen.';
    return;
  end if;

  if jsonb_typeof(v_data #> '{workspaces,hfk,data}') = 'object' then
    v_tpath := array['workspaces','hfk','data','tasks'];
    v_dpath := array['workspaces','hfk','data','stephanDecisions'];
  else
    v_tpath := array['tasks'];
    v_dpath := array['stephanDecisions'];
  end if;

  v_tasks := coalesce(v_data #> v_tpath, '[]'::jsonb);
  v_decisions := coalesce(v_data #> v_dpath, '[]'::jsonb);
  if jsonb_typeof(v_tasks) <> 'array' then v_tasks := '[]'::jsonb; end if;
  if jsonb_typeof(v_decisions) <> 'array' then v_decisions := '[]'::jsonb; end if;

  for v_item in select * from jsonb_array_elements(v_seed_tasks) loop
    if not exists (select 1 from jsonb_array_elements(v_tasks) e where e ->> 'id' = v_item ->> 'id') then
      v_tasks := v_tasks || v_item;
      v_added_t := v_added_t + 1;
    end if;
  end loop;

  for v_item in select * from jsonb_array_elements(v_seed_decisions) loop
    if not exists (select 1 from jsonb_array_elements(v_decisions) e where e ->> 'id' = v_item ->> 'id') then
      v_decisions := v_decisions || v_item;
      v_added_d := v_added_d + 1;
    end if;
  end loop;

  v_data := jsonb_set(v_data, v_tpath, v_tasks, true);
  v_data := jsonb_set(v_data, v_dpath, v_decisions, true);
  v_data := jsonb_set(v_data, array['updatedAt'], to_jsonb((extract(epoch from now()) * 1000)::bigint), true);

  update public.app_state
     set data = v_data,
         updated_at = (extract(epoch from now()) * 1000)::bigint
   where id = 'hfk';

  raise notice '0015: % SeBo-v1 Abschluss-Tasks, % Entscheidungen ergaenzt.', v_added_t, v_added_d;
end $$;
