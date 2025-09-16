const { test, expect } = require('@playwright/test');

test('Test des erreurs PlantUML avec captures OCR', async ({ page }) => {
  console.log('\n=== TEST ERREURS PLANTUML AVEC OCR ===');
  
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('\n1. ETAT ACTUEL PLANTUML');
  const currentState = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img[src*="plantuml"]');
    return {
      imageCount: imgs.length,
      images: Array.from(imgs).map(img => ({
        src: img.src,
        width: img.width,
        height: img.height
      }))
    };
  });
  
  console.log('Images PlantUML actuelles:', JSON.stringify(currentState, null, 2));
  
  // Injecter du contenu avec PlantUML intentionnellement cassé pour tester les erreurs
  console.log('\n2. TEST AVEC PLANTUML CASSE');
  
  const testResult = await page.evaluate(() => {
    // Simuler du contenu markdown avec PlantUML cassé
    const brokenMarkdown = `# Test PlantUML Cassé

Voici un PlantUML intentionnellement cassé pour tester les erreurs :

\`\`\`plantuml
@startuml
// PlantUML avec syntaxe volontairement incorrecte
INVALID SYNTAX HERE -> Should cause error
participant "Test with special chars: éàç§"
Test -> @#$%^&*() : invalid syntax
@enduml  
\`\`\`

Et un PlantUML correct pour comparaison :

\`\`\`plantuml  
@startuml
A -> B : test simple
@enduml
\`\`\`
`;

    // Insérer le contenu dans une div temporaire pour test
    const testDiv = document.createElement('div');
    testDiv.id = 'test-plantuml';
    testDiv.innerHTML = '<p>Test en cours...</p>';
    document.body.appendChild(testDiv);
    
    // Appeler OntoWave pour traiter ce markdown s'il est disponible
    if (window.OntoWave && window.OntoWave.renderMarkdown) {
      try {
        const renderedHTML = window.OntoWave.renderMarkdown(brokenMarkdown);
        testDiv.innerHTML = renderedHTML;
        
        return {
          success: true,
          html: renderedHTML,
          containsImages: renderedHTML.includes('<img'),
          plantumlBlocks: (renderedHTML.match(/plantuml/g) || []).length
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
        error: 'OntoWave.renderMarkdown not available'
      };
    }
  });
  
  console.log('Résultat du test:', JSON.stringify(testResult, null, 2));
  
  // Attendre que les nouvelles images se chargent
  await page.waitForTimeout(5000);
  
  console.log('\n3. ANALYSE DES NOUVELLES IMAGES');
  
  const newImages = await page.locator('img[src*="plantuml"]').all();
  console.log('Nouvelles images PlantUML:', newImages.length);
  
  // Analyser chaque nouvelle image
  for (let i = 0; i < newImages.length; i++) {
    const img = newImages[i];
    const src = await img.getAttribute('src');
    
    console.log('\nAnalyse image', i + 1, ':', src);
    
    try {
      const response = await page.request.get(src);
      const status = response.status();
      const contentType = response.headers()['content-type'];
      const body = await response.body();
      const bodySize = body.length;
      
      console.log('Status:', status, '| Type:', contentType, '| Taille:', bodySize);
      
      if (status !== 200 || contentType?.includes('text')) {
        const errorText = body.toString();
        console.log('ERREUR PlantUML detectée:', errorText.substring(0, 300));
        
        // Analyser le type d'erreur spécifique
        if (errorText.includes('Syntax Error')) {
          console.log('🔍 Type: Erreur de syntaxe PlantUML');
        } else if (errorText.includes('bad URL')) {
          console.log('🔍 Type: Erreur d encodage URL');
        } else if (errorText.includes('not HUFFMAN')) {
          console.log('🔍 Type: Erreur de compression DEFLATE');
        } else if (errorText.includes('Bad URL')) {
          console.log('🔍 Type: URL malformée');
        }
        
        // Sauvegarder l'erreur pour analyse
        await page.evaluate((errorContent) => {
          const errorDiv = document.createElement('div');
          errorDiv.id = 'plantuml-error-' + Date.now();
          errorDiv.innerHTML = '<h3>Erreur PlantUML:</h3><pre>' + errorContent + '</pre>';
          errorDiv.style.border = '2px solid red';
          errorDiv.style.padding = '10px';
          errorDiv.style.margin = '10px';
          errorDiv.style.backgroundColor = '#ffe6e6';
          document.body.appendChild(errorDiv);
        }, errorText);
      }
      
      // Capture d'écran de chaque image/erreur
      await img.screenshot({
        path: '/tmp/plantuml_test_' + (i + 1) + '.png',
        type: 'png'
      });
      console.log('Capture sauvée: /tmp/plantuml_test_' + (i + 1) + '.png');
      
    } catch (error) {
      console.log('Erreur lors de l analyse:', error.message);
    }
  }
  
  // Capture d'écran de la page complète pour contexte
  await page.screenshot({
    path: '/tmp/plantuml_full_page.png',
    fullPage: true
  });
  console.log('Capture complète sauvée: /tmp/plantuml_full_page.png');
  
  console.log('\n=== CONCLUSION ===');
  console.log('Images PlantUML analysées:', newImages.length);
  console.log('Vérifiez les captures dans /tmp/ pour voir les erreurs visuellement');
});
