import { describe, expect, it } from "vitest"

import { PinPointSchema } from "@/lib/validators/collection-point"

const base = {
  name: "Vựa Anh Tám",
  type: "scrap_dealer" as const,
  accepts: ["PET", "HDPE"] as const,
  lat: 10.7769,
  lng: 106.7009,
}

describe("PinPointSchema", () => {
  it("accepts a minimal valid pin", () => {
    expect(PinPointSchema.safeParse(base).success).toBe(true)
  })

  it("rejects a name shorter than 3 characters", () => {
    expect(PinPointSchema.safeParse({ ...base, name: "ab" }).success).toBe(false)
  })

  it("requires at least one accepted material", () => {
    expect(PinPointSchema.safeParse({ ...base, accepts: [] }).success).toBe(false)
  })

  it("rejects more than 16 accepted materials", () => {
    const accepts = Array.from({ length: 17 }).fill("PET") as never[]
    expect(PinPointSchema.safeParse({ ...base, accepts }).success).toBe(false)
  })

  it("rejects latitudes outside WGS-84", () => {
    expect(PinPointSchema.safeParse({ ...base, lat: 95 }).success).toBe(false)
    expect(PinPointSchema.safeParse({ ...base, lat: -91 }).success).toBe(false)
  })

  it("rejects longitudes outside WGS-84", () => {
    expect(PinPointSchema.safeParse({ ...base, lng: 200 }).success).toBe(false)
    expect(PinPointSchema.safeParse({ ...base, lng: -181 }).success).toBe(false)
  })

  it("accepts an empty phone (coerces to undefined)", () => {
    const result = PinPointSchema.safeParse({ ...base, phone: "" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.phone).toBeUndefined()
  })

  it("accepts a VN-style phone number", () => {
    const result = PinPointSchema.safeParse({ ...base, phone: "0901 234 567" })
    expect(result.success).toBe(true)
  })

  it("accepts an international phone number with +", () => {
    const result = PinPointSchema.safeParse({ ...base, phone: "+84 901-234-567" })
    expect(result.success).toBe(true)
  })

  it("rejects a phone that contains letters", () => {
    expect(
      PinPointSchema.safeParse({ ...base, phone: "0901-call-me" }).success,
    ).toBe(false)
  })

  it("rejects an invalid point type", () => {
    expect(
      PinPointSchema.safeParse({ ...base, type: "junkyard" as never }).success,
    ).toBe(false)
  })
})
