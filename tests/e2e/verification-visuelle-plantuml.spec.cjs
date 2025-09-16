const { test, expect } = require('@playwright/test');

test('Vérification visuelle du diagramme PlantUML', async ({ page }) => {
  // Aller sur la page avec PlantUML
  await page.goto('http://localhost:8080/#index.fr.md');
  await page.waitForTimeout(5000);
  
  console.log('🔍 Recherche du diagramme PlantUML...');
  
  // Chercher la section avec le diagramme PlantUML
  const plantUMLSection = page.locator('text=Architecture OntoWave').locator('..');
  
  if (await plantUMLSection.count() > 0) {
    console.log('📍 Section "Architecture OntoWave" trouvée');
    
    // Prendre une capture de toute la section
    await plantUMLSection.screenshot({ path: '/tmp/plantuml-section-complete.png' });
    console.log('📸 Section complète capturée: /tmp/plantuml-section-complete.png');
    
    // Chercher les images PlantUML dans cette section
    const images = await plantUMLSection.locator('img').all();
    console.log(`🖼️  ${images.length} images trouvées dans la section`);
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      
      if (src && src.includes('plantuml')) {
        console.log(`\n🎯 Image PlantUML ${i + 1}:`);
        console.log(`URL: ${src?.substring(0, 120)}...`);
        
        // Vérifier les dimensions de l'image
        const box = await img.boundingBox();
        if (box) {
          console.log(`📏 Dimensions: ${box.width}x${box.height}px`);
          
          if (box.width > 100 && box.height > 100) {
            console.log('✅ Image a des dimensions raisonnables pour un diagramme');
          } else {
            console.log('⚠️  Image très petite - possible erreur');
          }
        }
        
        // Capturer juste cette image
        await img.screenshot({ path: `/tmp/plantuml-image-${i + 1}.png` });
        console.log(`📸 Image capturée: /tmp/plantuml-image-${i + 1}.png`);
        
        // Tester l'URL directement
        try {
          const response = await page.request.get(src);
          console.log(`📊 Status HTTP: ${response.status()}`);
          console.log(`📋 Type: ${response.headers()['content-type']}`);
          
          if (response.status() === 200) {
            const content = await response.text();
            
            // Analyser le contenu SVG
            if (content.includes('<svg')) {
              console.log(`✅ SVG valide reçu (${content.length} caractères)`);
              
              // Chercher des éléments de diagramme
              const hasElements = content.includes('<g') || content.includes('<path') || content.includes('<rect');
              const hasText = content.includes('<text');
              
              console.log(`📐 Éléments graphiques: ${hasElements ? 'OUI' : 'NON'}`);
              console.log(`📝 Texte dans SVG: ${hasText ? 'OUI' : 'NON'}`);
              
              if (hasElements && hasText) {
                console.log('🎉 DIAGRAMME COMPLET DÉTECTÉ !');
              } else {
                console.log('⚠️  SVG semble incomplet');
              }
            } else {
              console.log('❌ Pas de SVG valide');
              console.log(`Contenu: ${content.substring(0, 200)}`);
            }
          } else {
            console.log(`❌ Erreur HTTP: ${response.status()}`);
          }
        } catch (error) {
          console.log(`❌ Erreur requête: ${error.message}`);
        }
      }
    }
  } else {
    console.log('❌ Section "Architecture OntoWave" non trouvée');
    
    // Prendre une capture de toute la page
    await page.screenshot({ path: '/tmp/page-complete.png', fullPage: true });
    console.log('📸 Page complète capturée: /tmp/page-complete.png');
  }
  
  // Chercher aussi directement tous les éléments PlantUML
  const allPlantUMLImages = await page.locator('img[src*="plantuml"]').all();
  console.log(`\n🔍 Total images PlantUML sur la page: ${allPlantUMLImages.length}`);
  
  if (allPlantUMLImages.length === 0) {
    console.log('❌ AUCUNE IMAGE PLANTUML TROUVÉE !');
    console.log('🔍 Recherche des blocs plantuml dans le HTML...');
    
    const plantUMLBlocks = await page.locator('text=plantuml').all();
    console.log(`📝 ${plantUMLBlocks.length} mentions de "plantuml" trouvées`);
  }
});
