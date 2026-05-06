import { test, expect } from '@playwright/test';

/**
 * Demo: Component Mode (createApp with container)
 * Tests that OntoWave can be embedded inside a host application's container
 * without DOM conflicts outside the target container.
 */
test.describe('Demo 04-component: Component Mode', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];

    // Track console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error('❌ Browser console error:', msg.text());
      }
    });

    // Track page errors
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.error('❌ Page error:', err.message);
    });
  });

  test('should load without console errors', async ({ page }) => {
    await page.goto('/demos/04-component/component.html');

    // Wait for OntoWave to load
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1000); // Allow async rendering

    // Check no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render content inside the container', async ({ page }) => {
    await page.goto('/demos/04-component/component.html');

    // Wait for H1 inside the ow-viewer container
    await page.waitForSelector('#ow-viewer h1', { state: 'attached', timeout: 5000 });

    // Check H1 text
    const h1 = await page.textContent('#ow-viewer h1');
    expect(h1).toBeTruthy();
    expect(h1.length).toBeGreaterThan(0);

    console.log('✅ H1 found inside container:', h1);
  });

  test('should have floating menu inside the container', async ({ page }) => {
    await page.goto('/demos/04-component/component.html');

    // Wait for content
    await page.waitForSelector('#ow-viewer h1', { state: 'attached', timeout: 5000 });

    // Floating menu should be inside the container
    const menuInsideContainer = await page.locator('#ow-viewer #ontowave-floating-menu').count();
    expect(menuInsideContainer).toBe(1);

    // Floating menu should NOT be directly on body (no DOM leak outside container)
    const menuOnBody = await page.evaluate(() => {
      const bodyMenus = Array.from(document.body.children).filter(
        el => el.id === 'ontowave-floating-menu'
      );
      return bodyMenus.length;
    });
    expect(menuOnBody).toBe(0);

    console.log('✅ Floating menu is inside the container');
  });

  test('should not affect DOM outside the container', async ({ page }) => {
    await page.goto('/demos/04-component/component.html');

    // Wait for content
    await page.waitForSelector('#ow-viewer h1', { state: 'attached', timeout: 5000 });

    // Verify host app elements are intact
    const hostHeader = await page.locator('.host-header').count();
    const hostSidebar = await page.locator('.host-sidebar').count();
    expect(hostHeader).toBe(1);
    expect(hostSidebar).toBe(1);

    // Verify no #ow-content was created at body level
    const owContentAtBody = await page.evaluate(() => {
      return Array.from(document.body.children).some(el => el.id === 'ow-content');
    });
    expect(owContentAtBody).toBe(false);

    console.log('✅ Host app DOM is not affected');
  });

  test('should display app content correctly scoped', async ({ page }) => {
    await page.goto('/demos/04-component/component.html');

    // Wait for content
    await page.waitForSelector('#ow-viewer h1', { state: 'attached', timeout: 5000 });
    await page.waitForTimeout(500);

    // Content should be inside #ow-viewer
    const contentInViewer = await page.locator('#ow-viewer .ow-app').count();
    expect(contentInViewer).toBe(1);

    console.log('✅ Content is properly scoped inside the container');
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.goto('/demos/04-component/component.html');

    // Wait for content
    await page.waitForSelector('#ow-viewer h1', { state: 'attached' });
    await page.waitForTimeout(2000); // Allow rendering to stabilize

    // Full page screenshot
    await expect(page).toHaveScreenshot('04-component.png', {
      fullPage: true,
      maxDiffPixels: 500  // Tolerance
    });
  });
});
