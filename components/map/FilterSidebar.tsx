"use client"

import { Search } from "lucide-react"

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
  return (
    <aside className="flex h-full w-full flex-col gap-4 overflow-y-auto border-r border-border bg-background p-4 md:w-80">
      <header>
        <h2 className="text-lg font-semibold">Bộ lọc</h2>
        <p className="text-xs text-muted-foreground">
          Hiển thị {visibleCount}/{totalCount} điểm
        </p>
      </header>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Tìm theo tên..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-8"
          aria-label="Tìm điểm thu gom"
        />
      </div>

      <section aria-label="Lọc theo loại điểm" className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Loại điểm</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetTypes}
            className="h-7 px-2 text-xs"
          >
            Toàn bộ
          </Button>
        </div>

        <ul className="space-y-1">
          {POINT_TYPES.map((type) => {
            const checked = enabledTypes.has(type)
            return (
              <li key={type}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleType(type)}
                    className="h-4 w-4 rounded border-input"
                    aria-label={pointTypeLabelVi(type)}
                  />
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: colorForType(type) }}
                  />
                  <span>{pointTypeLabelVi(type)}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      <footer className="mt-auto border-t pt-3 text-[11px] text-muted-foreground">
        Bản đồ: OpenStreetMap. Dữ liệu cộng đồng, có thể cập nhật.
      </footer>
    </aside>
  )
}
