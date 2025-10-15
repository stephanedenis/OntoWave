import { test, expect } from '@playwright/test';

test('OntoWave - Index.md Complet avec Tous les Cas de Test', async ({ page }) => {
  console.log('🌊 Test index.md complet avec tous les cas de test...');
  
  await page.goto('http://localhost:8090/index.html');
  await page.waitForTimeout(4000);
  
  // Compter tous les tableaux
  const tableCount = await page.locator('table').count();
  console.log(`📊 Tableaux totaux détectés: ${tableCount}`);
  expect(tableCount).toBeGreaterThan(6);
  
  // Vérifier tous les types d'alignement
  const leftCount = await page.locator('.text-left').count();
  const centerCount = await page.locator('.text-center').count();
  const rightCount = await page.locator('.text-right').count();
  
  console.log(`⬅️ Alignement gauche: ${leftCount}`);
  console.log(`⬆️ Alignement centre: ${centerCount}`);
  console.log(`➡️ Alignement droite: ${rightCount}`);
  
  expect(leftCount).toBeGreaterThan(15);
  expect(centerCount).toBeGreaterThan(20);
  expect(rightCount).toBeGreaterThan(10);
  
  // Vérifier les tableaux spécifiques
  const financialTable = await page.locator('table:has-text("€")').count();
  console.log(`💰 Tableaux financiers: ${financialTable}`);
  expect(financialTable).toBeGreaterThan(0);
  
  const iconTable = await page.locator('table:has-text("✅")').count();
  console.log(`🎯 Tableaux avec icônes: ${iconTable}`);
  expect(iconTable).toBeGreaterThan(0);
  
  const technicalTable = await page.locator('table:has-text("MHz")').count();
  console.log(`🔧 Tableaux techniques: ${technicalTable}`);
  expect(technicalTable).toBeGreaterThan(0);
  
  // Screenshot complet
  await page.screenshot({ 
    path: 'INDEX-COMPLET-TOUS-CAS-TEST.png', 
    fullPage: true 
  });
  
  console.log('✅ Index.md complet avec tous les cas de test validé !');
});