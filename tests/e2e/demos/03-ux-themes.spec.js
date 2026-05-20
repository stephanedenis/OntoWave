import { test, expect } from '@playwright/test';

/**
 * Demo: UX Themes — Modes clair, sépia, sombre
 * Variables CSS, persistance localStorage, cycle automatique
 */
test.describe('Demo 03-ux/themes: Reading Themes', () => {
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
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render main content with H1', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });
    const h1 = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || '');
    expect(h1.length).toBeGreaterThan(0);
    console.log('✅ H1 found:', h1);
  });

  test('should inject UX toolbar', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });
    await page.waitForTimeout(500);

    const toolbar = await page.$('#ow-ux-toolbar');
    expect(toolbar).toBeTruthy();
    console.log('✅ UX toolbar injected');
  });

  test('should apply a theme class on body on load', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    const hasThemeClass = await page.evaluate(() =>
      document.body.classList.contains('ow-theme-light') ||
      document.body.classList.contains('ow-theme-sepia') ||
      document.body.classList.contains('ow-theme-dark')
    );
    expect(hasThemeClass).toBe(true);
    console.log('✅ Theme class applied to body');
  });

  test('should cycle themes on button click', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    const themeBtn = page.locator('.ow-theme-btn').first();

    // Collect theme classes across 3 clicks to ensure full cycle
    const themes = new Set();

    const getTheme = () => page.evaluate(() => {
      if (document.body.classList.contains('ow-theme-light')) return 'light';
      if (document.body.classList.contains('ow-theme-sepia')) return 'sepia';
      if (document.body.classList.contains('ow-theme-dark')) return 'dark';
      return null;
    });

    themes.add(await getTheme());
    await themeBtn.click();
    await page.waitForTimeout(300);
    themes.add(await getTheme());
    await themeBtn.click();
    await page.waitForTimeout(300);
    themes.add(await getTheme());

    // Should have cycled through at least 2 different themes
    expect(themes.size).toBeGreaterThanOrEqual(2);
    console.log('✅ Themes cycled through:', [...themes].join(', '));
  });

  test('should persist theme in localStorage', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Click once to change theme
    const themeBtn = page.locator('.ow-theme-btn').first();
    await themeBtn.click();
    await page.waitForTimeout(300);

    const savedTheme = await page.evaluate(() =>
      localStorage.getItem('ow-reading-theme')
    );
    expect(['light', 'sepia', 'dark']).toContain(savedTheme);
    console.log('✅ Theme persisted in localStorage:', savedTheme);
  });

  test('should restore saved theme on reload', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Force sepia theme
    await page.evaluate(() => localStorage.setItem('ow-reading-theme', 'sepia'));
    await page.reload();
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    const isSepia = await page.evaluate(() =>
      document.body.classList.contains('ow-theme-sepia')
    );
    expect(isSepia).toBe(true);
    console.log('✅ Sepia theme restored after reload');
  });

  test('should expose CSS custom properties', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue('--ow-bg').trim()
    );
    expect(bg.length).toBeGreaterThan(0);
    console.log('✅ CSS variable --ow-bg:', bg);
  });

  test('should render themes section in the document', async ({ page }) => {
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });

    // Check table exists (CSS variables table or themes table)
    const table = await page.$('table');
    expect(table).toBeTruthy();
    console.log('✅ Content table rendered');
  });

  test('should match visual snapshot', async ({ page }) => {
    // Clean localStorage to get consistent light theme
    await page.addInitScript(() => localStorage.setItem('ow-reading-theme', 'light'));
    await page.goto('/demos/03-ux/themes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('03-ux-themes.png', {
      fullPage: true,
      maxDiffPixels: 500,
    });
  });
});
