-- =============================================================
-- ReLoop — Eco Points RPC
-- Ticket: TRU-79 / T1-09
-- =============================================================
-- Adds public.increment_points(uid, delta): atomic, security definer.
--
-- Notes:
--   - Recomputes `level` from new total to keep the column in sync
--     without separate triggers (level = floor(eco_points / 100) + 1).
--   - Clamps eco_points to >= 0 so refunds / negative deltas can never
--     drive a profile below zero. Level is clamped to >= 1.
--   - Granted to service_role only — Server Actions reach this via the
--     admin client. Public role / anon are explicitly denied.
-- =============================================================

create or replace function public.increment_points(uid uuid, delta int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  new_total int;
begin
  update profiles
    set eco_points = greatest(0, eco_points + delta),
        level      = greatest(1, ((greatest(0, eco_points + delta)) / 100) + 1),
        updated_at = now()
  where id = uid
  returning eco_points into new_total;

  if new_total is null then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.increment_points(uuid, int) from public;
revoke execute on function public.increment_points(uuid, int) from anon;
revoke execute on function public.increment_points(uuid, int) from authenticated;
grant  execute on function public.increment_points(uuid, int) to service_role;
