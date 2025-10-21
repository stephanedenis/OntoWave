import { test, expect } from '@playwright/test';

test('validation finale OntoWave tableaux', async ({ page }) => {
  // Écouter la console pour debug
  page.on('console', msg => console.log('🖥️  Console:', msg.text()));
  page.on('pageerror', err => console.log('❌ Error:', err.message));
  
  console.log('🚀 Début test validation finale OntoWave tableaux');
  
  // Aller à la page finale
  await page.goto('http://127.0.0.1:8090/test-final.html');
  
  // Attendre le chargement initial
  await page.waitForTimeout(2000);
  
  // Vérifier que la navigation s'est faite
  const url = page.url();
  console.log('🔗 URL après navigation:', url);
  
  // Attendre plus longtemps pour le rendu des tableaux
  await page.waitForTimeout(5000);
  
  // Chercher des tableaux
  const tableCount = await page.locator('table').count();
  console.log('📊 Nombre de tableaux trouvés:', tableCount);
  
  if (tableCount > 0) {
    console.log('🎉 SUCCÈS ! Tableaux détectés !');
    
    // Test détaillé du premier tableau
    const firstTable = page.locator('table').first();
    await expect(firstTable).toBeVisible();
    
    // Compter headers et cellules
    const headerCount = await firstTable.locator('th').count();
    const cellCount = await firstTable.locator('td').count();
    console.log(`📋 Structure table: ${headerCount} headers, ${cellCount} cellules`);
    
    // Vérifier que les styles CSS du fix sont appliqués
    const tableStyles = await firstTable.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        borderCollapse: computed.borderCollapse,
        width: computed.width,
        margin: computed.margin,
        backgroundColor: computed.backgroundColor
      };
    });
    
    console.log('🎨 Styles table appliqués:', tableStyles);
    
    // Vérifier spécifiquement la fix: border-collapse devrait être 'collapse'
    expect(tableStyles.borderCollapse).toBe('collapse');
    console.log('✅ CSS Fix validé: border-collapse = collapse');
    
    // Vérifier les styles des headers (fix: gras)
    if (headerCount > 0) {
      const headerStyles = await firstTable.locator('th').first().evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          fontWeight: computed.fontWeight,
          backgroundColor: computed.backgroundColor,
          borderWidth: computed.borderWidth
        };
      });
      
      console.log('📝 Styles headers:', headerStyles);
      
      // Header devrait être en gras (700 ou bold)
      const isBold = headerStyles.fontWeight === 'bold' || parseInt(headerStyles.fontWeight) >= 600;
      expect(isBold).toBe(true);
      console.log('✅ Headers Fix validé: fontWeight gras détecté');
    }
    
    // Vérifier zebra striping (si plusieurs lignes)
    const rowCount = await firstTable.locator('tbody tr').count();
    if (rowCount > 1) {
      const secondRowStyle = await firstTable.locator('tbody tr').nth(1).evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log('🦓 Zebra striping détecté:', secondRowStyle !== 'rgba(0, 0, 0, 0)');
    }
    
    console.log(`🎯 Test réussi: ${tableCount} tableaux avec styles CSS complets`);
    
  } else {
    console.log('❌ ÉCHEC: Aucun tableau détecté');
    
    // Debug: contenu actuel
    const content = await page.locator('#content').textContent();
    console.log('📄 Contenu actuel:', content?.substring(0, 300) || 'vide');
    
    // Debug: vérifier si OntoWave est chargé
    const ontoWaveLoaded = await page.evaluate(() => {
      return typeof window.OntoWave !== 'undefined';
    });
    console.log('🌊 OntoWave chargé:', ontoWaveLoaded);
  }
  
  // Capture d'écran finale
  await page.screenshot({
    path: 'VALIDATION-FINALE-TABLEAUX-ONTOWAVE.png',
    fullPage: true
  });
  
  console.log('📸 Capture d\'écran finale sauvegardée');
  console.log('🏁 Test validation finale terminé');
  
  // Le test doit réussir si on a trouvé au moins un tableau
  expect(tableCount).toBeGreaterThan(0);
});