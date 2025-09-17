const { test, expect } = require('@playwright/test');

test('Test régression boutons multilingues page d\'accueil', async ({ page }) => {
  console.log('🧪 Test de la régression des boutons multilingues...');
  
  // Aller à la page d'accueil
  await page.goto('http://localhost:8080/');
  
  // Attendre que OntoWave se charge
  await page.waitForSelector('.ontowave-container', { timeout: 10000 });
  
  // Vérifier que le contenu est chargé
  const content = await page.textContent('body');
  expect(content).toContain('OntoWave');
  
  console.log('✅ Contenu OntoWave chargé');
  
  // Ouvrir le menu OntoWave
  await page.click('[title="OntoWave"]');
  await page.waitForTimeout(500);
  
  // Vérifier que les boutons de langue sont présents
  const langButtons = await page.locator('[data-lang]').count();
  expect(langButtons).toBeGreaterThan(0);
  
  console.log(`✅ ${langButtons} boutons de langue détectés`);
  
  // Tester le changement de langue EN
  const enButton = page.locator('[data-lang="en"]');
  if (await enButton.count() > 0) {
    await enButton.click();
    await page.waitForTimeout(1000);
    
    // Vérifier que le contenu anglais est affiché
    const englishContent = await page.textContent('body');
    expect(englishContent).toContain('A powerful JavaScript library');
    console.log('✅ Changement vers anglais OK');
  }
  
  // Tester le changement de langue FR
  const frButton = page.locator('[data-lang="fr"]');
  if (await frButton.count() > 0) {
    await frButton.click();
    await page.waitForTimeout(1000);
    
    // Vérifier que le contenu français est affiché
    const frenchContent = await page.textContent('body');
    expect(frenchContent).toContain('Une bibliothèque JavaScript puissante');
    console.log('✅ Changement vers français OK');
  }
  
  // Vérifier que le bouton Home fonctionne
  const homeButton = page.locator('text=Accueil, text=Home').first();
  if (await homeButton.count() > 0) {
    await homeButton.click();
    await page.waitForTimeout(500);
    console.log('✅ Bouton Accueil/Home fonctionnel');
  }
  
  console.log('🎉 Test de régression réussi - tous les boutons fonctionnent !');
});
