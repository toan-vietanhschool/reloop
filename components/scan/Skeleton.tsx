import { Sparkles } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton matching the shape of `<ResultCard>`. Shown for the
 * 2-3s the OpenAI Vision call typically takes. Includes a pulsing
 * sparkle plus aria-live so screen readers announce the wait state.
 */
export function ScanResultSkeleton() {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="AI đang phân tích ảnh của bạn"
      className="overflow-hidden rounded-3xl border border-emerald-200/70 bg-card shadow-soft-lg"
    >
      <div className="relative isolate flex flex-col items-center justify-center gap-3 border-b border-border/60 bg-gradient-mesh px-6 py-8">
        <span
          aria-hidden
          className="float-slow inline-flex size-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-soft-lg"
        >
          <Sparkles className="size-6 sparkle-orbit" />
        </span>
        <p className="text-sm font-semibold tracking-tight text-emerald-900">
          AI đang phân tích ảnh của bạn…
        </p>
        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Thường mất 2–3 giây. Đừng tắt trang nhé!
        </p>
      </div>

      <div className="space-y-6 p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="size-32 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-border/50 bg-muted/30 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="space-y-2 rounded-xl border border-border/50 bg-muted/30 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-24 self-center rounded-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    </section>
  )
}
