import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

import type { Database } from "@/types/database.types"

interface CookieToSet {
  name: string
  value: string
  options?: CookieOptions
}

const PLACEHOLDER_URL = "https://placeholder.supabase.co"
const PLACEHOLDER_KEY = "placeholder-anon-key"

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? PLACEHOLDER_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PLACEHOLDER_KEY

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // Build/prerender or misconfigured runtime. Static prerender does not
    // execute any queries, so the placeholder is safe at build time. Real
    // requests will fail loudly with the placeholder URL.
    console.warn(
      "[supabase/server] Missing NEXT_PUBLIC_SUPABASE_URL/ANON_KEY; using placeholder",
    )
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component — middleware refreshes the session,
          // so this can be safely ignored here.
        }
      },
    },
  })
}
