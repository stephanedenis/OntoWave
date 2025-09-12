const { test, expect, chromium } = require('@playwright/test');

test.describe('Validation OntoWave Restauré', () => {
  let browser, page;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    
    // Écouter les erreurs de console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Erreur console:', msg.text());
      } else if (msg.text().includes('🌐') || msg.text().includes('🎨') || msg.text().includes('✅')) {
        console.log('ℹ️', msg.text());
      }
    });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('OntoWave avec fonctionnalités complètes', async () => {
    await page.goto('http://localhost:8080/');
    
    // Attendre que OntoWave charge le contenu
    await page.waitForTimeout(3000);
    
    console.log('🔍 Vérification structure multilingue...');
    
    // Vérifier la présence des sections de langue
    const frSection = await page.locator('#lang-fr').count();
    const enSection = await page.locator('#lang-en').count();
    
    console.log(`📋 Section FR: ${frSection}, Section EN: ${enSection}`);
    expect(frSection).toBe(1);
    expect(enSection).toBe(1);
    
    // Vérifier la présence des boutons de langue
    await page.waitForSelector('.lang-toggle', { timeout: 5000 });
    const btnFr = await page.locator('#btn-fr').count();
    const btnEn = await page.locator('#btn-en').count();
    
    console.log(`🔘 Bouton FR: ${btnFr}, Bouton EN: ${btnEn}`);
    expect(btnFr).toBe(1);
    expect(btnEn).toBe(1);
    
    // Vérifier que Prism est chargé
    const prismLoaded = await page.evaluate(() => window.Prism !== undefined);
    console.log('🎨 Prism chargé:', prismLoaded);
    expect(prismLoaded).toBe(true);
    
    // Vérifier les blocs de code colorés
    await page.waitForTimeout(2000);
    const codeBlocks = await page.locator('pre[class*="language-"]').count();
    console.log('📝 Blocs de code colorés:', codeBlocks);
    expect(codeBlocks).toBeGreaterThan(0);
    
    // Test changement de langue
    console.log('🔄 Test changement de langue...');
    await page.click('#btn-en');
    await page.waitForTimeout(1000);
    
    // Vérifier que la section anglaise est visible
    const enVisible = await page.locator('#lang-en.visible').count();
    console.log('🇬🇧 Section EN visible:', enVisible);
    expect(enVisible).toBe(1);
    
    // Vérifier que la section française est cachée
    const frHidden = await page.locator('#lang-fr.hidden').count();
    console.log('🇫🇷 Section FR cachée:', frHidden);
    expect(frHidden).toBe(1);
    
    console.log('✅ Tous les tests passés - OntoWave restauré avec succès !');
  });
});
