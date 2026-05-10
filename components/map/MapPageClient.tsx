"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { Filter, Loader2, X } from "lucide-react"

import { FilterSidebar } from "@/components/map/FilterSidebar"
import { Button } from "@/components/ui/button"
import {
  POINT_TYPES,
  type CollectionPoint,
  type MaterialCategory,
  type PointType,
} from "@/lib/map-utils"

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-mesh">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-soft-lg">
        <Loader2 className="size-5 animate-spin text-emerald-600" aria-hidden />
        <p className="text-sm font-medium text-foreground/80">
          Đang tải bản đồ...
        </p>
      </div>
    </div>
  ),
})

interface MapPageClientProps {
  points: CollectionPoint[]
  categoriesByCode: Record<string, MaterialCategory>
  isLoggedIn: boolean
}

export function MapPageClient({
  points,
  categoriesByCode,
  isLoggedIn,
}: MapPageClientProps) {
  const [enabledTypes, setEnabledTypes] = useState<Set<PointType>>(
    () => new Set<PointType>(POINT_TYPES),
  )
  const [query, setQuery] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)

  function toggleType(type: PointType) {
    setEnabledTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  function resetTypes() {
    setEnabledTypes(new Set<PointType>(POINT_TYPES))
  }

  const visibleCount = useMemo(() => {
    const q = query.trim().toLowerCase()
    return points.filter((p) => {
      if (!enabledTypes.has(p.type)) return false
      if (!q) return true
      return p.name.toLowerCase().includes(q)
    }).length
  }, [points, enabledTypes, query])

  return (
    <main className="relative flex h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      {/* Visually hidden page heading for screen readers — the visible
          UI is map-driven and has no on-page H1. */}
      <h1 className="sr-only">Bản đồ điểm thu gom</h1>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <FilterSidebar
          enabledTypes={enabledTypes}
          onToggleType={toggleType}
          onResetTypes={resetTypes}
          query={query}
          onQueryChange={setQuery}
          totalCount={points.length}
          visibleCount={visibleCount}
        />
      </div>

      {/* Map area */}
      <div className="relative flex-1">
        <MapView
          points={points}
          enabledTypes={enabledTypes}
          query={query}
          categoriesByCode={categoriesByCode}
          isLoggedIn={isLoggedIn}
        />

        {/* Mobile filter trigger — surfaced pill */}
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => setDrawerOpen(true)}
          className="absolute left-3 top-3 z-[400] gap-1.5 rounded-full bg-white px-3 text-emerald-800 shadow-soft-lg ring-1 ring-emerald-300 hover:bg-emerald-50 md:hidden"
          aria-label="Mở bộ lọc"
        >
          <Filter className="size-3.5" aria-hidden />
          Bộ lọc
          <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
            {visibleCount}
          </span>
        </Button>
      </div>

      {/* Mobile bottom-sheet drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[1000] flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Bộ lọc bản đồ"
        >
          <button
            type="button"
            aria-label="Đóng bộ lọc"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-[88%] max-w-sm flex-col overflow-hidden rounded-l-3xl bg-background shadow-2xl">
            {/* Drag handle visual cue */}
            <div className="absolute left-1/2 top-2 h-1 w-12 -translate-x-1/2 rounded-full bg-foreground/20" />
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 pt-5">
              <h2 className="text-base font-bold tracking-tight">Bộ lọc</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Đóng"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>
            <FilterSidebar
              enabledTypes={enabledTypes}
              onToggleType={toggleType}
              onResetTypes={resetTypes}
              query={query}
              onQueryChange={setQuery}
              totalCount={points.length}
              visibleCount={visibleCount}
            />
          </div>
        </div>
      )}
    </main>
  )
}
