/**
 * Test Démo 02 - i18n French
 * Vérifie la détection automatique de la langue française
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8000';

test.describe('Démo 02 - i18n French', () => {
  test('should detect French locale and load French content', async ({ page }) => {
    console.log('🔄 Loading i18n French demo...');
    
    // Load demo page
    await page.goto(`${BASE_URL}/docs/demos/02-i18n-french.html`);
    
    // Wait for OntoWave to initialize
    await page.waitForTimeout(2000);
    
    // Check hash was set correctly to French source
    const hash = await page.evaluate(() => location.hash);
    console.log(`📊 Location hash: ${hash}`);
    
    expect(hash).toContain('test-i18n-french.md');
    expect(hash).toContain('fr');
    
    // Check H1 is rendered (French content)
    const h1Count = await page.$$eval('h1', els => els.length);
    console.log(`📊 H1 elements: ${h1Count}`);
    expect(h1Count).toBeGreaterThan(0);
    
    // Check French-specific content
    const bodyText = await page.evaluate(() => document.body.textContent);
    
    // Should contain French text
    expect(bodyText).toContain('français');
    
    // Should NOT contain English text
    expect(bodyText).not.toContain('English');
    
    console.log('✅ French locale detection works!');
  });
});
