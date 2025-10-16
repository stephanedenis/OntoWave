const { test, expect } = require('@playwright/test');

/**
 * Test simple: vérifie que le .puml fonctionne dans le build docs/
 */
test('Build docs/ - Navigation .puml vers SVG', async ({ page }) => {
  console.log('\n📦 TEST BUILD DOCS/ - PlantUML SVG\n');
  
  // Naviguer directement vers le fichier .puml
  console.log('🔗 Navigation vers http://localhost:8092/#/architecture.puml');
  await page.goto('http://localhost:8092/#/architecture.puml');
  await page.waitForTimeout(6000); // Attendre le rendu PlantUML
  
  // Vérifier qu'un SVG est présent
  const svgCount = await page.locator('svg').count();
  console.log(`📊 Nombre de SVG: ${svgCount}`);
  
  if (svgCount > 0) {
    console.log('✅ SVG PlantUML affiché !');
    
    // Vérifier le titre
    const title = await page.locator('h1').first().textContent();
    console.log(`📋 Titre: ${title}`);
    expect(title).toContain('architecture.puml');
    
    // Capture
    await page.screenshot({ 
      path: 'test-results/build-docs-puml-svg.png', 
      fullPage: true 
    });
    console.log('📸 Capture: build-docs-puml-svg.png');
    
    expect(svgCount).toBeGreaterThan(0);
  } else {
    console.log('❌ Aucun SVG trouvé');
    const html = await page.locator('#app').innerHTML();
    console.log('HTML (premiers 500 chars):', html.substring(0, 500));
    throw new Error('Aucun SVG PlantUML trouvé');
  }
  
  console.log('\n✅ Test terminé\n');
});
