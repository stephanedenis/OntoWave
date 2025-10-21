import { test, expect } from '@playwright/test';

test('OntoWave - Page Index Minimaliste', async ({ page }) => {
  console.log('🌊 Test page OntoWave minimaliste...');
  
  await page.goto('http://localhost:8090/index.html');
  await page.waitForTimeout(3000);
  
  // Vérifier que OntoWave charge
  const ontoWaveLoaded = await page.evaluate(() => !!window.OntoWave);
  console.log(`🔧 OntoWave chargé: ${ontoWaveLoaded}`);
  expect(ontoWaveLoaded).toBe(true);
  
  // Vérifier que le contenu est rendu depuis index.md
  const tableCount = await page.locator('table').count();
  console.log(`📊 Tableaux détectés depuis index.md: ${tableCount}`);
  expect(tableCount).toBeGreaterThan(0);
  
  // Vérifier les alignements
  const alignments = await page.locator('.text-left, .text-center, .text-right').count();
  console.log(`🎯 Alignements détectés: ${alignments}`);
  expect(alignments).toBeGreaterThan(0);
  
  // Screenshot
  await page.screenshot({ path: 'ONTOWAVE-INDEX-MINIMAL.png' });
  
  console.log('✅ OntoWave fonctionne avec index.md minimal !');
});