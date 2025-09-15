const { test, expect } = require('@playwright/test');

test('Debug création interface OntoWave', async ({ page }) => {
  console.log('🔍 DEBUG CRÉATION INTERFACE ONTOWAVE');
  
  await page.goto('http://localhost:8080', { timeout: 8000 });
  await page.waitForTimeout(5000); // Attendre plus longtemps
  
  // 1. Vérifier l'initialisation OntoWave
  const initDebug = await page.evaluate(() => {
    if (!window.OntoWave) return 'OntoWave non défini';
    
    return {
      hasInstance: !!window.OntoWave.instance,
      hasInit: typeof window.OntoWave.init === 'function',
      hasCreateUI: typeof window.OntoWave.createUI === 'function',
      documentReady: document.readyState,
      bodyChildren: document.body.children.length
    };
  });
  console.log('1. Debug initialisation:', JSON.stringify(initDebug, null, 2));
  
  // 2. Forcer l'initialisation si nécessaire
  const forceInit = await page.evaluate(() => {
    if (window.OntoWave && typeof window.OntoWave.init === 'function') {
      try {
        window.OntoWave.init();
        return 'Init forcé avec succès';
      } catch (error) {
        return `Erreur init: ${error.message}`;
      }
    }
    return 'Fonction init non disponible';
  });
  console.log('2. Force init:', forceInit);
  
  await page.waitForTimeout(2000);
  
  // 3. Rechercher l'interface après init forcé
  const uiElements = await page.evaluate(() => {
    return {
      containers: document.querySelectorAll('[id*="ontowave"], .ontowave').length,
      buttons: document.querySelectorAll('button, [role="button"]').length,
      toggles: document.querySelectorAll('[id*="toggle"]').length,
      menus: document.querySelectorAll('[id*="menu"], .menu').length,
      floatingElements: document.querySelectorAll('[style*="position"], [style*="fixed"], [style*="absolute"]').length
    };
  });
  console.log('3. Éléments UI après init:', JSON.stringify(uiElements, null, 2));
  
  expect(true).toBe(true);
});
