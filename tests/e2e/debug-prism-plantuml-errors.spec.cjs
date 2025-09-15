const { test, expect } = require('@playwright/test');

test.describe('Diagnostic des erreurs Prism et PlantUML', () => {
  test('Analyser les problèmes Prism HTML et PlantUML', async ({ page }) => {
    console.log('🔍 DIAGNOSTIC - Problèmes Prism HTML et PlantUML');
    
    // Capturer les erreurs de console
    const consoleMessages = [];
    const consoleErrors = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Aller sur la page
    await page.goto('http://localhost:8080/');
    
    // Attendre que OntoWave se charge
    await page.waitForSelector('.ontowave-container', { timeout: 10000 });
    await page.waitForTimeout(3000);

    console.log('\n📊 ANALYSE DES ERREURS CONSOLE :');
    consoleErrors.forEach((error, index) => {
      console.log(`❌ Erreur ${index + 1}: ${error}`);
    });

    console.log('\n📋 MESSAGES CONSOLE COMPLETS :');
    consoleMessages.forEach((msg, index) => {
      if (msg.includes('Prism') || msg.includes('PlantUML') || msg.includes('error') || msg.includes('Error')) {
        console.log(`🔸 ${index + 1}: ${msg}`);
      }
    });

    // Vérifier spécifiquement Prism
    console.log('\n🎨 ANALYSE PRISM :');
    const prismElements = await page.locator('pre[class*="language-"], code[class*="language-"]').count();
    console.log(`📍 Éléments Prism détectés : ${prismElements}`);
    
    // Vérifier le contenu HTML qui devrait être coloré
    const htmlBlocks = await page.locator('pre.language-html, code.language-html').count();
    console.log(`📍 Blocs HTML Prism : ${htmlBlocks}`);
    
    if (htmlBlocks > 0) {
      const htmlContent = await page.locator('pre.language-html').first().textContent();
      console.log(`📍 Contenu HTML à colorer : ${htmlContent ? htmlContent.substring(0, 100) + '...' : 'VIDE'}`);
      
      // Vérifier si Prism a appliqué des classes
      const tokenElements = await page.locator('pre.language-html .token').count();
      console.log(`📍 Tokens Prism appliqués : ${tokenElements}`);
    }

    // Vérifier spécifiquement PlantUML
    console.log('\n🌱 ANALYSE PLANTUML :');
    const plantUMLImages = await page.locator('img[src*="plantuml.com"]').count();
    console.log(`📍 Images PlantUML détectées : ${plantUMLImages}`);
    
    // Analyser chaque image PlantUML
    for (let i = 0; i < plantUMLImages; i++) {
      const img = page.locator('img[src*="plantuml.com"]').nth(i);
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      const naturalHeight = await img.evaluate(el => el.naturalHeight);
      
      console.log(`📍 PlantUML ${i + 1}:`);
      console.log(`   URL: ${src ? src.substring(0, 100) + '...' : 'UNDEFINED'}`);
      console.log(`   Dimensions: ${naturalWidth}x${naturalHeight}`);
      console.log(`   Status: ${naturalWidth > 0 ? '✅ Chargée' : '❌ Erreur de chargement'}`);
      
      if (naturalWidth === 0) {
        // Tenter de récupérer l'erreur depuis l'image
        const response = await page.goto(src);
        const responseText = await response.text();
        if (responseText.includes('bad URL') || responseText.includes('HUFFMAN')) {
          console.log(`   ❌ Erreur détectée: ${responseText.substring(0, 200)}`);
        }
      }
    }

    // Vérifier le code source de renderMarkdown pour identifier les problèmes
    console.log('\n🔍 ANALYSE DU CODE ONTOWAVE :');
    const ontoWaveExists = await page.evaluate(() => typeof window.OntoWave !== 'undefined');
    console.log(`📍 OntoWave chargé : ${ontoWaveExists}`);
    
    if (ontoWaveExists) {
      // Vérifier la méthode renderMarkdown
      const hasRenderMarkdown = await page.evaluate(() => 
        typeof window.OntoWave.renderMarkdown === 'function'
      );
      console.log(`📍 renderMarkdown disponible : ${hasRenderMarkdown}`);
    }

    // Résumé final
    console.log('\n🎯 RÉSUMÉ DES PROBLÈMES :');
    console.log(`❌ Erreurs console : ${consoleErrors.length}`);
    console.log(`🎨 Prism HTML opérationnel : ${htmlBlocks > 0 ? '✅' : '❌'}`);
    console.log(`🌱 PlantUML fonctionnel : ${plantUMLImages > 0 ? 'Partiellement' : '❌'}`);
    
    // Prendre une capture d'écran pour diagnostic visuel
    await page.screenshot({ 
      path: '/tmp/diagnostic-prism-plantuml.png',
      fullPage: true 
    });
    console.log('📸 Capture d\'écran sauvée : /tmp/diagnostic-prism-plantuml.png');
  });
});
