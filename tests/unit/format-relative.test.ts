import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { formatRelative } from "@/lib/format-relative"

const NOW = new Date("2026-05-11T12:00:00Z").getTime()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe("formatRelative", () => {
  it("returns empty string for null / undefined", () => {
    expect(formatRelative(null)).toBe("")
    expect(formatRelative(undefined)).toBe("")
  })

  it("returns empty string for an unparseable date", () => {
    expect(formatRelative("not-a-date")).toBe("")
  })

  it("formats seconds in the past in Vietnamese", () => {
    const tenSecondsAgo = NOW - 10_000
    const out = formatRelative(tenSecondsAgo)
    expect(out).toMatch(/giây|trước/i)
  })

  it("formats minutes in the past", () => {
    const fiveMinAgo = NOW - 5 * 60_000
    expect(formatRelative(fiveMinAgo)).toMatch(/phút|trước/i)
  })

  it("formats hours in the past", () => {
    const threeHoursAgo = NOW - 3 * 60 * 60_000
    expect(formatRelative(threeHoursAgo)).toMatch(/giờ|trước/i)
  })

  it("formats days in the past", () => {
    const twoDaysAgo = NOW - 2 * 24 * 60 * 60_000
    // Intl returns colloquial forms like "Hôm kia" / "Hôm qua" for
    // small day deltas; only larger gaps emit the literal "N ngày trước".
    expect(formatRelative(twoDaysAgo)).toMatch(/ngày|hôm qua|hôm kia|trước/i)
  })

  it("accepts Date and ISO string inputs equivalently", () => {
    const ts = NOW - 60_000
    const fromNumber = formatRelative(ts)
    const fromDate = formatRelative(new Date(ts))
    const fromIso = formatRelative(new Date(ts).toISOString())
    expect(fromNumber).toBe(fromDate)
    expect(fromNumber).toBe(fromIso)
  })
})
