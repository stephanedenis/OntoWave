const { test, expect } = require('@playwright/test');

test('Capture erreur HUFFMAN PlantUML', async ({ page }) => {
  // Naviguer vers la page avec le hash spécifique
  await page.goto('http://localhost:8080/#index.fr.md');
  
  // Attendre le chargement complet
  await page.waitForTimeout(5000);
  
  console.log('🔍 Recherche des erreurs PlantUML...');
  
  // Chercher tous les éléments img avec plantuml dans l'URL
  const plantUMLImages = await page.locator('img[src*="plantuml"]').all();
  console.log(`📊 Trouvé ${plantUMLImages.length} images PlantUML`);
  
  for (let i = 0; i < plantUMLImages.length; i++) {
    const img = plantUMLImages[i];
    const src = await img.getAttribute('src');
    
    console.log(`\n🌐 Image ${i + 1}:`);
    console.log(`URL: ${src?.substring(0, 100)}...`);
    
    // Tester l'URL directement
    try {
      const response = await page.request.get(src);
      const contentType = response.headers()['content-type'];
      console.log(`📋 Content-Type: ${contentType}`);
      console.log(`📊 Status: ${response.status()}`);
      
      if (contentType?.includes('text/') || contentType?.includes('html')) {
        // C'est probablement une page d'erreur !
        const errorText = await response.text();
        console.log(`⚠️  ERREUR DÉTECTÉE dans le contenu:`);
        console.log(errorText.substring(0, 500));
        
        if (errorText.includes('HUFFMAN') || errorText.includes('bad URL')) {
          console.log(`🚨 ERREUR HUFFMAN CONFIRMÉE !`);
        }
      }
      
      // Capturer l'image telle qu'affichée dans le navigateur
      await img.screenshot({ path: `/tmp/plantuml-error-${i + 1}.png` });
      console.log(`📸 Image capturée: /tmp/plantuml-error-${i + 1}.png`);
      
    } catch (error) {
      console.log(`❌ Erreur requête: ${error.message}`);
    }
  }
  
  // Capture de la section entière
  const plantUMLSection = page.locator('text=Diagramme PlantUML').locator('..');
  if (await plantUMLSection.count() > 0) {
    await plantUMLSection.screenshot({ path: '/tmp/plantuml-section-complete.png' });
    console.log(`📸 Section complète capturée: /tmp/plantuml-section-complete.png`);
  }
});
