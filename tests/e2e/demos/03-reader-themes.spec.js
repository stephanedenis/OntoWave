import { test, expect } from '@playwright/test';

/**
 * Demo: Reading Themes (03-reader/themes)
 * Tests: reader bar appears, theme toggle button present, theme cycling works
 */
test.describe('Demo 03-reader: Thèmes de lecture', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });
  });

  test('devrait charger sans erreurs console', async ({ page }) => {
    await page.goto('/demos/03-reader/themes.html');
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1500);
    // Ignorer les erreurs réseau CDN (ontowave.min.js servi localement)
    const critical = consoleErrors.filter(e =>
      !e.includes('net::ERR') && !e.includes('Failed to fetch') && !e.includes('ERR_')
    );
    expect(critical).toHaveLength(0);
  });

  test('devrait rendre le contenu principal', async ({ page }) => {
    await page.goto('/demos/03-reader/themes.html');
    await page.waitForSelector('h1', { timeout: 5000 });
    const h1 = await page.textContent('h1');
    expect(h1).toBeTruthy();
    expect(h1.length).toBeGreaterThan(0);
  });

  test('devrait afficher la barre de lecture', async ({ page }) => {
    await page.goto('/demos/03-reader/themes.html');
    await page.waitForTimeout(1500);
    const readerBar = page.locator('#ow-reader-bar');
    await expect(readerBar).toBeVisible({ timeout: 5000 });
  });

  test('devrait afficher le bouton de thème', async ({ page }) => {
    await page.goto('/demos/03-reader/themes.html');
    await page.waitForTimeout(1500);
    const themeBtn = page.locator('#ow-btn-theme');
    await expect(themeBtn).toBeVisible({ timeout: 5000 });
  });

  test('le bouton de thème fait basculer le thème', async ({ page }) => {
    await page.goto('/demos/03-reader/themes.html');
    await page.waitForTimeout(1500);
    const themeBtn = page.locator('#ow-btn-theme');
    await themeBtn.click();
    // Vérifier qu'un thème est appliqué au body
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).toMatch(/ow-theme-/);
  });

  test('devrait correspondre au snapshot visuel', async ({ page }) => {
    await page.goto('/demos/03-reader/themes.html');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('03-reader-themes.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });
});
