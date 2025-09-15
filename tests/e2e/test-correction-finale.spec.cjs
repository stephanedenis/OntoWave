const { test, expect } = require('@playwright/test');

test.describe('Test Final de Correction', () => {
  test('Vérifier que tout fonctionne maintenant', async ({ page }) => {
    console.log('🎯 TEST FINAL - Vérification complète après diagnostic');
    
    await page.goto('http://localhost:8080/');
    
    // Attendre que tout soit chargé
    await page.waitForTimeout(5000);
    
    // 1. Vérifier le titre
    const title = await page.title();
    console.log(`📄 Titre: "${title}"`);
    
    // 2. Vérifier la présence de contenu substantiel
    const bodyText = await page.textContent('body');
    console.log(`📝 Taille du contenu body: ${bodyText.length} caractères`);
    console.log(`📝 Extrait: "${bodyText.substring(0, 100)}..."`);
    
    // 3. Compter les éléments principaux
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();
    const pCount = await page.locator('p').count();
    console.log(`📊 Éléments: H1=${h1Count}, H2=${h2Count}, H3=${h3Count}, P=${pCount}`);
    
    // 4. Vérifier les boutons de langue
    const langButtons = await page.locator('button[data-lang]').count();
    console.log(`🌐 Boutons de langue: ${langButtons}`);
    
    // 5. Vérifier Prism
    const prismElements = await page.locator('.language-html, .language-json, .token').count();
    console.log(`🎨 Éléments Prism: ${prismElements}`);
    
    // 6. Vérifier l'icône OntoWave
    const ontoWaveIcon = await page.locator('[title*="OntoWave"], [class*="ontowave"]').count();
    console.log(`🌊 Icônes OntoWave: ${ontoWaveIcon}`);
    
    // 7. Vérifier Mermaid/PlantUML
    const svgElements = await page.locator('svg').count();
    console.log(`📊 Diagrammes SVG: ${svgElements}`);
    
    // 8. Test des boutons de langue
    console.log('🧪 Test changement de langue...');
    
    const initialText = await page.textContent('body');
    const hasFrench = initialText.includes('OntoWave est un générateur');
    console.log(`🇫🇷 Contenu français détecté: ${hasFrench}`);
    
    // Cliquer sur le bouton anglais s'il existe
    const enButton = page.locator('button[data-lang="en"]');
    if (await enButton.count() > 0) {
      await enButton.click();
      await page.waitForTimeout(2000);
      
      const newText = await page.textContent('body');
      const hasEnglish = newText.includes('OntoWave is a lightweight');
      console.log(`🇬🇧 Contenu anglais après clic: ${hasEnglish}`);
    }
    
    // 9. Test du menu OntoWave
    console.log('🧪 Test menu OntoWave...');
    const ontoWaveMenuButton = page.locator('[title*="OntoWave"], .ontowave-toggle').first();
    if (await ontoWaveMenuButton.count() > 0) {
      await ontoWaveMenuButton.click();
      await page.waitForTimeout(1000);
      
      const menuVisible = await page.locator('.ontowave-menu, [class*="menu"]').isVisible();
      console.log(`📋 Menu OntoWave visible: ${menuVisible}`);
    }
    
    // 10. Score final
    let score = 0;
    if (title.includes('OntoWave')) score += 10;
    if (bodyText.length > 1000) score += 15;
    if (h1Count > 0) score += 10;
    if (h2Count > 0) score += 10;
    if (langButtons >= 2) score += 20;
    if (prismElements > 0) score += 15;
    if (ontoWaveIcon > 0) score += 10;
    if (svgElements > 0) score += 10;
    
    console.log(`🎯 SCORE FINAL: ${score}/100`);
    
    // Tests d'assertion
    expect(title).toContain('OntoWave');
    expect(bodyText.length).toBeGreaterThan(1000);
    expect(h1Count).toBeGreaterThan(0);
    expect(langButtons).toBeGreaterThanOrEqual(2);
    expect(ontoWaveIcon).toBeGreaterThan(0);
    
    console.log('✅ TOUS LES TESTS PASSENT - OntoWave fonctionne correctement !');
  });
});
