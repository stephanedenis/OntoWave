import { test, expect } from '@playwright/test';

test.describe('OntoWave Fix Tableaux - Test Final', () => {
  test('VALIDATION FINALE du fix tableaux avec attente complète', async ({ page }) => {
    // Naviguer vers OntoWave
    await page.goto('http://localhost:8082/');
    
    // Attendre le redirect automatique vers index.md
    await page.waitForTimeout(1000);
    
    // Attendre que OntoWave soit complètement initialisé
    await page.waitForFunction(() => {
      return typeof window.OntoWave !== 'undefined' && 
             window.OntoWave.md && 
             typeof window.OntoWave.md.render === 'function';
    }, { timeout: 10000 });

    console.log('✅ OntoWave initialisé et prêt!');

    // Test du rendu des tableaux dans le contenu existant
    const tableExists = await page.locator('table').count();
    console.log('Tableaux trouvés dans la page:', tableExists);
    
    if (tableExists > 0) {
      // Vérifier injection des styles CSS
      const stylesInjected = await page.evaluate(() => {
        const styleElement = document.getElementById('ontowave-table-styles');
        return styleElement !== null;
      });
      
      console.log('Styles CSS tableaux injectés:', stylesInjected);
      expect(stylesInjected).toBeTruthy();
      
      // Vérifier que les styles sont appliqués
      const tableStyled = await page.evaluate(() => {
        const table = document.querySelector('table');
        if (!table) return false;
        
        const style = window.getComputedStyle(table);
        return style.borderCollapse === 'collapse';
      });
      
      console.log('Styles appliqués aux tableaux:', tableStyled);
      expect(tableStyled).toBeTruthy();
      
      console.log('\n🎉 SUCCÈS TOTAL: Fix tableaux OntoWave VALIDÉ!');
      console.log('   ✅ OntoWave s\'initialise');
      console.log('   ✅ Tableaux présents sur la page');
      console.log('   ✅ Styles CSS injectés et appliqués');
      console.log('   ✅ Le fix "tables: true" fonctionne!');
      
    } else {
      console.log('ℹ️  Aucun tableau sur la page par défaut');
      
      // Test manuel de rendu
      const manualTest = await page.evaluate(() => {
        const testMarkdown = '| A | B |\n|---|---|\n| 1 | 2 |';
        const container = document.createElement('div');
        container.innerHTML = window.OntoWave.md.render(testMarkdown);
        document.body.appendChild(container);
        
        return {
          hasTable: container.querySelector('table') !== null,
          html: container.innerHTML
        };
      });
      
      console.log('Test manuel tableaux:', manualTest.hasTable);
      expect(manualTest.hasTable).toBeTruthy();
      
      console.log('\n🎉 SUCCÈS: Fix tableaux OntoWave validé par test manuel!');
    }
    
    expect(true).toBeTruthy();
  });
});