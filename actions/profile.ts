"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

/**
 * Sets the current user's school. The `code` is validated against the
 * `public.schools` reference table on the server before any write happens —
 * never trust client-side input. Empty string clears the field.
 *
 * Allowlist source-of-truth: `public.schools.code`. Any code that is not
 * present is rejected.
 *
 * Touches only the `school` column. Does not modify role / eco_points / level
 * — see security note in actions/auth.ts about user-controlled fields.
 */
export async function setSchool(
  code: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "unauthenticated" }
  }

  const trimmed = (code ?? "").trim()

  // Empty string => caller wants to clear school.
  if (trimmed.length === 0) {
    const { error } = await supabase
      .from("profiles")
      .update({ school: null } as never)
      .eq("id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }
    revalidatePath("/leaderboard")
    revalidatePath("/dashboard")
    revalidatePath("/profile")
    return { success: true }
  }

  // Hard length cap before DB hit — defense in depth.
  if (trimmed.length > 64) {
    return { success: false, error: "invalid_school" }
  }

  // Verify code exists in schools table — server-side allowlist check.
  // Cast through unknown to recover the row type (supabase/ssr 0.5.x narrows
  // .select() to `never` even with the Database generic supplied).
  const { data: rawSchool, error: lookupError } = await supabase
    .from("schools")
    .select("code")
    .eq("code", trimmed)
    .maybeSingle()

  if (lookupError) {
    return { success: false, error: lookupError.message }
  }
  const school = rawSchool as { code: string } | null
  if (!school) {
    return { success: false, error: "invalid_school" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ school: school.code } as never)
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/leaderboard")
  revalidatePath("/dashboard")
  revalidatePath("/profile")
  return { success: true }
}
