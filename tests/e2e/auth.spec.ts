import { expect, test } from '@playwright/test'

/**
 * T2-06 — Auth flow smoke tests.
 *
 * Verifies guest visitors can reach the login page directly and that
 * proxy.ts redirects protected routes to /auth/login.
 */

test.describe('Auth — guest gating', () => {
  test('login page is reachable directly and renders auth UI', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).toMatch(/\/auth\/login/)

    // Either Google OAuth button or magic-link email input must be present.
    const oauthButton = page
      .getByRole('button', { name: /google/i })
      .or(page.getByRole('link', { name: /google/i }))
      .first()
    const emailInput = page.locator('input[type="email"]').first()

    const oauthVisible = await oauthButton.isVisible().catch(() => false)
    const emailVisible = await emailInput.isVisible().catch(() => false)

    expect(oauthVisible || emailVisible).toBeTruthy()
  })

  test('guest visiting /scan is gated to /auth/login by proxy', async ({ page }) => {
    const response = await page.goto('/scan')
    await page.waitForLoadState('domcontentloaded')

    const url = page.url()
    expect(url).toMatch(/\/auth\/login/)
    expect([200, 301, 302, 303, 307, 308]).toContain(response?.status() ?? 200)
  })

  test('guest visiting /profile is gated to /auth/login by proxy', async ({ page }) => {
    const response = await page.goto('/profile')
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).toMatch(/\/auth\/login/)
    expect([200, 301, 302, 303, 307, 308]).toContain(response?.status() ?? 200)
  })
})
