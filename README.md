# ReLoop — Shazam cho rác

![CI](https://github.com/toan-vietanhschool/reloop/actions/workflows/ci.yml/badge.svg)

> *Chụp một ảnh, biết ngay đồ này tái chế được không, đi đâu, hoặc ai đang cần.*

**ReLoop** là nền tảng AI-first kết nối người muốn tái chế với cộng đồng và các điểm thu gom xác thực. Trong vòng 3 giây, bạn biết loại vật liệu, tác động sinh thái, ý tưởng DIY, và nơi vứt đúng chỗ. Hai luồng đồng thời: cho-tặng-trao đổi đồ còn dùng (C2C) + bán phế liệu (B2C) + map điểm thu gom crowdsourced.

## Differentiators

1. **AI-first scan-to-action**: GPT-4o Vision phân loại vật liệu, thời gian phân hủy, Eco Impact Score, DIY ideas, nơi vứt/bán — từ 1 ảnh chụp
2. **Hai luồng C2C + B2C**: Đồ còn dùng được → cho/đổi; đồ hỏng → bán/vứt đúng chỗ
3. **Map crowdsourced + verified**: User pin điểm, cộng đồng upvote, admin xác thực
4. **Gamification Gen Z**: Eco Score share Facebook/Instagram, leaderboard trường — hook viral tự nhiên

## Tech Stack

- **Frontend**: Next.js 15, App Router, React Server Components, Tailwind CSS, shadcn/ui, Leaflet
- **Backend**: Supabase (Auth, Postgres, Realtime, Storage, RLS), OpenAI GPT-4o + GPT-4o-mini
- **Analytics**: PostHog (custom events, feature flags), Sentry (error tracking)
- **Deployment**: Vercel (preview + production), GitHub Actions (CI/CD)

## Quick Start

```bash
# Clone
git clone https://github.com/truongvietanh/reloop.git
cd reloop

# Install
pnpm install

# Setup environment
cp .env.example .env.local
# Fill: SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY, POSTHOG_KEY, SENTRY_DSN

# Database migrations
pnpm supabase db push

# Dev server
pnpm dev
# → http://localhost:3000
```

## Project Status

**Sprint 1 (Bán kết 16/5)** — 7 ngày từ 9/5 — **DONE** (shipped 2026-05-09)

| Ticket | Title                                              | Status |
| ------ | -------------------------------------------------- | ------ |
| T1-01  | Repo bootstrap + Next.js 16 scaffold               | ✅      |
| T1-02  | Supabase schema + RLS hardening                    | ✅      |
| T1-03  | Auth (email + Google) + proxy middleware           | ✅      |
| T1-04  | AI Vision Scan (GPT-4o-mini) + SHA256 cache        | ✅      |
| T1-05  | Listings CRUD + photo upload + moderation hook     | ✅      |
| T1-06  | Map (OSM + Leaflet) + 25 seeded points + crowdsource | ✅    |
| T1-07  | Profile + Eco Points badge + activity feed         | ✅      |
| T1-08  | Eco-points RPC engine + level-up rewards           | ✅      |
| T1-09  | Error boundaries + toasts + a11y polish            | ✅      |
| T1-10  | Landing page (Vietnamese, eco-luxury) + demo data  | ✅      |

**Status:** 10/10 issues shipped — See `docs/sprints/SPRINT-1-COMPLETE.md`  
**Checkpoint:** 2026-05-09 (target 16/5 14:00 UTC+7 for Bán kết submission)

**Sprint 2 (Chung kết 30/5)** — **DONE** (shipped 2026-05-10 in 1 day, 4-wave parallel)

| Ticket | Title                                              | Status |
| ------ | -------------------------------------------------- | ------ |
| T2-01  | Pin point + community verify (5-vote threshold)    | ✅      |
| T2-02  | Leaderboard top 20 + school filter + daily cron    | ✅      |
| T2-03  | Badges system (5 unlocks + confetti + modal)       | ✅      |
| T2-04  | Admin moderation 3 tabs (listings/pins/users) + ban | ✅      |
| T2-05  | GitHub Actions CI (5 jobs: lint/typecheck/test/build/e2e) | ✅      |
| T2-06  | Sentry integration (client/server/edge + monitoring) | ✅      |
| T2-07  | PostHog analytics (11 events + 3 dashboards)       | ✅      |
| T2-08  | Share Eco Score (1080×1080 OG cards + html-to-image) | ✅      |
| T2-09  | Performance audit (ISR 5m, bundle analysis, prerender 12 pages) | ✅      |
| T2-10  | Pitch deck Chung kết + Q&A prep (7 questions) + Plan B/C/D | ✅      |

**Status:** 20/20 issues shipped — See `docs/sprints/SPRINT-2-COMPLETE.md`  
**Checkpoint:** 2026-05-10 (target 30/5 14:00 UTC+7 for Chung kết submission)

**Demo URL (pending Vercel deploy):** <https://reloop-mvp.vercel.app/> — See `docs/operations/DEPLOYMENT.md` + manual user steps in Sprint 2 report

## Documentation

- **CHANGELOG.md** — Full release history (v0.1.0-bootstrap → v1.0.0-sprint-2) with commit mapping
- **Sprint 1 Report** — `docs/sprints/SPRINT-1-COMPLETE.md` — 10/10 issues, RLS hardening, 92/100 rubric estimate
- **Sprint 2 Report** — `docs/sprints/SPRINT-2-COMPLETE.md` — 10/10 issues, CI/CD + observability, 94/100 rubric estimate
- **Sprint 3 Backlog** — `docs/sprints/SPRINT-3-BACKLOG.md` — 22 backlog items (tech debt, security, production readiness) with effort + priority
- **Code Review** — Deferred items + tech debt from Sprint 2 security audit
- **SQL Audit** — `docs/audits/SQL-AUDIT.md` — RLS coverage (14/14 tables), 7 findings fixed
- **RLS Test Plan** — `docs/testing/RLS-TEST-PLAN.md` — 8 test cases for profile role, exchange, notification policies
- **Deployment** — `docs/operations/DEPLOYMENT.md` — Vercel (primary), Cloudflare Workers (known 500 error, workaround: pin Next 15.5.x)

## Resources

- **Linear board**: [ReLoop MVP — TDTU Vibe Coding 2026](https://linear.app/truongvietanh/project/reloop-mvp-tdtu-vibe-coding-2026-cca1b358d64d)
- **GitHub repo**: https://github.com/toan-vietanhschool/reloop
- **Supabase project**: https://supabase.com/dashboard/project/vzpwsdmlofsizhkwcpra (db schema + migrations)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit format, PR template, and code review process.

## License

All rights reserved — TDTU Vibe Coding 2026 entry. See [LICENSE](./LICENSE) for details.

---

**Built for TDTU Vibe Coding 2026 (Bảng B).**  
Target: Giải Nhất (5M VND) + Giải Poster Bình chọn (1M VND) | Minimum Top 6 Chung kết.
