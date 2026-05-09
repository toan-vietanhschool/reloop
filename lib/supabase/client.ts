import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/types/database.types"

const PLACEHOLDER_URL = "https://placeholder.supabase.co"
const PLACEHOLDER_KEY = "placeholder-anon-key"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? PLACEHOLDER_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PLACEHOLDER_KEY

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    if (typeof window !== "undefined") {
      // Browser runtime: log a clear warning so misconfigured deploys are
      // visible in dev tools. Real queries will fail loudly with the
      // placeholder URL — that's intentional.
      console.warn(
        "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL/ANON_KEY; client will fail on real queries",
      )
    }
  }

  return createBrowserClient<Database>(url, anonKey)
}
