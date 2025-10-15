import { test, expect } from '@playwright/test';

test('Test OntoWave tableaux avec capture et logs console', async ({ page }) => {
  // Capturer les logs console
  const consoleLogs: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });

  // Aller sur la page
  await page.goto('http://localhost:8080/test-simple.html');
  
  // Attendre un peu pour que tout se charge
  await page.waitForTimeout(2000);
  
  // Capture d'écran initiale
  await page.screenshot({ 
    path: 'debug-ontowave-initial.png',
    fullPage: true 
  });
  
  // Vérifier si le contenu est chargé
  const contentDiv = page.locator('#content');
  await expect(contentDiv).toBeVisible();
  
  // Attendre plus longtemps pour que le markdown se charge
  await page.waitForTimeout(3000);
  
  // Capture d'écran finale
  await page.screenshot({ 
    path: 'debug-ontowave-final.png',
    fullPage: true 
  });
  
  // Vérifier si des tableaux sont présents
  const tables = page.locator('table');
  const tableCount = await tables.count();
  
  console.log(`=== RÉSULTATS TEST ONTOWAVE ===`);
  console.log(`Tables trouvées: ${tableCount}`);
  console.log(`URL: ${page.url()}`);
  console.log(`Erreurs JS: ${errors.length}`);
  console.log(`\n=== LOGS CONSOLE ===`);
  consoleLogs.forEach(log => console.log(log));
  console.log(`\n=== ERREURS ===`);
  errors.forEach(error => console.log(error));
  
  // Le test réussit même si pas de tableaux, on veut juste les infos
  expect(contentDiv).toBeVisible();
});