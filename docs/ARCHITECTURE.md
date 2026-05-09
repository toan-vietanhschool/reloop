# ReLoop Architecture

ReLoop is an AI-first marketplace for recycling with dual flows (C2C + B2C), crowdsourced mapping, and gamification. See the full playbook (Phần 3) for strategy details.

## System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  CLIENT (Browser / Mobile web)                               │
│  Next.js 15 App Router + RSC + Tailwind + shadcn/ui          │
│  - Server Components (fetch list, profile, leaderboard)      │
│  - Client Components (Map, Camera, Chat, Realtime)           │
└─────────────┬──────────────────────────────────┬─────────────┘
              │ HTTPS / Server Actions           │ WebSocket
              ▼                                  ▼
┌──────────────────────────────────────────────────────────────┐
│  VERCEL EDGE / NODE RUNTIME (Next.js server)                 │
│  - Server Actions ('use server') with Zod validation         │
│  - Route Handlers /api/ai/* /api/upload /api/cron            │
│  - Middleware: auth check + rate limit                       │
└──┬────────────────────┬─────────────────┬────────────────────┘
   │                    │                 │
   ▼                    ▼                 ▼
┌────────────┐    ┌────────────┐    ┌─────────────────┐
│ SUPABASE   │    │ OPENAI API │    │ POSTHOG / SENTRY│
│ - Postgres │    │ -GPT-4o    │    │ - analytics     │
│ - Auth     │    │  Vision    │    │ - error log     │
│ - Storage  │    │ -GPT-4o-   │    │                 │
│ - Realtime │    │  mini      │    │                 │
│ - RLS      │    │            │    │                 │
└────────────┘    └────────────┘    └─────────────────┘
        ▲
        │ tile requests (no key)
┌─────────────────────┐
│ OpenStreetMap tiles │
└─────────────────────┘
```

## Folder Structure

See [REPO-BLUEPRINT.md](./REPO-BLUEPRINT.md) for full directory layout.

**Key areas:**
- `app/(marketing)/` — Public pages (landing, about, leaderboard) with ISR caching
- `app/(app)/` — Authenticated user flows (scan, listings, map, chat, profile)
- `app/(admin)/` — Admin-only pages (moderation, points override)
- `app/api/` — Server handlers (AI, webhooks, cron jobs)
- `components/` — Reusable UI (shadcn/ui + custom)
- `lib/` — Utilities, database queries, validators (Zod)
- `supabase/` — Migrations, RLS policies, seed data

## Authentication Flow

1. User visits landing page (public)
2. Click "Sign In" → OAuth (Google) or Email magic link (Supabase Auth)
3. After auth, proxy (Next 16; formerly middleware) redirects to `/app/dashboard`
4. JWT token stored in secure HttpOnly cookie (Supabase managed)
5. Server Actions include auth context via `createServerClient()`
6. RLS policies enforce row-level access (see below)

Details: [Playbook Phần 3.4](./playbook-link)

## Caching Strategy

- **ISR (Incremental Static Regeneration)**: Landing, about, public leaderboard revalidate every 3600s
- **AI responses**: Cached 24h in Supabase via `ai_response_cache` table (key: hash of image + model)
- **Map tiles**: Browser cache via OSM tile server (no API key needed)
- **Session**: Supabase manages JWT refresh; valid 1 hour

Details: [Playbook Phần 3.6](./playbook-link)

## Key Architecture Decisions

1. **Skip Stitch MCP** — Not publicly available; use v0.dev + Cursor for component scaffolding instead. See [docs/ui-tooling.md](./ui-tooling.md)

2. **Skip Community features (Sprint 2)** — Chat, exchange, notifications deferred per team choice. See plan PHẦN F.2.

3. **Use Leaflet + OpenStreetMap** — Not Google Maps. Free, privacy-respecting tiles; crowdsource-friendly schema. See [Playbook Phần 9 #3](./playbook-link)

4. **RLS default-deny on all tables** — All 14 Postgres tables have row-level security policies. Unauthenticated users see zero data. See [docs/SQL-AUDIT.md](./SQL-AUDIT.md)

5. **No custom auth JWT signing** — Supabase Auth handles token lifecycle; we validate server-side via `getSession()`

---

**Related docs:**
- [REPO-BLUEPRINT.md](./REPO-BLUEPRINT.md) — Folder structure
- [DEVLOG.md](./DEVLOG.md) — Daily progress
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Git + code review workflow
- [TEST-INFRA.md](./TEST-INFRA.md) — Unit / E2E testing setup
