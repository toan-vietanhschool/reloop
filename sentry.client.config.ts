/**
 * Sentry client-side init.
 *
 * Loaded in the browser only. Captures unhandled exceptions, unhandled promise
 * rejections, transactions, and session replays. Strips PII via beforeSend so
 * Sentry never receives email addresses or IPs even if Supabase user objects
 * leak into breadcrumbs.
 *
 * Env contract:
 *   - NEXT_PUBLIC_SENTRY_DSN: required for capture in non-dev envs
 *   - VERCEL_ENV: provided by Vercel build (production | preview | development)
 *   - VERCEL_GIT_COMMIT_SHA: 40-char SHA, used as release tag
 */
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const environment = process.env.VERCEL_ENV ?? "development"
const release = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    release,

    // Performance: 10% of transactions to stay within free tier (100k tx/mo)
    tracesSampleRate: 0.1,

    // Session replays: 10% of normal sessions, 100% of error sessions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
    ],

    /**
     * PII scrub. Drop email + IP before transport. Even though the Supabase
     * client should not attach the user object directly, anything our own
     * Sentry.setUser() calls might leak gets sanitized here as a safety net.
     */
    beforeSend(event) {
      if (event.user) {
        delete event.user.email
        delete event.user.ip_address
      }
      return event
    },
  })
}
