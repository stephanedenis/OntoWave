const { test, expect } = require('@playwright/test');

test.describe('Validation finale Prism + Multilingue', () => {
  test('Page d\'accueil complètement fonctionnelle', async ({ page }) => {
    // Capturer les erreurs pour diagnostic
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ ERREUR CONSOLE:', msg.text());
      }
    });
    
    await page.goto('http://localhost:8080/');
    
    // Attendre le chargement complet d'OntoWave
    await page.waitForTimeout(3000);
    
    // Test 1: Vérifier que le contenu markdown est affiché
    await expect(page.locator('h1')).toContainText('OntoWave');
    console.log('✅ Titre principal affiché');
    
    // Test 2: Vérifier que les boutons de langue sont présents et fonctionnent
    const frButton = page.locator('#btn-fr');
    const enButton = page.locator('#btn-en');
    
    await expect(frButton).toBeVisible();
    await expect(enButton).toBeVisible();
    console.log('✅ Boutons de langue présents');
    
    // Test 3: Vérifier le contenu français par défaut
    const frContent = page.locator('#lang-fr');
    await expect(frContent).toContainText('Micro-application pour sites statiques');
    console.log('✅ Contenu français affiché par défaut');
    
    // Test 4: Tester la bascule vers l'anglais
    await enButton.click();
    await page.waitForTimeout(500);
    
    const enContent = page.locator('#lang-en');
    await expect(enContent).toContainText('Micro-application for static sites');
    console.log('✅ Bascule vers l\'anglais fonctionnelle');
    
    // Test 5: Retour au français
    await frButton.click();
    await page.waitForTimeout(500);
    await expect(frContent).toContainText('Micro-application pour sites statiques');
    console.log('✅ Retour au français fonctionnel');
    
    // Test 6: Vérifier que Prism colore le code HTML
    const codeBlocks = page.locator('pre code.language-html');
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);
    console.log(`✅ ${count} blocs de code HTML détectés`);
    
    // Vérifier la coloration syntaxique
    const firstBlock = codeBlocks.first();
    const innerHTML = await firstBlock.innerHTML();
    expect(innerHTML).toContain('<span');
    console.log('✅ Coloration syntaxique Prism active');
    
    // Test 7: Vérifier que le menu OntoWave est présent
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible();
    console.log('✅ Menu flottant OntoWave présent');
    
    console.log('🎉 TOUS LES TESTS PASSÉS - Page d\'accueil entièrement fonctionnelle !');
  });
});
