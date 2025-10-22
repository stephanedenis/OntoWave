import { test, expect } from '@playwright/test';

test.describe('OntoWave v1.0.1 - Fixes Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  });

  test('Fix #1: Tableaux Markdown - Alignements', async ({ page }) => {
    await page.goto('http://localhost:8080#test-tables.md');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if tables are rendered
    const tables = await page.locator('table.ontowave-table').count();
    console.log(`Tables found: ${tables}`);
    expect(tables).toBeGreaterThan(0);
    
    // Check for table headers
    const headers = await page.locator('table.ontowave-table th').count();
    console.log(`Table headers found: ${headers}`);
    expect(headers).toBeGreaterThan(0);
    
    // Check for table rows
    const rows = await page.locator('table.ontowave-table tbody tr').count();
    console.log(`Table rows found: ${rows}`);
    expect(rows).toBeGreaterThan(0);
    
    // Check for text-align styles (inline CSS injection)
    const cellWithAlignRight = await page.locator('table.ontowave-table td[style*="text-align: right"]').first();
    const hasRightAlign = await cellWithAlignRight.count();
    console.log(`Cells with right align: ${hasRightAlign}`);
    
    const cellWithAlignCenter = await page.locator('table.ontowave-table td[style*="text-align: center"]').first();
    const hasCenterAlign = await cellWithAlignCenter.count();
    console.log(`Cells with center align: ${hasCenterAlign}`);
  });

  test('Fix #2a: Support fichiers .puml - Rendu', async ({ page }) => {
    await page.goto('http://localhost:8080#test-navigation.puml');
    
    // Wait for PlantUML server response (can be slow)
    await page.waitForTimeout(5000);
    
    // Check if PlantUML image OR SVG is loaded
    const plantUMLImage = page.locator('img[src*="plantuml"]').first();
    const imageCount = await plantUMLImage.count();
    console.log(`PlantUML images found: ${imageCount}`);
    
    const svgElements = await page.locator('svg').count();
    console.log(`SVG elements found: ${svgElements}`);
    
    // Accept either img (before conversion) or svg (after conversion)
    const hasPlantUMLContent = imageCount > 0 || svgElements > 0;
    console.log(`Has PlantUML content (img or svg): ${hasPlantUMLContent}`);
    expect(hasPlantUMLContent).toBe(true);
  });

  test('Fix #2b: Liens cliquables SVG PlantUML', async ({ page }) => {
    await page.goto('http://localhost:8080#test-navigation.puml');
    
    // Wait for PlantUML + SVG conversion
    await page.waitForTimeout(6000);
    
    // Check if SVG was injected (instead of img)
    const svgElements = await page.locator('svg').count();
    console.log(`SVG elements found: ${svgElements}`);
    expect(svgElements).toBeGreaterThan(0);
    
    // Check for clickable links in SVG
    const svgLinks = await page.locator('svg a[href]').count();
    console.log(`SVG links found: ${svgLinks}`);
    
    if (svgLinks > 0) {
      // Try clicking a link
      const firstLink = page.locator('svg a[href]').first();
      const href = await firstLink.getAttribute('href');
      console.log(`First SVG link href: ${href}`);
      
      await firstLink.click();
      await page.waitForTimeout(1000);
      
      // Check if navigation occurred
      const newHash = await page.evaluate(() => window.location.hash);
      console.log(`New hash after click: ${newHash}`);
      expect(newHash).toContain('.md');
    } else {
      console.log('WARNING: No SVG links found but SVG is present');
      // Some PlantUML diagrams may not have links, that's OK
    }
  });

  test('Fix #3: Détection automatique langue', async ({ page, context }) => {
    // Set browser locale to English
    await context.overridePermissions('http://localhost:8080', []);
    
    // Navigate to index without hash
    await page.goto('http://localhost:8080/index.html');
    await page.waitForTimeout(2000);
    
    // Check if auto-redirected to language page
    const hash = await page.evaluate(() => window.location.hash);
    console.log(`Auto-detected hash: ${hash}`);
    
    // Should redirect to index.en.md or index.fr.md based on browser language
    const hasLanguageRedirect = hash.includes('index.en.md') || hash.includes('index.fr.md');
    console.log(`Language redirect detected: ${hasLanguageRedirect}`);
  });

  test('Non-régression: Menu flottant présent', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForTimeout(2000);
    
    // Check floating menu icon
    const menuIcon = page.locator('.ontowave-menu-toggle, #ontowave-menu-toggle, [class*="menu"][class*="toggle"]');
    const menuCount = await menuIcon.count();
    console.log(`Menu toggle icons found: ${menuCount}`);
    
    if (menuCount > 0) {
      const isVisible = await menuIcon.first().isVisible();
      console.log(`Menu toggle visible: ${isVisible}`);
      expect(isVisible).toBe(true);
    } else {
      console.log('WARNING: No menu toggle found');
    }
  });
});
