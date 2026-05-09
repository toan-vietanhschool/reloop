# Sentry Setup — ReLoop

End-to-end guide to wiring Sentry error tracking, session replay, and source
map upload to the ReLoop deployment. Linear: TRU-87.

The repo is pre-wired with `@sentry/nextjs`. You only need to:

1. Create a Sentry project.
2. Drop the DSN + auth token into Vercel env.
3. Replace the placeholder org/project slugs in `next.config.ts`.
4. Trigger a synthetic error and confirm it lands in the dashboard.

## 1. Create the Sentry project

1. Sign up / sign in at <https://sentry.io>.
2. Create a new project:
   - **Platform**: `Next.js`
   - **Project slug**: `reloop-mvp`
   - **Team / org slug**: `reloop-tdtu` (any slug works — just record it)
   - **Alert frequency**: default is fine for MVP
3. After creation, copy the **DSN** shown on the "Get started" screen. It
   looks like `https://<key>@o<orgid>.ingest.sentry.io/<projectid>`.

The free tier is plenty for the MVP demo:

- 5 000 errors / month
- 50 000 replays / month
- 100 000 transactions / month

## 2. Generate an auth token for source map upload

Source maps are required so stack traces from minified Vercel bundles map
back to readable TypeScript lines.

1. In Sentry, go to **User Settings → Auth Tokens** → **Create New Token**.
2. Scopes required:
   - `project:releases`
   - `org:read`
3. Copy the token. You will not see it again.

## 3. Configure environment variables

### Vercel project (Production, Preview, Development)

Add the following in **Project Settings → Environment Variables**:

| Key                       | Value                              | Scope                     |
| ------------------------- | ---------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`  | The DSN from step 1                | Production, Preview       |
| `SENTRY_DSN`              | Same DSN                           | Production, Preview       |
| `SENTRY_AUTH_TOKEN`       | Token from step 2                  | Production, Preview, Dev  |

`VERCEL_ENV` and `VERCEL_GIT_COMMIT_SHA` are injected by Vercel automatically
and used by the Sentry init code for environment + release tagging.

### Local `.env.local`

For local source map upload tests only:

```text
NEXT_PUBLIC_SENTRY_DSN=<dsn>
SENTRY_DSN=<dsn>
SENTRY_AUTH_TOKEN=<token>
```

If you leave Sentry env vars blank locally, the SDK is a no-op — that is the
default for `pnpm dev`.

## 4. Replace placeholder slugs

Open `next.config.ts` and update:

```ts
export default withSentryConfig(nextConfig, {
  org: "reloop-tdtu",        // <- replace with your real Sentry org slug
  project: "reloop-mvp",     // <- replace with your real project slug
  ...
})
```

If these do not match a real Sentry org/project, the build still works but
source map upload is skipped.

## 5. Trigger a synthetic error

The repo includes a hidden admin-only diagnostic page.

1. Sign in as an admin user (set `profiles.role = 'admin'` in Supabase).
2. Visit `/__sentry-test`.
3. Click **Throw client error (sync)** — within ~30 seconds the error should
   appear in the Sentry **Issues** tab with a readable stack trace.
4. Click **Throw unhandled promise rejection** — same, separate issue.

If the page returns 404, the gate is working; you are not signed in as an
admin. If errors do not show up, double-check the DSN env var and the
browser's Network tab for `*.ingest.sentry.io` requests.

## 6. Verify source maps

In the Sentry issue detail view, confirm the **stack trace** shows TypeScript
file paths like `app/(app)/__sentry-test/SentryTestClient.tsx:34:5`, not
minified frame names like `chunk-XYZ.js:1:23456`. If you see minified frames:

- Confirm `SENTRY_AUTH_TOKEN` is set in the Vercel env.
- Confirm the org/project slugs in `next.config.ts` match Sentry exactly.
- Re-deploy. Source maps upload during build, not at runtime.

## 7. Verify Web Vitals

Browse a few app pages while signed in. In Sentry **Performance → Metrics**
you should see distributions for:

- `web-vitals.lcp`
- `web-vitals.inp`
- `web-vitals.cls`
- `web-vitals.fcp`
- `web-vitals.ttfb`

These are sent from `components/shared/WebVitalsReporter.tsx` via
`useReportWebVitals` from `next/web-vitals`.

## 8. Release tagging

Each Vercel deploy is tagged with the first 7 characters of the Git commit
SHA via `VERCEL_GIT_COMMIT_SHA`. In Sentry **Releases** you can compare error
rates across releases to catch regressions.

## 9. Hardening before public demo

The `/__sentry-test` page is gated by `profiles.role === 'admin'` and
returns 404 to everyone else. Before the public demo, choose one of:

- Leave the page in place (it is unreachable for non-admins).
- Delete `app/(app)/__sentry-test/` entirely.

## 10. PII guarantees

Both the client and server inits scrub `event.user.email` and
`event.user.ip_address` in `beforeSend`. The server init also drops events
whose error message matches expected operational conditions (`rate_limited`,
`unauthorized`, `forbidden`) so the dashboard stays signal-rich.

If you ever call `Sentry.setUser({ id, email })` manually, the email field
will still be stripped before transport.
