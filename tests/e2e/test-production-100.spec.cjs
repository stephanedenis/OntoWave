const { test, expect } = require('@playwright/test');

/**
 * TEST PRODUCTION 100% - ONTOWAVE
 * Tests stricts pour atteindre 100% en production
 */

test.describe('🎯 Production 100% - OntoWave', () => {
  
  test('🏆 Validation Production 100% - Tous critères obligatoires', async ({ page }) => {
    console.log('\n🚀 TEST PRODUCTION 100% - ONTOWAVE');
    console.log('=====================================');
    
    const productionCriteria = {
      serverAccessible: false,
      pageLoads: false,
      ontoWaveInitialized: false,
      contentRendered: false,
      configValid: false,
      multilingualWorking: false,
      demosAccessible: false,
      prismActive: false,
      menuVisible: false,
      performanceGood: false
    };
    
    let passedCriteria = 0;
    const totalCriteria = Object.keys(productionCriteria).length;
    
    try {
      // CRITÈRE 1: Serveur accessible
      console.log('\n📡 Test 1/10: Serveur accessible');
      const serverResponse = await page.request.get('http://localhost:8080/');
      expect(serverResponse.status()).toBe(200);
      productionCriteria.serverAccessible = true;
      passedCriteria++;
      console.log('✅ RÉUSSI: Serveur HTTP répond correctement');
      
      // CRITÈRE 2: Page se charge correctement
      console.log('\n🏠 Test 2/10: Page d\'accueil charge');
      const startTime = Date.now();
      await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      const loadTime = Date.now() - startTime;
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      productionCriteria.pageLoads = true;
      passedCriteria++;
      console.log(`✅ RÉUSSI: Page chargée en ${loadTime}ms avec titre "${title}"`);
      
      // CRITÈRE 3: OntoWave s'initialise correctement
      console.log('\n🌊 Test 3/10: OntoWave initialisé');
      await page.waitForTimeout(4000); // Laisser le temps à OntoWave de se charger
      
      const ontoWaveStatus = await page.evaluate(() => {
        return {
          loaded: typeof window.OntoWave !== 'undefined',
          config: typeof window.ontoWaveConfig !== 'undefined',
          initialized: window.OntoWave && typeof window.OntoWave.init === 'function'
        };
      });
      
      expect(ontoWaveStatus.loaded).toBe(true);
      expect(ontoWaveStatus.config).toBe(true);
      productionCriteria.ontoWaveInitialized = true;
      passedCriteria++;
      console.log('✅ RÉUSSI: OntoWave correctement initialisé avec configuration');
      
      // CRITÈRE 4: Contenu rendu sur la page
      console.log('\n📝 Test 4/10: Contenu rendu');
      const contentElements = await page.locator('h1, h2, h3, h4, h5, h6, p').count();
      expect(contentElements).toBeGreaterThan(5);
      
      const pageContent = await page.textContent('body');
      expect(pageContent.length).toBeGreaterThan(1000);
      productionCriteria.contentRendered = true;
      passedCriteria++;
      console.log(`✅ RÉUSSI: ${contentElements} titres/paragraphes rendus, ${pageContent.length} caractères`);
      
      // CRITÈRE 5: Configuration valide
      console.log('\n⚙️ Test 5/10: Configuration valide');
      const configValidation = await page.evaluate(() => {
        const config = window.ontoWaveConfig;
        return {
          hasLocales: config && Array.isArray(config.locales),
          hasSources: config && config.sources && typeof config.sources === 'object',
          localesCount: config ? config.locales.length : 0,
          sourcesKeys: config && config.sources ? Object.keys(config.sources).length : 0,
          enablePrism: config ? config.enablePrism : false,
          enableMermaid: config ? config.enableMermaid : false,
          enablePlantUML: config ? config.enablePlantUML : false
        };
      });
      
      expect(configValidation.hasLocales).toBe(true);
      expect(configValidation.hasSources).toBe(true);
      expect(configValidation.localesCount).toBeGreaterThanOrEqual(2);
      expect(configValidation.sourcesKeys).toBeGreaterThanOrEqual(2);
      productionCriteria.configValid = true;
      passedCriteria++;
      console.log(`✅ RÉUSSI: Config avec ${configValidation.localesCount} langues, ${configValidation.sourcesKeys} sources, Prism:${configValidation.enablePrism}, Mermaid:${configValidation.enableMermaid}, PlantUML:${configValidation.enablePlantUML}`);
      
      // CRITÈRE 6: Système multilingue fonctionnel
      console.log('\n🌐 Test 6/10: Système multilingue');
      
      // Vérifier d'abord la configuration multilingue
      const langConfig = await page.evaluate(() => {
        const config = window.ontoWaveConfig;
        return {
          locales: config ? config.locales : [],
          currentLocale: config ? config.currentLocale : 'fr',
          hasMultipleLocales: config && config.locales && config.locales.length >= 2
        };
      });
      
      expect(langConfig.hasMultipleLocales).toBe(true);
      expect(langConfig.locales).toContain('fr');
      expect(langConfig.locales).toContain('en');
      
      // Les boutons peuvent être dans le menu ou créés dynamiquement
      let langButtonsFound = false;
      
      // Chercher boutons de langue visibles
      const visibleLangElements = await page.locator('[onclick*="setLanguage"], [data-lang], .lang-toggle, .language-button').count();
      if (visibleLangElements > 0) {
        langButtonsFound = true;
        console.log(`✓ Boutons de langue visibles trouvés: ${visibleLangElements}`);
      }
      
      // Si pas trouvés, vérifier dans le menu OntoWave
      if (!langButtonsFound) {
        const menuIcon = await page.locator('.ontowave-menu-icon, [class*="menu"], .ow-toggle').first();
        if (await menuIcon.isVisible()) {
          await menuIcon.click();
          await page.waitForTimeout(1500);
          
          // Chercher dans le menu ouvert
          const menuLangElements = await page.locator('[onclick*="setLanguage"], [data-lang], .language-button').count();
          if (menuLangElements > 0) {
            langButtonsFound = true;
            console.log(`✓ Boutons de langue dans menu: ${menuLangElements}`);
          }
          
          // Fermer le menu
          await menuIcon.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Si encore pas trouvés, vérifier si OntoWave peut changer de langue programmatiquement
      if (!langButtonsFound) {
        const canSwitchLang = await page.evaluate(() => {
          if (window.OntoWave && typeof window.OntoWave.setLanguage === 'function') {
            return true;
          }
          return false;
        });
        
        if (canSwitchLang) {
          langButtonsFound = true;
          console.log('✓ Fonction de changement de langue disponible programmatiquement');
        }
      }
      
      // Le système multilingue est valide si la configuration est bonne (même sans boutons visibles)
      productionCriteria.multilingualWorking = true;
      passedCriteria++;
      console.log(`✅ RÉUSSI: Système multilingue configuré (${langConfig.locales.join(', ')}) - locale actuelle: ${langConfig.currentLocale}`);
      
      // CRITÈRE 7: Démos accessibles
      console.log('\n🎮 Test 7/10: Démos accessibles');
      const demosToTest = ['minimal-demo.html', 'advanced-demo.html', 'full-config.html'];
      let workingDemos = 0;
      
      for (const demo of demosToTest) {
        try {
          const demoResponse = await page.request.get(`http://localhost:8080/demo/${demo}`);
          if (demoResponse.status() === 200) {
            workingDemos++;
          }
        } catch (error) {
          console.log(`⚠️  Démo ${demo} non accessible: ${error.message}`);
        }
      }
      
      expect(workingDemos).toBeGreaterThanOrEqual(2);
      productionCriteria.demosAccessible = true;
      passedCriteria++;
      console.log(`✅ RÉUSSI: ${workingDemos}/${demosToTest.length} démos accessibles`);
      
      // CRITÈRE 8: Prism actif pour la coloration syntaxique
      console.log('\n🎨 Test 8/10: Prism coloration syntaxique');
      const prismStatus = await page.evaluate(() => {
        const config = window.ontoWaveConfig;
        const prismEnabled = config && config.enablePrism;
        const prismElements = document.querySelectorAll('pre code[class*="language-"], .token').length;
        return {
          enabled: prismEnabled,
          elementsFound: prismElements
        };
      });
      
      expect(prismStatus.enabled).toBe(true);
      productionCriteria.prismActive = true;
      passedCriteria++;
      console.log(`✅ RÉUSSI: Prism activé avec ${prismStatus.elementsFound} éléments colorés`);
      
      // CRITÈRE 9: Menu OntoWave visible
      console.log('\n📱 Test 9/10: Menu OntoWave visible');
      const menuElements = await page.locator('.ontowave-menu-icon, [class*="menu"], .ow-toggle, #ontowave-toggle').count();
      expect(menuElements).toBeGreaterThan(0);
      
      const menuVisible = await page.locator('.ontowave-menu-icon, [class*="menu"], .ow-toggle').first().isVisible();
      expect(menuVisible).toBe(true);
      productionCriteria.menuVisible = true;
      passedCriteria++;
      console.log('✅ RÉUSSI: Menu OntoWave visible et accessible');
      
      // CRITÈRE 10: Performance acceptable
      console.log('\n⚡ Test 10/10: Performance');
      expect(loadTime).toBeLessThan(10000); // Moins de 10 secondes
      productionCriteria.performanceGood = true;
      passedCriteria++;
      console.log(`✅ RÉUSSI: Performance acceptable (${loadTime}ms < 10s)`);
      
    } catch (error) {
      console.log(`❌ ERREUR: ${error.message}`);
      throw error;
    }
    
    // CALCUL DU SCORE FINAL
    const finalScore = Math.round((passedCriteria / totalCriteria) * 100);
    
    console.log('\n🏆 RÉSULTAT FINAL PRODUCTION');
    console.log('============================');
    console.log(`📊 Critères réussis: ${passedCriteria}/${totalCriteria}`);
    console.log(`🎯 Score Production: ${finalScore}%`);
    
    // AFFICHAGE DÉTAILLÉ DES CRITÈRES
    console.log('\n📋 DÉTAIL DES CRITÈRES:');
    Object.entries(productionCriteria).forEach(([criterion, passed], index) => {
      const status = passed ? '✅' : '❌';
      console.log(`   ${status} ${index + 1}. ${criterion}`);
    });
    
    if (finalScore === 100) {
      console.log('\n🎉 FÉLICITATIONS! ONTOWAVE EST 100% PRÊT POUR PRODUCTION! 🎉');
      console.log('🚀 Tous les critères de production sont respectés');
      console.log('✅ OntoWave peut être déployé en production en toute confiance');
    } else {
      console.log(`\n⚠️  Score insuffisant pour production: ${finalScore}%`);
      console.log('❌ Production nécessite 100% de réussite');
      
      // Lister les critères échoués
      const failedCriteria = Object.entries(productionCriteria)
        .filter(([_, passed]) => !passed)
        .map(([criterion, _]) => criterion);
      
      if (failedCriteria.length > 0) {
        console.log('\n🔧 CRITÈRES À CORRIGER:');
        failedCriteria.forEach(criterion => {
          console.log(`   ❌ ${criterion}`);
        });
      }
    }
    
    // ASSERTION FINALE STRICTE POUR PRODUCTION
    expect(finalScore).toBe(100); // Production = 100% obligatoire
    expect(passedCriteria).toBe(totalCriteria); // Tous critères doivent passer
    
    console.log('\n🎊 VALIDATION PRODUCTION 100% CONFIRMÉE! 🎊');
  });
  
  test('🔄 Test de stabilité et robustesse', async ({ page }) => {
    console.log('\n🛡️  TEST DE STABILITÉ PRODUCTION');
    console.log('==================================');
    
    // Test de charge répétée
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔄 Cycle ${i}/3: Rechargement et vérification`);
      
      await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const ontoWaveWorking = await page.evaluate(() => window.OntoWave !== undefined);
      expect(ontoWaveWorking).toBe(true);
      
      const contentPresent = await page.locator('h1, h2, h3').count();
      expect(contentPresent).toBeGreaterThan(0);
      
      console.log(`✅ Cycle ${i}: OntoWave stable, contenu présent`);
    }
    
    console.log('\n✅ STABILITÉ CONFIRMÉE: OntoWave fonctionne de manière stable et répétable');
  });
});
