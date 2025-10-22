// Test debug détaillé pour comprendre le chargement
import { test, expect } from '@playwright/test';

test.describe('Debug - Démo 01 PlantUML', () => {
  test('should debug OntoWave loading step by step', async ({ page }) => {
    const logs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      logs.push({ type: msg.type(), text });
      console.log(`[${msg.type()}]`, text);
    });
    
    page.on('requestfailed', request => {
      console.log('❌ Request failed:', request.url(), request.failure().errorText);
    });
    
    console.log('🔄 Step 1: Loading page...');
    await page.goto('http://localhost:8000/docs/demos/01-plantuml-minimal.html');
    
    console.log('🔄 Step 2: Waiting 2s for OntoWave script...');
    await page.waitForTimeout(2000);
    
    // Check if OntoWave loaded
    const hasOntoWave = await page.evaluate(() => {
      return typeof window.OntoWave !== 'undefined' ||
             document.body.className.includes('mode-') ||
             document.querySelector('#app') !== null;
    });
    console.log('📊 OntoWave detected:', hasOntoWave);
    
    console.log('🔄 Step 3: Waiting additional 4s for content...');
    await page.waitForTimeout(4000);
    
    // Get current state
    const state = await page.evaluate(() => {
      return {
        hash: location.hash,
        bodyClasses: document.body.className,
        appContent: document.querySelector('#app')?.innerHTML.substring(0, 300),
        h1Count: document.querySelectorAll('h1').length,
        svgCount: document.querySelectorAll('svg').length,
        elementCount: document.body.querySelectorAll('*').length
      };
    });
    
    console.log('📊 Current state:', state);
    
    await page.screenshot({ 
      path: 'test-results/debug-01-state.png', 
      fullPage: true 
    });
    
    // Check for error messages in DOM
    const errorText = await page.locator('body').textContent();
    if (errorText.includes('404') || errorText.includes('Not found')) {
      console.log('⚠️  Page shows 404 error');
      console.log('Error content:', errorText.substring(0, 500));
    }
    
    console.log('📊 Total console logs:', logs.length);
    console.log('📊 Error logs:', logs.filter(l => l.type === 'error').length);
  });
});
