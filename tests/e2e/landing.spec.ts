import { expect, test } from '@playwright/test'

/**
 * T1-04 — Marketing landing page smoke.
 * Asserts the H1 hero headline, the Vietnamese tagline,
 * and the primary CTA "Bắt đầu Scan" all render.
 */
test('landing page renders ReLoop hero + CTA', async ({ page }) => {
  await page.goto('/')

  const heroHeading = page.getByRole('heading', { level: 1 })
  await expect(heroHeading).toBeVisible()
  await expect(heroHeading).toContainText(/Shazam cho rác/i)

  const scanCta = page
    .getByRole('link', { name: /bắt đầu scan/i })
    .or(page.getByRole('button', { name: /bắt đầu scan/i }))
    .first()
  await expect(scanCta).toBeVisible()
})

test('landing page is responsive at 375px (iPhone SE)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')

  const heroHeading = page.getByRole('heading', { level: 1 })
  await expect(heroHeading).toBeVisible()

  const overflowX = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflowX).toBeLessThanOrEqual(1)
})
