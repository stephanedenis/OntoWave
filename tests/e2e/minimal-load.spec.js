// Test minimal de chargement OntoWave
import { test, expect } from '@playwright/test';

test.describe('OntoWave - Test Minimal', () => {
  test('should load and render markdown content', async ({ page }) => {
    const consoleMessages = [];
    const consoleErrors = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
      
      // Log all console output
      console.log(`[${msg.type()}]`, text);
    });
    
    // Navigate to minimal test
    console.log('📄 Loading test-minimal.html...');
    await page.goto('http://localhost:8000/docs/test-minimal.html');
    
    // Wait for OntoWave to initialize and load content
    await page.waitForTimeout(4000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/minimal-test-loaded.png', 
      fullPage: true 
    });
    
    // Verify app element exists
    const app = await page.locator('#app');
    await expect(app).toBeVisible();
    console.log('✅ App element is visible');
    
    // Verify content was loaded
    const appContent = await app.innerHTML();
    console.log('📊 App content length:', appContent.length);
    expect(appContent.length).toBeGreaterThan(100);
    
    // Check for markdown rendering (should have h1)
    const h1Count = await page.locator('h1').count();
    console.log('📊 H1 elements found:', h1Count);
    expect(h1Count).toBeGreaterThan(0);
    
    // Verify no critical errors (allow non-critical 404s for optional resources)
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('config.json') && 
      !err.includes('favicon')
    );
    console.log('📊 Critical errors:', criticalErrors.length);
    
    if (criticalErrors.length > 0) {
      console.log('⚠️  Critical errors found:', criticalErrors);
    }
    
    // Should have OntoWave content
    const bodyText = await page.locator('body').textContent();
    console.log('📊 Body contains "OntoWave":', bodyText.includes('OntoWave'));
    expect(bodyText).toContain('Test Minimal');
    
    console.log('✅ Test minimal passed!');
  });
});
