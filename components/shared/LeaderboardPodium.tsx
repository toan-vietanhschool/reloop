import Image from "next/image"
import { Crown, Medal, Sparkles } from "lucide-react"

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

interface RankStyle {
  height: string
  gradient: string
  border: string
  badge: string
  label: string
  glow: string
  IconComponent: typeof Crown | typeof Medal
  iconColor: string
}

const RANK_STYLES: Record<1 | 2 | 3, RankStyle> = {
  1: {
    // Tallest column, gold gradient + crown icon
    height: "md:h-[22rem]",
    gradient: "from-amber-200 via-yellow-100 to-amber-50",
    border: "border-amber-400/70",
    badge: "bg-amber-400 text-amber-950",
    label: "Quán quân",
    glow: "shadow-[0_24px_60px_-20px_oklch(75%_0.16_85_/_0.55)]",
    IconComponent: Crown,
    iconColor: "text-amber-500",
  },
  2: {
    height: "md:h-[19rem]",
    gradient: "from-slate-200 via-slate-100 to-slate-50",
    border: "border-slate-300",
    badge: "bg-slate-400 text-slate-50",
    label: "Á quân",
    glow: "shadow-soft-lg",
    IconComponent: Medal,
    iconColor: "text-slate-500",
  },
  3: {
    height: "md:h-[16.5rem]",
    gradient: "from-orange-200 via-orange-100 to-orange-50",
    border: "border-orange-300/80",
    badge: "bg-orange-400 text-orange-950",
    label: "Hạng ba",
    glow: "shadow-soft-lg",
    IconComponent: Medal,
    iconColor: "text-orange-600",
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
  const isChampion = rank === 1

  if (!entry) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-end rounded-3xl border border-dashed border-foreground/15 bg-muted/30 p-5 text-center",
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

  const Icon = style.IconComponent

  return (
    <article
      className={cn(
        "group relative flex flex-col items-center rounded-3xl border bg-gradient-to-b p-5 text-center transition duration-300 hover:-translate-y-1",
        style.gradient,
        style.border,
        style.height,
        style.glow,
      )}
    >
      {/* Sparkles behind champion */}
      {isChampion ? (
        <>
          <Sparkles
            aria-hidden
            className="sparkle-orbit absolute -left-2 top-6 h-4 w-4 text-amber-400"
          />
          <Sparkles
            aria-hidden
            className="sparkle-orbit absolute -right-1 top-12 h-3 w-3 text-yellow-500"
            style={{ animationDelay: "0.6s" }}
          />
          <Sparkles
            aria-hidden
            className="sparkle-orbit absolute right-6 top-2 h-3 w-3 text-amber-300"
            style={{ animationDelay: "1.2s" }}
          />
        </>
      ) : null}

      {/* Rank badge */}
      <span
        className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow",
          style.badge,
        )}
      >
        #{rank} · {style.label}
      </span>

      {/* Crown / medal icon */}
      <div
        className={cn(
          "mt-3 grid h-12 w-12 place-items-center",
          isChampion ? "float-slow" : "",
        )}
        aria-hidden
      >
        <Icon className={cn("h-9 w-9", style.iconColor)} strokeWidth={2} />
      </div>

      {/* Avatar */}
      <div
        className={cn(
          "mt-2 flex items-center justify-center overflow-hidden rounded-full border-2 border-white bg-emerald-100 font-bold text-emerald-800 shadow",
          isChampion ? "h-24 w-24 text-2xl" : "h-20 w-20 text-xl",
        )}
      >
        {entry.avatar_url ? (
          <Image
            src={entry.avatar_url}
            alt=""
            width={isChampion ? 96 : 80}
            height={isChampion ? 96 : 80}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(entry.display_name)
        )}
      </div>

      <p className="mt-3 line-clamp-1 font-display text-base font-semibold text-foreground md:text-lg">
        {entry.display_name}
      </p>

      {schoolName ? (
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {schoolName}
        </p>
      ) : null}

      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1 font-bold tabular-nums text-emerald-700",
          isChampion ? "text-xl" : "text-lg",
        )}
        aria-label={`${entry.eco_points} eco points`}
      >
        <span aria-hidden>🌱</span>
        <span>{entry.eco_points.toLocaleString("vi-VN")}</span>
      </p>

      <p className="mt-0.5 text-xs text-muted-foreground">Cấp {entry.level}</p>
    </article>
  )
}

export function LeaderboardPodium({ top3, schoolNames }: LeaderboardPodiumProps) {
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
        <PodiumCard entry={first} rank={1} schoolName={schoolNameOf(first)} />
      </div>
      <div className="md:order-1">
        <PodiumCard entry={second} rank={2} schoolName={schoolNameOf(second)} />
      </div>
      <div className="md:order-3">
        <PodiumCard entry={third} rank={3} schoolName={schoolNameOf(third)} />
      </div>
    </section>
  )
}
