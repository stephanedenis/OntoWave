import { test, expect } from '@playwright/test';

/**
 * Demo: Glossary Dictionary
 * Dotted underline with sidebar tooltip for defined terms.
 */
test.describe('Demo 03-glossary: Glossary Feature', () => {
  let consoleErrors = [];

  // URLs for optional resources that the app probes but may legitimately 404
  const OPTIONAL_404_PATTERNS = [
    '_delegate.json', 'CNAME', 'nav.yml', 'search-index.json',
    'search-index', 'sitemap', 'pages.txt',
  ];

  function isOptional404(msg) {
    const text = msg.text ? msg.text() : String(msg);
    const locationUrl = (msg.location && msg.location().url) || '';
    const searchIn = text + ' ' + locationUrl;
    return (text.includes('404') || text.includes('Failed to load resource')) &&
           OPTIONAL_404_PATTERNS.some(p => searchIn.includes(p));
  }

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];

    // Track console errors (excluding known optional 404s)
    page.on('console', msg => {
      if (msg.type() === 'error' && !isOptional404(msg)) {
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
    await page.goto('/demos/03-glossary/glossary.html#/fr/glossary');

    // Wait for OntoWave to load
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1500); // Allow async rendering

    // Check no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render main content with H1', async ({ page }) => {
    await page.goto('/demos/03-glossary/glossary.html#/fr/glossary');

    // Wait for H1
    await page.waitForSelector('h1', { state: 'attached', timeout: 8000 });

    const h1 = await page.textContent('h1');
    expect(h1).toBeTruthy();
    expect(h1.length).toBeGreaterThan(0);

    console.log('✅ H1 found:', h1);
  });

  test('should annotate glossary terms with dotted underline', async ({ page }) => {
    await page.goto('/demos/03-glossary/glossary.html#/fr/glossary');

    // Wait for content and glossary annotation
    await page.waitForSelector('h1', { state: 'attached', timeout: 8000 });
    await page.waitForTimeout(2000); // Allow glossary to apply

    // Check that .ow-term spans exist
    const termCount = await page.locator('.ow-term').count();
    expect(termCount).toBeGreaterThan(0);

    console.log(`✅ Found ${termCount} annotated glossary term(s)`);
  });

  test('should show sidebar definition on term click', async ({ page }) => {
    await page.goto('/demos/03-glossary/glossary.html#/fr/glossary');

    // Wait for content and glossary annotation (state:attached because headless may have zero-height text)
    await page.waitForSelector('.ow-term', { state: 'attached', timeout: 10000 });
    await page.waitForTimeout(500);

    // Click the first annotated term (force:true because element may be zero-height in headless)
    const firstTerm = page.locator('.ow-term').first();
    // Use evaluate to dispatch click directly, bypassing Playwright actionability in headless
    await page.evaluate(() => {
      const el = document.querySelector('.ow-term');
      if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    // Sidebar panel should now appear (has padding → visible even in headless)
    await page.waitForSelector('#ow-glossary-panel', { timeout: 3000 });
    const panelText = await page.textContent('#ow-glossary-panel');
    expect(panelText).toBeTruthy();
    expect(panelText.length).toBeGreaterThan(10);

    console.log('✅ Sidebar panel appeared after click:', panelText?.slice(0, 60));
  });

  test('should not annotate terms inside code blocks', async ({ page }) => {
    await page.goto('/demos/03-glossary/glossary.html#/fr/glossary');

    // Wait for content
    await page.waitForSelector('h1', { state: 'attached', timeout: 8000 });
    await page.waitForTimeout(2000);

    // Terms inside <code> elements should NOT be wrapped in .ow-term
    const codeTerms = await page.locator('code .ow-term, pre .ow-term, kbd .ow-term').count();
    expect(codeTerms).toBe(0);

    console.log('✅ No annotated terms inside code blocks');
  });

  test('should match visual snapshot', async ({ page }) => {
    // Visual snapshots require headed mode for accurate font rendering and full page height
    test.skip(!process.env.PLAYWRIGHT_HEADED, 'Visual snapshot requires headed mode (font rendering)');

    await page.goto('/demos/03-glossary/glossary.html#/fr/glossary');

    // Wait for content and glossary annotation (state:attached for headless compatibility)
    await page.waitForSelector('.ow-term', { state: 'attached', timeout: 10000 });
    await page.waitForTimeout(1000);

    // Full page screenshot
    await expect(page).toHaveScreenshot('03-glossary.png', {
      fullPage: true,
      maxDiffPixels: 500
    });
  });
});
