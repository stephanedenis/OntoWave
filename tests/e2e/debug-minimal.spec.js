import { test, expect } from '@playwright/test';

test('debug OntoWave loading', async ({ page }) => {
  // Écouter les erreurs console
  page.on('console', msg => console.log('🖥️  Console:', msg.text()));
  page.on('pageerror', err => console.log('❌ Page Error:', err.message));
  
  // Aller à la page
  await page.goto('http://127.0.0.1:8090/test-minimal.html');
  
  // Attendre un peu pour laisser charger
  await page.waitForTimeout(3000);
  
  // Vérifier si OntoWave est défini
  const ontoWaveExists = await page.evaluate(() => {
    return typeof window.OntoWave !== 'undefined';
  });
  
  console.log('🌊 OntoWave défini:', ontoWaveExists);
  
  // Vérifier le contenu de la div
  const content = await page.locator('#content').innerHTML();
  console.log('📄 Contenu div:', content.substring(0, 200));
  
  // Capture d'écran pour debug
  await page.screenshot({
    path: 'DEBUG-ONTOWAVE-LOADING.png',
    fullPage: true
  });
  
  // Vérifier les erreurs réseau
  const responses = [];
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`❌ Failed request: ${response.url()} - ${response.status()}`);
    } else {
      console.log(`✅ Success: ${response.url()}`);
    }
  });
  
  console.log('🔍 Debug terminé');
});