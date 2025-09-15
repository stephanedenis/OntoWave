const { test, expect } = require('@playwright/test');

test('Vérifier configuration complète', async ({ page }) => {
  
  // Aller sur la page
  await page.goto('http://localhost:8080/');
  
  // Attendre le chargement
  await page.waitForFunction(() => window.OntoWave, { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // Récupérer la configuration directement depuis le fichier
  const configFromFile = await page.evaluate(async () => {
    try {
      const response = await fetch('./config.json');
      const config = await response.json();
      return config;
    } catch (error) {
      return { error: error.message };
    }
  });
  
  console.log('📄 Configuration depuis fichier :', JSON.stringify(configFromFile, null, 2));
  
  // Vérifier si OntoWave a une méthode pour accéder à la config interne
  const ontoWaveInternals = await page.evaluate(() => {
    if (window.OntoWave) {
      return {
        hasConfig: !!window.OntoWave.config,
        configKeys: window.OntoWave.config ? Object.keys(window.OntoWave.config) : [],
        configValues: window.OntoWave.config || null,
        hasLoadConfig: typeof window.OntoWave.loadConfig === 'function',
        hasMethods: Object.getOwnPropertyNames(window.OntoWave).filter(key => typeof window.OntoWave[key] === 'function')
      };
    }
    return null;
  });
  
  console.log('🌊 OntoWave internals :', JSON.stringify(ontoWaveInternals, null, 2));
  
  // Rechercher la config dans d'autres emplacements possibles
  const configSearch = await page.evaluate(() => {
    const results = {};
    
    // Chercher dans différents endroits
    if (window.OntoWave) {
      for (let key in window.OntoWave) {
        if (key.toLowerCase().includes('config') || typeof window.OntoWave[key] === 'object') {
          results[key] = window.OntoWave[key];
        }
      }
    }
    
    return results;
  });
  
  console.log('🔍 Recherche de config :', JSON.stringify(configSearch, null, 2));
});
