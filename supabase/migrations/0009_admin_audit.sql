-- =============================================================
-- ReLoop — Admin audit log: extend eco_actions.kind for admin actions
-- Ticket: TRU-84 / T2-04
-- =============================================================
-- The base CHECK constraint on eco_actions.kind only allowed user-
-- triggered values (scan, listing_create, exchange_complete,
-- point_pin, vote). Admin moderation needs to write audit rows for
-- 'admin_approve' / 'admin_reject' / 'admin_ban'. We extend the
-- constraint in place so the existing reporting query surface stays
-- the same.
--
-- Idempotent: drop the old constraint by name (created in 0001_init)
-- and recreate with the broader value set.
-- =============================================================

alter table public.eco_actions
  drop constraint if exists eco_actions_kind_check;

alter table public.eco_actions
  add constraint eco_actions_kind_check
  check (kind in (
    'scan',
    'listing_create',
    'exchange_complete',
    'point_pin',
    'vote',
    'admin_approve',
    'admin_reject',
    'admin_ban'
  ));
