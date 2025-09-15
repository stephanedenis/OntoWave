const { test, expect } = require('@playwright/test');

test('🧪 Test final PlantUML fonctionnel', async ({ page }) => {
  console.log('\n🎯 === TEST FINAL PLANTUML ===');
  
  // Force l'arrêt du cache et reload complet
  await page.goto('http://localhost:8081?v=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 1. Vérifier que OntoWave est chargé
  const loaded = await page.evaluate(() => !!window.OntoWave?.instance?.config);
  console.log('✅ OntoWave chargé:', loaded);
  
  // 2. Analyser les diagrammes PlantUML
  const plantumlAnalysis = await page.evaluate(() => {
    const plantumlDivs = document.querySelectorAll('.ontowave-plantuml');
    const results = [];
    
    plantumlDivs.forEach((div, index) => {
      const img = div.querySelector('img');
      results.push({
        index,
        hasImage: !!img,
        imageSrc: img ? img.src.substring(0, 150) + '...' : null,
        imageLoaded: img ? img.complete && img.naturalWidth > 0 : false,
        imageWidth: img ? img.naturalWidth : 0,
        imageHeight: img ? img.naturalHeight : 0,
        hasError: div.innerHTML.includes('Erreur de rendu')
      });
    });
    
    return {
      totalDivs: plantumlDivs.length,
      results
    };
  });
  
  console.log('📊 Analyse PlantUML finale:', JSON.stringify(plantumlAnalysis, null, 2));
  
  // 3. Test de l'encodage directement
  const encodingTest = await page.evaluate(() => {
    const testDiagram = '@startuml\nA --> B\n@enduml';
    
    function encodePlantUML(text) {
      const base64 = btoa(unescape(encodeURIComponent(text)));
      return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
    
    const encoded = encodePlantUML(testDiagram);
    const testUrl = `https://www.plantuml.com/plantuml/svg/~1${encoded}`;
    
    return {
      originalText: testDiagram,
      encoded: encoded,
      fullUrl: testUrl
    };
  });
  
  console.log('🔧 Test encodage:', JSON.stringify(encodingTest, null, 2));
  
  // 4. Test de la requête URL
  const urlTest = await page.evaluate(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        success: true,
        status: response.status,
        contentType: response.headers.get('content-type')
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }, encodingTest.fullUrl);
  
  console.log('📡 Test URL finale:', JSON.stringify(urlTest, null, 2));
  
  // Attendre que les images se chargent
  await page.waitForTimeout(5000);
  
  // 5. Vérification finale des images
  const finalCheck = await page.evaluate(() => {
    const images = document.querySelectorAll('.ontowave-plantuml img');
    let loadedCount = 0;
    let errorCount = 0;
    
    images.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        loadedCount++;
      } else if (img.src.includes('error') || !img.complete) {
        errorCount++;
      }
    });
    
    return {
      totalImages: images.length,
      loadedImages: loadedCount,
      errorImages: errorCount,
      errorDivs: document.querySelectorAll('.ontowave-plantuml div[style*="color: #d73a49"]').length
    };
  });
  
  console.log('🎯 Vérification finale:', JSON.stringify(finalCheck, null, 2));
  console.log('\n📈 RÉSUMÉ:');
  console.log(`- Divs PlantUML créées: ${plantumlAnalysis.totalDivs}`);
  console.log(`- Images avec URL: ${plantumlAnalysis.results.filter(r => r.hasImage).length}`);
  console.log(`- Images chargées: ${finalCheck.loadedImages}`);
  console.log(`- Erreurs: ${finalCheck.errorDivs}`);
  
  expect(plantumlAnalysis.totalDivs).toBeGreaterThan(0);
});
