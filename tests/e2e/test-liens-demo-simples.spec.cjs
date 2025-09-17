const { test, expect } = require('@playwright/test');

test.describe('Validation des liens de démo corrigés', () => {
  test('Tous les liens de démo sont accessibles', async ({ page }) => {
    // Test direct des liens sans passer par l'interface
    const baseUrl = 'http://localhost:8080';
    
    // Vérifier que minimal-demo.html est accessible
    const minimalResponse = await page.request.get(`${baseUrl}/demo/minimal-demo.html`);
    expect(minimalResponse.status()).toBe(200);
    console.log('✅ minimal-demo.html accessible');

    // Vérifier que advanced-demo.html est accessible
    const advancedResponse = await page.request.get(`${baseUrl}/demo/advanced-demo.html`);
    expect(advancedResponse.status()).toBe(200);
    console.log('✅ advanced-demo.html accessible');

    // Vérifier que full-config.html est accessible
    const fullConfigResponse = await page.request.get(`${baseUrl}/demo/full-config.html`);
    expect(fullConfigResponse.status()).toBe(200);
    console.log('✅ full-config.html accessible');

    // Vérifier que le répertoire demo est accessible
    const demoResponse = await page.request.get(`${baseUrl}/demo/`);
    expect(demoResponse.status()).toBe(200);
    console.log('✅ Répertoire demo/ accessible');

    // Navigation test réel
    await page.goto(`${baseUrl}/demo/minimal-demo.html`);
    await expect(page).toHaveTitle(/OntoWave/);
    console.log('✅ Navigation vers minimal-demo.html réussie');

    await page.goto(`${baseUrl}/demo/advanced-demo.html`);
    await expect(page).toHaveTitle(/OntoWave/);
    console.log('✅ Navigation vers advanced-demo.html réussie');

    await page.goto(`${baseUrl}/demo/full-config.html`);
    await expect(page).toHaveTitle(/OntoWave/);
    console.log('✅ Navigation vers full-config.html réussie');

    await page.goto(`${baseUrl}/demo/`);
    await expect(page.locator('h1')).toContainText('Directory listing for /demo/');
    console.log('✅ Navigation vers répertoire demo/ réussie');
  });

  test('Les liens sont présents dans la page d\'accueil', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(2000);

    // Vérifier que les liens sont présents dans le HTML
    const pageContent = await page.content();
    
    expect(pageContent).toContain('demo/minimal-demo.html');
    expect(pageContent).toContain('demo/advanced-demo.html');
    expect(pageContent).toContain('demo/full-config.html');
    expect(pageContent).toContain('demo/');
    
    console.log('✅ Tous les liens sont présents dans la page d\'accueil');
    
    // Vérifier qu'il n'y a plus les anciens liens cassés
    expect(pageContent).not.toContain('demo/basic/');
    expect(pageContent).not.toContain('demo/testing/');
    console.log('✅ Les anciens liens cassés ont été supprimés');
  });
});
