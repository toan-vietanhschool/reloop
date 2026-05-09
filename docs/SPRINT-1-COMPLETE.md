# Sprint 1 — COMPLETE

**Date:** 2026-05-09
**Repo:** https://github.com/toan-vietanhschool/reloop
**Supabase project:** vzpwsdmlofsizhkwcpra

---

## Issue Completion (T1-01 → T1-10)

| ID | Title | Status |
|----|-------|--------|
| T1-01 | Project scaffold (Next 16 + Tailwind v4 + Supabase + shadcn) | DONE |
| T1-02 | Supabase auth (Magic-link login, RLS profiles) | DONE |
| T1-03 | Landing page (Vietnamese, eco-luxury direction) | DONE |
| T1-04 | Listings — create / read / update / delete + photo upload + moderation | DONE |
| T1-05 | AI scan (vision route + cache + materials taxonomy) | DONE |
| T1-06 | Map (Leaflet + collection points + reverse-geocode) | DONE |
| T1-07 | RLS hardening migration 0004 (profiles + listings) | DONE |
| T1-08 | Profile page (eco-points badge, level, activity feed) | DONE |
| T1-09 | Eco-points engine (RPC + audit trail + level-up) | DONE |
| T1-10 | Polish (error/loading boundaries, toasts, a11y, lint clean) | DONE |

---

## Build Status

| Check | Result |
|-------|--------|
| `pnpm install` | up-to-date (no install needed) |
| `pnpm typecheck` (`tsc --noEmit`) | PASS — 0 errors |
| `pnpm lint` (eslint) | PASS — 0 errors, 0 warnings |
| `pnpm build` (`next build`) | PASS — 9 static pages, 11 dynamic routes |
| Smoke test (`curl localhost:3000`) | 200 OK, "ReLoop" present in HTML |

Notable build output:
- `middleware` file convention deprecated in Next 16 — currently warns, will need rename to `proxy` in a future cleanup (non-blocking).

---

## Live URLs

| Service | URL |
|---------|-----|
| GitHub | https://github.com/toan-vietanhschool/reloop |
| Supabase project | https://supabase.com/dashboard/project/vzpwsdmlofsizhkwcpra |
| Vercel | NOT DEPLOYED YET — user to connect via dashboard |

---

## Migration History

| Version | Name | Applied |
|---------|------|---------|
| 20260509155842 | 0001_init | yes |
| 20260509162729 | 0003_points_rpc | yes |
| 20260509164954 | 0004_rls_hardening | yes (this session) |

> Note: 0002 was reserved for an earlier attempt and superseded by 0003.

### Supabase advisors after 0004

5 WARN remaining, all pre-existing:
- 2× `SECURITY DEFINER` warnings on `handle_new_user` (auth trigger function — must remain definer)
- 2× `SECURITY DEFINER` warnings on `is_admin` (helper used by RLS — must remain definer)
- 1× `auth_leaked_password_protection` disabled (Supabase dashboard toggle)

No CRITICAL or HIGH advisors. The cube/earthdistance extension warnings cleared on 0004.

---

## Critical Code Fix Applied (CA-1)

**Problem:** `actions/listings.ts > createListing()` updated `moderation_passed` using the user's RLS-respecting client. After 0004, the new policy `listings_owner_update_safe_fields` pins `moderation_passed` to its committed value, so this update would silently fail and listings would be permanently un-moderated.

**Fix:** The moderation update now uses `createAdminClient()` (service role), matching the pattern used by `awardPoints()`. The initial INSERT still uses the user's session (RLS-respecting via `listings_owner_insert`). See `actions/listings.ts` lines 247–262.

---

## Other Notable Refactors This Session

- Extracted `POINTS`, `ECO_ACTION_KINDS`, and `ECO_ACTION_LABELS_VI` from `actions/points.ts` into `lib/points.ts`. Required because Next 16 forbids non-async-function exports from `"use server"` files.
- Removed unused `eslint-disable no-console` directives in `app/error.tsx` and `app/global-error.tsx`.
- Refactored `EcoPointsBadge` to avoid synchronous `setState` inside the effect body (`react-hooks/set-state-in-effect`).

---

## Known Issues / Deferred Work

- **`middleware.ts` deprecation warning** — Next 16 prefers `proxy.ts`. Functional, but should be renamed in a follow-up.
- **`OPENAI_API_KEY` not set** — AI scan and AI moderation both fall back to a deterministic stub when the key is missing. User must add via `.env.local` for live AI behavior.
- **`SUPABASE_SERVICE_ROLE_KEY`** — must be set for `createAdminClient()` (used by points engine, moderation update, AI cache). Without it, listing moderation will silently fail. User must fetch from Supabase dashboard → Settings → API.
- **No Vercel deployment yet** — user to connect repo via dashboard, paste env vars, and trigger first deploy.
- **No demo accounts seeded** — RLS test plan in `docs/RLS-TEST-PLAN.md` requires 2 magic-link sign-ups before manual verification.
- **Live UI testing** — production build verified via curl smoke only. Real-device testing on iOS/Android Safari deferred to next session.
- **Test coverage** — unit and integration tests exist for key utilities, but full 80% threshold not yet achieved across the new server actions. Deferred to Sprint 2.

---

## Hand-off Notes for User

### Next steps (in order)

1. **Set environment variables in `.env.local`:**
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase dashboard → Project Settings → API → service_role key)
   - `OPENAI_API_KEY` (your OpenAI account)
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present.

2. **Create 2 demo accounts** via http://localhost:3000/auth/login (magic link). Note their UUIDs from the Supabase Auth dashboard for the RLS test plan.

3. **Run RLS test plan** (`docs/RLS-TEST-PLAN.md`) — verifies that 0004 actually blocks profile.role escalation and listings.moderation_passed self-approval.

4. **Connect to Vercel:**
   - Go to https://vercel.com/new and import the GitHub repo
   - Set the same env vars in the Vercel project settings
   - Trigger first deploy

5. **Manual UI smoke** on real devices (iPhone Safari + Android Chrome) — verify the eco-luxury direction renders correctly, magic-link auth survives the cross-device redirect, and the map loads on mobile.

### Recommended next session focus

- Replace `middleware.ts` with `proxy.ts` per Next 16 deprecation warning.
- Add Playwright E2E covering: magic-link login → create listing → scan AI → claim points → check profile.
- Lift unit test coverage to 80% across `actions/`.
- Wire Sentry (or equivalent) — `app/error.tsx` and `app/global-error.tsx` already log to console, just need the SDK init.

---

_Generated by Wave 8b verification agent — 2026-05-09._
