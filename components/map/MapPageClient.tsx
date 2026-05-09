"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { Filter, X } from "lucide-react"

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
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
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

        {/* Mobile filter trigger */}
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => setDrawerOpen(true)}
          className="absolute left-3 top-3 z-[400] shadow-md md:hidden"
          aria-label="Mở bộ lọc"
        >
          <Filter className="h-4 w-4" aria-hidden />
          Bộ lọc
        </Button>
      </div>

      {/* Mobile drawer */}
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
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b p-3">
              <h2 className="text-base font-semibold">Bộ lọc</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Đóng"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden />
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
