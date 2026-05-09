import { Skeleton } from "@/components/ui/skeleton"

/**
 * Map page loading state. Big rectangle for the map canvas + side panel.
 */
export default function MapLoading() {
  return (
    <main
      aria-label="Đang tải bản đồ điểm thu gom"
      aria-busy
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:px-8"
    >
      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[60vh] w-full rounded-2xl md:h-[70vh]" />
      </div>

      <aside className="flex w-full flex-col gap-3 md:w-80">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 4 }, (_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded-2xl border border-foreground/8 bg-card p-4 shadow-sm"
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </aside>
    </main>
  )
}
