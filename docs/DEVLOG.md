# ReLoop Development Log

**Purpose:** Track daily progress, AI prompts used, and blockers for TDTU Vibe Coding 2026 finals presentation (BGK reads this at Chung kết).

---

## 2026-05-09 (T6) — Day 0: Foundation Bootstrap

**What:** Bootstrapped Next.js 15 monorepo + Supabase project + Vercel setup + GitHub Actions skeleton. Ran initial migration `0001_init.sql` (14 tables, RLS policies, audit triggers, seed material data).

**AI prompts used:**
1. Claude Opus 4.7: "Phân tích playbook ReLoop và tạo plan 3 waves parallel để setup Linear, Stitch, repo scaffold trong 1 giờ" → Produced approved wave plan + 20 Linear issues + repo folder skeleton
2. (Planned tomorrow T7) Cursor agent: "Implement Server Action `createListing` với Zod validation + AI moderation theo Phần 5.6 playbook"

**Manual changes:**
- Reviewed migration RLS policies for audit compliance (default-deny on all 14 tables)
- Adjusted `material_info` seed data with Vietnamese localization (phân hủy thời gian từ VnExpress/CECR sources)
- Created `.env.example` template with 8 required keys (SUPABASE_*, OPENAI_*, POSTHOG_*, SENTRY_*, VERCEL_*)

**Blockers:** None. Ready for T7 morning dev work.

**Next:** Dev1 auth flow (T1-03) + Dev2 landing page (T1-04) running in parallel T7 morning. Team midday sync 13:00.

---

## 2026-05-10 (T7) — Sprint 2 SHIP — Operations + Gamification + Admin

**What:** All 10 Tier 2 features shipped via 4-wave parallel execution. PostHog 11 events, GitHub Actions CI 5 jobs, Sentry full coverage, Badges 5 with confetti, Leaderboard top 20 + school filter, Admin moderation 3 tabs, Pin points + verify, Share Eco Score 1080x1080, Performance audit ISR-tuned.

**AI prompts used:**
- Wave 9: 3 parallel agents (Pin/Leaderboard/CI)
- Wave 10: 3 parallel agents (Badges/Admin/Sentry)
- Wave 11: 3 parallel agents (PostHog/Share/Performance)
- Wave 12: final verify + pitch deck

**Manual changes:** Renamed duplicate `0006_admin_audit.sql` → `0009_admin_audit.sql` to fix on-disk collision. Fixed Sentry v9 API. Build PASS 19 routes.

**Blockers:** None. Project on ahead-of-schedule (6 days buffer to Bán kết 16/5).

**Tomorrow:** Manual setup gates (Vercel deploy, OPENAI_API_KEY, Auth provider config). Live testing.

---

## 2026-05-11 (T2) — Day 2

**What:** [To be filled by team]

---

## 2026-05-12 (T3) — Day 3

**What:** [To be filled by team]

---

## 2026-05-13 (T4) — Day 4

**What:** [To be filled by team]

---

## 2026-05-14 (T5) — Day 5

**What:** [To be filled by team]

---

## 2026-05-15 (T6) — Day 6

**What:** [To be filled by team]

---

## 2026-05-16 (T7) — Sprint 1 Checkpoint (Bán kết)

**What:** [Final polish + submission 14:00 UTC+7 to BTC]

---

## SPRINT 2 (2026-05-17 to 2026-05-30)

### 2026-05-17 (T2) — Day 8

**What:** [To be filled by team]

---

### 2026-05-18 (T3) — Day 9

**What:** [To be filled by team]

---

### 2026-05-19 (T4) — Day 10

**What:** [To be filled by team]

---

### 2026-05-20 (T5) — Day 11

**What:** [To be filled by team]

---

### 2026-05-21 (T6) — Day 12

**What:** [To be filled by team]

---

### 2026-05-22 (T7) — Day 13

**What:** [To be filled by team]

---

### 2026-05-23 (T2) — Day 14

**What:** [To be filled by team]

---

### 2026-05-24 (T3) — Day 15

**What:** [To be filled by team]

---

### 2026-05-25 (T4) — Day 16

**What:** [To be filled by team]

---

### 2026-05-26 (T5) — Day 17

**What:** [To be filled by team]

---

### 2026-05-27 (T6) — Day 18

**What:** [To be filled by team]

---

### 2026-05-28 (T7) — Day 19

**What:** [To be filled by team]

---

### 2026-05-29 (T2) — Day 20

**What:** [To be filled by team]

---

### 2026-05-30 (T3) — Sprint 2 Checkpoint (Chung kết)

**What:** [Final demo + submission to BTC]

---

**Log format:**
```
## YYYY-MM-DD (Ddd) — Day N: [Title]

**What:** [1-3 sentences: features shipped, migrations run, infrastructure changes]

**AI prompts used:**
1. [Tool]: "[Prompt]" → [brief result]

**Manual changes:** [Code you wrote yourself or significantly modified from AI output]

**Blockers:** [Risks, external dependencies, unresolved issues]

**Next:** [What the next dev session focuses on]
```
