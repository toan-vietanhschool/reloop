# ReLoop — Vercel Deployment Guide

**Status:** Wave 5 A5-1 attempted automated deploy on 2026-05-09. Vercel MCP server (`mcp__45610fd3-0ea1-4749-88ff-a32d528587c3__*`) does **not** support direct deployment — its `deploy_to_vercel` tool only returns CLI instructions, and `list_teams` returned an empty array (no Vercel auth context for this account via MCP).

**Result:** `deploy_status: SKIPPED — manual`. User must run the steps below.

---

## Prerequisites

- Repo: `https://github.com/toan-vietanhschool/reloop` (public, `main` branch)
- Local repo path: `D:\reloop\`
- Supabase project: `vzpwsdmlofsizhkwcpra` (region `ap-southeast-1`), keys in `D:\reloop\.env.local`
- Vercel account (free Hobby tier OK for TDTU Vibe Coding 2026)

---

## Option A — Vercel Dashboard (recommended, fastest)

1. Go to https://vercel.com/new
2. Click **Import Git Repository** → select `toan-vietanhschool/reloop`
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `./` (default)
5. Build command: `pnpm build` (auto-detected from `pnpm-lock.yaml`)
6. Output directory: `.next` (default)
7. Install command: `pnpm install`
8. **Environment Variables** — add these for `Production`, `Preview`, and `Development`:

   | Key | Value | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://vzpwsdmlofsizhkwcpra.supabase.co` | from `.env.local` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xROFEPGnyRf7geb3PUi5xQ_-4Ln-Vy0` | from `.env.local` |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(paste from Supabase dashboard → Settings → API)* | server-only, do NOT prefix `NEXT_PUBLIC_` |
   | `OPENAI_API_KEY` | *(paste user's OpenAI key)* | server-only |
   | `OPENAI_MONTHLY_USD` | `10` | budget cap |

9. Click **Deploy**.

---

## Option B — Vercel CLI (from local machine)

```powershell
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login
vercel login

# 3. From repo root, link the project
cd D:\reloop
vercel link --yes

# 4. Add env vars (will prompt for value each)
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
vercel env add SUPABASE_SERVICE_ROLE_KEY production preview
vercel env add OPENAI_API_KEY production preview
vercel env add OPENAI_MONTHLY_USD production preview

# 5. Deploy to production
vercel --prod
```

---

## Post-Deploy Checklist

Once you have the production URL (e.g. `https://reloop-xxx.vercel.app`):

1. **Supabase Auth Callback URL** — go to https://supabase.com/dashboard/project/vzpwsdmlofsizhkwcpra/auth/url-configuration and add:
   - Site URL: `https://reloop-xxx.vercel.app`
   - Redirect URLs: `https://reloop-xxx.vercel.app/auth/callback`, `https://reloop-xxx.vercel.app/**`

2. **Verify deploy** — open the URL in a browser. Expect Next.js landing/auth page.

3. **Smoke test** — sign up a test account, verify email flow works.

4. **Update repo secrets** — for GitHub Actions (if any), mirror the same env vars in repo settings → Secrets.

5. **Optional services (Sprint 2)** — when adding PostHog / Sentry, add:
   - `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
   - `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`

---

## Linking the Vercel project to MCP later

Once the project exists on Vercel, the MCP `list_teams` and `list_projects` tools should return it. To link:
- A `.vercel/project.json` file is auto-created by `vercel link` containing `orgId` and `projectId` — these unlock the MCP for future automated operations (logs, redeploys, env management).

---

**T1-01 (TRU-71) deploy step:** ⚠ Requires manual user action — see Option A or B above.
