import { test, expect } from '@playwright/test';

test('should have only one ontowave-config script', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  // Attendre 8 secondes pour le démarrage automatique et la transition
  await page.waitForTimeout(8000);
  
  // Compter les scripts de configuration
  const configScripts = page.locator('#ontowave-config');
  const count = await configScripts.count();
  
  console.log(`📄 Nombre de scripts ontowave-config trouvés: ${count}`);
  
  // Il ne devrait y avoir qu'un seul script de configuration
  expect(count).toBe(1);
  
  // Vérifier que l'interface OntoWave est chargée
  await expect(page.locator('#ontowave-container')).toBeVisible({ timeout: 5000 });
  
  console.log('✅ Configuration unique confirmée !');
});
