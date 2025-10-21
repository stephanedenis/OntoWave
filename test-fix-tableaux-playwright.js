// Test Playwright pour validation fix tableaux OntoWave
const { test, expect } = require('@playwright/test');

test('OntoWave - Fix tableaux validé', async ({ page }) => {
  // Configuration pour capturer les erreurs console
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Navigation vers la page de test
  await page.goto('file://' + require('path').resolve('./test-simple.html'));
  
  // Attendre le chargement OntoWave
  await page.waitForTimeout(2000);

  // Vérifier absence d'erreurs JS critiques
  const hasJSErrors = consoleErrors.some(error => 
    error.includes('is not iterable') || 
    error.includes('Cannot read property') ||
    error.includes('OntoWave is not defined')
  );
  
  if (hasJSErrors) {
    console.log('❌ Erreurs JS détectées:', consoleErrors);
  }
  expect(hasJSErrors).toBeFalsy();

  // Vérifier que OntoWave existe
  const ontoWaveExists = await page.evaluate(() => {
    return typeof window.OntoWave !== 'undefined';
  });
  expect(ontoWaveExists).toBeTruthy();

  // Test spécifique tableaux : créer une page avec tableau
  const tableauMarkdown = `
# Test Tableaux OntoWave

| Colonne 1 | Colonne 2 | Colonne 3 |
|-----------|-----------|-----------|
| Ligne 1   | Data A    | Value X   |
| Ligne 2   | Data B    | Value Y   |
| Ligne 3   | Data C    | Value Z   |

Les tableaux doivent être correctement rendus avec les styles CSS.
  `;

  // Créer une configuration de test
  await page.evaluate((markdown) => {
    // Simuler le rendu d'un tableau
    const container = document.createElement('div');
    container.id = 'test-content';
    document.body.appendChild(container);
    
    // Si OntoWave est initialisé, utiliser son renderer
    if (window.OntoWave && window.OntoWave.md) {
      container.innerHTML = window.OntoWave.md.render(markdown);
    }
  }, tableauMarkdown);

  // Vérifier que les tableaux sont rendus
  const tableExists = await page.locator('table').count() > 0;
  expect(tableExists).toBeTruthy();

  // Vérifier les styles CSS des tableaux
  const tableStyles = await page.evaluate(() => {
    const styleElement = document.getElementById('ontowave-table-styles');
    return styleElement !== null;
  });
  expect(tableStyles).toBeTruthy();

  // Vérifier structure du tableau
  const tableHeaders = await page.locator('th').count();
  const tableRows = await page.locator('tr').count();
  
  expect(tableHeaders).toBeGreaterThan(0);
  expect(tableRows).toBeGreaterThan(1); // Header + data rows

  console.log('✅ Test fix tableaux OntoWave - RÉUSSI');
});