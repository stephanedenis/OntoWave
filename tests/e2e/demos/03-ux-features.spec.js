import { test, expect } from '@playwright/test';

/**
 * Demo: UX Features — Reading Themes, Keyboard Navigation, Markov Prefetch
 */
test.describe('Demo 03-ux: UX Features', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error('❌ Browser console error:', msg.text());
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.error('❌ Page error:', err.message);
    });
  });

  test('should load without console errors', async ({ page }) => {
    await page.goto('/demos/03-ux/ux.html');
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render main content', async ({ page }) => {
    await page.goto('/demos/03-ux/ux.html');
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });
    const h1 = await page.textContent('h1');
    expect(h1).toBeTruthy();
    expect(h1.length).toBeGreaterThan(0);
    console.log('✅ H1 found:', h1);
  });

  test('should inject UX toolbar', async ({ page }) => {
    await page.goto('/demos/03-ux/ux.html');
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });
    await page.waitForTimeout(1500);

    const toolbar = await page.$('#ow-ux-toolbar');
    expect(toolbar).toBeTruthy();
    console.log('✅ UX toolbar injected');
  });

  test('should cycle reading themes on button click', async ({ page }) => {
    await page.goto('/demos/03-ux/ux.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Initial theme applied
    const hasThemeClass = await page.evaluate(() =>
      document.body.classList.contains('ow-theme-light') ||
      document.body.classList.contains('ow-theme-sepia') ||
      document.body.classList.contains('ow-theme-dark')
    );
    expect(hasThemeClass).toBe(true);

    // Click theme button to cycle
    const themeBtn = page.locator('.ow-theme-btn').first();
    const initialText = await themeBtn.textContent();
    await themeBtn.click();
    const newText = await themeBtn.textContent();
    expect(newText).not.toBe(initialText);
    console.log('✅ Theme cycled:', initialText, '->', newText);
  });

  test('should not expose removed notes/pdf controls', async ({ page }) => {
    await page.goto('/demos/03-ux/ux.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    const notesBtnCount = await page.locator('button.ow-theme-btn').filter({ hasText: '📝' }).count();
    const pdfBtnCount = await page.locator('button.ow-theme-btn').filter({ hasText: '🖨' }).count();
    const notesPanelCount = await page.locator('.ow-notes-panel').count();

    expect(notesBtnCount).toBe(0);
    expect(pdfBtnCount).toBe(0);
    expect(notesPanelCount).toBe(0);
    console.log('✅ Notes/PDF controls are absent as expected');
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.goto('/demos/03-ux/ux.html');
    await page.waitForSelector('h1', { state: 'attached' });
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('03-ux-features.png', {
      fullPage: true,
      maxDiffPixels: 500
    });
  });
});
