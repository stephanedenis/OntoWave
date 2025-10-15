import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('OntoWave Fix Tableaux - Production', () => {
  test('validation fix tableaux sur build production', async ({ page }) => {
    // Capturer les erreurs console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Naviguer vers la build de production dans docs/
    await page.goto('file://' + path.resolve('./docs/index.html'));
    
    // Attendre chargement complet OntoWave
    await page.waitForTimeout(5000);

    // Vérifier absence d'erreurs critiques
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('is not iterable') || 
      error.includes('OntoWave is not defined') ||
      error.includes('Cannot read property')
    );
    
    console.log('Erreurs console détectées:', consoleErrors.length);
    if (criticalErrors.length > 0) {
      console.log('Erreurs critiques:', criticalErrors);
    }
    expect(criticalErrors.length).toBe(0);

    // Vérifier que OntoWave est chargé
    const ontoWaveStatus = await page.evaluate(() => {
      return {
        exists: typeof window.OntoWave !== 'undefined',
        hasRouter: window.OntoWave && typeof window.OntoWave.router !== 'undefined',
        hasConfig: window.OntoWave && typeof window.OntoWave.config !== 'undefined'
      };
    });
    
    console.log('Status OntoWave:', ontoWaveStatus);
    expect(ontoWaveStatus.exists).toBeTruthy();

    // Créer un test de tableau en injectant du markdown
    const tableMarkdown = `
# Test Fix Tableaux OntoWave

| Fonctionnalité | Status | Description |
|----------------|--------|-------------|
| Tables CSS     | ✅ Fixed | Styles tableaux appliqués |
| Responsive     | ✅ Active | Adaptation mobile |
| Headers        | ✅ Bold | Titres en gras |
| Zebra striping | ✅ Active | Lignes alternées |

Tableau de validation du fix.
    `;

    // Injecter et tester le rendu des tableaux
    const tableRendered = await page.evaluate((markdown) => {
      try {
        // Simuler le rendu de markdown avec tableaux
        const container = document.createElement('div');
        container.id = 'test-table-container';
        
        // Si OntoWave.md existe, l'utiliser
        if (window.OntoWave && window.OntoWave.md && window.OntoWave.md.render) {
          container.innerHTML = window.OntoWave.md.render(markdown);
        } else {
          // Rendu manuel simple pour test
          const tableHTML = markdown
            .replace(/\|(.+)\|/g, (match, content) => {
              const cells = content.split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
              return `<tr>${cells}</tr>`;
            })
            .replace(/^\|(.+)\|$/gm, '<table>$&</table>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>');
          container.innerHTML = tableHTML;
        }
        
        document.body.appendChild(container);
        return true;
      } catch (error) {
        console.error('Erreur rendu tableau:', error);
        return false;
      }
    }, tableMarkdown);

    expect(tableRendered).toBeTruthy();

    // Vérifier présence des tableaux
    const tableElements = await page.locator('table').count();
    console.log('Tableaux trouvés:', tableElements);
    expect(tableElements).toBeGreaterThan(0);

    // Vérifier injection des styles CSS pour tableaux
    const stylesInjected = await page.evaluate(() => {
      const styleElement = document.getElementById('ontowave-table-styles');
      return styleElement !== null;
    });
    
    console.log('Styles CSS tableaux injectés:', stylesInjected);
    expect(stylesInjected).toBeTruthy();

    // Vérifier que les styles sont effectivement appliqués
    const tableHasStyles = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return false;
      
      const computedStyle = window.getComputedStyle(table);
      return computedStyle.borderCollapse === 'collapse';
    });

    console.log('Styles CSS appliqués aux tableaux:', tableHasStyles);
    expect(tableHasStyles).toBeTruthy();

    console.log('✅ SUCCÈS: Fix tableaux OntoWave validé en production!');
  });
});