const { test, expect } = require('@playwright/test');

test.describe('Test Manuel du Système Multilingue', () => {
  
  test('Navigation complète multilingue FR/EN', async ({ page }) => {
    console.log('🧪 Test : Navigation multilingue complète');
    
    // Page d'accueil
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Vérifier redirection automatique vers français
    expect(page.url()).toContain('#index.fr.md');
    console.log('✅ Redirection vers français OK');
    
    // Vérifier contenu français
    const frenchContent = await page.textContent('body');
    expect(frenchContent).toContain('Micro-application pour sites statiques');
    console.log('✅ Contenu français chargé');
    
    // Tester navigation vers anglais
    await page.goto('http://localhost:8080/#index.en.md');
    await page.waitForTimeout(2000);
    
    // Vérifier contenu anglais  
    const englishContent = await page.textContent('body');
    expect(englishContent).toContain('Diagram generator for static sites');
    console.log('✅ Contenu anglais chargé');
    
    // Retour vers français
    await page.goto('http://localhost:8080/#index.fr.md');
    await page.waitForTimeout(2000);
    
    const frenchContent2 = await page.textContent('body');
    expect(frenchContent2).toContain('Générateur de diagrammes');
    console.log('✅ Retour vers français OK');
    
    console.log('🎉 Navigation multilingue entièrement fonctionnelle !');
  });

});
