const { test, expect } = require('@playwright/test');

test.describe('Fix Système Multilingue OntoWave', () => {
  
  test('Redirection automatique vers langue par défaut sans hash', async ({ page }) => {
    console.log('🧪 Test : Redirection automatique multilingue');
    
    // Aller sur la page sans hash
    await page.goto('http://localhost:8080/');
    
    // Attendre que OntoWave se charge et redirige
    await page.waitForTimeout(2000);
    
    // Vérifier que l'URL contient maintenant le hash de la langue par défaut
    const currentUrl = page.url();
    console.log('📍 URL après redirection:', currentUrl);
    
    expect(currentUrl).toContain('#index.fr.md');
  });

  test('Mode multilingue : pas de code hardcodé dans HTML', async ({ page }) => {
    console.log('🧪 Test : Absence de code de redirection hardcodé');
    
    // Récupérer le contenu HTML brut
    const response = await page.goto('http://localhost:8080/');
    const html = await response.text();
    
    // Vérifier que le code de redirection n'est pas dans le HTML
    expect(html).not.toContain('if (!window.location.hash)');
    expect(html).not.toContain('window.location.hash = ');
    
    console.log('✅ Aucun code de redirection hardcodé trouvé dans le HTML');
  });

  test('Système multilingue complet fonctionnel', async ({ page }) => {
    console.log('🧪 Test : Fonctionnement du système multilingue');
    
    // Aller sur la page
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Vérifier que OntoWave s'est bien chargé et initialisé
    const ontoWaveExists = await page.evaluate(() => {
      return typeof window.OntoWave !== 'undefined';
    });
    
    expect(ontoWaveExists).toBe(true);
    console.log('✅ OntoWave initialisé');
    
    // Vérifier que le contenu français est chargé
    const hasContent = await page.locator('#ontowave-content').count();
    expect(hasContent).toBeGreaterThan(0);
    console.log('✅ Contenu chargé');
    
    // Vérifier la présence des boutons de langue
    const langButtons = await page.locator('[data-lang]').count();
    expect(langButtons).toBeGreaterThan(0);
    console.log('✅ Boutons de langue présents');
  });

});
