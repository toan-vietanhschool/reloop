/**
 * Shared display helpers for scan-result surfaces (ResultCard,
 * EcoScoreCard share image, etc.). Keeps the impact emoji ladder, the
 * generations-since-grandparent pun, and the decomposition range
 * formatter in a single place so the share PNG and the in-app card
 * never drift apart.
 */

/**
 * Average years between human generations used for the "ancestor pun"
 * (e.g. "outlived your great-grandparent N generations"). 25 years is
 * the conventional rough estimate.
 */
export const YEARS_PER_GENERATION = 25

/**
 * Lower bound (in years) before the ancestor pun even makes sense.
 * Below this, the joke lands flat.
 */
const ANCESTOR_PUN_YEARS_FLOOR = 80

/**
 * Minimum number of generations required for the pun to read funny
 * rather than literal. Items that decompose for ~3 generations get a
 * plain decomposition line instead.
 */
const ANCESTOR_PUN_MIN_GENERATIONS = 4

/**
 * Map an environmental impact score (1-10) to an at-a-glance emoji.
 * Lower scores get plant emoji; higher scores escalate to fire.
 */
export function impactEmoji(score: number): string {
  if (score <= 2) return "🌱"
  if (score <= 4) return "🌿"
  if (score <= 6) return "⚠️"
  if (score <= 8) return "🚨"
  return "🔥"
}

/**
 * Format a decomposition window for Vietnamese display.
 *
 *   - max == null            → "vĩnh viễn" (effectively forever)
 *   - both < 1 year          → "vài tháng"
 *   - max > min              → "{min} – {max} năm"
 *   - otherwise              → "~{min} năm"
 */
export function formatDecompositionRange(
  min: number,
  max: number | null,
): string {
  if (max === null) return "vĩnh viễn"
  if (max > min) {
    if (min < 1 && max < 1) return "Vài tháng"
    return `${min} – ${max} năm`
  }
  if (min < 1) return "Vài tháng"
  return `~${min} năm`
}

/**
 * Build the ancestor-generations pun line for a given decomposition
 * length. Returns null when the joke would not land (too short, too
 * few generations).
 *
 * The caller controls the surrounding sentence; this helper only
 * decides whether to surface the pun and how many generations to cite.
 */
export function buildAncestorPun(years: number): string | null {
  if (years < ANCESTOR_PUN_YEARS_FLOOR) return null
  const generations = Math.floor(years / YEARS_PER_GENERATION)
  if (generations < ANCESTOR_PUN_MIN_GENERATIONS) return null
  return `Sống lâu hơn ông cố bạn ${generations} đời 😱`
}
