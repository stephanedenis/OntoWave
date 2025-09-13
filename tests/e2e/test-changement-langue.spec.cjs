const { test, expect } = require('@playwright/test');

test('Test changement de langue - détection page blanche', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:8080/');
  
  console.log('=== TEST CHANGEMENT DE LANGUE ===');
  
  // Vérifier le chargement initial
  await page.waitForTimeout(2000);
  
  // Vérifier que OntoWave se charge
  const ontoWaveExists = await page.evaluate(() => {
    return typeof window.OntoWave !== 'undefined';
  });
  console.log('OntoWave chargé:', ontoWaveExists);
  
  // Vérifier le contenu initial (français par défaut)
  const initialContent = await page.locator('.ontowave-content').textContent();
  console.log('Contenu initial:', initialContent ? 'présent' : 'vide');
  
  // Cliquer sur le bouton EN
  const enButton = page.locator('.lang-btn').last();
  await enButton.click();
  
  // Attendre le changement
  await page.waitForTimeout(2000);
  
  // Vérifier si la page devient blanche
  const afterChangeContent = await page.locator('.ontowave-content').textContent();
  console.log('Contenu après changement EN:', afterChangeContent ? 'présent' : 'VIDE - PROBLÈME!');
  
  // Vérifier si des erreurs de chargement
  const networkErrors = [];
  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
    }
  });
  
  // Retour au français
  const frButton = page.locator('.lang-btn').first();
  await frButton.click();
  await page.waitForTimeout(2000);
  
  const backToFrContent = await page.locator('.ontowave-content').textContent();
  console.log('Contenu retour FR:', backToFrContent ? 'présent' : 'VIDE - PROBLÈME!');
  
  console.log('Erreurs réseau détectées:', networkErrors);
  
  // Vérifier les fichiers chargés
  const frFileExists = await page.evaluate(async () => {
    try {
      const response = await fetch('/index.fr.md');
      return response.ok;
    } catch (e) {
      return false;
    }
  });
  
  const enFileExists = await page.evaluate(async () => {
    try {
      const response = await fetch('/index.en.md');
      return response.ok;
    } catch (e) {
      return false;
    }
  });
  
  console.log('Fichier index.fr.md accessible:', frFileExists);
  console.log('Fichier index.en.md accessible:', enFileExists);
  
  console.log('=== FIN TEST ===');
});
