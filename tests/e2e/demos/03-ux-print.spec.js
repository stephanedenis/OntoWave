import { test, expect } from '@playwright/test';

/**
 * Demo: Export PDF (print CSS)
 * Vérifie la présence du CSS d'impression injecté par le module UX
 */
test.describe('Demo 03-ux: PDF Export', () => {
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
    await page.goto('/demos/03-ux/print.html', { waitUntil: 'domcontentloaded' });
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

  test('should inject print CSS stylesheet', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Vérifier que le style d'impression est injecté dans le <head>
    const hasPrintCss = await page.evaluate(() => !!document.getElementById('ow-print-css'));
    expect(hasPrintCss).toBe(true);
  });

  test('should have @media print in injected CSS', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const cssContent = await page.evaluate(() => {
      const el = document.getElementById('ow-print-css');
      return el ? el.textContent : '';
    });
    expect(cssContent).toContain('@media print');
    expect(cssContent).toContain('display: none');
  });

  test('should have theme toggle (UX auto-init)', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#ow-theme-toggle', { timeout: 5000 });
    const btn = page.locator('#ow-theme-toggle');
    await expect(btn).toBeVisible();
  });

  test('should expose OntoWaveUX.setupPrint function', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const hasSetup = await page.evaluate(() => {
      const ux = window.OntoWaveUX;
      return ux && typeof ux.setupPrint === 'function';
    });
    expect(hasSetup).toBe(true);
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#ow-theme-toggle', { timeout: 5000 });
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('03-ux-print.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });
});
