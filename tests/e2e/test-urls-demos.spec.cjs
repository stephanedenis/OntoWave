const { test, expect } = require('@playwright/test');

test.describe('Test basique des démos', () => {
  test('Accès aux démos sans erreur', async ({ page }) => {
    // Test minimal demo
    console.log('=== Test démo minimale ===');
    await page.goto('http://localhost:8080/demo/minimal-demo.html');
    await page.waitForTimeout(2000);
    const url1 = page.url();
    console.log('URL démo minimale:', url1);
    
    // Test advanced demo
    console.log('=== Test démo avancée ===');
    await page.goto('http://localhost:8080/demo/advanced-demo.html');
    await page.waitForTimeout(2000);
    const url2 = page.url();
    console.log('URL démo avancée:', url2);
    
    // Test full config demo
    console.log('=== Test démo complète ===');
    await page.goto('http://localhost:8080/demo/full-config.html');
    await page.waitForTimeout(2000);
    const url3 = page.url();
    console.log('URL démo complète:', url3);
    
    console.log('=== Test terminé ===');
  });
});
