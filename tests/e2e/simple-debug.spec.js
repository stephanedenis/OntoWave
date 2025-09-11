const { test, expect } = require('@playwright/test');

test('Test simple OntoWave index.md', async ({ page }) => {
  // Capturer les erreurs de console
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:8080/');
  
  // Attendre que OntoWave charge
  await page.waitForTimeout(5000);
  
  // Vérifier si le titre OntoWave est présent
  const title = await page.textContent('body');
  console.log('Contenu de la page:', title ? title.substring(0, 200) : 'VIDE');
  
  // Vérifier si les boutons de langue sont présents
  const langButtons = await page.locator('.lang-toggle button').count();
  console.log('Boutons de langue détectés:', langButtons);
  
  // Vérifier si Prism est chargé
  const prismLoaded = await page.evaluate(() => window.Prism !== undefined);
  console.log('Prism chargé:', prismLoaded);
  
  // Prendre une capture d'écran pour diagnostic
  await page.screenshot({ path: '/tmp/ontowave-debug.png', fullPage: true });
  console.log('Capture sauvée dans /tmp/ontowave-debug.png');
});
