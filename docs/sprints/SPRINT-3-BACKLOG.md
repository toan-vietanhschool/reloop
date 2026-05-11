# Sprint 3 Backlog — ReLoop

**Status:** Backlog for post-Bán kết (16/5) through Chung kết (30/5)  
**Date:** 2026-05-10  
**Target:** Deferred tech debt + security hardening + production readiness

---

## A. Tech Debt (20+ items from code review)

### A-1: Replace `as never` Supabase type casts with typed helpers

**Why:** Code review found 20+ instances of `as never` used to force Supabase TypeScript clients into dynamic row types. Brittle, untyped, and masks real errors.

**Effort:** M (3–4 hours)  
**Priority:** P1  
**Sprint target:** S3-pre-CK

**Details:**
- Extract `Database['public']['Tables'][T]['Row']` into a `getTableRow<T>()` helper
- Apply across `actions/listings.ts`, `actions/badges.ts`, `actions/points.ts`
- Replace all `as never` casts with proper generics
- Verify typecheck passes with 0 errors

---

### A-2: Move cube/earthdistance extensions out of public schema

**Why:** Supabase advisor WARN: extensions currently in public schema. Best practice: isolate in extensions schema.

**Effort:** S (1–2 hours)  
**Priority:** P2  
**Sprint target:** S3-post-CK

**Details:**
- Create new migration: `0010_extensions_schema.sql`
- Move cube/earthdistance to `extensions` schema
- Update geoqueries to reference `extensions.ll_to_earth()`
- Verify map queries still work

---

### A-3: Extract duplicated `formatRelative` helper

**Why:** Code review: `admin/moderation` and `admin/points` both define timestamp formatting. DRY violation.

**Effort:** S (1 hour)  
**Priority:** P2  
**Sprint target:** S3-pre-CK

**Details:**
- Create `lib/format.ts` with `formatRelativeTime(date: Date): string`
- Import in both admin pages
- Remove duplicates

---

### A-4: Refactor SchoolPrompt + BadgeUnlockDialog to remove eslint-disabled effects

**Why:** Two components still have `// eslint-disable-next-line react-hooks/exhaustive-deps` after partial refactor.

**Effort:** M (2–3 hours)  
**Priority:** P2  
**Sprint target:** S3-pre-CK

**Details:**
- Audit effect dependencies in both components
- Extract state management or memoization to fix linter warnings
- Verify all e2e tests still pass

---

### A-5: Replace console.warn with structured logger

**Why:** `actions/badges.ts` and `lib/openai.ts` use bare `console.warn()`. Not queryable in production.

**Effort:** M (2–3 hours)  
**Priority:** P1  
**Sprint target:** S3-pre-CK

**Details:**
- Wire Sentry's structured logging or pino
- Replace console.warn calls with logger.warn()
- Configure log level (warn, error, info)
- Verify Sentry dashboard shows structured logs

---

## B. Feature Gaps (originally skipped per F.2 user choice — Sprint 3 wishlist)

These features were intentionally deferred to focus on core MVP. Revisit only if time permits after post-Bán kết hardening.

### B-1: Chat 1-1 via Supabase Realtime (#14)

**Why:** Direct messaging between users (e.g., listing interest → DM).

**Effort:** L (6–8 hours)  
**Priority:** P2  
**Sprint target:** S4+ (wishlist)

**Details:**
- New `messages` table (already in schema, unused)
- Realtime subscription in `lib/realtime.ts`
- Chat UI component
- Notification trigger on new message
- E2E test: send message → receive notification

---

### B-2: Exchange flow: Request → Accept → Complete → Rate (#15)

**Why:** Full lifecycle for C2C trades (currently pin approval only).

**Effort:** L (8–10 hours)  
**Priority:** P2  
**Sprint target:** S4+ (wishlist)

**Details:**
- Exchange state machine (requested → accepted → completed → cancelled)
- Exchange request form on listings
- Accept/decline endpoints
- Complete + rate UI
- Audit trail for each state
- Notification cascade

---

### B-3: Notifications real-time (#21)

**Why:** Real-time event updates (badge unlock, admin action, pin verified).

**Effort:** M (4–5 hours)  
**Priority:** P2  
**Sprint target:** S4+ (wishlist)

**Details:**
- Supabase Realtime subscription in `app/(auth)/dashboard/page.tsx`
- Notification bell + dropdown
- Mark as read
- Clear old notifications (>30d cron)

---

### B-4: EcoCoach chatbot (#20)

**Why:** AI assistant for eco tips, recycling FAQ.

**Effort:** L (6–8 hours)  
**Priority:** P2  
**Sprint target:** S4+ (wishlist)

**Details:**
- OpenAI Assistant API or GPT-4o fine-tune
- Chat UI in `/ecocoach` route
- Realtime streaming responses
- Context awareness (user location, recent scans)
- E2E test: ask question → get answer

---

## C. Security Hardening

### C-1: M-4 RLS verification test — profiles role column

**Why:** SQL audit M-4: role column is pinned via `profiles_update_own_safe_fields` policy, but needs live-user verification.

**Effort:** S (1 hour — test only, code already in 0004)  
**Priority:** P0 (pre-Chung kết)  
**Sprint target:** S3-pre-CK

**Details:**
- Follow `docs/testing/RLS-TEST-PLAN.md`
- Create 2 real demo accounts
- Attempt to escalate role to 'admin' via UPDATE
- Verify UPDATE fails (403)
- Document proof screenshots

---

### C-2: Banned user enforcement live test

**Why:** proxy.ts now checks banned flag; verify in staging + production.

**Effort:** S (1 hour)  
**Priority:** P0  
**Sprint target:** S3-pre-CK

**Details:**
- Ban a demo user via admin panel
- Attempt to access protected routes
- Verify 403 Forbidden (Unauthorized)
- Unban + verify access restored

---

### C-3: RLS test plan full execution

**Why:** `docs/testing/RLS-TEST-PLAN.md` exists but not yet run against production schema.

**Effort:** M (2–3 hours)  
**Priority:** P0  
**Sprint target:** S3-pre-CK

**Details:**
- Run all 8 test cases:
  1. Profile role escalation (M-4)
  2. Profile points/level integrity
  3. Listings owner-only delete
  4. Listings moderation_passed immutability
  5. Pins community threshold (5 votes)
  6. Admin audit trail logging
  7. Banned user enforcement
  8. Message thread access (between parties only)
- Document results + screenshots + timings

---

### C-4: Sentry alert rules configuration

**Why:** Sentry currently passive (errors logged but no alerts configured).

**Effort:** M (2–3 hours)  
**Priority:** P1  
**Sprint target:** S3-pre-CK

**Details:**
- Create alert rule: error count >5 in 5 minutes → Slack notification
- Create alert rule: 500 errors on `/api/ai/analyze-image` → immediate page
- Create alert rule: CRON_SECRET mismatch attempts → security incident
- Test: trigger synthetic error → verify alert fires

---

### C-5: Rate limit upgrade: in-memory → Upstash Redis

**Why:** Single-instance in-memory rate limiting fragile for MVP. Upstash Redis scales.

**Effort:** M (3–4 hours)  
**Priority:** P1  
**Sprint target:** S3-post-CK

**Details:**
- Add `@upstash/redis` dependency
- Replace `Ratelimit()` in `lib/ratelimit.ts`
- Test: 10 rapid `/api/ai/analyze-image` calls → verify 429 After 5
- Verify Upstash dashboard shows hit counts
- Cost: ~$0.20/month for MVP scale

---

## D. Production Readiness

### D-1: Fix Cloudflare Workers 500 error

**Why:** Worker deployed but broken (opennextjs/opennextjs-cloudflare#1258). Upstream fix or Next.js pin needed.

**Effort:** L (depends on upstream — 4–8 hours if pinning Next)  
**Priority:** P1  
**Sprint target:** S3-post-CK

**Options:**
1. Wait for upstream fix (opennextjs-cloudflare >= 1.19.9)
2. Pin Next.js 15.5.x (project-wide downgrade)
3. Drop Cloudflare Workers, use Vercel only

**Currently recommended:** Pin Next 15.5.16, re-test all routes.

---

### D-2: Vercel production deploy

**Why:** Manual user task — link GitHub repo, set env vars, deploy.

**Effort:** S (1 hour user time)  
**Priority:** P0 (critical pre-Bán kết)  
**Sprint target:** S3-pre-CK

**Details:**
- Go to https://vercel.com/new
- Import `toan-vietanhschool/reloop`
- Set 9 env vars (SUPABASE_*, OPENAI_API_KEY, POSTHOG_*, SENTRY_*, CRON_SECRET)
- Enable automatic deployments from main
- Trigger first deploy
- Verify production build PASS (5.6s Turbopack)
- Smoke test: `/`, `/leaderboard`, `/auth/login`, `/dashboard`

---

### D-3: Custom domain + HTTPS

**Why:** `reloop-mvp.vercel.app` is default. Custom domain setup boosts perceived quality.

**Effort:** S (30 mins user time)  
**Priority:** P2  
**Sprint target:** S3-post-CK

**Options:**
- Point DNS to Vercel (CNAME)
- Update Supabase Auth redirect URIs
- Update social card OG image domain

**Recommended domain:** `reloop.eco` or `reloop.vn` (~$10–20/year)

---

### D-4: Real Sentry project + DSN

**Why:** Currently placeholder. Real project needed for production monitoring.

**Effort:** S (30 mins user time)  
**Priority:** P1  
**Sprint target:** S3-pre-CK

**Details:**
- Go to https://sentry.io/signup
- Create new project (Next.js)
- Copy DSN
- Set `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_AUTH_TOKEN` in Vercel
- Trigger test error: `curl https://[vercel-domain]/sentry-test`
- Verify error appears in Sentry dashboard

---

### D-5: Real PostHog project + dashboard config

**Why:** Currently placeholder. Real project needed for event tracking + feature flags.

**Effort:** M (1–2 hours user time)  
**Priority:** P1  
**Sprint target:** S3-pre-CK

**Details:**
- Go to https://posthog.com/signup
- Create new project "ReLoop Production"
- Copy API keys
- Set `NEXT_PUBLIC_POSTHOG_KEY` + `POSTHOG_API_KEY` in Vercel
- Import 3 dashboards from `docs/operations/POSTHOG-DASHBOARD.md`:
  - Overview (weekly active users, top events)
  - User Behavior (funnel: auth → listing → scan → points)
  - Admin Activity (moderation actions, ban count)
- Verify live events in Live Events tab after first user action

---

### D-6: E2E auth fixture (storageState) — 4 skipped tests

**Why:** 4 e2e tests skipped pending auth fixture setup (loggedInUser.json).

**Effort:** S (1–2 hours)  
**Priority:** P1  
**Sprint target:** S3-pre-CK

**Details:**
- Create `tests/fixtures/auth.setup.ts`
- Log in with test user email
- Save storageState to `tests/.auth/user.json`
- Load fixture in e2e tests: `page.context().addInitScript()`
- Unskip tests:
  1. Can create listing (authenticated)
  2. Can view dashboard (authenticated)
  3. Can scan image (authenticated, AI stubbed)
  4. Can claim eco points (authenticated)

---

### D-7: Lighthouse CI on Vercel preview URLs

**Why:** Each preview deployment should report Core Web Vitals + bundle size.

**Effort:** M (2–3 hours)  
**Priority:** P2  
**Sprint target:** S3-post-CK

**Details:**
- Install `@lhci/cli` dev dependency
- Create `.lighthouserc.json` with targets (LCP < 2.5s, CLS < 0.1)
- Add GitHub Actions job: `lighthouse-ci.yml`
- Comment on each PR: Lighthouse scores + 🟢/🟡/🔴 status
- Monitor trends over sprints

---

### D-8: Database backup snapshot — manual pre-Chung kết

**Why:** Final backup before Chung kết live demo (T2-10 deferred).

**Effort:** S (30 mins user time)  
**Priority:** P0 (mandatory pre-30/5)  
**Sprint target:** S3-pre-CK (execute T-1d before Chung kết)

**Details:**
- Log in to Supabase dashboard → project `vzpwsdmlofsizhkwcpra`
- Database → Backups → Create snapshot `pre-final-2026-05-29`
- Save screenshot proof
- Optional: `pg_dump` to local file (DO NOT commit to git)
- Store backup credentials in secure location (1Password/LastPass)

---

## Summary Table

| Category | ID | Title | Effort | Priority | Target |
|----------|----|----|--------|----------|--------|
| A | A-1 | Replace `as never` with typed helpers | M | P1 | S3-pre-CK |
| A | A-2 | Move extensions to extensions schema | S | P2 | S3-post-CK |
| A | A-3 | Extract duplicated formatRelative | S | P2 | S3-pre-CK |
| A | A-4 | Refactor SchoolPrompt/BadgeUnlockDialog | M | P2 | S3-pre-CK |
| A | A-5 | Replace console.warn with logger | M | P1 | S3-pre-CK |
| B | B-1 | Chat 1-1 Realtime | L | P2 | S4+ |
| B | B-2 | Exchange full lifecycle | L | P2 | S4+ |
| B | B-3 | Notifications real-time | M | P2 | S4+ |
| B | B-4 | EcoCoach chatbot | L | P2 | S4+ |
| C | C-1 | M-4 RLS verification test | S | P0 | S3-pre-CK |
| C | C-2 | Banned user enforcement test | S | P0 | S3-pre-CK |
| C | C-3 | Full RLS test plan execution | M | P0 | S3-pre-CK |
| C | C-4 | Sentry alert rules | M | P1 | S3-pre-CK |
| C | C-5 | Rate limit Upstash Redis | M | P1 | S3-post-CK |
| D | D-1 | Fix Cloudflare Workers 500 | L | P1 | S3-post-CK |
| D | D-2 | Vercel production deploy | S | P0 | S3-pre-CK |
| D | D-3 | Custom domain + HTTPS | S | P2 | S3-post-CK |
| D | D-4 | Real Sentry project + DSN | S | P1 | S3-pre-CK |
| D | D-5 | Real PostHog project + dashboard | M | P1 | S3-pre-CK |
| D | D-6 | E2E auth fixture (4 skipped tests) | S | P1 | S3-pre-CK |
| D | D-7 | Lighthouse CI on previews | M | P2 | S3-post-CK |
| D | D-8 | DB backup snapshot | S | P0 | S3-pre-CK |

**Total items:** 22  
**P0 (blockers):** 6 (C-1, C-2, C-3, D-2, D-8 + part of C-4)  
**P1 (should-do):** 8 (A-1, A-5, C-4, C-5, D-1, D-4, D-5, D-6)  
**P2 (nice-to-have):** 8 (A-2, A-3, A-4, B-1, B-2, B-3, B-4, D-3, D-7)

---

## Phase Timing

### S3-pre-CK (T-7d before Bán kết 16/5)
**Focus:** Production readiness + security sign-off

- [ ] P0 items (C-1, C-2, C-3, D-2, D-8, D-4, D-5)
- [ ] P1 items (A-1, A-5, C-4, C-6)
- [ ] E2E tests passing (D-6)
- [ ] Vercel live + smoke test all 19 routes
- [ ] Sentry + PostHog feeding real events

**Estimated time:** 24–32 hours (4–5 days, parallel with practice)

### S3-post-CK (T-2w after Bán kết until Chung kết 30/5)
**Focus:** Polish + optional features + infrastructure scaling

- [ ] A-2, A-3, A-4 (tech debt cleanup)
- [ ] C-5 (Redis rate limit)
- [ ] D-1 (Cloudflare fix, or mark as known limitation)
- [ ] D-3, D-7 (nice-to-have)
- [ ] B-1 through B-4 if time permits

**Estimated time:** 20–30 hours

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Vercel env vars wrong | Dry-run with 7 days lead time; smoke test all routes |
| Sentry/PostHog not configured | Real projects created T-7d; test with synthetic events |
| RLS test failures | Run test plan once against Supabase staging (separate project) |
| Cloudflare still broken | Mark as known limitation; Vercel is primary deployment |
| Upstash Redis overkill for MVP | Wait until monitoring shows >100 reqs/sec |

---

**Last updated:** 2026-05-10 | **Next checkpoint:** T-7d pre-Bán kết (2026-05-09, i.e., immediate action)
