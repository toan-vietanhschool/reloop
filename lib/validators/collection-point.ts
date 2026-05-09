import { z } from "zod"

import { MaterialCode } from "@/lib/validators/listing"

/**
 * Collection point types — matches Postgres enum `point_type`.
 *  - scrap_dealer: Vựa phế liệu
 *  - recycle_bin: Thùng tái chế công cộng
 *  - ngo_dropoff: Điểm tiếp nhận NGO
 *  - ewaste: Điểm thu gom rác điện tử
 *  - other: Khác
 */
export const PointType = z.enum([
  "scrap_dealer",
  "recycle_bin",
  "ngo_dropoff",
  "ewaste",
  "other",
])
export type PointType = z.infer<typeof PointType>

/**
 * Vote kinds — matches Postgres enum `vote_kind`.
 */
export const VoteKind = z.enum(["up", "down"])
export type VoteKind = z.infer<typeof VoteKind>

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined))

/**
 * Schema validated from `pinCollectionPoint` Server Action.
 *
 * `accepts` is required (≥ 1, ≤ 16) so users cannot pin a point that
 * accepts nothing — the map filter would hide it permanently.
 *
 * Latitude / longitude bounds match the WGS-84 standard. Phone is a
 * loose "digits + symbols" pattern; we don't try to parse VN phone
 * formats here because users may legitimately enter international
 * NGO contact numbers.
 */
export const PinPointSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Tên điểm phải có ít nhất 3 ký tự")
    .max(120, "Tên điểm tối đa 120 ký tự"),
  type: PointType,
  accepts: z
    .array(MaterialCode)
    .min(1, "Chọn ít nhất 1 vật liệu nhận")
    .max(16, "Tối đa 16 vật liệu"),
  lat: z
    .number({ invalid_type_error: "Vĩ độ không hợp lệ" })
    .gte(-90, "Vĩ độ phải ≥ -90")
    .lte(90, "Vĩ độ phải ≤ 90"),
  lng: z
    .number({ invalid_type_error: "Kinh độ không hợp lệ" })
    .gte(-180, "Kinh độ phải ≥ -180")
    .lte(180, "Kinh độ phải ≤ 180"),
  address: optionalString(200),
  phone: z
    .string()
    .regex(/^[+\d\s-]{6,20}$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  hours: optionalString(120),
  notes: optionalString(500),
})
export type PinPointInput = z.infer<typeof PinPointSchema>
