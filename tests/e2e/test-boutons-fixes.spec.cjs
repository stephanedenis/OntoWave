const { test, expect } = require('@playwright/test');

test.describe('Test Nouveaux Boutons de Langue Fixés', () => {
  
  test('Vérification des boutons de langue fixés', async ({ page }) => {
    console.log('🧪 Test des nouveaux boutons de langue fixés');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(5000);
    
    // Prendre capture avant
    await page.screenshot({ path: 'test-results/boutons-fixes-avant.png', fullPage: true });
    
    // Vérifier la présence des boutons fixés
    const fixedButtons = await page.locator('.ontowave-fixed-lang-btn').count();
    console.log('🌐 Boutons fixés trouvés:', fixedButtons);
    
    if (fixedButtons > 0) {
      // Analyser les boutons
      const buttonTexts = await page.locator('.ontowave-fixed-lang-btn').allTextContents();
      console.log('📝 Textes des boutons fixés:', buttonTexts);
      
      // Vérifier la position (en haut à droite)
      const firstButton = page.locator('.ontowave-fixed-lang-btn').first();
      const box = await firstButton.boundingBox();
      console.log('📍 Position du premier bouton fixé:', box);
      
      // Vérifier que les boutons sont bien visibles
      await expect(firstButton).toBeVisible();
      
      // Tester le changement de langue avec les nouveaux boutons
      if (buttonTexts.some(text => text.includes('EN'))) {
        const enButton = page.locator('.ontowave-fixed-lang-btn').filter({ hasText: 'EN' });
        await enButton.click();
        await page.waitForTimeout(3000);
        
        // Vérifier que l'URL a changé
        const currentUrl = page.url();
        console.log('🔗 URL après clic EN (bouton fixé):', currentUrl);
        expect(currentUrl).toContain('#index.en.md');
        
        // Prendre capture après changement
        await page.screenshot({ path: 'test-results/apres-clic-en-fixe.png', fullPage: true });
        
        // Retour au français
        const frButton = page.locator('.ontowave-fixed-lang-btn').filter({ hasText: 'FR' });
        await frButton.click();
        await page.waitForTimeout(2000);
        
        const finalUrl = page.url();
        console.log('🔗 URL après retour FR:', finalUrl);
        expect(finalUrl).toContain('#index.fr.md');
        
        console.log('✅ Navigation multilingue avec boutons fixés réussie !');
      }
    } else {
      console.log('❌ Aucun bouton fixé trouvé');
      
      // Debug : afficher tous les éléments avec "lang" ou "bouton"
      const allElements = await page.locator('[class*="lang"], [class*="btn"], button').allTextContents();
      console.log('🔍 Éléments potentiels:', allElements.filter(text => text.includes('FR') || text.includes('EN')));
    }
  });

  test('Comparaison anciens vs nouveaux boutons', async ({ page }) => {
    console.log('🧪 Test comparatif des boutons de langue');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(5000);
    
    // Vérifier les anciens boutons (dans le menu)
    await page.click('.ontowave-menu-icon');
    await page.waitForTimeout(1000);
    
    const menuButtons = await page.locator('.ontowave-lang-btn').count();
    console.log('📊 Boutons dans le menu:', menuButtons);
    
    // Vérifier les nouveaux boutons (fixés)
    const fixedButtons = await page.locator('.ontowave-fixed-lang-btn').count();
    console.log('📊 Boutons fixés:', fixedButtons);
    
    // Capture comparative
    await page.screenshot({ path: 'test-results/comparaison-boutons.png', fullPage: true });
    
    // Fermer le menu
    await page.click('body');
    await page.waitForTimeout(500);
    
    // Capture avec seulement les boutons fixés visibles
    await page.screenshot({ path: 'test-results/boutons-fixes-seuls.png', fullPage: true });
    
    console.log('✅ Comparaison terminée');
  });

});
