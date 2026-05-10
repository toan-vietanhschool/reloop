/**
 * Vietnamese relative-time formatter shared across admin tables and
 * activity feeds. Centralized here so the unit ladder + Intl instance
 * stay in lockstep across surfaces (admin/points, ModerationTable, etc.).
 *
 * Returns an empty string for null / invalid input. Callers that need a
 * placeholder glyph (e.g. "—") should fall back at the call site.
 */

interface RelativeUnit {
  unit: Intl.RelativeTimeFormatUnit
  ms: number
}

export const REL_UNITS: ReadonlyArray<RelativeUnit> = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
]

export const RTF = new Intl.RelativeTimeFormat("vi", { numeric: "auto" })

export function formatRelative(
  timestamp: string | Date | number | null | undefined,
): string {
  if (timestamp === null || timestamp === undefined) return ""
  const ts =
    typeof timestamp === "number"
      ? timestamp
      : timestamp instanceof Date
        ? timestamp.getTime()
        : new Date(timestamp).getTime()
  if (Number.isNaN(ts)) return ""
  const diff = ts - Date.now()
  const abs = Math.abs(diff)
  const unit = REL_UNITS.find((u) => abs >= u.ms) ?? REL_UNITS[REL_UNITS.length - 1]
  const value = Math.round(diff / unit.ms)
  return RTF.format(value, unit.unit)
}
