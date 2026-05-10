"use client"

import { Filter, RotateCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  POINT_TYPES,
  colorForType,
  pointTypeLabelVi,
  type PointType,
} from "@/lib/map-utils"

interface FilterSidebarProps {
  enabledTypes: Set<PointType>
  onToggleType: (type: PointType) => void
  onResetTypes: () => void
  query: string
  onQueryChange: (q: string) => void
  totalCount: number
  visibleCount: number
}

export function FilterSidebar({
  enabledTypes,
  onToggleType,
  onResetTypes,
  query,
  onQueryChange,
  totalCount,
  visibleCount,
}: FilterSidebarProps) {
  const allOn = POINT_TYPES.every((t) => enabledTypes.has(t))

  return (
    <aside className="flex h-full w-full flex-col gap-5 overflow-y-auto border-r border-emerald-100/80 bg-gradient-to-b from-white via-emerald-50/30 to-white p-5 md:w-80">
      <header className="space-y-1.5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          <Filter className="size-3" aria-hidden />
          Bộ lọc
        </p>
        <h2 className="text-lg font-bold tracking-tight">
          Tìm điểm thu gom phù hợp
        </h2>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
          <span className="tabular-nums">{visibleCount}</span>
          <span className="text-emerald-600">/</span>
          <span className="tabular-nums">{totalCount}</span>
          điểm hiển thị
        </p>
      </header>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Tìm theo tên..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9"
          aria-label="Tìm điểm thu gom"
        />
      </div>

      <section
        aria-label="Lọc theo loại điểm"
        className="space-y-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-foreground/80">
            Loại điểm
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetTypes}
            disabled={allOn}
            className="h-7 gap-1 px-2 text-[11px]"
          >
            <RotateCcw className="size-3" aria-hidden />
            Toàn bộ
          </Button>
        </div>

        <ul className="space-y-1.5">
          {POINT_TYPES.map((type) => {
            const checked = enabledTypes.has(type)
            const color = colorForType(type)
            return (
              <li key={type}>
                <label
                  className={`group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                    checked
                      ? "bg-emerald-50/60 hover:bg-emerald-100/60"
                      : "hover:bg-foreground/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleType(type)}
                    className="size-4 cursor-pointer accent-emerald-600"
                    aria-label={pointTypeLabelVi(type)}
                  />
                  <span
                    aria-hidden
                    className="inline-block size-3 rounded-full ring-2 ring-white shadow"
                    style={{ backgroundColor: color }}
                  />
                  <span className={checked ? "font-medium" : "text-foreground/80"}>
                    {pointTypeLabelVi(type)}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      <footer className="mt-auto rounded-xl border border-border/40 bg-muted/20 p-3 text-[11px] leading-relaxed text-muted-foreground">
        Bản đồ: OpenStreetMap. Dữ liệu cộng đồng — bạn có thể pin điểm
        mới nếu chưa thấy ở đây.
      </footer>
    </aside>
  )
}
