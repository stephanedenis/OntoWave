import { test, expect } from '@playwright/test';

test('test working OntoWave version', async ({ page }) => {
  // Écouter la console
  page.on('console', msg => console.log('🖥️  Console:', msg.text()));
  page.on('pageerror', err => console.log('❌ Error:', err.message));
  
  // Aller à la version working
  await page.goto('http://127.0.0.1:8090/test-working.html');
  
  // Attendre le chargement et navigation
  await page.waitForTimeout(3000);
  
  // Vérifier si on a navigué vers le hash
  const url = page.url();
  console.log('🔗 URL finale:', url);
  
  // Attendre encore un peu pour le rendu
  await page.waitForTimeout(2000);
  
  // Chercher des tableaux
  const tableCount = await page.locator('table').count();
  console.log('📊 Nombre de tableaux:', tableCount);
  
  if (tableCount > 0) {
    console.log('✅ SUCCÈS - Tables trouvées !');
    
    // Vérifier le premier tableau
    const firstTable = page.locator('table').first();
    await expect(firstTable).toBeVisible();
    
    // Vérifier les headers
    const headerCount = await firstTable.locator('th').count();
    console.log('📋 Headers:', headerCount);
    
    // Vérifier les cellules
    const cellCount = await firstTable.locator('td').count();
    console.log('📊 Cellules:', cellCount);
    
    // Vérifier les styles CSS injectés
    const tableStyle = await firstTable.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        borderCollapse: computed.borderCollapse,
        border: computed.border || computed.borderWidth,
        width: computed.width
      };
    });
    console.log('🎨 Styles tableau:', tableStyle);
    
    // Vérifier styles header
    if (headerCount > 0) {
      const headerStyle = await firstTable.locator('th').first().evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          fontWeight: computed.fontWeight,
          backgroundColor: computed.backgroundColor
        };
      });
      console.log('📝 Styles header:', headerStyle);
    }
    
  } else {
    console.log('❌ Aucun tableau trouvé');
    const content = await page.locator('#content').textContent();
    console.log('📄 Contenu actuel:', content.substring(0, 200));
  }
  
  // Capture finale
  await page.screenshot({
    path: 'TEST-WORKING-ONTOWAVE-FINAL.png',
    fullPage: true
  });
  
  console.log('🎯 Test working version terminé');
});