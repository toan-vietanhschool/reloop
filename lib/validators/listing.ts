import { z } from "zod"

/**
 * Listing intent — matches Postgres enum `listing_intent`.
 *  - give: Cho miễn phí
 *  - exchange: Đổi hàng
 *  - sell_scrap: Bán phế liệu
 *  - seek: Tìm kiếm
 */
export const ListingIntent = z.enum(["give", "exchange", "sell_scrap", "seek"])
export type ListingIntent = z.infer<typeof ListingIntent>

/**
 * Material code — matches Postgres enum `material_code` (16 values).
 */
export const MaterialCode = z.enum([
  "PET",
  "HDPE",
  "PP",
  "PS",
  "PVC",
  "OTHER_PLASTIC",
  "PAPER",
  "CARDBOARD",
  "GLASS",
  "METAL_AL",
  "METAL_FE",
  "TEXTILE",
  "ELECTRONIC",
  "ORGANIC",
  "BATTERY",
  "MIXED",
])
export type MaterialCode = z.infer<typeof MaterialCode>

/**
 * Listing status — matches Postgres enum `listing_status`.
 */
export const ListingStatus = z.enum([
  "available",
  "reserved",
  "completed",
  "removed",
])
export type ListingStatus = z.infer<typeof ListingStatus>

/**
 * Schema validated from Server Action FormData. Photos are handled
 * separately as `File[]` and uploaded to Supabase Storage; only their
 * resulting public URLs are persisted in `listings.photos`.
 */
export const CreateListingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Tiêu đề phải có ít nhất 3 ký tự")
    .max(120, "Tiêu đề tối đa 120 ký tự"),
  description: z
    .string()
    .trim()
    .max(2000, "Mô tả tối đa 2000 ký tự")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  intent: ListingIntent,
  material_code: MaterialCode,
  condition: z.coerce
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  city: z
    .string()
    .trim()
    .max(80, "Thành phố tối đa 80 ký tự")
    .optional()
    .or(z.literal("").transform(() => undefined)),
})
export type CreateListingInput = z.infer<typeof CreateListingSchema>

/**
 * Subset of fields we permit through `updateListing`. Mirrors create
 * but every field is optional so partial updates work cleanly.
 */
export const UpdateListingSchema = CreateListingSchema.partial()
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>

export const MAX_PHOTOS = 5
export const MAX_PHOTO_BYTES = 1_500_000 // ~1.5MB hard ceiling after client-side compression
