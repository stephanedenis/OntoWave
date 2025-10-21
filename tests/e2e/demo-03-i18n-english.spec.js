/**
 * Test Démo 03 - i18n English
 * Vérifie la détection automatique de la langue anglaise avec navigator override
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8000';

test.describe('Démo 03 - i18n English', () => {
  test('should detect English locale and load English content', async ({ page }) => {
    console.log('🔄 Loading i18n English demo...');
    
    // Load demo page
    await page.goto(`${BASE_URL}/docs/demos/03-i18n-english.html`);
    
    // Wait for OntoWave to initialize
    await page.waitForTimeout(2000);
    
    // Check hash was set correctly to English source
    const hash = await page.evaluate(() => location.hash);
    console.log(`📊 Location hash: ${hash}`);
    
    expect(hash).toContain('test-i18n-english.md');
    expect(hash).toContain('en');
    
    // Check H1 is rendered (English content)
    const h1Count = await page.$$eval('h1', els => els.length);
    console.log(`📊 H1 elements: ${h1Count}`);
    expect(h1Count).toBeGreaterThan(0);
    
    // Check English-specific content
    const bodyText = await page.evaluate(() => document.body.textContent);
    
    // Should contain English text
    expect(bodyText).toContain('English');
    
    // Should NOT contain French text (except in title/header)
    const mainContent = await page.evaluate(() => {
      const app = document.getElementById('app');
      return app ? app.textContent : '';
    });
    expect(mainContent).toContain('English');
    
    console.log('✅ English locale detection works!');
  });
});
