"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

interface EcoPointsBadgeProps {
  points: number
  level: number
  /** Points awarded inside the current level. */
  pointsInLevel: number
  /** Threshold (in points) needed to reach the next level. */
  pointsPerLevel: number
}

const COUNT_UP_DURATION_MS = 800

/**
 * Hero eco-points badge — huge tabular number with an animated progress
 * ring around it. Replaces the prior inline 5xl number with a far more
 * intentional centerpiece (per B1 W2 brief: bigger, ring chart).
 *
 * The ring is rendered with raw SVG so it survives SSR. We start the
 * count-up at 0 and ease toward `points` on mount; users with reduced
 * motion get the final value immediately via the CSS guard.
 */
export function EcoPointsBadge({
  points,
  level,
  pointsInLevel,
  pointsPerLevel,
}: EcoPointsBadgeProps) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (points <= 0) {
      // No animation needed — `displayed` already starts at 0 and we
      // intentionally avoid calling setState inside the effect body to
      // satisfy `react-hooks/set-state-in-effect`. Either skipping
      // count-up or jumping straight to `points` happens via rAF below.
      return
    }
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    let frame = 0
    if (reduceMotion) {
      // Defer the jump-to-final write into a rAF tick so it counts as a
      // platform-event-driven setState, not a sync write inside the
      // effect body (rules of effects).
      frame = requestAnimationFrame(() => setDisplayed(points))
      return () => cancelAnimationFrame(frame)
    }

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_UP_DURATION_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(points * eased))
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setDisplayed(points)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [points])

  const ringSize = 240
  const ringStroke = 14
  const radius = (ringSize - ringStroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.min(1, Math.max(0, pointsInLevel / pointsPerLevel))
  const offset = circumference - ratio * circumference
  const remaining = Math.max(0, pointsPerLevel - pointsInLevel)

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
      <div
        className="relative"
        style={{ width: ringSize, height: ringSize }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="absolute inset-2 rounded-full bg-emerald-200/40 blur-2xl"
        />
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          aria-hidden
          className="relative"
        >
          <defs>
            <linearGradient id="eco-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(70% 0.18 160)" />
              <stop offset="100%" stopColor="oklch(70% 0.18 220)" />
            </linearGradient>
          </defs>
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="oklch(94% 0.02 160)"
            strokeWidth={ringStroke}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="url(#eco-ring-gradient)"
            strokeWidth={ringStroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            style={{
              transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </svg>

        {/* Central content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          aria-label={`${points} eco points, cấp độ ${level}`}
        >
          <span aria-hidden className="text-3xl float-slow">
            🌱
          </span>
          <span className="mt-1 text-6xl font-extrabold tabular-nums tracking-tight text-emerald-800 sm:text-7xl">
            {displayed.toLocaleString("vi-VN")}
          </span>
          <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Eco points
          </span>
        </div>

        {/* Floating level badge sits on the ring */}
        <span className="absolute -right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-800 shadow-soft-lg ring-2 ring-emerald-300">
          <Sparkles className="size-3" aria-hidden />
          Lv {level}
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-foreground/80">
        Còn{" "}
        <span className="font-bold text-emerald-700 tabular-nums">
          {remaining.toLocaleString("vi-VN")}
        </span>{" "}
        / {pointsPerLevel} pts để lên Level {level + 1}
      </p>
    </div>
  )
}
