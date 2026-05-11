import { describe, expect, it } from "vitest"

import { constantTimeEqual } from "@/lib/timing-safe-compare"

describe("constantTimeEqual", () => {
  it("returns true for identical ASCII strings", () => {
    expect(constantTimeEqual("Bearer secret-token", "Bearer secret-token")).toBe(true)
  })

  it("returns false when the strings differ in content but match in length", () => {
    expect(constantTimeEqual("Bearer secret-tokeX", "Bearer secret-token")).toBe(false)
  })

  it("returns false when lengths differ (short vs long)", () => {
    expect(constantTimeEqual("short", "this-is-longer")).toBe(false)
  })

  it("returns true for two empty strings", () => {
    expect(constantTimeEqual("", "")).toBe(true)
  })

  it("returns false when only one side is empty", () => {
    expect(constantTimeEqual("", "x")).toBe(false)
    expect(constantTimeEqual("x", "")).toBe(false)
  })

  it("handles multi-byte unicode without throwing", () => {
    expect(constantTimeEqual("ngày", "ngày")).toBe(true)
    // Different code points, same byte length when both are 4 chars in
    // UTF-8 is not guaranteed — this case mostly exercises the
    // length-mismatch fast path on the Buffer byte length.
    expect(constantTimeEqual("ngày", "ngàx")).toBe(false)
  })
})
