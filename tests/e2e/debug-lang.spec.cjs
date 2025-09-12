const { test, expect } = require('@playwright/test');

test('Debug langue détectée', async ({ page }) => {
  // Aller à la page
  await page.goto('http://localhost:8000');
  
  // Attendre le chargement complet
  await page.waitForTimeout(3000);
  
  // Évaluer la langue détectée dans le navigateur
  const detectedLang = await page.evaluate(() => {
    const userLang = navigator.language || navigator.userLanguage;
    const detected = userLang.startsWith('fr') ? 'fr' : 'en';
    console.log('Navigator language:', userLang);
    console.log('Detected:', detected);
    return { userLang, detected };
  });
  
  console.log('🔍 Langue détectée:', detectedLang);
  
  // Vérifier l'état localStorage
  const savedLang = await page.evaluate(() => {
    return localStorage.getItem('ontowave-lang');
  });
  
  console.log('💾 Langue en localStorage:', savedLang);
  
  // Vérifier l'état des divs
  const langStates = await page.evaluate(() => {
    const frDiv = document.getElementById('lang-fr');
    const enDiv = document.getElementById('lang-en');
    
    return {
      frExists: !!frDiv,
      enExists: !!enDiv,
      frClasses: frDiv ? frDiv.className : 'N/A',
      enClasses: enDiv ? enDiv.className : 'N/A',
      frVisible: frDiv ? getComputedStyle(frDiv).display !== 'none' : false,
      enVisible: enDiv ? getComputedStyle(enDiv).display !== 'none' : false
    };
  });
  
  console.log('📋 États des divs:', langStates);
});
