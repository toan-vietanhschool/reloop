import { describe, expect, it } from "vitest"

import {
  buildAncestorPun,
  formatDecompositionRange,
  impactEmoji,
  YEARS_PER_GENERATION,
} from "@/lib/scan-display"

describe("impactEmoji", () => {
  it.each<[number, string]>([
    [1, "🌱"],
    [2, "🌱"],
    [3, "🌿"],
    [4, "🌿"],
    [5, "⚠️"],
    [6, "⚠️"],
    [7, "🚨"],
    [8, "🚨"],
    [9, "🔥"],
    [10, "🔥"],
  ])("score %i → %s", (score, expected) => {
    expect(impactEmoji(score)).toBe(expected)
  })
})

describe("formatDecompositionRange", () => {
  it("returns 'vĩnh viễn' when max is null", () => {
    expect(formatDecompositionRange(50, null)).toBe("vĩnh viễn")
  })

  it("returns 'Vài tháng' when both bounds are sub-year", () => {
    expect(formatDecompositionRange(0, 0.5)).toBe("Vài tháng")
  })

  it("returns a range when max > min and both ≥ 1 year", () => {
    expect(formatDecompositionRange(10, 1000)).toBe("10 – 1000 năm")
  })

  it("returns ~{min} năm when max equals min", () => {
    expect(formatDecompositionRange(450, 450)).toBe("~450 năm")
  })

  it("returns 'Vài tháng' when min < 1 and max == min", () => {
    expect(formatDecompositionRange(0, 0)).toBe("Vài tháng")
  })
})

describe("buildAncestorPun", () => {
  it("returns null below the 80-year floor", () => {
    expect(buildAncestorPun(50)).toBeNull()
    expect(buildAncestorPun(79)).toBeNull()
  })

  it("returns null when generations < 4", () => {
    // 80 / 25 = 3 generations → joke doesn't land.
    expect(buildAncestorPun(80)).toBeNull()
  })

  it("returns a 4-generation pun at 100 years", () => {
    expect(buildAncestorPun(100)).toBe("Sống lâu hơn ông cố bạn 4 đời 😱")
  })

  it("scales generations linearly with YEARS_PER_GENERATION", () => {
    const years = YEARS_PER_GENERATION * 18
    expect(buildAncestorPun(years)).toContain("18 đời")
  })
})
