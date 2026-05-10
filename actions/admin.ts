"use server"

import "server-only"

import { revalidatePath } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

type ListingUpdate = Database["public"]["Tables"]["listings"]["Update"]
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]
type EcoActionInsert = Database["public"]["Tables"]["eco_actions"]["Insert"]

export interface ActionResult<T> {
  data: T | null
  error: string | null
}

/**
 * Admin audit log "kind" values. These extend the base eco_actions
 * kind enum (migration 0006_admin_audit). Each admin action persists
 * one audit row with `points_delta = 0` (audit, not gamification).
 */
type AdminAuditKind = "admin_approve" | "admin_reject" | "admin_ban"

/**
 * Verify the calling user is an admin. Returns the admin's user id on
 * success, or an `{error}` payload to be surfaced to the client.
 *
 * Uses the cookie-bound (`createClient`) Supabase client to read the
 * caller's auth session, then re-checks `profiles.role = 'admin'` so
 * a non-admin can never trigger admin mutations even if the page-level
 * guard is bypassed.
 */
async function requireAdmin(): Promise<{
  userId: string | null
  error: string | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { userId: null, error: "Bạn cần đăng nhập." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: Database["public"]["Enums"]["user_role"] }>()

  if (profileError) {
    return { userId: null, error: profileError.message }
  }
  if (!profile || profile.role !== "admin") {
    return { userId: null, error: "Chỉ admin mới có quyền thực hiện." }
  }

  return { userId: user.id, error: null }
}

interface AuditOptions {
  kind: AdminAuditKind
  adminId: string
  refTable: string
  refId: string
}

/**
 * Insert a single audit row in `eco_actions` for an admin action.
 *
 * The audit row is owned by the **admin** (user_id = adminId), with
 * `points_delta = 0` so it does not affect the user's eco_points.
 * `ref_table` + `ref_id` link back to the moderated entity.
 *
 * Failures are non-fatal at the call site — the moderation update has
 * already succeeded; logging the audit trail is best-effort.
 */
async function logAuditRow({
  kind,
  adminId,
  refTable,
  refId,
}: AuditOptions): Promise<void> {
  const admin = createAdminClient()
  const payload: EcoActionInsert = {
    user_id: adminId,
    kind,
    points_delta: 0,
    ref_table: refTable,
    ref_id: refId,
  }
  await admin.from("eco_actions").insert(payload as never)
}

/**
 * Revalidate the surfaces touched by any moderation action.
 * Centralised so single + bulk paths stay in sync.
 */
function revalidateModeration(): void {
  revalidatePath("/admin/moderation")
  revalidatePath("/admin/users")
  revalidatePath("/listings")
  revalidatePath("/", "layout")
}

/**
 * Approve a single flagged listing. Sets `moderation_passed = true` so
 * the listing appears in the public marketplace, and logs an audit row.
 */
export async function approveListing(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  if (typeof id !== "string" || id.length === 0) {
    return { data: null, error: "Mã bài đăng không hợp lệ." }
  }

  const { userId: adminId, error: authError } = await requireAdmin()
  if (!adminId) {
    return { data: null, error: authError ?? "unauthorized" }
  }

  const admin = createAdminClient()
  const update: ListingUpdate = { moderation_passed: true }
  const { error: updateError } = await admin
    .from("listings")
    .update(update as never)
    .eq("id", id)

  if (updateError) {
    return { data: null, error: updateError.message }
  }

  await logAuditRow({
    kind: "admin_approve",
    adminId,
    refTable: "listings",
    refId: id,
  })

  revalidateModeration()
  return { data: { id }, error: null }
}

/**
 * Bulk variant of {@link approveListing}. Performs a single UPDATE
 * with `WHERE id IN (...)` for efficiency, then logs one audit row
 * per listing so the audit trail remains itemised.
 */
export async function approveListingsBulk(
  ids: string[],
): Promise<ActionResult<{ count: number }>> {
  const cleanIds = sanitiseIds(ids)
  if (cleanIds.length === 0) {
    return { data: null, error: "Chưa chọn bài đăng nào." }
  }

  const { userId: adminId, error: authError } = await requireAdmin()
  if (!adminId) {
    return { data: null, error: authError ?? "unauthorized" }
  }

  const admin = createAdminClient()
  const update: ListingUpdate = { moderation_passed: true }
  const { error: updateError } = await admin
    .from("listings")
    .update(update as never)
    .in("id", cleanIds)

  if (updateError) {
    return { data: null, error: updateError.message }
  }

  await Promise.all(
    cleanIds.map((id) =>
      logAuditRow({
        kind: "admin_approve",
        adminId,
        refTable: "listings",
        refId: id,
      }),
    ),
  )

  revalidateModeration()
  return { data: { count: cleanIds.length }, error: null }
}

/**
 * Reject a single listing: soft-removes it (status='removed') and
 * appends an admin reason to `moderation_reason` so the original AI
 * reason is preserved alongside the manual rationale.
 */
export async function rejectListing(
  id: string,
  reason?: string,
): Promise<ActionResult<{ id: string }>> {
  if (typeof id !== "string" || id.length === 0) {
    return { data: null, error: "Mã bài đăng không hợp lệ." }
  }

  const { userId: adminId, error: authError } = await requireAdmin()
  if (!adminId) {
    return { data: null, error: authError ?? "unauthorized" }
  }

  const admin = createAdminClient()

  // Read the existing moderation_reason so we can append the admin
  // note rather than overwrite the original AI reason.
  const { data: existing } = await admin
    .from("listings")
    .select("moderation_reason")
    .eq("id", id)
    .maybeSingle<{ moderation_reason: string | null }>()

  const adminNote =
    typeof reason === "string" && reason.trim().length > 0
      ? `Admin: ${reason.trim().slice(0, 200)}`
      : "Admin: từ chối"

  const composedReason = existing?.moderation_reason
    ? `${existing.moderation_reason} | ${adminNote}`
    : adminNote

  const update: ListingUpdate = {
    status: "removed",
    moderation_passed: false,
    moderation_reason: composedReason,
    moderated_at: new Date().toISOString(),
  }
  const { error: updateError } = await admin
    .from("listings")
    .update(update as never)
    .eq("id", id)

  if (updateError) {
    return { data: null, error: updateError.message }
  }

  await logAuditRow({
    kind: "admin_reject",
    adminId,
    refTable: "listings",
    refId: id,
  })

  revalidateModeration()
  return { data: { id }, error: null }
}

/**
 * Bulk variant of {@link rejectListing}. We do NOT compose per-row
 * `moderation_reason` here — bulk rejection appends a generic note,
 * keeping the path cheap. Operators wanting a tailored reason can
 * use the single-row flow.
 */
export async function rejectListingsBulk(
  ids: string[],
  reason?: string,
): Promise<ActionResult<{ count: number }>> {
  const cleanIds = sanitiseIds(ids)
  if (cleanIds.length === 0) {
    return { data: null, error: "Chưa chọn bài đăng nào." }
  }

  const { userId: adminId, error: authError } = await requireAdmin()
  if (!adminId) {
    return { data: null, error: authError ?? "unauthorized" }
  }

  const admin = createAdminClient()
  const adminNote =
    typeof reason === "string" && reason.trim().length > 0
      ? `Admin (bulk): ${reason.trim().slice(0, 200)}`
      : "Admin (bulk): từ chối hàng loạt"

  const update: ListingUpdate = {
    status: "removed",
    moderation_passed: false,
    moderation_reason: adminNote,
    moderated_at: new Date().toISOString(),
  }
  const { error: updateError } = await admin
    .from("listings")
    .update(update as never)
    .in("id", cleanIds)

  if (updateError) {
    return { data: null, error: updateError.message }
  }

  await Promise.all(
    cleanIds.map((id) =>
      logAuditRow({
        kind: "admin_reject",
        adminId,
        refTable: "listings",
        refId: id,
      }),
    ),
  )

  revalidateModeration()
  return { data: { count: cleanIds.length }, error: null }
}

/**
 * Ban a user (soft ban): sets `banned_at = now()` and stores the
 * admin-provided reason. Does NOT terminate the user's auth session
 * for MVP — a Phase 2 middleware will check `banned_at` on each
 * request and redirect to a /banned page.
 */
export async function banUser(
  userId: string,
  reason: string,
): Promise<ActionResult<{ id: string }>> {
  if (typeof userId !== "string" || userId.length === 0) {
    return { data: null, error: "Mã người dùng không hợp lệ." }
  }
  const cleanReason =
    typeof reason === "string" && reason.trim().length > 0
      ? reason.trim().slice(0, 500)
      : null
  if (!cleanReason) {
    return { data: null, error: "Vui lòng nhập lý do cấm." }
  }

  const { userId: adminId, error: authError } = await requireAdmin()
  if (!adminId) {
    return { data: null, error: authError ?? "unauthorized" }
  }
  if (adminId === userId) {
    return { data: null, error: "Không thể tự cấm chính mình." }
  }

  const admin = createAdminClient()
  const update: ProfileUpdate = {
    banned_at: new Date().toISOString(),
    banned_reason: cleanReason,
  }
  const { error: updateError } = await admin
    .from("profiles")
    .update(update as never)
    .eq("id", userId)

  if (updateError) {
    return { data: null, error: updateError.message }
  }

  // Immediately revoke all of the banned user's sessions. Without this
  // their existing JWT remains valid until expiry (up to 1 hour) and
  // they could keep calling Server Actions during that window. signOut
  // is best-effort: if it fails (network blip / Supabase 5xx), we still
  // consider the ban applied — the row is what gates Phase 2 middleware.
  try {
    const adminClient = createAdminClient()
    await adminClient.auth.admin.signOut(userId)
  } catch (signOutError: unknown) {
    const message =
      signOutError instanceof Error ? signOutError.message : "unknown_error"
    console.warn(
      `[banUser] signOut failed for ${userId}; ban row applied but JWT may remain valid until expiry: ${message}`,
    )
  }

  await logAuditRow({
    kind: "admin_ban",
    adminId,
    refTable: "profiles",
    refId: userId,
  })

  revalidateModeration()
  return { data: { id: userId }, error: null }
}

/**
 * Defensive cleanup of an `ids` array coming from a client form.
 * Strips empties / non-strings, dedupes, and caps at 100 to keep the
 * SQL `IN (...)` bounded.
 */
function sanitiseIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return []
  const seen = new Set<string>()
  for (const candidate of ids) {
    if (typeof candidate !== "string") continue
    const trimmed = candidate.trim()
    if (trimmed.length === 0) continue
    if (seen.size >= 100) break
    seen.add(trimmed)
  }
  return Array.from(seen)
}
