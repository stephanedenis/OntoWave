const { test, expect } = require('@playwright/test');

test.describe('Diagnostic OntoWave Simple', () => {
  test('Vérifier les éléments de base', async ({ page }) => {
    console.log('🔍 DIAGNOSTIC ONTOWAVE - Test simple');
    
    await page.goto('http://localhost:8080/');
    
    // 1. Vérifier que la page se charge
    const title = await page.title();
    console.log(`📄 Titre de la page: "${title}"`);
    
    // 2. Vérifier le contenu principal
    const mainContent = await page.textContent('body');
    console.log(`📝 Taille du contenu: ${mainContent.length} caractères`);
    console.log(`📝 Premiers 200 caractères: "${mainContent.substring(0, 200)}"`);
    
    // 3. Vérifier la présence d'OntoWave
    const ontoWaveScript = await page.locator('script[src*="ontowave"]').count();
    console.log(`🌊 Scripts OntoWave détectés: ${ontoWaveScript}`);
    
    // 4. Vérifier les boutons de langue
    const langButtons = await page.locator('button[data-lang]').count();
    console.log(`🌐 Boutons de langue détectés: ${langButtons}`);
    
    // 5. Vérifier l'icône OntoWave
    const ontoWaveIcon = await page.locator('.ontowave-icon, [title*="OntoWave"], [class*="ontowave"]').count();
    console.log(`🌊 Icônes OntoWave détectées: ${ontoWaveIcon}`);
    
    // 6. Vérifier les éléments H1-H4
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();
    const h4Count = await page.locator('h4').count();
    console.log(`📊 Titres détectés: H1=${h1Count}, H2=${h2Count}, H3=${h3Count}, H4=${h4Count}`);
    
    // 7. Vérifier les éléments Prism
    const prismElements = await page.locator('.language-html, .language-js, .language-javascript, pre code').count();
    console.log(`🎨 Éléments Prism détectés: ${prismElements}`);
    
    // 8. Attendre qu'OntoWave se charge et vérifier sa présence
    await page.waitForTimeout(3000);
    
    const ontoWavePresent = await page.evaluate(() => {
      return typeof window.OntoWave !== 'undefined';
    });
    console.log(`🌊 OntoWave global présent: ${ontoWavePresent}`);
    
    // 9. Vérifier les erreurs console
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    console.log(`❌ Erreurs console: ${consoleMessages.length}`);
    if (consoleMessages.length > 0) {
      console.log(`❌ Erreurs: ${consoleMessages.join(', ')}`);
    }
    
    // 10. Score final simple
    let score = 0;
    if (title.includes('OntoWave')) score += 10;
    if (mainContent.length > 100) score += 10;
    if (ontoWaveScript > 0) score += 20;
    if (langButtons >= 2) score += 20;
    if (h1Count > 0) score += 10;
    if (prismElements > 0) score += 20;
    if (ontoWavePresent) score += 10;
    
    console.log(`🎯 SCORE FINAL: ${score}/100`);
    
    // Tests basiques
    expect(title).toContain('OntoWave');
    expect(mainContent.length).toBeGreaterThan(50);
  });
});
