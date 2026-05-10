"use client"

import { Clock, MapPin, Phone, ShieldCheck, ShieldAlert } from "lucide-react"

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
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm ring-1 ring-white/20"
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
    <div className="min-w-[240px] max-w-[300px] space-y-3 text-sm">
      {/* Header: name + verification chip */}
      <div className="space-y-1">
        <h3 className="text-base font-bold leading-snug tracking-tight">
          {point.name}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            {pointTypeLabelVi(point.type)}
          </span>
          {point.verified ? (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
              <ShieldCheck className="size-2.5" aria-hidden />
              Đã xác minh
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              <ShieldAlert className="size-2.5" aria-hidden />
              Chờ xác minh
            </span>
          )}
        </div>
      </div>

      {/* Materials accepted */}
      {point.accepts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Vật liệu nhận
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

      {/* Contact rows */}
      <div className="space-y-1.5 border-t border-border/40 pt-2">
        {point.address && (
          <p className="flex items-start gap-1.5 text-xs text-foreground/80">
            <MapPin className="mt-0.5 size-3 shrink-0 text-emerald-600" aria-hidden />
            <span>{point.address}</span>
          </p>
        )}

        {point.phone && (
          <a
            href={`tel:${point.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline"
          >
            <Phone className="size-3" aria-hidden />
            {point.phone}
          </a>
        )}

        {point.hours && (
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3" aria-hidden />
            {point.hours}
          </p>
        )}
      </div>

      <VoteButtons
        pointId={point.id}
        upvotes={point.upvotes}
        downvotes={point.downvotes}
        isLoggedIn={isLoggedIn}
      />
    </div>
  )
}
