import { test, expect } from '@playwright/test'

/**
 * T2-06 — Map page smoke tests.
 *
 * Verifies the Leaflet container renders, OSM attribution is visible,
 * and at least the seeded collection points eventually load.
 */

const MIN_EXPECTED_MARKERS = 1

test('map page renders Leaflet container with OSM attribution', async ({ page }) => {
  await page.goto('/map')

  // Leaflet container is the canonical handle.
  const leafletContainer = page.locator('.leaflet-container')
  await expect(leafletContainer).toBeVisible({ timeout: 15_000 })

  // OSM attribution is mandatory per OSM TOS — must remain visible.
  const attribution = page.locator('.leaflet-control-attribution')
  await expect(attribution).toContainText(/OpenStreetMap/i)
})

test('map shows at least one collection-point marker', async ({ page }) => {
  await page.goto('/map')

  const leafletContainer = page.locator('.leaflet-container')
  await expect(leafletContainer).toBeVisible({ timeout: 15_000 })

  // Markers may render as default <img> pins or custom DivIcons.
  const markers = page.locator('.leaflet-marker-icon, .leaflet-marker-pane > *')

  // Wait briefly for the marker fetch + render cycle.
  await expect
    .poll(async () => markers.count(), { timeout: 15_000, intervals: [500, 1000, 2000] })
    .toBeGreaterThanOrEqual(MIN_EXPECTED_MARKERS)
})

// TODO(T2-08): Enable once seed data confirms 20 points are always present.
test.skip('map shows 20+ seeded collection points', async ({ page }) => {
  await page.goto('/map')

  await expect(page.locator('.leaflet-container')).toBeVisible()

  const markers = page.locator('.leaflet-marker-icon')
  await expect
    .poll(async () => markers.count(), { timeout: 20_000 })
    .toBeGreaterThanOrEqual(20)
})
