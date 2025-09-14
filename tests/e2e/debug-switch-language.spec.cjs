const { test, expect } = require('@playwright/test');

test.describe('Debug switchLanguage', () => {
  test('Debugger le changement de langue', async ({ page }) => {
    console.log('🔍 Debug switchLanguage...');
    
    // Intercepter les logs de console
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });
    
    await page.goto('http://localhost:8080/');
    await page.waitForSelector('.ontowave-container', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Vérifier la configuration
    const config = await page.evaluate(() => {
      return {
        ontoWaveConfig: window.OntoWaveConfig,
        instanceConfig: window.OntoWave?.instance?.config
      };
    });
    console.log('⚙️ Configurations:', JSON.stringify(config, null, 2));
    
    // Ouvrir le menu et cliquer sur EN
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(500);
    
    console.log('🔄 Clicking EN button...');
    await page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' }).click();
    
    // Attendre et voir ce qui se passe
    await page.waitForTimeout(3000);
    
    // Vérifier l'URL qui a été demandée
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('.md')) {
        requests.push(request.url());
        console.log('📄 Request URL:', request.url());
      }
    });
    
    // Faire une capture d'écran pour voir l'état
    await page.screenshot({ path: 'debug-switch-language.png', fullPage: true });
    console.log('📸 Capture sauvée: debug-switch-language.png');
  });
});
