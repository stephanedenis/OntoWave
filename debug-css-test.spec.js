const { test, expect } = require('@playwright/test');

test('Debug CSS alignement tableaux', async ({ page }) => {
  // Activer les logs de console
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  // Aller sur la page de test
  await page.goto('http://localhost:8090/test-debug-css.html');
  
  // Attendre que le JavaScript s'exécute
  await page.waitForTimeout(3000);
  
  // Vérifier qu'un tableau est rendu
  const tables = await page.locator('table').count();
  console.log('✅ Tableaux rendus:', tables);
  
  // Vérifier les classes CSS
  const cellsWithClasses = await page.locator('td[class], th[class]').count();
  console.log('✅ Cellules avec classes:', cellsWithClasses);
  
  // Prendre une capture
  await page.screenshot({ path: 'debug-css-alignement.png', fullPage: true });
  
  // Vérifier que les styles text-align sont appliqués
  const leftCells = await page.locator('.text-left').count();
  const centerCells = await page.locator('.text-center').count();
  const rightCells = await page.locator('.text-right').count();
  
  console.log('✅ Cellules text-left:', leftCells);
  console.log('✅ Cellules text-center:', centerCells);
  console.log('✅ Cellules text-right:', rightCells);
  
  // Vérifier le CSS computed
  const firstCell = page.locator('td').first();
  if (await firstCell.count() > 0) {
    const textAlign = await firstCell.evaluate(el => 
      window.getComputedStyle(el).textAlign
    );
    console.log('✅ Text-align calculé:', textAlign);
  }
});