import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton matching the shape of `<ResultCard>`. Shown for the
 * 2-3s the OpenAI Vision call typically takes.
 */
export function ScanResultSkeleton() {
  return (
    <Card className="mt-6 overflow-hidden">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="size-32 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-full rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          AI đang phân tích ảnh của bạn…
        </p>
      </CardContent>
    </Card>
  )
}
