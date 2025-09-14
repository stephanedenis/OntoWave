const { test, expect } = require('@playwright/test');

test.describe('Debug OntoWave Loading', () => {
  test('Vérifier le chargement d\'OntoWave et debug', async ({ page }) => {
    console.log('🔍 Debug du chargement OntoWave...');
    
    // Intercepter les logs de la console
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });
    
    // Intercepter les erreurs
    page.on('pageerror', err => {
      console.log(`[ERROR] ${err.message}`);
    });
    
    // Aller sur la page
    await page.goto('http://localhost:8080/');
    
    // Attendre longtemps pour laisser OntoWave se charger
    console.log('⏳ Attente du chargement OntoWave...');
    await page.waitForTimeout(5000);
    
    // Vérifier ce qui est présent dans la page
    const html = await page.content();
    console.log('📄 Longueur du HTML final:', html.length);
    
    // Chercher des éléments OntoWave
    const ontoWaveContainer = page.locator('.ontowave-container');
    const ontoWaveToggle = page.locator('.ontowave-toggle');
    const langButtons = page.locator('.ontowave-lang-btn');
    
    console.log('🔍 Vérification des éléments OntoWave...');
    
    try {
      await expect(ontoWaveContainer).toBeVisible({ timeout: 10000 });
      console.log('✅ .ontowave-container trouvé');
    } catch (e) {
      console.log('❌ .ontowave-container non trouvé');
    }
    
    try {
      await expect(ontoWaveToggle).toBeVisible({ timeout: 5000 });
      console.log('✅ .ontowave-toggle trouvé');
    } catch (e) {
      console.log('❌ .ontowave-toggle non trouvé');
    }
    
    const langButtonsCount = await langButtons.count();
    console.log(`🔢 Nombre de boutons de langue trouvés: ${langButtonsCount}`);
    
    // Lister tous les éléments avec "ontowave" dans la classe
    const allOntoWaveElements = await page.$$eval('[class*="ontowave"]', elements => {
      return elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        visible: el.offsetParent !== null
      }));
    });
    
    console.log('🎯 Éléments OntoWave trouvés:', allOntoWaveElements);
    
    // Vérifier si OntoWave global est disponible
    const ontoWaveGlobal = await page.evaluate(() => {
      return typeof window.OntoWave !== 'undefined';
    });
    console.log('🌐 OntoWave global disponible:', ontoWaveGlobal);
    
    // Vérifier la configuration
    const config = await page.evaluate(() => {
      return window.OntoWaveConfig;
    });
    console.log('⚙️ Configuration OntoWave:', config);
    
    // Faire une capture d'écran pour debug
    await page.screenshot({ path: 'debug-ontowave-load.png', fullPage: true });
    console.log('📸 Capture d\'écran sauvée: debug-ontowave-load.png');
  });
});
