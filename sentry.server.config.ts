/**
 * Sentry server-side init (Node.js runtime).
 *
 * Used by Server Components, Route Handlers, Server Actions, and middleware
 * running on Node (not edge). Drops expected operational errors so the dashboard
 * stays signal-rich.
 */
import * as Sentry from "@sentry/nextjs"

import { dropExpectedErrors, scrubUserPII } from "@/lib/sentry-helpers"

const dsn = process.env.SENTRY_DSN
const environment = process.env.VERCEL_ENV ?? "development"
const release = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate: 0.1,

    /**
     * Drop expected, non-actionable errors (rate limits, auth
     * failures) before they leave the server, then enforce an
     * allowlist on user fields so PII never reaches the dashboard.
     */
    beforeSend(event, hint) {
      const filtered = dropExpectedErrors(event, hint)
      if (filtered === null) return null
      return scrubUserPII(filtered)
    },
  })
}
