const { test, expect } = require('@playwright/test');

test('Test PlantUML après correctif', async ({ page }) => {
  await page.goto('http://localhost:8080/#index.fr.md');
  await page.waitForTimeout(3000);
  
  // Chercher les images PlantUML générées
  const plantUMLImages = await page.locator('img[src*="plantuml"]').all();
  console.log(`🔍 ${plantUMLImages.length} images PlantUML trouvées`);
  
  if (plantUMLImages.length > 0) {
    const img = plantUMLImages[0];
    const src = await img.getAttribute('src');
    
    console.log(`🌐 URL générée: ${src?.substring(0, 120)}...`);
    
    // Tester la nouvelle URL
    try {
      const response = await page.request.get(src);
      const contentType = response.headers()['content-type'];
      
      console.log(`📊 Status: ${response.status()}`);
      console.log(`📋 Content-Type: ${contentType}`);
      
      if (response.status() === 200 && contentType?.includes('svg')) {
        console.log(`✅ SUCCÈS: PlantUML fonctionne !`);
        
        const svgContent = await response.text();
        if (svgContent.includes('<svg') && svgContent.length > 1000) {
          console.log(`✅ SVG valide généré (${svgContent.length} caractères)`);
        } else {
          console.log(`⚠️  SVG court ou invalide`);
        }
      } else {
        const errorContent = await response.text();
        console.log(`❌ Erreur: ${errorContent.substring(0, 200)}`);
        
        if (errorContent.includes('HUFFMAN')) {
          console.log(`🚨 ERREUR HUFFMAN TOUJOURS PRÉSENTE !`);
        }
      }
      
      // Prendre une capture de l'image rendue
      await img.screenshot({ path: '/tmp/plantuml-after-fix.png' });
      console.log(`📸 Image capturée: /tmp/plantuml-after-fix.png`);
      
    } catch (error) {
      console.log(`❌ Erreur requête: ${error.message}`);
    }
  } else {
    console.log(`❌ Aucune image PlantUML trouvée`);
  }
});
