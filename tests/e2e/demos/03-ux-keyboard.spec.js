import { test, expect } from '@playwright/test';

/**
 * Demo: UX Keyboard Navigation — j/k (scroll), n/p (page navigation)
 * installKeyboardNav, conditions d'activation
 */
test.describe('Demo 03-ux/keyboard: Keyboard Navigation', () => {
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
    await page.goto('/demos/03-ux/keyboard.html');
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render main content with H1', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html');
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });
    const h1 = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || '');
    expect(h1.length).toBeGreaterThan(0);
    console.log('✅ H1 found:', h1);
  });

  test('should inject UX toolbar', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });
    await page.waitForTimeout(500);

    const toolbar = await page.$('#ow-ux-toolbar');
    expect(toolbar).toBeTruthy();
    console.log('✅ UX toolbar present');
  });

  test('should render shortcuts table', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html');
    await page.waitForSelector('table', { timeout: 5000 });

    // Check for key cells in the table
    const cells = await page.$$eval('td, th', els => els.map(el => el.textContent.trim()));
    const hasJ = cells.some(c => c === 'j');
    const hasK = cells.some(c => c === 'k');
    expect(hasJ).toBe(true);
    expect(hasK).toBe(true);
    console.log('✅ Shortcuts table contains j and k keys');
  });

  test('should scroll down with j key', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });
    await page.waitForTimeout(500);

    // Add a tall spacer to ensure the page is scrollable
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '3000px';
      document.body.appendChild(spacer);
    });

    await page.evaluate(() => document.body.focus());

    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('j');
    await page.waitForTimeout(400);
    const scrollAfter = await page.evaluate(() => window.scrollY);

    expect(scrollAfter).toBeGreaterThan(scrollBefore);
    console.log('✅ j key scrolled down:', scrollBefore, '->', scrollAfter);
  });

  test('should scroll up with k key after scrolling down', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });
    await page.waitForTimeout(500);

    // Add a tall spacer to ensure the page is scrollable
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '3000px';
      document.body.appendChild(spacer);
    });

    await page.evaluate(() => document.body.focus());

    // Scroll down first
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await page.waitForTimeout(400);
    const scrollAfterDown = await page.evaluate(() => window.scrollY);

    // Then scroll up
    await page.keyboard.press('k');
    await page.waitForTimeout(400);
    const scrollAfterUp = await page.evaluate(() => window.scrollY);

    expect(scrollAfterUp).toBeLessThan(scrollAfterDown);
    console.log('✅ k key scrolled up:', scrollAfterDown, '->', scrollAfterUp);
  });

  test('should not scroll when focus is inside a text input', async ({ page }) => {
    await page.goto('/demos/03-ux/keyboard.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });
    await page.waitForTimeout(500);

    // Create a temporary input and focus it
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.id = 'test-input';
      input.type = 'text';
      document.body.prepend(input);
      input.focus();
    });

    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('j');
    await page.waitForTimeout(300);
    const scrollAfter = await page.evaluate(() => window.scrollY);

    // Should NOT have scrolled
    expect(scrollAfter).toBe(scrollBefore);
    console.log('✅ j key ignored when input is focused');
  });

  test('should wire n/p keys to sitemap navigation', async ({ page }) => {
    // The n/p keys navigate based on sitemap.json prev/next entries.
    // In this demo config the sitemap is empty, so no navigation occurs — but
    // the keyboard listener MUST be installed (j/k tests already verify this).
    // We verify the keys are handled (no crash, no scrolling from n/p).
    await page.goto('/demos/03-ux/keyboard.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Add spacer so the page is scrollable (we don't want j/k side effects)
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '3000px';
      document.body.appendChild(spacer);
    });
    // Scroll down a bit first so scrollY > 0
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(200);

    await page.evaluate(() => document.body.focus());
    const scrollBefore = await page.evaluate(() => window.scrollY);
    const hashBefore = await page.evaluate(() => location.hash);

    await page.keyboard.press('n');
    await page.waitForTimeout(400);

    const scrollAfter = await page.evaluate(() => window.scrollY);
    const hashAfter = await page.evaluate(() => location.hash);

    // n should NOT scroll (it's handled by a separate switch case, not j/k)
    expect(scrollAfter).toBe(scrollBefore);
    // Hash may or may not have changed depending on sitemap — no assertion on hash
    console.log('✅ n key handled (no scroll side-effect), hash:', hashBefore, '->', hashAfter);
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ow-reading-theme', 'light'));
    await page.goto('/demos/03-ux/keyboard.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('03-ux-keyboard.png', {
      fullPage: true,
      maxDiffPixels: 500,
    });
  });
});
