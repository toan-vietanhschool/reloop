import { unstable_cache } from "next/cache"
import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TOP_LIMIT = 20
const CACHE_TAG = "leaderboard-top20"
const CACHE_REVALIDATE_SECONDS = 60

interface LeaderboardRow {
  id: string
  display_name: string
  avatar_url: string | null
  eco_points: number
  level: number
  school: string | null
}

/**
 * Returns top 20 globally (or per school when `schoolCode` is non-null),
 * memoized via Next.js' built-in cache. The cache key includes `schoolCode`
 * so global vs filtered views don't collide.
 *
 * Re-validates every CACHE_REVALIDATE_SECONDS or on `revalidateTag(CACHE_TAG)`.
 */
const fetchTop20 = unstable_cache(
  async (schoolCode: string | null): Promise<LeaderboardRow[]> => {
    const admin = createAdminClient()

    let query = admin
      .from("profiles")
      .select("id, display_name, avatar_url, eco_points, level, school")
      .order("eco_points", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(TOP_LIMIT)

    if (schoolCode) {
      query = query.eq("school", schoolCode)
    }

    const { data, error } = await query
    if (error) {
      throw new Error(`leaderboard_fetch_failed: ${error.message}`)
    }
    return (data ?? []) as LeaderboardRow[]
  },
  ["leaderboard-top20"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_REVALIDATE_SECONDS,
  },
)

interface CronResponse {
  ok: true
  recomputed_at: string
  global_count: number
  cached_keys: string[]
}

/**
 * GET /api/cron/leaderboard
 *
 * Vercel Cron hits this hourly (see vercel.json). Recomputes the cached
 * top 20 (global view) and emits a `leaderboard_recomputed` analytics event.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}` header. Vercel Cron
 * automatically attaches this when the env var is configured. Manual hits
 * without the header return 401.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    // Misconfiguration — fail closed rather than allow unauthenticated access.
    return NextResponse.json(
      { error: "cron_secret_not_configured" },
      { status: 500 },
    )
  }

  const authHeader = request.headers.get("authorization") ?? ""
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // Mark cached top 20 stale via shared tag. Next 16 requires the second
  // `profile` argument; "max" gives us stale-while-revalidate semantics so
  // visitors keep seeing the previous snapshot while we re-prime below.
  const { revalidateTag } = await import("next/cache")
  revalidateTag(CACHE_TAG, "max")

  const globalRows = await fetchTop20(null)

  // Best-effort analytics breadcrumb. RLS allows admin role only on insert
  // by service_role, which createAdminClient provides.
  try {
    const admin = createAdminClient()
    await admin.from("analytics_events").insert({
      event: "leaderboard_recomputed",
      properties: {
        count: globalRows.length,
        top_score: globalRows[0]?.eco_points ?? null,
      },
    } as never)
  } catch {
    // Analytics is not critical to the cron response — swallow.
  }

  const body: CronResponse = {
    ok: true,
    recomputed_at: new Date().toISOString(),
    global_count: globalRows.length,
    cached_keys: ["global"],
  }
  return NextResponse.json(body)
}
