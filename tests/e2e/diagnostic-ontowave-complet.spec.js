import { test, expect } from '@playwright/test';

test.describe('OntoWave Diagnostic Complet', () => {
  test('🔍 Diagnostic page blanche avec capture + console', async ({ page }) => {
    // Capturer les erreurs console
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
      console.log(`Page Error: ${err.message}`);
    });
    
    // Tenter de charger la page
    console.log('🌐 Tentative de chargement: http://localhost:5173/');
    
    try {
      await page.goto('http://localhost:5173/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Capture d'écran immédiate
      await page.screenshot({ 
        path: 'diagnostic-page-loaded.png',
        fullPage: true 
      });
      console.log('📸 Capture: diagnostic-page-loaded.png');
      
    } catch (error) {
      console.log(`❌ Erreur chargement page: ${error.message}`);
      
      // Capture même en cas d'erreur
      try {
        await page.screenshot({ 
          path: 'diagnostic-page-error.png',
          fullPage: true 
        });
        console.log('📸 Capture erreur: diagnostic-page-error.png');
      } catch (screenshotError) {
        console.log(`❌ Impossible de capturer: ${screenshotError.message}`);
      }
    }
    
    // Vérifier le contenu DOM
    const htmlContent = await page.content();
    console.log('📄 Taille HTML reçu:', htmlContent.length, 'caractères');
    console.log('📄 Début HTML:', htmlContent.substring(0, 200));
    
    // Vérifier les éléments de base
    const bodyText = await page.locator('body').textContent();
    console.log('📝 Contenu body:', bodyText?.substring(0, 100) || 'VIDE');
    
    // Vérifier si OntoWave s'initialise
    const appElement = page.locator('#app');
    const hasApp = await appElement.count();
    console.log('🎯 Élément #app trouvé:', hasApp > 0);
    
    if (hasApp > 0) {
      const appContent = await appElement.textContent();
      console.log('📱 Contenu #app:', appContent?.substring(0, 100) || 'VIDE');
    }
    
    // Vérifier les scripts chargés
    const scripts = await page.locator('script').count();
    console.log('📜 Nombre de scripts:', scripts);
    
    // Attendre un peu et refaire une capture
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: 'diagnostic-page-final.png',
      fullPage: true 
    });
    console.log('📸 Capture finale: diagnostic-page-final.png');
    
    // Résumé des messages console
    console.log('\n📊 RÉSUMÉ CONSOLE:');
    console.log('Messages total:', consoleMessages.length);
    consoleMessages.forEach(msg => {
      console.log(`  ${msg.type}: ${msg.text}`);
    });
    
    console.log('\n❌ ERREURS:');
    errors.forEach(err => {
      console.log(`  Error: ${err}`);
    });
    
    // Test alternatif: tenter test-tableaux.md directement
    console.log('\n🧪 Test alternatif: test-tableaux.md');
    try {
      await page.goto('http://localhost:5173/test-tableaux.md', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      await page.screenshot({ 
        path: 'diagnostic-test-tableaux.png',
        fullPage: true 
      });
      console.log('📸 Capture test-tableaux: diagnostic-test-tableaux.png');
      
      const tableauContent = await page.content();
      console.log('📄 Contenu test-tableaux:', tableauContent.substring(0, 300));
      
    } catch (error) {
      console.log(`❌ Erreur test-tableaux: ${error.message}`);
    }
  });
  
  test('🔧 Test direct composant JS OntoWave', async ({ page }) => {
    console.log('🧪 Test direct du composant JavaScript OntoWave');
    
    // Créer une page de test minimaliste
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Direct OntoWave</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .debug { background: #f0f0f0; padding: 10px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>Test Direct OntoWave</h1>
        <div class="debug" id="debug">Initialisation...</div>
        <div id="app">Chargement OntoWave...</div>
        
        <script type="module">
          console.log('🚀 Script de test démarré');
          const debug = document.getElementById('debug');
          
          function log(msg) {
            console.log(msg);
            debug.innerHTML += '<br>' + msg;
          }
          
          log('📁 Tentative import OntoWave...');
          
          try {
            // Tenter d'importer depuis différents chemins
            log('📦 Import depuis /src/main.ts...');
            const module = await import('/src/main.ts');
            log('✅ Import réussi: ' + Object.keys(module));
            
          } catch (error) {
            log('❌ Erreur import: ' + error.message);
            
            // Test des composants individuels
            try {
              log('🧪 Test import md.ts...');
              const mdModule = await import('/src/adapters/browser/md.ts');
              log('✅ md.ts importé: ' + Object.keys(mdModule));
              
              if (mdModule.createMd) {
                log('🔧 Test createMd...');
                const md = mdModule.createMd();
                const testMarkdown = "# Test\\n\\n| A | B |\\n|---|---|\\n| 1 | 2 |";
                const result = md.render(testMarkdown);
                log('✅ Rendu MD: ' + result.substring(0, 100));
                
                // Injecter le résultat
                document.getElementById('app').innerHTML = result;
              }
              
            } catch (mdError) {
              log('❌ Erreur md.ts: ' + mdError.message);
            }
          }
        </script>
      </body>
      </html>
    `);
    
    // Capturer la page de test
    await page.screenshot({ 
      path: 'diagnostic-test-direct.png',
      fullPage: true 
    });
    console.log('📸 Capture test direct: diagnostic-test-direct.png');
    
    // Attendre que le script s'exécute
    await page.waitForTimeout(5000);
    
    // Capture finale
    await page.screenshot({ 
      path: 'diagnostic-test-direct-final.png',
      fullPage: true 
    });
    console.log('📸 Capture finale test direct: diagnostic-test-direct-final.png');
    
    // Vérifier le résultat
    const appContent = await page.locator('#app').textContent();
    console.log('📱 Résultat app:', appContent);
    
    const debugContent = await page.locator('#debug').textContent();
    console.log('🔍 Debug:', debugContent);
  });
});