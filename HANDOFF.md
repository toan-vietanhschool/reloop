# ReLoop — Hand-off Battle Plan

> **One-page entry point for the team.** Use this on demo day. All other docs link from here.

**Status (2026-05-10):** Sprint 1+2 ✅ shipped (20/20). CI 5/5 GREEN. T-6 days to Bán kết 16/5.

---

## 1 · URLs cần biết

| What | URL | Notes |
|---|---|---|
| **Linear board** | https://linear.app/truongvietanh/project/reloop-mvp-tdtu-vibe-coding-2026-cca1b358d64d | 20 issues TRU-71→90 |
| **GitHub repo** | https://github.com/toan-vietanhschool/reloop | Public, main branch |
| **CI badge** | https://github.com/toan-vietanhschool/reloop/actions/workflows/ci.yml | 5 jobs parallel |
| **Supabase project** | https://supabase.com/dashboard/project/vzpwsdmlofsizhkwcpra | 14 tables, 8 migrations, 165 demo rows |
| **Cloudflare Worker** | https://reloop.vibecode-academy.workers.dev | ⚠️ Deployed nhưng SSR 500 — upstream bug |
| **Vercel** | _Pending — user import GitHub repo qua dashboard_ | Recommended production target |
| **PostHog** | _User tạo project + paste DSN vào Vercel env_ | Guide: [POSTHOG-DASHBOARD.md](docs/POSTHOG-DASHBOARD.md) |
| **Sentry** | _User tạo project + paste DSN vào Vercel env_ | Guide: [SENTRY-SETUP.md](docs/SENTRY-SETUP.md) |

---

## 2 · Pre-demo manual steps (P0 trước Bán kết 16/5)

| # | Việc | Hướng dẫn | Effort |
|---|---|---|---|
| 1 | **Vercel deploy** GitHub repo | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) Option A (dashboard) | 10 phút |
| 2 | **Add 7 env vars** vào Vercel: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `CRON_SECRET`, `POSTHOG_WEBHOOK_SECRET`, `SENTRY_*` | Vercel dashboard → Project Settings → Environment Variables | 5 phút |
| 3 | **Supabase Auth → URL Configuration**: thêm callback URL `https://<vercel-url>/auth/callback` | Supabase dashboard → Authentication → URL Configuration | 2 phút |
| 4 | **Supabase Auth → Providers → Google**: enable + paste OAuth client ID/secret | Cần Google Cloud Console OAuth client (HS team có thể đã có) | 5 phút |
| 5 | **Supabase Storage**: tạo 2 buckets `listings` + `scans` (public, 2MB) | Hoặc đợi server actions auto-create lần đầu user upload | 1 phút |
| 6 | **2-user RLS test** thật trên prod | [docs/RLS-TEST-PLAN.md](docs/RLS-TEST-PLAN.md) — 12 scenarios curl | 15 phút |
| 7 | **DB backup snapshot** pre-final | Supabase dashboard → Settings → Database → Backups → Create | 2 phút |

**Tổng manual: ~40 phút.** Sau đó production URL chạy stable, AI Vision Scan với GPT-4o-mini thật.

---

## 3 · Demo day Bán kết 16/5 — file battle pack

Print/save offline trước demo:

| File | Use | Print? |
|---|---|---|
| [public/pitch-deck-banket-script.md](public/pitch-deck-banket-script.md) | Speaker script Vietnamese ~182s | Yes (A5) |
| [docs/DEMO-SCRIPT-BANKET.md](docs/DEMO-SCRIPT-BANKET.md) | Second-by-second với Plan B/C/D/E | Yes (A5) |
| [docs/QA-PREP.md](docs/QA-PREP.md) | 13 BGK Q&A cards với đáp án Vietnamese | Yes (cards) |
| [docs/T-1H-CHECKLIST.md](docs/T-1H-CHECKLIST.md) | Pre-demo 1h checklist | Yes |
| [docs/DEMO-CREDENTIALS.md](docs/DEMO-CREDENTIALS.md) | Demo accounts (gitignored) | Sticker laptop |
| [public/poster-a1.md](public/poster-a1.md) | Poster A1 brief cho Figma | — |

**Props mang theo:** chai nhựa thật + lon nhôm + báo cũ (3 vật liệu khác nhau để demo scan đa dạng).

---

## 4 · Sprint 3 backlog (post-Bán kết)

[docs/SPRINT-3-BACKLOG.md](docs/SPRINT-3-BACKLOG.md) — 22 items prioritized:

- **6 P0** trước Chung kết 30/5 (Vercel deploy verify, RLS test live, banned-user enforcement test, DB backup, Sentry alerts, OpenAI quota monitor)
- **8 P1** nice-to-have (Lighthouse CI, E2E auth fixture, real PostHog dashboard, custom domain, etc.)
- **Cloudflare 500 fix**: chờ upstream `@opennextjs/cloudflare#1258` HOẶC pin Next 15.5.x. Vercel là backup an toàn.

---

## 5 · Known issues

| Issue | Severity | Workaround | Tracked |
|---|---|---|---|
| Cloudflare Worker SSR 500 (`ComponentMod.handler is not a function`) | HIGH | Use Vercel for production | [CLOUDFLARE-DEPLOY.md](docs/CLOUDFLARE-DEPLOY.md), upstream #1258 |
| Admin tables horizontal scroll on 375px | MEDIUM | Refactor to mobile card layout | Sprint 3 M1-M3 |
| 4 E2E auth tests skipped (need storageState fixture) | MEDIUM | Manual auth testing on prod | Sprint 3 D6 |
| `as never` Supabase casts (~20 occurrences) | LOW | Cleanup with typed helpers | Sprint 3 A1 |
| Local Cloudflare build needs Windows EPERM patch | LOW | WSL or skip local CF preview | Documented in CLOUDFLARE-DEPLOY.md |

---

## 6 · Architecture quick-ref

- **Stack**: Next.js 16.2.6 + React 19.2.4 + Tailwind v4 + shadcn/ui + Supabase (Postgres + Auth + Storage + Realtime + RLS) + OpenAI GPT-4o-mini + Leaflet + OSM + PostHog + Sentry + Vercel Cron
- **DB**: 14 tables, all RLS-enabled, 8 migrations applied
- **Routes**: 19 (3 static + 16 dynamic), `proxy.ts` Next 16 Edge handles auth + banned-user check
- **Eco Points**: atomic RPC `increment_points` + event sourcing via `eco_actions`
- **AI cache**: image hash sha256 dedup → 0 cost on rescans + ~$0.0005/scan first time
- **Rubric coverage**: ~92/100 Bán kết, ~94/100 Chung kết

Full diagram: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 7 · Resume next session

```
@HANDOFF.md
Đã làm xong gì? Cần làm gì tiếp?
```

→ Claude reads this file + recent commits + Linear board → resumes.

Most recent commit: `dab7ac5` (a11y audit + 5 wins inline). 13 commits total since bootstrap.

---

**Chiến thắng không phải là sản phẩm hoàn hảo nhất — mà là sản phẩm chạy được, kể được câu chuyện rõ ràng, gánh đủ rubric, và có cảm xúc.** 🌱
