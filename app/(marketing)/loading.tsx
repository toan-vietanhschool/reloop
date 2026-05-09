import { Skeleton } from "@/components/ui/skeleton"

/**
 * Minimal loading state for the marketing surface. Keeps the page calm
 * during prefetch hops without flashing an empty viewport.
 */
export default function MarketingLoading() {
  return (
    <main
      aria-label="Đang tải"
      aria-busy
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-20"
    >
      <Skeleton className="h-10 w-3/4 max-w-2xl" />
      <Skeleton className="h-6 w-2/3 max-w-xl" />
      <Skeleton className="h-12 w-44 rounded-full" />
    </main>
  )
}
