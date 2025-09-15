const { test, expect } = require('@playwright/test');

test('Debug interface OntoWave détaillé', async ({ page }) => {
  console.log('🔍 DEBUG INTERFACE ONTOWAVE DÉTAILLÉ');
  
  await page.goto('http://localhost:8080', { timeout: 8000 });
  await page.waitForTimeout(3000);
  
  // 1. Vérifier OntoWave chargé
  const ontoWaveLoaded = await page.evaluate(() => typeof window.OntoWave !== 'undefined');
  console.log(`1. OntoWave chargé: ${ontoWaveLoaded ? '✅' : '❌'}`);
  
  // 2. Vérifier container principal
  const containers = await page.locator('#ontowave-container, .ontowave-container, [id*="ontowave"]').count();
  console.log(`2. Containers OntoWave: ${containers} éléments`);
  
  // 3. Rechercher tous les boutons possibles
  const buttons = await page.locator('button, .button, [role="button"], .toggle, .btn').count();
  console.log(`3. Boutons trouvés: ${buttons} éléments`);
  
  // 4. Vérifier éléments avec "toggle" dans l'ID
  const toggles = await page.locator('[id*="toggle"], [class*="toggle"]').count();
  console.log(`4. Éléments toggle: ${toggles} éléments`);
  
  // 5. Vérifier si OntoWave a créé son interface
  const ontoWaveInterface = await page.evaluate(() => {
    return window.OntoWave ? Object.keys(window.OntoWave) : [];
  });
  console.log(`5. Méthodes OntoWave: ${ontoWaveInterface.join(', ')}`);
  
  // 6. Vérifier configuration chargée
  const config = await page.evaluate(() => {
    return window.OntoWave && window.OntoWave.config ? window.OntoWave.config : null;
  });
  console.log(`6. Configuration: ${config ? 'Chargée' : 'Non chargée'}`);
  if (config) {
    console.log(`   - Locales: ${config.locales || 'Non défini'}`);
    console.log(`   - Prism: ${config.enablePrism || false}`);
  }
  
  // 7. Rechercher icônes wave
  const waveIcons = await page.locator('[class*="wave"], [id*="wave"], svg, .icon').count();
  console.log(`7. Icônes wave: ${waveIcons} éléments`);
  
  expect(ontoWaveLoaded).toBe(true);
});
