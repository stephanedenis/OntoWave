import { test, expect } from '@playwright/test';

test('Status check minimal', async ({ page }) => {
  // Démarrer le serveur programmatiquement
  await page.goto('http://localhost:8080', { timeout: 60000 });
  
  // Attendre que la page se charge
  await page.waitForTimeout(2000);
  
  // Vérifier que OntoWave s'est initialisé
  const check = await page.evaluate(() => {
    return {
      ontoWaveExists: typeof window.OntoWave !== 'undefined',
      containerExists: !!document.getElementById('ontowave-container'),
      bodyHtml: document.body.innerHTML.length
    };
  });
  
  console.log('Résultats du test:', check);
});
