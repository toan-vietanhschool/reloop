"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface StatBlockProps {
  /** Display value, e.g. "1,800,000" or "27%". Used as fallback if `numericValue` is omitted. */
  value: string
  label: string
  emphasis?: "green" | "blue" | "danger"
  /** When provided, the component animates from 0 to this number on viewport intersection. */
  numericValue?: number
  /** Suffix appended to the animated number (e.g. " tấn", "%"). */
  suffix?: string
}

const emphasisClasses: Record<NonNullable<StatBlockProps["emphasis"]>, string> = {
  green: "text-lime-deep",
  blue: "text-navy-light",
  danger: "text-destructive",
}

const ANIMATION_DURATION_MS = 1400

function formatNumber(value: number): string {
  return value.toLocaleString("vi-VN")
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Big editorial stat. Animates count-up when scrolled into view (skipped if
 * `prefers-reduced-motion: reduce`). Falls back to the static `value` string
 * if no `numericValue` is provided.
 */
export function StatBlock({
  value,
  label,
  emphasis = "green",
  numericValue,
  suffix = "",
}: StatBlockProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  // Stable initial display: zeroed for animated stats, or the literal `value`.
  const initialDisplay = useMemo<string>(
    () => (typeof numericValue === "number" ? `0${suffix}` : value),
    [numericValue, suffix, value],
  )
  const [display, setDisplay] = useState<string>(initialDisplay)

  useEffect(() => {
    if (typeof numericValue !== "number") {
      // Static value path — initial state already mirrors `value`.
      return
    }
    const node = ref.current
    if (!node) return

    let rafId = 0
    const finalDisplay = `${formatNumber(numericValue)}${suffix}`

    const animate = (): void => {
      const start = performance.now()
      const tick = (now: number): void => {
        const elapsed = now - start
        const progress = Math.min(1, elapsed / ANIMATION_DURATION_MS)
        // ease-out-cubic for a graceful settle
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.round(numericValue * eased)
        setDisplay(`${formatNumber(current)}${suffix}`)
        if (progress < 1) {
          rafId = requestAnimationFrame(tick)
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    if (prefersReducedMotion()) {
      // Defer the state write out of the effect body to satisfy the
      // react-hooks/set-state-in-effect lint rule and avoid cascading renders.
      rafId = requestAnimationFrame(() => setDisplay(finalDisplay))
      return () => cancelAnimationFrame(rafId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          observer.disconnect()
          animate()
        })
      },
      { threshold: 0.3 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      if (rafId !== 0) cancelAnimationFrame(rafId)
    }
  }, [numericValue, suffix])

  return (
    <div
      ref={ref}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-7 text-left shadow-card transition hover:border-lime/30 hover:shadow-card-hover md:p-9"
    >
      {/* Subtle accent corner */}
      <div
        aria-hidden
        className={cn(
          "absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 transition group-hover:opacity-20",
          emphasis === "danger"
            ? "bg-destructive"
            : emphasis === "blue"
              ? "bg-brand-blue"
              : "bg-brand-green",
        )}
      />
      <span
        className={cn(
          "font-display text-[clamp(2.75rem,5vw,5rem)] font-extrabold leading-none tracking-tight tabular-nums",
          emphasisClasses[emphasis],
        )}
      >
        {display}
      </span>
      <span className="text-pretty text-base leading-snug text-foreground/80 md:text-lg">
        {label}
      </span>
    </div>
  )
}
