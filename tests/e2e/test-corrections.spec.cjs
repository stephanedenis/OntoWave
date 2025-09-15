const { test, expect } = require('@playwright/test');

test.describe('Test corrections Prism et PlantUML', () => {
  test('Vérifier que les corrections fonctionnent', async ({ page }) => {
    console.log('🔧 TEST CORRECTIONS - Prism HTML et PlantUML SVG');
    
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Laisser le temps à Prism de traiter

    // 1. Test Prism HTML
    console.log('\n🎨 TEST PRISM HTML :');
    const htmlBlocks = await page.locator('code.language-html').count();
    console.log(`📝 Blocs HTML détectés : ${htmlBlocks}`);
    
    if (htmlBlocks > 0) {
      const firstBlock = page.locator('code.language-html').first();
      
      // Vérifier le contenu
      const content = await firstBlock.textContent();
      const innerHTML = await firstBlock.innerHTML();
      
      console.log(`📝 Contenu : ${content?.substring(0, 100)}...`);
      console.log(`📄 HTML échappé : ${innerHTML.includes('&lt;') ? 'OUI ✅' : 'NON ❌'}`);
      
      // Vérifier les tokens Prism
      const tokens = await firstBlock.locator('.token').count();
      console.log(`🎨 Tokens Prism créés : ${tokens}`);
      
      if (tokens > 0) {
        console.log('✅ Prism fonctionne maintenant !');
        
        // Analyser les types de tokens
        for (let i = 0; i < Math.min(tokens, 5); i++) {
          const token = firstBlock.locator('.token').nth(i);
          const tokenClass = await token.getAttribute('class');
          const tokenText = await token.textContent();
          console.log(`   🔸 Token ${i + 1}: "${tokenText}" (${tokenClass})`);
        }
      } else {
        console.log('❌ Prism ne fonctionne toujours pas');
      }
      
      // Capture du bloc HTML corrigé
      await firstBlock.screenshot({ 
        path: '/tmp/prism-html-corrected.png' 
      });
      console.log('📸 Bloc HTML corrigé : /tmp/prism-html-corrected.png');
    }

    // 2. Test PlantUML SVG
    console.log('\n🌱 TEST PLANTUML SVG :');
    const plantUMLImages = await page.locator('img[src*="plantuml"]').count();
    console.log(`📊 Images PlantUML détectées : ${plantUMLImages}`);
    
    if (plantUMLImages > 0) {
      for (let i = 0; i < plantUMLImages; i++) {
        const img = page.locator('img[src*="plantuml"]').nth(i);
        const src = await img.getAttribute('src');
        const width = await img.evaluate(el => el.naturalWidth);
        const height = await img.evaluate(el => el.naturalHeight);
        
        console.log(`📊 PlantUML ${i + 1}:`);
        console.log(`   🔗 Format dans URL : ${src?.includes('/svg/') ? 'SVG ✅' : 'PNG ❌'}`);
        console.log(`   📐 Dimensions : ${width}x${height}`);
        console.log(`   📄 Status : ${width > 0 ? 'Chargée ✅' : 'Erreur ❌'}`);
        
        if (src?.includes('/svg/')) {
          console.log('✅ PlantUML utilise bien SVG UTF-8');
        } else {
          console.log('❌ PlantUML n\'utilise pas SVG');
        }
        
        // Test de récupération du SVG pour les erreurs
        if (width === 0 && src?.includes('/svg/')) {
          console.log('   🔍 Test récupération erreur SVG...');
          try {
            const response = await page.request.get(src);
            const svgContent = await response.text();
            
            if (svgContent.includes('<svg')) {
              console.log('   ✅ SVG récupéré en UTF-8');
              if (svgContent.includes('Error') || svgContent.includes('error')) {
                console.log('   📄 Message d\'erreur détecté dans SVG');
              }
            } else {
              console.log('   ❌ Pas de contenu SVG valide');
            }
          } catch (e) {
            console.log(`   ❌ Erreur lors de la récupération : ${e.message}`);
          }
        }
      }
    }

    // 3. Capture finale
    console.log('\n📸 CAPTURES FINALES :');
    await page.screenshot({ 
      path: '/tmp/ontowave-corrected.png',
      fullPage: true 
    });
    console.log('📸 Page complète corrigée : /tmp/ontowave-corrected.png');

    // 4. Résumé des corrections
    console.log('\n🎯 RÉSUMÉ DES CORRECTIONS :');
    const prismTokens = await page.locator('.token').count();
    const svgPlantUML = await page.locator('img[src*="/svg/"]').count();
    
    console.log(`🎨 Prism HTML : ${prismTokens > 0 ? 'CORRIGÉ ✅' : 'TOUJOURS EN ERREUR ❌'}`);
    console.log(`🌱 PlantUML SVG : ${svgPlantUML > 0 ? 'UTILISE SVG ✅' : 'N\'UTILISE PAS SVG ❌'}`);
    
    const allGood = prismTokens > 0 && svgPlantUML > 0;
    console.log(`\n🏆 STATUT GLOBAL : ${allGood ? '🎉 CORRECTIONS RÉUSSIES !' : '⚠️ PROBLÈMES PERSISTANTS'}`);
  });
});
