/**
 * PostHog analytics wrapper — browser only.
 *
 * Why a wrapper:
 *   - Client init must run only once (HMR-safe).
 *   - Calls are no-ops when `NEXT_PUBLIC_POSTHOG_KEY` is unset (local dev).
 *
 * For server-side captures and Postgres mirroring use analytics-server.ts.
 */

import posthogBrowser from "posthog-js"

// ----------------- Browser -----------------

let browserInitialized = false

export function initPostHog(): void {
  if (typeof window === "undefined") return
  if (browserInitialized) return

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"

  posthogBrowser.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false, // PageviewTracker controls this manually
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: false,
    loaded: () => {
      browserInitialized = true
    },
  })
}

export function isInitialized(): boolean {
  return browserInitialized
}

export function track(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return
  if (!browserInitialized) return
  try {
    posthogBrowser.capture(event, properties)
  } catch {
    // Never let analytics failures cascade into UI bugs.
  }
}

export function identify(
  userId: string,
  traits?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return
  if (!browserInitialized) return
  try {
    posthogBrowser.identify(userId, traits)
  } catch {
    // swallow
  }
}

export function reset(): void {
  if (typeof window === "undefined") return
  if (!browserInitialized) return
  try {
    posthogBrowser.reset()
  } catch {
    // swallow
  }
}

export function optIn(): void {
  if (typeof window === "undefined") return
  if (!browserInitialized) return
  try {
    posthogBrowser.opt_in_capturing()
  } catch {
    // swallow
  }
}

export function optOut(): void {
  if (typeof window === "undefined") return
  if (!browserInitialized) return
  try {
    posthogBrowser.opt_out_capturing()
  } catch {
    // swallow
  }
}
