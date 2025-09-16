const { test, expect } = require('@playwright/test');

test('Boutons de langue corrects sur page française directe', async ({ page }) => {
  console.log('🧪 Test avec accès direct à la page française');
  
  // Aller directement sur la page française
  await page.goto('http://localhost:8080/#index.fr.md', { waitUntil: 'networkidle' });
  
  // Attendre que OntoWave soit chargé
  await page.waitForSelector('.ontowave-floating-menu', { timeout: 10000 });
  
  // Cliquer sur le menu pour l'ouvrir
  await page.click('#ontowave-menu-icon');
  
  // Attendre que le menu soit ouvert
  await page.waitForSelector('.ontowave-menu-content', { visible: true });
  
  // Vérifier que le bouton FR est actif et EN non actif
  const buttonFr = page.locator('.ontowave-lang-btn').filter({ hasText: 'FR' });
  const buttonEn = page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' });
  
  await expect(buttonFr).toHaveCount(1);
  await expect(buttonEn).toHaveCount(1);
  
  // Vérifier l'état des boutons
  const frClass = await buttonFr.getAttribute('class');
  const enClass = await buttonEn.getAttribute('class');
  
  console.log('🔍 URL actuelle:', await page.url());
  console.log('🔍 Classe bouton FR:', frClass);
  console.log('🔍 Classe bouton EN:', enClass);
  
  // Le bouton FR devrait être actif (avoir la classe 'active')
  // Le bouton EN ne devrait PAS être actif
  expect(frClass).toContain('active');
  expect(enClass).not.toContain('active');
  
  console.log('✅ Les boutons de langue reflètent correctement la page française (FR actif)');
  
  // Test du changement vers anglais
  await buttonEn.click();
  
  // Attendre un peu pour le changement
  await page.waitForTimeout(1000);
  
  // Vérifier que les états ont changé
  const frClassAfter = await buttonFr.getAttribute('class');
  const enClassAfter = await buttonEn.getAttribute('class');
  
  console.log('🔄 Après clic EN - URL:', await page.url());
  console.log('🔄 Après clic EN - Classe bouton FR:', frClassAfter);
  console.log('🔄 Après clic EN - Classe bouton EN:', enClassAfter);
  
  expect(enClassAfter).toContain('active');
  expect(frClassAfter).not.toContain('active');
  
  console.log('✅ Le changement vers anglais fonctionne correctement');
});
