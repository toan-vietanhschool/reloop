import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const errorDescription = searchParams.get("error_description")

  if (errorDescription) {
    const failure = new URL("/auth/login", origin)
    failure.searchParams.set("error", errorDescription)
    return NextResponse.redirect(failure)
  }

  if (!code) {
    const failure = new URL("/auth/login", origin)
    failure.searchParams.set("error", "missing_code")
    return NextResponse.redirect(failure)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const failure = new URL("/auth/login", origin)
    failure.searchParams.set("error", error.message)
    return NextResponse.redirect(failure)
  }

  const redirectTarget = next.startsWith("/") ? next : "/dashboard"
  return NextResponse.redirect(new URL(redirectTarget, origin))
}
