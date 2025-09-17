const { test, expect } = require('@playwright/test');

/**
 * Test rapide de validation OntoWave
 */

test.describe('✅ Test Rapide OntoWave', () => {
  
  test('Vérification rapide fonctionnement', async ({ page }) => {
    console.log('🚀 TEST RAPIDE ONTOWAVE');
    console.log('======================');
    
    // Aller à la page d'accueil
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Vérifier le titre
    const title = await page.title();
    console.log(`📄 Titre de page: "${title}"`);
    expect(title.length).toBeGreaterThan(0);
    
    // Vérifier qu'OntoWave est chargé
    const ontoWaveLoaded = await page.evaluate(() => window.OntoWave !== undefined);
    console.log(`⚙️ OntoWave chargé: ${ontoWaveLoaded}`);
    expect(ontoWaveLoaded).toBe(true);
    
    // Vérifier la configuration
    const config = await page.evaluate(() => window.ontoWaveConfig);
    console.log(`🔧 Configuration locales: ${config?.locales?.join(', ') || 'Non trouvées'}`);
    expect(config).toBeDefined();
    expect(config.locales).toContain('fr');
    
    // Vérifier le contenu rendu
    const headings = await page.locator('h1, h2, h3').count();
    console.log(`📝 Titres rendus: ${headings}`);
    expect(headings).toBeGreaterThan(0);
    
    // Vérifier le menu OntoWave
    const menuIcon = page.locator('.ontowave-menu-icon, [class*="menu"], .ow-toggle');
    const menuVisible = await menuIcon.count();
    console.log(`📱 Menu OntoWave présent: ${menuVisible > 0}`);
    
    if (menuVisible > 0) {
      await menuIcon.first().click();
      await page.waitForTimeout(1000);
      
      const menuItems = await page.locator('.ontowave-menu a, .ontowave-menu button, .ow-menu a, .ow-menu button').count();
      console.log(`📋 Éléments de menu: ${menuItems}`);
      expect(menuItems).toBeGreaterThan(0);
    }
    
    // Test des liens démos
    const demoLinks = await page.locator('a[href*="demo/"]').count();
    console.log(`🎮 Liens vers démos: ${demoLinks}`);
    expect(demoLinks).toBeGreaterThan(0);
    
    // Score final
    const score = 100; // Toutes les vérifications passées
    console.log('');
    console.log('🎯 RÉSULTAT TEST RAPIDE');
    console.log('=======================');
    console.log(`🏆 Score: ${score}%`);
    console.log('✅ OntoWave fonctionne correctement!');
    console.log('✅ Tous les composants de base validés');
    console.log('✅ Prêt pour tests approfondis');
    console.log('=======================');
  });
});
