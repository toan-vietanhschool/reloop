import "server-only"

/**
 * Server-side PostHog analytics + Postgres mirror.
 *
 * Kept in a separate module from analytics.ts so the client-safe browser
 * wrapper never pulls in posthog-node or supabase admin (both server-only).
 */

import { createAdminClient } from "@/lib/supabase/admin"

type PostHogServerType = import("posthog-node").PostHog

let serverClient: PostHogServerType | null = null

async function getServerClient(): Promise<PostHogServerType | null> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return null
  if (!serverClient) {
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"
    const { PostHog } = await import("posthog-node")
    serverClient = new PostHog(key, {
      host,
      flushAt: 1,
      flushInterval: 0,
    })
  }
  return serverClient
}

/**
 * Server-side capture. Use from server actions, route handlers, or
 * background workers. `distinctId` should be the Supabase user id when
 * authenticated, else a stable anonymous id.
 *
 * Best-effort: failures are swallowed.
 */
export async function trackServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const client = await getServerClient()
  if (!client) return
  try {
    client.capture({ distinctId, event, properties })
  } catch {
    // swallow
  }
  // Mirror critical events into Postgres for admin audit.
  await mirrorToAnalyticsEvents(distinctId, event, properties)
}

/**
 * Mirror an event into the Supabase `analytics_events` table.
 *
 * Uses the service-role admin client because the table has no client
 * INSERT policy — service_role only (see migration 0001).
 *
 * `distinctId` is best-effort interpreted as a Supabase user id; if it
 * is not a UUID (anonymous distinct), `user_id` is null.
 */
export async function mirrorToAnalyticsEvents(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  // Skip when env is incomplete (local dev without service role).
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
    const admin = createAdminClient()
    const isUuid = isUuidLike(distinctId)
    const row = {
      user_id: isUuid ? distinctId : null,
      event,
      properties: (properties ?? {}) as Record<string, unknown>,
    }
    await admin.from("analytics_events").insert(row as never)
  } catch {
    // swallow — analytics must never break user-facing flows
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isUuidLike(value: string): boolean {
  return UUID_RE.test(value)
}
