"use client"

import { ThumbsDown, ThumbsUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { getMyVote, voteCollectionPoint } from "@/actions/collection-points"
import { cn } from "@/lib/utils"
import type { VoteKind } from "@/lib/validators/collection-point"

interface VoteButtonsProps {
  pointId: string
  upvotes: number
  downvotes: number
  isLoggedIn: boolean
  /** Optional pre-fetched current-user vote — saves a round-trip on render. */
  initialVote?: VoteKind | null
}

export function VoteButtons({
  pointId,
  upvotes,
  downvotes,
  isLoggedIn,
  initialVote = null,
}: VoteButtonsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentVote, setCurrentVote] = useState<VoteKind | null>(initialVote)
  // Optimistic deltas relative to the prop counts — by storing a delta
  // rather than absolute counters, we avoid an effect to sync against
  // updated `upvotes` / `downvotes` props after a `router.refresh()`.
  const [pendingDelta, setPendingDelta] = useState<{
    up: number
    down: number
  }>({ up: 0, down: 0 })

  useEffect(() => {
    let cancelled = false
    if (!isLoggedIn || initialVote !== null) return
    void (async () => {
      const result = await getMyVote(pointId)
      if (!cancelled && !result.error) {
        setCurrentVote(result.data ?? null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pointId, isLoggedIn, initialVote])

  const optimisticUp = Math.max(0, upvotes + pendingDelta.up)
  const optimisticDown = Math.max(0, downvotes + pendingDelta.down)

  function computeDelta(
    previous: VoteKind | null,
    next: VoteKind,
  ): { up: number; down: number } {
    let up = 0
    let down = 0
    if (previous === next) return { up, down }
    if (previous === "up") up -= 1
    if (previous === "down") down -= 1
    if (next === "up") up += 1
    if (next === "down") down += 1
    return { up, down }
  }

  function handleVote(kind: VoteKind) {
    if (!isLoggedIn) {
      toast.error("Bạn cần đăng nhập để bình chọn.")
      return
    }
    if (isPending) return

    const previousVote = currentVote
    const previousDelta = pendingDelta
    const delta = computeDelta(previousVote, kind)

    setPendingDelta({
      up: previousDelta.up + delta.up,
      down: previousDelta.down + delta.down,
    })
    setCurrentVote(kind)

    startTransition(async () => {
      const result = await voteCollectionPoint(pointId, kind)
      if (result.error) {
        setCurrentVote(previousVote)
        setPendingDelta(previousDelta)
        toast.error("Không thể bình chọn", { description: result.error })
        return
      }
      setPendingDelta({ up: 0, down: 0 })
      router.refresh()
    })
  }

  const upActive = currentVote === "up"
  const downActive = currentVote === "down"

  return (
    <div className="flex items-center gap-2 border-t border-border/40 pt-2">
      <button
        type="button"
        onClick={() => handleVote("up")}
        disabled={!isLoggedIn || isPending}
        aria-label={upActive ? "Bỏ bình chọn ủng hộ" : "Bình chọn ủng hộ"}
        aria-pressed={upActive}
        className={cn(
          "inline-flex min-h-[26px] items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          upActive
            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
            : "border-border bg-background text-foreground/70 hover:border-emerald-300 hover:bg-emerald-50",
          (!isLoggedIn || isPending) && "cursor-not-allowed opacity-60",
        )}
      >
        <ThumbsUp className="size-3" aria-hidden />
        <span className="tabular-nums">{optimisticUp}</span>
      </button>
      <button
        type="button"
        onClick={() => handleVote("down")}
        disabled={!isLoggedIn || isPending}
        aria-label={downActive ? "Bỏ bình chọn không hữu ích" : "Bình chọn không hữu ích"}
        aria-pressed={downActive}
        className={cn(
          "inline-flex min-h-[26px] items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          downActive
            ? "border-rose-500 bg-rose-500 text-white shadow-sm"
            : "border-border bg-background text-foreground/70 hover:border-rose-300 hover:bg-rose-50",
          (!isLoggedIn || isPending) && "cursor-not-allowed opacity-60",
        )}
      >
        <ThumbsDown className="size-3" aria-hidden />
        <span className="tabular-nums">{optimisticDown}</span>
      </button>
      {!isLoggedIn && (
        <span className="text-[10px] italic text-muted-foreground">
          Đăng nhập để bình chọn
        </span>
      )}
    </div>
  )
}
