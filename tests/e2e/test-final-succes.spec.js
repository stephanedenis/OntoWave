import { test, expect } from '@playwright/test';

test('test final simple OntoWave', async ({ page }) => {
  page.on('console', msg => console.log('🔊', msg.text()));
  page.on('pageerror', err => console.log('💀', err.message));
  
  console.log('🚀 Test final OntoWave sans config.json');
  
  await page.goto('http://127.0.0.1:8090/test-final-simple.html');
  
  await page.waitForTimeout(3000);
  
  const tableCount = await page.locator('table').count();
  console.log(`🎯 RÉSULTAT: ${tableCount} tableaux trouvés`);
  
  if (tableCount > 0) {
    console.log('🎉 SUCCÈS TOTAL - OntoWave rend les tableaux !');
    
    const firstTable = page.locator('table').first();
    await expect(firstTable).toBeVisible();
    
    const tableStyles = await firstTable.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        borderCollapse: computed.borderCollapse,
        border: computed.border,
        width: computed.width,
        margin: computed.margin
      };
    });
    
    console.log('🎨 STYLES CSS APPLIQUÉS:', JSON.stringify(tableStyles, null, 2));
    
    // Vérifier le fix spécifique
    expect(tableStyles.borderCollapse).toBe('collapse');
    console.log('✅ FIX VALIDÉ: border-collapse = collapse');
    
    const headerCount = await firstTable.locator('th').count();
    const cellCount = await firstTable.locator('td').count();
    console.log(`📊 STRUCTURE: ${headerCount} headers, ${cellCount} cellules`);
    
    if (headerCount > 0) {
      const headerWeight = await firstTable.locator('th').first().evaluate(el => {
        return window.getComputedStyle(el).fontWeight;
      });
      console.log('📝 HEADER WEIGHT:', headerWeight);
      
      const isBold = headerWeight === 'bold' || parseInt(headerWeight) >= 600;
      expect(isBold).toBe(true);
      console.log('✅ HEADERS EN GRAS VALIDÉS');
    }
    
    console.log('🏆 TOUS LES TESTS RÉUSSIS - FIX TABLEAUX ONTOWAVE COMPLET');
    
  } else {
    console.log('💥 ÉCHEC - Aucun tableau trouvé');
    const content = await page.locator('#content').textContent();
    console.log('📄 Contenu:', content?.substring(0, 200));
  }
  
  await page.screenshot({ 
    path: 'TEST-FINAL-ONTOWAVE-TABLEAUX-SUCCES.png',
    fullPage: true 
  });
  
  console.log('📸 Capture finale sauvegardée');
  
  expect(tableCount).toBeGreaterThan(0);
});