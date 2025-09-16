const { test, expect } = require('@playwright/test');

test('Test simple PlantUML', async ({ page }) => {
  console.log('🔍 Début du test PlantUML...');
  
  await page.goto('http://localhost:8080/#index.fr.md');
  console.log('📄 Page chargée');
  
  // Attendre moins longtemps
  await page.waitForTimeout(3000);
  console.log('⏰ Attente terminée');
  
  // Prendre une capture de toute la page
  await page.screenshot({ path: '/tmp/page-simple-test.png', fullPage: true });
  console.log('📸 Capture de page sauvée: /tmp/page-simple-test.png');
  
  // Chercher des images
  const allImages = await page.locator('img').all();
  console.log(`🖼️  ${allImages.length} images trouvées sur la page`);
  
  // Chercher spécifiquement PlantUML
  const plantUMLImages = await page.locator('img[src*="plantuml"]').all();
  console.log(`🎯 ${plantUMLImages.length} images PlantUML trouvées`);
  
  if (plantUMLImages.length > 0) {
    const img = plantUMLImages[0];
    const src = await img.getAttribute('src');
    console.log(`🌐 URL PlantUML: ${src?.substring(0, 100)}...`);
    
    await img.screenshot({ path: '/tmp/plantuml-simple-test.png' });
    console.log('📸 Image PlantUML capturée: /tmp/plantuml-simple-test.png');
  } else {
    console.log('❌ Aucune image PlantUML trouvée');
    
    // Chercher le texte "plantuml" dans la page
    const plantUMLText = await page.locator('text=plantuml').all();
    console.log(`📝 ${plantUMLText.length} mentions de "plantuml" trouvées`);
    
    // Chercher les blocs de code
    const codeBlocks = await page.locator('pre, code').all();
    console.log(`💻 ${codeBlocks.length} blocs de code trouvés`);
  }
  
  console.log('✅ Test terminé');
});
