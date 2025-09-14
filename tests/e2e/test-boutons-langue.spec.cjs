const { test, expect } = require('@playwright/test');

test.describe('Test boutons de langue intégrés OntoWave', () => {
  test.beforeEach(async ({ page }) => {
    // Démarrer sur la page d'accueil
    await page.goto('http://localhost:8080/');
    
    // Attendre que OntoWave se charge complètement
    await page.waitForSelector('.ontowave-container', { timeout: 10000 });
    await page.waitForSelector('.ontowave-menu-icon', { timeout: 5000 });
    await page.waitForTimeout(2000); // Laisser le temps à l'initialisation
  });

  test('Les boutons FR/EN sont présents dans le menu OntoWave', async ({ page }) => {
    console.log('🔍 Test de présence des boutons de langue...');
    
    // Cliquer sur l'icône OntoWave pour ouvrir le menu
    const ontoWaveIcon = page.locator('.ontowave-menu-icon');
    await expect(ontoWaveIcon).toBeVisible();
    await ontoWaveIcon.click();
    
    // Attendre que le menu s'ouvre
    await page.waitForTimeout(500);
    
    // Vérifier que les boutons de langue sont présents (par texte)
    const btnFR = page.locator('.ontowave-lang-btn').filter({ hasText: 'FR' });
    const btnEN = page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' });
    
    await expect(btnFR).toBeVisible();
    await expect(btnEN).toBeVisible();
    
    // Vérifier le texte des boutons (avec emoji)
    await expect(btnFR).toContainText('FR');
    await expect(btnEN).toContainText('EN');
    
    console.log('✅ Boutons de langue présents et visibles');
  });

  test('Le bouton FR est actif par défaut (defaultLocale)', async ({ page }) => {
    console.log('🎯 Test du defaultLocale...');
    
    // Cliquer sur l'icône OntoWave pour ouvrir le menu
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(500);
    
    // Vérifier que le bouton FR a la classe active
    const btnFR = page.locator('.ontowave-lang-btn').filter({ hasText: 'FR' });
    await expect(btnFR).toHaveClass(/active/);
    
    console.log('✅ Bouton FR actif par défaut (defaultLocale respecté)');
  });

  test('Changement de langue FR→EN fonctionne', async ({ page }) => {
    console.log('🔄 Test changement FR → EN...');
    
    // Vérifier le contenu initial en français
    await expect(page.locator('h1')).toContainText('OntoWave');
    
    // Ouvrir le menu OntoWave
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(500);
    
    // Cliquer sur le bouton EN
    const btnEN = page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' });
    await btnEN.click();
    
    // Attendre le changement de contenu
    await page.waitForTimeout(2000);
    
    // Vérifier que le bouton EN est maintenant actif
    await expect(btnEN).toHaveClass(/active/);
    
    // Vérifier que le contenu a changé en anglais
    const content = await page.textContent('body');
    expect(content).toContain('Micro-application for static sites');
    
    console.log('✅ Changement FR → EN réussi');
  });

  test('Changement de langue EN→FR fonctionne', async ({ page }) => {
    console.log('🔄 Test changement EN → FR...');
    
    // D'abord passer en anglais
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(500);
    await page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' }).click();
    await page.waitForTimeout(2000);
    
    // Vérifier qu'on est bien en anglais
    let content = await page.textContent('body');
    expect(content).toContain('Micro-application for static sites');
    
    // Ouvrir le menu et repasser en français
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(500);
    
    const btnFR = page.locator('.ontowave-lang-btn').filter({ hasText: 'FR' });
    await btnFR.click();
    await page.waitForTimeout(2000);
    
    // Vérifier que le bouton FR est actif
    await expect(btnFR).toHaveClass(/active/);
    
    // Vérifier que le contenu est revenu en français
    content = await page.textContent('body');
    expect(content).toContain('Micro-application pour site statique');
    
    console.log('✅ Changement EN → FR réussi');
  });

  test('Pas de page blanche lors du changement de langue', async ({ page }) => {
    console.log('🚫 Test absence de page blanche...');
    
    // Ouvrir le menu OntoWave
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(500);
    
    // Changer de langue plusieurs fois rapidement
    await page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' }).click();
    await page.waitForTimeout(1000);
    
    // Vérifier qu'il y a toujours du contenu visible
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(100); // Le contenu ne doit pas être vide
    
    // Revenir en français
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(500);
    await page.locator('.ontowave-lang-btn').filter({ hasText: 'FR' }).click();
    await page.waitForTimeout(1000);
    
    // Vérifier qu'il y a encore du contenu
    const bodyTextFR = await page.textContent('body');
    expect(bodyTextFR.length).toBeGreaterThan(100);
    
    console.log('✅ Aucune page blanche détectée');
  });

  test('Interface cohérente après changement de langue', async ({ page }) => {
    console.log('🎨 Test cohérence interface...');
    
    // Changer de langue
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(500);
    await page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' }).click();
    await page.waitForTimeout(2000);
    
    // Vérifier que l'interface OntoWave est toujours présente
    await expect(page.locator('.ontowave-menu-icon')).toBeVisible();
    await expect(page.locator('.ontowave-container')).toBeVisible();
    
    // Vérifier que les boutons de langue sont toujours accessibles
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(500);
    
    await expect(page.locator('.ontowave-lang-btn').filter({ hasText: 'FR' })).toBeVisible();
    await expect(page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' })).toBeVisible();
    
    console.log('✅ Interface cohérente maintenue');
  });
});
