import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"
import type { EcoActionKind } from "@/lib/points"

/**
 * The five badges shipped in T2-03. Codes are the canonical reference
 * everywhere — DB rows in `badges`, `user_badges.badge_code`, and the
 * Realtime postgres_changes filter all key off these strings.
 */
export const BADGE_CODES = [
  "first_scan",
  "plastic_hunter_10",
  "map_contributor",
  "generous_giver",
  "eco_streak_7",
] as const

export type BadgeCode = (typeof BADGE_CODES)[number]

/**
 * Plastic material codes used by the `plastic_hunter_10` rule. Mirrors
 * the playbook acceptance criteria — ANY of these counts.
 */
const PLASTIC_MATERIALS = [
  "PET",
  "HDPE",
  "PP",
  "PS",
  "PVC",
  "OTHER_PLASTIC",
] as const

export interface BadgeProgress {
  /** Current numerator. */
  current: number
  /** Target denominator. */
  target: number
}

export interface BadgeRule {
  code: BadgeCode
  /** Eco-action kinds that should re-evaluate this rule. */
  trigger: readonly EcoActionKind[]
  /**
   * Returns `true` when the user has met the badge condition. All checks
   * MUST be safe to call repeatedly — `check_and_award_badge` RPC is
   * idempotent so the worst case is a no-op insert.
   */
  check: (
    admin: SupabaseClient<Database>,
    userId: string,
  ) => Promise<boolean>
  /**
   * Returns numerator/denominator for the locked-state progress label
   * on `BadgeGrid`. Optional — badges where progress is meaningless
   * (e.g. boolean conditions) can omit this.
   */
  progress?: (
    admin: SupabaseClient<Database>,
    userId: string,
  ) => Promise<BadgeProgress>
  icon: string
  name_vi: string
  description: string
}

type AdminClient = SupabaseClient<Database>

async function countScans(admin: AdminClient, userId: string): Promise<number> {
  const { count, error } = await admin
    .from("eco_actions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", "scan")

  if (error) return 0
  return count ?? 0
}

/**
 * Count plastic-material scans for the user. Each scan eco_action holds
 * `ref_table='ai_analyses'` and `ref_id` pointing at the analysis row,
 * which carries the material_code in `result->>'material_code'`. We
 * page through the user's scan eco_actions, then bulk-fetch matching
 * ai_analyses and intersect — Postgres can't JOIN through the (text)
 * `ref_id → uuid` cast cleanly via PostgREST select(), so we do the
 * intersection in JS. For an MVP user this is a few hundred rows max.
 */
async function countPlasticScans(
  admin: AdminClient,
  userId: string,
): Promise<number> {
  const { data: actions, error: actionsError } = await admin
    .from("eco_actions")
    .select("ref_id")
    .eq("user_id", userId)
    .eq("kind", "scan")
    .eq("ref_table", "ai_analyses")
    .not("ref_id", "is", null)

  if (actionsError || !actions || actions.length === 0) return 0

  const analysisIds = Array.from(
    new Set(
      actions
        .map((row) => row.ref_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  )

  if (analysisIds.length === 0) return 0

  const { data: analyses, error: analysisError } = await admin
    .from("ai_analyses")
    .select("id, result")
    .in("id", analysisIds)

  if (analysisError || !analyses) return 0

  let count = 0
  for (const row of analyses) {
    const result = row.result as { material_code?: unknown } | null
    const material = result?.material_code
    if (
      typeof material === "string" &&
      (PLASTIC_MATERIALS as readonly string[]).includes(material)
    ) {
      count += 1
    }
  }
  return count
}

async function countVerifiedPins(
  admin: AdminClient,
  userId: string,
): Promise<number> {
  const { count, error } = await admin
    .from("collection_points")
    .select("id", { count: "exact", head: true })
    .eq("contributed_by", userId)
    .eq("verified", true)

  if (error) return 0
  return count ?? 0
}

async function countCompletedGives(
  admin: AdminClient,
  userId: string,
): Promise<number> {
  const { count, error } = await admin
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .eq("intent", "give")
    .eq("status", "completed")

  if (error) return 0
  return count ?? 0
}

/**
 * Distinct calendar days within the last 7 days where the user logged
 * at least one eco_action. Returns 7 → user qualifies for the streak.
 *
 * We pull the raw rows (cap 200 to keep the query bounded for outliers)
 * and dedupe the `YYYY-MM-DD` slice in JS — Postgres `count(distinct
 * date_trunc(...))` isn't directly expressible through PostgREST's
 * `select()` builder without a custom RPC. Quantity is small per user.
 */
async function countStreakDays(
  admin: AdminClient,
  userId: string,
): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const { data, error } = await admin
    .from("eco_actions")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(200)

  if (error || !data) return 0

  const days = new Set<string>()
  for (const row of data) {
    if (!row.created_at) continue
    days.add(row.created_at.slice(0, 10))
  }
  return days.size
}

/**
 * Single source of truth for every badge rule. Adding a sixth badge is
 * one entry plus a check function — no other call sites need to change
 * because `actions/badges.ts` iterates this map.
 */
export const BADGE_RULES: Record<BadgeCode, BadgeRule> = {
  first_scan: {
    code: "first_scan",
    trigger: ["scan"],
    icon: "🔍",
    name_vi: "Lần Đầu Scan",
    description: "Hoàn thành lần scan AI đầu tiên",
    check: async (admin, userId) => {
      const total = await countScans(admin, userId)
      return total >= 1
    },
    progress: async (admin, userId) => ({
      current: Math.min(1, await countScans(admin, userId)),
      target: 1,
    }),
  },
  plastic_hunter_10: {
    code: "plastic_hunter_10",
    trigger: ["scan"],
    icon: "♻️",
    name_vi: "Thợ Săn Nhựa",
    description: "Scan 10 món đồ nhựa (PET/HDPE/PP/PS/PVC)",
    check: async (admin, userId) => {
      const total = await countPlasticScans(admin, userId)
      return total >= 10
    },
    progress: async (admin, userId) => ({
      current: Math.min(10, await countPlasticScans(admin, userId)),
      target: 10,
    }),
  },
  map_contributor: {
    code: "map_contributor",
    trigger: ["point_pin"],
    icon: "📍",
    name_vi: "Người Lập Bản Đồ Xanh",
    description: "Pin 1 điểm thu gom được duyệt",
    check: async (admin, userId) => {
      const total = await countVerifiedPins(admin, userId)
      return total >= 1
    },
    progress: async (admin, userId) => ({
      current: Math.min(1, await countVerifiedPins(admin, userId)),
      target: 1,
    }),
  },
  generous_giver: {
    code: "generous_giver",
    // Listing creation is the proximal trigger; the rule itself only
    // counts COMPLETED gives, so creating a listing won't unlock until
    // the exchange flow flips it to `completed`. We still re-evaluate
    // on listing_create so a backfill or admin status change picks up.
    trigger: ["listing_create", "exchange_complete"],
    icon: "🎁",
    name_vi: "Người Hào Phóng",
    description: "Hoàn thành 5 listing cho/tặng",
    check: async (admin, userId) => {
      const total = await countCompletedGives(admin, userId)
      return total >= 5
    },
    progress: async (admin, userId) => ({
      current: Math.min(5, await countCompletedGives(admin, userId)),
      target: 5,
    }),
  },
  eco_streak_7: {
    code: "eco_streak_7",
    // Any eco-action could complete day 7 of a streak.
    trigger: ["scan", "listing_create", "point_pin", "vote", "exchange_complete"],
    icon: "🔥",
    name_vi: "Streak 7 Ngày",
    description: "7 ngày liên tiếp có hành động eco",
    check: async (admin, userId) => {
      const days = await countStreakDays(admin, userId)
      return days >= 7
    },
    progress: async (admin, userId) => ({
      current: Math.min(7, await countStreakDays(admin, userId)),
      target: 7,
    }),
  },
}

/**
 * Convenience: rules grouped by trigger kind so `checkBadges` only
 * evaluates rules whose trigger fired.
 */
export function rulesForTrigger(kind: EcoActionKind): BadgeRule[] {
  return BADGE_CODES.map((code) => BADGE_RULES[code]).filter((rule) =>
    rule.trigger.includes(kind),
  )
}
