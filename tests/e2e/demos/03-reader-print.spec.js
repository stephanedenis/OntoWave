import { test, expect } from '@playwright/test';

/**
 * Demo: Export PDF (03-reader/print)
 */
test.describe('Demo 03-reader: Export PDF / Impression', () => {
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
    await page.goto('/demos/03-reader/print.html');
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1500);
    const critical = consoleErrors.filter(e =>
      !e.includes('net::ERR') && !e.includes('Failed to fetch') && !e.includes('ERR_')
    );
    expect(critical).toHaveLength(0);
  });

  test('devrait rendre le contenu principal', async ({ page }) => {
    await page.goto('/demos/03-reader/print.html');
    await page.waitForSelector('h1', { timeout: 5000 });
    const h1 = await page.textContent('h1');
    expect(h1).toBeTruthy();
  });

  test('devrait afficher le bouton d\'impression', async ({ page }) => {
    await page.goto('/demos/03-reader/print.html');
    await page.waitForTimeout(1500);
    const printBtn = page.locator('#ow-btn-print');
    await expect(printBtn).toBeVisible({ timeout: 5000 });
  });

  test('les styles @media print sont injectés', async ({ page }) => {
    await page.goto('/demos/03-reader/print.html');
    await page.waitForTimeout(1500);
    // Vérifier que la feuille de style de lecture est présente
    const hasReaderStyles = await page.evaluate(() => {
      return !!document.getElementById('ow-reader-styles');
    });
    expect(hasReaderStyles).toBe(true);
  });

  test('devrait correspondre au snapshot visuel', async ({ page }) => {
    await page.goto('/demos/03-reader/print.html');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('03-reader-print.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });
});
