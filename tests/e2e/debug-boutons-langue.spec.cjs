const { test, expect } = require('@playwright/test');

test.describe('Analyse Boutons de Langue OntoWave', () => {
  
  test('Analyse visuelle des boutons de langue', async ({ page }) => {
    console.log('🧪 Analyse des boutons de langue actuels');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(5000);
    
    // Prendre une capture d'écran de l'état initial
    await page.screenshot({ path: 'test-results/page-initiale.png', fullPage: true });
    
    // Chercher tous les éléments OntoWave
    const ontoWaveElements = await page.locator('[class*="ontowave"]').count();
    console.log('📊 Éléments OntoWave trouvés:', ontoWaveElements);
    
    // Chercher l'icône du menu
    const menuIcon = await page.locator('.ontowave-menu-icon, .ontowave-floating-menu, [id*="ontowave"]').count();
    console.log('🌊 Icônes menu trouvées:', menuIcon);
    
    if (menuIcon > 0) {
      // Cliquer sur le premier élément trouvé
      await page.locator('.ontowave-menu-icon, .ontowave-floating-menu, [id*="ontowave"]').first().click();
      await page.waitForTimeout(2000);
      
      // Capture avec menu ouvert
      await page.screenshot({ path: 'test-results/menu-ouvert.png', fullPage: true });
    }
    
    // Analyser les boutons de langue existants
    const allButtons = await page.locator('button, span, a').allTextContents();
    const langRelated = allButtons.filter(text => text.includes('FR') || text.includes('EN') || text.includes('🌐'));
    console.log('🌐 Éléments liés aux langues trouvés:', langRelated);
    
    // Afficher le contenu de la page pour debug
    const bodyContent = await page.textContent('body');
    console.log('📄 Contenu de la page (premiers 500 chars):', bodyContent.substring(0, 500));
  });

});
