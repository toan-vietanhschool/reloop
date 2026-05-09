# Cloudflare Workers deployment

## Status

**Deployed but BLOCKED at runtime.** The Worker uploads cleanly but every
dynamic route returns HTTP 500 because of a known, currently-unfixed bug
in `@opennextjs/cloudflare@1.19.8` against `next@16.2.6`.

- Worker URL: `https://reloop.vibecode-academy.workers.dev`
- Build: passes (`pnpm exec opennextjs-cloudflare build`)
- Deploy: succeeds (asset upload + worker upload OK)
- Runtime: every dynamic route logs
  `TypeError: components.ComponentMod.handler is not a function`

Tracking issue:
[opennextjs/opennextjs-cloudflare#1258](https://github.com/opennextjs/opennextjs-cloudflare/issues/1258)

The vendor-suggested workaround is to **pin Next.js to `15.5.16`** until
OpenNext lands a fix. That is a project-wide downgrade decision and is
intentionally out of scope for this commit.

## What was wired up

### Files added

- `open-next.config.ts` — minimal `defineCloudflareConfig()` config
- `wrangler.jsonc` — Worker name `reloop`, assets binding, public vars
- `next.config.ts` — added `initOpenNextCloudflareForDev()` at the top
- `package.json` — added scripts (`preview`, `deploy:cf`, `cf-typegen`)
  and dev deps (`@opennextjs/cloudflare`, `wrangler@^4`)

### Files renamed

- `proxy.ts` → `middleware.ts` (Next.js 16 proxy is Node-only,
  not supported by OpenNext on Cloudflare Workers; the legacy
  `middleware.ts` convention runs on the Edge runtime which OpenNext
  supports). Function renamed `proxy` → `middleware`.

### Worker secrets set (4)

Set via `wrangler secret put`:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_MONTHLY_USD` (`10`)
- `CRON_SECRET` (32-char random — also add to GitHub Secrets for CI cron)
- `POSTHOG_WEBHOOK_SECRET` (32-char random)

### Worker secrets NOT set (placeholders / empty in `.env.local`)

Set these once you have real values via `wrangler secret put <KEY>`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

### Public env vars (committed in `wrangler.jsonc`)

- `NEXT_PUBLIC_SUPABASE_URL=https://vzpwsdmlofsizhkwcpra.supabase.co`
- `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`

## Local commands

```bash
pnpm preview     # build for CF + run wrangler dev locally
pnpm deploy:cf   # build for CF + deploy to *.workers.dev
pnpm cf-typegen  # regenerate cloudflare-env.d.ts from wrangler.jsonc
```

## Windows build notes

OpenNext on Windows hits a symlink permission error
(`EPERM: operation not permitted, symlink`) when copying pnpm-traced
files. Two workarounds were applied locally:

1. Switched the project to `npm install` (flat `node_modules`) instead
   of pnpm — bypasses the `.pnpm` symlink graph entirely.
2. Patched `node_modules/@opennextjs/aws/dist/build/copyTracedFiles.js`
   to fall back to `cpSync(..., { dereference: true })` on EPERM.

The cleanest long-term fix is to do CF builds from WSL or Linux CI
(GitHub Actions `ubuntu-latest`).

## Post-fix steps once route 500s are resolved

When `@opennextjs/cloudflare` ships a fix (or you choose to pin
Next.js 15.5.16):

1. Re-run `pnpm deploy:cf` from a clean checkout.
2. Update Supabase Auth allowed-redirect URLs in the dashboard:
   - `https://reloop.vibecode-academy.workers.dev/auth/callback`
3. (Optional) Map a custom domain in the Cloudflare Workers dashboard.
4. Test: `/`, `/auth/login`, `/dashboard`, `/leaderboard`, `/api/cron/leaderboard`
   (with `Authorization: Bearer $CRON_SECRET`).
