"use server"

import "server-only"

import { revalidatePath } from "next/cache"

import { ECO_ACTION_KINDS, type EcoActionKind } from "@/lib/points"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database.types"

type EcoActionInsert = Database["public"]["Tables"]["eco_actions"]["Insert"]

export interface AwardPointsResult {
  data: { points: number; kind: EcoActionKind } | null
  error: string | null
}

interface AwardPointsOptions {
  /** Skip revalidation (useful when caller already revalidates broader paths). */
  skipRevalidate?: boolean
}

/**
 * Award eco_points to a user.
 *
 * SERVER-ONLY. Uses the service-role admin client because:
 *   - eco_actions has no client INSERT policy (only service_role can write)
 *   - increment_points is granted to service_role only
 *
 * Steps (best-effort, not transactional but ordered defensively):
 *   1. Insert eco_actions row (audit trail)
 *   2. Call public.increment_points RPC (atomic update of points + level)
 *
 * If step 1 fails we abort. If step 2 fails we surface the error but do
 * not roll back the audit row — the inconsistency is logged via the
 * returned error so a follow-up reconciliation job can repair it.
 *
 * Callers MUST verify the action is unique before calling (e.g. AI scan
 * cache miss) — there is no anti-cheat check here.
 */
export async function awardPoints(
  userId: string,
  kind: EcoActionKind,
  delta: number,
  refTable?: string,
  refId?: string,
  options: AwardPointsOptions = {},
): Promise<AwardPointsResult> {
  if (!userId) {
    return { data: null, error: "missing_user_id" }
  }
  if (!ECO_ACTION_KINDS.includes(kind)) {
    return { data: null, error: "invalid_kind" }
  }
  if (!Number.isInteger(delta) || delta === 0) {
    return { data: null, error: "invalid_delta" }
  }

  const admin = createAdminClient()

  const insertPayload: EcoActionInsert = {
    user_id: userId,
    kind,
    points_delta: delta,
    ref_table: refTable ?? null,
    ref_id: refId ?? null,
  }

  const { error: insertError } = await admin
    .from("eco_actions")
    .insert(insertPayload as never)

  if (insertError) {
    return { data: null, error: `eco_action_insert: ${insertError.message}` }
  }

  const { error: rpcError } = await admin.rpc("increment_points", {
    uid: userId,
    delta,
  })

  if (rpcError) {
    return { data: null, error: `increment_points: ${rpcError.message}` }
  }

  if (!options.skipRevalidate) {
    // Refresh header eco-points badge + profile page on next navigation.
    revalidatePath("/", "layout")
    revalidatePath("/profile")
  }

  return { data: { points: delta, kind }, error: null }
}
