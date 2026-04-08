import { test, expect } from '@playwright/test';

/**
 * Demo: Raccourcis clavier de navigation (j/k, n/p)
 * Vérifie que le module UX se charge sans erreur et expose les raccourcis
 */
test.describe('Demo 03-ux: Keyboard Navigation', () => {
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
    await page.goto('/demos/03-ux/keyboard.html', { waitUntil: 'domcontentloaded' });
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

  test('should expose OntoWaveUX with keyboard setup', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Vérifier que le module UX expose bien setupKeyboardNav
    const hasSetup = await page.evaluate(() => {
      const ux = window.OntoWaveUX;
      return ux && typeof ux.setupKeyboardNav === 'function';
    });
    expect(hasSetup).toBe(true);
  });

  test('should have theme toggle present (UX auto-init)', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html', { waitUntil: 'domcontentloaded' });
    // L'auto-init du module UX doit créer le bouton de thème
    await page.waitForSelector('#ow-theme-toggle', { timeout: 5000 });
    const btn = page.locator('#ow-theme-toggle');
    await expect(btn).toBeVisible();
  });

  test('should not navigate when typing in input', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const hashBefore = await page.evaluate(() => location.hash);

    // Créer un champ input et taper 'j' dedans — ne doit pas naviguer
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.id = 'test-input';
      document.body.appendChild(input);
      input.focus();
    });
    await page.keyboard.type('j');

    const hashAfter = await page.evaluate(() => location.hash);
    expect(hashAfter).toBe(hashBefore);
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#ow-theme-toggle', { timeout: 5000 });
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('03-ux-keyboard.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });
});
