// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Démo 05 - PlantUML Links', () => {
  test('should load page and detect SVG links', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/05-plantuml-links.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000); // Wait for OntoWave to render
    
    // Count SVG links
    const linkCount = await page.evaluate(() => {
      return document.querySelectorAll('svg a[href]').length;
    });
    
    console.log('📊 SVG links detected:', linkCount);
    expect(linkCount).toBeGreaterThan(0);
    
    // Screenshot 1: Initial load with SVG links
    await page.screenshot({ path: 'test-results/demo-05-initial-links.png', fullPage: true });
  });

  test('should display navigation log UI', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/05-plantuml-links.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    
    // Check for navigation log container
    const logVisible = await page.locator('#navigation-log').isVisible();
    expect(logVisible).toBe(true);
    
    console.log('📊 Navigation log UI visible:', logVisible);
    
    // Screenshot 2: Navigation log UI
    await page.screenshot({ path: 'test-results/demo-05-nav-log-ui.png', fullPage: true });
  });

  test('should navigate when clicking SVG links', async ({ page }) => {
    const navigationEvents = /** @type {string[]} */ ([]);
    
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        navigationEvents.push(frame.url());
      }
    });

    await page.goto('http://localhost:8000/demos/05-plantuml-links.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    
    // Get initial hash
    const initialHash = await page.evaluate(() => location.hash);
    console.log('📊 Initial hash:', initialHash);
    
    // Click first SVG link (if exists)
    const linkExists = await page.locator('svg a[href]').first().isVisible();
    if (linkExists) {
      await page.locator('svg a[href]').first().click();
      await page.waitForTimeout(1000);
      
      const newHash = await page.evaluate(() => location.hash);
      console.log('📊 New hash after click:', newHash);
      expect(newHash).not.toBe(initialHash);
    }
    
    // Screenshot 3: After navigation
    await page.screenshot({ path: 'test-results/demo-05-after-nav.png', fullPage: true });
  });

  test('should update navigation log on hash change', async ({ page }) => {
    await page.goto('http://localhost:8000/demos/05-plantuml-links.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    
    // Get initial log entries
    const initialEntries = await page.locator('#log-entries .log-entry').count();
    console.log('📊 Initial log entries:', initialEntries);
    
    // Click SVG link to trigger navigation
    const linkExists = await page.locator('svg a[href]').first().isVisible();
    if (linkExists) {
      await page.locator('svg a[href]').first().click();
      await page.waitForTimeout(1500);
      
      // Check for new log entries
      const newEntries = await page.locator('#log-entries .log-entry').count();
      console.log('📊 New log entries:', newEntries);
      expect(newEntries).toBeGreaterThan(initialEntries);
    }
    
    // Screenshot 4: Updated navigation log
    await page.screenshot({ path: 'test-results/demo-05-updated-log.png', fullPage: true });
  });

  test('should log DEMO_05_NAVIGATION to console', async ({ page }) => {
    const logs = /** @type {string[]} */ ([]);
    page.on('console', msg => {
      if (msg.text().includes('DEMO_05_NAVIGATION')) {
        logs.push(msg.text());
      }
    });

    await page.goto('http://localhost:8000/demos/05-plantuml-links.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    
    // Click link to trigger navigation event
    const linkExists = await page.locator('svg a[href]').first().isVisible();
    if (linkExists) {
      await page.locator('svg a[href]').first().click();
      await page.waitForTimeout(2000);
    }
    
    console.log('📊 Navigation logs:', logs);
    expect(logs.length).toBeGreaterThan(0);
    
    // Screenshot 5: Final state with console logs
    await page.screenshot({ path: 'test-results/demo-05-final.png', fullPage: true });
  });
});
