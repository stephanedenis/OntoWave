const { test, expect } = require('@playwright/test');

test.describe('Diagnostic Prism et Multilingue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(2000); // Attendre le chargement complet
  });

  test('Boutons de langue présents et fonctionnels', async ({ page }) => {
    // Vérifier que les boutons de langue sont présents
    const frButton = page.locator('#btn-fr');
    const enButton = page.locator('#btn-en');
    
    await expect(frButton).toBeVisible();
    await expect(enButton).toBeVisible();
    
    console.log('✅ Boutons de langue détectés');
    
    // Tester la bascule FR→EN
    await enButton.click();
    await page.waitForTimeout(500);
    
    // Vérifier que le contenu anglais est visible
    const enContent = page.locator('#lang-en');
    const frContent = page.locator('#lang-fr');
    
    await expect(enContent).toBeVisible();
    await expect(frContent).toBeHidden();
    
    console.log('✅ Bascule FR→EN fonctionne');
    
    // Tester la bascule EN→FR
    await frButton.click();
    await page.waitForTimeout(500);
    
    await expect(frContent).toBeVisible();
    await expect(enContent).toBeHidden();
    
    console.log('✅ Bascule EN→FR fonctionne');
  });

  test('Coloration syntaxique Prism active', async ({ page }) => {
    // Attendre que Prism soit chargé
    await page.waitForFunction(() => window.Prism !== undefined);
    
    // Vérifier qu'il y a des blocs de code HTML
    const codeBlocks = page.locator('pre code.language-html');
    const count = await codeBlocks.count();
    
    expect(count).toBeGreaterThan(0);
    console.log(`✅ ${count} blocs HTML détectés`);
    
    // Vérifier que la coloration est appliquée (présence de spans)
    const firstBlock = codeBlocks.first();
    const innerHTML = await firstBlock.innerHTML();
    
    expect(innerHTML).toContain('<span');
    console.log('✅ Coloration syntaxique Prism active');
  });

  test('Contenu multilingue complet', async ({ page }) => {
    // Vérifier que les deux versions linguistiques existent
    const frContent = page.locator('#lang-fr');
    const enContent = page.locator('#lang-en');
    
    await expect(frContent).toBeAttached();
    await expect(enContent).toBeAttached();
    
    // Vérifier le contenu français
    await expect(frContent).toContainText('Micro-application pour sites statiques');
    
    // Passer en anglais et vérifier le contenu
    await page.click('#btn-en');
    await page.waitForTimeout(500);
    
    await expect(enContent).toContainText('Micro-application for static sites');
    
    console.log('✅ Contenu multilingue complet et cohérent');
  });

  test('Structure OntoWave fonctionnelle', async ({ page }) => {
    // Vérifier que OntoWave a chargé correctement
    await page.waitForFunction(() => {
      return document.querySelector('#ontowave-floating-menu') !== null;
    });
    
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible();
    
    console.log('✅ Menu flottant OntoWave présent');
    
    // Vérifier que le contenu markdown a été rendu
    const h1 = page.locator('h1');
    await expect(h1).toContainText('OntoWave');
    
    console.log('✅ Rendu markdown fonctionnel');
  });
});
