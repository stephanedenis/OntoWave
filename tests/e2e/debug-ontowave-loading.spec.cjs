const { test, expect } = require('@playwright/test');

test('Debug - Vérification OntoWave', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:8080/');
  
  console.log('=== DÉBUT DEBUG ===');
  
  // Vérifier le chargement de base
  await page.waitForTimeout(3000);
  
  // Vérifier si OntoWave existe
  const ontoWaveExists = await page.evaluate(() => {
    return typeof window.OntoWave !== 'undefined';
  });
  console.log('OntoWave existe:', ontoWaveExists);
  
  // Vérifier si OntoWave.instance existe
  const instanceExists = await page.evaluate(() => {
    return window.OntoWave && typeof window.OntoWave.instance !== 'undefined';
  });
  console.log('OntoWave.instance existe:', instanceExists);
  
  // Chercher tous les éléments qui contiennent "ontowave"
  const ontoWaveElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const found = [];
    elements.forEach(el => {
      if (el.className && el.className.includes('ontowave')) {
        found.push({
          tag: el.tagName,
          class: el.className,
          visible: el.offsetParent !== null
        });
      }
    });
    return found;
  });
  console.log('Éléments OntoWave trouvés:', ontoWaveElements);
  
  // Vérifier les erreurs JavaScript
  const errors = await page.evaluate(() => {
    return window.errors || [];
  });
  console.log('Erreurs JavaScript:', errors);
  
  console.log('=== FIN DEBUG ===');
});
