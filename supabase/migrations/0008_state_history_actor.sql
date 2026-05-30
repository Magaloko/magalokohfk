-- 0008: Verlauf-Zuordnung — wer hat die Änderung ausgelöst?
-- Beim Snapshot (vor jedem Write) wird die Session-Identität mitgeschrieben.
-- Bestehende Zeilen bleiben NULL (keine Zuordnung für Alt-Historie).

alter table public.state_history add column if not exists actor text;
