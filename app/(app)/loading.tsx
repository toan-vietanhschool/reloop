import { Skeleton } from "@/components/ui/skeleton"

/**
 * Generic loading state for any (app) route that doesn't ship its own
 * loading.tsx. Header is preserved by the layout boundary so we only
 * skeleton the inner content.
 */
export default function AppLoading() {
  return (
    <main
      aria-label="Đang tải"
      aria-busy
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 md:px-10"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-1/2 max-w-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {Array.from({ length: 3 }, (_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-3 rounded-2xl border border-foreground/8 bg-card p-5 shadow-sm"
          >
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </main>
  )
}
