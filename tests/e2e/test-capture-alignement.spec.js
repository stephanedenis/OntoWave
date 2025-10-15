import { test, expect } from '@playwright/test';

test('Capture Tableaux Alignement OntoWave', async ({ page }) => {
  console.log('📸 Génération capture alignements...');
  
  await page.goto('http://localhost:8090/test-alignement-tableaux.html');
  await page.waitForTimeout(3000);
  
  // Screenshot haute résolution
  await page.screenshot({ 
    path: 'RENDU-TABLEAUX-ALIGNEMENT.png', 
    fullPage: true,
    clip: { x: 0, y: 0, width: 1200, height: 2000 }
  });
  
  // Vérification rapide
  const tables = await page.locator('table').count();
  console.log(`📊 ${tables} tableaux avec alignements complets !`);
  
  // Log des alignements détectés
  const alignments = await page.evaluate(() => {
    const elements = document.querySelectorAll('.text-left, .text-center, .text-right');
    const counts = { left: 0, center: 0, right: 0 };
    elements.forEach(el => {
      if (el.classList.contains('text-left')) counts.left++;
      if (el.classList.contains('text-center')) counts.center++;
      if (el.classList.contains('text-right')) counts.right++;
    });
    return counts;
  });
  
  console.log(`⬅️ Gauche (:---): ${alignments.left}`);
  console.log(`⬆️ Centre (:---:): ${alignments.center}`);
  console.log(`➡️ Droite (---:): ${alignments.right}`);
  
  console.log('✅ Capture générée !');
});