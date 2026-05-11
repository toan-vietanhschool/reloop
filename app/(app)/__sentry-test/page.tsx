import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

import { SentryTestClient } from "./SentryTestClient"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

/**
 * Hidden Sentry sanity-check page.
 *
 * Admin-only. Used to verify that:
 *   1. Client-side errors reach Sentry (browser button below)
 *   2. Server actions errors reach Sentry (the server action it calls)
 *   3. Source maps resolve to readable stack frames
 *
 * NOT linked from any UI. Reach it manually at /__sentry-test.
 * Remove or keep gated before public demo. See docs/operations/SENTRY-SETUP.md.
 */
export const metadata = {
  title: "Sentry sanity check — ReLoop",
  robots: { index: false, follow: false },
}

export default async function SentryTestPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>()

  if (!profile || profile.role !== "admin") {
    notFound()
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-bold">Sentry sanity check</h1>
      <p className="text-sm text-muted-foreground">
        Admin-only diagnostic page. Triggers a controlled error so we can verify
        Sentry is wired up. Check the Sentry dashboard within ~30s after
        clicking each button.
      </p>
      <SentryTestClient />
    </main>
  )
}
