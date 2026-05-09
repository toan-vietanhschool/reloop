"use server"

import "server-only"

import { revalidatePath } from "next/cache"

import { awardPoints } from "@/actions/points"
import { trackServer } from "@/lib/analytics-server"
import { POINTS } from "@/lib/points"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  PinPointSchema,
  VoteKind,
  type PinPointInput,
  type VoteKind as VoteKindType,
} from "@/lib/validators/collection-point"
import type { Database } from "@/types/database.types"

type CollectionPointInsert =
  Database["public"]["Tables"]["collection_points"]["Insert"]
type CollectionPointUpdate =
  Database["public"]["Tables"]["collection_points"]["Update"]
type CollectionPointVoteInsert =
  Database["public"]["Tables"]["collection_point_votes"]["Insert"]

export interface ActionResult<T> {
  data: T | null
  error: string | null
}

/**
 * Parse a plain object (from a client component) against `PinPointSchema`.
 * Returns the validated input or a user-facing error message in Vietnamese.
 */
function parsePinInput(input: unknown): {
  parsed: PinPointInput | null
  errorMessage: string | null
} {
  const result = PinPointSchema.safeParse(input)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return {
      parsed: null,
      errorMessage:
        firstIssue?.message ?? "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.",
    }
  }
  return { parsed: result.data, errorMessage: null }
}

/**
 * Server Action — pin a new collection point.
 *
 * Flow:
 *   1. Authenticate via cookie-bound Supabase client.
 *   2. Validate input with Zod.
 *   3. Insert row (RLS `cp_user_insert` enforces `auth.uid()` is not null).
 *   4. Award +15 eco_points via the shared `awardPoints` helper.
 *   5. Revalidate map + admin moderation routes.
 *
 * The point is inserted with `verified=false`; an admin must promote it
 * via `verifyCollectionPoint` before its marker turns green.
 */
export async function pinCollectionPoint(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Bạn cần đăng nhập để pin điểm." }
  }

  const { parsed, errorMessage } = parsePinInput(input)
  if (!parsed) {
    return { data: null, error: errorMessage ?? "Dữ liệu không hợp lệ." }
  }

  const insertPayload: CollectionPointInsert = {
    name: parsed.name,
    type: parsed.type,
    accepts: parsed.accepts,
    lat: parsed.lat,
    lng: parsed.lng,
    address: parsed.address ?? null,
    phone: parsed.phone ?? null,
    hours: parsed.hours ?? null,
    notes: parsed.notes ?? null,
    contributed_by: user.id,
    verified: false,
  }

  // Cast through `never` — supabase-js v2 narrows generics to `never` for
  // some `RejectExcessProperties` paths under TS strict mode (same pattern
  // used in actions/listings.ts and actions/auth.ts).
  const { data: inserted, error: insertError } = await supabase
    .from("collection_points")
    .insert(insertPayload as never)
    .select("id")
    .single<{ id: string }>()

  if (insertError || !inserted) {
    return {
      data: null,
      error: insertError?.message ?? "Không thể pin điểm.",
    }
  }

  // Award +15 eco_points; failures are intentionally non-fatal because
  // the point itself was successfully created. Skip per-call revalidate
  // and consolidate into the broader revalidate sweep below.
  await awardPoints(
    user.id,
    "point_pin",
    POINTS.point_pin,
    "collection_points",
    inserted.id,
    { skipRevalidate: true },
  )

  // point_pinned analytics — fired post-insert so we don't double-count
  // failed inserts. Best-effort.
  void trackServer(user.id, "point_pinned", {
    point_id: inserted.id,
    type: parsed.type,
  })

  revalidatePath("/map")
  revalidatePath("/admin/points")
  revalidatePath("/profile")
  revalidatePath("/", "layout")

  return { data: { id: inserted.id }, error: null }
}

/**
 * Server Action — cast or change a vote on a collection point.
 *
 * Uses an upsert keyed on the composite PK `(point_id, user_id)` so a
 * user changing their vote replaces the existing row in place rather
 * than inserting a duplicate. The trigger `update_cp_vote_counts`
 * (migration 0001) auto-recomputes `upvotes` / `downvotes` after every
 * mutation, so we don't manually update the parent row.
 *
 * RLS policies `cpv_self_insert` and `cpv_self_update` already enforce
 * `auth.uid() = user_id`, but we double-check at the application layer
 * to surface a clean error message before attempting the write.
 */
export async function voteCollectionPoint(
  pointId: string,
  kind: VoteKindType,
): Promise<ActionResult<{ pointId: string; kind: VoteKindType }>> {
  if (typeof pointId !== "string" || pointId.length === 0) {
    return { data: null, error: "Mã điểm không hợp lệ." }
  }

  const kindResult = VoteKind.safeParse(kind)
  if (!kindResult.success) {
    return { data: null, error: "Loại bình chọn không hợp lệ." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Bạn cần đăng nhập để bình chọn." }
  }

  const upsertPayload: CollectionPointVoteInsert = {
    point_id: pointId,
    user_id: user.id,
    kind: kindResult.data,
  }

  const { error: upsertError } = await supabase
    .from("collection_point_votes")
    .upsert([upsertPayload] as never, { onConflict: "point_id,user_id" })

  if (upsertError) {
    return { data: null, error: upsertError.message }
  }

  // vote_cast analytics — captures kind change as well as new votes.
  void trackServer(user.id, "vote_cast", {
    point_id: pointId,
    kind: kindResult.data,
  })

  revalidatePath("/map")

  return {
    data: { pointId, kind: kindResult.data },
    error: null,
  }
}

/**
 * Server Action — admin verifies a pending collection point.
 *
 * Re-checks `is_admin()` on the server even though RLS policy
 * `cp_owner_admin_update` already permits this update — the explicit
 * guard short-circuits non-admin callers with a clean error rather
 * than letting the DB silently no-op the update.
 *
 * The actual update uses the admin client because the original
 * RLS-bound update flow would still respect `cp_owner_admin_update`,
 * but using `createAdminClient` keeps the audit story consistent with
 * other privileged actions (awardPoints, moderation).
 */
export async function verifyCollectionPoint(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  if (typeof id !== "string" || id.length === 0) {
    return { data: null, error: "Mã điểm không hợp lệ." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Bạn cần đăng nhập." }
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: Database["public"]["Enums"]["user_role"] }>()

  if (profileError) {
    return { data: null, error: profileError.message }
  }
  if (!profileRow || profileRow.role !== "admin") {
    return { data: null, error: "Chỉ admin mới có quyền xác minh điểm." }
  }

  const admin = createAdminClient()
  const verifyUpdate: CollectionPointUpdate = { verified: true }
  const { error: updateError } = await admin
    .from("collection_points")
    .update(verifyUpdate as never)
    .eq("id", id)

  if (updateError) {
    return { data: null, error: updateError.message }
  }

  revalidatePath("/map")
  revalidatePath("/admin/points")

  return { data: { id }, error: null }
}

/**
 * Server-only fetch helper — returns the current user's vote for a
 * given collection point (or null if they haven't voted). Used by the
 * map popup to render the VoteButtons in the correct active state.
 */
export async function getMyVote(
  pointId: string,
): Promise<ActionResult<VoteKindType | null>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from("collection_point_votes")
    .select("kind")
    .eq("point_id", pointId)
    .eq("user_id", user.id)
    .maybeSingle<{ kind: VoteKindType }>()

  if (error) {
    return { data: null, error: error.message }
  }
  return { data: data?.kind ?? null, error: null }
}
