# RLS Code Path Audit — ReLoop Actions & API
**Auditor:** A8-1 Security Agent | **Date:** 2026-05-09 | **Ticket:** TRU-77

---

## Summary

All server-side code paths were audited for correct Supabase client usage:
- `createClient()` (RLS-respecting, cookie-bound anon-key) — used for user-facing reads and writes
- `createAdminClient()` (service_role, RLS-bypassing) — used only where a user-facing client is architecturally impossible

---

## createAdminClient() Call Sites

| # | File | Function | Justification | Verdict |
|---|------|----------|---------------|---------|
| 1 | `actions/points.ts` | `awardPoints()` | `eco_actions` has NO client INSERT policy by design (prevents self-awarding). Points can only be granted server-side. `increment_points` RPC is also service_role-only. | **JUSTIFIED** |
| 2 | `actions/listings.ts` | `ensureBucket()` | Storage bucket creation requires admin permissions. Called once per process lifecycle, not per request. | **JUSTIFIED** |
| 3 | `lib/openai/vision.ts` | `fetchCachedAnalysis()` | AI analysis cache is inserted by the server, not the user. The `ai_analyses` insert policy uses `(select auth.uid()) = user_id` but the cache entry may be associated with a different user (cache-sharing). Service_role allows cross-user cache reads. | **JUSTIFIED — with note** |
| 4 | `lib/openai/vision.ts` | `persistAnalysis()` | Cache write to `ai_analyses`. No user INSERT policy for cross-user cache entries. Service_role is required. | **JUSTIFIED** |
| 5 | `lib/openai/vision.ts` | `ensureScansBucket()` | Same as #2 — bucket provisioning requires admin. | **JUSTIFIED** |

**Total createAdminClient() calls: 5 across 3 files. All justified.**

### Note on vision.ts cache reads (#3)

`fetchCachedAnalysis()` reads `ai_analyses` by `image_hash` (unique index), bypassing the `ai_read_own` policy which restricts SELECT to the row's original `user_id` or admin. Using service_role here is intentional: the cache is keyed by image hash, not by user, and serves as a shared performance optimization. If this cache were exposed via a user-facing endpoint without the admin client, users could only see their own cached analyses, defeating the purpose.

**Recommendation**: Document this behavior explicitly in a code comment (currently only partially documented). Ensure `ai_analyses.result` never contains user-identifying data beyond `user_id`.

---

## createClient() (RLS-Respecting) Usage

| File | Function | RLS Active | Note |
|------|----------|------------|------|
| `actions/auth.ts` | `getCurrentUser()` | YES — anon key + cookie session | Reads auth.users via Supabase Auth, not RLS table |
| `actions/auth.ts` | `getCurrentProfile()` | YES | SELECT on profiles — covered by `profiles_read_public` |
| `actions/auth.ts` | `updateProfile()` | YES | UPDATE on profiles — covered by `profiles_update_own_safe_fields` (0004) |
| `actions/listings.ts` | `createListing()` | YES | INSERT — covered by `listings_owner_insert` |
| `actions/listings.ts` | `updateListing()` | YES | UPDATE — covered by `listings_owner_update_safe_fields` (0004) |
| `actions/listings.ts` | `deleteListing()` | YES | Soft-delete (status=removed) — covered by `listings_owner_delete` |
| `actions/listings.ts` | `fetchPublicListings()` | YES | SELECT with `moderation_passed=true` — covered by `listings_read_public` |
| `actions/listings.ts` | `uploadPhotos()` | YES | Storage upload with user's session — bucket policies apply |
| `app/api/ai/analyze-image/route.ts` | `POST` handler | YES | Auth check via `supabase.auth.getUser()` before any data access |

**Total createClient() paths: 9. All correctly use the anon/cookie client, subject to RLS.**

---

## Double-Write Risk: listings moderation_passed

`createListing()` in `actions/listings.ts` follows this flow:
1. INSERT row with `moderation_passed: false` (RLS: `listings_owner_insert` allows this)
2. Call `moderateListing()` (OpenAI)
3. UPDATE `photos` + `moderation_passed: moderation.safe` using `createClient()` (user's session)

**Before migration 0004**: Step 3 would succeed even if `moderation.safe = true`, because the old `listings_owner_update` policy had no `moderation_passed` restriction.

**After migration 0004**: Step 3 uses `listings_owner_update_safe_fields`. The `with check` clause pins `moderation_passed` to its current committed value. Since the INSERT in step 1 commits `moderation_passed = false`, the UPDATE in step 3 would fail the `with check` if `moderation.safe = true`.

**This is a functional regression introduced by 0004.**

### Fix Required in listings.ts

The `moderateListing` update in `createListing()` must be changed to use `createAdminClient()` so it can set `moderation_passed = true`. This is an authorized server-only write (not user-initiated) and follows the same pattern as `awardPoints()`.

**Recommended change** (do NOT implement — flagged for the owning wave's action owner):

```typescript
// In createListing() after moderateListing() call:
// Use admin client for moderation update because the RLS policy on
// listings_owner_update_safe_fields intentionally blocks moderation_passed
// from being changed by the owner's session (migration 0004).
const admin = createAdminClient()
const { error: updateError } = await admin
  .from("listings")
  .update({ photos: photoUrls, moderation_passed: moderation.safe })
  .eq("id", listingId)
```

Similarly, `updateListing()` correctly never touches `moderation_passed` (the `updates` object never includes it), so it is safe as-is.

---

## auth.signOut() and Session Manipulation

| File | Usage | Risk |
|------|-------|------|
| `actions/auth.ts` → `signOut()` | `supabase.auth.signOut()` then `redirect("/")` | LOW — standard sign-out. No session forging. |

No other session manipulation paths found.

---

## Findings Summary

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| CA-1 | HIGH | `createListing()` moderation update will fail after 0004 because user session cannot change `moderation_passed` | FLAGGED — fix required before deploying 0004 |
| CA-2 | LOW | `vision.ts` cache read justification is partially undocumented | NOTED — add comment |
| CA-3 | INFO | All 5 `createAdminClient()` calls are architecturally justified | OK |
| CA-4 | INFO | All 9 `createClient()` user paths respect RLS | OK |

---

## Deployment Order (Critical)

**0004 must NOT be applied to production before CA-1 fix is deployed.** The moderation update path in `createListing()` will error, leaving listings permanently un-moderated (stuck at `moderation_passed = false`).

Fix sequence:
1. Update `createListing()` to use `createAdminClient()` for the moderation+photos update
2. Deploy the code change
3. Apply migration 0004
