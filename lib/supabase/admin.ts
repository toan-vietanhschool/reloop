import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

/**
 * Admin client with service_role key. SERVER-ONLY.
 * Bypasses Row Level Security — use only inside trusted server actions
 * or route handlers, never in client components.
 *
 * Throws at construction time if env vars are missing. We deliberately do
 * NOT fall back to placeholder values for the service-role key: a silent
 * placeholder would let privileged calls execute against an unintended
 * target. Build-time prerender does not call `createAdminClient()`, so
 * tolerance is unnecessary here.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("admin client must be server-only")
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    )
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
