import { test, expect } from '@playwright/test';

/**
 * Demo: Thèmes de lecture (clair/sépia/sombre)
 * Vérifie le chargement du module UX et la présence du bouton de bascule de thème
 */
test.describe('Demo 03-ux: Reading Themes', () => {
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

  test('should load ontowave-ux.js without errors', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Filtrer les erreurs CDN attendues en environnement hors-ligne
    const realErrors = consoleErrors.filter(e =>
      !e.includes('cdn.jsdelivr.net') &&
      !e.includes('Failed to fetch') &&
      !e.includes('net::ERR') &&
      !e.includes('ERR_NAME_NOT_RESOLVED') &&
      !e.includes('ERR_CONNECTION')
    );
    expect(realErrors).toHaveLength(0);
  });

  test('should show theme toggle button', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Le bouton de bascule de thème doit être présent dans le DOM
    const btn = page.locator('#ow-theme-toggle');
    await expect(btn).toBeVisible({ timeout: 5000 });
  });

  test('should cycle themes on button click', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Thème initial : light
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-ow-theme')
    );
    expect(initialTheme).toBe('light');

    // Cliquer une fois → sépia
    await page.locator('#ow-theme-toggle').click();
    const theme2 = await page.evaluate(() =>
      document.documentElement.getAttribute('data-ow-theme')
    );
    expect(theme2).toBe('sepia');

    // Cliquer encore → sombre
    await page.locator('#ow-theme-toggle').click();
    const theme3 = await page.evaluate(() =>
      document.documentElement.getAttribute('data-ow-theme')
    );
    expect(theme3).toBe('dark');

    // Cliquer encore → retour clair
    await page.locator('#ow-theme-toggle').click();
    const theme4 = await page.evaluate(() =>
      document.documentElement.getAttribute('data-ow-theme')
    );
    expect(theme4).toBe('light');
  });

  test('should apply CSS variables for sepia theme', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Passer au thème sépia
    await page.locator('#ow-theme-toggle').click();

    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--ow-bg').trim()
    );
    expect(bg).toBe('#f4ecd8');
  });

  test('should have CSS theme stylesheet injected', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const hasCss = await page.evaluate(() => !!document.getElementById('ow-theme-css'));
    expect(hasCss).toBe(true);
  });

  test('should expose OntoWaveUX object', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const uxLoaded = await page.evaluate(() => typeof window.OntoWaveUX !== 'undefined');
    expect(uxLoaded).toBe(true);
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html', { waitUntil: 'domcontentloaded' });
    // Attendre le bouton UX (fourni localement, pas par CDN)
    await page.waitForSelector('#ow-theme-toggle', { timeout: 5000 });
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('03-ux-themes.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });
});
