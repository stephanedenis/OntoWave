const { test, expect } = require('@playwright/test');

test.describe('Debug simple switchLanguage', () => {
  test('Test manuel du changement de langue', async ({ page }) => {
    console.log('🔍 Test manuel...');
    
    // Intercepter les logs
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });
    
    await page.goto('http://localhost:8080/');
    await page.waitForSelector('.ontowave-container', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Vérifier directement dans la console du navigateur
    const result = await page.evaluate(() => {
      console.log('=== DEBUG SWITCHLANGUAGE ===');
      console.log('window.OntoWaveConfig:', window.OntoWaveConfig);
      console.log('OntoWave.instance.config:', window.OntoWave?.instance?.config);
      console.log('OntoWave.instance.config.sources:', window.OntoWave?.instance?.config?.sources);
      
      // Test manuel du switchLanguage
      if (window.OntoWave?.instance) {
        window.OntoWave.instance.switchLanguage('en');
      }
      
      return {
        hasOntoWave: !!window.OntoWave,
        hasInstance: !!window.OntoWave?.instance,
        configSources: window.OntoWave?.instance?.config?.sources,
        windowConfigSources: window.OntoWaveConfig?.sources
      };
    });
    
    console.log('🔍 Résultat debug:', result);
    
    await page.waitForTimeout(3000);
  });
});
