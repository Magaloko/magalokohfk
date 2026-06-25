-- 0014 - SeBo v2 Steuerung: Aufgaben, Entscheidungen und Handover aus Stephans Dokumenten.
-- Quellen:
-- - HFK_SEBO_Konzept_v2.pdf, v2.0, 24.06.2026 14:32
-- - HFK_SEBO_Anhang_Mago_v2.pdf, v2.0, 24.06.2026 16:49
--
-- ADDITIV & IDEMPOTENT: bestehende Cockpit-Daten bleiben unveraendert. Eintraege werden
-- nur angehaengt, wenn ihre id noch fehlt.

do $$
declare
  v_data jsonb;
  v_tpath text[];
  v_dpath text[];
  v_upath text[];
  v_tasks jsonb;
  v_decisions jsonb;
  v_umsetzung jsonb;
  v_item jsonb;
  v_added_t int := 0;
  v_added_d int := 0;
  v_added_u int := 0;
  v_seed_tasks jsonb := '[
    {
      "id":"sebo_v2_m0_v1_stand",
      "title":"SeBo v1 Ist-Stand von Dadakaev Labs einholen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"hoch",
      "area":"Service",
      "owner":"Mago",
      "notes":"Anfordern: Repo/ZIP, Flow-Exports, Deployments, offene Punkte, Bugs, Testfaelle, was im 5k-Auftrag fertig geliefert wurde."
    },
    {
      "id":"sebo_v2_m0_5k_abnahme",
      "title":"5k-SeBo-v1-Auftrag gegen gelieferten Scope pruefen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"hoch",
      "area":"Steuerung",
      "owner":"Mago",
      "notes":"Ziel: v1-Abnahmeliste, Restumfang und Change Requests trennen. v2 darf nicht still als Nachbesserung in v1 rutschen."
    },
    {
      "id":"sebo_v2_stephan_call",
      "title":"Stephan-Planungscall fuer SeBo v2 vorbereiten",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"hoch",
      "area":"Steuerung",
      "owner":"Mago",
      "notes":"Agenda: v1-Abnahme, v2 als neues Projekt, DB-Entscheidung, Power Automate Ownership, Budget, Meilensteine, Dadakaev-Labs-Rolle."
    },
    {
      "id":"sebo_v2_db_decision_pack",
      "title":"DB-Entscheidungspaket vorbereiten",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"hoch",
      "area":"Architektur",
      "owner":"Mago",
      "notes":"Optionen vergleichen: Postgres One-Source vs. getrennte Supabase-SeBo-DB. Kriterien: HFK-Gesamtarchitektur, Betrieb, Datenschutz, v1-Migration, spaetere Herstellerportale."
    },
    {
      "id":"sebo_v2_schema_review",
      "title":"SeBo-v2-Datenmodell reviewen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"hoch",
      "area":"Architektur",
      "owner":"Mago",
      "notes":"Tabellen: cases, contacts, reminders, manufacturer_mappings. Kein direktes JTL-Coupling, attachments nur als Referenzen/JSONB sauber klaeren."
    },
    {
      "id":"sebo_v2_status_migration",
      "title":"Statusmigration v1 zu v2 planen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"hoch",
      "area":"Architektur",
      "owner":"Mago",
      "notes":"03_Wartet_auf_Kunde wird zu 03_Wartet_auf_Hersteller. Vorher Snapshot offener Faelle, Mapping-Tabelle, Legacy-Tag, kein Hard-Delete."
    },
    {
      "id":"sebo_v2_power_automate_rules",
      "title":"Power-Automate-Trennlinie SEBO_ vs VIPA_ festlegen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"mittel",
      "area":"Automatisierung",
      "owner":"Mago",
      "notes":"Alle SeBo-Flows mit SEBO_ Prefix, keine geteilten Flows mit VIPA. Loop-Schutz fuer MailTrigger pruefen."
    },
    {
      "id":"sebo_v2_outlook_templates",
      "title":"Outlook-Templates fuer Vorerfassung Phase 1 entwerfen",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"mittel",
      "area":"Service",
      "owner":"Mago",
      "notes":"Templates fuer Retoure, Lieferung/Versand, Produkt/Reklamation/Ersatzteil, Rechnung/Zahlung. Pflichtfelder aus Konzept Kapitel 10.2."
    },
    {
      "id":"sebo_v2_handover_call",
      "title":"Handover-Call Mago, Stephan und Dadakaev Labs vorbereiten",
      "phase":"SeBo",
      "status":"Backlog",
      "priority":"mittel",
      "area":"Steuerung",
      "owner":"Mago",
      "notes":"Ziel: v1-Wissen sichern, v2-Scope bestaetigen, Verantwortlichkeiten festlegen, keine Secrets in Docs oder Code."
    }
  ]'::jsonb;
  v_seed_decisions jsonb := '[
    {
      "id":"sebo_dec_v1_abnahme",
      "titel":"SeBo v1: Was gilt im 5k-Auftrag als abnahmereif?",
      "status":"offen",
      "frist":"",
      "kategorie":"SeBo",
      "empfehlung":"Vor v2-Start schriftlich klaeren: geliefert, offen, Nachbesserung, Change Request."
    },
    {
      "id":"sebo_dec_v2_new_project",
      "titel":"SeBo v2 als neues Projekt mit eigenem Scope starten?",
      "status":"offen",
      "frist":"",
      "kategorie":"SeBo",
      "empfehlung":"Ja. v2 ist ein Architekturwechsel von stateless zu stateful und sollte nicht als v1-Restarbeit behandelt werden."
    },
    {
      "id":"sebo_dec_db_architecture",
      "titel":"SeBo DB: Postgres One-Source oder getrennte SeBo-DB?",
      "status":"offen",
      "frist":"",
      "kategorie":"Architektur",
      "empfehlung":"Tendenz Postgres One-Source, aber erst nach IT-/Betriebscheck final entscheiden."
    },
    {
      "id":"sebo_dec_dadakaev_role",
      "titel":"Welche Rolle uebernimmt Dadakaev Labs in SeBo v2?",
      "status":"offen",
      "frist":"",
      "kategorie":"Umsetzung",
      "empfehlung":"Dadakaev Labs als Umsetzungspartner naheliegend, Mago steuert Architektur, Scope, Review und Abnahme."
    },
    {
      "id":"sebo_dec_automation_depth",
      "titel":"Welche SeBo-Antworten duerfen automatisch raus?",
      "status":"offen",
      "frist":"",
      "kategorie":"Governance",
      "empfehlung":"Phase 1/2: nur Drafts und Notifications. Automatisches Senden erst nach expliziter Freigabe und klarer Konfidenz-/Approval-Logik."
    }
  ]'::jsonb;
  v_seed_umsetzung jsonb := '[
    {
      "id":"sebo_handover_repo",
      "typ":"Zugang",
      "titel":"Repo- oder ZIP-Zugang fuer SeBo v1",
      "status":"offen",
      "wer":"Dadakaev Labs",
      "phase":"SeBo",
      "notiz":"Noetig fuer Review, v1-Abnahme und v2-Migrationsentscheidung."
    },
    {
      "id":"sebo_handover_flows",
      "typ":"Zugang",
      "titel":"Power-Automate-Flow-Exports von SeBo v1",
      "status":"offen",
      "wer":"Dadakaev Labs / HFK IT",
      "phase":"SeBo",
      "notiz":"SEBO_ Naming, Loop-Schutz und VIPA-Trennung pruefen."
    },
    {
      "id":"sebo_handover_test_cases",
      "typ":"Freigabe",
      "titel":"5-10 anonymisierte echte Kundenfaelle bereitstellen",
      "status":"offen",
      "wer":"Stephan / HFK",
      "phase":"SeBo",
      "notiz":"Testdaten fuer classify_email, generate_response und Fallverknuepfung."
    },
    {
      "id":"sebo_blocker_db",
      "typ":"Blocker",
      "titel":"DB-Entscheidung fuer SeBo v2 offen",
      "status":"offen",
      "wer":"Stephan / IT / Mago",
      "phase":"SeBo",
      "notiz":"Blockiert Persistenz-Schicht, Migration und Reminder-Engine."
    }
  ]'::jsonb;
begin
  select data into v_data from public.app_state where id = 'hfk';
  if v_data is null then
    raise notice '0014: app_state (id=hfk) nicht gefunden -- uebersprungen.';
    return;
  end if;

  if jsonb_typeof(v_data #> '{workspaces,hfk,data}') = 'object' then
    v_tpath := array['workspaces','hfk','data','tasks'];
    v_dpath := array['workspaces','hfk','data','stephanDecisions'];
    v_upath := array['workspaces','hfk','data','umsetzungItems'];
  else
    v_tpath := array['tasks'];
    v_dpath := array['stephanDecisions'];
    v_upath := array['umsetzungItems'];
  end if;

  v_tasks := coalesce(v_data #> v_tpath, '[]'::jsonb);
  v_decisions := coalesce(v_data #> v_dpath, '[]'::jsonb);
  v_umsetzung := coalesce(v_data #> v_upath, '[]'::jsonb);
  if jsonb_typeof(v_tasks) <> 'array' then v_tasks := '[]'::jsonb; end if;
  if jsonb_typeof(v_decisions) <> 'array' then v_decisions := '[]'::jsonb; end if;
  if jsonb_typeof(v_umsetzung) <> 'array' then v_umsetzung := '[]'::jsonb; end if;

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

  for v_item in select * from jsonb_array_elements(v_seed_umsetzung) loop
    if not exists (select 1 from jsonb_array_elements(v_umsetzung) e where e ->> 'id' = v_item ->> 'id') then
      v_umsetzung := v_umsetzung || v_item;
      v_added_u := v_added_u + 1;
    end if;
  end loop;

  v_data := jsonb_set(v_data, v_tpath, v_tasks, true);
  v_data := jsonb_set(v_data, v_dpath, v_decisions, true);
  v_data := jsonb_set(v_data, v_upath, v_umsetzung, true);
  v_data := jsonb_set(v_data, array['updatedAt'], to_jsonb((extract(epoch from now()) * 1000)::bigint), true);

  update public.app_state
     set data = v_data,
         updated_at = (extract(epoch from now()) * 1000)::bigint
   where id = 'hfk';

  raise notice '0014: % SeBo-v2 Tasks, % Entscheidungen, % Umsetzungspunkte ergaenzt.', v_added_t, v_added_d, v_added_u;
end $$;
