/**
 * Sentry server-side init (Node.js runtime).
 *
 * Used by Server Components, Route Handlers, Server Actions, and middleware
 * running on Node (not edge). Drops expected operational errors so the dashboard
 * stays signal-rich.
 */
import * as Sentry from "@sentry/nextjs"

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
     * Drop expected, non-actionable errors before they leave the server.
     * Rate limits and unauthorized access are user-level conditions, not bugs.
     */
    beforeSend(event, hint) {
      const error = hint.originalException
      if (error && typeof error === "object" && "message" in error) {
        const msg = String((error as Error).message).toLowerCase()
        if (
          msg.includes("rate_limited") ||
          msg.includes("rate limit") ||
          msg.includes("unauthorized") ||
          msg.includes("forbidden")
        ) {
          return null
        }
      }
      if (event.user) {
        delete event.user.email
        delete event.user.ip_address
      }
      return event
    },
  })
}
