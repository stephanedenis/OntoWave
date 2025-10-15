import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('OntoWave Fix Tableaux', () => {
  test('validation fix tableaux avec styles CSS', async ({ page }) => {
    // Capturer les erreurs console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Naviguer vers test-simple.html
    await page.goto('file://' + path.resolve('./test-simple.html'));
    
    // Attendre initialisation
    await page.waitForTimeout(3000);

    // Vérifier absence d'erreurs critiques
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('is not iterable') || 
      error.includes('OntoWave is not defined')
    );
    
    console.log('Erreurs console:', consoleErrors);
    expect(criticalErrors.length).toBe(0);

    // Vérifier OntoWave
    const ontoWaveStatus = await page.evaluate(() => ({
      exists: typeof window.OntoWave !== 'undefined',
      hasRenderer: window.OntoWave && typeof window.OntoWave.md !== 'undefined'
    }));
    
    console.log('Status OntoWave:', ontoWaveStatus);
    expect(ontoWaveStatus.exists).toBeTruthy();

    // Test rendu tableau
    const tableauTest = `
| Feature | Status | Notes |
|---------|--------|-------|
| Tables  | ✅ Fixed | CSS styles applied |
| Headers | ✅ Working | Bold styling |
| Borders | ✅ Active | 1px solid borders |
    `;

    await page.evaluate((markdown) => {
      if (window.OntoWave && window.OntoWave.md) {
        const container = document.createElement('div');
        container.id = 'test-table-container';
        container.innerHTML = window.OntoWave.md.render(markdown);
        document.body.appendChild(container);
      }
    }, tableauTest);

    // Vérifier présence tableaux
    const tableCount = await page.locator('table').count();
    expect(tableCount).toBeGreaterThan(0);

    // Vérifier styles CSS injectés
    const stylesInjected = await page.evaluate(() => {
      return document.getElementById('ontowave-table-styles') !== null;
    });
    expect(stylesInjected).toBeTruthy();

    console.log('✅ Fix tableaux OntoWave validé avec succès!');
  });
});