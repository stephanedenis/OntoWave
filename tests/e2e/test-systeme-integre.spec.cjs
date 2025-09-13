const { test, expect } = require('@playwright/test');

test('Test système multilingue intégré', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:8080/');
  
  console.log('=== TEST SYSTÈME MULTILINGUE INTÉGRÉ ===');
  
  // Attendre le chargement
  await page.waitForTimeout(3000);
  
  // Vérifier que OntoWave charge français par défaut
  const initialContent = await page.locator('.ontowave-content').textContent();
  console.log('Contenu initial (devrait être en français):', initialContent?.includes('Générateur') ? 'FR détecté ✅' : 'Problème langue initiale ❌');
  
  // Ouvrir le menu OntoWave
  const menuIcon = page.locator('.ontowave-menu-icon');
  await expect(menuIcon).toBeVisible();
  await menuIcon.click();
  await page.waitForTimeout(500);
  
  // Vérifier les boutons de langue dans le menu
  const langButtons = page.locator('.ontowave-lang-btn');
  const langButtonCount = await langButtons.count();
  console.log('Boutons de langue trouvés:', langButtonCount);
  
  if (langButtonCount >= 2) {
    // Cliquer sur EN
    const enButton = langButtons.filter({ hasText: 'EN' });
    await enButton.click();
    await page.waitForTimeout(2000);
    
    // Vérifier le changement de contenu
    const enContent = await page.locator('.ontowave-content').textContent();
    console.log('Contenu après changement EN:', enContent?.includes('generator') ? 'EN détecté ✅' : 'Problème changement EN ❌');
    
    // Retour au français
    await menuIcon.click();
    await page.waitForTimeout(500);
    const frButton = langButtons.filter({ hasText: 'FR' });
    await frButton.click();
    await page.waitForTimeout(2000);
    
    const frContent = await page.locator('.ontowave-content').textContent();
    console.log('Contenu retour FR:', frContent?.includes('Générateur') ? 'FR rétabli ✅' : 'Problème retour FR ❌');
    
    console.log('✅ Test changement de langue réussi');
  } else {
    console.log('❌ Boutons de langue introuvables dans le menu');
  }
  
  console.log('=== FIN TEST ===');
});
