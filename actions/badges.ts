"use server"

import "server-only"

import { revalidatePath } from "next/cache"

import { trackServer } from "@/lib/analytics-server"
import {
  BADGE_RULES,
  rulesForTrigger,
  type BadgeCode,
} from "@/lib/badge-rules"
import type { EcoActionKind } from "@/lib/points"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database.types"

type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"]

export interface BadgeNotification {
  code: BadgeCode
  name_vi: string
  description: string
  icon: string
}

export interface CheckBadgesResult {
  newBadges: BadgeNotification[]
  error: string | null
}

/**
 * Re-evaluates every badge rule whose `trigger` matches the given
 * eco-action kind, awards any newly-met badges via the
 * `check_and_award_badge` RPC, and inserts a `notifications` row per
 * unlock.
 *
 * SERVER-ONLY. Uses the service-role admin client because:
 *   - `check_and_award_badge` is granted to service_role only
 *   - `notifications.user_id` writes hit RLS; admin bypass keeps the
 *     unlock path consistent regardless of which surface fired it
 *
 * Idempotency: the RPC's `on conflict do nothing` makes re-firing the
 * same trigger a no-op for already-awarded badges, so callers can
 * invoke this from any code path without dedup.
 *
 * Returns the list of NEW badges so the caller can surface them in
 * UI without an extra round-trip; an empty list is the common case.
 */
export async function checkBadges(
  userId: string,
  triggerKind: EcoActionKind,
): Promise<CheckBadgesResult> {
  if (!userId) {
    return { newBadges: [], error: "missing_user_id" }
  }

  const candidates = rulesForTrigger(triggerKind)
  if (candidates.length === 0) {
    return { newBadges: [], error: null }
  }

  const admin = createAdminClient()
  const newBadges: BadgeNotification[] = []
  let firstError: string | null = null

  for (const rule of candidates) {
    let qualifies = false
    try {
      qualifies = await rule.check(admin, userId)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "rule_check_failed"
      firstError = firstError ?? `${rule.code}: ${message}`
      continue
    }
    if (!qualifies) continue

    const { data: awarded, error: rpcError } = await admin.rpc(
      "check_and_award_badge",
      { uid: userId, badge_code: rule.code },
    )
    if (rpcError) {
      firstError = firstError ?? `${rule.code}: ${rpcError.message}`
      continue
    }
    if (awarded !== true) continue

    newBadges.push({
      code: rule.code,
      name_vi: rule.name_vi,
      description: rule.description,
      icon: rule.icon,
    })

    // badge_unlocked analytics — one event per newly-awarded badge.
    void trackServer(userId, "badge_unlocked", {
      code: rule.code,
      trigger: triggerKind,
    })

    // Best-effort notification log — don't abort the loop on failure.
    const notificationPayload: NotificationInsert = {
      user_id: userId,
      kind: "badge_unlocked",
      title: `Mở khóa huy hiệu: ${rule.name_vi}`,
      body: rule.description,
      link: "/profile",
    }
    const { error: notifError } = await admin
      .from("notifications")
      .insert(notificationPayload as never)
    if (notifError) {
      // eslint-disable-next-line no-console
      console.warn("notifications.insert failed:", notifError.message)
    }
  }

  if (newBadges.length > 0) {
    // Refresh profile / dashboard surfaces that show the badge grid
    // and any header counters.
    revalidatePath("/profile")
    revalidatePath("/dashboard")
  }

  return { newBadges, error: firstError }
}

/**
 * Read helper for the `BadgeGrid` server component. Returns the full
 * 5-cell catalogue with a `unlocked` flag and (when available) the
 * locked-state progress text. Uses the cookie-bound caller so the
 * read respects RLS.
 */
export interface BadgeWithStatus {
  code: BadgeCode
  name_vi: string
  description: string
  icon: string
  unlocked: boolean
  awardedAt: string | null
  /** Progress text rendered under locked badges, e.g. "3/10". */
  progressLabel: string | null
}

export async function getUserBadges(
  userId: string,
): Promise<BadgeWithStatus[]> {
  if (!userId) return []

  const admin = createAdminClient()

  const { data: awarded } = await admin
    .from("user_badges")
    .select("badge_code, awarded_at")
    .eq("user_id", userId)

  const awardedMap = new Map<string, string | null>()
  for (const row of awarded ?? []) {
    awardedMap.set(row.badge_code, row.awarded_at ?? null)
  }

  const result: BadgeWithStatus[] = []
  for (const code of Object.keys(BADGE_RULES) as BadgeCode[]) {
    const rule = BADGE_RULES[code]
    const isUnlocked = awardedMap.has(code)

    let progressLabel: string | null = null
    if (!isUnlocked && rule.progress) {
      try {
        const progress = await rule.progress(admin, userId)
        if (progress.target > 1) {
          progressLabel = `${progress.current}/${progress.target}`
        }
      } catch {
        progressLabel = null
      }
    }

    result.push({
      code,
      name_vi: rule.name_vi,
      description: rule.description,
      icon: rule.icon,
      unlocked: isUnlocked,
      awardedAt: awardedMap.get(code) ?? null,
      progressLabel,
    })
  }
  return result
}
