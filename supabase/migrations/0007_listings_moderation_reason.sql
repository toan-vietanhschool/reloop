-- =============================================================
-- ReLoop — Persist AI moderation reason on listings
-- Ticket: TRU-84 / T2-04
-- =============================================================
-- AI moderation already returns {safe, reason}; we persist `reason`
-- so the admin moderation panel can show why content was flagged.
-- `moderated_at` records when the moderation pass executed (different
-- from `updated_at`, which reflects any owner edit).
-- =============================================================

alter table public.listings
  add column if not exists moderation_reason text,
  add column if not exists moderated_at timestamptz;
