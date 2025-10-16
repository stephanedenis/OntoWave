const { test, expect } = require('@playwright/test');

test('Test page minimale - Navigation .puml', async ({ page }) => {
  console.log('\n🧪 TEST PAGE MINIMALE\n');
  
  // Activer les logs console
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'log' || type === 'error') {
      console.log(`[${type}] ${msg.text()}`);
    }
  });
  
  // 1. Charger la page minimale
  console.log('📄 Chargement de la page minimale...');
  await page.goto('http://localhost:5173/test-puml-minimal.html');
  await page.waitForTimeout(2000);
  
  // 2. Vérifier que le markdown index-minimal.md est chargé
  const appText = await page.locator('#app').first().textContent();
  console.log(`✅ Contenu chargé: ${appText.substring(0, 50)}...`);
  expect(appText).toContain('Test Minimal');
  
  // 3. Vérifier que le lien .puml existe
  const linkCount = await page.locator('a[href="architecture.puml"]').count();
  console.log(`📊 Liens vers architecture.puml: ${linkCount}`);
  expect(linkCount).toBeGreaterThan(0);
  
  // 4. Prendre une capture avant de cliquer
  await page.screenshot({ 
    path: 'test-results/minimal-avant-clic.png',
    fullPage: true 
  });
  console.log('📸 Capture avant clic: minimal-avant-clic.png');
  
  // 5. Naviguer vers le .puml
  console.log('🖱️  Navigation vers architecture.puml...');
  await page.evaluate(() => { location.hash = '#/architecture.puml'; });
  await page.waitForTimeout(5000);
  
  // 6. Vérifier que le SVG est affiché
  const svgCount = await page.locator('svg').count();
  console.log(`📊 SVG trouvés: ${svgCount}`);
  expect(svgCount).toBeGreaterThan(0);
  
  // 7. Vérifier le titre
  const title = await page.locator('h1').first().textContent();
  console.log(`📋 Titre: ${title}`);
  expect(title).toContain('architecture.puml');
  
  // 8. Prendre une capture du diagramme
  await page.screenshot({ 
    path: 'test-results/minimal-diagramme-puml.png',
    fullPage: true 
  });
  console.log('📸 Capture diagramme: minimal-diagramme-puml.png');
  
  // 9. Vérifier le bouton retour
  const backBtn = page.locator('a:has-text("Retour")');
  const backCount = await backBtn.count();
  console.log(`🔙 Bouton retour: ${backCount > 0 ? 'présent' : 'absent'}`);
  expect(backCount).toBeGreaterThan(0);
  
  // 10. Vérifier la section code source
  const codeSection = page.locator('details:has-text("Code source PlantUML")');
  const codeCount = await codeSection.count();
  console.log(`📝 Section code source: ${codeCount > 0 ? 'présente' : 'absente'}`);
  expect(codeCount).toBeGreaterThan(0);
  
  console.log('\n✅ TEST MINIMAL RÉUSSI !\n');
});
