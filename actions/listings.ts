"use server"

import { revalidatePath } from "next/cache"

import { awardPoints } from "@/actions/points"
import { trackServer } from "@/lib/analytics-server"
import { POINTS } from "@/lib/points"
import { moderateListing } from "@/lib/openai/moderate"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  CreateListingSchema,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  UpdateListingSchema,
  type CreateListingInput,
  type UpdateListingInput,
} from "@/lib/validators/listing"
import type { Database } from "@/types/database.types"

type ListingRow = Database["public"]["Tables"]["listings"]["Row"]
type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"]
type ListingUpdate = Database["public"]["Tables"]["listings"]["Update"]

export interface ActionResult<T> {
  data: T | null
  error: string | null
}

const STORAGE_BUCKET = "listings"

let bucketEnsured = false

/**
 * Ensure the public `listings` storage bucket exists. Idempotent and
 * cheap (we cache success per-process). Falls back silently when the
 * service-role client cannot create the bucket — operator must then
 * provision it via the Supabase dashboard.
 */
async function ensureBucket(): Promise<void> {
  if (bucketEnsured) return

  try {
    const admin = createAdminClient()
    const { data, error: listError } = await admin.storage.listBuckets()
    if (listError) {
      // service-role probably misconfigured — skip silently, MVP is
      // expected to provision the bucket via dashboard in that case.
      return
    }
    const exists = data?.some((b) => b.name === STORAGE_BUCKET)
    if (exists) {
      bucketEnsured = true
      return
    }

    const { error: createError } = await admin.storage.createBucket(
      STORAGE_BUCKET,
      {
        public: true,
        fileSizeLimit: "2MB",
      },
    )
    if (!createError) {
      bucketEnsured = true
    }
  } catch {
    // swallow — listings can still be created without photos
  }
}

function isAllowedImage(file: File): boolean {
  if (file.size === 0) return false
  if (file.size > MAX_PHOTO_BYTES) return false
  return file.type.startsWith("image/")
}

interface PhotoUploadInput {
  files: File[]
  userId: string
  listingId: string
}

/**
 * Upload up to MAX_PHOTOS images to the `listings` bucket and return
 * their public URLs. Errors on individual files are skipped — the
 * caller surfaces a partial-success warning if needed.
 */
async function uploadPhotos({
  files,
  userId,
  listingId,
}: PhotoUploadInput): Promise<string[]> {
  if (files.length === 0) return []

  await ensureBucket()

  const supabase = await createClient()
  const urls: string[] = []
  const limit = Math.min(files.length, MAX_PHOTOS)

  for (let i = 0; i < limit; i += 1) {
    const file = files[i]
    if (!file || !isAllowedImage(file)) continue

    const ext = inferExtension(file.type) ?? "jpg"
    const path = `${userId}/${listingId}/${i}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      })
    if (uploadError) continue

    const { data: publicUrl } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)
    if (publicUrl?.publicUrl) {
      urls.push(publicUrl.publicUrl)
    }
  }

  return urls
}

function inferExtension(mime: string): string | null {
  switch (mime) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/avif":
      return "avif"
    default:
      return null
  }
}

function parseFormData(formData: FormData): {
  parsed: CreateListingInput | null
  errorMessage: string | null
  files: File[]
} {
  const raw = {
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    intent: formData.get("intent"),
    material_code: formData.get("material_code"),
    condition: formData.get("condition") ?? undefined,
    city: formData.get("city") ?? undefined,
  }

  const result = CreateListingSchema.safeParse(raw)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return {
      parsed: null,
      errorMessage:
        firstIssue?.message ?? "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.",
      files: [],
    }
  }

  const photoEntries = formData.getAll("photos")
  const files: File[] = photoEntries
    .filter((entry): entry is File => entry instanceof File)
    .slice(0, MAX_PHOTOS)

  return { parsed: result.data, errorMessage: null, files }
}

/**
 * Server Action — create a listing.
 *
 * Flow:
 *   1. Authenticate via cookie-bound Supabase client.
 *   2. Validate FormData with Zod.
 *   3. Insert row (RLS enforces owner_id = auth.uid()).
 *   4. Upload up to 5 photos to Storage, persist their public URLs.
 *   5. Run AI moderation; update `moderation_passed` accordingly.
 *
 * Returns `{data: {id}, error: null}` on success, `{data: null, error}`
 * on any failure.
 */
export async function createListing(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Bạn cần đăng nhập để đăng tin." }
  }

  const { parsed, errorMessage, files } = parseFormData(formData)
  if (!parsed) {
    return { data: null, error: errorMessage ?? "Dữ liệu không hợp lệ" }
  }

  const insertPayload: ListingInsert = {
    owner_id: user.id,
    title: parsed.title,
    description: parsed.description ?? null,
    intent: parsed.intent,
    material_code: parsed.material_code,
    condition: parsed.condition ?? null,
    city: parsed.city ?? null,
    moderation_passed: false,
    status: "available",
  }

  // Cast through `never` — supabase-js v2.105 generic narrows to `never`
  // for some `RejectExcessProperties` paths under TS strict mode (same
  // pattern used in actions/auth.ts).
  const { data: inserted, error: insertError } = await supabase
    .from("listings")
    .insert(insertPayload as never)
    .select("id")
    .single<{ id: string }>()

  if (insertError || !inserted) {
    return {
      data: null,
      error: insertError?.message ?? "Không thể tạo bài đăng.",
    }
  }

  const listingId = inserted.id

  // Best-effort photo upload — partial success is tolerated.
  const photoUrls = await uploadPhotos({
    files,
    userId: user.id,
    listingId,
  })

  const moderation = await moderateListing({
    title: parsed.title,
    description: parsed.description,
  })

  // Persist the AI moderation reason + timestamp so the admin
  // moderation panel (T2-04) can display *why* content was flagged.
  // `moderated_at` is distinct from `updated_at`: it tracks the
  // moderation pass itself, not any later owner edit.
  const moderationUpdate: ListingUpdate = {
    photos: photoUrls,
    moderation_passed: moderation.safe,
    moderation_reason: moderation.reason,
    moderated_at: new Date().toISOString(),
  }
  // Use admin client for the moderation update because RLS policy
  // `listings_owner_update_safe_fields` (migration 0004) intentionally
  // pins `moderation_passed` to its current committed value for the
  // owner's session. The AI moderation pass is an authorized server-side
  // write, analogous to `awardPoints()` — it must bypass RLS.
  const admin = createAdminClient()
  const { error: updateError } = await admin
    .from("listings")
    .update(moderationUpdate as never)
    .eq("id", listingId)

  if (updateError) {
    return {
      data: null,
      error: `Đã tạo bài đăng nhưng không thể cập nhật ảnh / kiểm duyệt: ${updateError.message}`,
    }
  }

  // Award eco points only when the listing actually clears moderation —
  // moderated-out content should not earn rewards. Failures are
  // intentionally swallowed: the listing creation itself succeeded.
  if (moderation.safe) {
    await awardPoints(
      user.id,
      "listing_create",
      POINTS.listing_create,
      "listings",
      listingId,
      { skipRevalidate: true },
    )
  }

  // listing_created — fire regardless of moderation outcome so the
  // funnel still reflects creation intent. Best-effort.
  void trackServer(user.id, "listing_created", {
    listing_id: listingId,
    material_code: parsed.material_code,
    intent: parsed.intent,
    moderation_passed: moderation.safe,
  })

  revalidatePath("/listings")
  revalidatePath(`/listings/${listingId}`)
  revalidatePath("/profile")
  revalidatePath("/", "layout")

  return { data: { id: listingId }, error: null }
}

/**
 * Update a listing. RLS guarantees only the owner can update — no
 * additional ownership check needed in application code.
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Bạn cần đăng nhập." }
  }

  const result = UpdateListingSchema.safeParse(input)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return {
      data: null,
      error: firstIssue?.message ?? "Dữ liệu không hợp lệ.",
    }
  }

  const updates: ListingUpdate = {}
  if (result.data.title !== undefined) updates.title = result.data.title
  if ("description" in result.data) {
    updates.description = result.data.description ?? null
  }
  if (result.data.intent !== undefined) updates.intent = result.data.intent
  if (result.data.material_code !== undefined) {
    updates.material_code = result.data.material_code
  }
  if ("condition" in result.data) {
    updates.condition = result.data.condition ?? null
  }
  if ("city" in result.data) {
    updates.city = result.data.city ?? null
  }

  if (Object.keys(updates).length === 0) {
    return { data: { id }, error: null }
  }

  const { error } = await supabase
    .from("listings")
    .update(updates as never)
    .eq("id", id)
    .eq("owner_id", user.id)

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath(`/listings/${id}`)
  revalidatePath("/listings")
  return { data: { id }, error: null }
}

/**
 * Soft-delete a listing by setting `status='removed'`. RLS limits this
 * to the listing owner.
 */
export async function deleteListing(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Bạn cần đăng nhập." }
  }

  const removalUpdate: ListingUpdate = { status: "removed" }
  const { error } = await supabase
    .from("listings")
    .update(removalUpdate as never)
    .eq("id", id)
    .eq("owner_id", user.id)

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/listings")
  revalidatePath(`/listings/${id}`)
  return { data: { id }, error: null }
}

/**
 * Server-only fetch helpers. Kept here so pages can call them without
 * duplicating Supabase wiring.
 */
export async function fetchPublicListings(
  limit = 20,
): Promise<ActionResult<ListingRow[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("moderation_passed", true)
    .neq("status", "removed")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return { data: null, error: error.message }
  }
  // @supabase/ssr 0.5.2 narrows select() result to never — cast through
  // unknown to recover the schema-driven row type.
  return { data: ((data ?? []) as ListingRow[]) ?? [], error: null }
}
