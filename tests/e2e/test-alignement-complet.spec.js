import { test, expect } from '@playwright/test';

test.describe('OntoWave - Test Complet Alignement Tableaux', () => {
  
  test('Doit rendre correctement tous les types d\'alignement de tableaux', async ({ page }) => {
    // Démarrer le serveur HTTP pour les tests
    await page.goto('http://localhost:8090/test-alignement-tableaux.html');
    
    // Attendre que le rendu soit terminé
    await page.waitForTimeout(2000);
    
    // Vérifier la présence des tableaux
    const tables = await page.locator('table').count();
    console.log(`📊 Nombre de tableaux détectés: ${tables}`);
    expect(tables).toBeGreaterThan(5);
    
    // Test alignement GAUCHE (:---)
    const leftAlignedCells = await page.locator('.text-left').count();
    console.log(`⬅️ Cellules alignées à gauche: ${leftAlignedCells}`);
    expect(leftAlignedCells).toBeGreaterThan(10);
    
    // Test alignement CENTRE (:---:)
    const centerAlignedCells = await page.locator('.text-center').count();
    console.log(`⬆️ Cellules centrées: ${centerAlignedCells}`);
    expect(centerAlignedCells).toBeGreaterThan(15);
    
    // Test alignement DROITE (---:)
    const rightAlignedCells = await page.locator('.text-right').count();
    console.log(`➡️ Cellules alignées à droite: ${rightAlignedCells}`);
    expect(rightAlignedCells).toBeGreaterThan(5);
    
    // Vérifier les styles CSS appliqués
    const tableStyles = await page.evaluate(() => {
      const style = document.querySelector('style');
      return style ? style.textContent.includes('text-align: center') : false;
    });
    expect(tableStyles).toBe(true);
    
    // Vérifier la structure d'un tableau spécifique
    const firstTable = page.locator('table').first();
    const headers = await firstTable.locator('th').count();
    console.log(`📋 Headers dans le premier tableau: ${headers}`);
    expect(headers).toBeGreaterThan(3);
    
    // Vérifier les données financières (alignement droite pour les prix)
    const priceColumns = await page.locator('td.text-right:has-text("€")').count();
    console.log(`💰 Colonnes de prix alignées à droite: ${priceColumns}`);
    expect(priceColumns).toBeGreaterThan(5);
    
    // Vérifier les icônes dans les cellules centrées
    const iconCells = await page.locator('td.text-center:has-text("✅"), td.text-center:has-text("⚠️"), td.text-center:has-text("❌")').count();
    console.log(`🎯 Cellules avec icônes centrées: ${iconCells}`);
    expect(iconCells).toBeGreaterThan(10);
    
    // Test responsive - vérifier sur mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileTable = page.locator('table').first();
    const mobileWidth = await mobileTable.evaluate(el => el.offsetWidth);
    console.log(`📱 Largeur table en mode mobile: ${mobileWidth}px`);
    expect(mobileWidth).toBeLessThan(400);
    
    // Revenir au desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Vérifier les cellules vides (devrait avoir un tiret)
    const emptyCells = await page.evaluate(() => {
      const cells = document.querySelectorAll('td:empty');
      return Array.from(cells).map(cell => getComputedStyle(cell, '::before').content);
    });
    console.log(`📝 Cellules vides détectées: ${emptyCells.length}`);
    
    // Screenshot pour validation visuelle
    await page.screenshot({ 
      path: 'test-alignement-complet.png', 
      fullPage: true 
    });
    
    console.log('✅ Test complet d\'alignement des tableaux réussi !');
  });

  test('Doit valider la syntaxe markdown des alignements', async ({ page }) => {
    await page.goto('http://localhost:8090/test-alignement-tableaux.html');
    await page.waitForTimeout(1500);
    
    // Vérifier que les différents types d'alignement sont appliqués
    const alignmentTests = [
      { selector: '.text-left', name: 'Gauche (:---)', minCount: 10 },
      { selector: '.text-center', name: 'Centre (:---:)', minCount: 15 },
      { selector: '.text-right', name: 'Droite (---:)', minCount: 5 }
    ];
    
    for (const test of alignmentTests) {
      const count = await page.locator(test.selector).count();
      console.log(`🔍 ${test.name}: ${count} éléments`);
      expect(count).toBeGreaterThanOrEqual(test.minCount);
    }
    
    // Vérifier l'application correcte des styles
    const centerStyle = await page.locator('.text-center').first().evaluate(el => 
      getComputedStyle(el).textAlign
    );
    expect(centerStyle).toBe('center');
    
    const rightStyle = await page.locator('.text-right').first().evaluate(el => 
      getComputedStyle(el).textAlign
    );
    expect(rightStyle).toBe('right');
    
    console.log('✅ Validation syntaxe markdown alignements réussie !');
  });

  test('Doit gérer les tableaux complexes avec cellules vides', async ({ page }) => {
    await page.goto('http://localhost:8090/test-alignement-tableaux.html');
    await page.waitForTimeout(1500);
    
    // Vérifier la gestion des cellules vides
    const emptyPattern = await page.evaluate(() => {
      const emptyCells = document.querySelectorAll('td:empty');
      return emptyCells.length > 0;
    });
    
    console.log(`📋 Cellules vides gérées: ${emptyPattern}`);
    
    // Vérifier les tableaux avec données mixtes (texte, nombres, icônes)
    const mixedContent = await page.locator('td:has-text("€"), td:has-text("✅"), td:has-text("MHz")').count();
    console.log(`🔀 Contenus mixtes détectés: ${mixedContent}`);
    expect(mixedContent).toBeGreaterThan(10);
    
    console.log('✅ Test tableaux complexes réussi !');
  });

});