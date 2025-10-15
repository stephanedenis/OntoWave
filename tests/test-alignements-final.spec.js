const { test, expect } = require('@playwright/test');

test('Validation finale alignements tableaux OntoWave', async ({ page }) => {
  // Écouter les logs de console
  page.on('console', msg => {
    if (msg.text().includes('🚀') || msg.text().includes('✅') || msg.text().includes('💥')) {
      console.log('BROWSER:', msg.text());
    }
  });
  
  // Aller sur notre page de test
  await page.goto('http://localhost:8090/test-final-alignements.html');
  
  // Attendre que OntoWave traite le contenu
  await page.waitForTimeout(4000);
  
  // Vérifier qu'au moins 3 tableaux sont générés
  const tables = await page.locator('table').count();
  console.log(`✅ Tableaux générés: ${tables}`);
  expect(tables).toBeGreaterThanOrEqual(3);
  
  // Vérifier que le CSS est injecté
  const styleElement = await page.locator('#ontowave-table-styles').count();
  console.log(`✅ Style CSS injecté: ${styleElement > 0}`);
  expect(styleElement).toBe(1);
  
  // Vérifier les classes d'alignement
  const leftCells = await page.locator('.text-left').count();
  const centerCells = await page.locator('.text-center').count();
  const rightCells = await page.locator('.text-right').count();
  
  console.log(`✅ Cellules text-left: ${leftCells}`);
  console.log(`✅ Cellules text-center: ${centerCells}`);  
  console.log(`✅ Cellules text-right: ${rightCells}`);
  
  expect(leftCells).toBeGreaterThan(0);
  expect(centerCells).toBeGreaterThan(0);
  expect(rightCells).toBeGreaterThan(0);
  
  // Vérifier l'alignement CSS effectif sur quelques cellules
  const firstLeftCell = page.locator('.text-left').first();
  const firstCenterCell = page.locator('.text-center').first();
  const firstRightCell = page.locator('.text-right').first();
  
  const leftAlign = await firstLeftCell.evaluate(el => window.getComputedStyle(el).textAlign);
  const centerAlign = await firstCenterCell.evaluate(el => window.getComputedStyle(el).textAlign);
  const rightAlign = await firstRightCell.evaluate(el => window.getComputedStyle(el).textAlign);
  
  console.log(`✅ Alignement effectif - Left: ${leftAlign}, Center: ${centerAlign}, Right: ${rightAlign}`);
  
  expect(leftAlign).toBe('left');
  expect(centerAlign).toBe('center');
  expect(rightAlign).toBe('right');
  
  // Capture d'écran pour validation visuelle
  await page.screenshot({ 
    path: 'validation-alignements-final.png', 
    fullPage: true 
  });
  
  console.log('🎉 TOUS LES TESTS D\'ALIGNEMENT RÉUSSIS !');
});