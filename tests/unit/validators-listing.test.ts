import { describe, expect, it } from "vitest"

import {
  CreateListingSchema,
  UpdateListingSchema,
} from "@/lib/validators/listing"

describe("CreateListingSchema", () => {
  const baseInput = {
    title: "Chai PET sạch",
    intent: "give" as const,
    material_code: "PET" as const,
  }

  it("accepts a minimal valid input", () => {
    const result = CreateListingSchema.safeParse(baseInput)
    expect(result.success).toBe(true)
  })

  it("rejects a title shorter than 3 characters", () => {
    const result = CreateListingSchema.safeParse({ ...baseInput, title: "AB" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/ít nhất 3 ký tự/i)
    }
  })

  it("rejects a title longer than 120 characters", () => {
    const long = "x".repeat(121)
    const result = CreateListingSchema.safeParse({ ...baseInput, title: long })
    expect(result.success).toBe(false)
  })

  it("trims whitespace from the title before storing it", () => {
    const result = CreateListingSchema.safeParse({
      ...baseInput,
      title: "   Chai PET sạch   ",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.title).toBe("Chai PET sạch")
  })

  it("rejects a title that is only whitespace under the min check", () => {
    // After .trim(), '   ab   ' is 'ab' which fails min(3).
    expect(
      CreateListingSchema.safeParse({ ...baseInput, title: "   ab   " }).success,
    ).toBe(false)
  })

  it("accepts an empty description string", () => {
    const result = CreateListingSchema.safeParse({
      ...baseInput,
      description: "",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an invalid material code", () => {
    const result = CreateListingSchema.safeParse({
      ...baseInput,
      material_code: "PLATINUM",
    })
    expect(result.success).toBe(false)
  })

  it("rejects an out-of-range condition", () => {
    const result = CreateListingSchema.safeParse({
      ...baseInput,
      condition: 6,
    })
    expect(result.success).toBe(false)
  })

  it("coerces a numeric-string condition to number", () => {
    const result = CreateListingSchema.safeParse({
      ...baseInput,
      condition: "3",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.condition).toBe(3)
  })

  it("rejects each invalid listing intent", () => {
    for (const bad of ["loan", "auction", ""]) {
      const result = CreateListingSchema.safeParse({
        ...baseInput,
        intent: bad as never,
      })
      expect(result.success).toBe(false)
    }
  })
})

describe("UpdateListingSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(UpdateListingSchema.safeParse({}).success).toBe(true)
  })

  it("still enforces title length when present", () => {
    expect(UpdateListingSchema.safeParse({ title: "ab" }).success).toBe(false)
  })
})
