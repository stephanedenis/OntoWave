import { test, expect } from '@playwright/test';

test('should preserve single config after demo transition', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  // Vérifier qu'il y a 1 config au départ
  let configScripts = page.locator('#ontowave-config');
  expect(await configScripts.count()).toBe(1);
  console.log('✅ 1 configuration au départ');
  
  // Cliquer sur le bouton démo pour déclencher la transition
  await page.click('.cta-button:has-text("Démarrer la Démo")');
  
  // Attendre la transition (2 secondes)
  await page.waitForTimeout(3000);
  
  // Vérifier qu'il y a toujours 1 seule config après la transition
  configScripts = page.locator('#ontowave-config');
  const finalCount = await configScripts.count();
  
  console.log(`📄 Configurations après transition: ${finalCount}`);
  expect(finalCount).toBe(1);
  
  // Vérifier que l'interface OntoWave est chargée
  await expect(page.locator('#ontowave-container')).toBeVisible({ timeout: 5000 });
  
  console.log('✅ Configuration unique préservée après transition !');
});
