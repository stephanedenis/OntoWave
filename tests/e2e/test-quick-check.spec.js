import { test, expect } from '@playwright/test';

test('Test rapide de fonctionnement OntoWave', async ({ page }) => {
  // Aller à la page
  await page.goto('http://localhost:8080');
  
  // Attendre 3 secondes pour que OntoWave se charge
  await page.waitForTimeout(3000);
  
  // Vérifier que OntoWave est chargé
  const ontoWaveExists = await page.evaluate(() => {
    return typeof window.OntoWave !== 'undefined';
  });
  
  console.log('🌊 OntoWave chargé:', ontoWaveExists);
  
  // Vérifier les éléments visibles
  const container = page.locator('#ontowave-container');
  const isVisible = await container.isVisible();
  console.log('📦 Container visible:', isVisible);
  
  // Vérifier les boutons de langue
  const langButtons = page.locator('[data-ontowave-lang]');
  const buttonCount = await langButtons.count();
  console.log('🌐 Boutons de langue:', buttonCount);
  
  // Vérifier le menu OntoWave
  const menu = page.locator('.ontowave-menu');
  const menuVisible = await menu.isVisible();
  console.log('📋 Menu visible:', menuVisible);
  
  // Prendre une capture d'écran
  await page.screenshot({ path: 'test-quick-check.png', fullPage: true });
});
