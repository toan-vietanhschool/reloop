/**
 * Sentry edge runtime init.
 *
 * Used by Edge route handlers and the Next.js middleware. The edge runtime
 * has a smaller API surface (no Node http) so we keep this lean.
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

    beforeSend(event, hint) {
      const filtered = dropExpectedErrors(event, hint)
      if (filtered === null) return null
      return scrubUserPII(filtered)
    },
  })
}
