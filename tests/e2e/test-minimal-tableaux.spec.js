import { test, expect } from '@playwright/test';

test('test minimal OntoWave tableaux', async ({ page }) => {
  // Aller à la page de test minimal
  await page.goto('http://127.0.0.1:8090/test-minimal.html');
  
  // Attendre que le contenu soit chargé
  await page.waitForSelector('#content table', { timeout: 10000 });
  
  // Vérifier qu'il y a au moins un tableau
  const tables = await page.locator('table').count();
  console.log(`🔍 Nombre de tableaux trouvés: ${tables}`);
  expect(tables).toBeGreaterThan(0);
  
  // Vérifier le premier tableau
  const firstTable = page.locator('table').first();
  await expect(firstTable).toBeVisible();
  
  // Vérifier qu'il a des headers
  const headers = await firstTable.locator('th').count();
  console.log(`📋 Nombre de headers: ${headers}`);
  expect(headers).toBeGreaterThan(0);
  
  // Vérifier qu'il a des cellules de données
  const cells = await firstTable.locator('td').count();
  console.log(`📊 Nombre de cellules: ${cells}`);
  expect(cells).toBeGreaterThan(0);
  
  // Vérifier que les styles CSS sont appliqués
  const tableStyle = await firstTable.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      borderCollapse: computed.borderCollapse,
      border: computed.border,
      width: computed.width
    };
  });
  
  console.log('🎨 Styles table:', tableStyle);
  expect(tableStyle.borderCollapse).toBe('collapse');
  
  // Vérifier styles des headers
  const headerStyle = await firstTable.locator('th').first().evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      fontWeight: computed.fontWeight,
      border: computed.border
    };
  });
  
  console.log('📝 Styles header:', headerStyle);
  expect(headerStyle.fontWeight).toBe('bold');
  
  // Prendre une capture d'écran du résultat
  await page.screenshot({
    path: 'TEST-MINIMAL-TABLEAUX-ONTOWAVE.png',
    fullPage: true
  });
  
  console.log('✅ Test minimal OntoWave tableaux réussi!');
});