const { test, expect } = require('@playwright/test');

test.describe('Test debug goHome', () => {
  test('Test avec logs debug pour goHome', async ({ page }) => {
    console.log('🔍 Test debug goHome...');
    
    // Écouter les logs de la console
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));
    
    // Aller à la page d'accueil
    await page.goto('http://localhost:8080');
    
    // Attendre que OntoWave soit initialisé
    await page.waitForFunction(() => window.OntoWave && window.OntoWave.instance);
    
    // Test initial de getCurrentLanguage et goHome
    const initialTest = await page.evaluate(() => {
      console.log('=== TEST INITIAL ===');
      console.log('getCurrentLanguage():', window.OntoWave.instance.getCurrentLanguage());
      console.log('config.sources:', window.OntoWave.instance.config.sources);
      console.log('config.defaultPage:', window.OntoWave.instance.config.defaultPage);
      
      // Appeler goHome
      console.log('Appel de goHome()...');
      window.OntoWave.instance.goHome();
      
      return {
        currentLang: window.OntoWave.instance.getCurrentLanguage(),
        sources: window.OntoWave.instance.config.sources,
        defaultPage: window.OntoWave.instance.config.defaultPage
      };
    });
    
    console.log('🔍 Résultat initial:', initialTest);
    
    // Attendre un peu
    await page.waitForTimeout(2000);
    
    // Test avec changement de langue
    const langTest = await page.evaluate(() => {
      console.log('=== TEST CHANGEMENT LANGUE ===');
      
      // Changer vers l'anglais
      console.log('Changement vers EN...');
      window.OntoWave.instance.switchLanguage('en');
      
      // Attendre un peu et tester goHome
      setTimeout(() => {
        console.log('getCurrentLanguage() après switch:', window.OntoWave.instance.getCurrentLanguage());
        console.log('Appel de goHome() en anglais...');
        window.OntoWave.instance.goHome();
      }, 1000);
      
      return 'OK';
    });
    
    // Attendre que les opérations se terminent
    await page.waitForTimeout(3000);
    
    console.log('✅ Test debug terminé');
  });
});
