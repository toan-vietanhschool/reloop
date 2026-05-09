import type { Database } from "@/types/database.types"

export type MaterialCode = Database["public"]["Enums"]["material_code"]
export type ListingIntent = Database["public"]["Enums"]["listing_intent"]

export interface MaterialMeta {
  code: MaterialCode
  name_vi: string
  name_en: string
  color: string
  icon: string
}

/**
 * Hard-coded fallback for the 16 material categories. Mirrors the seed
 * row in `supabase/seed.sql`. We keep this duplicated so client-side
 * cards can render without an extra DB round-trip — DB remains the
 * source of truth, this is a synchronised cache.
 */
export const MATERIAL_META: Record<MaterialCode, MaterialMeta> = {
  PET: {
    code: "PET",
    name_vi: "Nhựa PET",
    name_en: "PET Plastic",
    color: "#3B82F6",
    icon: "bottle",
  },
  HDPE: {
    code: "HDPE",
    name_vi: "Nhựa HDPE",
    name_en: "HDPE Plastic",
    color: "#2563EB",
    icon: "container",
  },
  PP: {
    code: "PP",
    name_vi: "Nhựa PP",
    name_en: "PP Plastic",
    color: "#1D4ED8",
    icon: "package",
  },
  PS: {
    code: "PS",
    name_vi: "Nhựa PS / Xốp",
    name_en: "PS / Styrofoam",
    color: "#1E40AF",
    icon: "layers",
  },
  PVC: {
    code: "PVC",
    name_vi: "Nhựa PVC",
    name_en: "PVC Plastic",
    color: "#1E3A8A",
    icon: "pipe",
  },
  OTHER_PLASTIC: {
    code: "OTHER_PLASTIC",
    name_vi: "Nhựa khác",
    name_en: "Other Plastic",
    color: "#6366F1",
    icon: "recycle",
  },
  PAPER: {
    code: "PAPER",
    name_vi: "Giấy",
    name_en: "Paper",
    color: "#F59E0B",
    icon: "file-text",
  },
  CARDBOARD: {
    code: "CARDBOARD",
    name_vi: "Bìa carton",
    name_en: "Cardboard",
    color: "#D97706",
    icon: "package",
  },
  GLASS: {
    code: "GLASS",
    name_vi: "Thủy tinh",
    name_en: "Glass",
    color: "#10B981",
    icon: "wine",
  },
  METAL_AL: {
    code: "METAL_AL",
    name_vi: "Nhôm",
    name_en: "Aluminum",
    color: "#6B7280",
    icon: "zap",
  },
  METAL_FE: {
    code: "METAL_FE",
    name_vi: "Sắt / Thép",
    name_en: "Iron / Steel",
    color: "#374151",
    icon: "tool",
  },
  TEXTILE: {
    code: "TEXTILE",
    name_vi: "Vải / Quần áo",
    name_en: "Textile / Clothing",
    color: "#EC4899",
    icon: "scissors",
  },
  ELECTRONIC: {
    code: "ELECTRONIC",
    name_vi: "Điện tử (e-waste)",
    name_en: "Electronic Waste",
    color: "#EF4444",
    icon: "cpu",
  },
  ORGANIC: {
    code: "ORGANIC",
    name_vi: "Hữu cơ",
    name_en: "Organic Waste",
    color: "#22C55E",
    icon: "leaf",
  },
  BATTERY: {
    code: "BATTERY",
    name_vi: "Pin",
    name_en: "Battery",
    color: "#F97316",
    icon: "battery",
  },
  MIXED: {
    code: "MIXED",
    name_vi: "Hỗn hợp",
    name_en: "Mixed Waste",
    color: "#9CA3AF",
    icon: "trash-2",
  },
}

export function getMaterialMeta(code: MaterialCode): MaterialMeta {
  return MATERIAL_META[code] ?? MATERIAL_META.MIXED
}

export const MATERIAL_OPTIONS: ReadonlyArray<MaterialMeta> = (
  Object.keys(MATERIAL_META) as MaterialCode[]
).map((code) => MATERIAL_META[code])

const INTENT_LABELS: Record<ListingIntent, string> = {
  give: "Cho",
  exchange: "Đổi",
  sell_scrap: "Bán phế liệu",
  seek: "Cần tìm",
}

const INTENT_DESCRIPTIONS: Record<ListingIntent, string> = {
  give: "Tặng miễn phí",
  exchange: "Đổi lấy món khác",
  sell_scrap: "Bán cho vựa phế liệu / người mua",
  seek: "Đang đi tìm món này",
}

export function getIntentLabel(intent: ListingIntent): string {
  return INTENT_LABELS[intent] ?? intent
}

export function getIntentDescription(intent: ListingIntent): string {
  return INTENT_DESCRIPTIONS[intent] ?? ""
}

export const INTENT_OPTIONS: ReadonlyArray<{
  value: ListingIntent
  label: string
  description: string
}> = (Object.keys(INTENT_LABELS) as ListingIntent[]).map((value) => ({
  value,
  label: INTENT_LABELS[value],
  description: INTENT_DESCRIPTIONS[value],
}))
