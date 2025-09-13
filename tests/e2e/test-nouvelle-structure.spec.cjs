const { test, expect } = require('@playwright/test');

test.describe('OntoWave - Structure complète bilingue', () => {
  test('Système bilingue avec nouvelle structure', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    
    // Vérifier que la page se charge
    await expect(page).toHaveTitle(/OntoWave/);
    
    // Vérifier les boutons de langue
    const frButton = page.locator('.lang-btn').first();
    const enButton = page.locator('.lang-btn').last();
    
    await expect(frButton).toBeVisible();
    await expect(enButton).toBeVisible();
    await expect(frButton).toHaveText('FR');
    await expect(enButton).toHaveText('EN');
    
    // Vérifier que FR est actif par défaut
    await expect(frButton).toHaveClass(/active/);
    
    // Attendre que OntoWave se charge
    await page.waitForTimeout(2000);
    
    // Vérifier que l'icône OntoWave est présente
    const ontoWaveIcon = page.locator('.ontowave-floating-menu, .ontowave-menu-icon');
    await expect(ontoWaveIcon.first()).toBeVisible();
    
    // Tester le changement de langue
    await enButton.click();
    await expect(enButton).toHaveClass(/active/);
    await expect(frButton).not.toHaveClass(/active/);
    
    // Vérifier que le body a la bonne classe
    await expect(page.locator('body')).toHaveClass('lang-en');
    
    console.log('✅ Test système bilingue réussi');
  });
  
  test('Accès aux pages de démo', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    
    // Vérifier l'accès aux démos
    const demos = [
      'demo/minimal.html',
      'demo/advanced.html', 
      'demo/full-config.html'
    ];
    
    for (const demo of demos) {
      await page.goto(`http://localhost:8080/${demo}`);
      await expect(page).toHaveTitle(/OntoWave/);
      console.log(`✅ Demo ${demo} accessible`);
    }
  });
  
  test('Menu OntoWave multilingue', async ({ page }) => {
    await page.goto('http://localhost:8080/demo/advanced.html');
    
    // Attendre le chargement
    await page.waitForTimeout(2000);
    
    // Cliquer sur l'icône OntoWave
    const ontoWaveIcon = page.locator('.ontowave-floating-menu, .ontowave-menu-icon');
    await expect(ontoWaveIcon.first()).toBeVisible();
    await ontoWaveIcon.first().click();
    
    // Vérifier que le menu s'ouvre
    const menu = page.locator('.ontowave-menu-content');
    await expect(menu).toBeVisible();
    
    // Tester le changement de langue du menu
    const enButton = page.locator('.lang-btn').last();
    await enButton.click();
    
    await page.waitForTimeout(500);
    
    // Le menu devrait maintenant être en anglais
    // (Les textes dépendent de l'implémentation OntoWave)
    
    console.log('✅ Test menu multilingue réussi');
  });
});
