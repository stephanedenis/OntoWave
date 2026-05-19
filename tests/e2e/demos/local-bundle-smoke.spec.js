import { test, expect } from '@playwright/test'

test.describe('Local Bundle Smoke (/ontowave.min.js)', () => {
  test('menu flottant: toolbar thème caché fermé, visible ouvert', async ({ page }) => {
    const scripts = []
    page.on('request', (req) => {
      if (req.resourceType() === 'script') scripts.push(req.url())
    })

    await page.goto('/demos/01-base/local-bundle-smoke.html')
    await page.waitForFunction(() => {
      const menu = document.getElementById('ontowave-floating-menu')
      return menu && menu.querySelector('.ontowave-menu-icon')
    }, { timeout: 15000 })

    const hasLocalBundle = scripts.some((s) => s.includes('/ontowave.min.js'))
    const hasUnpkgBundle = scripts.some((s) => s.includes('unpkg.com/ontowave'))
    expect(hasLocalBundle, 'Le smoke local doit charger /ontowave.min.js').toBe(true)
    expect(hasUnpkgBundle, 'Le smoke local ne doit pas charger unpkg').toBe(false)

    const menu = page.locator('#ontowave-floating-menu')
    const icon = page.locator('.ontowave-menu-icon')
    const toolbar = page.locator('#ow-ux-toolbar')

    await expect(menu).not.toHaveClass(/expanded/)
    await expect(toolbar).toBeHidden()

    await icon.click()
    await expect(menu).toHaveClass(/expanded/)
    await expect(toolbar).toBeVisible()

    await icon.click()
    await expect(menu).not.toHaveClass(/expanded/)
    await expect(toolbar).toBeHidden()
  })
})