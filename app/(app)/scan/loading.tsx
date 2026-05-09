import { Skeleton } from "@/components/ui/skeleton"

/**
 * Scan page loading state. Mirrors the upload card + result card layout.
 */
export default function ScanLoading() {
  return (
    <main
      aria-label="Đang tải Scan"
      aria-busy
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10 md:px-10"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-foreground/8 bg-card p-6 shadow-sm">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-foreground/8 bg-eco-bg-soft p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </main>
  )
}
