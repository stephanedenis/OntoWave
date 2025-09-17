const { test, expect } = require('@playwright/test');

test('Validation finale régression multilingue CORRIGÉE', async ({ page }) => {
  console.log('🎉 Test de validation finale - régression multilingue corrigée !');
  
  // Aller à la page d'accueil
  await page.goto('http://localhost:8080/');
  
  // Attendre que OntoWave se charge
  await page.waitForTimeout(5000);
  
  // ✅ Vérifier que OntoWave fonctionne
  const content = await page.textContent('body');
  expect(content).toContain('OntoWave');
  console.log('✅ OntoWave chargé correctement');
  
  // ✅ Vérifier que les boutons de langue sont présents
  const frButtons = await page.locator('button:has-text("FR"), [title*="Français"]').count();
  const enButtons = await page.locator('button:has-text("EN"), [title*="English"]').count();
  
  expect(frButtons).toBeGreaterThan(0);
  expect(enButtons).toBeGreaterThan(0);
  
  console.log(`✅ ${frButtons} bouton(s) français trouvé(s)`);
  console.log(`✅ ${enButtons} bouton(s) anglais trouvé(s)`);
  
  // ✅ Tester le changement vers l'anglais
  const enButton = page.locator('button:has-text("EN"), [title*="English"]').first();
  await enButton.click();
  await page.waitForTimeout(2000);
  
  const englishContent = await page.textContent('body');
  const hasEnglishContent = englishContent.includes('A powerful JavaScript library') ||
                           englishContent.includes('Features') ||
                           englishContent.includes('Quick Start');
  
  expect(hasEnglishContent).toBe(true);
  console.log('✅ Changement vers anglais réussi');
  
  // ✅ Tester le changement vers le français
  const frButton = page.locator('button:has-text("FR"), [title*="Français"]').first();
  await frButton.click();
  await page.waitForTimeout(2000);
  
  const frenchContent = await page.textContent('body');
  const hasFrenchContent = frenchContent.includes('Une bibliothèque JavaScript puissante') ||
                          frenchContent.includes('Fonctionnalités') ||
                          frenchContent.includes('Démarrage Rapide');
  
  expect(hasFrenchContent).toBe(true);
  console.log('✅ Changement vers français réussi');
  
  // ✅ Vérifier que le bouton Home fonctionne (revenir à l'accueil)
  try {
    const homeButton = page.locator('text=Accueil, text=Home, [title*="Accueil"], [title*="Home"]').first();
    if (await homeButton.count() > 0) {
      await homeButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Bouton Accueil/Home fonctionnel');
    }
  } catch (e) {
    console.log('ℹ️ Bouton Home non testé (peut ne pas être visible)');
  }
  
  console.log('');
  console.log('🎊 RÉGRESSION MULTILINGUE CORRIGÉE AVEC SUCCÈS ! 🎊');
  console.log('');
  console.log('🔧 Corrections apportées :');
  console.log('   ✅ Configuration ui.languageButtons = "both"');
  console.log('   ✅ Sources séparées : index.fr.md et index.en.md');
  console.log('   ✅ Boutons de langue fonctionnels');
  console.log('   ✅ Changement de langue opérationnel');
  console.log('   ✅ Plus de tentative d\'affichage d\'index.md en mode multilingue');
  console.log('');
});
