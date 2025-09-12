const { test, expect } = require('@playwright/test');

test.describe('Test Page Blanche OntoWave', () => {
  test('Diagnostic complet de la page blanche', async ({ page }) => {
    console.log('🚀 Test diagnostic page blanche OntoWave');
    
    // Aller sur la page
    await page.goto('http://localhost:8080');
    console.log('✅ 1. Page chargée');
    
    // Attendre que OntoWave se charge
    await page.waitForTimeout(3000);
    
    // Vérifier les erreurs JS
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
        console.log('❌ Erreur JS:', msg.text());
      }
    });
    
    // Vérifier le titre
    const title = await page.title();
    console.log('📄 Titre:', title);
    
    // Vérifier si le script OntoWave est chargé
    const scriptExists = await page.evaluate(() => {
      return document.querySelector('script[src="ontowave.min.js"]') !== null;
    });
    console.log(scriptExists ? '✅ 2. Script OntoWave détecté' : '❌ 2. Script OntoWave manquant');
    
    // Vérifier si OntoWave a créé du contenu
    const hasContent = await page.evaluate(() => {
      const body = document.body;
      return body.children.length > 1; // Plus que juste le script
    });
    console.log(hasContent ? '✅ 3. Contenu OntoWave généré' : '❌ 3. Pas de contenu généré');
    
    // Vérifier le contenu du body
    const bodyContent = await page.evaluate(() => {
      return document.body.innerHTML;
    });
    console.log('📦 Contenu body length:', bodyContent.length);
    
    // Vérifier les fichiers de configuration
    const configResponse = await page.goto('http://localhost:8080/config.json');
    const configText = await configResponse.text();
    console.log('⚙️ Config trouvée:', configText.length > 0 ? 'Oui' : 'Non');
    
    // Vérifier l'existence des dossiers de contenu
    await page.goto('http://localhost:8080/content/fr/index.md');
    const contentExists = await page.evaluate(() => {
      return !document.body.textContent.includes('Not Found');
    });
    console.log(contentExists ? '✅ 4. Contenu FR trouvé' : '❌ 4. Contenu FR manquant');
    
    console.log('🎉 DIAGNOSTIC TERMINÉ !');
  });
});
