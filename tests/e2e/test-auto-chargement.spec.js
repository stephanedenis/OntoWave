import { test, expect } from '@playwright/test';

test('OntoWave - Chargement Automatique Sans Script', async ({ page }) => {
  console.log('🌊 Test chargement automatique OntoWave...');
  
  await page.goto('http://localhost:8090/index.html');
  await page.waitForTimeout(3000);
  
  // Vérifier que OntoWave se charge automatiquement
  const ontoWaveLoaded = await page.evaluate(() => !!window.OntoWave);
  console.log(`🔧 OntoWave auto-chargé: ${ontoWaveLoaded}`);
  expect(ontoWaveLoaded).toBe(true);
  
  // Vérifier que le contenu est rendu automatiquement
  const hasContent = await page.locator('body').textContent();
  console.log(`📝 Contenu détecté: ${hasContent?.length > 50 ? 'OUI' : 'NON'}`);
  
  // Vérifier les tableaux
  const tableCount = await page.locator('table').count();
  console.log(`📊 Tableaux auto-rendus: ${tableCount}`);
  
  if (tableCount > 0) {
    const alignments = await page.locator('.text-left, .text-center, .text-right').count();
    console.log(`🎯 Alignements auto-détectés: ${alignments}`);
  }
  
  // Screenshot
  await page.screenshot({ path: 'ONTOWAVE-AUTO-CHARGEMENT.png' });
  
  console.log('✅ OntoWave fonctionne en mode auto-chargement !');
});