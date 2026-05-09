"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { optIn, optOut } from "@/lib/analytics"

const STORAGE_KEY = "posthog_consent"

type ConsentValue = "true" | "false" | null

function readConsent(): ConsentValue {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === "true" || raw === "false") return raw
    return null
  } catch {
    return null
  }
}

function writeConsent(value: "true" | "false"): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // private mode / quota exceeded — silent
  }
}

/**
 * useSyncExternalStore subscriber — re-renders when another tab writes
 * `posthog_consent` via the `storage` event. We don't bother polling.
 */
function subscribeStorage(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

/**
 * EU-style cookie consent banner. Defaults to "asking" — PostHog is
 * still loaded (so we can opt in immediately), but capture is paused
 * via `optOut()` until the user accepts.
 *
 * Vietnamese copy on purpose — UI lives in vi-VN.
 */
export function CookieBanner() {
  // Read storage via useSyncExternalStore so we don't trigger the
  // "setState inside useEffect" cascading-render lint rule. SSR snapshot
  // returns null (no banner pre-hydration), client snapshot reads
  // localStorage synchronously during render.
  const stored = useSyncExternalStore<ConsentValue>(
    subscribeStorage,
    readConsent,
    () => null,
  )
  const [override, setOverride] = useState<ConsentValue>(null)
  const decision = override ?? stored

  // Apply opt-in / opt-out side effects whenever the resolved decision
  // changes. This is a legitimate effect target (external system).
  useEffect(() => {
    if (decision === "true") {
      optIn()
    } else {
      // No prior decision OR explicit decline → keep capture paused.
      optOut()
    }
  }, [decision])

  if (decision !== null) return null

  const handleAccept = () => {
    writeConsent("true")
    setOverride("true")
  }

  const handleDecline = () => {
    writeConsent("false")
    setOverride("false")
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-3xl px-4 pb-4 sm:px-6"
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="text-sm leading-relaxed text-slate-700">
          <p
            id="cookie-banner-title"
            className="font-semibold text-slate-900"
          >
            Đôi điều về cookie
          </p>
          <p className="mt-1">
            Chúng tôi dùng PostHog để phân tích cách bạn sử dụng ReLoop và
            cải thiện trải nghiệm. Không bán dữ liệu, không quảng cáo.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleDecline}
          >
            Từ chối
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            onClick={handleAccept}
          >
            Đồng ý
          </Button>
        </div>
      </div>
    </div>
  )
}
