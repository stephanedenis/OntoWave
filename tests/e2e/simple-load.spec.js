// Test simple de chargement OntoWave de base
import { test, expect } from '@playwright/test';

test.describe('OntoWave - Test Simple de Chargement', () => {
  test('should load OntoWave and initialize without errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      console.log(`[Browser] ${msg.type()}: ${msg.text()}`);
    });
    
    // Navigate to simple test page
    await page.goto('http://localhost:8000/docs/test-simple.html');
    
    // Wait for OntoWave to initialize
    await page.waitForTimeout(3000);
    
    // Check no errors
    console.log('📊 Console errors:', consoleErrors);
    expect(consoleErrors).toHaveLength(0);
    
    // Check app element exists
    const app = await page.locator('#app').count();
    console.log('📊 App element found:', app > 0);
    expect(app).toBeGreaterThan(0);
    
    // Check body has elements (OntoWave initialized)
    const elementCount = await page.locator('body *').count();
    console.log('📊 Total elements in body:', elementCount);
    expect(elementCount).toBeGreaterThan(5);
    
    // Screenshot
    await page.screenshot({ path: 'test-results/simple-test-loaded.png', fullPage: true });
  });
});
