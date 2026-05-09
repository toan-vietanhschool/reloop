-- =============================================================
-- ReLoop — Badge Helper RPC
-- Ticket: TRU-83 / T2-03
-- =============================================================
-- Adds public.check_and_award_badge(uid, badge_code): atomic
-- insert-or-noop into user_badges, returning whether a NEW row
-- was created.
--
-- Notes:
--   - `on conflict do nothing` keeps the call idempotent so callers
--     can re-evaluate badge rules without worrying about double-awards.
--   - We use the `xmax = 0` trick to detect insert vs no-op:
--     * `xmax = 0` after an insert → the row is new (return true)
--     * `xmax <> 0` → conflict path skipped the insert (return false)
--     `found` alone is unreliable because it stays true on the
--     "do nothing" branch in some pg versions.
--   - security definer + pinned search_path matches the convention
--     established by `increment_points` in 0003.
--   - Granted to service_role only — server actions reach this via
--     the admin client. Public role / anon are explicitly denied.
-- =============================================================

create or replace function public.check_and_award_badge(uid uuid, badge_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted boolean;
begin
  with ins as (
    insert into public.user_badges (user_id, badge_code)
    values (uid, badge_code)
    on conflict (user_id, badge_code) do nothing
    returning 1
  )
  select exists(select 1 from ins) into inserted;

  return coalesce(inserted, false);
end;
$$;

revoke execute on function public.check_and_award_badge(uuid, text) from public;
revoke execute on function public.check_and_award_badge(uuid, text) from anon;
revoke execute on function public.check_and_award_badge(uuid, text) from authenticated;
grant  execute on function public.check_and_award_badge(uuid, text) to service_role;
