const { test, expect } = require('@playwright/test');

test('Test final - Attente rendu complet', async ({ page }) => {
  console.log('⏰ TEST FINAL - ATTENTE RENDU COMPLET');
  
  await page.goto('http://localhost:8080', { timeout: 8000 });
  
  // Attendre beaucoup plus longtemps pour le rendu complet
  console.log('⏳ Attente 10 secondes pour le rendu complet...');
  await page.waitForTimeout(10000);
  
  // 1. OntoWave
  const ontoWaveLoaded = await page.evaluate(() => typeof window.OntoWave !== 'undefined');
  console.log(`1. OntoWave chargé: ${ontoWaveLoaded ? '✅' : '❌'}`);
  
  // 2. Icônes interdites
  const forbiddenIcons = await page.evaluate(() => {
    const text = document.body.innerText;
    const forbidden = ['🛠️', '🎨', '⚡', '🔧', '🎯', '✨', '📱', '⚙️', '📦', '🚀'];
    const found = forbidden.filter(icon => text.includes(icon));
    return found;
  });
  console.log(`2. Icônes interdites: ${forbiddenIcons.length === 0 ? '✅' : '❌'} (${forbiddenIcons.join(', ')})`);
  
  // 3. Titre H4
  const h4Count = await page.locator('h4').count();
  console.log(`3. Titres H4: ${h4Count === 0 ? '✅' : '❌'} (${h4Count} trouvé(s))`);
  
  // 4. Prism 
  const prismElements = await page.locator('.token, .language-html, .hljs').count();
  console.log(`4. Éléments Prism: ${prismElements > 0 ? '✅' : '❌'} (${prismElements} éléments)`);
  
  // 5. PlantUML SVG
  const svgElements = await page.locator('svg').count();
  console.log(`5. SVG PlantUML: ${svgElements > 1 ? '✅' : '❌'} (${svgElements} SVG)`);
  
  // 6. Contenu affiché
  const contentLength = await page.evaluate(() => document.body.innerText.trim().length);
  console.log(`6. Contenu affiché: ${contentLength > 100 ? '✅' : '❌'} (${contentLength} caractères)`);
  
  // 7. Boutons de langue OntoWave
  const langButtons = await page.locator('button, [role="button"]').count();
  console.log(`7. Boutons interface: ${langButtons > 0 ? '✅' : '❌'} (${langButtons} boutons)`);
  
  // Calcul du score
  const scores = [
    ontoWaveLoaded,
    forbiddenIcons.length === 0,
    h4Count === 0,
    prismElements > 0,
    svgElements > 1,
    contentLength > 100,
    langButtons > 0
  ];
  
  const passed = scores.filter(s => s).length;
  const total = scores.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`\n🎯 SCORE FINAL: ${passed}/${total} tests passés (${percentage}%)`);
  
  expect(ontoWaveLoaded).toBe(true);
});
