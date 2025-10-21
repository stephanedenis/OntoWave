import { test, expect } from '@playwright/test';

test('OntoWave - Test Alignement Tableaux Rapide', async ({ page }) => {
  console.log('🚀 Démarrage test alignement tableaux...');
  
  await page.goto('http://localhost:8090/test-alignement-tableaux.html');
  
  // Attendre le rendu
  await page.waitForTimeout(3000);
  
  // Compter les tableaux
  const tableCount = await page.locator('table').count();
  console.log(`📊 Tableaux détectés: ${tableCount}`);
  expect(tableCount).toBeGreaterThan(5);
  
  // Vérifier les alignements
  const leftCount = await page.locator('.text-left').count();
  const centerCount = await page.locator('.text-center').count();
  const rightCount = await page.locator('.text-right').count();
  
  console.log(`⬅️ Alignement gauche: ${leftCount}`);
  console.log(`⬆️ Alignement centre: ${centerCount}`);
  console.log(`➡️ Alignement droite: ${rightCount}`);
  
  expect(leftCount).toBeGreaterThan(5);
  expect(centerCount).toBeGreaterThan(5);
  expect(rightCount).toBeGreaterThan(3);
  
  // Screenshot
  await page.screenshot({ path: 'VALIDATION-ALIGNEMENT-TABLEAUX.png', fullPage: true });
  
  console.log('✅ Test alignement réussi !');
});