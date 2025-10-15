import { test, expect } from '@playwright/test';

test.describe('OntoWave Fix Tableaux - HTTP Server', () => {
  test('validation FINALE fix tableaux OntoWave', async ({ page }) => {
    // Capturer les erreurs console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Naviguer vers OntoWave via serveur HTTP (évite CORS)
    await page.goto('http://localhost:8082/');
    
    // Attendre chargement complet OntoWave
    await page.waitForTimeout(4000);

    // Vérifier absence d'erreurs critiques JS
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('is not iterable') || 
      error.includes('OntoWave is not defined') ||
      error.includes('TypeError') ||
      error.includes('Cannot read property')
    );
    
    console.log('Total erreurs console:', consoleErrors.length);
    if (criticalErrors.length > 0) {
      console.log('❌ Erreurs critiques:', criticalErrors);
    }
    expect(criticalErrors.length).toBe(0);

    // Vérifier que OntoWave est chargé et fonctionnel
    const ontoWaveStatus = await page.evaluate(() => {
      return {
        exists: typeof window.OntoWave !== 'undefined',
        hasMd: window.OntoWave && typeof window.OntoWave.md !== 'undefined',
        hasRenderer: window.OntoWave && window.OntoWave.md && typeof window.OntoWave.md.render === 'function'
      };
    });
    
    console.log('✅ Status OntoWave:', ontoWaveStatus);
    expect(ontoWaveStatus.exists).toBeTruthy();
    expect(ontoWaveStatus.hasRenderer).toBeTruthy();

    // TEST PRINCIPAL: Rendu tableaux avec le fix
    const tableMarkdown = `
# 🔧 Test Fix Tableaux OntoWave

| Fonctionnalité | Status | Validation |
|:---------------|:------:|:-----------|
| Tables CSS     | ✅     | Styles appliqués |
| Responsive     | ✅     | Mobile OK |
| Headers        | ✅     | Gras automatique |
| Borders        | ✅     | 1px solid #ddd |
| Zebra rows     | ✅     | Alternance couleurs |

Le fix **tables: true** est actif et fonctionne parfaitement !
    `;

    // Injecter et tester le rendu
    const renderSuccess = await page.evaluate((markdown) => {
      try {
        if (!window.OntoWave?.md?.render) {
          return { success: false, error: 'Renderer non disponible' };
        }
        
        const container = document.createElement('div');
        container.id = 'test-fix-tableaux';
        container.innerHTML = window.OntoWave.md.render(markdown);
        document.body.appendChild(container);
        
        return { 
          success: true, 
          hasTable: container.querySelector('table') !== null,
          tableCount: container.querySelectorAll('table').length
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, tableMarkdown);

    console.log('📊 Résultat rendu:', renderSuccess);
    expect(renderSuccess.success).toBeTruthy();
    expect(renderSuccess.hasTable).toBeTruthy();

    // Vérifier injection styles CSS tableaux
    const stylesStatus = await page.evaluate(() => {
      const styleElement = document.getElementById('ontowave-table-styles');
      const hasStyles = styleElement !== null;
      
      if (hasStyles) {
        const content = styleElement.textContent;
        return {
          injected: true,
          hasTableRules: content.includes('table {'),
          hasBorderCollapse: content.includes('border-collapse: collapse'),
          hasResponsive: content.includes('@media (max-width: 768px)')
        };
      }
      
      return { injected: false };
    });

    console.log('🎨 Status styles CSS:', stylesStatus);
    expect(stylesStatus.injected).toBeTruthy();
    expect(stylesStatus.hasTableRules).toBeTruthy();
    expect(stylesStatus.hasBorderCollapse).toBeTruthy();

    // Vérification finale: styles effectivement appliqués
    const stylesApplied = await page.evaluate(() => {
      const table = document.querySelector('#test-fix-tableaux table');
      if (!table) return false;
      
      const computedStyle = window.getComputedStyle(table);
      return {
        borderCollapse: computedStyle.borderCollapse === 'collapse',
        hasWidth: computedStyle.width !== 'auto',
        hasMargin: computedStyle.marginTop !== '0px'
      };
    });

    console.log('✨ Styles appliqués:', stylesApplied);
    expect(stylesApplied.borderCollapse).toBeTruthy();

    // Compter éléments du tableau
    const tableStats = await page.evaluate(() => {
      const table = document.querySelector('#test-fix-tableaux table');
      if (!table) return null;
      
      return {
        headers: table.querySelectorAll('th').length,
        rows: table.querySelectorAll('tr').length,
        cells: table.querySelectorAll('td').length
      };
    });

    console.log('📈 Statistiques tableau:', tableStats);
    expect(tableStats.headers).toBeGreaterThan(0);
    expect(tableStats.rows).toBeGreaterThan(1);
    expect(tableStats.cells).toBeGreaterThan(0);

    console.log('\n🎉 SUCCÈS TOTAL: Fix tableaux OntoWave validé et fonctionnel!');
    console.log('   ✅ OntoWave s\'initialise correctement');
    console.log('   ✅ Renderer markdown fonctionne');  
    console.log('   ✅ Tables CSS injectées et appliquées');
    console.log('   ✅ Tableaux rendus avec styles complets');
    console.log('\n🔧 Le fix "tables: true" est opérationnel!');
  });
});