import { describe, expect, it } from "vitest"

import { isAppRoute, isProtected } from "@/lib/route-matchers"

describe("isProtected", () => {
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/anything",
    "/scan",
    "/scan/result/abc",
    "/listings/new",
    "/listings/abc-123/edit",
    "/profile",
    "/profile/edit",
    "/admin",
    "/admin/users",
    "/admin/points",
  ]

  for (const path of protectedRoutes) {
    it(`flags ${path} as protected`, () => {
      expect(isProtected(path)).toBe(true)
    })
  }

  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/callback",
    "/listings",
    "/listings/abc",
    "/leaderboard",
    "/marketing",
    "/banned",
  ]

  for (const path of publicRoutes) {
    it(`leaves ${path} unprotected`, () => {
      expect(isProtected(path)).toBe(false)
    })
  }
})

describe("isAppRoute", () => {
  it("matches /listings (banned-user enforcement applies to read pages too)", () => {
    expect(isAppRoute("/listings")).toBe(true)
    expect(isAppRoute("/listings/abc")).toBe(true)
  })

  it("matches /leaderboard and /marketplace as app routes", () => {
    expect(isAppRoute("/leaderboard")).toBe(true)
    expect(isAppRoute("/marketplace")).toBe(true)
  })

  it("does NOT match landing, auth, or /banned", () => {
    expect(isAppRoute("/")).toBe(false)
    expect(isAppRoute("/auth/login")).toBe(false)
    expect(isAppRoute("/banned")).toBe(false)
  })
})
