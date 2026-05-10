/**
 * Shared Sentry helpers used by the client / server / edge configs.
 *
 * The Sentry configs at the repo root each call `Sentry.init()` once
 * with environment-specific options, but they all share the same PII
 * scrub + expected-error drop logic. Centralizing here keeps the three
 * configs from drifting apart.
 */
import type { ErrorEvent, EventHint } from "@sentry/nextjs"

/**
 * Allowlist user fields. Anything not in this list is stripped before
 * the event leaves the runtime — including future custom fields that
 * a `Sentry.setUser()` call might add in error.
 *
 * Currently the only field we forward is `id` so we can correlate
 * errors per user without leaking email, IP, segment, or username.
 */
export function scrubUserPII(event: ErrorEvent): ErrorEvent {
  if (event.user) {
    event.user = {
      id: event.user.id,
      // Intentionally omit: email, ip_address, username, segment,
      // and any other custom user fields. Allowlist is safer than
      // a denylist because new PII fields default to dropped.
    }
  }
  return event
}

/**
 * Treat a small set of expected, non-actionable error messages as
 * silent — these are user-level conditions (rate limits, auth
 * failures), not bugs we want to triage in Sentry.
 *
 * Returns `null` when the event should be dropped, or the (unmodified)
 * event when it should pass through.
 */
export function dropExpectedErrors(
  event: ErrorEvent,
  hint: EventHint,
): ErrorEvent | null {
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
  return event
}
