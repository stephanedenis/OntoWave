const { test, expect } = require('@playwright/test');

test('Quick Prism verification', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  // Attendre le chargement simple
  await page.waitForSelector('#ontowave-container');
  await page.waitForTimeout(3000);
  
  // Vérifier rapidement les tokens
  const tokenCount = await page.locator('.token').count();
  console.log(`Tokens Prism trouvés: ${tokenCount}`);
  
  // Test simple de visibilité
  const visibleCodeBlocks = await page.locator('code[class*="language-"]:visible').count();
  console.log(`Blocs de code visibles: ${visibleCodeBlocks}`);
  
  expect(tokenCount).toBeGreaterThan(0);
});
