"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { track } from "@/lib/analytics"

/**
 * Captures `$pageview` on every Next.js App Router navigation. We do
 * this manually instead of relying on PostHog's automatic SPA pageview
 * detection because:
 *
 *   1. App Router intercepts pushState, so PostHog's heuristic fires
 *      twice on RSC navigations.
 *   2. We want to attach `path` + `search` consistently as event
 *      properties for downstream funnels.
 */
export function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const search = searchParams?.toString() ?? ""
    const url = search ? `${pathname}?${search}` : pathname
    track("$pageview", {
      path: pathname,
      search: search || undefined,
      url,
    })
  }, [pathname, searchParams])

  return null
}
