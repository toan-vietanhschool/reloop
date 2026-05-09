/**
 * Eco-points constants — pure values, safe to import from both client
 * and server modules. Kept separate from `actions/points.ts` because
 * Next.js 16 forbids non-async-function exports from a "use server" file.
 */

/**
 * Allowed eco_action `kind` values, mirroring the DB CHECK constraint
 * declared in 0001_init.sql.
 */
export const ECO_ACTION_KINDS = [
  "scan",
  "listing_create",
  "exchange_complete",
  "point_pin",
  "vote",
] as const
export type EcoActionKind = (typeof ECO_ACTION_KINDS)[number]

/**
 * Canonical point values for each action. Centralised here so other
 * actions never sprinkle magic numbers around the codebase.
 */
export const POINTS: Record<EcoActionKind, number> = {
  scan: 5,
  listing_create: 10,
  point_pin: 15,
  vote: 1,
  exchange_complete: 20,
}

/**
 * Vietnamese labels for activity feed and toasts.
 */
export const ECO_ACTION_LABELS_VI: Record<EcoActionKind, string> = {
  scan: "Quét vật liệu",
  listing_create: "Đăng tin tái sinh",
  point_pin: "Ghim điểm thu gom",
  vote: "Bình chọn điểm",
  exchange_complete: "Hoàn tất trao đổi",
}
