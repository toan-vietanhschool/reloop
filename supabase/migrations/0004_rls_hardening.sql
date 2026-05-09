-- =============================================================
-- ReLoop — RLS Hardening Migration
-- Ticket: TRU-77 / T1-07
-- Author: A8-1 Security Agent (2026-05-09)
-- Resolves: SQL-AUDIT M-4 (profiles.role self-escalation)
--           SQL-AUDIT deferred item 4 (listings.moderation_passed owner bypass)
-- =============================================================

-- =========== PROFILES: block role/eco_points/level self-escalation ===========

-- Drop the broad owner-update policy that allowed users to update any column
-- on their own profile row (including role, eco_points, level).
drop policy if exists "profiles_update_own" on public.profiles;

-- New restrictive update policy: users can update ONLY safe display fields.
-- WITH CHECK re-reads the committed values of role, eco_points, and level
-- and asserts they are unchanged — any attempt to mutate them is rejected
-- at the database layer, regardless of what the application sends.
--
-- NOTE: The subselect reads the CURRENT committed row (pre-update snapshot)
-- because WITH CHECK runs after the data is staged but before commit.
-- Comparing new.role = old.role (trigger style) is not available in RLS;
-- the correlated subselect is the canonical approach per Supabase docs.
create policy "profiles_update_own_safe_fields" on public.profiles
  for update
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    -- Deny if caller attempts to change role
    and role = (select role from public.profiles where id = (select auth.uid()))
    -- Deny if caller attempts to change eco_points (must go through increment_points RPC)
    and eco_points = (select eco_points from public.profiles where id = (select auth.uid()))
    -- Deny if caller attempts to change level (computed by increment_points)
    and level = (select level from public.profiles where id = (select auth.uid()))
  );

-- Admin can update any profile column (including role promotion).
-- Uses the existing is_admin() helper (security definer, search_path=public).
drop policy if exists "admin_update_any_profile" on public.profiles;
create policy "admin_update_any_profile" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- =========== LISTINGS: block moderation_passed self-approval ===========

-- Drop the broad owner-update policy that allowed the listing owner to
-- set moderation_passed = true (bypassing the AI moderation server action).
drop policy if exists "listings_owner_update" on public.listings;

-- New restrictive update policy: owners can update content fields but
-- moderation_passed is pinned to its current committed value.
-- This forces all moderation changes through the server action that
-- calls the AI moderation API (actions/listings.ts > moderateListing).
create policy "listings_owner_update_safe_fields" on public.listings
  for update
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    -- moderation_passed must remain unchanged from current committed value
    and moderation_passed = (
      select moderation_passed from public.listings where id = listings.id
    )
  );

-- Admin can update any listing column (including moderation_passed for manual override).
drop policy if exists "admin_update_any_listing" on public.listings;
create policy "admin_update_any_listing" on public.listings
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- =========== EXTENSIONS: move cube/earthdistance out of public schema ===========
-- Supabase advisor warns when extensions live in the public schema
-- because user-defined objects in public can shadow extension functions.
--
-- IMPORTANT: ALTER EXTENSION ... SET SCHEMA is not supported for all
-- extension types in all Postgres versions. If this block fails, the
-- extensions remain in public which is a WARN, not a CRITICAL.
-- The DO/EXCEPTION block prevents the entire migration from rolling back.
do $$
begin
  alter extension cube set schema extensions;
  alter extension earthdistance set schema extensions;
exception
  when others then
    raise notice 'Could not move cube/earthdistance to extensions schema: % (non-fatal, extensions remain in public)', sqlerrm;
end $$;
