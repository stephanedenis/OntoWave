/**
 * Smoke test — Page principale ontowave.org / docs/index.html
 *
 * Vérifie que la page d'accueil :
 * 1. Charge sans erreurs console (hors warnings acceptables)
 * 2. Rend du contenu Markdown (pas de page blanche)
 * 3. Présente le chrome : header, sidebar, menu flottant
 * 4. Le routage i18n fonctionne (#fr/index)
 */

import { test, expect } from '@playwright/test'

test.describe('Page principale (docs/index.html)', () => {
  test('doit charger sans erreurs console critiques', async ({ page }) => {
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/')
    // Attendre que l'app démarre
    await page.waitForFunction(() => {
      const app = document.getElementById('app')
      return app && app.textContent && app.textContent.trim().length > 50
    }, { timeout: 15000 })

    // Filtrer les erreurs 404 acceptables (favicon, etc.)
    const critical = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('Failed to load resource')
    )
    expect(critical, `Erreurs console critiques : ${critical.join(', ')}`).toEqual([])
  })

  test('doit rediriger vers #fr/index', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() =>
      location.hash.includes('fr/index') || location.hash.includes('index'),
      { timeout: 8000 }
    )
    expect(page.url()).toContain('#')
  })

  test('doit afficher du contenu Markdown (pas de page blanche)', async ({ page }) => {
    await page.goto('/')
    const app = page.locator('#app')
    await expect(app).not.toBeEmpty({ timeout: 15000 })
    // Le contenu doit contenir au moins un élément de texte substantiel
    await page.waitForFunction(() => {
      const app = document.getElementById('app')
      return app && app.innerText && app.innerText.trim().length > 100
    }, { timeout: 15000 })
  })

  test('doit avoir le chrome de page (header, sidebar, floating menu)', async ({ page }) => {
    await page.goto('/')
    // Attendre contenu
    await page.waitForFunction(() => {
      const app = document.getElementById('app')
      return app && app.textContent && app.textContent.trim().length > 50
    }, { timeout: 15000 })

    // Header avec le brand
    await expect(page.locator('#site-header')).toBeVisible()
    await expect(page.locator('#brand')).toBeVisible()

    // Menu flottant (créé par bootstrapDom)
    await expect(page.locator('#ontowave-floating-menu')).toBeVisible()

    // Sidebar (peut être vide si pas de nav.yml/sitemap, mais doit exister)
    await expect(page.locator('#sidebar')).toBeAttached()
  })

  test('doit charger ontowave.min.js (pas les assets SPA Vite)', async ({ page }) => {
    const scripts = []
    page.on('request', req => {
      if (req.resourceType() === 'script') scripts.push(req.url())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hasLibrary = scripts.some(s => s.includes('ontowave.min.js'))
    const hasSPA = scripts.some(s => s.includes('/assets/index-'))

    expect(hasLibrary, 'ontowave.min.js doit être chargé').toBe(true)
    expect(hasSPA, 'Les assets SPA Vite ne doivent PAS être chargés en production').toBe(false)
  })

  test('doit charger ontowave.min.js (pas les assets SPA Vite)', async ({ page }) => {
    const scripts = []
    page.on('request', req => {
      if (req.resourceType() === 'script') scripts.push(req.url())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hasLibrary = scripts.some(s => s.includes('ontowave.min.js'))
    const hasSPA = scripts.some(s => s.includes('/assets/index-'))

    expect(hasLibrary, 'ontowave.min.js doit être chargé').toBe(true)
    expect(hasSPA, 'Les assets SPA Vite ne doivent PAS être chargés en production').toBe(false)
  })

  test('menu flottant — clic icône → état étendu, brand visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => {
      const menu = document.getElementById('ontowave-floating-menu')
      return menu && menu.querySelector('.ontowave-menu-icon')
    }, { timeout: 15000 })

    const menu = page.locator('#ontowave-floating-menu')
    const icon = page.locator('.ontowave-menu-icon')
    const brand = page.locator('.ontowave-menu-brand')

    // État initial : compact, brand masqué
    await expect(menu).not.toHaveClass(/expanded/)

    // Clic → état étendu
    await icon.click()
    await expect(menu).toHaveClass(/expanded/)
    await expect(brand).toBeVisible()
    const ariaExpanded = await icon.getAttribute('aria-expanded')
    expect(ariaExpanded).toBe('true')

    // Clic à nouveau → retour compact, brand masqué
    await icon.click()
    await expect(menu).not.toHaveClass(/expanded/)
    await expect(brand).not.toBeVisible()
    const ariaExpanded2 = await icon.getAttribute('aria-expanded')
    expect(ariaExpanded2).toBe('false')
  })

  test('menu flottant — contient icône 🌊 et lien 🏠', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => {
      const menu = document.getElementById('ontowave-floating-menu')
      return menu && menu.querySelector('.ontowave-menu-icon')
    }, { timeout: 15000 })

    const icon = page.locator('.ontowave-menu-icon')
    await expect(icon).toContainText('🌊')

    await icon.click()
    const homeBtn = page.locator('.ontowave-menu-option')
    await expect(homeBtn).toBeVisible()
    await expect(homeBtn).toContainText('🏠')
  })
})
