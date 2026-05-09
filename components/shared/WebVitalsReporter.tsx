"use client"

import { useReportWebVitals } from "next/web-vitals"
import * as Sentry from "@sentry/nextjs"

/**
 * Pipes Next.js web-vitals metrics into Sentry as custom events so we can
 * track LCP, INP, CLS, FCP, TTFB on the Sentry Performance dashboard.
 *
 * Note: Sentry v9 removed the metrics.distribution API — we use
 * captureEvent instead so the reporter stays forward-compatible.
 */
export function WebVitalsReporter(): null {
  useReportWebVitals((metric) => {
    try {
      Sentry.captureEvent({
        message: `web-vitals.${metric.name.toLowerCase()}`,
        level: "info",
        extra: {
          value: metric.value,
          id: metric.id,
          rating: metric.rating ?? "unknown",
          unit: metric.name === "CLS" ? "none" : "millisecond",
        },
      })
    } catch {
      // Sentry telemetry is best-effort. Never let it crash the page.
    }
  })

  return null
}
