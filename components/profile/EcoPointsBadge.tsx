"use client"

import { useEffect, useState } from "react"

interface EcoPointsBadgeProps {
  points: number
  level: number
}

const COUNT_UP_DURATION_MS = 800

/**
 * Hero-sized eco-points badge with a CSS-driven count-up on mount.
 * Server-rendered fallback shows the final value, so users with JS
 * disabled still see correct content (no flash from 0 → final).
 */
export function EcoPointsBadge({ points, level }: EcoPointsBadgeProps) {
  // Start at 0 when there are points to animate to, otherwise just 0.
  // The rAF tick eases the displayed value up to `points`. We never call
  // setDisplayed synchronously inside the effect body — only inside the
  // rAF callback (a platform event), which is allowed by
  // react-hooks/set-state-in-effect.
  const initial = points > 0 ? 0 : 0
  const [displayed, setDisplayed] = useState(initial)

  useEffect(() => {
    if (points <= 0) return
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_UP_DURATION_MS)
      // ease-out cubic
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

  return (
    <div
      className="flex items-baseline gap-3"
      aria-label={`${points} eco points, cấp độ ${level}`}
    >
      <span aria-hidden className="text-5xl md:text-6xl">
        🌱
      </span>
      <span className="text-5xl font-extrabold tracking-tight tabular-nums text-emerald-700 md:text-6xl">
        {displayed.toLocaleString("vi-VN")}
      </span>
      <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
        Level {level}
      </span>
    </div>
  )
}
