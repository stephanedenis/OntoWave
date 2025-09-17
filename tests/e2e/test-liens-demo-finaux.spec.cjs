const { test, expect } = require('@playwright/test');

test.describe('Validation finale des liens de démo', () => {
  test('Tous les liens de démo fonctionnent parfaitement', async ({ page }) => {
    const baseUrl = 'http://localhost:8080';
    console.log('🧪 Test de tous les liens de démo...');
    
    // 1. Vérifier que tous les fichiers de démo existent
    const demoFiles = [
      'demo/minimal-demo.html',
      'demo/advanced-demo.html', 
      'demo/full-config.html'
    ];
    
    for (const file of demoFiles) {
      const response = await page.request.get(`${baseUrl}/${file}`);
      expect(response.status()).toBe(200);
      console.log(`✅ ${file} accessible`);
    }
    
    // 2. Vérifier que les liens sont présents dans les fichiers sources
    const frResponse = await page.request.get(`${baseUrl}/index.fr.md`);
    const frContent = await frResponse.text();
    
    expect(frContent).toContain('demo/minimal-demo.html');
    expect(frContent).toContain('demo/advanced-demo.html'); 
    expect(frContent).toContain('demo/full-config.html');
    console.log('✅ Liens corrects dans index.fr.md');
    
    const enResponse = await page.request.get(`${baseUrl}/index.en.md`);
    const enContent = await enResponse.text();
    
    expect(enContent).toContain('demo/minimal-demo.html');
    expect(enContent).toContain('demo/advanced-demo.html');
    expect(enContent).toContain('demo/full-config.html');
    console.log('✅ Liens corrects dans index.en.md');
    
    // 3. Test de navigation réelle
    await page.goto(`${baseUrl}/demo/minimal-demo.html`);
    await expect(page).toHaveTitle(/OntoWave/);
    console.log('✅ Navigation vers minimal-demo.html réussie');
    
    await page.goto(`${baseUrl}/demo/advanced-demo.html`);
    await expect(page).toHaveTitle(/OntoWave/);
    console.log('✅ Navigation vers advanced-demo.html réussie');
    
    await page.goto(`${baseUrl}/demo/full-config.html`);
    await expect(page).toHaveTitle(/OntoWave/);
    console.log('✅ Navigation vers full-config.html réussie');
    
    // 4. Vérifier qu'il n'y a plus d'anciens liens cassés
    expect(frContent).not.toContain('demo/minimal.html');
    expect(frContent).not.toContain('demo/advanced.html');
    expect(enContent).not.toContain('demo/minimal.html');
    expect(enContent).not.toContain('demo/advanced.html');
    console.log('✅ Plus d\'anciens liens cassés');
    
    console.log('🎉 TOUS LES LIENS DE DÉMO FONCTIONNENT PARFAITEMENT !');
  });
});
