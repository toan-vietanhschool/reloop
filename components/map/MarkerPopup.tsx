"use client"

import { Phone } from "lucide-react"

import { VoteButtons } from "@/components/map/VoteButtons"
import {
  pointTypeLabelVi,
  type CollectionPoint,
  type MaterialCategory,
  type MaterialCode,
} from "@/lib/map-utils"

interface MarkerPopupProps {
  point: CollectionPoint
  categoriesByCode: Record<string, MaterialCategory>
  isLoggedIn: boolean
}

function MaterialChip({
  code,
  category,
}: {
  code: MaterialCode
  category?: MaterialCategory
}) {
  const label = category?.name_vi ?? code
  const bg = category?.color ?? "#9CA3AF"
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  )
}

export function MarkerPopup({
  point,
  categoriesByCode,
  isLoggedIn,
}: MarkerPopupProps) {
  return (
    <div className="min-w-[220px] max-w-[280px] space-y-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug">{point.name}</h3>
        {point.verified ? (
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
            Đã xác minh
          </span>
        ) : (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
            Chưa xác thực
          </span>
        )}
      </div>

      <div>
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {pointTypeLabelVi(point.type)}
        </span>
      </div>

      {point.accepts.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            Nhận:
          </p>
          <div className="flex flex-wrap gap-1">
            {point.accepts.map((code) => (
              <MaterialChip
                key={code}
                code={code}
                category={categoriesByCode[code]}
              />
            ))}
          </div>
        </div>
      )}

      {point.address && (
        <p className="text-xs text-slate-700">{point.address}</p>
      )}

      {point.phone && (
        <a
          href={`tel:${point.phone.replace(/\s+/g, "")}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          <Phone className="h-3 w-3" aria-hidden />
          {point.phone}
        </a>
      )}

      {point.hours && (
        <p className="text-[11px] text-muted-foreground">
          Giờ mở cửa: {point.hours}
        </p>
      )}

      <VoteButtons
        pointId={point.id}
        upvotes={point.upvotes}
        downvotes={point.downvotes}
        isLoggedIn={isLoggedIn}
      />
    </div>
  )
}
