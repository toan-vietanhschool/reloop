/**
 * Pure route-pattern predicates used by `middleware.ts`. Extracted into
 * a standalone module so unit tests can exercise them without dragging
 * `next/server` (and its edge-runtime expectations) into jsdom.
 *
 * If you add a new route here, mirror the change in `app/` and update
 * the regex tests in `tests/unit/middleware-matchers.test.ts`.
 */

export const PROTECTED_PATTERNS: RegExp[] = [
  /^\/dashboard(\/.*)?$/,
  /^\/scan(\/.*)?$/,
  /^\/listings\/new$/,
  /^\/listings\/[^/]+\/edit$/,
  /^\/profile(\/.*)?$/,
  /^\/admin(\/.*)?$/,
]

/**
 * Routes where we additionally enforce `banned_at`. Excludes static,
 * auth, landing, and the /banned page itself so banned users can still
 * see why.
 */
export const APP_ROUTE_PATTERNS: RegExp[] = [
  /^\/dashboard(\/.*)?$/,
  /^\/scan(\/.*)?$/,
  /^\/listings(\/.*)?$/,
  /^\/profile(\/.*)?$/,
  /^\/admin(\/.*)?$/,
  /^\/leaderboard(\/.*)?$/,
  /^\/marketplace(\/.*)?$/,
]

export function isProtected(pathname: string): boolean {
  return PROTECTED_PATTERNS.some((re) => re.test(pathname))
}

export function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_PATTERNS.some((re) => re.test(pathname))
}
