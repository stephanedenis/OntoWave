import { test, expect } from '@playwright/test';

test('should have exactly one ontowave-config script', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  // Compter les configurations initialement
  let configScripts = page.locator('#ontowave-config');
  expect(await configScripts.count()).toBe(1);
  console.log('✅ 1 configuration dans le HTML initial');
  
  // Déclencher la transition
  await page.click('.cta-button:has-text("Démarrer la Démo")');
  await page.waitForTimeout(2000);
  
  // Vérifier qu'il n'y a toujours qu'une seule configuration
  configScripts = page.locator('#ontowave-config');
  const finalCount = await configScripts.count();
  
  console.log(`📄 Configurations finales: ${finalCount}`);
  expect(finalCount).toBe(1);
  
  console.log('🎯 Problème de duplication résolu !');
});
