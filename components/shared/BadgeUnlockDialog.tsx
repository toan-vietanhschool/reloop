"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface BadgeUnlockDialogProps {
  /** Current authenticated user — null disables the listener entirely. */
  userId: string | null
}

interface BadgeDetails {
  code: string
  name_vi: string
  description: string | null
  icon: string | null
}

interface UnlockedBadgeRow {
  badge_code: string
  awarded_at: string | null
}

/**
 * Client-side dialog that listens for new `user_badges` rows via
 * Supabase Realtime and pops a celebratory confetti card on unlock.
 *
 * Architectural notes:
 *   - Mounted from `app/(app)/layout.tsx`, so it lives behind the
 *     auth guard and is always present for logged-in users.
 *   - Confetti uses `canvas-confetti` (added to package.json deps).
 *     The package is dynamically imported on first unlock so it never
 *     ships in the initial bundle.
 *   - Realtime payload only includes the `user_badges` row — we then
 *     fetch the matching `badges` row to render name + icon.
 *   - Two CTAs: "Khoe lên Facebook" (sharer.php) + "Đóng".
 */
export function BadgeUnlockDialog({ userId }: BadgeUnlockDialogProps) {
  const [unlocked, setUnlocked] = useState<BadgeDetails | null>(null)
  const seenCodes = useRef<Set<string>>(new Set())

  const fetchBadgeMeta = useCallback(
    async (code: string): Promise<BadgeDetails | null> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("badges")
        .select("code, name_vi, description, icon")
        .eq("code", code)
        .maybeSingle<BadgeDetails>()
      if (error || !data) return null
      return data
    },
    [],
  )

  const fireConfetti = useCallback(async () => {
    try {
      const mod = await import("canvas-confetti")
      const confetti = mod.default
      const burst = (originX: number) => {
        confetti({
          particleCount: 80,
          spread: 70,
          startVelocity: 45,
          origin: { x: originX, y: 0.4 },
          colors: ["#10b981", "#0ea5e9", "#f59e0b", "#ec4899"],
        })
      }
      burst(0.25)
      burst(0.75)
      window.setTimeout(() => burst(0.5), 200)
    } catch {
      // Confetti is decoration — silently skip if the dynamic import fails.
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`user_badges:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_badges",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const row = payload.new as Partial<UnlockedBadgeRow>
          const code = row.badge_code
          if (typeof code !== "string" || code.length === 0) return
          if (seenCodes.current.has(code)) return
          seenCodes.current.add(code)

          const meta = await fetchBadgeMeta(code)
          if (!meta) return

          setUnlocked(meta)
          void fireConfetti()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, fetchBadgeMeta, fireConfetti])

  if (!unlocked) return null

  return (
    <UnlockDialogBody
      badge={unlocked}
      onClose={() => setUnlocked(null)}
    />
  )
}

interface UnlockDialogBodyProps {
  badge: BadgeDetails
  onClose: () => void
}

function UnlockDialogBody({ badge, onClose }: UnlockDialogBodyProps) {
  const headingId = `badge-unlock-${badge.code}`

  // Close on Escape — symmetric with PinPointDialog.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  function handleShareFacebook() {
    if (typeof window === "undefined") return
    const shareUrl = `${window.location.origin}/?badge=${encodeURIComponent(
      badge.code,
    )}`
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl,
    )}&quote=${encodeURIComponent(
      `Tôi vừa mở khóa huy hiệu "${badge.name_vi}" trên ReLoop! 🌱`,
    )}`
    window.open(fbUrl, "_blank", "noopener,noreferrer,width=640,height=560")
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <button
        type="button"
        aria-label="Đóng hộp thoại"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-2xl">
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 px-6 py-8 text-center text-white">
          <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-90">
            Huy hiệu mới
          </p>
          <span
            className="mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl ring-4 ring-white/30"
            aria-hidden
          >
            {badge.icon ?? "🏆"}
          </span>
          <h2
            id={headingId}
            className="mt-4 text-2xl font-bold leading-tight"
          >
            {badge.name_vi}
          </h2>
          {badge.description ? (
            <p className="mt-2 text-sm opacity-90">{badge.description}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 p-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="sm:order-1"
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={handleShareFacebook}
            className="sm:order-2"
          >
            Khoe lên Facebook
          </Button>
        </div>
      </div>
    </div>
  )
}
