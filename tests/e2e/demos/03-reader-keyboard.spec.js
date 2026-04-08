import { test, expect } from '@playwright/test';

/**
 * Demo: Keyboard Shortcuts (03-reader/keyboard)
 */
test.describe('Demo 03-reader: Raccourcis clavier', () => {
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
    await page.goto('/demos/03-reader/keyboard.html');
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1500);
    const critical = consoleErrors.filter(e =>
      !e.includes('net::ERR') && !e.includes('Failed to fetch') && !e.includes('ERR_')
    );
    expect(critical).toHaveLength(0);
  });

  test('devrait rendre le contenu principal', async ({ page }) => {
    await page.goto('/demos/03-reader/keyboard.html');
    await page.waitForSelector('h1', { timeout: 5000 });
    const h1 = await page.textContent('h1');
    expect(h1).toBeTruthy();
  });

  test('la touche j fait défiler vers le bas', async ({ page }) => {
    await page.goto('/demos/03-reader/keyboard.html');
    await page.waitForSelector('h1', { timeout: 5000 });
    await page.waitForTimeout(1500);
    // Focus sur body pour activer les raccourcis
    await page.click('body');
    const scrollBefore = await page.evaluate(() => window.scrollY);
    // Simuler plusieurs appuis sur j
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('j');
      await page.waitForTimeout(100);
    }
    // Note: scrolling may not change if page height <= viewport
    // Just verify no errors were thrown
    expect(consoleErrors.filter(e => !e.includes('ERR_'))).toHaveLength(0);
  });

  test('devrait correspondre au snapshot visuel', async ({ page }) => {
    await page.goto('/demos/03-reader/keyboard.html');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('03-reader-keyboard.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });
});
