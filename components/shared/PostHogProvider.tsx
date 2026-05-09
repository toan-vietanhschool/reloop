"use client"

import { Suspense, useEffect, type ReactNode } from "react"

import { identify, initPostHog, reset } from "@/lib/analytics"
import { createClient } from "@/lib/supabase/client"

import { PageviewTracker } from "./PageviewTracker"

interface PostHogProviderProps {
  children: ReactNode
}

/**
 * Mounts PostHog browser SDK and wires Supabase auth state into PostHog
 * `identify` / `reset` so user-level events coalesce on the supabase
 * `auth.users.id` distinctId.
 *
 * Safe to render in `app/layout.tsx`: when `NEXT_PUBLIC_POSTHOG_KEY` is
 * absent, all calls are no-ops (see `lib/analytics.ts`).
 */
export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initPostHog()

    let cancelled = false
    let unsubscribe: (() => void) | null = null

    try {
      const supabase = createClient()

      void supabase.auth.getUser().then(({ data }) => {
        if (cancelled) return
        const user = data.user
        if (user) {
          identify(user.id, {
            email: user.email ?? undefined,
          })
        }
      })

      const { data: sub } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "SIGNED_OUT" || !session) {
            reset()
            return
          }
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            const user = session.user
            identify(user.id, {
              email: user.email ?? undefined,
            })
          }
        },
      )
      unsubscribe = () => sub.subscription.unsubscribe()
    } catch {
      // Supabase env missing — analytics still mount, just no identify.
    }

    return () => {
      cancelled = true
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </>
  )
}
