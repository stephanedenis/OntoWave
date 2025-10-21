/**
 * Test Démo 04 - i18n Fallback
 * Vérifie le fallback vers defaultLocale quand la langue du navigateur n'est pas disponible
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8000';

test.describe('Démo 04 - i18n Fallback', () => {
  test('should fallback to defaultLocale (French) when browser language (German) is not available', async ({ page }) => {
    console.log('🔄 Loading i18n Fallback demo (German → French)...');
    
    // Load demo page (simulates German browser)
    await page.goto(`${BASE_URL}/docs/demos/04-i18n-fallback.html`);
    
    // Wait for OntoWave to initialize
    await page.waitForTimeout(2000);
    
    // Check hash was set correctly to French source (fallback)
    const hash = await page.evaluate(() => location.hash);
    console.log(`📊 Location hash: ${hash}`);
    console.log(`📊 Should fallback to French (defaultLocale)`);
    
    expect(hash).toContain('test-i18n-french.md');
    expect(hash).toContain('fr');
    
    // Check H1 is rendered (French fallback content)
    const h1Count = await page.$$eval('h1', els => els.length);
    console.log(`📊 H1 elements: ${h1Count}`);
    expect(h1Count).toBeGreaterThan(0);
    
    // Check French-specific content (fallback)
    const bodyText = await page.evaluate(() => document.body.textContent);
    
    // Should contain French text (fallback)
    expect(bodyText).toContain('français');
    
    // Should NOT contain English text
    expect(bodyText).not.toContain('English content');
    
    console.log('✅ Fallback to defaultLocale works!');
  });
});
