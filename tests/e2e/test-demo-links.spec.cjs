const { test, expect } = require('@playwright/test');

test.describe('Liens vers les démos depuis la page d\'accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/');
    // Attendre que OntoWave soit chargé
    await page.waitForTimeout(2000);
  });

  test('Tous les liens de démo en anglais fonctionnent', async ({ page }) => {
    // Basculer vers l'anglais si nécessaire
    const langButton = page.locator('text=EN');
    if (await langButton.isVisible()) {
      await langButton.click();
      await page.waitForTimeout(500);
    }

    // Vérifier le lien Minimal Demo
    const minimalLink = page.locator('a[href="demo/minimal-demo.html"]').first();
    await expect(minimalLink).toBeVisible();
    
    // Tester la navigation vers minimal-demo.html
    const minimalResponse = await page.request.get('http://localhost:8080/demo/minimal-demo.html');
    expect(minimalResponse.status()).toBe(200);

    // Vérifier le lien Advanced Demo
    const advancedLink = page.locator('a[href="demo/advanced-demo.html"]').first();
    await expect(advancedLink).toBeVisible();
    
    // Tester la navigation vers advanced-demo.html
    const advancedResponse = await page.request.get('http://localhost:8080/demo/advanced-demo.html');
    expect(advancedResponse.status()).toBe(200);

    // Vérifier le lien Full Configuration Demo
    const fullConfigLink = page.locator('a[href="demo/full-config.html"]').first();
    await expect(fullConfigLink).toBeVisible();
    
    // Tester la navigation vers full-config.html
    const fullConfigResponse = await page.request.get('http://localhost:8080/demo/full-config.html');
    expect(fullConfigResponse.status()).toBe(200);

    // Vérifier le lien vers le répertoire demo
    const allDemosLink = page.locator('a[href="demo/"]').first();
    await expect(allDemosLink).toBeVisible();
    
    // Tester la navigation vers le répertoire demo
    const allDemosResponse = await page.request.get('http://localhost:8080/demo/');
    expect(allDemosResponse.status()).toBe(200);

    console.log('✅ Tous les liens de démo anglais fonctionnent correctement');
  });

  test('Tous les liens de démo en français fonctionnent', async ({ page }) => {
    // Basculer vers le français si nécessaire
    const langButton = page.locator('text=FR');
    if (await langButton.isVisible()) {
      await langButton.click();
      await page.waitForTimeout(500);
    }

    // Vérifier le lien Démo Minimale
    const minimalLink = page.locator('a[href="demo/minimal-demo.html"]').first();
    await expect(minimalLink).toBeVisible();

    // Vérifier le lien Démo Avancée
    const advancedLink = page.locator('a[href="demo/advanced-demo.html"]').first();
    await expect(advancedLink).toBeVisible();

    // Vérifier le lien Démo Configuration Complète
    const fullConfigLink = page.locator('a[href="demo/full-config.html"]').first();
    await expect(fullConfigLink).toBeVisible();

    // Vérifier le lien vers tous les fichiers de démo
    const allDemosLink = page.locator('a[href="demo/"]').first();
    await expect(allDemosLink).toBeVisible();

    console.log('✅ Tous les liens de démo français sont visibles et corrects');
  });

  test('Navigation vers les démos fonctionne réellement', async ({ page }) => {
    // Test de navigation réelle vers minimal-demo.html
    await page.goto('http://localhost:8080/demo/minimal-demo.html');
    await expect(page).toHaveTitle(/OntoWave/);
    
    // Test de navigation réelle vers advanced-demo.html
    await page.goto('http://localhost:8080/demo/advanced-demo.html');
    await expect(page).toHaveTitle(/OntoWave/);
    
    // Test de navigation réelle vers full-config.html
    await page.goto('http://localhost:8080/demo/full-config.html');
    await expect(page).toHaveTitle(/OntoWave/);

    // Test de navigation vers le répertoire demo
    await page.goto('http://localhost:8080/demo/');
    await expect(page.locator('h1')).toContainText('Directory listing for /demo/');
    
    console.log('✅ Navigation vers toutes les démos fonctionne parfaitement');
  });
});
