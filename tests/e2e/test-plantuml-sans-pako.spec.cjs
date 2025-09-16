const { test, expect } = require('@playwright/test');

test('Test final PlantUML après suppression Pako', async ({ page }) => {
  console.log('🔄 Test avec la version sans Pako...');
  
  // Forcer le rechargement en ajoutant un paramètre
  await page.goto('http://localhost:8080/#index.fr.md?v=' + Date.now());
  await page.waitForTimeout(4000);
  
  const plantUMLImages = await page.locator('img[src*="plantuml"]').all();
  console.log(`🎯 ${plantUMLImages.length} images PlantUML trouvées`);
  
  if (plantUMLImages.length > 0) {
    const img = plantUMLImages[0];
    const src = await img.getAttribute('src');
    console.log(`🌐 Nouvelle URL: ${src?.substring(0, 120)}...`);
    
    // Tester la nouvelle URL
    const response = await page.request.get(src);
    const content = await response.text();
    
    console.log(`📊 Status: ${response.status()}`);
    
    if (content.includes('HUFFMAN') || content.includes('bad URL')) {
      console.log('❌ ERREUR HUFFMAN TOUJOURS PRÉSENTE !');
      console.log(`Extrait: ${content.substring(0, 150)}`);
    } else if (content.includes('<svg') && content.length > 1000) {
      console.log(`✅ SUCCÈS ! SVG valide généré (${content.length} chars)`);
      console.log(`🎉 PlantUML fonctionne maintenant !`);
    }
    
    await img.screenshot({ path: '/tmp/plantuml-final-test.png' });
    console.log('📸 Image finale capturée');
  } else {
    console.log('❌ Aucune image PlantUML générée');
  }
});
