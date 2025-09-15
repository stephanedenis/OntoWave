const { test, expect } = require('@playwright/test');

test('Debug chargement fichiers markdown', async ({ page }) => {
  console.log('📄 DEBUG CHARGEMENT MARKDOWN');
  
  // Intercepter les requêtes réseau
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('.md') || request.url().includes('config.json')) {
      requests.push(request.url());
    }
  });
  
  await page.goto('http://localhost:8080', { timeout: 8000 });
  await page.waitForTimeout(4000);
  
  console.log('Requêtes interceptées:');
  requests.forEach(url => console.log(`  - ${url}`));
  
  // Vérifier le contenu chargé
  const contentCheck = await page.evaluate(() => {
    return {
      bodyText: document.body.innerText.substring(0, 200),
      hasPlantUML: document.body.innerText.includes('@startuml'),
      hasArchitecture: document.body.innerText.includes('Architecture'),
      configLoaded: typeof window.OntoWave?.config === 'object'
    };
  });
  
  console.log('Contenu chargé:');
  console.log(`  - Corps du texte: "${contentCheck.bodyText}..."`);
  console.log(`  - Contient @startuml: ${contentCheck.hasPlantUML}`);
  console.log(`  - Contient Architecture: ${contentCheck.hasArchitecture}`);
  console.log(`  - Config chargée: ${contentCheck.configLoaded}`);
  
  expect(true).toBe(true);
});
