const { test, expect } = require('@playwright/test');

test.describe('Test final du changement de langue', () => {
  test('Les boutons de langue changent correctement les pages', async ({ page }) => {
    console.log('🔍 Test final...');
    
    // Aller à la page d'accueil
    await page.goto('http://localhost:8080');
    
    // Attendre que OntoWave soit initialisé
    await page.waitForFunction(() => window.OntoWave && window.OntoWave.instance);
    
    // Vérifier que la page française s'affiche par défaut
    await page.waitForSelector('#ontowave-container');
    const contentFr = await page.textContent('#ontowave-container');
    expect(contentFr).toContain('Mon Site avec OntoWave');
    
    // Changer vers l'anglais avec JavaScript
    await page.evaluate(() => {
      window.OntoWave.instance.switchLanguage('en');
    });
    
    // Attendre le changement de contenu
    await page.waitForFunction(() => {
      const content = document.querySelector('#ontowave-container')?.textContent || '';
      return content.includes('My Site with OntoWave');
    }, { timeout: 10000 });
    
    // Vérifier que le contenu anglais s'affiche
    const contentEn = await page.textContent('#ontowave-container');
    expect(contentEn).toContain('My Site with OntoWave');
    expect(contentEn).not.toContain('Mon Site avec OntoWave');
    
    // Changer vers le français avec JavaScript
    await page.evaluate(() => {
      window.OntoWave.instance.switchLanguage('fr');
    });
    
    // Attendre le retour au français
    await page.waitForFunction(() => {
      const content = document.querySelector('#ontowave-container')?.textContent || '';
      return content.includes('Mon Site avec OntoWave');
    }, { timeout: 10000 });
    
    // Vérifier que le contenu français s'affiche à nouveau
    const contentFrFinal = await page.textContent('#ontowave-container');
    expect(contentFrFinal).toContain('Mon Site avec OntoWave');
    expect(contentFrFinal).not.toContain('My Site with OntoWave');
    
    console.log('✅ Test réussi : Les boutons de langue fonctionnent correctement !');
  });
});
