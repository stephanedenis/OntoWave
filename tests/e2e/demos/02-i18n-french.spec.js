// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Démo 02 - i18n Detection Français', () => {
  test('should detect French browser language', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/02-i18n-french.html');
    await page.waitForLoadState('networkidle');
    
    // Get browser language
    const browserLang = await page.evaluate(() => navigator.language);
    console.log('📊 Browser language:', browserLang);
    
    // Screenshot 1: Initial load
    await page.screenshot({ path: 'test-results/demo-02-initial.png', fullPage: true });
  });

  test('should redirect to index.fr.md', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/02-i18n-french.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for redirection
    await page.waitForTimeout(2000);
    
    // Check hash
    const hash = await page.evaluate(() => location.hash);
    console.log('📊 Current hash:', hash);
    expect(hash).toBe('#demos/index.fr.md');
    
    // Screenshot 2: After redirection
    await page.screenshot({ path: 'test-results/demo-02-redirected.png', fullPage: true });
  });

  test('should display French content', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/02-i18n-french.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for French text
    const content = await page.content();
    expect(content).toContain('français');
    
    // Screenshot 3: French content
    await page.screenshot({ path: 'test-results/demo-02-french-content.png', fullPage: true });
  });

  test('should show success message', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/02-i18n-french.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Wait for success indicator
    await page.waitForSelector('#result:has-text("SUCCÈS")', { timeout: 3000 });
    
    const resultText = await page.locator('#result').textContent();
    console.log('📊 Result:', resultText);
    expect(resultText).toContain('SUCCÈS');
    
    // Screenshot 4: Success indicator
    await page.screenshot({ path: 'test-results/demo-02-success.png', fullPage: true });
  });

  test('should log DEMO_02_SUCCESS to console', async ({ page }) => {
    const logs = /** @type {string[]} */ ([]);
    page.on('console', msg => {
      if (msg.text().includes('DEMO_02_SUCCESS')) {
        logs.push(msg.text());
      }
    });

    await page.goto('http://localhost:8000/demos/02-i18n-french.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📊 Success logs:', logs);
    expect(logs.length).toBeGreaterThan(0);
    
    // Screenshot 5: Final state
    await page.screenshot({ path: 'test-results/demo-02-final.png', fullPage: true });
  });
});
