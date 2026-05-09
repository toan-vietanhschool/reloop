/**
 * Next.js 16 instrumentation hook.
 *
 * Runs once per server runtime cold start. We use it to bootstrap Sentry on
 * whichever runtime the request landed on (Node or Edge). The client config
 * is loaded automatically by withSentryConfig — do not import it here.
 *
 * onRequestError forwards thrown errors from Server Components / Route
 * Handlers / Server Actions to Sentry. Without it, framework-caught errors
 * never reach Sentry.
 */
import type { Instrumentation } from "next"

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  ...args
) => {
  const Sentry = await import("@sentry/nextjs")
  return Sentry.captureRequestError(...args)
}
