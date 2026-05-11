import { describe, expect, it } from "vitest"

import {
  INTENT_OPTIONS,
  MATERIAL_META,
  MATERIAL_OPTIONS,
  getIntentDescription,
  getIntentLabel,
  getMaterialMeta,
} from "@/lib/material"

describe("getMaterialMeta", () => {
  it("returns the meta for a known material code", () => {
    expect(getMaterialMeta("PET").name_vi).toBe("Nhựa PET")
    expect(getMaterialMeta("BATTERY").icon).toBe("battery")
  })

  it("falls back to MIXED for an unknown code", () => {
    expect(getMaterialMeta("UNOBTAINIUM" as never)).toBe(MATERIAL_META.MIXED)
  })

  it("exposes all materials via MATERIAL_OPTIONS in the same order as MATERIAL_META keys", () => {
    expect(MATERIAL_OPTIONS).toHaveLength(Object.keys(MATERIAL_META).length)
  })
})

describe("intent labels", () => {
  it("returns the canonical label for each known intent", () => {
    expect(getIntentLabel("give")).toBe("Cho")
    expect(getIntentLabel("exchange")).toBe("Đổi")
    expect(getIntentLabel("sell_scrap")).toBe("Bán phế liệu")
    expect(getIntentLabel("seek")).toBe("Cần tìm")
  })

  it("returns the raw key as a fallback for unknown intents", () => {
    expect(getIntentLabel("rent" as never)).toBe("rent")
  })

  it("returns empty string description for unknown intents", () => {
    expect(getIntentDescription("rent" as never)).toBe("")
  })

  it("INTENT_OPTIONS includes a description for every option", () => {
    expect(INTENT_OPTIONS.length).toBeGreaterThanOrEqual(4)
    for (const option of INTENT_OPTIONS) {
      expect(option.description).toBeTruthy()
    }
  })
})
