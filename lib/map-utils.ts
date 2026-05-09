import type { Database } from "@/types/database.types"

export type PointType = Database["public"]["Enums"]["point_type"]
export type MaterialCode = Database["public"]["Enums"]["material_code"]

export type CollectionPoint =
  Database["public"]["Tables"]["collection_points"]["Row"]

export type MaterialCategory =
  Database["public"]["Tables"]["material_categories"]["Row"]

export interface LatLng {
  lat: number
  lng: number
}

export const HCM_CENTER: LatLng = { lat: 10.7769, lng: 106.7009 }
export const DEFAULT_ZOOM = 11
export const GEOLOCATE_TIMEOUT_MS = 10_000

export const POINT_TYPES: PointType[] = [
  "scrap_dealer",
  "recycle_bin",
  "ngo_dropoff",
  "ewaste",
  "other",
]

export function pointTypeLabelVi(type: PointType): string {
  switch (type) {
    case "scrap_dealer":
      return "Vựa phế liệu"
    case "recycle_bin":
      return "Thùng tái chế công cộng"
    case "ngo_dropoff":
      return "Điểm NGO"
    case "ewaste":
      return "Rác điện tử"
    case "other":
      return "Khác"
    default:
      return "Khác"
  }
}

export function colorForType(type: PointType): string {
  switch (type) {
    case "scrap_dealer":
      return "#F59E0B"
    case "recycle_bin":
      return "#10B981"
    case "ngo_dropoff":
      return "#3B82F6"
    case "ewaste":
      return "#EF4444"
    case "other":
      return "#6B7280"
    default:
      return "#6B7280"
  }
}

export function iconForPointType(type: PointType): string {
  switch (type) {
    case "scrap_dealer":
      return "Recycle"
    case "recycle_bin":
      return "Trash2"
    case "ngo_dropoff":
      return "Heart"
    case "ewaste":
      return "Cpu"
    case "other":
      return "MapPin"
    default:
      return "MapPin"
  }
}

/**
 * Wrap navigator.geolocation.getCurrentPosition with a timeout and graceful
 * permission-denied handling. Resolves with a {lat, lng} on success and
 * rejects with a user-facing Error message on failure.
 */
export function geolocate(
  timeoutMs: number = GEOLOCATE_TIMEOUT_MS,
): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (
      typeof window === "undefined" ||
      !("geolocation" in navigator)
    ) {
      reject(new Error("Trình duyệt không hỗ trợ định vị."))
      return
    }

    let settled = false
    const timer = window.setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error("Quá thời gian xác định vị trí."))
    }, timeoutMs)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (settled) return
        settled = true
        window.clearTimeout(timer)
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      (err) => {
        if (settled) return
        settled = true
        window.clearTimeout(timer)
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("Bạn đã từ chối quyền định vị."))
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reject(new Error("Không thể xác định vị trí hiện tại."))
        } else {
          reject(new Error("Lỗi định vị, vui lòng thử lại."))
        }
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: timeoutMs,
      },
    )
  })
}
