import { Lock } from "lucide-react"

import { getUserBadges, type BadgeWithStatus } from "@/actions/badges"
import { cn } from "@/lib/utils"

interface BadgeGridProps {
  userId: string
}

/**
 * Server component — renders the 5 spec'd badges as a responsive grid.
 *
 * Design:
 *   - Unlocked: full-color tile, glow ring, mini timestamp, hover lift.
 *   - Locked: grayscale + lock chip + progress text underneath.
 *   - Tooltip via `title` exposes description + criteria for keyboard
 *     and pointer users alike.
 */
export async function BadgeGrid({ userId }: BadgeGridProps) {
  const badges = await getUserBadges(userId)
  const unlockedCount = badges.filter((b) => b.unlocked).length
  const ratio = badges.length === 0 ? 0 : unlockedCount / badges.length

  return (
    <section aria-label="Huy hiệu" className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Thành tựu
          </p>
          <h2 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
            Huy hiệu của bạn
          </h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold tabular-nums text-foreground">
            {unlockedCount}
            <span className="text-base font-semibold text-muted-foreground">
              /{badges.length}
            </span>
          </p>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            đã mở khóa
          </p>
        </div>
      </header>

      {/* Slim progress strip — visualises overall unlock rate. */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-100"
        role="progressbar"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tiến độ mở khóa huy hiệu"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-[width] duration-700"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>

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
    ? `${description}${awardedAt ? ` — Mở khóa ${formatAwardedDate(awardedAt)}` : ""}`
    : `${description}${progressLabel ? ` — ${progressLabel}` : ""}`

  return (
    <article
      title={tooltip}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-4 text-center shadow-sm ring-1 transition-all duration-300",
        unlocked
          ? "bg-gradient-to-br from-white via-emerald-50/80 to-sky-50/60 ring-emerald-300 hover:-translate-y-1 hover:shadow-soft-lg"
          : "bg-muted/40 ring-border/60",
      )}
    >
      {/* Glow halo for unlocked */}
      {unlocked && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 -z-0 rounded-full bg-emerald-300/30 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}

      <div className="relative flex flex-col items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "relative flex size-14 items-center justify-center rounded-2xl text-3xl transition-transform",
            unlocked
              ? "bg-emerald-100 ring-2 ring-emerald-300 group-hover:scale-110"
              : "bg-muted opacity-50 grayscale",
          )}
        >
          {icon}
          {!unlocked && (
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-foreground text-white shadow">
              <Lock className="size-2.5" aria-hidden />
            </span>
          )}
        </span>

        <h3
          className={cn(
            "text-sm font-bold leading-tight",
            unlocked ? "text-emerald-900" : "text-muted-foreground",
          )}
        >
          {name_vi}
        </h3>

        <p
          className={cn(
            "line-clamp-2 text-[11px] leading-snug",
            unlocked ? "text-emerald-900/70" : "text-muted-foreground",
          )}
        >
          {description}
        </p>

        {unlocked ? (
          <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            {awardedAt ? formatAwardedDate(awardedAt) : "Đã mở khóa"}
          </span>
        ) : progressLabel ? (
          <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {progressLabel}
          </span>
        ) : (
          <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Chưa đạt
          </span>
        )}
      </div>
    </article>
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
