import { Skeleton } from "@/components/ui/skeleton"

/**
 * Listings index loading state. Mirrors the grid card layout so the
 * skeleton lines up with the rendered content shape.
 */
export default function ListingsLoading() {
  return (
    <main
      aria-label="Đang tải danh sách marketplace"
      aria-busy
      className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10"
    >
      <div className="mb-8 flex flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {Array.from({ length: 4 }, (_, idx) => (
          <Skeleton key={idx} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-3 rounded-2xl border border-foreground/8 bg-card p-4 shadow-sm"
          >
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-2 flex items-center justify-between">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
