// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Démo 04 - i18n Fallback', () => {
  test('should detect unsupported browser language', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/04-i18n-fallback.html');
    await page.waitForLoadState('networkidle');
    
    // Get browser language (should be overridden to de-DE)
    const browserLang = await page.evaluate(() => navigator.language);
    console.log('📊 Browser language (unsupported):', browserLang);
    expect(browserLang).toBe('de-DE');
    
    // Screenshot 1: Initial load
    await page.screenshot({ path: 'test-results/demo-04-initial.png', fullPage: true });
  });

  test('should fallback to default locale (fr)', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/04-i18n-fallback.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for redirection
    await page.waitForTimeout(2000);
    
    // Check hash (should be French)
    const hash = await page.evaluate(() => location.hash);
    console.log('📊 Current hash (fallback):', hash);
    expect(hash).toBe('#demos/index.fr.md');
    
    // Screenshot 2: After fallback redirection
    await page.screenshot({ path: 'test-results/demo-04-fallback-redirected.png', fullPage: true });
  });

  test('should display French content (fallback)', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/04-i18n-fallback.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for French text (fallback locale)
    const content = await page.content();
    expect(content).toContain('français');
    
    // Screenshot 3: French content (fallback)
    await page.screenshot({ path: 'test-results/demo-04-french-fallback.png', fullPage: true });
  });

  test('should show success message with fallback flag', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/04-i18n-fallback.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Wait for success indicator
    await page.waitForSelector('#result:has-text("SUCCÈS")', { timeout: 3000 });
    
    const resultText = await page.locator('#result').textContent();
    console.log('📊 Result (with fallback):', resultText);
    expect(resultText).toContain('SUCCÈS');
    expect(resultText).toContain('fallback');
    
    // Screenshot 4: Success with fallback indicator
    await page.screenshot({ path: 'test-results/demo-04-success-fallback.png', fullPage: true });
  });

  test('should log DEMO_04_SUCCESS with fallbackUsed flag', async ({ page }) => {
    const logs = /** @type {string[]} */ ([]);
    page.on('console', msg => {
      if (msg.text().includes('DEMO_04_SUCCESS')) {
        logs.push(msg.text());
      }
    });

    await page.goto('http://localhost:8000/demos/04-i18n-fallback.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📊 Success logs with fallback:', logs);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toContain('fallbackUsed');
    
    // Screenshot 5: Final state
    await page.screenshot({ path: 'test-results/demo-04-final.png', fullPage: true });
  });
});
