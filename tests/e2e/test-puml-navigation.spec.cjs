const { test, expect } = require('@playwright/test');

test('Navigation vers fichiers .puml', async ({ page }) => {
  // Capturer les erreurs console
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    console.log(`Browser console [${msg.type()}]: ${text}`);
  });
  
  // Capturer les erreurs de page
  page.on('pageerror', err => {
    console.log(`❌ Page error: ${err.message}`);
  });
  
  // Aller à la page de développement avec Vite
  await page.goto('http://localhost:5173/dev.html#/test-puml.md');
  await page.waitForTimeout(3000);
  
  console.log('📄 Page de test chargée');
  
  // Debug: afficher le contenu de la page
  const content = await page.locator('#app').textContent();
  console.log('📋 Contenu #app:', content?.substring(0, 200));
  
  // Debug: chercher tous les liens
  const allLinks = await page.locator('a').count();
  console.log(`🔗 Nombre total de liens: ${allLinks}`);
  
  for (let i = 0; i < Math.min(allLinks, 10); i++) {
    const href = await page.locator('a').nth(i).getAttribute('href');
    const text = await page.locator('a').nth(i).textContent();
    console.log(`  Lien ${i}: "${text}" -> ${href}`);
  }
  
  // Vérifier que le lien vers .puml existe
  const pumlLink = page.locator('a[href*="architecture.puml"]');
  await expect(pumlLink).toBeVisible();
  console.log('✅ Lien vers .puml trouvé');
  
  // Cliquer sur le lien
  await pumlLink.click();
  await page.waitForTimeout(3000);
  
  console.log('🔗 Lien cliqué, vérification du rendu...');
  
  // Vérifier que l'URL contient .puml
  expect(page.url()).toContain('.puml');
  console.log(`✅ URL correcte: ${page.url()}`);
  
  // Vérifier que le titre est affiché
  const title = page.locator('h1');
  await expect(title).toBeVisible();
  const titleText = await title.textContent();
  console.log(`📋 Titre: ${titleText}`);
  
  // Vérifier que l'image PlantUML est présente
  const plantUMLImg = page.locator('.plantuml-diagram-wrapper img');
  await expect(plantUMLImg).toBeVisible({ timeout: 10000 });
  console.log('✅ Image PlantUML visible');
  
  // Vérifier que l'image a une source valide
  const imgSrc = await plantUMLImg.getAttribute('src');
  expect(imgSrc).toContain('plantuml.com');
  expect(imgSrc).toContain('/svg/~h');
  console.log(`✅ URL PlantUML: ${imgSrc.substring(0, 80)}...`);
  
  // Vérifier que l'image s'est chargée (pas d'erreur)
  const imgNaturalWidth = await plantUMLImg.evaluate(img => img.naturalWidth);
  expect(imgNaturalWidth).toBeGreaterThan(0);
  console.log(`✅ Image chargée: ${imgNaturalWidth}px de largeur`);
  
  // Vérifier que le bouton retour existe
  const backLink = page.locator('a:has-text("Retour")').first();
  await expect(backLink).toBeVisible();
  console.log('✅ Bouton retour présent');
  
  // Vérifier que le code source est dans un <details>
  const sourceDetails = page.locator('details:has-text("Code source PlantUML")');
  await expect(sourceDetails).toBeVisible();
  console.log('✅ Section code source présente');
  
  // Ouvrir le code source
  await sourceDetails.click();
  await page.waitForTimeout(500);
  const sourceCode = page.locator('details pre code');
  await expect(sourceCode).toBeVisible();
  const codeContent = await sourceCode.textContent();
  expect(codeContent).toContain('@startuml');
  expect(codeContent).toContain('@enduml');
  console.log('✅ Code source PlantUML affiché correctement');
  
  // Prendre une capture d'écran
  await page.screenshot({ path: '/tmp/puml-navigation-test.png', fullPage: true });
  console.log('📸 Capture d\'écran: /tmp/puml-navigation-test.png');
  
  // Tester le retour
  await backLink.click();
  await page.waitForTimeout(1000);
  expect(page.url()).toContain('test-puml');
  expect(page.url()).not.toContain('.puml');
  console.log('✅ Retour fonctionnel');
  
  console.log('\n🎉 SUCCÈS: Navigation .puml complètement fonctionnelle!');
});
