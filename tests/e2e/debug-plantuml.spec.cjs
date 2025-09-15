const { test, expect } = require('@playwright/test');

test('Debug PlantUML rendu', async ({ page }) => {
  console.log('🌱 DEBUG PLANTUML RENDU');
  
  await page.goto('http://localhost:8080', { timeout: 8000 });
  await page.waitForTimeout(5000); // Attendre plus longtemps pour le rendu
  
  // 1. Chercher les blocs plantuml dans le markdown source
  const plantUMLSource = await page.evaluate(() => {
    const text = document.body.innerHTML;
    const matches = text.match(/```plantuml[\s\S]*?```/g);
    return matches ? matches.length : 0;
  });
  console.log(`1. Blocs PlantUML source: ${plantUMLSource}`);
  
  // 2. Chercher les éléments avec class language-plantuml
  const langPlantUML = await page.locator('code.language-plantuml, pre.language-plantuml').count();
  console.log(`2. Éléments .language-plantuml: ${langPlantUML}`);
  
  // 3. Chercher les SVG générés
  const svgElements = await page.locator('svg').count();
  console.log(`3. Éléments SVG: ${svgElements}`);
  
  // 4. Chercher les iframes PlantUML
  const iframes = await page.locator('iframe[src*="plantuml"]').count();
  console.log(`4. IFrames PlantUML: ${iframes}`);
  
  // 5. Vérifier la configuration PlantUML
  const plantUMLConfig = await page.evaluate(() => {
    return window.OntoWave?.config?.enablePlantUML || false;
  });
  console.log(`5. Config PlantUML activée: ${plantUMLConfig}`);
  
  // 6. Chercher des erreurs dans la console
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  
  await page.waitForTimeout(2000);
  
  const plantUMLLogs = logs.filter(log => log.toLowerCase().includes('plantuml'));
  console.log(`6. Logs PlantUML: ${plantUMLLogs.join(', ')}`);
  
  expect(true).toBe(true);
});
