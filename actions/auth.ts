"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

const PROFILE_WRITE_WHITELIST = [
  "display_name",
  "avatar_url",
  "bio",
  "city",
] as const satisfies readonly (keyof ProfileUpdate)[]
type ProfileWriteField = (typeof PROFILE_WRITE_WHITELIST)[number]
type ProfileWriteInput = Pick<ProfileUpdate, ProfileWriteField>

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    return null
  }
  return data
}

/**
 * Updates the current user's profile. Hard-whitelists writable fields so
 * users can never escalate `role` or tamper with `eco_points` / `level`
 * via this server action. (See SQL-AUDIT M-4: profiles.role self-update is
 * still permitted at the policy layer until T1-07 lands.)
 */
export async function updateProfile(
  input: ProfileWriteInput,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "unauthenticated" }
  }

  const safe: ProfileWriteInput = {}
  for (const field of PROFILE_WRITE_WHITELIST) {
    if (field in input && input[field] !== undefined) {
      // Whitelisted assignment by exact key — never accepts `role`,
      // `eco_points`, `level`, etc. from caller payload.
      ;(safe as Record<ProfileWriteField, unknown>)[field] = input[field]
    }
  }

  if (Object.keys(safe).length === 0) {
    return { success: false, error: "no_fields" }
  }

  // Cast through unknown — supabase's `update` generic narrows to `never`
  // for some `RejectExcessProperties` paths under TS strict mode. The
  // whitelist above is the actual safety boundary.
  const { error } = await supabase
    .from("profiles")
    .update(safe as never)
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/profile", "layout")
  return { success: true }
}
