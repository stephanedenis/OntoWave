const { test, expect } = require('@playwright/test');

test.describe('Test bouton Home multilingue', () => {
  test('Le bouton Home charge la page correspondant à la langue courante', async ({ page }) => {
    console.log('🔍 Test du bouton Home...');
    
    // Aller à la page d'accueil
    await page.goto('http://localhost:8080');
    
    // Attendre que OntoWave soit initialisé
    await page.waitForFunction(() => window.OntoWave && window.OntoWave.instance);
    
    // Vérifier que la page française s'affiche par défaut
    await page.waitForSelector('#ontowave-container');
    let content = await page.textContent('#ontowave-container');
    expect(content).toContain('Mon Site avec OntoWave');
    
    // Changer vers l'anglais
    await page.evaluate(() => {
      window.OntoWave.instance.switchLanguage('en');
    });
    
    // Attendre le changement de contenu
    await page.waitForFunction(() => {
      const content = document.querySelector('#ontowave-container')?.textContent || '';
      return content.includes('My Site with OntoWave');
    }, { timeout: 10000 });
    
    // Vérifier que le contenu anglais s'affiche
    content = await page.textContent('#ontowave-container');
    expect(content).toContain('My Site with OntoWave');
    
    // Ouvrir le menu OntoWave et cliquer sur Home
    await page.click('#ontowave-menu-icon');
    await page.waitForTimeout(500);
    
    // Cliquer sur le bouton Home
    await page.evaluate(() => {
      window.OntoWave.instance.goHome();
    });
    
    // Attendre que la page se recharge
    await page.waitForTimeout(2000);
    
    // Vérifier que nous sommes toujours sur la page anglaise (pas sur index.md)
    content = await page.textContent('#ontowave-container');
    expect(content).toContain('My Site with OntoWave'); // Doit rester en anglais
    expect(content).not.toContain('Mon Site avec OntoWave'); // Ne doit pas être en français
    
    // Changer vers le français
    await page.evaluate(() => {
      window.OntoWave.instance.switchLanguage('fr');
    });
    
    // Attendre le changement
    await page.waitForFunction(() => {
      const content = document.querySelector('#ontowave-container')?.textContent || '';
      return content.includes('Mon Site avec OntoWave');
    }, { timeout: 10000 });
    
    // Tester le bouton Home avec le français
    await page.evaluate(() => {
      window.OntoWave.instance.goHome();
    });
    
    await page.waitForTimeout(2000);
    
    // Vérifier que nous sommes sur la page française
    content = await page.textContent('#ontowave-container');
    expect(content).toContain('Mon Site avec OntoWave'); // Doit être en français
    expect(content).not.toContain('My Site with OntoWave'); // Ne doit pas être en anglais
    
    console.log('✅ Test réussi : Le bouton Home charge la bonne page selon la langue !');
  });
});
