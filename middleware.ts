import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

import type { Database } from "@/types/database.types"

interface CookieToSet {
  name: string
  value: string
  options?: CookieOptions
}

const PROTECTED_PATTERNS: RegExp[] = [
  /^\/dashboard(\/.*)?$/,
  /^\/scan(\/.*)?$/,
  /^\/listings\/new$/,
  /^\/listings\/[^/]+\/edit$/,
  /^\/profile(\/.*)?$/,
  /^\/admin(\/.*)?$/,
]

// Routes where we additionally enforce banned_at. Excludes static, auth,
// landing, and the /banned page itself so banned users can still see why.
const APP_ROUTE_PATTERNS: RegExp[] = [
  /^\/dashboard(\/.*)?$/,
  /^\/scan(\/.*)?$/,
  /^\/listings(\/.*)?$/,
  /^\/profile(\/.*)?$/,
  /^\/admin(\/.*)?$/,
  /^\/leaderboard(\/.*)?$/,
  /^\/marketplace(\/.*)?$/,
]

function isProtected(pathname: string): boolean {
  return PROTECTED_PATTERNS.some((re) => re.test(pathname))
}

function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_PATTERNS.some((re) => re.test(pathname))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // Fail open in dev if env not loaded; route guards still work server-side.
    return response
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Banned-user enforcement: only on app routes (skip static/landing/auth/
  // /banned itself) to avoid an extra DB hit on every asset request.
  if (user && isAppRoute(pathname) && pathname !== "/banned") {
    const { data } = await supabase
      .from("profiles")
      .select("banned_at")
      .eq("id", user.id)
      .maybeSingle()

    const profile = data as { banned_at: string | null } | null
    if (profile?.banned_at) {
      const bannedUrl = request.nextUrl.clone()
      bannedUrl.pathname = "/banned"
      bannedUrl.search = ""
      return NextResponse.redirect(bannedUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (build assets)
     * - _next/image (image optimizer)
     * - favicon.ico
     * - public image extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
}
