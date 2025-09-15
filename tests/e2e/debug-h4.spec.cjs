const { test, expect } = require('@playwright/test');

test('Debug titre H4', async ({ page }) => {
  console.log('🔍 DEBUG TITRE H4');
  
  await page.goto('http://localhost:8080', { timeout: 8000 });
  await page.waitForTimeout(3000);
  
  // Trouver le titre H4
  const h4Element = await page.locator('h4').first();
  const h4Text = await h4Element.textContent();
  console.log(`H4 trouvé: "${h4Text}"`);
  
  // Obtenir le contexte autour
  const context = await page.evaluate(() => {
    const h4 = document.querySelector('h4');
    if (h4) {
      return {
        text: h4.textContent,
        parent: h4.parentElement?.tagName,
        previousSibling: h4.previousElementSibling?.textContent?.slice(0, 50),
        nextSibling: h4.nextElementSibling?.textContent?.slice(0, 50)
      };
    }
    return null;
  });
  
  console.log('Contexte H4:', JSON.stringify(context, null, 2));
  
  expect(true).toBe(true);
});
