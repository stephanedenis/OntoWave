const { test, expect } = require('@playwright/test');

test.describe('Debug Chargement Fichiers', () => {
  test('Vérifier quels fichiers OntoWave charge', async ({ page }) => {
    console.log('🔍 DEBUG CHARGEMENT - Analyser les requêtes réseau');
    
    // Intercepter toutes les requêtes réseau
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    page.on('response', response => {
      if (response.url().includes('.md') || response.url().includes('.json')) {
        console.log(`📥 Réponse: ${response.url()} - Status: ${response.status()}`);
      }
    });
    
    await page.goto('http://localhost:8080/');
    
    // Attendre qu'OntoWave se charge
    await page.waitForTimeout(5000);
    
    console.log('📊 ANALYSE DES REQUÊTES:');
    requests.forEach(req => {
      if (req.url.includes('.md') || req.url.includes('.json') || req.url.includes('ontowave')) {
        console.log(`  ${req.method} ${req.url} (${req.resourceType})`);
      }
    });
    
    // Vérifier la configuration OntoWave
    const config = await page.evaluate(() => {
      return window.OntoWave ? window.OntoWave.config : null;
    });
    console.log('⚙️ Configuration OntoWave:', JSON.stringify(config, null, 2));
    
    // Vérifier quelle langue est active
    const currentLang = await page.evaluate(() => {
      return window.OntoWave ? window.OntoWave.currentLanguage : null;
    });
    console.log(`🌐 Langue actuelle: ${currentLang}`);
    
    // Vérifier le contenu chargé
    const loadedContent = await page.evaluate(() => {
      const content = document.querySelector('.ontowave-content, .content, main, #content');
      return content ? content.innerHTML.substring(0, 200) : 'Aucun contenu trouvé';
    });
    console.log(`📝 Contenu chargé: "${loadedContent}"`);
    
    // Vérifier si les fichiers markdown existent
    const frFileExists = await page.evaluate(async () => {
      try {
        const response = await fetch('index.fr.md');
        return response.ok;
      } catch (e) {
        return false;
      }
    });
    
    const enFileExists = await page.evaluate(async () => {
      try {
        const response = await fetch('index.en.md');
        return response.ok;
      } catch (e) {
        return false;
      }
    });
    
    console.log(`📄 index.fr.md existe: ${frFileExists}`);
    console.log(`📄 index.en.md existe: ${enFileExists}`);
  });
});
