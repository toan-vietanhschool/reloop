-- =============================================================
-- ReLoop — Soft-ban flag on profiles
-- Ticket: TRU-84 / T2-04
-- =============================================================
-- Admin can soft-ban abusive users. We record:
--   * banned_at  — null when active, timestamptz when banned
--   * banned_reason — short admin-provided rationale
--
-- For MVP we DO NOT block sign-in here (the auth.users row is
-- untouched); a Phase-2 middleware redirect handles the lockout
-- experience. Read paths that need to filter banned users can
-- query `where banned_at is null`.
-- =============================================================

alter table public.profiles
  add column if not exists banned_at timestamptz,
  add column if not exists banned_reason text;
