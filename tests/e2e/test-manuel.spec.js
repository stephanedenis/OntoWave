import { test, expect } from '@playwright/test';

test('test manuel OntoWave tableaux', async ({ page }) => {
  page.on('console', msg => console.log('📢', msg.text()));
  page.on('pageerror', err => console.log('💥', err.message));
  
  await page.goto('http://127.0.0.1:8090/test-manuel.html');
  
  await page.waitForTimeout(3000);
  
  const tableCount = await page.locator('table').count();
  console.log(`🔢 Tables trouvées: ${tableCount}`);
  
  if (tableCount > 0) {
    console.log('🎉 SUCCÈS - OntoWave render les tableaux !');
    
    const firstTable = page.locator('table').first();
    await expect(firstTable).toBeVisible();
    
    const styles = await firstTable.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        borderCollapse: computed.borderCollapse,
        border: computed.border,
        width: computed.width
      };
    });
    console.log('🎨 Styles appliqués:', styles);
    
    const headerCount = await firstTable.locator('th').count();
    const cellCount = await firstTable.locator('td').count();
    console.log(`📊 Structure: ${headerCount} headers, ${cellCount} cellules`);
    
    if (headerCount > 0) {
      const headerStyle = await firstTable.locator('th').first().evaluate(el => {
        return window.getComputedStyle(el).fontWeight;
      });
      console.log('📝 Header font-weight:', headerStyle);
    }
    
  } else {
    const content = await page.locator('#content').textContent();
    console.log('📄 Contenu affiché:', content?.substring(0, 100));
  }
  
  await page.screenshot({ 
    path: 'TEST-MANUEL-ONTOWAVE-TABLEAUX.png',
    fullPage: true 
  });
  
  expect(tableCount).toBeGreaterThan(0);
});