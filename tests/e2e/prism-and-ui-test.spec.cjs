const { test, expect } = require('@playwright/test');

test('Prism syntax highlighting works', async ({ page }) => {
  // Console logs pour debugging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:8080/');
  
  // Attendre que OntoWave soit chargé
  await page.waitForSelector('#ontowave-container', { timeout: 10000 });
  
  // Attendre un peu plus pour le chargement de Prism
  await page.waitForTimeout(3000);
  
  // Vérifier que Prism est chargé
  const prismLoaded = await page.evaluate(() => {
    return typeof window.Prism !== 'undefined';
  });
  
  console.log('Prism loaded:', prismLoaded);
  expect(prismLoaded).toBe(true);
  
  // Vérifier que les langages HTML sont disponibles
  const htmlLanguageLoaded = await page.evaluate(() => {
    return window.Prism && window.Prism.languages && 
           !!(window.Prism.languages.html || window.Prism.languages.markup);
  });
  
  console.log('HTML language loaded:', htmlLanguageLoaded);
  expect(htmlLanguageLoaded).toBe(true);
  
  // Vérifier qu'il y a des blocs de code avec coloration
  const codeBlocks = await page.locator('code[class*="language-"]').count();
  console.log('Code blocks with language classes:', codeBlocks);
  expect(codeBlocks).toBeGreaterThan(0);
  
  // Vérifier qu'au moins un bloc HTML a la coloration Prism
  const htmlCodeBlock = page.locator('code.language-html').first();
  await expect(htmlCodeBlock).toBeVisible();
  
  // Vérifier que Prism a ajouté des spans pour la coloration
  const highlightedTokens = await htmlCodeBlock.locator('span.token').count();
  console.log('Highlighted tokens in HTML block:', highlightedTokens);
  expect(highlightedTokens).toBeGreaterThan(0);
  
  console.log('✅ Prism syntax highlighting is working!');
});

test('Language buttons positioning', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  // Attendre que la page soit chargée
  await page.waitForSelector('#ontowave-container', { timeout: 10000 });
  
  // Vérifier que les boutons de langue existent
  const frButton = page.locator('#btn-fr');
  const enButton = page.locator('#btn-en');
  
  await expect(frButton).toBeVisible();
  await expect(enButton).toBeVisible();
  
  // Vérifier leur position (doivent être en haut à droite)
  const frBox = await frButton.boundingBox();
  const enBox = await enButton.boundingBox();
  
  console.log('FR button position:', frBox);
  console.log('EN button position:', enBox);
  
  // Vérifier qu'ils sont en haut de la page (y < 100px)
  expect(frBox.y).toBeLessThan(100);
  expect(enBox.y).toBeLessThan(100);
  
  // Vérifier qu'ils sont à droite (x > 50% de la largeur)
  const viewportSize = page.viewportSize();
  expect(frBox.x).toBeGreaterThan(viewportSize.width * 0.5);
  expect(enBox.x).toBeGreaterThan(viewportSize.width * 0.5);
  
  console.log('✅ Language buttons are positioned correctly!');
});
