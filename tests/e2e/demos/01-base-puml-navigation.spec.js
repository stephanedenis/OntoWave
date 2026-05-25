import { test, expect } from '@playwright/test';

/**
 * Demo: Navigation to .puml files
 * Hash-based navigation to PlantUML files, rendered as SVG via Kroki
 */
test.describe('Demo 01-base: Navigation to .puml files', () => {
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
    await page.goto('/demos/01-base/puml-navigation.html');

    // Wait for OntoWave to load
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1000); // Allow async rendering

    // Check no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render main content with h1', async ({ page }) => {
    await page.goto('/demos/01-base/puml-navigation.html');

    // Wait for H1
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });

    // Check H1 text
    const h1 = await page.textContent('h1');
    expect(h1).toBeTruthy();
    expect(h1.length).toBeGreaterThan(0);

    console.log('✅ H1 found:', h1);
  });

  test('should contain a link to .puml file', async ({ page }) => {
    await page.goto('/demos/01-base/puml-navigation.html');

    await page.waitForSelector('a[href*=".puml"], a[href*="architecture"]', { state: 'attached', timeout: 5000 });

    const links = await page.$$eval('a', (anchors) =>
      anchors.map(a => a.href || a.getAttribute('href') || '')
    );
    const pumlLink = links.find(href => href.includes('.puml') || href.includes('architecture'));
    expect(pumlLink).toBeTruthy();

    console.log('✅ .puml link found:', pumlLink);
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.goto('/demos/01-base/puml-navigation.html');

    // Wait for content
    await page.waitForSelector('h1', { state: 'attached' });
    await page.waitForTimeout(2000); // Allow diagrams to render

    // Full page screenshot
    await expect(page).toHaveScreenshot('01-base-puml-navigation.png', {
      fullPage: true,
      maxDiffPixels: 500  // Tolerance
    });
  });
});
