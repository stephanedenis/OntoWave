// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Démo 01 - PlantUML Minimal (Sans Wrappers)', () => {
  test('should load page without errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:8000/demos/01-plantuml-minimal.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for OntoWave to load
    await page.waitForTimeout(4000);
    
    // Screenshot 1: Initial page load
    await page.screenshot({ path: 'test-results/demo-01-initial-load.png', fullPage: true });
    
    // Verify no console errors
    console.log('📊 Console errors:', consoleErrors.length);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should have no wrapper classes', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/01-plantuml-minimal.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    
    // Check for wrapper classes
    const plantumlWrappers = await page.locator('.plantuml-diagram-wrapper').count();
    const diagramWrappers = await page.locator('.diagram').count();
    const mermaidWrappers = await page.locator('.mermaid').count();
    
    console.log('📊 Wrapper counts:', {
      plantuml: plantumlWrappers,
      diagram: diagramWrappers,
      mermaid: mermaidWrappers
    });
    
    expect(plantumlWrappers).toBe(0);
    expect(diagramWrappers).toBe(0);
    expect(mermaidWrappers).toBe(0);
    
    // Screenshot 2: No wrappers verification
    await page.screenshot({ path: 'test-results/demo-01-no-wrappers.png', fullPage: true });
  });

  test('should have SVG elements directly in DOM', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/01-plantuml-minimal.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    
    // Count SVG elements
    const svgCount = await page.locator('svg').count();
    console.log('📊 SVG count:', svgCount);
    expect(svgCount).toBeGreaterThan(0);
    
    // Verify SVG are direct children (no wrappers)
    const appSvgs = await page.locator('#app > svg, #app svg').count();
    console.log('📊 SVG in #app:', appSvgs);
    expect(appSvgs).toBeGreaterThan(0);
    
    // Screenshot 3: SVG elements present
    await page.screenshot({ path: 'test-results/demo-01-svg-present.png', fullPage: true });
  });

  test('should display check results', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/01-plantuml-minimal.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    
    // Wait for checks to complete
    await page.waitForSelector('#checks .check-item', { timeout: 5000 });
    
    // Count check items
    const checkItems = await page.locator('#checks .check-item').count();
    console.log('📊 Check items:', checkItems);
    expect(checkItems).toBeGreaterThan(0);
    
    // Verify all checks passed (contains ✅)
    const passedChecks = await page.locator('#checks .check-item:has-text("✅")').count();
    console.log('📊 Passed checks:', passedChecks);
    expect(passedChecks).toBeGreaterThan(0);
    
    // Screenshot 4: Check results
    await page.screenshot({ path: 'test-results/demo-01-check-results.png', fullPage: true });
  });

  test('should log DEMO_01_CHECKS to console', async ({ page }) => {
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('DEMO_01_CHECKS')) {
        logs.push(msg.text());
      }
    });

    await page.goto('http://localhost:8000/demos/01-plantuml-minimal.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    
    console.log('📊 Demo logs:', logs);
    expect(logs.length).toBeGreaterThan(0);
    
    // Screenshot 5: Final state
    await page.screenshot({ path: 'test-results/demo-01-final.png', fullPage: true });
  });
});
