import { test, expect } from '@playwright/test'

/**
 * T2-06 — Listings page smoke tests.
 *
 * The full authenticated listings grid requires a seeded test user with
 * a Playwright `storageState`. Until W2-D ships the test user fixture,
 * we verify only the public surface (page reachable, redirect or render).
 */

test('listings route responds (public surface)', async ({ page }) => {
  const response = await page.goto('/listings')

  // Page should be reachable (200) or redirect to login (3xx via middleware).
  expect([200, 301, 302, 303, 307, 308]).toContain(response?.status() ?? 200)
})

// TODO(T2-08): Enable once seed test user + storageState fixture lands.
test.skip('authenticated user sees listings grid with N items', async ({ page }) => {
  await page.goto('/listings')

  const grid = page.getByTestId('listings-grid')
  await expect(grid).toBeVisible()

  const cards = page.getByTestId('listing-card')
  await expect(cards.first()).toBeVisible()
  expect(await cards.count()).toBeGreaterThan(0)
})

// TODO(T2-08): Enable once filter chips exist + storageState fixture lands.
test.skip('filter by category narrows results', async ({ page }) => {
  await page.goto('/listings')

  const electronicsChip = page.getByRole('button', { name: /điện tử/i })
  await electronicsChip.click()

  const cards = page.getByTestId('listing-card')
  await expect(cards.first()).toBeVisible()
})
