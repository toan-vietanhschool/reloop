import { test, expect } from '@playwright/test'

/**
 * T1-04 smoke test — RED until landing page ships with "ReLoop" visible text.
 * Green target: page.goto('/') renders an element with text "ReLoop".
 */
test('landing page loads with ReLoop heading (T1-04 smoke)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=ReLoop')).toBeVisible()
})
