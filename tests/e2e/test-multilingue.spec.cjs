const { test, expect } = require('@playwright/test');

test('Test fonctionnalité multilingue', async ({ page }) => {
  console.log('🌐 Test de la fonctionnalité multilingue');
  
  await page.goto('http://localhost:8000');
  await page.waitForTimeout(5000);
  
  // Vérifier que les boutons sont présents
  const frButton = page.locator('#btn-fr');
  const enButton = page.locator('#btn-en');
  
  await expect(frButton).toBeVisible();
  await expect(enButton).toBeVisible();
  console.log('✅ Boutons de langue visibles');
  
  // Forcer le passage au français (car par défaut c'est anglais)
  await frButton.click();
  await page.waitForTimeout(1000);
  
  // Vérifier le contenu français 
  const frContent = page.locator('#lang-fr');
  const enContent = page.locator('#lang-en');
  
  await expect(frContent).toBeVisible();
  await expect(frContent).toContainText('Micro-application pour sites statiques');
  console.log('✅ Contenu français affiché');
  
  // Tester la bascule vers l'anglais
  console.log('🔄 Test bascule vers anglais...');
  await enButton.click();
  await page.waitForTimeout(1000);
  
  await expect(enContent).toBeVisible();
  await expect(enContent).toContainText('Micro-application for static sites');
  await expect(frContent).toBeHidden();
  console.log('✅ Bascule vers anglais réussie');
  
  // Vérifier la sauvegarde localStorage
  const savedLang = await page.evaluate(() => localStorage.getItem('ontowave-lang'));
  expect(savedLang).toBe('en');
  console.log('✅ Préférence sauvée dans localStorage');
  
  // Retour au français
  console.log('🔄 Test retour au français...');
  await frButton.click();
  await page.waitForTimeout(1000);
  
  await expect(frContent).toBeVisible();
  await expect(enContent).toBeHidden();
  console.log('✅ Retour au français réussi');
  
  console.log('🎉 Système multilingue 100% fonctionnel !');
});
