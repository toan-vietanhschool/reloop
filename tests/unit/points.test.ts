import { describe, expect, it } from "vitest"

import {
  ECO_ACTION_KINDS,
  ECO_ACTION_LABELS_VI,
  POINTS,
} from "@/lib/points"

describe("eco-action constants", () => {
  it("has a point value defined for every action kind", () => {
    for (const kind of ECO_ACTION_KINDS) {
      expect(POINTS[kind]).toBeGreaterThan(0)
    }
  })

  it("has a Vietnamese label for every action kind", () => {
    for (const kind of ECO_ACTION_KINDS) {
      expect(ECO_ACTION_LABELS_VI[kind]).toBeTruthy()
    }
  })

  it("locks in the canonical point ladder (cheating-guard)", () => {
    // If anyone bumps these, they need to think about analytics, badge
    // thresholds, and the streak rule all together.
    expect(POINTS).toEqual({
      scan: 5,
      listing_create: 10,
      point_pin: 15,
      vote: 1,
      exchange_complete: 20,
    })
  })
})
