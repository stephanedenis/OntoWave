const { test, expect } = require('@playwright/test');

test('OCR PlantUML - Diagnostic des erreurs d image', async ({ page }) => {
  console.log('\n=== DIAGNOSTIC OCR PLANTUML ===');
  
  // Démarrer le serveur  
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Attendre le rendu complet
  
  console.log('\n1. DETECTION DES IMAGES PLANTUML');
  
  // Localiser toutes les images PlantUML générées
  const plantumlImages = await page.locator('img[src*="plantuml"]').all();
  console.log('Images PlantUML trouvées:', plantumlImages.length);
  
  if (plantumlImages.length === 0) {
    console.log('Aucune image PlantUML trouvée, vérification des blocs de code...');
    
    const codeBlocks = await page.locator('code.language-plantuml').all();
    console.log('Blocs de code PlantUML:', codeBlocks.length);
    
    if (codeBlocks.length > 0) {
      const codeContent = await codeBlocks[0].textContent();
      console.log('Premier bloc:', codeContent?.substring(0, 100) + '...');
    }
    
    return;
  }
  
  console.log('\n2. ANALYSE DES URLS ET REPONSES');
  
  for (let i = 0; i < plantumlImages.length; i++) {
    const img = plantumlImages[i];
    const src = await img.getAttribute('src');
    console.log('\nImage', i + 1, ':', src);
    
    // Vérifier les dimensions de l'image
    const { width, height, naturalWidth, naturalHeight } = await img.evaluate(el => ({
      width: el.width,
      height: el.height,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight
    }));
    
    console.log('Dimensions:', width + 'x' + height, '(naturelles:', naturalWidth + 'x' + naturalHeight + ')');
    
    // Tester l'URL directement
    try {
      const response = await page.request.get(src);
      const status = response.status();
      const contentType = response.headers()['content-type'];
      const bodySize = (await response.body()).length;
      
      console.log('Réponse HTTP:', status, '| Type:', contentType, '| Taille:', bodySize, 'bytes');
      
      if (status === 200 && contentType?.includes('image')) {
        console.log('✅ Image valide reçue');
        
        // Si l'image est très petite, c'est probablement une erreur
        if (bodySize < 500) {
          console.log('⚠️ Image suspicieusement petite, probablement une erreur');
          
          // Essayer de lire le contenu comme texte pour voir s'il y a un message d'erreur
          const bodyText = (await response.body()).toString();
          console.log('Contenu de l image (premiers 200 chars):', bodyText.substring(0, 200));
        }
      } else if (contentType?.includes('text')) {
        // L'image est en fait du texte (erreur)
        const errorText = await response.text();
        console.log('❌ Erreur PlantUML:', errorText);
        
        // Analyser le type d'erreur
        if (errorText.includes('bad URL')) {
          console.log('🔧 Diagnostic: Problème d encodage URL');
        } else if (errorText.includes('not HUFFMAN')) {
          console.log('🔧 Diagnostic: Problème de compression DEFLATE');
        } else if (errorText.includes('Syntax Error')) {
          console.log('🔧 Diagnostic: Erreur de syntaxe PlantUML');
        } else {
          console.log('🔧 Diagnostic: Erreur inconnue');
        }
      }
      
    } catch (error) {
      console.log('❌ Erreur lors du test de l URL:', error.message);
    }
    
    // Capture d'écran de l'image pour analyse visuelle
    try {
      await img.screenshot({ 
        path: '/tmp/plantuml_image_' + (i + 1) + '.png',
        type: 'png'
      });
      console.log('📷 Capture sauvée: /tmp/plantuml_image_' + (i + 1) + '.png');
    } catch (error) {
      console.log('❌ Impossible de capturer l image:', error.message);
    }
  }
  
  console.log('\n3. VERIFICATION DE L ENCODAGE PLANTUML');
  
  // Tester l'encodage PlantUML directement dans le navigateur
  const encodingTest = await page.evaluate(() => {
    // Test avec un diagramme simple
    const testDiagram = `@startuml
A --> B : test
@enduml`;
    
    if (window.OntoWave && typeof window.OntoWave.encodePlantUML === 'function') {
      try {
        const encoded = window.OntoWave.encodePlantUML(testDiagram);
        const url = 'https://www.plantuml.com/plantuml/png/' + encoded;
        
        return {
          success: true,
          originalText: testDiagram,
          encoded: encoded,
          url: url,
          urlLength: url.length
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    } else {
      return {
        success: false,
        error: 'encodePlantUML function not available'
      };
    }
  });
  
  console.log('🧪 Test d encodage:', JSON.stringify(encodingTest, null, 2));
  
  // Test de l'URL générée si l'encodage a réussi
  if (encodingTest.success && encodingTest.url) {
    console.log('\n4. TEST DE L URL GENEREE');
    
    try {
      const testResponse = await page.request.get(encodingTest.url);
      const testStatus = testResponse.status();
      const testContentType = testResponse.headers()['content-type'];
      const testBodySize = (await testResponse.body()).length;
      
      console.log('🔗 Test URL:', testStatus, '| Type:', testContentType, '| Taille:', testBodySize, 'bytes');
      
      if (testStatus !== 200 || !testContentType?.includes('image')) {
        const errorContent = await testResponse.text();
        console.log('❌ Erreur du serveur PlantUML:', errorContent.substring(0, 200));
      } else {
        console.log('✅ URL de test fonctionne correctement');
      }
    } catch (error) {
      console.log('❌ Erreur lors du test de l URL:', error.message);
    }
  }
  
  console.log('\n=== RESUME DU DIAGNOSTIC OCR ===');
  console.log('📸 Images trouvées:', plantumlImages.length);
  console.log('🔧 Fonction d encodage:', encodingTest.success ? '✅' : '❌');
  console.log('💡 Consultez les captures d écran dans /tmp/ pour l analyse visuelle');
});
