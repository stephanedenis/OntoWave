const { test, expect } = require('@playwright/test');

test('Boutons de langue uniquement dans le menu', async ({ page }) => {
  console.log('🧪 Test boutons menu uniquement...');
  
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(3000);
  
  // Vérifier absence de boutons fixes
  const fixedButtons = page.locator('.ontowave-fixed-lang-buttons .ontowave-lang-btn');
  const fixedCount = await fixedButtons.count();
  console.log(`🔍 Boutons fixes: ${fixedCount} (attendu: 0)`);
  
  // Ouvrir le menu
  const menuButton = page.locator('.ontowave-menu-button');
  await menuButton.click();
  await page.waitForTimeout(1000);
  
  // Vérifier présence de boutons dans le menu
  const menuButtons = page.locator('.ontowave-menu .ontowave-lang-btn');
  const menuCount = await menuButtons.count();
  console.log(`🔍 Boutons menu: ${menuCount} (attendu: 2)`);
  
  // Assertions
  expect(fixedCount).toBe(0);
  expect(menuCount).toBe(2);
  
  console.log('✅ Test réussi ! Boutons uniquement dans le menu');
});
