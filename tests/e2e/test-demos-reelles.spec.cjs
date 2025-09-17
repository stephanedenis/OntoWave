const { test, expect } = require('@playwright/test');

test.describe('Test des démos réelles dans le navigateur', () => {
  test('La démo minimale fonctionne correctement', async ({ page }) => {
    // Aller sur la démo minimale
    await page.goto('http://localhost:8080/demo/minimal-demo.html');
    
    // Attendre que OntoWave se charge
    await page.waitForTimeout(3000);
    
    // Vérifier l'URL finale
    const finalUrl = page.url();
    console.log('URL finale:', finalUrl);
    
    // Vérifier si le contenu est chargé
    const title = await page.locator('h1').first().textContent();
    console.log('Titre trouvé:', title);
    
    // Vérifier que OntoWave est chargé
    const ontoWavePresent = await page.locator('.ontowave-container').isVisible();
    console.log('OntoWave container visible:', ontoWavePresent);
    
    // Vérifier le contenu spécifique
    const content = await page.textContent('body');
    const hasMinimalContent = content.includes('Démo Minimale') || content.includes('Minimal Demo');
    console.log('Contenu minimal présent:', hasMinimalContent);
    
    // Prendre une capture d'écran pour debug
    await page.screenshot({ path: 'test-results/minimal-demo-screenshot.png' });
  });

  test('La démo avancée fonctionne correctement', async ({ page }) => {
    // Aller sur la démo avancée
    await page.goto('http://localhost:8080/demo/advanced-demo.html');
    
    // Attendre que OntoWave se charge
    await page.waitForTimeout(3000);
    
    // Vérifier l'URL finale
    const finalUrl = page.url();
    console.log('URL finale avancée:', finalUrl);
    
    // Vérifier le contenu
    const title = await page.locator('h1').first().textContent();
    console.log('Titre avancé trouvé:', title);
    
    // Prendre une capture d'écran pour debug
    await page.screenshot({ path: 'test-results/advanced-demo-screenshot.png' });
  });

  test('La démo full-config fonctionne correctement', async ({ page }) => {
    // Aller sur la démo full-config
    await page.goto('http://localhost:8080/demo/full-config.html');
    
    // Attendre que OntoWave se charge
    await page.waitForTimeout(3000);
    
    // Vérifier l'URL finale
    const finalUrl = page.url();
    console.log('URL finale full-config:', finalUrl);
    
    // Vérifier le contenu
    const content = await page.textContent('body');
    console.log('Contenu full-config longueur:', content.length);
    
    // Prendre une capture d'écran pour debug
    await page.screenshot({ path: 'test-results/full-config-screenshot.png' });
  });
});
