import { describe, expect, it } from "vitest"

import {
  POINT_TYPES,
  colorForType,
  iconForPointType,
  pointTypeLabelVi,
} from "@/lib/map-utils"

describe("pointTypeLabelVi", () => {
  it("returns a non-empty Vietnamese label for every known point type", () => {
    for (const t of POINT_TYPES) {
      const label = pointTypeLabelVi(t)
      expect(label).toBeTruthy()
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it("returns 'Khác' for an unrecognised type (default branch)", () => {
    // The exported type allows only known enum values, so we force an
    // unknown one to exercise the default fallback.
    expect(pointTypeLabelVi("unknown" as never)).toBe("Khác")
  })
})

describe("colorForType", () => {
  it("returns a 7-char hex color for every known type", () => {
    for (const t of POINT_TYPES) {
      expect(colorForType(t)).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })

  it("uses the same fallback colour as 'other' for unknown types", () => {
    expect(colorForType("unknown" as never)).toBe(colorForType("other"))
  })
})

describe("iconForPointType", () => {
  it("maps every known type to a non-empty Lucide name", () => {
    for (const t of POINT_TYPES) {
      const icon = iconForPointType(t)
      expect(icon).toBeTruthy()
      expect(icon).toMatch(/^[A-Z][a-zA-Z0-9]+$/)
    }
  })

  it("falls back to MapPin for unknown types", () => {
    expect(iconForPointType("unknown" as never)).toBe("MapPin")
  })
})
