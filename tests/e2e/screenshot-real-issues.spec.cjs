const { test, expect } = require('@playwright/test');

test.describe('Capture d\'écran des vrais problèmes', () => {
  test('Analyser visuellement Prism et PlantUML', async ({ page }) => {
    console.log('📸 CAPTURE D\'ÉCRAN - Analyse visuelle des problèmes réels');
    
    // Configuration pour capturer les erreurs
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Aller sur la page
    await page.goto('http://localhost:8080/');
    await page.waitForSelector('.ontowave-container', { timeout: 15000 });
    await page.waitForTimeout(5000); // Laisser le temps à tout de se charger

    console.log('\n📸 PRISE DE CAPTURE D\'ÉCRAN COMPLÈTE');
    
    // 1. Capture d'écran complète de la page
    await page.screenshot({ 
      path: '/tmp/ontowave-full-page.png',
      fullPage: true 
    });
    console.log('📸 Capture complète sauvée : /tmp/ontowave-full-page.png');

    // 2. Analyse spécifique des blocs HTML Prism
    console.log('\n🎨 ANALYSE PRISM HTML :');
    const htmlBlocks = await page.locator('code.language-html').count();
    console.log(`📝 Blocs HTML détectés : ${htmlBlocks}`);
    
    if (htmlBlocks > 0) {
      // Capture des blocs HTML spécifiquement
      for (let i = 0; i < htmlBlocks; i++) {
        const block = page.locator('code.language-html').nth(i);
        await block.screenshot({ 
          path: `/tmp/prism-html-block-${i + 1}.png` 
        });
        console.log(`📸 Bloc HTML ${i + 1} capturé : /tmp/prism-html-block-${i + 1}.png`);
        
        // Analyser le contenu
        const content = await block.textContent();
        const innerHTML = await block.innerHTML();
        const hasTokens = await block.locator('.token').count();
        
        console.log(`   📝 Contenu : ${content?.substring(0, 100)}...`);
        console.log(`   🎨 Tokens Prism : ${hasTokens}`);
        console.log(`   📄 HTML rendu contient spans : ${innerHTML.includes('<span') ? 'OUI' : 'NON'}`);
      }
    }

    // 3. Analyse spécifique PlantUML
    console.log('\n🌱 ANALYSE PLANTUML :');
    const plantUMLImages = await page.locator('img[src*="plantuml.com"]').count();
    console.log(`📊 Images PlantUML détectées : ${plantUMLImages}`);
    
    if (plantUMLImages > 0) {
      for (let i = 0; i < plantUMLImages; i++) {
        const img = page.locator('img[src*="plantuml.com"]').nth(i);
        const src = await img.getAttribute('src');
        const width = await img.evaluate(el => el.naturalWidth);
        const height = await img.evaluate(el => el.naturalHeight);
        
        console.log(`📊 PlantUML ${i + 1}:`);
        console.log(`   📐 Dimensions : ${width}x${height}`);
        console.log(`   🔗 URL : ${src?.substring(0, 80)}...`);
        console.log(`   📄 Format demandé : ${src?.includes('/svg/') ? 'SVG' : (src?.includes('/png/') ? 'PNG' : 'AUTRE')}`);
        
        // Capture de l'image PlantUML
        await img.screenshot({ 
          path: `/tmp/plantuml-image-${i + 1}.png` 
        });
        console.log(`   📸 Image capturée : /tmp/plantuml-image-${i + 1}.png`);
        
        // Si c'est une erreur, essayer de récupérer le contenu
        if (width > 0 && height > 0) {
          console.log(`   ✅ Image chargée avec succès`);
        } else {
          console.log(`   ❌ Erreur de chargement - vérifier l'URL`);
        }
      }
    }

    // 4. Capture des sections spécifiques
    console.log('\n📸 CAPTURES SPÉCIFIQUES :');
    
    // Section des diagrammes
    const diagramSection = page.locator('text=Diagrammes supportés').locator('..').locator('..');
    if (await diagramSection.count() > 0) {
      await diagramSection.screenshot({ 
        path: '/tmp/diagrams-section.png' 
      });
      console.log('📸 Section diagrammes : /tmp/diagrams-section.png');
    }

    // Section des exemples de code
    const codeSection = page.locator('text=Utilisation').locator('..').locator('..');
    if (await codeSection.count() > 0) {
      await codeSection.screenshot({ 
        path: '/tmp/code-section.png' 
      });
      console.log('📸 Section code : /tmp/code-section.png');
    }

    // 5. Vérification configuration PlantUML actuelle
    console.log('\n⚙️ CONFIGURATION PLANTUML :');
    const plantUMLConfig = await page.evaluate(() => {
      if (window.OntoWave && window.OntoWave.config) {
        return window.OntoWave.config.plantuml || 'Non configuré';
      }
      return 'OntoWave non disponible';
    });
    console.log(`📋 Config PlantUML :`, plantUMLConfig);

    // 6. Résumé des erreurs détectées
    console.log('\n❌ ERREURS DÉTECTÉES :');
    if (errors.length > 0) {
      errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    } else {
      console.log('   Aucune erreur JavaScript détectée');
    }

    console.log('\n📋 MESSAGES CONSOLE PERTINENTS :');
    consoleMessages
      .filter(msg => msg.includes('Prism') || msg.includes('PlantUML') || msg.includes('error') || msg.includes('Error'))
      .forEach(msg => console.log(`   ${msg}`));

    console.log('\n🎯 CAPTURES GÉNÉRÉES :');
    console.log('   📸 /tmp/ontowave-full-page.png - Vue complète');
    console.log('   📸 /tmp/prism-html-block-*.png - Blocs HTML Prism');
    console.log('   📸 /tmp/plantuml-image-*.png - Images PlantUML');
    console.log('   📸 /tmp/diagrams-section.png - Section diagrammes');
    console.log('   📸 /tmp/code-section.png - Section code');
    
    console.log('\n✅ Analyse visuelle terminée - vérifiez les captures d\'écran');
  });
});
