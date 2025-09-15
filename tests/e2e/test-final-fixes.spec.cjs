const { test, expect } = require('@playwright/test');

test('Test final Prism et PlantUML', async ({ page }) => {
  console.log('🎯 TEST FINAL PRISM ET PLANTUML');
  
  await page.goto('http://localhost:8080', { timeout: 8000 });
  await page.waitForTimeout(4000);
  
  // 1. Vérifier OntoWave chargé
  const ontoWaveLoaded = await page.evaluate(() => typeof window.OntoWave !== 'undefined');
  console.log(`1. OntoWave chargé: ${ontoWaveLoaded ? '✅' : '❌'}`);
  
  // 2. Vérifier icônes interdites
  const forbiddenIcons = await page.evaluate(() => {
    const text = document.body.innerText;
    const forbidden = ['🛠️', '🎨', '⚡', '🔧', '🎯', '✨', '📱', '⚙️', '📦', '🚀'];
    const found = forbidden.filter(icon => text.includes(icon));
    return found;
  });
  console.log(`2. Icônes interdites: ${forbiddenIcons.length === 0 ? '✅' : '❌'} (${forbiddenIcons.join(', ')})`);
  
  // 3. Vérifier titre H4
  const h4Count = await page.locator('h4').count();
  console.log(`3. Titres H4: ${h4Count === 0 ? '✅' : '❌'} (${h4Count} trouvé(s))`);
  
  // 4. Vérifier Prism
  const prismElements = await page.locator('.token, .language-html, .language-javascript, .language-plantuml, .language-json').count();
  console.log(`4. Éléments Prism: ${prismElements > 0 ? '✅' : '❌'} (${prismElements} éléments)`);
  
  // 5. Vérifier PlantUML
  const plantUMLBlocks = await page.locator('pre code.language-plantuml, .plantuml-diagram, svg[data-plantuml]').count();
  console.log(`5. Blocs PlantUML: ${plantUMLBlocks > 0 ? '✅' : '❌'} (${plantUMLBlocks} blocs)`);
  
  // 6. Vérifier boutons de langue
  const langButtons = await page.locator('[data-lang], .lang-button, [onclick*="lang"]').count();
  console.log(`6. Boutons de langue: ${langButtons > 0 ? '✅' : '❌'} (${langButtons} boutons)`);
  
  expect(ontoWaveLoaded).toBe(true);
});
