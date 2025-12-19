const { test, expect } = require('@playwright/test');

test.use({ 
  baseURL: 'http://localhost:8020',
});

test('Page principale charge correctement', async ({ page }) => {
  await page.goto('http://localhost:8020/index.html');
  await page.waitForTimeout(3000);
  
  // Vérifier que l'app a chargé
  const appContent = await page.locator('#app').textContent();
  console.log('App content length:', appContent.length);
  
  // Vérifier qu'il y a du contenu (pas juste "Chargement...")
  expect(appContent.length).toBeGreaterThan(100);
  
  // Screenshot
  await page.screenshot({ path: 'test-results/index-page.png', fullPage: true });
  
  console.log('✅ Page principale fonctionne');
});
