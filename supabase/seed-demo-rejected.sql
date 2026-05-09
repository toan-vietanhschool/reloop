-- =============================================================
-- ReLoop — Demo: flip 3 demo listings to moderation_passed=false
-- Ticket: TRU-84 / T2-04
-- =============================================================
-- Purpose: provide rows for the admin moderation panel demo. The
-- seed script (`seed-demo.sql`) ships everything as
-- `moderation_passed=true` so the marketplace is populated; here we
-- intentionally flag a small slice so admins have something to act on.
--
-- Selection strategy: deterministic by `created_at desc` so reruns
-- pick the same 3 listings. Owners are real demo profiles, ensuring
-- the admin/users tab also has a candidate (one owner gets 3 rejects).
--
-- Apply via Supabase MCP / service role.
-- Re-runnable: `WHERE moderation_passed=true` so already-rejected
-- rows are not double-touched.
-- =============================================================

with target as (
  select id
  from public.listings
  where owner_id = '11111111-1111-4111-8111-000000000001'::uuid
    and moderation_passed = true
    and status <> 'removed'
  order by created_at desc
  limit 3
)
update public.listings l
set
  moderation_passed = false,
  moderation_reason = 'Demo: spam test — flagged để demo admin moderation',
  moderated_at = now()
from target
where l.id = target.id;
