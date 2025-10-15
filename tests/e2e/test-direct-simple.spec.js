import { test, expect } from '@playwright/test';

test('test simple direct ontowave.min.js', async ({ page }) => {
  page.on('console', msg => console.log('Console:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  await page.goto('http://127.0.0.1:8090/test-simple-direct.html');
  
  await page.waitForTimeout(2000);
  
  const tableCount = await page.locator('table').count();
  console.log(`Tables trouvées: ${tableCount}`);
  
  if (tableCount > 0) {
    console.log('✅ SUCCESS - OntoWave fonctionne !');
    
    const firstTable = page.locator('table').first();
    const styles = await firstTable.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        borderCollapse: computed.borderCollapse,
        border: computed.border
      };
    });
    console.log('Styles:', styles);
  } else {
    const content = await page.locator('#content').textContent();
    console.log('Contenu:', content);
  }
  
  await page.screenshot({ path: 'TEST-DIRECT-SIMPLE.png' });
});