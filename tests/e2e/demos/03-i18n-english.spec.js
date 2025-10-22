// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Démo 03 - i18n Detection English', () => {
  test('should detect English browser language', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/03-i18n-english.html');
    await page.waitForLoadState('networkidle');
    
    // Get browser language (should be overridden to en-US)
    const browserLang = await page.evaluate(() => navigator.language);
    console.log('📊 Browser language:', browserLang);
    expect(browserLang).toBe('en-US');
    
    // Screenshot 1: Initial load
    await page.screenshot({ path: 'test-results/demo-03-initial.png', fullPage: true });
  });

  test('should redirect to index.en.md', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/03-i18n-english.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for redirection
    await page.waitForTimeout(2000);
    
    // Check hash
    const hash = await page.evaluate(() => location.hash);
    console.log('📊 Current hash:', hash);
    expect(hash).toBe('#demos/index.en.md');
    
    // Screenshot 2: After redirection
    await page.screenshot({ path: 'test-results/demo-03-redirected.png', fullPage: true });
  });

  test('should display English content', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/03-i18n-english.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for English text
    const content = await page.content();
    expect(content).toContain('English');
    
    // Screenshot 3: English content
    await page.screenshot({ path: 'test-results/demo-03-english-content.png', fullPage: true });
  });

  test('should show success message', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/03-i18n-english.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Wait for success indicator
    await page.waitForSelector('#result:has-text("SUCCESS")', { timeout: 3000 });
    
    const resultText = await page.locator('#result').textContent();
    console.log('📊 Result:', resultText);
    expect(resultText).toContain('SUCCESS');
    
    // Screenshot 4: Success indicator
    await page.screenshot({ path: 'test-results/demo-03-success.png', fullPage: true });
  });

  test('should log DEMO_03_SUCCESS to console', async ({ page }) => {
    const logs = /** @type {string[]} */ ([]);
    page.on('console', msg => {
      if (msg.text().includes('DEMO_03_SUCCESS')) {
        logs.push(msg.text());
      }
    });

    await page.goto('http://localhost:8000/demos/03-i18n-english.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📊 Success logs:', logs);
    expect(logs.length).toBeGreaterThan(0);
    
    // Screenshot 5: Final state
    await page.screenshot({ path: 'test-results/demo-03-final.png', fullPage: true });
  });
});
