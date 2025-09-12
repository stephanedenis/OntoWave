const { test, expect } = require('@playwright/test');

test('Language buttons fixed position test', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  // Attendre le chargement
  await page.waitForSelector('#ontowave-container');
  await page.waitForTimeout(1000);
  
  // Vérifier que les boutons existent et sont visibles
  const frButton = page.locator('#btn-fr');
  const enButton = page.locator('#btn-en');
  
  await expect(frButton).toBeVisible();
  await expect(enButton).toBeVisible();
  
  // Vérifier leur position
  const frBox = await frButton.boundingBox();
  const enBox = await enButton.boundingBox();
  
  console.log('FR button position:', frBox);
  console.log('EN button position:', enBox);
  
  // Vérifier qu'ils sont en haut (y < 50px pour fixed positioning)
  expect(frBox.y).toBeLessThan(50);
  expect(enBox.y).toBeLessThan(50);
  
  // Vérifier qu'ils sont à droite
  const viewportSize = page.viewportSize();
  expect(frBox.x).toBeGreaterThan(viewportSize.width * 0.6);
  expect(enBox.x).toBeGreaterThan(viewportSize.width * 0.6);
  
  console.log('✅ Language buttons are positioned correctly!');
});
