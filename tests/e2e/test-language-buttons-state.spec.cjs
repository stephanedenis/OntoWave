const { test, expect } = require('@playwright/test');

test('Boutons de langue affichent le bon état initial', async ({ page }) => {
  // Configurer le navigateur pour préférer l'anglais
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9'
  });
  
  console.log('🧪 Test avec navigateur préférant l\'anglais');
  
  // Aller sur la page
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  
  // Attendre que OntoWave soit chargé
  await page.waitForSelector('.ontowave-floating-menu', { timeout: 10000 });
  
  // Cliquer sur le menu pour l'ouvrir
  await page.click('#ontowave-menu-icon');
  
  // Attendre que le menu soit ouvert
  await page.waitForSelector('.ontowave-menu-content', { visible: true });
  
  // Vérifier que le bouton EN est actif et FR non actif
  const buttonFr = page.locator('.ontowave-lang-btn').filter({ hasText: 'FR' });
  const buttonEn = page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' });
  
  await expect(buttonFr).toHaveCount(1);
  await expect(buttonEn).toHaveCount(1);
  
  // Vérifier l'état des boutons
  const frClass = await buttonFr.getAttribute('class');
  const enClass = await buttonEn.getAttribute('class');
  
  console.log('🔍 Classe bouton FR:', frClass);
  console.log('🔍 Classe bouton EN:', enClass);
  
  // Le bouton EN devrait être actif (avoir la classe 'active')
  // Le bouton FR ne devrait PAS être actif
  expect(enClass).toContain('active');
  expect(frClass).not.toContain('active');
  
  console.log('✅ Les boutons de langue reflètent correctement les préférences du navigateur (EN actif)');
  
  // Test du changement de langue
  await buttonFr.click();
  
  // Attendre un peu pour le changement
  await page.waitForTimeout(1000);
  
  // Vérifier que les états ont changé
  const frClassAfter = await buttonFr.getAttribute('class');
  const enClassAfter = await buttonEn.getAttribute('class');
  
  console.log('🔄 Après clic FR - Classe bouton FR:', frClassAfter);
  console.log('🔄 Après clic FR - Classe bouton EN:', enClassAfter);
  
  expect(frClassAfter).toContain('active');
  expect(enClassAfter).not.toContain('active');
  
  console.log('✅ Le changement de langue fonctionne correctement');
});
