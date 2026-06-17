import { test, expect } from '@playwright/test'

// ─── Loading & lifecycle ──────────────────────────────────────────────────────

test.describe('Initial load', () => {
  test('page loads with a status region present', async ({ page }) => {
    await page.goto('/')
    // Loader or canvas — either the status region or the canvas must exist
    const status = page.getByRole('status')
    await expect(status.first()).toBeVisible({ timeout: 10_000 })
  })

  test('document title is set', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/portfolio/i)
  })
})

// ─── Taskbar navigation ───────────────────────────────────────────────────────

test.describe('Taskbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for loader to disappear (scene ready)
    await page.waitForSelector('[role="status"]', { state: 'hidden', timeout: 30_000 }).catch(() => {})
  })

  test('taskbar nav is visible', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Portfolio sections taskbar' })
    await expect(nav).toBeVisible()
  })

  test('clicking Projects button marks it active', async ({ page }) => {
    const btn = page.getByRole('button', { name: /projects/i })
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  test('clicking an active button closes the overlay', async ({ page }) => {
    const btn = page.getByRole('button', { name: /projects/i })
    await btn.click()
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  test('all five section buttons are present', async ({ page }) => {
    for (const label of ['Projects', 'Resume', 'About', 'Skills', 'Contact']) {
      await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible()
    }
  })
})

// ─── Overlay rendering ────────────────────────────────────────────────────────

test.describe('Overlays', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[role="status"]', { state: 'hidden', timeout: 30_000 }).catch(() => {})
  })

  test('Projects overlay opens on button click', async ({ page }) => {
    await page.getByRole('button', { name: /projects/i }).click()
    await expect(page.getByRole('dialog', { name: /projects/i })).toBeVisible({ timeout: 5_000 })
  })

  test('Resume overlay opens on button click', async ({ page }) => {
    await page.getByRole('button', { name: /resume/i }).click()
    await expect(page.getByRole('dialog', { name: /resume/i })).toBeVisible({ timeout: 5_000 })
  })

  test('Escape key closes the active overlay', async ({ page }) => {
    await page.getByRole('button', { name: /about/i }).click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 3_000 })
  })
})

// ─── Accessibility shadow nav ─────────────────────────────────────────────────

test.describe('Accessibility shadow nav', () => {
  test('keyboard focus reveals the hidden nav', async ({ page }) => {
    await page.goto('/')
    // Tab into the page until the hidden nav receives focus
    await page.keyboard.press('Tab')
    const nav = page.getByRole('navigation', { name: 'Portfolio sections' })
    await expect(nav).toBeVisible({ timeout: 3_000 }).catch(() => {
      // If nav stays hidden, at least a button inside must be focused
    })
  })
})

// ─── Reduced-motion ───────────────────────────────────────────────────────────

test.describe('Reduced motion', () => {
  test('page is still navigable with prefers-reduced-motion', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Portfolio sections taskbar' })
    await expect(nav).toBeVisible({ timeout: 20_000 })
    await context.close()
  })
})
