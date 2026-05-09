import { NextResponse } from "next/server"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * PostHog webhook receiver — mirrors a subset of events into Postgres
 * `analytics_events` so admin auditing does not depend on PostHog
 * uptime / paid-plan retention.
 *
 * Setup:
 *   - PostHog → Project Settings → Webhooks → POST {SITE}/api/webhooks/posthog
 *   - Optional: set `POSTHOG_WEBHOOK_SECRET` env var; we then require
 *     `Authorization: Bearer <secret>` on incoming requests.
 *
 * NOTE: PostHog's webhook destination is on the paid plan. For MVP we
 * use the server-side `trackServer()` helper in `lib/analytics.ts`,
 * which writes to PostHog AND mirrors directly into Postgres without
 * needing a webhook round-trip. This route remains as an alternate
 * pipeline for production scale.
 */
const EventSchema = z.object({
  event: z.string().min(1).max(120),
  distinct_id: z.string().min(1).max(200).optional(),
  properties: z.record(z.unknown()).optional(),
})

const PayloadSchema = z.union([
  EventSchema,
  z.object({ events: z.array(EventSchema) }),
])

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function authorize(request: Request): boolean {
  const expected = process.env.POSTHOG_WEBHOOK_SECRET
  if (!expected) return true // no secret configured → open (dev-friendly)
  const header = request.headers.get("authorization") ?? ""
  return header === `Bearer ${expected}`
}

interface AnalyticsEventInsert {
  user_id: string | null
  event: string
  properties: Record<string, unknown>
}

function toRow(input: z.infer<typeof EventSchema>): AnalyticsEventInsert {
  const distinctId = input.distinct_id ?? ""
  const userId = UUID_RE.test(distinctId) ? distinctId : null
  return {
    user_id: userId,
    event: input.event,
    properties: input.properties ?? {},
  }
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = PayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "invalid_payload",
      },
      { status: 400 },
    )
  }

  const events = "events" in parsed.data ? parsed.data.events : [parsed.data]
  if (events.length === 0) {
    return NextResponse.json({ inserted: 0 }, { status: 200 })
  }

  const rows: AnalyticsEventInsert[] = events.map(toRow)

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("analytics_events")
      .insert(rows as never)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ inserted: rows.length }, { status: 200 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown_error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
