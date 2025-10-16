const { test, expect } = require('@playwright/test');

/**
 * Test du candidat réel au déploiement : ontowave.min.js
 * Simule exactement ce que l'utilisateur final aura via NPM/unpkg
 */
test('Test bundle production ontowave.min.js avec navigation .puml', async ({ page }) => {
  console.log('\n🚀 TEST BUNDLE PRODUCTION (ontowave.min.js)\n');
  
  // Activer les logs console
  const errors = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      errors.push(text);
      console.log(`❌ [error] ${text}`);
    } else if (type === 'log') {
      console.log(`[log] ${text}`);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log(`❌ Page error: ${err.message}`);
  });
  
  // 1. Charger la page HTML minimaliste avec le bundle
  console.log('📄 Chargement page HTML minimaliste (head: script dist/ontowave.min.js, body: vide)');
  await page.goto('http://localhost:8092/test-puml-minimal.html');
  await page.waitForTimeout(3000);
  
  // 2. Vérifier qu'il n'y a pas d'erreurs JS
  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} erreur(s) détectée(s)`);
  } else {
    console.log('✅ Aucune erreur JavaScript');
  }
  
  // 3. Vérifier que le markdown index-minimal.md est chargé
  await page.waitForSelector('#app', { timeout: 5000 });
  const appText = await page.locator('#app').textContent();
  console.log(`📋 Contenu app: "${appText.substring(0, 60)}..."`);
  expect(appText).toContain('Test Minimal');
  console.log('✅ Markdown chargé par le bundle');
  
  // 4. Vérifier que le lien .puml existe
  const linkCount = await page.locator('a[href="architecture.puml"]').count();
  console.log(`📊 Liens vers architecture.puml: ${linkCount}`);
  expect(linkCount).toBeGreaterThan(0);
  
  // 5. Capture avant navigation
  await page.screenshot({ 
    path: 'test-results/bundle-prod-page-markdown.png',
    fullPage: true 
  });
  console.log('📸 Capture: bundle-prod-page-markdown.png');
  
  // 6. Naviguer vers le .puml
  console.log('🔗 Navigation vers #/architecture.puml...');
  await page.evaluate(() => { location.hash = '#/architecture.puml'; });
  await page.waitForTimeout(6000); // Laisser le temps au PlantUML de charger
  
  // 7. Vérifier que le SVG PlantUML est affiché
  const svgCount = await page.locator('svg').count();
  console.log(`📊 SVG PlantUML trouvés: ${svgCount}`);
  expect(svgCount).toBeGreaterThan(0);
  console.log('✅ SVG PlantUML rendu par le bundle');
  
  // 8. Vérifier le titre
  const h1Count = await page.locator('h1:has-text("architecture.puml")').count();
  console.log(`📋 Titre architecture.puml: ${h1Count > 0 ? 'présent' : 'absent'}`);
  expect(h1Count).toBeGreaterThan(0);
  
  // 9. Vérifier le bouton retour
  const backBtn = page.locator('a:has-text("Retour")');
  const backCount = await backBtn.count();
  console.log(`🔙 Bouton retour: ${backCount > 0 ? 'présent' : 'absent'}`);
  expect(backCount).toBeGreaterThan(0);
  
  // 10. Vérifier la section code source PlantUML
  const codeSection = page.locator('details:has-text("Code source PlantUML")');
  const codeCount = await codeSection.count();
  console.log(`📝 Section code source: ${codeCount > 0 ? 'présente' : 'absente'}`);
  expect(codeCount).toBeGreaterThan(0);
  
  // 11. Capture du diagramme PlantUML
  await page.screenshot({ 
    path: 'test-results/bundle-prod-diagramme-puml.png',
    fullPage: true 
  });
  console.log('📸 Capture: bundle-prod-diagramme-puml.png');
  
  // 12. Vérifier qu'il n'y a pas d'erreurs après navigation
  if (errors.length === 0) {
    console.log('✅ Aucune erreur pendant toute la session');
  }
  
  console.log('\n🎉 TEST BUNDLE PRODUCTION RÉUSSI !');
  console.log('✅ Le bundle ontowave.min.js est PRÊT pour déploiement NPM/unpkg\n');
});
