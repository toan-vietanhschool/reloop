import Image from "next/image"

import { cn } from "@/lib/utils"

export interface LeaderboardEntry {
  id: string
  display_name: string
  avatar_url: string | null
  eco_points: number
  level: number
  school: string | null
}

interface LeaderboardPodiumProps {
  /** Sorted desc by eco_points. May contain 1–3 entries. */
  top3: ReadonlyArray<LeaderboardEntry>
  /** Maps schools.code → name_vi, used to render the school subtitle. */
  schoolNames: Readonly<Record<string, string>>
}

interface PodiumCardProps {
  entry: LeaderboardEntry | null
  rank: 1 | 2 | 3
  schoolName: string | null
}

const RANK_STYLES: Record<
  1 | 2 | 3,
  {
    height: string
    gradient: string
    border: string
    badge: string
    medal: string
    label: string
  }
> = {
  1: {
    // Tallest column, gold gradient + crown emoji.
    height: "md:h-72",
    gradient: "from-amber-200 via-yellow-100 to-amber-50",
    border: "border-amber-400/70",
    badge: "bg-amber-400 text-amber-950",
    medal: "🏆",
    label: "Quán quân",
  },
  2: {
    height: "md:h-60",
    gradient: "from-zinc-200 via-zinc-100 to-zinc-50",
    border: "border-zinc-300",
    badge: "bg-zinc-300 text-zinc-800",
    medal: "🥈",
    label: "Á quân",
  },
  3: {
    height: "md:h-52",
    gradient: "from-orange-200 via-orange-100 to-orange-50",
    border: "border-orange-300/80",
    badge: "bg-orange-400 text-orange-950",
    medal: "🥉",
    label: "Hạng ba",
  },
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?"
}

function PodiumCard({ entry, rank, schoolName }: PodiumCardProps) {
  const style = RANK_STYLES[rank]

  if (!entry) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-end rounded-2xl border border-dashed border-foreground/15 bg-muted/30 p-5 text-center",
          style.height,
        )}
        aria-hidden
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-foreground/10 bg-background text-2xl text-muted-foreground">
          —
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Chưa có hạng {rank}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center rounded-2xl border bg-gradient-to-b p-5 text-center shadow-sm",
        style.gradient,
        style.border,
        style.height,
      )}
    >
      <span
        className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow",
          style.badge,
        )}
      >
        #{rank} · {style.label}
      </span>

      <div className="mt-3 text-3xl" aria-hidden>
        {style.medal}
      </div>

      <div className="mt-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-emerald-100 text-xl font-bold text-emerald-800 shadow">
        {entry.avatar_url ? (
          <Image
            src={entry.avatar_url}
            alt=""
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(entry.display_name)
        )}
      </div>

      <p className="mt-3 line-clamp-1 font-display text-base font-semibold text-foreground">
        {entry.display_name}
      </p>

      {schoolName ? (
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {schoolName}
        </p>
      ) : null}

      <p
        className="mt-2 inline-flex items-center gap-1 text-lg font-bold text-emerald-700"
        aria-label={`${entry.eco_points} eco points`}
      >
        <span aria-hidden>🌱</span>
        <span>{entry.eco_points.toLocaleString("vi-VN")}</span>
      </p>

      <p className="mt-0.5 text-xs text-muted-foreground">Cấp {entry.level}</p>
    </div>
  )
}

export function LeaderboardPodium({ top3, schoolNames }: LeaderboardPodiumProps) {
  // Order for visual layout: silver - gold - bronze (centered). Mobile: stacked
  // 1, 2, 3 vertically in eco_points order.
  const first = top3[0] ?? null
  const second = top3[1] ?? null
  const third = top3[2] ?? null

  const schoolNameOf = (entry: LeaderboardEntry | null): string | null => {
    if (!entry?.school) return null
    return schoolNames[entry.school] ?? null
  }

  return (
    <section
      aria-label="Top 3"
      className="grid grid-cols-1 items-end gap-4 md:grid-cols-3 md:gap-5"
    >
      {/* Mobile order: 1, 2, 3 */}
      {/* Desktop order: 2, 1, 3 (silver - gold center - bronze) */}
      <div className="md:order-2">
        <PodiumCard
          entry={first}
          rank={1}
          schoolName={schoolNameOf(first)}
        />
      </div>
      <div className="md:order-1">
        <PodiumCard
          entry={second}
          rank={2}
          schoolName={schoolNameOf(second)}
        />
      </div>
      <div className="md:order-3">
        <PodiumCard
          entry={third}
          rank={3}
          schoolName={schoolNameOf(third)}
        />
      </div>
    </section>
  )
}
