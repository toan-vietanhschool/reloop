import { getUserBadges, type BadgeWithStatus } from "@/actions/badges"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BadgeGridProps {
  userId: string
}

/**
 * Server component — renders the 5 spec'd badges as a responsive grid
 * (2x3 mobile, 5x1 desktop). Locked cells fade to grayscale and show a
 * `current/target` progress pill where the rule supplies one. Unlocked
 * cells light up with the badge's accent color and surface the
 * award timestamp on hover (via `title`).
 */
export async function BadgeGrid({ userId }: BadgeGridProps) {
  const badges = await getUserBadges(userId)
  const unlockedCount = badges.filter((b) => b.unlocked).length

  return (
    <section aria-label="Huy hiệu" className="space-y-3">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Huy hiệu của bạn
        </h2>
        <p className="text-xs text-muted-foreground">
          {unlockedCount}/{badges.length} đã mở khóa
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {badges.map((badge) => (
          <BadgeCell key={badge.code} badge={badge} />
        ))}
      </div>
    </section>
  )
}

interface BadgeCellProps {
  badge: BadgeWithStatus
}

function BadgeCell({ badge }: BadgeCellProps) {
  const { unlocked, icon, name_vi, description, progressLabel, awardedAt } =
    badge

  const tooltip = unlocked
    ? awardedAt
      ? `Mở khóa ${formatAwardedDate(awardedAt)}`
      : "Đã mở khóa"
    : "Chưa đạt điều kiện"

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        unlocked
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white shadow-sm"
          : "border-border bg-muted/30",
      )}
      title={tooltip}
    >
      <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full text-3xl transition-all",
            unlocked
              ? "bg-emerald-100 ring-2 ring-emerald-200"
              : "bg-muted opacity-40 grayscale",
          )}
          aria-hidden
        >
          {icon}
        </span>
        <h3
          className={cn(
            "text-sm font-semibold leading-tight",
            unlocked ? "text-emerald-900" : "text-muted-foreground",
          )}
        >
          {name_vi}
        </h3>
        <p
          className={cn(
            "text-[11px] leading-snug",
            unlocked ? "text-emerald-700/80" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
        {!unlocked && progressLabel ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {progressLabel}
          </span>
        ) : null}
        {unlocked ? (
          <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
            Đã mở khóa
          </span>
        ) : null}
      </CardContent>
    </Card>
  )
}

function formatAwardedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return iso.slice(0, 10)
  }
}
