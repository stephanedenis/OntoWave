const { test, expect } = require('@playwright/test');

test('Navigation .puml - Test simple', async ({ page }) => {
  // Capturer les logs console
  page.on('console', msg => console.log(`[${msg.type()}]: ${msg.text()}`));
  
  // 1. Charger la page markdown avec lien .puml
  await page.goto('http://localhost:5173/dev.html#/test-puml');
  await page.waitForTimeout(2000);
  
  console.log('✅ Page markdown chargée');
  
  // 2. Vérifier que le lien .puml existe
  const linkCount = await page.locator('a[href="architecture.puml"]').count();
  console.log(`📊 Liens vers architecture.puml: ${linkCount}`);
  expect(linkCount).toBeGreaterThan(0);
  
  // 3. Naviguer vers le fichier .puml via hash
  await page.evaluate(() => { location.hash = '#/architecture.puml'; });
  await page.waitForTimeout(5000); // Attendre le rendu PlantUML
  
  console.log('✅ Navigation vers .puml effectuée');
  
  // 4. Vérifier que le contenu a changé (chercher "architecture.puml" dans le titre)
  const appText = await page.locator('#app').first().textContent();
  console.log(`📋 Texte de #app (premiers 200 chars): ${appText.substring(0, 200)}`);
  
  // 5. Vérifier qu'un SVG est présent
  const svgCount = await page.locator('svg').count();
  console.log(`📊 Nombre de SVG: ${svgCount}`);
  
  if (svgCount > 0) {
    console.log('✅ TEST RÉUSSI : SVG PlantUML affiché !');
    expect(svgCount).toBeGreaterThan(0);
  } else {
    console.log('❌ Aucun SVG trouvé');
    // Afficher le contenu HTML pour debug
    const html = await page.locator('#app').first().innerHTML();
    console.log('HTML de #app:', html.substring(0, 500));
    throw new Error('Aucun SVG PlantUML trouvé dans la page');
  }
});
