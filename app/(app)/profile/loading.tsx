import { Skeleton } from "@/components/ui/skeleton"

/**
 * Profile page loading state. Avatar + stats + activity feed shapes.
 */
export default function ProfileLoading() {
  return (
    <main
      aria-label="Đang tải hồ sơ"
      aria-busy
      className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 md:px-10"
    >
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded-2xl border border-foreground/8 bg-card p-5 shadow-sm"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 4 }, (_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 rounded-2xl border border-foreground/8 bg-card p-4"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        ))}
      </section>
    </main>
  )
}
