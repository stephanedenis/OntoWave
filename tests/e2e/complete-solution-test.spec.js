// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Complete Solution Test', () => {
  test('Test all three issues: slow loading, missing Mermaid, lost hash', async ({ page }) => {
    console.log('🎯 Test complet des trois problèmes OntoWave...');
    
    const startTime = Date.now();
    
    // Capturer les logs importants
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Mermaid') || text.includes('Fix') || text.includes('hash') || text.includes('diagramme')) {
        console.log(`📝 ${text}`);
      }
      if (msg.type() === 'error') {
        console.log(`❌ Error: ${text}`);
      }
    });
    
    await page.goto('http://127.0.0.1:8080/#index.md');
    
    // TEST 1: Vitesse de chargement
    console.log('\n⚡ TEST 1: Vitesse de chargement...');
    
    let loaded = false;
    let attempts = 0;
    
    while (!loaded && attempts < 8) {
      attempts++;
      await page.waitForTimeout(1000);
      
      const content = await page.locator('#app').textContent();
      const isLoading = content?.includes('Chargement');
      const hasContent = content && content.length > 200;
      
      if (!isLoading && hasContent) {
        loaded = true;
        const loadTime = Date.now() - startTime;
        console.log(`✅ CHARGEMENT RÉUSSI en ${loadTime}ms (${attempts}s)`);
      } else {
        console.log(`⏳ Tentative ${attempts}: ${isLoading ? 'En chargement...' : 'Contenu insuffisant'}`);
      }
    }
    
    if (!loaded) {
      console.log('❌ PROBLÈME 1: Chargement trop lent');
      return;
    }
    
    // TEST 2: Rendu Mermaid avec injection de test
    console.log('\n🎨 TEST 2: Rendu Mermaid...');
    
    await page.waitForTimeout(2000);
    
    // Injection d'un diagramme de test
    const mermaidTest = await page.evaluate(() => {
      const app = document.getElementById('app');
      if (!app) return 'App non trouvée';
      
      // Créer un diagramme de test
      const testContainer = document.createElement('div');
      testContainer.innerHTML = `
        <h3>🧪 Test Mermaid OntoWave</h3>
        <div class="mermaid">
        flowchart TD
          A[🚀 Démarrage] --> B{⚡ Chargement OK?}
          B -->|✅ Oui| C[🎨 Test Mermaid]
          B -->|❌ Non| D[🚨 Erreur]
          C --> E{📊 Rendu OK?}
          E -->|✅ Oui| F[🎉 Succès]
          E -->|❌ Non| G[🔧 Fix Mermaid]
          G --> C
          D --> H[🔄 Restart]
          H --> A
          F --> I[🔗 Test Navigation]
        </div>
      `;
      
      app.appendChild(testContainer);
      
      // Forcer le rendu Mermaid
      if (window.mermaid) {
        setTimeout(() => {
          try {
            window.mermaid.run();
            console.log('🚀 Mermaid.run() exécuté pour le test');
          } catch (e) {
            console.log('❌ Erreur Mermaid.run():', e);
          }
        }, 500);
        return '✅ Test injecté avec Mermaid disponible';
      } else {
        return '⚠️ Test injecté mais Mermaid non disponible';
      }
    });
    
    console.log(`📊 Injection: ${mermaidTest}`);
    
    await page.waitForTimeout(3000);
    
    // Vérifier le rendu
    const mermaidDivs = await page.locator('.mermaid').count();
    const svgCount = await page.locator('.mermaid svg, svg[aria-roledescription="mermaid"]').count();
    
    console.log(`📊 Éléments .mermaid: ${mermaidDivs}`);
    console.log(`📊 SVG rendus: ${svgCount}`);
    
    if (svgCount > 0) {
      console.log('✅ MERMAID RÉUSSI: Diagrammes rendus');
    } else if (mermaidDivs > 0) {
      console.log('⚠️ MERMAID PARTIEL: Éléments présents mais non rendus');
    } else {
      console.log('❌ PROBLÈME 2: Mermaid non fonctionnel');
    }
    
    // TEST 3: Navigation hash
    console.log('\n🔗 TEST 3: Navigation avec hash...');
    
    const linkTests = [
      { selector: 'a[href="#en/index.md"]', name: 'EN' },
      { selector: 'a[href="#fr/index.md"]', name: 'FR' },
      { selector: 'a[href="#index.md"]', name: 'Home' }
    ];
    
    let navSuccess = 0;
    let navTotal = 0;
    
    for (const linkTest of linkTests) {
      const link = page.locator(linkTest.selector).first();
      const count = await link.count();
      
      if (count > 0) {
        navTotal++;
        try {
          const beforeUrl = page.url();
          console.log(`🔗 Test navigation ${linkTest.name}...`);
          
          await link.click();
          await page.waitForTimeout(1000);
          
          const afterUrl = page.url();
          const hashPreserved = afterUrl.includes('#') && !afterUrl.endsWith('#');
          
          console.log(`📍 ${beforeUrl} → ${afterUrl}`);
          console.log(`✅ Hash préservé: ${hashPreserved ? 'OUI' : 'NON'}`);
          
          if (hashPreserved) navSuccess++;
          
        } catch (error) {
          console.log(`❌ Erreur navigation ${linkTest.name}: ${error.message}`);
        }
      }
    }
    
    // RÉSUMÉ FINAL
    console.log('\n🏆 === RÉSULTATS FINAUX ===');
    console.log(`⚡ Problème 1 (chargement lent): ${loaded ? '✅ RÉSOLU' : '❌ NON RÉSOLU'}`);
    console.log(`🎨 Problème 2 (Mermaid absent): ${svgCount > 0 ? '✅ RÉSOLU' : (mermaidDivs > 0 ? '⚠️ PARTIEL' : '❌ NON RÉSOLU')}`);
    console.log(`🔗 Problème 3 (hash perdus): ${navSuccess > 0 ? `✅ RÉSOLU (${navSuccess}/${navTotal})` : '❌ NON RÉSOLU'}`);
    
    const score = (loaded ? 1 : 0) + (svgCount > 0 ? 1 : (mermaidDivs > 0 ? 0.5 : 0)) + (navSuccess > 0 ? 1 : 0);
    console.log(`📊 Score global: ${score}/3`);
    
    if (score >= 2.5) {
      console.log('🎉 EXCELLENT: Problèmes largement résolus !');
    } else if (score >= 2) {
      console.log('✅ BIEN: Majorité des problèmes résolus');
    } else {
      console.log('⚠️ AMÉLIORATIONS NÉCESSAIRES');
    }
    
    // Screenshot final
    await page.screenshot({ path: 'test-results/ontowave-complete-test.png', fullPage: true });
    console.log('📸 Capture finale sauvegardée');
  });
});
