# SQL Security Audit — ReLoop 0001_init.sql
**Auditor:** W3-C Security Audit Agent | **Date:** 2026-05-09 | **Ticket:** TRU-72

---

## RLS Coverage (14/14 tables)

| Table | RLS Enabled | Policies | Status |
|-------|-------------|----------|--------|
| profiles | YES (AUDIT added) | SELECT public, UPDATE own | FIXED |
| material_categories | YES | SELECT all, ALL admin | OK |
| material_info | YES | SELECT all, ALL admin | OK |
| listings | YES | SELECT×3, INSERT, UPDATE, DELETE | OK |
| ai_analyses | YES | SELECT own/admin, INSERT own | OK |
| collection_points | YES | SELECT all, INSERT auth, UPDATE owner/admin, DELETE admin | OK |
| collection_point_votes | YES | SELECT all, INSERT/UPDATE/DELETE self | OK |
| exchanges | YES | SELECT parties/admin, INSERT receiver, UPDATE parties, DELETE admin | FIXED |
| messages | YES | SELECT/INSERT parties | OK |
| eco_actions | YES | SELECT own/admin | OK |
| badges | YES | SELECT all, ALL admin | FIXED |
| user_badges | YES | SELECT all | OK |
| notifications | YES | SELECT/UPDATE/DELETE own | FIXED |
| analytics_events | YES | SELECT admin | OK |

---

## Findings

### CRITICAL

**C-1: profiles table had no RLS enabled (Playbook §4.1 lines 252-265)**
- Risk: All authenticated users could read/write all profile rows including `role` column.
- Fix: Added `alter table profiles enable row level security` + read-public / update-own policies.
- Status: Fixed inline with `-- AUDIT:` comment.

**C-2: Missing earthdistance + cube extensions (Playbook §4.1 lines 336-338, 385)**
- Risk: `ll_to_earth()` geo indexes would fail silently or at migration time.
- Fix: Added `create extension if not exists cube; create extension if not exists earthdistance;` at top.
- Status: Fixed inline.

### HIGH

**H-1: exchanges table missing DELETE policy (Playbook §4.1 lines 432-439)**
- Risk: No admin could clean up completed/cancelled exchanges; orphan rows accumulate.
- Fix: Added `create policy "exchanges_admin_delete" ... using (is_admin())`.
- Status: Fixed inline.

**H-2: badges table missing write policy (Playbook §4.1 lines 488-491)**
- Risk: Badges were effectively read-only from RLS perspective but write path was undocumented.
- Fix: Added `create policy "badges_admin_write" ... using (is_admin())`.
- Status: Fixed inline.

**H-3: notifications UPDATE missing WITH CHECK (Playbook §4.1 lines 503-504)**
- Risk: User could update any column (kind, title, body) on own notifications, not just `read_at`.
- Fix: Added `with check ((select auth.uid()) = user_id)`.
- Status: Fixed inline.

**H-4: notifications missing DELETE policy (Playbook §4.1 lines 503-504)**
- Risk: Users cannot dismiss/delete own notifications, UX and data bloat issue.
- Fix: Added `create policy "notif_delete_own" ... using ((select auth.uid()) = user_id)`.
- Status: Fixed inline.

### MEDIUM

**M-1: exchanges.status is free-text with no constraint (Playbook §4.1 line 425)**
- Risk: Application bugs or direct DB writes could set invalid status values.
- Fix: Added `check (status in ('requested','accepted','completed','cancelled'))`.
- Status: Fixed inline.

**M-2: eco_actions.kind is free-text with no constraint (Playbook §4.1 line 466)**
- Risk: Invalid kind values break points calculation logic silently.
- Fix: Added `check (kind in ('scan','listing_create','exchange_complete','point_pin','vote'))`.
- Status: Fixed inline.

**M-3: update_cp_vote_counts trigger missing set search_path (Playbook §4.1 lines 408-417)**
- Risk: Low (no auth.uid() usage) but inconsistent with security hardening pattern.
- Fix: Added `set search_path = public` to function definition.
- Status: Fixed inline.

**M-4: profiles.role column updatable via user's own-update policy**
- Risk: User could escalate role to 'admin' via UPDATE on own profile row.
- Note: Mitigated by application layer (Server Actions guard role changes). Column-level RLS not supported natively in PostgreSQL.
- Status: **RESOLVED in migration 0004_rls_hardening.sql (T1-07, 2026-05-09)**
  - Dropped `profiles_update_own` (broad owner-update policy).
  - Added `profiles_update_own_safe_fields`: WITH CHECK pins `role`, `eco_points`, and `level` to current committed values using correlated subselects.
  - Added `admin_update_any_profile`: explicit admin-only policy for role promotion and point corrections.
  - Also resolved listings.moderation_passed bypass (deferred item 4 from T1-07 list).

### LOW

**L-1: Enum types use plain CREATE TYPE — not idempotent (Playbook §4.1 lines 241-250)**
- Risk: Re-running migration fails with "type already exists".
- Fix: Wrapped all enum types in `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;`.
- Status: Fixed inline.

**L-2: Triggers and functions use CREATE without OR REPLACE (Playbook §4.1 lines 268-277, 408-417)**
- Risk: Re-running migration fails.
- Fix: Changed to `CREATE OR REPLACE FUNCTION` + `DROP TRIGGER IF EXISTS` before recreating.
- Status: Fixed inline.

**L-3: service_role bypass not documented in SQL (Playbook §4.1 lines 474, 517)**
- Risk: Developer confusion — service_role bypasses RLS by default.
- Fix: Added explicit comments: "Server MUST NOT expose service_role client to browser. Use server-only env var SUPABASE_SERVICE_ROLE_KEY."
- Status: Fixed inline (documentation only).

---

## Performance Pattern Verification — `(select auth.uid())`

Per Supabase blog recommendation (Jan 2025), `(select auth.uid())` is used in all policies instead of `auth.uid()` bare. This ensures the function is called once per query, not once per row. Verified in all 14 tables. Confirmed correct.

## is_admin() Security Definer Verification

`is_admin()` is declared `security definer set search_path = public`. This:
1. Runs with definer's privileges (prevents privilege escalation via search_path hijacking).
2. `set search_path = public` prevents schema injection attacks.
Confirmed correct per Playbook §4.1 lines 280-283.

## Foreign Key Cascade Review

| Relationship | On Delete | Rationale |
|---|---|---|
| profiles → auth.users | CASCADE | User deleted = profile deleted. Correct. |
| listings → profiles | CASCADE | Owner deleted = listings deleted. Acceptable for MVP. |
| ai_analyses → profiles | SET NULL | Cache entry survives user deletion. Correct. |
| collection_points → profiles | SET NULL | POI survives contributor deletion. Correct. |
| exchanges → listings | CASCADE | Listing removed = exchange removed. Review: may lose exchange history. Deferred T1-07. |
| messages → exchanges | CASCADE | Exchange deleted = messages deleted. Acceptable. |

---

## Deferred to T1-07 — Status After A8-1 Audit (2026-05-09)

1. Two-user RLS behavior test — **DOCUMENTED** in `docs/RLS-TEST-PLAN.md` with 12 curl-based scenarios. Requires 2 live signed-up users to execute. Cannot be run statically.
2. `is_admin()` runtime verification — **DOCUMENTED** in test plan scenario 8 (admin promotes user) and scenario 9 (admin approves listing).
3. `profiles.role` self-escalation prevention — **RESOLVED** in 0004 (see M-4 above).
4. Column-level protection for `moderation_passed` on listings — **RESOLVED** in 0004. NOTE: introduces CA-1 regression in `createListing()` — see `docs/RLS-AUDIT-CODE.md`.
5. `exchanges → listings CASCADE` review — **STILL DEFERRED**. Preserving exchange history on listing removal is a product decision. Recommend SET NULL in a future migration.
6. Rate limiting — **PARTIALLY ADDRESSED**: `/api/ai/analyze-image` has in-memory rate limit (5 req/60s/user). Other endpoints unprotected. Full solution requires Upstash Redis or Supabase Edge Function middleware.

## New Findings from T1-07 A8-1 Audit

**CA-1 (HIGH): createListing() moderation update blocked by 0004**
- File: `actions/listings.ts`, function `createListing()`
- After 0004, the `listings_owner_update_safe_fields` policy blocks the server action from setting `moderation_passed = moderation.safe` because the update runs under the user's session (anon key + cookie) and the WITH CHECK pins `moderation_passed` to its current value.
- Fix: use `createAdminClient()` for the post-moderation update step.
- Status: FLAGGED — must fix before deploying 0004 to production.

**CA-2 (LOW): vision.ts cache read justification undocumented**
- File: `lib/openai/vision.ts`, `fetchCachedAnalysis()`
- Admin client is justified (cross-user cache sharing) but the code comment does not explain this.
- Status: NOTED — add inline documentation.

## Migration Summary

| Migration | Applied | Contents |
|-----------|---------|----------|
| 0001_init.sql | YES | Full schema + RLS (all 14 tables) |
| 0003_points_rpc.sql | YES | `increment_points` RPC |
| 0004_rls_hardening.sql | CREATED — PENDING apply | Profiles/listings RLS hardening, extension schema move |

---

## Index Coverage vs Query Patterns (Playbook §3.3)

| Query Pattern | Index | Status |
|---|---|---|
| Owner's listings | `listings_owner_idx` | OK |
| Feed by status | `listings_status_idx` | OK |
| Material filter | `listings_material_idx` | OK |
| Geo proximity search | `listings_geo_idx` (gist/earthdistance) | OK (ext fixed) |
| Activity feed by user | `eco_actions_user_idx` (user_id, created_at desc) | OK |
| Notifications feed | `notif_user_idx` (user_id, created_at desc) | OK |
| Collection point geo | `cp_geo_idx` (gist/earthdistance) | OK (ext fixed) |
| Message thread | `messages_exchange_idx` (exchange_id, created_at) | OK |

---

## Summary

| Severity | Count | Fixed Inline | Fixed 0004 | Deferred |
|---|---|---|---|---|
| CRITICAL | 2 | 2 | 0 | 0 |
| HIGH | 4 | 4 | 0 | 0 |
| MEDIUM | 4 | 3 | 1 | 0 |
| LOW | 3 | 3 | 0 | 0 |
| HIGH (new) | 1 | 0 | 0 | 1 (CA-1 in listings.ts) |
