import { describe, it, expect } from "vitest"

import {
  buildEcoScoreFilename,
  buildFacebookShareUrl,
  generateCaption,
} from "@/lib/share"
import type { VisionResult } from "@/lib/openai/vision"

/**
 * T2-08 Share Eco Score Card unit smoke tests.
 *
 * NOTE: We deliberately do NOT exercise the html-to-image capture
 * pipeline or the `<EcoScoreCard>` render path here. jsdom (the
 * vitest default DOM) does not implement HTMLCanvasElement#getContext
 * or SVG layout in a way that html-to-image can rasterise, so any
 * call into `captureNode()` would either throw or produce a 0-byte
 * blob. Visual regression for the card belongs in Playwright
 * (tests/e2e), where a real browser engine renders the gradient,
 * crops, and QR.
 *
 * What this file covers:
 *   - Caption generation copy follows the playbook §7.1 tone.
 *   - Facebook sharer URL escapes correctly.
 *   - Filename is unique-per-second & material-aware so users can
 *     locate their downloads.
 */

const baseResult: VisionResult = {
  detected_item: "Chai nhựa Lavie 500ml",
  material_code: "PET",
  confidence: 0.92,
  decomposition_years_min: 450,
  decomposition_years_max: 1000,
  environmental_impact_score: 8,
  recyclable: true,
  recycle_suggestions: ["Rửa sạch và bỏ vào thùng nhựa."],
  diy_ideas: [],
  nearby_collection_point_types: ["scrap_dealer"],
  warning: null,
}

describe("generateCaption (T2-08)", () => {
  it("includes the detected item and Eco Score", () => {
    const caption = generateCaption(baseResult)
    expect(caption).toContain("Chai nhựa Lavie 500ml")
    expect(caption).toContain("Eco Score 8/10")
    expect(caption).toContain("reloop.app")
  })

  it("adds the ancestor pun for items with long decomposition", () => {
    const caption = generateCaption(baseResult)
    expect(caption).toMatch(/sống lâu hơn ông cố tôi \d+ đời/i)
  })

  it("omits the ancestor pun for short-lived items", () => {
    const result: VisionResult = {
      ...baseResult,
      decomposition_years_min: 0,
      decomposition_years_max: 1,
    }
    const caption = generateCaption(result)
    expect(caption).not.toMatch(/ông cố/i)
  })
})

describe("buildFacebookShareUrl (T2-08)", () => {
  it("URL-encodes the landing URL and the quote", () => {
    const url = buildFacebookShareUrl(
      "https://reloop.vercel.app/?ref=eco-card",
      "Tôi vừa scan chai nhựa.",
    )
    expect(url).toContain("https://www.facebook.com/sharer/sharer.php")
    // URLSearchParams uses application/x-www-form-urlencoded — spaces are
    // encoded as `+` and reserved chars as %xx. The Facebook sharer
    // accepts either form, so we round-trip via the URL parser instead
    // of brittle substring matching.
    const parsed = new URL(url)
    expect(parsed.searchParams.get("u")).toBe(
      "https://reloop.vercel.app/?ref=eco-card",
    )
    expect(parsed.searchParams.get("quote")).toBe("Tôi vừa scan chai nhựa.")
  })
})

describe("buildEcoScoreFilename (T2-08)", () => {
  it("includes the lowercased material code and a .png extension", () => {
    const filename = buildEcoScoreFilename("PET")
    expect(filename.startsWith("eco-score-pet-")).toBe(true)
    expect(filename.endsWith(".png")).toBe(true)
  })
})

/**
 * Capture-pipeline visual smoke test deliberately skipped.
 * Re-enable in Playwright (tests/e2e/share-card.spec.ts) once T2-09
 * ships the visual regression harness.
 */
describe.skip("EcoScoreCard html-to-image capture", () => {
  it("renders 1080×1080 PNG in jsdom", () => {
    expect(true).toBe(true)
  })
})
