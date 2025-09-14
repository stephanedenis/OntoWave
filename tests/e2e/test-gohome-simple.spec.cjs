const { test, expect } = require('@playwright/test');

test.describe('Test méthode goHome', () => {
  test('Vérification que goHome() fonctionne', async ({ page }) => {
    console.log('🔍 Test de la méthode goHome...');
    
    // Aller à la page d'accueil
    await page.goto('http://localhost:8080');
    
    // Attendre que OntoWave soit initialisé
    await page.waitForFunction(() => window.OntoWave && window.OntoWave.instance);
    
    // Vérifier que la méthode goHome existe
    const hasGoHome = await page.evaluate(() => {
      return typeof window.OntoWave.instance.goHome === 'function';
    });
    
    expect(hasGoHome).toBe(true);
    console.log('✅ Méthode goHome() existe');
    
    // Tester l'appel de goHome
    await page.evaluate(() => {
      console.log('🔍 Appel de goHome()...');
      console.log('🔍 getCurrentLanguage():', window.OntoWave.instance.getCurrentLanguage());
      console.log('🔍 config.sources:', window.OntoWave.instance.config.sources);
      window.OntoWave.instance.goHome();
    });
    
    console.log('✅ goHome() appelée sans erreur');
  });
});
