const { test, expect } = require('@playwright/test');

test.describe('Debug OntoWave Init', () => {
  test('Analyser l\'initialisation OntoWave', async ({ page }) => {
    console.log('🔍 DEBUG INIT - Analyser l\'initialisation OntoWave');
    
    // Capturer les erreurs console
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.log(`❌ Erreur page: ${error.message}`);
    });
    
    await page.goto('http://localhost:8080/');
    
    // Attendre et vérifier étape par étape
    console.log('🔄 Étape 1: Vérifier le chargement du script');
    await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 10000 });
    console.log('✅ OntoWave objet global chargé');
    
    // Vérifier l'état d'OntoWave
    const ontoWaveState = await page.evaluate(() => {
      const ow = window.OntoWave;
      return {
        exists: typeof ow !== 'undefined',
        config: ow ? ow.config : null,
        currentLanguage: ow ? ow.currentLanguage : null,
        isInitialized: ow ? ow.isInitialized : null,
        methods: ow ? Object.keys(ow).filter(key => typeof ow[key] === 'function') : [],
        properties: ow ? Object.keys(ow).filter(key => typeof ow[key] !== 'function') : []
      };
    });
    
    console.log('🌊 État OntoWave:', JSON.stringify(ontoWaveState, null, 2));
    
    // Attendre un peu plus pour l'initialisation
    await page.waitForTimeout(3000);
    
    // Vérifier l'état après attente
    const ontoWaveStateAfter = await page.evaluate(() => {
      const ow = window.OntoWave;
      return {
        config: ow ? ow.config : null,
        currentLanguage: ow ? ow.currentLanguage : null,
        isInitialized: ow ? ow.isInitialized : null
      };
    });
    
    console.log('🌊 État OntoWave après 3s:', JSON.stringify(ontoWaveStateAfter, null, 2));
    
    // Vérifier la présence des éléments de l'interface
    const interfaceElements = await page.evaluate(() => {
      return {
        ontoWaveIcon: document.querySelectorAll('.ontowave-icon, [class*="ontowave-"], [title*="OntoWave"]').length,
        langButtons: document.querySelectorAll('button[data-lang], .lang-button, [class*="lang"]').length,
        content: document.querySelector('body').innerHTML.length,
        mainElements: document.querySelectorAll('h1, h2, h3, p').length
      };
    });
    
    console.log('🎯 Éléments d\'interface:', JSON.stringify(interfaceElements, null, 2));
    
    // Essayer de forcer l'initialisation si nécessaire
    if (!ontoWaveStateAfter.isInitialized) {
      console.log('🔄 Tentative de forcer l\'initialisation...');
      await page.evaluate(() => {
        if (window.OntoWave && typeof window.OntoWave.init === 'function') {
          window.OntoWave.init();
        }
      });
      
      await page.waitForTimeout(2000);
      
      const finalState = await page.evaluate(() => {
        const ow = window.OntoWave;
        return {
          config: ow ? ow.config : null,
          currentLanguage: ow ? ow.currentLanguage : null,
          isInitialized: ow ? ow.isInitialized : null
        };
      });
      
      console.log('🌊 État final après init forcée:', JSON.stringify(finalState, null, 2));
    }
    
    // Afficher les messages console
    console.log('📝 Messages console:');
    consoleMessages.forEach(msg => console.log(`  ${msg}`));
  });
});
