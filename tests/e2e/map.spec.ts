import { expect, test } from '@playwright/test'

/**
 * T2-06 — Map page guest gating.
 *
 * The /map route is part of (app) — proxy.ts redirects unauthenticated
 * visitors to /auth/login before any Leaflet rendering happens.
 *
 * Authenticated map rendering (Leaflet container, OSM attribution,
 * collection-point markers) is covered by storageState-fixture tests
 * gated behind T3 once seeded test users land.
 */

test('guest visiting /map is redirected to /auth/login by proxy', async ({ page }) => {
  const response = await page.goto('/map')

  await page.waitForLoadState('domcontentloaded')

  const url = page.url()
  expect(url).toMatch(/\/auth\/login/)
  expect([200, 301, 302, 303, 307, 308]).toContain(response?.status() ?? 200)
})

// TODO(T3-fixture): Enable once Playwright storageState test user lands.
// Asserts: .leaflet-container visible, OSM attribution rendered, ≥1 marker.
test.skip('authenticated map renders Leaflet + OSM attribution + markers', async ({ page }) => {
  await page.goto('/map')

  const leafletContainer = page.locator('.leaflet-container')
  await expect(leafletContainer).toBeVisible({ timeout: 15_000 })

  const attribution = page.locator('.leaflet-control-attribution')
  await expect(attribution).toContainText(/OpenStreetMap/i)

  const markers = page.locator('.leaflet-marker-icon, .leaflet-marker-pane > *')
  await expect
    .poll(async () => markers.count(), { timeout: 15_000, intervals: [500, 1000, 2000] })
    .toBeGreaterThanOrEqual(1)
})
