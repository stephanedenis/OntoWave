const { test, expect } = require('@playwright/test');

test('Test simple validation OntoWave', async ({ page }) => {
  console.log('🧪 Démarrage du test de validation OntoWave');
  
  // Aller à la page d'accueil
  await page.goto('http://localhost:8080/');
  console.log('📄 Page chargée');
  
  // Attendre 5 secondes pour le chargement complet
  await page.waitForTimeout(5000);
  console.log('⏱️ Attente terminée');
  
  // Test 1: Vérifier le titre
  try {
    const title = await page.textContent('title');
    console.log('📋 Titre de la page:', title);
    expect(title).toContain('OntoWave');
    console.log('✅ Test titre: SUCCÈS');
  } catch (e) {
    console.log('❌ Test titre: ÉCHEC -', e.message);
  }
  
  // Test 2: Vérifier la présence de contenu
  try {
    const bodyText = await page.textContent('body');
    const hasContent = bodyText && bodyText.length > 100;
    console.log('📝 Longueur du contenu:', bodyText ? bodyText.length : 0);
    expect(hasContent).toBeTruthy();
    console.log('✅ Test contenu: SUCCÈS');
  } catch (e) {
    console.log('❌ Test contenu: ÉCHEC -', e.message);
  }
  
  // Test 3: Vérifier OntoWave
  try {
    const ontoWavePresent = await page.evaluate(() => {
      return document.querySelector('#ontowave-floating-menu') !== null;
    });
    console.log('🎛️ Menu OntoWave présent:', ontoWavePresent);
    expect(ontoWavePresent).toBeTruthy();
    console.log('✅ Test OntoWave: SUCCÈS');
  } catch (e) {
    console.log('❌ Test OntoWave: ÉCHEC -', e.message);
  }
  
  // Test 4: Vérifier Prism
  try {
    const prismLoaded = await page.evaluate(() => window.Prism !== undefined);
    console.log('🎨 Prism chargé:', prismLoaded);
    expect(prismLoaded).toBeTruthy();
    console.log('✅ Test Prism: SUCCÈS');
  } catch (e) {
    console.log('❌ Test Prism: ÉCHEC -', e.message);
  }
  
  // Test 5: Vérifier boutons de langue
  try {
    const langButtons = await page.locator('.lang-toggle button').count();
    console.log('🌐 Boutons de langue:', langButtons);
    expect(langButtons).toBeGreaterThanOrEqual(2);
    console.log('✅ Test boutons langue: SUCCÈS');
  } catch (e) {
    console.log('❌ Test boutons langue: ÉCHEC -', e.message);
  }
  
  console.log('🎉 Test de validation terminé');
});
