const { test, expect } = require('@playwright/test');

test('Diagnostic rapide OntoWave', async ({ page }) => {
  console.log('🔍 DIAGNOSTIC RAPIDE ONTOWAVE');
  
  await page.goto('http://localhost:8080', { timeout: 8000 });
  await page.waitForTimeout(2000);
  
  // 1. OntoWave chargé ?
  const ontoWaveLoaded = await page.evaluate(() => typeof window.OntoWave !== 'undefined');
  console.log(`1. OntoWave chargé: ${ontoWaveLoaded ? '✅' : '❌'}`);
  
  // 2. Container OntoWave présent ?
  const container = await page.locator('#ontowave-container').count();
  console.log(`2. Container OntoWave: ${container > 0 ? '✅' : '❌'} (${container} éléments)`);
  
  // 3. Bouton OntoWave visible ?
  const button = await page.locator('#ontowave-toggle').count();
  console.log(`3. Bouton OntoWave: ${button > 0 ? '✅' : '❌'} (${button} éléments)`);
  
  // 4. Boutons de langue ?
  const langButtons = await page.locator('[id*="lang"], .lang-toggle, .language-button').count();
  console.log(`4. Boutons de langue: ${langButtons > 0 ? '✅' : '❌'} (${langButtons} éléments)`);
  
  // 5. Blocs de code colorés ?
  const coloredCode = await page.locator('.token, .hljs, .language-, .prism').count();
  console.log(`5. Code coloré Prism: ${coloredCode > 0 ? '✅' : '❌'} (${coloredCode} éléments)`);
  
  // 6. PlantUML ?
  const plantuml = await page.locator('svg, .plantuml, [data-plantuml]').count();
  console.log(`6. PlantUML présent: ${plantuml > 0 ? '✅' : '❌'} (${plantuml} éléments)`);
  
  expect(ontoWaveLoaded).toBe(true);
});
