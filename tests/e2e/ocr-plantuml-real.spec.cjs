const { test, expect } = require('@playwright/test');

test('OCR veritable sur erreur PlantUML - Capture et analyse texte', async ({ page }) => {
  console.log('\n=== OCR VERITABLE SUR ERREUR PLANTUML ===');
  
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // Attendre le chargement complet
  
  console.log('\n1. LOCALISATION DE L IMAGE PLANTUML');
  
  // Trouver l'image PlantUML
  const plantumlImages = await page.locator('img[src*="plantuml"]').all();
  console.log('Nombre d images PlantUML trouvées:', plantumlImages.length);
  
  if (plantumlImages.length === 0) {
    console.log('❌ AUCUNE IMAGE PLANTUML TROUVÉE');
    
    // Chercher des traces de PlantUML dans le HTML
    const htmlContent = await page.content();
    const plantumlRefs = htmlContent.match(/plantuml/gi) || [];
    console.log('Références plantuml dans HTML:', plantumlRefs.length);
    
    if (plantumlRefs.length > 0) {
      console.log('HTML contient des références PlantUML mais pas d images générées');
      // Sauvegarder le HTML pour debug
      require('fs').writeFileSync('/tmp/ontowave-debug.html', htmlContent);
      console.log('HTML sauvé dans /tmp/ontowave-debug.html');
    }
    
    return;
  }
  
  console.log('\n2. ANALYSE DETAILLEE DE L IMAGE');
  
  for (let i = 0; i < plantumlImages.length; i++) {
    const img = plantumlImages[i];
    const src = await img.getAttribute('src');
    
    console.log('\n--- IMAGE PLANTUML', i + 1, '---');
    console.log('URL:', src);
    
    // Propriétés de l'image
    const imgProps = await img.evaluate(el => ({
      width: el.width,
      height: el.height,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      complete: el.complete,
      alt: el.alt,
      title: el.title,
      className: el.className,
      parentClassName: el.parentElement?.className || 'none'
    }));
    
    console.log('Propriétés image:', JSON.stringify(imgProps, null, 2));
    
    // Test direct de l'URL
    try {
      console.log('\n3. REQUETE DIRECTE VERS PLANTUML');
      const response = await page.request.get(src);
      const status = response.status();
      const headers = response.headers();
      const body = await response.body();
      
      console.log('Status HTTP:', status);
      console.log('Content-Type:', headers['content-type']);
      console.log('Content-Length:', headers['content-length']);
      console.log('Taille body:', body.length, 'bytes');
      
      // Si c'est du texte (erreur), on lit le contenu
      if (headers['content-type']?.includes('text') || status !== 200) {
        const errorText = body.toString();
        console.log('\n❌ ERREUR PLANTUML DETECTEE:');
        console.log('=== DEBUT MESSAGE D ERREUR ===');
        console.log(errorText);
        console.log('=== FIN MESSAGE D ERREUR ===');
        
        // Analyser le type d'erreur
        if (errorText.includes('bad URL')) {
          console.log('\n🔍 TYPE ERREUR: URL mal encodée');
        } else if (errorText.includes('not HUFFMAN')) {
          console.log('\n🔍 TYPE ERREUR: Compression DEFLATE défaillante');
        } else if (errorText.includes('Syntax Error')) {
          console.log('\n🔍 TYPE ERREUR: Syntaxe PlantUML incorrecte');
        } else if (errorText.includes('Bad URL')) {
          console.log('\n🔍 TYPE ERREUR: Format URL invalide');
        } else {
          console.log('\n🔍 TYPE ERREUR: Erreur inconnue');
        }
        
        // Sauvegarder l'erreur
        require('fs').writeFileSync('/tmp/plantuml-error-' + (i + 1) + '.txt', errorText);
        console.log('Erreur sauvée dans /tmp/plantuml-error-' + (i + 1) + '.txt');
        
      } else if (headers['content-type']?.includes('image')) {
        console.log('✅ Image valide reçue');
        
        // Sauvegarder l'image pour inspection visuelle
        require('fs').writeFileSync('/tmp/plantuml-image-' + (i + 1) + '.svg', body);
        console.log('Image sauvée dans /tmp/plantuml-image-' + (i + 1) + '.svg');
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la requête:', error.message);
    }
    
    console.log('\n4. CAPTURE D ECRAN POUR OCR VISUEL');
    
    // Capturer l'image telle qu'elle apparaît dans le navigateur
    try {
      // Mettre l'image en évidence
      await img.evaluate(el => {
        el.style.border = '3px solid red';
        el.style.padding = '10px';
        el.style.backgroundColor = 'yellow';
      });
      
      // Capture de l'image seule
      await img.screenshot({
        path: '/tmp/plantuml-browser-' + (i + 1) + '.png',
        type: 'png'
      });
      console.log('Capture navigateur sauvée: /tmp/plantuml-browser-' + (i + 1) + '.png');
      
      // Capture de la zone environnante pour contexte
      const parent = await img.locator('..').first();
      await parent.screenshot({
        path: '/tmp/plantuml-context-' + (i + 1) + '.png',
        type: 'png'
      });
      console.log('Capture contexte sauvée: /tmp/plantuml-context-' + (i + 1) + '.png');
      
    } catch (error) {
      console.log('❌ Erreur capture:', error.message);
    }
  }
  
  console.log('\n5. EXTRACTION URL POUR ANALYSE MANUELLE');
  
  // Extraire les URLs pour test manuel
  const urls = [];
  for (const img of plantumlImages) {
    const src = await img.getAttribute('src');
    urls.push(src);
  }
  
  console.log('\n=== URLS PLANTUML POUR TEST MANUEL ===');
  urls.forEach((url, i) => {
    console.log('URL ' + (i + 1) + ':', url);
  });
  
  console.log('\n=== COMMANDES POUR TEST MANUEL ===');
  urls.forEach((url, i) => {
    console.log('curl -v "' + url + '" -o /tmp/manual-test-' + (i + 1) + '.svg');
  });
  
  console.log('\n=== RESUME DIAGNOSTIC ===');
  console.log('Images PlantUML analysées:', plantumlImages.length);
  console.log('Vérifiez les fichiers dans /tmp/ pour l analyse OCR complete');
  console.log('Testez manuellement les URLs ci-dessus pour confirmer le problème');
});
