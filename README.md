# ReLoop — Shazam cho rác

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

**Sprint 1 (Bán kết 16/5)** — 7 days from 9/5  
Scope: Landing page, Auth (email + Google), Scan (AI Vision), Listings (CRUD + images), Map (OSM + crowdsource), Eco Points + Leaderboard, basic moderation.  
Checkpoint: 16/5 14:00 UTC+7 (submit to BTC)

**Sprint 2 (Chung kết 30/5)** — 14 days from 17/5  
Scope: Chat 1-1 (Realtime), advanced moderation, Admin panel, analytics, performance tuning, production hardening.

## Resources

- **Linear board**: [ReLoop MVP — TDTU Vibe Coding 2026](https://linear.app/truongvietanh/project/reloop-mvp-tdtu-vibe-coding-2026-cca1b358d64d)
- **Playbook** (strategy + rubric): [Notion link to playbook]
- **Production URL**: [vercel.app link — deployed 2026-05-10]

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit format, PR template, and code review process.

## License

All rights reserved — TDTU Vibe Coding 2026 entry. See [LICENSE](./LICENSE) for details.

---

**Built for TDTU Vibe Coding 2026 (Bảng B).**  
Target: Giải Nhất (5M VND) + Giải Poster Bình chọn (1M VND) | Minimum Top 6 Chung kết.
